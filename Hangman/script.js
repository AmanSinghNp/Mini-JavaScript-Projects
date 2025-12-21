const gameData = {
    "Programming Terms": [
        { word: "ALGORITHM", hint: "A step-by-step procedure for calculations" },
        { word: "VARIABLE", hint: "A container for storing data values" },
        { word: "FUNCTION", hint: "A block of code designed to perform a particular task" },
        { word: "LOOP", hint: "A sequence of instructions that is continually repeated" },
        { word: "ARRAY", hint: "A data structure consisting of a collection of elements" },
        { word: "OBJECT", hint: "A collection of related data and/or functionality" },
        { word: "BOOLEAN", hint: "A data type that has one of two possible values" },
        { word: "STRING", hint: "A sequence of characters used to represent text" },
        { word: "INTEGER", hint: "A datum of integral data type" },
        { word: "SYNTAX", hint: "The set of rules that defines the combinations of symbols" },
        { word: "DEBUGGING", hint: "The process of finding and resolving defects or problems" },
        { word: "COMPILER", hint: "A program that translates computer code written in one programming language into another" }
    ],
    "Web Development": [
        { word: "HTML", hint: "The standard markup language for documents designed to be displayed in a web browser" },
        { word: "CSS", hint: "Style sheet language used for describing the presentation of a document" },
        { word: "JAVASCRIPT", hint: "Programming language that converts static HTML pages to interactive web pages" },
        { word: "REACT", hint: "A JavaScript library for building user interfaces" },
        { word: "API", hint: "A set of definitions and protocols for building and integrating application software" },
        { word: "DOM", hint: "The programming interface for web documents" },
        { word: "RESPONSIVE", hint: "Web design that makes web pages render well on a variety of devices" },
        { word: "FRONTEND", hint: "The part of a website that users interact with directly" },
        { word: "BACKEND", hint: "The server-side of an application" }
    ]
};

// DOM Elements
const wordContainer = document.getElementById("word-container");
const keyboardContainer = document.getElementById("keyboard-container");
const hintText = document.getElementById("hint-text");
const categoryText = document.getElementById("category-text");
const livesDisplayMobile = document.getElementById("lives-display-mobile");
const livesDisplayDesktop = document.getElementById("lives-display-desktop");
const livesRingMobile = document.getElementById("lives-ring-mobile");
const livesRingDesktop = document.getElementById("lives-ring-desktop");
const scoreDisplay = document.getElementById("score-display");
const feedbackMessage = document.getElementById("feedback-message");
const giveUpBtn = document.getElementById("give-up-btn");

// Overlay Elements
const overlay = document.getElementById("game-overlay");
const overlayContent = document.getElementById("overlay-content");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const overlayWord = document.getElementById("overlay-word");
const overlayIcon = document.getElementById("overlay-icon");
const overlayIconContainer = document.getElementById("overlay-icon-container");
const playAgainBtn = document.getElementById("play-again-btn");

// Game State
let currentWord = "";
let currentHint = "";
let guessedLetters = [];
let lives = 6;
let score = 0;
let gameActive = false;

// Body Parts IDs in order of reveal
const bodyParts = [
    "part-head",
    "part-body",
    "part-l-arm",
    "part-r-arm",
    "part-l-leg",
    "part-r-leg"
];

// Initialization
function initGame() {
    // Reset State
    guessedLetters = [];
    lives = 6;
    gameActive = true;
    
    // Pick Random Word
    const categories = Object.keys(gameData);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = gameData[randomCategory];
    const randomWordObj = words[Math.floor(Math.random() * words.length)];
    
    currentWord = randomWordObj.word;
    currentHint = randomWordObj.hint;
    
    // Update UI
    categoryText.textContent = randomCategory;
    hintText.textContent = currentHint;
    updateLivesUI();
    renderWord();
    renderKeyboard();
    resetHangmanFigure();
    hideOverlay();
    
    // Reset feedback
    feedbackMessage.style.opacity = "0";
}

