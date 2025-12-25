const text = "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. The five boxing wizards jump quickly. Pack my box with five dozen liquor jugs.";

const textDisplay = document.getElementById("text-display");
const inputField = document.getElementById("input-field");
const timeDisplay = document.getElementById("time-display");
const wpmDisplay = document.getElementById("wpm-display");
const progressBar = document.getElementById("progress-bar");
const progressTrack = document.getElementById("progress-track");
const virtualKeyboard = document.getElementById("virtual-keyboard");
const settingsBtn = document.getElementById("settings-btn");
const settingsOverlay = document.getElementById("settings-overlay");
const settingsModalContent = document.getElementById("settings-modal-content");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const modeSelect = document.getElementById("mode-select");
const timeSelect = document.getElementById("time-select");
const wordsSelect = document.getElementById("words-select");
const timeSelectGroup = document.getElementById("time-select-group");
const wordsSelectGroup = document.getElementById("words-select-group");
const textSourceSelect = document.getElementById("text-source-select");
const customTextGroup = document.getElementById("custom-text-group");
const customTextarea = document.getElementById("custom-textarea");
const randomizeTextBtn = document.getElementById("randomize-text-btn");
const applySettingsBtn = document.getElementById("apply-settings-btn");
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
let keyElements = new Map();
let wordBoundaries = [];
let currentText = "";

const passages = [
    "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.",
    "Typing tests improve speed and accuracy. Practice daily to build muscle memory and rhythm.",
    "JavaScript powers interactive experiences on the web, enabling dynamic content and responsive design.",
    "Design systems help teams ship consistent UI faster while reducing maintenance overhead.",
    "Optimizing for performance means measuring, profiling, and iterating with real-world constraints.",
    "Clear error handling and graceful fallbacks keep user experiences resilient under failure."
];

const settings = {
    mode: "time", // "time" or "words"
    duration: 60,
    wordCount: 50,
    textSource: "random", // "random" or "custom"
    customText: ""
};

function pickRandomText() {
    return passages[Math.floor(Math.random() * passages.length)];
}

function getActiveText() {
    const source =
        settings.textSource === "custom" && settings.customText.trim().length > 0
            ? settings.customText.trim()
            : pickRandomText();

    if (settings.mode === "words") {
        const words = source.replace(/\s+/g, " ").trim().split(" ");
        const limited = words.slice(0, settings.wordCount).join(" ");
        return limited.length > 0 ? limited : pickRandomText();
    }
    return source;
}

function updateModeVisibility() {
    if (!timeSelectGroup || !wordsSelectGroup || !customTextGroup) return;
    if (settings.mode === "time") {
        timeSelectGroup.classList.remove("hidden");
        wordsSelectGroup.classList.add("hidden");
    } else {
        wordsSelectGroup.classList.remove("hidden");
        timeSelectGroup.classList.add("hidden");
    }

    if (settings.textSource === "custom") {
        customTextGroup.classList.remove("hidden");
    } else {
        customTextGroup.classList.add("hidden");
    }
}

function updateTimeDisplayLabel() {
    if (settings.mode === "time") {
        timeDisplay.innerText = settings.duration + "s";
        timeDisplay.setAttribute("aria-label", `Time remaining: ${settings.duration} seconds`);
    } else {
        timeDisplay.innerText = settings.wordCount + "w";
        timeDisplay.setAttribute("aria-label", `Target words: ${settings.wordCount}`);
    }
}

function loadParagraph() {
    // Select current text based on settings
    currentText = getActiveText();
    if (!currentText || currentText.trim().length === 0) {
        currentText = text;
    }
    renderText(currentText);
}

function renderText(content) {
    const chars = content.split("");
    textDisplay.innerHTML = "";
    wordBoundaries = [];
    let wordIndex = 0;
    let wordStart = null;

    chars.forEach((char, index) => {
        const span = document.createElement("span");
        span.innerText = char;

        // Track word boundaries (split on space)
        if (char === " ") {
            span.dataset.wordIndex = -1;
            if (wordStart !== null) {
                wordBoundaries[wordIndex] = { start: wordStart, end: index - 1 };
                wordIndex++;
                wordStart = null;
            }
        } else {
            span.dataset.wordIndex = wordIndex;
            if (wordStart === null) {
                wordStart = index;
            }
        }

        if (index === 0) span.classList.add("char-active");
        textDisplay.appendChild(span);
    });

    // Close final word if string didn't end with space
    if (wordStart !== null) {
        wordBoundaries[wordIndex] = { start: wordStart, end: chars.length - 1 };
    }
}

