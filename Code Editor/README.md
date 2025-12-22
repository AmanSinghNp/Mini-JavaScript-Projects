# Code Editor (Mini VS Code)

A high-performance code editor built with Vanilla JavaScript, featuring advanced data structures and modern editor capabilities.

## Features

### Core Architecture

- **Piece Table Data Structure**: Efficient text management avoiding string immutability performance issues
- **Virtual Scrolling**: Only renders visible lines for optimal performance with large files
- **Web Worker Syntax Highlighting**: Tokenization runs in a background thread to keep the main thread responsive
- **Multiple Cursor Support**: Add multiple cursors with Alt+Click, all keyboard events broadcast to all cursors

### Design

- **Apple/Xcode-inspired Interface**: Minimalist design with perfect typography
- **Unified Title Bar**: 52px height, blends seamlessly into the window
- **SF Mono Typography**: Perfect vertical rhythm and line-height
- **Pastel Syntax Highlighting**: Vibrant but low-contrast colors on deep midnight blue background
- **Elegant Gutter**: Soft divider with muted line numbers

## Usage

Simply open `index.html` in a modern browser. The editor will initialize with sample JavaScript code.

### Keyboard Shortcuts

- **Arrow Keys**: Navigate cursor
- **Ctrl/Cmd + Arrow**: Word navigation
- **Home/End**: Move to start/end of line
- **Alt + Click**: Add secondary cursor
- **Escape**: Remove all secondary cursors
- **Tab**: Insert 2 spaces

### Multiple Cursors

1. Click normally to set primary cursor
2. Hold Alt and click to add additional cursors
3. All keyboard input and navigation affects all cursors simultaneously
4. Press Escape to return to single cursor mode

## Architecture

### Piece Table

The Piece Table data structure efficiently manages text by maintaining:
- Original buffer (initial text)
- Add buffer (insertions)
- Piece chain (references to buffer segments)

This avoids the performance penalty of string immutability in JavaScript.

### Virtual Scrolling

Only visible lines (plus a buffer) are rendered in the DOM. As you scroll, lines are dynamically added/removed, ensuring smooth performance even with files containing thousands of lines.

### Syntax Highlighting

Syntax highlighting runs in a Web Worker to prevent blocking the main thread. The worker uses regex-based tokenization for:
- JavaScript
- HTML
- CSS

The system is extensible - new languages can be easily added to `worker.js`.

## File Structure

```
Code Editor/
├── index.html      # Main HTML structure
├── style.css       # Apple/Xcode-inspired styling
├── script.js       # Core editor logic
├── worker.js       # Syntax highlighting worker
└── README.md       # This file
```

## Browser Support

Requires modern browser with support for:
- ES6+ JavaScript
- Web Workers
- CSS Grid/Flexbox

## Performance

Optimized for:
- Large files (10,000+ lines)
- Rapid typing
- Smooth scrolling
- Responsive UI

## Future Enhancements

Potential additions:
- Undo/Redo system
- Find/Replace functionality
- File operations (open/save)
- Tab support for multiple files
- More language support
- Custom themes



