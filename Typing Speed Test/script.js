const text = "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. The five boxing wizards jump quickly. Pack my box with five dozen liquor jugs.";

const textDisplay = document.getElementById("text-display");
const inputField = document.getElementById("input-field");
const timeDisplay = document.getElementById("time-display");
const wpmDisplay = document.getElementById("wpm-display");
const restartBtn = document.getElementById("restart-btn");
const headerChrome = document.getElementById("header-chrome");
const instructionHint = document.getElementById("instruction-hint");
const resultsOverlay = document.getElementById("results-overlay");
const finalWpm = document.getElementById("final-wpm");
const finalAccuracy = document.getElementById("final-accuracy");
const finalErrors = document.getElementById("final-errors");
const closeResultsBtn = document.getElementById("close-results-btn");
const tryAgainBtn = document.getElementById("try-again-btn");

// History Elements
const historyBtn = document.getElementById("history-btn");
const historyOverlay = document.getElementById("history-overlay");
const closeHistoryBtn = document.getElementById("close-history-btn");
const historyList = document.getElementById("history-list");
const historyModalContent = document.getElementById("history-modal-content");

let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let mistakes = 0;
let isTyping = false;
let gameEnded = false;
// Track which character indices had mistakes
let mistakeIndices = new Set();

function loadParagraph() {
    const chars = text.split("");
    textDisplay.innerHTML = "";
    chars.forEach((char, index) => {
        let span = document.createElement("span");
        span.innerText = char;
        if (index === 0) span.classList.add("char-active");
        textDisplay.appendChild(span);
    });
}

function initTyping() {
    const chars = textDisplay.querySelectorAll("span");
    let typedVal = inputField.value;
    
    // Limit input length to text length to prevent typing beyond end
    const maxLength = chars.length;
    if (typedVal.length > maxLength) {
        typedVal = typedVal.substring(0, maxLength);
        inputField.value = typedVal;
    }

    if (!isTyping && typedVal.length > 0) {
        isTyping = true;
        if (timer) clearInterval(timer);
        timer = setInterval(initTimer, 1000);
        headerChrome.classList.add("opacity-20");
        instructionHint.style.opacity = "0";
    }

    // Handle typing (forward loop to catch up if fast or pasted)
    // Note: We only process up to typedVal.length or chars.length
    if (typedVal.length > charIndex) {
        while (charIndex < typedVal.length && charIndex < chars.length) {
            let typedChar = typedVal[charIndex];
            
            // Remove active from current
            chars[charIndex].classList.remove("char-active");

            // Check correctness
            if (chars[charIndex].innerText === typedChar) {
                chars[charIndex].classList.add("char-correct");
                // Remove from mistake indices if it was previously incorrect
                if (mistakeIndices.has(charIndex)) {
                    mistakeIndices.delete(charIndex);
                    mistakes--;
                }
            } else {
                // Only increment if this index wasn't already marked as a mistake
                if (!mistakeIndices.has(charIndex)) {
                    mistakes++;
                    mistakeIndices.add(charIndex);
                }
                chars[charIndex].classList.add("char-incorrect");
            }

            charIndex++;
        }
        
        // Set new active
        if (charIndex < chars.length) {
            chars[charIndex].classList.add("char-active");
        } else {
            // Completed text
            endGame();
        }
    } 
    // Handle backspace (loop to clear multiple chars if needed)
    else if (typedVal.length < charIndex) {
        while (charIndex > typedVal.length) {
             if (charIndex < chars.length) {
                 chars[charIndex].classList.remove("char-active");
             }
             charIndex--;
             // Decrement mistake count if this index had a mistake
             if (mistakeIndices.has(charIndex)) {
                 mistakeIndices.delete(charIndex);
                 mistakes--;
             }
             chars[charIndex].classList.remove("char-correct", "char-incorrect");
        }
        // Set new active at current index
        if (charIndex < chars.length) {
            chars[charIndex].classList.add("char-active");
        }
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeDisplay.innerText = timeLeft + "s";
        
        // Live WPM update
        const timeElapsed = maxTime - timeLeft;
        let wpm = Math.round(((charIndex - mistakes) / 5) / (timeElapsed / 60));
        wpmDisplay.innerText = (wpm < 0 || !wpm || wpm === Infinity) ? 0 : wpm;
    } else {
        endGame();
    }
}

