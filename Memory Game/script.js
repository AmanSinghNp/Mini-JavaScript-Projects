const gameBoard = document.getElementById("game-board");
const movesDisplay = document.getElementById("moves");
const timeDisplay = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");
const statusText = document.getElementById("status-text");

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
];

let cards = []; // Array of card objects
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let timerInterval;
let seconds = 0;
let gameStarted = false;
let matchedPairs = 0;
const totalPairs = 18;

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

  // Update UI
  movesDisplay.textContent = moves;
  timeDisplay.textContent = "00:00";
  statusText.textContent = "Select a card";
  clearInterval(timerInterval);

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

  // Optional: Visual style for matched cards (e.g., keep them slightly elevated or add a glow)
  // The design handles it by keeping them flipped.

  matchedPairs++;
  if (matchedPairs === totalPairs) {
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
  statusText.textContent = `You won in ${moves} moves!`;
  // Add simple celebration effect if desired
}

restartBtn.addEventListener("click", initGame);

// Initialize on load
initGame();
