// #region Configuration & DOM References
const API_URL = 'https://opentdb.com/api.php?amount=10&category=20&difficulty=medium&type=multiple';

const outputContainer = document.getElementById('api-output');
const rightCountEl = document.getElementById('right-count');
const wrongCountEl = document.getElementById('wrong-count');
const answeredCountEl = document.getElementById('answered-count');
const reloadBtn = document.getElementById('reload-btn');

let rightScore = 0;
let wrongScore = 0;
let answeredCount = 0;

// Built-in backup questions (from your Open Trivia DB dataset)
// Automatically used if the live API is blocked, rate-limited, or offline.
const FALLBACK_QUESTIONS = [
  {
    question: "The Hippogriff, not to be confused with the Griffon, is a magical creature with the front half of an eagle, and the back half of what?",
    correct_answer: "A Horse",
    incorrect_answers: ["A Dragon", "A Tiger", "A Lion"]
  },
  {
    question: "Which of these Roman gods doesn&#039;t have a counterpart in Greek mythology?",
    correct_answer: "Janus",
    incorrect_answers: ["Vulcan", "Juno", "Mars"]
  },
  {
    question: "According to Japanese folklore, what is the favorite food of the Kappa.",
    correct_answer: "Cucumbers",
    incorrect_answers: ["Kabocha", "Nasu", "Soba"]
  },
  {
    question: "What is the name of the first human being in Norse mythology?",
    correct_answer: "Ask",
    incorrect_answers: ["Asmund", "Ake", "Asger"]
  },
  {
    question: "Hel was the daughter of which Norse Mythological figure?",
    correct_answer: "Loki",
    incorrect_answers: ["Thor", "Odin", "Balder"]
  },
  {
    question: "Hera is god of...",
    correct_answer: "Marriage",
    incorrect_answers: ["Agriculture", "Sea", "War"]
  },
  {
    question: "In Greek Mythology, who killed Achilles?",
    correct_answer: "Paris",
    incorrect_answers: ["Hector", "Helen", "Pericles"]
  },
  {
    question: "Who is the god of war in Polynesian mythology?",
    correct_answer: "&#039;Oro",
    incorrect_answers: ["Hina", "Kohara", "M\u0101ui"]
  },
  {
    question: "The Maori hold that which island nation was founded by Kupe, who discovered it under a long white cloud?",
    correct_answer: "New Zealand",
    incorrect_answers: ["Vanuatu", "Fiji", "Hawaii"]
  },
  {
    question: "What animal did Queen Pasipahe sleep with before she gave birth to the Minotaur in Greek Mythology?",
    correct_answer: "Bull",
    incorrect_answers: ["Pig", "Ox", "Horse"]
  }
];
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
// #endregion

// #region API Fetch Logic
/**
 * Attempts to fetch 10 live questions from Open Trivia DB.
 * Falls back smoothly to the built-in Mythology set if the network request fails.
 */
async function fetchTriviaQuestions() {
  resetScoreboard();
  outputContainer.innerHTML = '<div class="card"><p>Loading trivia questions...</p></div>';
  reloadBtn.disabled = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.response_code !== 0 || !data.results) {
      throw new Error(`API returned response code: ${data.response_code}`);
    }

    renderQuestions(data.results);

  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Live API unavailable, using built-in Mythology questions:', error.message);

    // Shuffle a copy of the fallback questions so reloading still feels fresh
    const shuffledFallback = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5);
    renderQuestions(shuffledFallback);
  } finally {
    reloadBtn.disabled = false;
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

    // Shuffle answer choices
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
reloadBtn.addEventListener('click', fetchTriviaQuestions);

// Automatically load questions on page open
fetchTriviaQuestions();
// #endregion
