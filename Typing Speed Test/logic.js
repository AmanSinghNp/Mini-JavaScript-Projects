/**
 * Pure helper functions for typing test logic.
 * These are used by lightweight Node tests.
 */

function clampPercent(percent) {
    if (Number.isNaN(percent) || !Number.isFinite(percent)) return 0;
    return Math.max(0, Math.min(100, percent));
}

function calculateProgress(timeLeft, maxTime) {
    if (maxTime <= 0) return 0;
    const percent = (timeLeft / maxTime) * 100;
    return clampPercent(percent);
}

function calculateWPM(charsTyped, mistakes, timeElapsedSeconds) {
    const netChars = Math.max(0, charsTyped - mistakes);
    const timeMinutes = Math.max(timeElapsedSeconds / 60, 1 / 60); // avoid div by zero
    const wpm = Math.round((netChars / 5) / timeMinutes);
    if (wpm < 0 || !Number.isFinite(wpm)) return 0;
    return wpm;
}

function calculateAccuracy(charsTyped, mistakes) {
    if (charsTyped <= 0) return 0;
    const acc = Math.round(((charsTyped - mistakes) / charsTyped) * 100);
    if (Number.isNaN(acc) || !Number.isFinite(acc)) return 0;
    return clampPercent(acc);
}

/**
 * Evaluate word highlight state based on char statuses.
 * @param {Array<'correct'|'incorrect'|'pending'>} charStates - states for each character in the word
 * @param {{start:number,end:number}} boundary - word boundary in the full text
 * @param {number} currentCharIndex - current cursor position (global charIndex)
 * @returns {'correct'|'incorrect'|'neutral'}
 */
function evaluateWordHighlight(charStates, boundary, currentCharIndex) {
    if (!charStates || charStates.length === 0 || !boundary) return 'neutral';
    if (charStates.some((s) => s === 'incorrect')) return 'incorrect';
    const wordTyped = currentCharIndex > boundary.end;
    if (wordTyped) return 'correct';
    return 'neutral';
}

module.exports = {
    clampPercent,
    calculateProgress,
    calculateWPM,
    calculateAccuracy,
    evaluateWordHighlight,
};


