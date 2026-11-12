// Flashcard Study App - Updated Script

const form = document.getElementById('flashcard-form');
const questionInput = document.getElementById('question');
const answerInput = document.getElementById('answer');
const grid = document.getElementById('flashcards-grid');
const emptyMessage = document.getElementById('empty-message');
const cardCount = document.getElementById('card-count');
const searchInput = document.getElementById('search-input');
const startStudyBtn = document.getElementById('start-study-btn');

// Study Mode elements
const studyModeOverlay = document.getElementById('study-mode-overlay');
const exitStudyBtn = document.getElementById('exit-study-btn');
const studyFlashcard = document.getElementById('study-flashcard');
const studyQuestion = document.getElementById('study-question');
const studyAnswer = document.getElementById('study-answer');
const showAnswerBtn = document.getElementById('show-answer-btn');
const nextCardBtn = document.getElementById('next-card-btn');
const studyProgress = document.getElementById('study-progress');

let flashcards = [];

try {
    flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
} catch (error) {
    flashcards = [];
}

let currentStudyIndex = 0;

// Add Study Mode controls automatically.
// This means you do not need to change index.html.
const studyControls = document.querySelector('.study-controls');

const previousCardBtn = document.createElement('button');
previousCardBtn.id = 'previous-card-btn';
previousCardBtn.textContent = 'Previous';

const markKnownBtn = document.createElement('button');
markKnownBtn.id = 'mark-known-btn';
markKnownBtn.textContent = 'Mark Known';
markKnownBtn.style.background = '#27ae60';

const markDifficultBtn = document.createElement('button');
markDifficultBtn.id = 'mark-difficult-btn';
markDifficultBtn.textContent = 'Mark Difficult';
markDifficultBtn.style.background = '#e67e22';

if (studyControls) {
    studyControls.insertBefore(previousCardBtn, showAnswerBtn);
    studyControls.appendChild(markKnownBtn);
    studyControls.appendChild(markDifficultBtn);

    studyControls.style.flexWrap = 'wrap';
}

function saveFlashcards() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    updateUI();
}

function updateStudyButton() {
    if (startStudyBtn) {
        startStudyBtn.style.display =
            flashcards.length > 0 ? 'inline-block' : 'none';
    }
}

function createTextElement(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

function updateUI(filteredCards = flashcards) {
    grid.innerHTML = '';

    cardCount.textContent =
        `${filteredCards.length} Flashcard${filteredCards.length !== 1 ? 's' : ''}`;

    updateStudyButton();

    if (filteredCards.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    filteredCards.forEach((card) => {
        const index = flashcards.indexOf(card);

        const cardContainer = document.createElement('div');
        cardContainer.className = 'flashcard-container';

        const cardElement = document.createElement('div');
        cardElement.className = 'flashcard';

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const front = document.createElement('div');
        front.className = 'card-front';

        const back = document.createElement('div');
        back.className = 'card-back';

        front.appendChild(
            createTextElement('p', `Q: ${card.question}`)
        );

        back.appendChild(
            createTextElement('p', `A: ${card.answer}`)
        );

        cardInner.appendChild(front);
        cardInner.appendChild(back);
        cardElement.appendChild(cardInner);

        cardElement.addEventListener('click', () => {
            cardElement.classList.toggle('flipped');
        });

        cardContainer.appendChild(cardElement);

        if (card.status) {
            const status = createTextElement(
                'p',
                `Status: ${card.status}`,
                'card-status'
            );

            status.style.textAlign = 'center';
            status.style.marginBottom = '8px';
            status.style.fontWeight = 'bold';

            cardContainer.appendChild(status);
        }

        const deleteButton = createTextElement(
            'button',
            'Delete',
            'delete-btn'
        );

        deleteButton.addEventListener('click', () => {
            deleteCard(index);
        });

        cardContainer.appendChild(deleteButton);
        grid.appendChild(cardContainer);
    });
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) {
        return;
    }

    flashcards.push({
        question: question,
        answer: answer,
        status: ''
    });

    saveFlashcards();
    form.reset();
});

function deleteCard(index) {
    flashcards.splice(index, 1);

    if (currentStudyIndex >= flashcards.length) {
        currentStudyIndex = Math.max(0, flashcards.length - 1);
    }

    saveFlashcards();

    if (studyModeOverlay.style.display === 'flex') {
        if (flashcards.length === 0) {
            studyModeOverlay.style.display = 'none';
        } else {
            showStudyCard();
        }
    }
}

searchInput.addEventListener('input', (event) => {
    const term = event.target.value.toLowerCase();

    const filteredCards = flashcards.filter((card) =>
        card.question.toLowerCase().includes(term) ||
        card.answer.toLowerCase().includes(term)
    );

    updateUI(filteredCards);
});

// Start Study Mode
startStudyBtn.addEventListener('click', () => {
    if (flashcards.length === 0) return;

    currentStudyIndex = 0;
    studyModeOverlay.style.display = 'flex';
    showStudyCard();
});

// Exit Study Mode
exitStudyBtn.addEventListener('click', () => {
    studyModeOverlay.style.display = 'none';
});

// Display current study card
function showStudyCard() {
    if (flashcards.length === 0) {
        studyModeOverlay.style.display = 'none';
        return;
    }

    const card = flashcards[currentStudyIndex];

    studyFlashcard.classList.remove('flipped');

    studyQuestion.textContent = `Q: ${card.question}`;
    studyAnswer.textContent = `A: ${card.answer}`;

    studyProgress.textContent =
        `Card ${currentStudyIndex + 1} of ${flashcards.length}`;

    previousCardBtn.disabled = currentStudyIndex === 0;
    nextCardBtn.disabled = currentStudyIndex === flashcards.length - 1;

    if (card.status) {
        studyProgress.textContent += ` | ${card.status}`;
    }
}

// Show Answer
showAnswerBtn.addEventListener('click', () => {
    studyFlashcard.classList.add('flipped');
});

// Previous Card
previousCardBtn.addEventListener('click', () => {
    if (currentStudyIndex > 0) {
        currentStudyIndex--;
        showStudyCard();
    }
});

// Next Card
nextCardBtn.addEventListener('click', () => {
    if (currentStudyIndex < flashcards.length - 1) {
        currentStudyIndex++;
        showStudyCard();
    }
});

// Mark card as Known
markKnownBtn.addEventListener('click', () => {
    if (flashcards.length === 0) return;

    flashcards[currentStudyIndex].status = 'Known';
    saveFlashcards();
    showStudyCard();
});

// Mark card as Difficult
markDifficultBtn.addEventListener('click', () => {
    if (flashcards.length === 0) return;

    flashcards[currentStudyIndex].status = 'Difficult';
    saveFlashcards();
    showStudyCard();
});

// Flip card by clicking it
studyFlashcard.addEventListener('click', () => {
    studyFlashcard.classList.toggle('flipped');
});

// Initial app load
updateUI();
