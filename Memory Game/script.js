const gameBoard = document.getElementById("game-board");
const movesDisplay = document.getElementById("moves");
const timeDisplay = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");
const statusText = document.getElementById("status-text");
const levelDisplay = document.getElementById("level-display");
const profileBtn = document.getElementById("profile-btn");
const profileDropdown = document.getElementById("profile-dropdown");
const nameInput = document.getElementById("name-input");
const saveNameBtn = document.getElementById("save-name-btn");
const playerNameDisplay = document.getElementById("player-name");

const icons = [
  "pets",
  "rocket_launch",
  "favorite",
  "star",
  "bolt",
  "key",
  "visibility",
  "settings",
  "home",
  "search",
  "menu",
  "lock",
  "person",
  "image",
  "mail",
  "notifications",
  "location_on",
  "play_arrow",
  "wifi",
  "battery_full",
  "bluetooth",
  "camera_alt",
  "directions_car",
  "eco",
  "water_drop",
  "flight",
  "train",
  "directions_boat",
  "music_note",
  "light_mode",
  "dark_mode",
  "palette",
  "shopping_cart",
  "info",
  "wb_sunny",
  "local_fire_department", // Added 2 more for level 5 (36 cards)
];

const levels = [
  { level: 1, rows: 4, cols: 3, pairs: 6 },
  { level: 2, rows: 4, cols: 4, pairs: 8 },
  { level: 3, rows: 5, cols: 4, pairs: 10 },
  { level: 4, rows: 6, cols: 5, pairs: 15 },
  { level: 5, rows: 6, cols: 6, pairs: 18 },
];

let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let timerInterval;
let seconds = 0;
let gameStarted = false;
let matchedPairs = 0;
let currentLevelIndex = 0;

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function initGame() {
  // Reset state
  hasFlippedCard = false;
  lockBoard = false;
  firstCard = null;
  secondCard = null;
  moves = 0;
  seconds = 0;
  gameStarted = false;
  matchedPairs = 0;

  const currentLevelConfig = levels[currentLevelIndex];
  const totalPairs = currentLevelConfig.pairs;

  // Update UI
  movesDisplay.textContent = moves;
  timeDisplay.textContent = "00:00";
  statusText.textContent = "Select a card";
  levelDisplay.textContent = `${currentLevelConfig.level}/${levels.length}`;
  restartBtn.innerHTML = `
      <span class="material-symbols-outlined mr-2 text-[20px] group-hover:-rotate-180 transition-transform duration-500">refresh</span>
      <span>Restart Level</span>
  `;
  clearInterval(timerInterval);

  // Configure Board Grid
  gameBoard.className = `grid gap-3 w-full h-full p-5 bg-surface-light dark:bg-surface-dark rounded-4xl shadow-soft-xl border border-black/[0.04] dark:border-white/[0.08] ring-1 ring-black/[0.02] dark:ring-white/[0.02] transform transition-transform duration-500`;
  gameBoard.style.gridTemplateColumns = `repeat(${currentLevelConfig.cols}, minmax(0, 1fr))`;
  gameBoard.style.gridTemplateRows = `repeat(${currentLevelConfig.rows}, minmax(0, 1fr))`;

  // Create cards
  const selectedIcons = icons.slice(0, totalPairs);
  const cardIcons = [...selectedIcons, ...selectedIcons]; // Duplicate for pairs
  shuffle(cardIcons);

  gameBoard.innerHTML = "";

  cardIcons.forEach((icon, index) => {
    const cardElement = document.createElement("div");
    cardElement.className =
      "relative w-full h-full perspective-1000 group cursor-pointer";
    cardElement.dataset.icon = icon;
    cardElement.dataset.index = index;

    cardElement.innerHTML = `
            <div class="relative w-full h-full text-center transition-all duration-500 ease-out transform-style-3d group-hover:scale-[1.05] group-hover:-translate-y-1 group-hover:shadow-card-hover rounded-xl card-inner">
                <!-- Back Face -->
                <div class="absolute w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center backface-hidden border border-black/[0.04] dark:border-white/[0.05] shadow-card card-texture">
                    <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 opacity-50"></div>
                </div>
                <!-- Front Face -->
                <div class="absolute w-full h-full bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center rotate-y-180 border-2 border-primary ring-2 ring-primary/10 shadow-inner-subtle backface-hidden">
                    <span class="material-symbols-outlined text-primary text-3xl drop-shadow-sm transform transition-transform">${icon}</span>
                </div>
            </div>
        `;

    cardElement.addEventListener("click", flipCard);
    gameBoard.appendChild(cardElement);
  });
}

function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  timerInterval = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    timeDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  if (!gameStarted) startTimer();

  this.querySelector(".card-inner").classList.add("flipped");

  if (!hasFlippedCard) {
    // First click
    hasFlippedCard = true;
    firstCard = this;
    statusText.textContent = "Select a second card";
    return;
  }

  // Second click
  secondCard = this;
  incrementMoves();
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  matchedPairs++;
  const currentLevelConfig = levels[currentLevelIndex];

  if (matchedPairs === currentLevelConfig.pairs) {
    endGame();
  } else {
    statusText.textContent = "Match found!";
    setTimeout(() => {
      if (statusText.textContent === "Match found!")
        statusText.textContent = "Select a card";
    }, 1500);
  }

  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  statusText.textContent = "Not a match...";

  setTimeout(() => {
    firstCard.querySelector(".card-inner").classList.remove("flipped");
    secondCard.querySelector(".card-inner").classList.remove("flipped");
    statusText.textContent = "Try again";
    resetBoard();
  }, 1000);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function incrementMoves() {
  moves++;
  movesDisplay.textContent = moves;
}

function endGame() {
  clearInterval(timerInterval);
  const isLastLevel = currentLevelIndex === levels.length - 1;

  if (isLastLevel) {
    statusText.textContent = `You completed all levels!`;
    restartBtn.innerHTML = `
          <span class="material-symbols-outlined mr-2 text-[20px] group-hover:-rotate-180 transition-transform duration-500">replay</span>
          <span>Play Again</span>
      `;
    restartBtn.onclick = () => {
      currentLevelIndex = 0;
      restartBtn.onclick = initGame; // Reset handler
      initGame();
    };
  } else {
    statusText.textContent = `Level ${levels[currentLevelIndex].level} Complete!`;
    restartBtn.innerHTML = `
          <span class="material-symbols-outlined mr-2 text-[20px] transition-transform duration-500">arrow_forward</span>
          <span>Next Level</span>
      `;

    // Temporarily override click handler for next level
    restartBtn.onclick = () => {
      currentLevelIndex++;
      restartBtn.onclick = initGame; // Reset handler
      initGame();
    };
  }
}

// Profile Dropdown Logic
profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.classList.add("hidden");
  }
});

saveNameBtn.addEventListener("click", () => {
  const newName = nameInput.value.trim();
  if (newName) {
    playerNameDisplay.textContent = newName;
    localStorage.setItem("memoryGamePlayerName", newName);
    profileDropdown.classList.add("hidden");
  }
});

// Load saved name
const savedName = localStorage.getItem("memoryGamePlayerName");
if (savedName) {
  playerNameDisplay.textContent = savedName;
  nameInput.value = savedName;
}

restartBtn.addEventListener("click", initGame);

// Initialize on load
initGame();
