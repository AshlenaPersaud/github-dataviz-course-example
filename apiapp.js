// #region Configuration & DOM References
const API_URL = 'https://opentdb.com';
const CACHE_KEY = 'mythology_trivia_cache_v1';

const outputContainer = document.getElementById('api-output');
const rightCountEl = document.getElementById('right-count');
const wrongCountEl = document.getElementById('wrong-count');
const answeredCountEl = document.getElementById('answered-count');
const reloadBtn = document.getElementById('reload-btn');

let rightScore = 0;
let wrongScore = 0;
let answeredCount = 0;
// #endregion

// #region Helper Functions
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function resetScoreboard() {
  rightScore = 0;
  wrongScore = 0;
  answeredCount = 0;
  updateScoreboard();
}

function updateScoreboard() {
  rightCountEl.textContent = rightScore;
  wrongCountEl.textContent = wrongScore;
  answeredCountEl.textContent = answeredCount;
}

/**
 * Prevents hitting Open Trivia DB's 5-second rate limit (HTTP 429)
 * when clicking "Load New Questions".
 */
function startButtonCooldown(seconds = 5) {
  let remaining = seconds;
  reloadBtn.disabled = true;
  reloadBtn.textContent = `Wait ${remaining}s...`;

  const timer = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      reloadBtn.textContent = `Wait ${remaining}s...`;
    } else {
      clearInterval(timer);
      reloadBtn.disabled = false;
      reloadBtn.textContent = 'Load New Questions';
    }
  }, 1000);
}
// #endregion

// #region API Fetch Logic
/**
 * Loads trivia questions from sessionStorage cache for instant display,
 * or fetches fresh questions from Open Trivia DB with a 10-second timeout.
 * @param {boolean} forceRefresh - Skip cache and fetch brand-new questions
 */
async function fetchTriviaQuestions(forceRefresh = false) {
  resetScoreboard();

  // 1. Load instantly from session cache if available and not forcing new questions
  if (!forceRefresh) {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsedQuestions = JSON.parse(cached);
        renderQuestions(parsedQuestions);
        return;
      } catch (e) {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
  }

  outputContainer.innerHTML = '<div class="card"><p>Fetching 10 Mythology questions...</p></div>';
  reloadBtn.disabled = true;

  // 2. Set a 10-second timeout so the page never hangs indefinitely
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error('Too many requests! Open Trivia DB requires a 5-second pause between fetches.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.response_code !== 0 || !data.results) {
      throw new Error(`API returned response code: ${data.response_code}`);
    }

    // Save to sessionStorage so subsequent page visits load instantaneously
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data.results));

    renderQuestions(data.results);
    startButtonCooldown(5);

  } catch (error) {
    clearTimeout(timeoutId);
    const message = error.name === 'AbortError'
      ? 'The trivia server took too long to respond (timed out after 10s). Click "Load New Questions" to try again.'
      : error.message;

    outputContainer.innerHTML = `<div class="card"><p class="error">${message}</p></div>`;
    reloadBtn.disabled = false;
    reloadBtn.textContent = 'Load New Questions';
    console.error('Trivia API Error:', error);
  }
}
// #endregion

// #region Interactive Card Rendering
function renderQuestions(questions) {
  outputContainer.innerHTML = '';

  questions.forEach((item, index) => {
    const card = document.createElement('section');
    card.className = 'card question-card';

    const questionText = decodeHTML(item.question);
    const correctText = decodeHTML(item.correct_answer);
    const allAnswers = [...item.incorrect_answers.map(decodeHTML), correctText];

    allAnswers.sort(() => Math.random() - 0.5);

    card.innerHTML = `
      <span class="card-badge">Question ${index + 1} of ${questions.length}</span>
      <h3>${questionText}</h3>
      <div class="answer-grid"></div>
      <p class="feedback-msg" aria-live="polite"></p>
    `;

    const answerGrid = card.querySelector('.answer-grid');
    const feedbackMsg = card.querySelector('.feedback-msg');

    allAnswers.forEach(answerText => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = answerText;

      btn.addEventListener('click', () => {
        if (card.dataset.answered === 'true') return;
        card.dataset.answered = 'true';
        answeredCount++;

        const isCorrect = answerText === correctText;
        const allButtons = answerGrid.querySelectorAll('.answer-btn');

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
reloadBtn.addEventListener('click', () => fetchTriviaQuestions(true));

// Load cached questions immediately if available, or fetch from API
fetchTriviaQuestions(false);
// #endregion
