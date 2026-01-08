// State variables
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let scores = { x: 0, o: 0 };

// DOM Elements
const turnIcon = document.getElementById("turn-icon");
const turnText = document.getElementById("turn-text");
const gameBoard = document.getElementById("game-board");
const scoreXElement = document.getElementById("score-x");
const scoreOElement = document.getElementById("score-o");
const restartBtn = document.getElementById("restart-btn");
const cells = document.querySelectorAll("[data-cell-index]");
const p1ScoreCard = document.getElementById("p1-score-card");
const p2ScoreCard = document.getElementById("p2-score-card");

// Winning combinations
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Initialize Game
function initGame() {
  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
    cell.innerHTML = ""; // Clear board
  });
  restartBtn.addEventListener("click", restartGame);
  updateTurnIndicator();
}

function handleCellClick(e) {
  const clickedCell = e.target.closest("button");
  const clickedCellIndex = parseInt(
    clickedCell.getAttribute("data-cell-index")
  );

  if (board[clickedCellIndex] !== "" || !gameActive) {
    return;
  }

  handlePlayerMove(clickedCell, clickedCellIndex);
  handleResultValidation();
}

function handlePlayerMove(cell, index) {
  board[index] = currentPlayer;

  // Render symbol based on player
  if (currentPlayer === "X") {
    cell.innerHTML =
      '<span class="material-symbols-outlined text-5xl sm:text-6xl text-white opacity-90 scale-100 transition-transform duration-300">close</span>';
  } else {
    cell.innerHTML =
      '<span class="material-symbols-outlined text-4xl sm:text-5xl text-white/40 font-bold">circle</span>';
  }
}

function handleResultValidation() {
  let roundWon = false;
  for (let i = 0; i <= 7; i++) {
    const winCondition = winningConditions[i];
    let a = board[winCondition[0]];
    let b = board[winCondition[1]];
    let c = board[winCondition[2]];
    if (a === "" || b === "" || c === "") {
      continue;
    }
    if (a === b && b === c) {
      roundWon = true;
      break;
    }
  }

  if (roundWon) {
    announceWinner(currentPlayer);
    gameActive = false;
    return;
  }

  let roundDraw = !board.includes("");
  if (roundDraw) {
    announceDraw();
    gameActive = false;
    return;
  }

  switchPlayer();
}

function announceWinner(player) {
  turnText.innerText = `Player ${player} Wins!`;
  turnIcon.innerText = player === "X" ? "close" : "circle";

  // Update Score
  if (player === "X") {
    scores.x++;
    scoreXElement.innerText = scores.x;
  } else {
    scores.o++;
    scoreOElement.innerText = scores.o;
  }
}

function announceDraw() {
  turnText.innerText = "Game Draw!";
  turnIcon.innerText = "remove"; // Minus sign or similar for draw
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnIndicator();
}

function updateTurnIndicator() {
  turnText.innerText = `Player ${currentPlayer}'s Turn`;

  // Update Score Card Highlight
  if (currentPlayer === "X") {
    turnIcon.className =
      "material-symbols-outlined text-primary filled text-[20px]";
    turnIcon.innerText = "close";
    p1ScoreCard.classList.remove("opacity-70");
    p2ScoreCard.classList.add("opacity-70");
  } else {
    turnIcon.className =
      "material-symbols-outlined text-white filled text-[20px]";
    turnIcon.innerText = "circle";
    p1ScoreCard.classList.add("opacity-70");
    p2ScoreCard.classList.remove("opacity-70");
  }
}

function restartGame() {
  gameActive = true;
  currentPlayer = "X";
  board = ["", "", "", "", "", "", "", "", ""];
  turnText.innerText = "Player X's Turn";
  cells.forEach((cell) => (cell.innerHTML = ""));
  updateTurnIndicator();
}

// Start the game
initGame();













