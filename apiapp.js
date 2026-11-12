// #region Configuration & DOM References
const API_URL = 'https://opentdb.com';

const outputContainer = document.getElementById('api-output');
const rightCountEl = document.getElementById('right-count');
const wrongCountEl = document.getElementById('wrong-count');
const answeredCountEl = document.getElementById('answered-count');
const reloadBtn = document.getElementById('reload-btn');

// Score tracking state
let rightScore = 0;
let wrongScore = 0;
let answeredCount = 0;
// #endregion

// #region Helper Functions
/**
 * Decodes HTML entities (e.g., &quot;, &#039;) returned by Open Trivia DB.
 * @param {string} html - Raw string from API
 * @returns {string} Clean readable text
 */
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Resets score counters and updates the scoreboard UI.
 */
function resetScoreboard() {
  rightScore = 0;
  wrongScore = 0;
  answeredCount = 0;
  updateScoreboard();
}

/**
 * Updates the Right, Wrong, and Answered numbers on screen.
 */
function updateScoreboard() {
  rightCountEl.textContent = rightScore;
  wrongCountEl.textContent = wrongScore;
  answeredCountEl.textContent = answeredCount;
}
// #endregion

// #region API Fetch Logic
/**
 * Fetches 10 trivia questions from Open Trivia DB and renders them as interactive cards.
 */
async function fetchTriviaQuestions() {
  resetScoreboard();
  outputContainer.innerHTML = '<div class="card"><p>Loading trivia questions...</p></div>';
  reloadBtn.disabled = true;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.response_code !== 0 || !data.results) {
      throw new Error(`API returned response code: ${data.response_code}`);
    }

    renderQuestions(data.results);

  } catch (error) {
    outputContainer.innerHTML = `<p class="error">Failed to load trivia: ${error.message}</p>`;
    console.error('Trivia API Error:', error);
  } finally {
    reloadBtn.disabled = false;
  }
}
// #endregion

// #region Interactive Card Rendering
/**
 * Builds interactive question cards with clickable answer buttons.
 * @param {Array} questions - Array of question objects from Open Trivia DB
 */
function renderQuestions(questions) {
  outputContainer.innerHTML = '';

  questions.forEach((item, index) => {
    // Create the card container using both .card and .question-card
    const card = document.createElement('section');
    card.className = 'card question-card';

    // Decode question and answers cleanly
    const questionText = decodeHTML(item.question);
    const correctText = decodeHTML(item.correct_answer);
    const allAnswers = [...item.incorrect_answers.map(decodeHTML), correctText];

    // Shuffle answer order
    allAnswers.sort(() => Math.random() - 0.5);

    // Card header badge and question title
    card.innerHTML = `
      <span class="card-badge">Question ${index + 1} of ${questions.length}</span>
      <h3>${questionText}</h3>
      <div class="answer-grid"></div>
      <p class="feedback-msg" aria-live="polite"></p>
    `;

    const answerGrid = card.querySelector('.answer-grid');
    const feedbackMsg = card.querySelector('.feedback-msg');

    // Create a clickable button for each answer choice
    allAnswers.forEach(answerText => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = answerText;

      btn.addEventListener('click', () => {
        // Prevent answering the same card twice
        if (card.dataset.answered === 'true') return;
        card.dataset.answered = 'true';
        answeredCount++;

        const isCorrect = answerText === correctText;
        const allButtons = answerGrid.querySelectorAll('.answer-btn');

        // Disable all buttons on this card and reveal the correct one
        allButtons.forEach(b => {
          b.disabled = true;
          if (b.textContent === correctText) {
            b.classList.add('is-correct');
          }
        });

        if (isCorrect) {
          rightScore++;
          card.classList.add('card-right');
          feedbackMsg.textContent = 'Correct!';
          feedbackMsg.className = 'feedback-msg text-right';
        } else {
          wrongScore++;
          btn.classList.add('is-wrong');
          card.classList.add('card-wrong');
          feedbackMsg.textContent = `Wrong! Correct answer: ${correctText}`;
          feedbackMsg.className = 'feedback-msg text-wrong';
        }

        updateScoreboard();
      });

      answerGrid.appendChild(btn);
    });

    outputContainer.appendChild(card);
  });
}
// #endregion

// #region Event Listeners & Initialization
reloadBtn.addEventListener('click', fetchTriviaQuestions);

// Automatically load questions when HW1112.html opens
fetchTriviaQuestions();
// #endregion