// Render Word Slots
function renderWord() {
    wordContainer.innerHTML = "";
    const letters = currentWord.split("");
    
    letters.forEach((letter, index) => {
        const isGuessed = guessedLetters.includes(letter);
        const letterDiv = document.createElement("div");
        letterDiv.className = "flex flex-col items-center gap-2 group";
        
        // Slot Container
        const slot = document.createElement("div");
        slot.className = `h-12 w-10 md:h-16 md:w-14 flex items-end justify-center border-b-4 ${isGuessed ? 'border-primary' : 'border-white/20'} pb-2 transition-colors duration-300`;
        
        // Letter Text
        const letterSpan = document.createElement("span");
        letterSpan.className = `text-3xl md:text-5xl font-bold ${isGuessed ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-transparent'} select-none transition-all duration-300`;
        if (isGuessed) {
            letterSpan.classList.add("animate-pop");
            // Stagger animation based on index if revealing all at once? 
            // Usually we reveal one by one. But for init/update it's fine.
        }
        letterSpan.textContent = letter;
        
        slot.appendChild(letterSpan);
        letterDiv.appendChild(slot);
        wordContainer.appendChild(letterDiv);
    });
}

// Render Keyboard
function renderKeyboard() {
    keyboardContainer.innerHTML = "";
    
    const rows = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Z", "X", "C", "V", "B", "N", "M"]
    ];
    
    rows.forEach((row, rowIndex) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = `flex flex-wrap justify-center gap-2 ${rowIndex === 1 ? 'pl-4' : rowIndex === 2 ? 'pl-8' : ''}`;
        
        row.forEach(key => {
            const btn = document.createElement("button");
            const isGuessed = guessedLetters.includes(key);
            const isCorrect = isGuessed && currentWord.includes(key);
            const isWrong = isGuessed && !currentWord.includes(key);
            
            // Base classes
            let classes = "h-12 w-10 md:w-12 rounded-lg font-semibold transition-all active:scale-95 border-b-4 border-black/20 text-white";
            
            if (!isGuessed) {
                classes += " bg-white/10 hover:bg-white/20";
                btn.onclick = () => handleGuess(key);
            } else if (isCorrect) {
                classes += " bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(73,230,25,0.2)] cursor-default";
                btn.disabled = true;
            } else { // Wrong
                classes = "h-12 w-10 md:w-12 rounded-lg bg-transparent text-white/20 font-semibold cursor-not-allowed border border-white/5";
                btn.disabled = true;
            }
            
            btn.className = classes;
            btn.textContent = key;
            btn.setAttribute("aria-label", `Letter ${key}`);
            
            rowDiv.appendChild(btn);
        });
        
        keyboardContainer.appendChild(rowDiv);
    });
}

// Handle Guess
function handleGuess(letter) {
    if (!gameActive || guessedLetters.includes(letter)) return;
    
    guessedLetters.push(letter);
    
    const isCorrect = currentWord.includes(letter);
    
    if (isCorrect) {
        playSound("success");
        checkWin();
    } else {
        lives--;
        playSound("error");
        updateLivesUI();
        revealNextBodyPart();
        shakeWordContainer();
        
        if (lives === 0) {
            endGame(false);
        }
    }
    
    renderWord();
    renderKeyboard();
}

// Visual Updates
function updateLivesUI() {
    // Update Text
    livesDisplayMobile.innerHTML = `${lives} <span class="text-gray-500 text-lg font-normal">/ 6</span>`;
    livesDisplayDesktop.textContent = lives;
    
    // Update Rings
    // Circumference of radius 15.9155 is approx 100.
    const maxDash = 100;
    const dashOffset = maxDash - (lives / 6) * maxDash;
    
    livesRingMobile.style.strokeDashoffset = dashOffset;
    livesRingDesktop.style.strokeDashoffset = dashOffset;
    
    // Color change based on lives?
    if (lives <= 2) {
        livesRingMobile.classList.replace("text-primary", "text-red-500");
        livesRingDesktop.classList.replace("text-primary", "text-red-500");
    } else {
        livesRingMobile.classList.replace("text-red-500", "text-primary");
        livesRingDesktop.classList.replace("text-red-500", "text-primary");
    }
}

function resetHangmanFigure() {
    bodyParts.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add("hidden-part");
            el.classList.remove("visible-part");
        }
    });
}

