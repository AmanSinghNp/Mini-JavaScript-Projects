
// Math helpers
export const lerp = (start, end, t) => {
    return start * (1 - t) + end * t;
};

export const clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max);
};