function getWordIndexAtChar(index) {
    if (!wordBoundaries || wordBoundaries.length === 0) return -1;
    for (let i = 0; i < wordBoundaries.length; i++) {
        const b = wordBoundaries[i];
        if (!b) continue;
        if (index >= b.start && index <= b.end) return i;
    }
    return -1;
}

function updateWordHighlight(wordIdx) {
    if (wordIdx === undefined || wordIdx === null || wordIdx < 0) return;
    const boundary = wordBoundaries[wordIdx];
    if (!boundary) return;
    const spans = textDisplay.querySelectorAll(`span[data-word-index="${wordIdx}"]`);
    if (!spans || spans.length === 0) return;

    const hasIncorrect = Array.from(spans).some((span) =>
        span.classList.contains("char-incorrect")
    );

    const wordTyped = charIndex > boundary.end;

    spans.forEach((span) => {
        span.classList.remove("word-correct", "word-incorrect");
        if (hasIncorrect) {
            span.classList.add("word-incorrect");
        } else if (wordTyped) {
            span.classList.add("word-correct");
        }
    });
}

function initTyping() {
    const chars = textDisplay.querySelectorAll("span");
    let typedVal = inputField.value;
    const affectedWords = new Set();
    
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

            const wordIdx = parseInt(chars[charIndex].dataset.wordIndex, 10);
            if (wordIdx >= 0) affectedWords.add(wordIdx);

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

             const wordIdx = parseInt(chars[charIndex].dataset.wordIndex, 10);
             if (wordIdx >= 0) affectedWords.add(wordIdx);
        }
        // Set new active at current index
        if (charIndex < chars.length) {
            chars[charIndex].classList.add("char-active");
        }
    }

    // Update word highlighting for affected words
    affectedWords.forEach(updateWordHighlight);
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeDisplay.innerText = timeLeft + "s";
        timeDisplay.setAttribute("aria-label", `Time remaining: ${timeLeft} seconds`);
        updateProgressBar();
        
        // Live WPM update
        const timeElapsed = maxTime - timeLeft;
        let wpm = Math.round(((charIndex - mistakes) / 5) / (timeElapsed / 60));
        wpm = (wpm < 0 || !wpm || wpm === Infinity) ? 0 : wpm;
        wpmDisplay.innerText = wpm;
        wpmDisplay.setAttribute("aria-label", `Words per minute: ${wpm}`);
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

    // Deplete progress on completion
    setProgress(0);

    // Save Result
    saveResult(wpm, accuracy, mistakes);

    // Show results
    resultsOverlay.classList.remove("hidden");
    resultsOverlay.setAttribute("aria-hidden", "false");
    // Trigger fade in
    requestAnimationFrame(() => {
        resultsOverlay.classList.remove("opacity-0");
        resultsOverlay.querySelector("#results-content").classList.remove("scale-95");
        resultsOverlay.querySelector("#results-content").classList.add("scale-100");
    });
}

function resetGame() {
    // Prevent rapid restarts - ensure timer is cleared first
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    loadParagraph();
    maxTime = settings.duration || 60;
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
    updateTimeDisplayLabel();
    setProgress(100);
    
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
    historyOverlay.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
        historyOverlay.classList.remove("opacity-0");
        historyModalContent.classList.remove("scale-95");
        historyModalContent.classList.add("scale-100");
    });
}

function closeHistory() {
    historyOverlay.classList.add("opacity-0");
    historyOverlay.setAttribute("aria-hidden", "true");
    historyModalContent.classList.remove("scale-100");
    historyModalContent.classList.add("scale-95");
    
    setTimeout(() => {
        historyOverlay.classList.add("hidden");
    }, 300);
}

function openSettings() {
    if (!settingsOverlay) return;
    settingsOverlay.classList.remove("hidden");
    settingsOverlay.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
        settingsOverlay.classList.remove("opacity-0");
        if (settingsModalContent) settingsModalContent.classList.remove("scale-95");
        if (settingsModalContent) settingsModalContent.classList.add("scale-100");
    });
}

function closeSettings() {
    if (!settingsOverlay) return;
    settingsOverlay.classList.add("opacity-0");
    settingsOverlay.setAttribute("aria-hidden", "true");
    if (settingsModalContent) {
        settingsModalContent.classList.remove("scale-100");
        settingsModalContent.classList.add("scale-95");
    }
    setTimeout(() => {
        settingsOverlay.classList.add("hidden");
    }, 300);
}