function revealNextBodyPart() {
    // Current lives: 5 -> 1st mistake -> index 0 (Head)
    // Current lives: 4 -> 2nd mistake -> index 1 (Body)
    // Logic: 6 - lives - 1
    // If lives = 5, index = 0.
    // If lives = 0, index = 5.
    const mistakeIndex = 6 - lives - 1;
    if (mistakeIndex >= 0 && mistakeIndex < bodyParts.length) {
        const partId = bodyParts[mistakeIndex];
        const partEl = document.getElementById(partId);
        if (partEl) {
            partEl.classList.remove("hidden-part");
            partEl.classList.add("visible-part");
        }
    }
}

function shakeWordContainer() {
    const wordPanel = document.getElementById("word-panel"); // Shake the whole panel or just the word?
    // Plan said "Word container shakes".
    // Let's shake the panel for more impact.
    wordPanel.classList.remove("animate-shake");
    void wordPanel.offsetWidth; // Trigger reflow
    wordPanel.classList.add("animate-shake");
    
    // Show temporary feedback
    feedbackMessage.style.opacity = "1";
    setTimeout(() => {
        feedbackMessage.style.opacity = "0";
    }, 1500);
}

// Game Logic
function checkWin() {
    const allLettersGuessed = currentWord.split("").every(l => guessedLetters.includes(l));
    if (allLettersGuessed) {
        score += lives * 100; // Bonus for remaining lives
        scoreDisplay.textContent = `Score: ${score.toLocaleString()}`;
        endGame(true);
    }
}

function endGame(isWin) {
    gameActive = false;
    
    setTimeout(() => {
        showOverlay(isWin);
    }, 500); // Slight delay
}

function showOverlay(isWin) {
    overlay.classList.remove("hidden");
    // Trigger fade in
    setTimeout(() => {
        overlay.classList.remove("opacity-0");
        overlayContent.classList.remove("scale-95");
    }, 10);
    
    if (isWin) {
        overlayTitle.textContent = "You Won!";
        overlayTitle.className = "text-3xl font-bold text-white mb-2";
        overlayMessage.innerHTML = `The word was <span class="text-white font-bold">${currentWord}</span>`;
        overlayIcon.textContent = "celebration";
        overlayIcon.className = "material-symbols-outlined text-4xl text-primary";
        overlayIconContainer.className = "size-20 bg-primary/20 rounded-full flex items-center justify-center mb-2";
        playAgainBtn.className = "w-full py-4 rounded-full bg-primary text-background-dark font-bold text-lg hover:bg-[#3cd015] transition-colors shadow-lg shadow-primary/20";
        
        // Confetti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#49e619', '#ffffff']
        });
        
    } else {
        overlayTitle.textContent = "Game Over";
        overlayTitle.className = "text-3xl font-bold text-red-500 mb-2";
        overlayMessage.innerHTML = `The word was <span class="text-white font-bold">${currentWord}</span>`;
        overlayIcon.textContent = "sentiment_very_dissatisfied";
        overlayIcon.className = "material-symbols-outlined text-4xl text-red-500";
        overlayIconContainer.className = "size-20 bg-red-500/20 rounded-full flex items-center justify-center mb-2";
        playAgainBtn.className = "w-full py-4 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-colors border border-white/10";
    }
}

function hideOverlay() {
    overlay.classList.add("opacity-0");
    overlayContent.classList.add("scale-95");
    setTimeout(() => {
        overlay.classList.add("hidden");
    }, 300);
}

function playSound(type) {
    // Optional: Add Audio logic here if requested later
    // "Device emits a 'Failure' haptic notification" - Web Haptics API
    if (navigator.vibrate) {
        if (type === 'error') navigator.vibrate(200);
        if (type === 'success') navigator.vibrate(50);
    }
}

// Event Listeners
playAgainBtn.addEventListener("click", initGame);
giveUpBtn.addEventListener("click", () => {
    lives = 0;
    updateLivesUI();
    // Reveal all parts
    bodyParts.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("hidden-part");
            el.classList.add("visible-part");
        }
    });
    endGame(false);
});

// Physical Keyboard Support
document.addEventListener("keydown", (e) => {
    if (!gameActive) return;
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
    }
});

// Start
initGame();




