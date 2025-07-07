from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine, select
import requests
from datetime import datetime
from typing import Optional

app = FastAPI()

# CORS to allow frontend
origins = ["http://localhost", "http://127.0.0.1"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite database setup
engine = create_engine("sqlite:///qa.db")

# Create table for questions & answers
class QA(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    question: str
    subject: str
    guidebook_style: str
    answer: str
    english_answer: Optional[str] = None  # Keep Optional for migration safety
    tags: Optional[str] = None            # Store as comma-separated string
    source: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Create tables
@app.on_event("startup")
def on_start():
    SQLModel.metadata.create_all(engine)

# Input schema from frontend
class QuestionRequest(BaseModel):
    question: str
    subject: str
    guidebook_style: str

# Prompt builder - Enhanced for Bangla/English responses
def build_prompt(question: str, subject: str, style: str):
    return f"""You are a Bangladeshi guidebook tutor AI. 
Answer the following {subject} question in the style of "{style}" guidebook.
Provide:
1. A detailed answer in Bangla
2. An English translation of the answer
3. 2-3 relevant tags
4. A source reference

Question: {question}

Format your response as:
<answer>
[Detailed Bangla answer]
</answer>

<english>
[English translation]
</english>

<tags>
[comma, separated, tags]
</tags>

<source>
[Source reference]
</source>"""

@app.post("/generate")
def generate_answer(req: QuestionRequest):
    prompt = build_prompt(req.question, req.subject, req.guidebook_style)

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "deepseek-r1:1.5b",
                "prompt": prompt,
                "stream": False
            }
        )
        response.raise_for_status()
        result = response.json()
        full_response = result["response"].strip()
        
        # Parse the response
        answer = extract_content(full_response, "answer")
        english_answer = extract_content(full_response, "english")
        tags = extract_content(full_response, "tags")
        source = extract_content(full_response, "source")

        # Save to database
        with Session(engine) as session:
            entry = QA(
                question=req.question,
                subject=req.subject,
                guidebook_style=req.guidebook_style,
                answer=answer,
                english_answer=english_answer,
                tags=",".join([t.strip() for t in tags.split(",")][:3]) if tags else "",
                source=source
            )
            session.add(entry)
            session.commit()

        return {
            "answer": answer,
            "english_answer": english_answer,
            "tags": [t.strip() for t in tags.split(",")][:3] if tags else [],
            "source": source
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

# Helper to extract content from XML-like tags
def extract_content(text: str, tag: str) -> str:
    start_tag = f"<{tag}>"
    end_tag = f"</{tag}>"
    start_idx = text.find(start_tag)
    
    if start_idx == -1:
        return ""
    
    start_idx += len(start_tag)
    end_idx = text.find(end_tag, start_idx)
    
    if end_idx == -1:
        return text[start_idx:].strip()
    
    return text[start_idx:end_idx].strip()

# View recent questions
@app.get("/history")
def get_history(limit: int = 10):
    with Session(engine) as session:
        results = session.exec(select(QA).order_by(QA.created_at.desc()).limit(limit)).all()
        return results

