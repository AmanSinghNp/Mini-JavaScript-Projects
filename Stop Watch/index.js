const time = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");

let elapsedMs = 0;
let interval = null;
const TICK_MS = 100; // update every 100ms

function padStart(value) {
  return String(value).padStart(2, "0");
}

function setTime() {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  time.textContent = `${padStart(hours)}:${padStart(minutes)}:${padStart(
    seconds
  )}`;
}

function tick() {
  elapsedMs += TICK_MS;
  setTime();
}

function updateButtons() {
  const isRunning = interval !== null;
  startBtn.disabled = isRunning;
  stopBtn.disabled = !isRunning;
  resetBtn.disabled = elapsedMs === 0;
}

function startClock() {
  if (interval !== null) return;
  interval = setInterval(tick, TICK_MS);
  updateButtons();
}

function stopClock() {
  if (interval === null) return;
  clearInterval(interval);
  interval = null;
  updateButtons();
}

function resetClock() {
  stopClock();
  elapsedMs = 0;
  setTime();
  updateButtons();
}

// Initialize
setTime();
updateButtons();

// Wire up events
startBtn.addEventListener("click", startClock);
stopBtn.addEventListener("click", stopClock);
resetBtn.addEventListener("click", resetClock);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (interval === null) {
      startClock();
    } else {
      stopClock();
    }
  }

  if (event.key === "r" || event.key === "R") {
    resetClock();
  }
});