function endGame() {
    // Prevent double calls
    if (gameEnded) return;
    gameEnded = true;
    
    if (timer) clearInterval(timer);
    inputField.disabled = true;
    
    // Calculate Stats
    const timeElapsed = maxTime - timeLeft;
    const timeInMinutes = (timeElapsed === 0 ? 1 : timeElapsed) / 60;
    
    let wpm = Math.round(((charIndex - mistakes) / 5) / timeInMinutes);
    wpm = (wpm < 0 || !wpm || wpm === Infinity) ? 0 : wpm;
    
    // Fix division by zero in accuracy calculation
    let accuracy = 0;
    if (charIndex > 0) {
        accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100);
        if (isNaN(accuracy)) accuracy = 0;
    }

    finalWpm.innerText = wpm;
    finalAccuracy.innerText = accuracy + "%";
    finalErrors.innerText = mistakes;

    // Save Result
    saveResult(wpm, accuracy, mistakes);

    // Show results
    resultsOverlay.classList.remove("hidden");
    // Trigger fade in
    requestAnimationFrame(() => {
        resultsOverlay.classList.remove("opacity-0");
        resultsOverlay.querySelector("#results-content").classList.remove("scale-95");
        resultsOverlay.querySelector("#results-content").classList.add("scale-100");
    });
}

function resetGame() {
    loadParagraph();
    if (timer) clearInterval(timer);
    timeLeft = maxTime;
    charIndex = 0;
    mistakes = 0;
    isTyping = false;
    gameEnded = false;
    mistakeIndices.clear();
    inputField.value = "";
    inputField.disabled = false;
    timeDisplay.innerText = timeLeft + "s";
    wpmDisplay.innerText = 0;
    
    // Reset UI
    headerChrome.classList.remove("opacity-20");
    instructionHint.style.opacity = "1";
    
    resultsOverlay.classList.add("opacity-0");
    resultsOverlay.classList.add("hidden");
    resultsOverlay.querySelector("#results-content").classList.add("scale-95");
    resultsOverlay.querySelector("#results-content").classList.remove("scale-100");
    
    // Focus input
    inputField.focus();
}

// History Functions
function saveResult(wpm, accuracy, mistakes) {
    try {
        const historyStr = localStorage.getItem('typingTestHistory');
        let history = [];
        
        if (historyStr) {
            try {
                history = JSON.parse(historyStr);
            } catch (parseError) {
                console.warn('Failed to parse history from localStorage:', parseError);
                history = [];
            }
        }
        
        const newResult = {
            date: new Date().toISOString(),
            wpm: wpm,
            accuracy: accuracy,
            mistakes: mistakes
        };
        
        history.unshift(newResult);
        // Keep last 50 attempts
        if (history.length > 50) history.pop();
        
        localStorage.setItem('typingTestHistory', JSON.stringify(history));
    } catch (error) {
        // Handle quota exceeded or disabled localStorage
        if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded. History not saved.');
        } else if (error.name === 'SecurityError') {
            console.warn('localStorage access denied. History not saved.');
        } else {
            console.warn('Failed to save result to localStorage:', error);
        }
        // Gracefully degrade - continue without saving
    }
}

function loadHistory() {
    let history = [];
    
    try {
        const historyStr = localStorage.getItem('typingTestHistory');
        if (historyStr) {
            try {
                history = JSON.parse(historyStr);
            } catch (parseError) {
                console.warn('Failed to parse history from localStorage:', parseError);
                history = [];
            }
        }
    } catch (error) {
        // Handle disabled localStorage
        if (error.name === 'SecurityError') {
            console.warn('localStorage access denied.');
        } else {
            console.warn('Failed to load history from localStorage:', error);
        }
        history = [];
    }
    
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<div class="text-center text-gray-500 py-8">No attempts yet</div>';
        return;
    }

    history.forEach(item => {
        const date = new Date(item.date);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date);

        const el = document.createElement('div');
        el.className = 'flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-700/50';
        el.innerHTML = `
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 font-medium uppercase tracking-wider">${formattedDate}</span>
                <span class="text-xl font-bold text-gray-800 dark:text-gray-200">${item.wpm} <span class="text-sm font-normal text-gray-500">WPM</span></span>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex flex-col items-end">
                    <span class="text-xs text-gray-400 uppercase">Acc</span>
                    <span class="font-mono text-green-500 font-medium">${item.accuracy}%</span>
                </div>
                <div class="flex flex-col items-end">
                    <span class="text-xs text-gray-400 uppercase">Err</span>
                    <span class="font-mono text-red-500 font-medium">${item.mistakes}</span>
                </div>
            </div>
        `;
        historyList.appendChild(el);
    });
}

