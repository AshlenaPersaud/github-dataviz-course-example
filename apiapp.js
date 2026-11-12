// #region Configuration & DOM References
// Open Trivia DB endpoint: 10 medium-difficulty Mythology multiple-choice questions
const API_URL = 'https://opentdb.com';

// Target container in HW1112.html where question cards will appear
const outputContainer = document.getElementById('api-output');
// #endregion

// #region API Fetch Logic
/**
 * Fetches trivia questions from Open Trivia DB and passes them to the card renderer.
 */
async function fetchTriviaQuestions() {
  try {
    // Send GET request to the API
    const response = await fetch(API_URL);

    // Check if the HTTP status is outside the 200-299 range
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON payload from the response
    const data = await response.json();

    // Open Trivia DB uses response_code 0 to indicate a successful query
    if (data.response_code !== 0 || !data.results) {
      throw new Error(`API returned response code: ${data.response_code}`);
    }

    // Render the array of 10 question objects as cards
    renderQuestions(data.results);

  } catch (error) {
    // Display a styled error box on the page and log details to console
    outputContainer.innerHTML = `<p class="error">Failed to load trivia: ${error.message}</p>`;
    console.error('Trivia API Error:', error);
  }
}
// #endregion

// #region DOM Rendering
/**
 * Builds and inserts styled HTML cards for each trivia question.
 * @param {Array} questions - Array of question objects returned by the API
 */
function renderQuestions(questions) {
  // Clear the "Loading trivia questions..." placeholder text
  outputContainer.innerHTML = '';

  // Loop through each question in the results array
  questions.forEach((item, index) => {
    // Create a semantic <section> card wrapper
    const card = document.createElement('section');
    card.className = 'question-card';

    // Combine incorrect and correct answers into a single array, then shuffle
    const allAnswers = [...item.incorrect_answers, item.correct_answer];
    allAnswers.sort(() => Math.random() - 0.5);

    // Convert each answer string into an HTML <li> element
    const answerItems = allAnswers
      .map(answer => `<li>${answer}</li>`)
      .join('');

    // Populate the card with a badge, question text, 2-column answer grid, and reveal drawer
    card.innerHTML = `
      <span class="card-badge">Question ${index + 1} of ${questions.length}</span>
      <h3>${item.question}</h3>
      <ul class="answer-list">${answerItems}</ul>
      <details>
        <summary>Show Answer</summary>
        <p><strong>${item.correct_answer}</strong></p>
      </details>
    `;

    // Append the finished card to the main output container
    outputContainer.appendChild(card);
  });
}
// #endregion

// #region Initialization
// Automatically trigger the API request as soon as HW1112.html loads
fetchTriviaQuestions();
// #endregion
