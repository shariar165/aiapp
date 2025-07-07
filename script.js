// script.js - Separated JavaScript code
// This script handles the functionality of the educational website including theme toggle, search functionality, and navigation.
// It also includes event listeners for user interactions such as clicking on subject cards and question cards.
// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
let darkMode = false;

themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  themeToggle.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Search Functionality
const searchBtn = document.getElementById('searchBtn');
const questionInput = document.getElementById('questionInput');
const answerCard = document.getElementById('answerCard');
const answerContent = document.getElementById('answerContent');

function showAnswer(question) {
  // Simulate API response
  const answer = {
    question: question,
    response: 'বাংলাদেশের জাতীয় ফুল শাপলা। এটি একটি জলজ উদ্ভিদ যা পুকুর, বিল এবং হাওর অঞ্চলে জন্মায়। শাপলা ফুল সাদা এবং গোলাপি রঙের হয়। এটি বাংলাদেশের সাংস্কৃতিক ঐতিহ্যের একটি গুরুত্বপূর্ণ অংশ।',
    englishResponse: 'The national flower of Bangladesh is Shapla (Water Lily). It grows in ponds, beels, and haor areas. Shapla flowers are white and pink in color and represent the cultural heritage of Bangladesh.',
    source: 'বাংলাদেশ ও বিশ্বপরিচয়, অষ্টম শ্রেণি (এনসিটিবি)',
    tags: ['বাংলাদেশ', 'জাতীয় প্রতীক', 'শাপলা ফুল']
  };

  // Update answer card content
  answerContent.innerHTML = `
    <div class="answer-section">
      <h4>প্রশ্ন:</h4>
      <p class="question-text">${answer.question}</p>
    </div>
    
    <div class="answer-section">
      <h4>উত্তর:</h4>
      <p class="answer-text">${answer.response}</p>
    </div>
    
    <div class="answer-section">
      <h4>English Translation:</h4>
      <p class="answer-text">${answer.englishResponse}</p>
    </div>
    
    <div class="tags">
      ${answer.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
    
    <div class="source">
      <i class="fas fa-book-open"></i>
      সূত্র: ${answer.source}
    </div>
  `;

  // Show the answer card
  answerCard.style.display = 'block';
}

searchBtn.addEventListener('click', () => {
  if (questionInput.value.trim()) {
    searchBtn.innerHTML = '<div class="loading-spinner"></div>';
    setTimeout(() => {
      showAnswer(questionInput.value);
      searchBtn.innerHTML = '<i class="fas fa-search"></i> খুঁজুন';
    }, 1500);
  }
});

questionInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && questionInput.value.trim()) {
    searchBtn.innerHTML = '<div class="loading-spinner"></div>';
    setTimeout(() => {
      showAnswer(questionInput.value);
      searchBtn.innerHTML = '<i class="fas fa-search"></i> খুঁজুন';
    }, 1500);
  }
});

// Subject card click handler
document.querySelectorAll('.subject-card').forEach(card => {
  card.addEventListener('click', () => {
    const link = card.getAttribute('data-link');
    if (link) {
      window.location.href = link;
    }
  });
});

// Question card click handler
document.querySelectorAll('.question-card').forEach(card => {
  card.addEventListener('click', () => {
    const questionText = card.querySelector('.question-text').textContent;
    questionInput.value = questionText;
    showAnswer(questionText);
  });
});

// Hamburger menu toggle
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');
hamburgerBtn.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// Optional: Hide menu when clicking outside
document.addEventListener('click', function(e) {
  if (!hamburgerBtn.contains(e.target) && !navLinks.contains(e.target)) {
    navLinks.classList.remove('show');
  }
});
