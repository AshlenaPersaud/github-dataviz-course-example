const API_URL = 'https://opentdb.com/api.php?amount=10&category=20&difficulty=medium&type=multiple';

const outputContainer = document.getElementById('api-output');

async function fetchTriviaQuestions() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Open Trivia DB uses response_code 0 for success
    if (data.response_code !== 0 || !data.results) {
      throw new Error(`API returned response code: ${data.response_code}`);
    }

    renderQuestions(data.results);

  } catch (error) {
    outputContainer.innerHTML = `<p class="error">Failed to load trivia: ${error.message}</p>`;
    console.error('Trivia API Error:', error);
  }
}

function renderQuestions(questions) {
  outputContainer.innerHTML = '';

  questions.forEach((item, index) => {
    const card = document.createElement('section');
    card.className = 'question-card';

    // Combine and shuffle correct + incorrect answers
    const allAnswers = [...item.incorrect_answers, item.correct_answer];
    allAnswers.sort(() => Math.random() - 0.5);

    const answerItems = allAnswers
      .map(answer => `<li>${answer}</li>`)
      .join('');

    card.innerHTML = `
      <h3>${index + 1}. ${item.question}</h3>
      <ul>${answerItems}</ul>
      <details>
        <summary>Show Answer</summary>
        <p><strong>${item.correct_answer}</strong></p>
      </details>
    `;

    outputContainer.appendChild(card);
  });
}

// Automatically loads the API when HW1112.html opens
fetchTriviaQuestions();