function closeResults() {
    resultsOverlay.classList.add("opacity-0");
    resultsOverlay.setAttribute("aria-hidden", "true");
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

// Progress helpers
function setProgress(percent) {
    if (!progressBar || !progressTrack) return;
    const clamped = Math.max(0, Math.min(100, percent));
    progressBar.style.width = clamped + "%";
    progressTrack.setAttribute("aria-valuenow", clamped.toString());
}

function updateProgressBar() {
    if (maxTime <= 0) return;
    const percent = (timeLeft / maxTime) * 100;
    setProgress(percent);
}

// Virtual keyboard rendering + highlighting
function normalizeKeyLabel(key) {
    if (key === " ") return "SPACE";
    if (key.length === 1) return key.toUpperCase();
    const map = {
        Enter: "ENTER",
        Backspace: "BACKSPACE",
        Tab: "TAB",
        Spacebar: "SPACE",
    };
    return map[key] || key.toUpperCase();
}

function renderKeyboard() {
    if (!virtualKeyboard) return;
    const layout = [
        ["1","2","3","4","5","6","7","8","9","0","-","="],
        ["Q","W","E","R","T","Y","U","I","O","P"],
        ["A","S","D","F","G","H","J","K","L",";"],
        ["Z","X","C","V","B","N","M",",",".","/"],
        ["SPACE","BACKSPACE","ENTER"]
    ];

    virtualKeyboard.innerHTML = "";
    keyElements = new Map();

    layout.forEach(rowKeys => {
        const row = document.createElement("div");
        row.className = "kb-row";

        rowKeys.forEach(keyLabel => {
            const keyButton = document.createElement("button");
            keyButton.type = "button";
            keyButton.className = "kb-key";
            keyButton.setAttribute("aria-hidden", "true");
            keyButton.tabIndex = -1;

            const normalized = normalizeKeyLabel(keyLabel);

            // Display label
            if (normalized === "SPACE") {
                keyButton.textContent = "Space";
                keyButton.classList.add("key-space");
            } else if (normalized === "BACKSPACE" || normalized === "ENTER") {
                keyButton.textContent = normalized.charAt(0) + normalized.slice(1).toLowerCase();
                keyButton.classList.add("key-wide");
            } else {
                keyButton.textContent = keyLabel;
            }

            keyElements.set(normalized, keyButton);
            row.appendChild(keyButton);
        });

        virtualKeyboard.appendChild(row);
    });
}

function highlightKey(key) {
    const normalized = normalizeKeyLabel(key);
    const el = keyElements.get(normalized);
    if (!el) return;
    el.classList.add("key-active");
}

function clearKey(key) {
    const normalized = normalizeKeyLabel(key);
    const el = keyElements.get(normalized);
    if (!el) return;
    el.classList.remove("key-active");
}

function clearAllKeys() {
    keyElements.forEach(el => el.classList.remove("key-active"));
}

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

// Virtual keyboard highlight events
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!virtualKeyboard) return;
    // Ignore when overlays are open
    if (!historyOverlay.classList.contains("hidden")) return;
    if (!resultsOverlay.classList.contains("hidden")) return;
    highlightKey(e.key === " " ? "SPACE" : e.key);
});

document.addEventListener("keyup", (e) => {
    if (!virtualKeyboard) return;
    clearKey(e.key === " " ? "SPACE" : e.key);
});

window.addEventListener("blur", clearAllKeys);

// Settings events
function applySettings() {
    if (modeSelect) settings.mode = modeSelect.value;
    if (timeSelect) settings.duration = parseInt(timeSelect.value, 10) || 60;
    if (wordsSelect) settings.wordCount = parseInt(wordsSelect.value, 10) || 50;
    if (textSourceSelect) settings.textSource = textSourceSelect.value;
    if (customTextarea) settings.customText = customTextarea.value || "";

    updateModeVisibility();
    closeSettings();
    resetGame();
}

if (settingsBtn) settingsBtn.addEventListener("click", openSettings);
if (closeSettingsBtn) closeSettingsBtn.addEventListener("click", closeSettings);
if (settingsOverlay) {
    settingsOverlay.addEventListener("click", (e) => {
        if (e.target === settingsOverlay) closeSettings();
    });
}
if (modeSelect) {
    modeSelect.addEventListener("change", () => {
        settings.mode = modeSelect.value;
        updateModeVisibility();
    });
}
if (textSourceSelect) {
    textSourceSelect.addEventListener("change", () => {
        settings.textSource = textSourceSelect.value;
        updateModeVisibility();
    });
}
if (randomizeTextBtn) {
    randomizeTextBtn.addEventListener("click", () => {
        settings.textSource = "random";
        if (textSourceSelect) textSourceSelect.value = "random";
        updateModeVisibility();
        resetGame();
    });
}
if (applySettingsBtn) applySettingsBtn.addEventListener("click", applySettings);

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
        // Close settings if open
        else if (!settingsOverlay.classList.contains("hidden")) {
            closeSettings();
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
updateModeVisibility();
loadParagraph();
setProgress(100);
updateTimeDisplayLabel();
renderKeyboard();