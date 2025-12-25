const assert = require('assert');
const {
    clampPercent,
    calculateProgress,
    calculateWPM,
    calculateAccuracy,
    evaluateWordHighlight,
} = require('../logic');

// clampPercent
assert.strictEqual(clampPercent(120), 100, 'clamp upper bound');
assert.strictEqual(clampPercent(-10), 0, 'clamp lower bound');
assert.strictEqual(clampPercent(55.5), 55.5, 'allow mid values');

// calculateProgress
assert.strictEqual(calculateProgress(60, 60), 100, 'full progress');
assert.strictEqual(calculateProgress(30, 60), 50, 'half progress');
assert.strictEqual(calculateProgress(0, 60), 0, 'depleted progress');
assert.strictEqual(calculateProgress(10, 0), 0, 'no max time safe');

// calculateWPM
assert.strictEqual(calculateWPM(25, 0, 60), 5, 'basic net WPM');
assert.strictEqual(calculateWPM(25, 5, 60), 4, 'with mistakes');
assert.strictEqual(calculateWPM(0, 0, 0), 0, 'zero time safe');

// calculateAccuracy
assert.strictEqual(calculateAccuracy(10, 0), 100, 'perfect accuracy');
assert.strictEqual(calculateAccuracy(10, 2), 80, 'with mistakes');
assert.strictEqual(calculateAccuracy(0, 0), 0, 'no chars safe');

// evaluateWordHighlight
const boundary = { start: 0, end: 4 };
assert.strictEqual(
    evaluateWordHighlight(['incorrect', 'correct'], boundary, 5),
    'incorrect',
    'any incorrect marks word incorrect'
);
assert.strictEqual(
    evaluateWordHighlight(['correct', 'correct'], boundary, 5),
    'correct',
    'fully typed correct word'
);
assert.strictEqual(
    evaluateWordHighlight(['correct', 'correct'], boundary, 3),
    'neutral',
    'partial typed correct word stays neutral'
);

console.log('All typing logic tests passed.');