function openHistory() {
    loadHistory();
    historyOverlay.classList.remove("hidden");
    requestAnimationFrame(() => {
        historyOverlay.classList.remove("opacity-0");
        historyModalContent.classList.remove("scale-95");
        historyModalContent.classList.add("scale-100");
    });
}

function closeHistory() {
    historyOverlay.classList.add("opacity-0");
    historyModalContent.classList.remove("scale-100");
    historyModalContent.classList.add("scale-95");
    
    setTimeout(() => {
        historyOverlay.classList.add("hidden");
    }, 300);
}

function closeResults() {
    resultsOverlay.classList.add("opacity-0");
    resultsOverlay.querySelector("#results-content").classList.remove("scale-100");
    resultsOverlay.querySelector("#results-content").classList.add("scale-95");
    
    setTimeout(() => {
        resultsOverlay.classList.add("hidden");
    }, 300);
}

// Handle paste events to limit length and process properly
inputField.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData("text");
    const chars = textDisplay.querySelectorAll("span");
    const remainingChars = chars.length - charIndex;
    
    // Limit pasted text to remaining characters
    const textToPaste = pastedText.substring(0, remainingChars);
    
    // Insert the pasted text character by character
    // This ensures proper mistake tracking
    const currentValue = inputField.value;
    inputField.value = currentValue + textToPaste;
    
    // Trigger typing handler to process the pasted text
    initTyping();
});

// Event Listeners
inputField.addEventListener("input", initTyping);
restartBtn.addEventListener("click", resetGame);

// History Events
historyBtn.addEventListener("click", openHistory);
closeHistoryBtn.addEventListener("click", closeHistory);
historyOverlay.addEventListener("click", (e) => {
    if (e.target === historyOverlay) closeHistory();
});

// Results Overlay Events
if (closeResultsBtn) {
    closeResultsBtn.addEventListener("click", closeResults);
}
if (tryAgainBtn) {
    tryAgainBtn.addEventListener("click", resetGame);
}
resultsOverlay.addEventListener("click", (e) => {
    if (e.target === resultsOverlay) closeResults();
});

// Escape key handler for closing modals
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        // Close history modal if open
        if (!historyOverlay.classList.contains("hidden")) {
            closeHistory();
        }
        // Close results overlay if visible
        else if (!resultsOverlay.classList.contains("hidden")) {
            closeResults();
        }
    }
});

// Handle special keys to prevent interference
inputField.addEventListener("keydown", (e) => {
    // Prevent Tab from navigating away
    if (e.key === "Tab") {
        e.preventDefault();
        return;
    }
    
    // Prevent Enter from submitting forms
    if (e.key === "Enter") {
        e.preventDefault();
        return;
    }
    
    // Prevent Arrow keys, Home, End, Delete from moving cursor
    // (We want to control cursor position ourselves)
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Delete"].includes(e.key)) {
        e.preventDefault();
        return;
    }
    
    // Allow Backspace and printable characters
    // Everything else is handled by the input event
});

// Focus handling
document.addEventListener("keydown", (e) => {
    // Ignore if modifier keys are pressed (shortcuts)
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Ignore if history modal is open
    if (!historyOverlay.classList.contains("hidden")) return;
    // Ignore if results overlay is visible
    if (!resultsOverlay.classList.contains("hidden")) return;
    
    inputField.focus();
});
textDisplay.addEventListener("click", () => inputField.focus());

// Initialize
loadParagraph();