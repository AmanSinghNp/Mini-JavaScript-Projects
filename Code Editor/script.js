/**
 * Code Editor - Main Implementation
 * High-performance code editor with Piece Table, Virtual Scrolling, and Multi-cursor support
 */

// ============================================================================
// Piece Table Data Structure
// ============================================================================

class PieceTable {
  constructor(initialText = '') {
    this.originalBuffer = initialText;
    this.addBuffer = '';
    this.pieces = [];
    
    if (initialText) {
      this.pieces.push({
        start: 0,
        length: initialText.length,
        buffer: 'original'
      });
    }
    
    this.lineCache = null;
    this.lineCountCache = null;
  }

  /**
   * Insert text at the given offset
   */
  insert(offset, text) {
    if (text.length === 0) return;
    
    // Invalidate caches
    this.lineCache = null;
    this.lineCountCache = null;
    
    const addBufferStart = this.addBuffer.length;
    this.addBuffer += text;
    
    if (this.pieces.length === 0) {
      this.pieces.push({
        start: addBufferStart,
        length: text.length,
        buffer: 'add'
      });
      return;
    }
    
    // Find the piece containing the offset
    let currentOffset = 0;
    let pieceIndex = 0;
    
    for (let i = 0; i < this.pieces.length; i++) {
      const piece = this.pieces[i];
      const pieceEnd = currentOffset + piece.length;
      
      if (offset >= currentOffset && offset <= pieceEnd) {
        pieceIndex = i;
        break;
      }
      
      currentOffset = pieceEnd;
    }
    
    const piece = this.pieces[pieceIndex];
    const relativeOffset = offset - currentOffset;
    
    // Split the piece if needed
    if (relativeOffset > 0 && relativeOffset < piece.length) {
      // Split into two pieces
      const leftPiece = {
        start: piece.start,
        length: relativeOffset,
        buffer: piece.buffer
      };
      
      const rightPiece = {
        start: piece.start + relativeOffset,
        length: piece.length - relativeOffset,
        buffer: piece.buffer
      };
      
      // Insert new piece between left and right
      this.pieces.splice(pieceIndex, 1, leftPiece, {
        start: addBufferStart,
        length: text.length,
        buffer: 'add'
      }, rightPiece);
    } else if (relativeOffset === 0) {
      // Insert at the beginning of the piece
      this.pieces.splice(pieceIndex, 0, {
        start: addBufferStart,
        length: text.length,
        buffer: 'add'
      });
    } else {
      // Insert at the end of the piece
      this.pieces.splice(pieceIndex + 1, 0, {
        start: addBufferStart,
        length: text.length,
        buffer: 'add'
      });
    }
    
    // Merge adjacent pieces from the same buffer
    this.mergePieces();
  }

  /**
   * Delete text from offset with given length
   */
  delete(offset, length) {
    if (length === 0) return;
    
    // Invalidate caches
    this.lineCache = null;
    this.lineCountCache = null;
    
    let currentOffset = 0;
    let deleteEnd = offset + length;
    
    for (let i = 0; i < this.pieces.length; i++) {
      const piece = this.pieces[i];
      const pieceStart = currentOffset;
      const pieceEnd = currentOffset + piece.length;
      
      if (deleteEnd <= pieceStart) break;
      if (offset >= pieceEnd) {
        currentOffset = pieceEnd;
        continue;
      }
      
      // Calculate intersection
      const deleteStart = Math.max(offset, pieceStart);
      const deleteEndInPiece = Math.min(deleteEnd, pieceEnd);
      const deleteLength = deleteEndInPiece - deleteStart;
      
      if (deleteLength >= piece.length) {
        // Remove entire piece
        this.pieces.splice(i, 1);
        i--;
      } else {
        // Partial deletion
        const relativeStart = deleteStart - pieceStart;
        
        if (relativeStart === 0) {
          // Delete from beginning
          piece.start += deleteLength;
          piece.length -= deleteLength;
        } else if (relativeStart + deleteLength >= piece.length) {
          // Delete from end
          piece.length -= deleteLength;
        } else {
          // Delete from middle - split piece
          const leftPiece = {
            start: piece.start,
            length: relativeStart,
            buffer: piece.buffer
          };
          
          const rightPiece = {
            start: piece.start + relativeStart + deleteLength,
            length: piece.length - relativeStart - deleteLength,
            buffer: piece.buffer
          };
          
          this.pieces.splice(i, 1, leftPiece, rightPiece);
          i++;
        }
      }
      
      currentOffset = pieceEnd;
    }
    
    // Merge adjacent pieces
    this.mergePieces();
  }

  /**
   * Merge adjacent pieces from the same buffer
   */
  mergePieces() {
    for (let i = 0; i < this.pieces.length - 1; i++) {
      const current = this.pieces[i];
      const next = this.pieces[i + 1];
      
      if (current.buffer === next.buffer &&
          current.start + current.length === next.start) {
        current.length += next.length;
        this.pieces.splice(i + 1, 1);
        i--;
      }
    }
  }

  /**
   * Get text from start to end offset
   */
  getText(start = 0, end = null) {
    if (end === null) {
      end = this.getLength();
    }
    
    let result = '';
    let currentOffset = 0;
    
    for (const piece of this.pieces) {
      const pieceStart = currentOffset;
      const pieceEnd = currentOffset + piece.length;
      
      if (pieceEnd <= start) {
        currentOffset = pieceEnd;
        continue;
      }
      
      if (pieceStart >= end) break;
      
      const readStart = Math.max(0, start - pieceStart);
      const readEnd = Math.min(piece.length, end - pieceStart);
      const readLength = readEnd - readStart;
      
      const buffer = piece.buffer === 'original' ? this.originalBuffer : this.addBuffer;
      result += buffer.substring(piece.start + readStart, piece.start + readStart + readLength);
      
      currentOffset = pieceEnd;
    }
    
    return result;
  }

  /**
   * Get total length of text
   */
  getLength() {
    return this.pieces.reduce((sum, piece) => sum + piece.length, 0);
  }

  /**
   * Get a specific line (0-indexed)
   */
  getLine(lineNumber) {
    if (this.lineCache === null) {
      this.buildLineCache();
    }
    
    if (lineNumber < 0 || lineNumber >= this.lineCache.length) {
      return '';
    }
    
    return this.lineCache[lineNumber];
  }

  /**
   * Get total line count
   */
  getLineCount() {
    if (this.lineCountCache === null) {
      const text = this.getText();
      this.lineCountCache = text.split('\n').length;
    }
    return this.lineCountCache;
  }

  /**
   * Build line cache for fast line access
   */
  buildLineCache() {
    const text = this.getText();
    this.lineCache = text.split('\n');
  }

  /**
   * Convert offset to line and column
   */
  offsetToLineCol(offset) {
    const text = this.getText(0, offset);
    const lines = text.split('\n');
    const line = lines.length - 1;
    const col = lines[lines.length - 1].length;
    return { line, col };
  }

  /**
   * Convert line and column to offset
   */
  lineColToOffset(line, col) {
    if (this.lineCache === null) {
      this.buildLineCache();
    }
    
    let offset = 0;
    for (let i = 0; i < line && i < this.lineCache.length; i++) {
      offset += this.lineCache[i].length + 1; // +1 for newline
    }
    
    const lineText = this.getLine(line);
    offset += Math.min(col, lineText.length);
    
    return offset;
  }

  /**
   * Get all text (for initial load)
   */
  getAllText() {
    return this.getText();
  }

  /**
   * Set initial text
   */
  setText(text) {
    this.originalBuffer = text;
    this.addBuffer = '';
    this.pieces = [];
    if (text) {
      this.pieces.push({
        start: 0,
        length: text.length,
        buffer: 'original'
      });
    }
    this.lineCache = null;
    this.lineCountCache = null;
  }
}

// ============================================================================
// Virtual Scrolling
// ============================================================================

class VirtualScroller {
  constructor(container, lineHeight = 21) {
    this.container = container;
    this.linesContainer = container.querySelector('#editor-lines');
    // Gutter is a sibling, access via parent
    this.gutterContainer = container.parentElement.querySelector('#editor-gutter');
    this.lineHeight = lineHeight;
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.bufferLines = 50;
    this.renderedLines = new Map();
    this.wordWrap = false;
    this.charWidth = 8.4; // Approximate character width
    this.wrappedLines = new Map(); // Cache of wrapped line segments
  }
  
  /**
   * Set word wrap mode
   */
  setWordWrap(enabled) {
    this.wordWrap = enabled;
    this.wrappedLines.clear();
    this.renderedLines.clear();
  }
  
  /**
   * Get viewport width in characters
   */
  getViewportWidth() {
    const padding = 32; // Left + right padding
    return Math.floor((this.container.clientWidth - padding) / this.charWidth);
  }
  
  /**
   * Wrap a line into segments based on viewport width
   */
  wrapLine(lineText, lineNumber) {
    if (!this.wordWrap) {
      return [{ text: lineText, startCol: 0, endCol: lineText.length, isWrapped: false }];
    }
    
    const viewportWidth = this.getViewportWidth();
    if (lineText.length <= viewportWidth) {
      return [{ text: lineText, startCol: 0, endCol: lineText.length, isWrapped: false }];
    }
    
    const segments = [];
    let currentPos = 0;
    let segmentIndex = 0;
    
    while (currentPos < lineText.length) {
      const remaining = lineText.length - currentPos;
      let segmentLength = Math.min(viewportWidth, remaining);
      
      // Try to break at word boundary if not at end
      if (currentPos + segmentLength < lineText.length && segmentLength === viewportWidth) {
        // Look for last space or tab before the break point
        const breakPoint = lineText.lastIndexOf(' ', currentPos + segmentLength - 1);
        const tabPoint = lineText.lastIndexOf('\t', currentPos + segmentLength - 1);
        const actualBreak = Math.max(breakPoint, tabPoint);
        
        if (actualBreak > currentPos) {
          segmentLength = actualBreak - currentPos + 1;
        }
      }
      
      segments.push({
        text: lineText.substring(currentPos, currentPos + segmentLength),
        startCol: currentPos,
        endCol: currentPos + segmentLength,
        isWrapped: segmentIndex > 0,
        lineNumber: lineNumber,
        segmentIndex: segmentIndex
      });
      
      currentPos += segmentLength;
      segmentIndex++;
    }
    
    return segments;
  }
  
  /**
   * Get total wrapped line count
   */
  getWrappedLineCount(pieceTable) {
    if (!this.wordWrap) {
      return pieceTable.getLineCount();
    }
    
    let totalWrapped = 0;
    const lineCount = pieceTable.getLineCount();
    
    for (let i = 0; i < lineCount; i++) {
      const lineText = pieceTable.getLine(i);
      const wrapped = this.wrapLine(lineText, i);
      totalWrapped += wrapped.length;
    }
    
    return totalWrapped;
  }
  
  /**
   * Convert logical line/col to wrapped line/col
   */
  logicalToWrapped(logicalLine, logicalCol, pieceTable) {
    if (!this.wordWrap) {
      return { wrappedLine: logicalLine, wrappedCol: logicalCol, segmentIndex: 0 };
    }
    
    let wrappedLine = 0;
    
    // Count wrapped lines up to logical line
    for (let i = 0; i < logicalLine; i++) {
      const lineText = pieceTable.getLine(i);
      const wrapped = this.wrapLine(lineText, i);
      wrappedLine += wrapped.length;
    }
    
    // Find which segment of the logical line contains the column
    const lineText = pieceTable.getLine(logicalLine);
    const wrapped = this.wrapLine(lineText, logicalLine);
    
    for (let i = 0; i < wrapped.length; i++) {
      if (logicalCol >= wrapped[i].startCol && logicalCol <= wrapped[i].endCol) {
        return {
          wrappedLine: wrappedLine + i,
          wrappedCol: logicalCol - wrapped[i].startCol,
          segmentIndex: i
        };
      }
    }
    
    // If column is beyond line, return last segment
    const lastSegment = wrapped[wrapped.length - 1];
    return {
      wrappedLine: wrappedLine + wrapped.length - 1,
      wrappedCol: lastSegment.text.length,
      segmentIndex: wrapped.length - 1
    };
  }
  
  /**
   * Convert wrapped line/col to logical line/col
   */
  wrappedToLogical(wrappedLine, wrappedCol, pieceTable) {
    if (!this.wordWrap) {
      return { logicalLine: wrappedLine, logicalCol: wrappedCol };
    }
    
    let currentWrapped = 0;
    const lineCount = pieceTable.getLineCount();
    
    for (let i = 0; i < lineCount; i++) {
      const lineText = pieceTable.getLine(i);
      const wrapped = this.wrapLine(lineText, i);
      
      if (wrappedLine >= currentWrapped && wrappedLine < currentWrapped + wrapped.length) {
        const segmentIndex = wrappedLine - currentWrapped;
        const segment = wrapped[segmentIndex];
        return {
          logicalLine: i,
          logicalCol: segment.startCol + wrappedCol
        };
      }
      
      currentWrapped += wrapped.length;
    }
    
    // Fallback to last line
    return {
      logicalLine: lineCount - 1,
      logicalCol: pieceTable.getLine(lineCount - 1).length
    };
  }

  /**
   * Update visible range based on scroll position
   */
  updateVisibleRange(totalLines, pieceTable) {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    if (this.wordWrap) {
      // For wrapped lines, we need to calculate based on wrapped line count
      const wrappedLineCount = this.getWrappedLineCount(pieceTable);
      const startLine = Math.floor(scrollTop / this.lineHeight);
      const endLine = Math.ceil((scrollTop + containerHeight) / this.lineHeight);
      
      this.visibleStart = Math.max(0, startLine - this.bufferLines);
      this.visibleEnd = Math.min(wrappedLineCount, endLine + this.bufferLines);
    } else {
      const startLine = Math.floor(scrollTop / this.lineHeight);
      const endLine = Math.ceil((scrollTop + containerHeight) / this.lineHeight);
      
      this.visibleStart = Math.max(0, startLine - this.bufferLines);
      this.visibleEnd = Math.min(totalLines, endLine + this.bufferLines);
    }
    
    return { start: this.visibleStart, end: this.visibleEnd };
  }

  /**
   * Render visible lines
   */
  renderVisibleLines(pieceTable, tokensMap = new Map()) {
    const totalLines = pieceTable.getLineCount();
    const range = this.updateVisibleRange(totalLines, pieceTable);
    
    // Remove lines outside visible range
    for (const [lineNum, element] of this.renderedLines.entries()) {
      if (lineNum < range.start || lineNum >= range.end) {
        element.remove();
        this.renderedLines.delete(lineNum);
      }
    }
    
    if (this.wordWrap) {
      this.renderWrappedLines(range, pieceTable, tokensMap);
    } else {
      // Render new visible lines (non-wrapped)
      for (let lineNum = range.start; lineNum < range.end; lineNum++) {
        if (lineNum >= totalLines) break;
        
        if (!this.renderedLines.has(lineNum)) {
          const lineElement = this.createLineElement(lineNum, pieceTable, tokensMap);
          this.renderedLines.set(lineNum, lineElement);
          this.insertLineElement(lineElement, lineNum);
        } else {
          // Update existing line if tokens changed
          const tokens = tokensMap.get(lineNum);
          if (tokens) {
            this.updateLineElement(this.renderedLines.get(lineNum), lineNum, pieceTable, tokens);
          }
        }
      }
    }
    
    // Update gutter
    this.updateGutter(range, totalLines, pieceTable);
    
    // Update container height for scrolling
    const totalHeight = this.wordWrap 
      ? this.getWrappedLineCount(pieceTable) * this.lineHeight
      : totalLines * this.lineHeight;
    this.linesContainer.style.height = `${totalHeight}px`;
  }
  
  /**
   * Render wrapped lines
   */
  renderWrappedLines(range, pieceTable, tokensMap) {
    const totalLines = pieceTable.getLineCount();
    let wrappedLineIndex = 0;
    
    // Iterate through logical lines and render wrapped segments
    for (let logicalLine = 0; logicalLine < totalLines; logicalLine++) {
      const lineText = pieceTable.getLine(logicalLine);
      const wrapped = this.wrapLine(lineText, logicalLine);
      
      for (let segmentIndex = 0; segmentIndex < wrapped.length; segmentIndex++) {
        const segment = wrapped[segmentIndex];
        
        if (wrappedLineIndex >= range.start && wrappedLineIndex < range.end) {
          const lineKey = `${logicalLine}-${segmentIndex}`;
          
          // Remove old element if it exists
          if (this.renderedLines.has(lineKey)) {
            this.renderedLines.get(lineKey).remove();
            this.renderedLines.delete(lineKey);
          }
          
          const lineElement = this.createWrappedLineElement(
            logicalLine, 
            segment,
            wrappedLineIndex,
            pieceTable, 
            tokensMap
          );
          this.renderedLines.set(lineKey, lineElement);
          this.insertLineElement(lineElement, wrappedLineIndex);
        }
        
        wrappedLineIndex++;
      }
    }
  }
  
  /**
   * Create wrapped line element
   */
  createWrappedLineElement(logicalLine, segment, wrappedLineIndex, pieceTable, tokensMap) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'editor-line';
    if (segment.isWrapped) {
      lineDiv.classList.add('wrapped-line');
    }
    lineDiv.style.position = 'absolute';
    lineDiv.style.top = `${wrappedLineIndex * this.lineHeight}px`;
    lineDiv.style.height = `${this.lineHeight}px`;
    lineDiv.dataset.logicalLine = logicalLine;
    lineDiv.dataset.segmentIndex = segment.segmentIndex;
    
    // Get tokens for this segment
    const tokens = tokensMap.get(logicalLine);
    const segmentText = segment.text;
    
    if (tokens && tokens.length > 0) {
      // Filter tokens that are within this segment
      const segmentTokens = tokens.filter(token => 
        token.start < segment.endCol && token.end > segment.startCol
      );
      
      // Adjust token positions relative to segment start
      const adjustedTokens = segmentTokens.map(token => {
        const tokenStart = Math.max(segment.startCol, token.start);
        const tokenEnd = Math.min(segment.endCol, token.end);
        const tokenValue = pieceTable.getLine(logicalLine).substring(tokenStart, tokenEnd);
        return {
          ...token,
          value: tokenValue,
          start: tokenStart - segment.startCol,
          end: tokenEnd - segment.startCol
        };
      });
      
      this.renderTokens(lineDiv, adjustedTokens);
    } else {
      lineDiv.textContent = segmentText;
    }
    
    return lineDiv;
  }

  /**
   * Create a line element
   */
  createLineElement(lineNum, pieceTable, tokensMap) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'editor-line';
    lineDiv.style.position = 'absolute';
    lineDiv.style.top = `${lineNum * this.lineHeight}px`;
    lineDiv.style.height = `${this.lineHeight}px`;
    lineDiv.dataset.lineNumber = lineNum;
    
    const lineText = pieceTable.getLine(lineNum);
    const tokens = tokensMap.get(lineNum);
    
    if (tokens && tokens.length > 0) {
      this.renderTokens(lineDiv, tokens);
    } else {
      lineDiv.textContent = lineText;
    }
    
    return lineDiv;
  }

  /**
   * Update existing line element with new tokens
   */
  updateLineElement(lineElement, lineNum, pieceTable, tokens) {
    lineElement.textContent = '';
    this.renderTokens(lineElement, tokens);
  }

  /**
   * Render tokens with syntax highlighting
   */
  renderTokens(container, tokens) {
    for (const token of tokens) {
      const span = document.createElement('span');
      span.className = `token token-${token.type}`;
      span.textContent = token.value;
      container.appendChild(span);
    }
  }

  /**
   * Insert line element in correct position
   */
  insertLineElement(element, lineNum) {
    let inserted = false;
    for (const [existingLineNum, existingElement] of this.renderedLines.entries()) {
      if (existingLineNum > lineNum) {
        this.linesContainer.insertBefore(element, existingElement);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.linesContainer.appendChild(element);
    }
  }

  /**
   * Update gutter with line numbers
   */
  updateGutter(range, totalLines, pieceTable) {
    this.gutterContainer.innerHTML = '';
    
    if (this.wordWrap) {
      // For wrapped lines, show line numbers only on first segment
      let wrappedLineIndex = 0;
      for (let logicalLine = 0; logicalLine < totalLines; logicalLine++) {
        const lineText = pieceTable.getLine(logicalLine);
        const wrapped = this.wrapLine(lineText, logicalLine);
        
        for (let segmentIndex = 0; segmentIndex < wrapped.length; segmentIndex++) {
          if (wrappedLineIndex >= range.start && wrappedLineIndex < range.end) {
            const gutterLine = document.createElement('div');
            gutterLine.className = 'gutter-line';
            if (segmentIndex === 0) {
              gutterLine.textContent = (logicalLine + 1).toString();
              // Add fold indicator if line is foldable
              const lineText = pieceTable.getLine(logicalLine);
              if (this.isFoldable(lineText)) {
                const foldIndicator = document.createElement('span');
                foldIndicator.className = 'fold-indicator';
                foldIndicator.textContent = '▶';
                foldIndicator.dataset.line = logicalLine;
                gutterLine.appendChild(foldIndicator);
              }
            } else {
              // Show wrap indicator for wrapped segments
              gutterLine.className = 'gutter-line gutter-wrap';
              gutterLine.textContent = '↪';
            }
            gutterLine.style.position = 'absolute';
            gutterLine.style.top = `${wrappedLineIndex * this.lineHeight}px`;
            gutterLine.style.height = `${this.lineHeight}px`;
            this.gutterContainer.appendChild(gutterLine);
          }
          wrappedLineIndex++;
        }
      }
      
      const wrappedLineCount = this.getWrappedLineCount(pieceTable);
      this.gutterContainer.style.height = `${wrappedLineCount * this.lineHeight}px`;
    } else {
      for (let lineNum = range.start; lineNum < range.end; lineNum++) {
        if (lineNum >= totalLines) break;
        const gutterLine = document.createElement('div');
        gutterLine.className = 'gutter-line';
        gutterLine.style.position = 'absolute';
        gutterLine.style.top = `${lineNum * this.lineHeight}px`;
        gutterLine.style.height = `${this.lineHeight}px`;
        gutterLine.textContent = (lineNum + 1).toString();
        
        // Add fold indicator if line is foldable
        const lineText = pieceTable.getLine(lineNum);
        if (this.editor && this.editor.isFoldable && this.editor.isFoldable(lineText)) {
          const foldIndicator = document.createElement('span');
          foldIndicator.className = 'fold-indicator';
          foldIndicator.textContent = this.editor.foldedLines && this.editor.foldedLines.has(lineNum) ? '▼' : '▶';
          foldIndicator.dataset.line = lineNum;
          foldIndicator.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.editor && this.editor.toggleFoldAtLine) {
              this.editor.toggleFoldAtLine(lineNum);
            }
          });
          gutterLine.appendChild(foldIndicator);
        }
        
        this.gutterContainer.appendChild(gutterLine);
      }
      
      this.gutterContainer.style.height = `${totalLines * this.lineHeight}px`;
    }
  }

  /**
   * Scroll to a specific line
   */
  scrollToLine(lineNumber, pieceTable) {
    if (this.wordWrap) {
      // Convert logical line to wrapped line position
      const wrapped = this.logicalToWrapped(lineNumber, 0, pieceTable);
      const scrollTop = wrapped.wrappedLine * this.lineHeight;
      this.container.scrollTop = scrollTop;
    } else {
      const scrollTop = lineNumber * this.lineHeight;
      this.container.scrollTop = scrollTop;
    }
  }

  /**
   * Get visible range
   */
  getVisibleRange() {
    return { start: this.visibleStart, end: this.visibleEnd };
  }

  /**
   * Clear all rendered lines
   */
  clear() {
    this.linesContainer.innerHTML = '';
    this.gutterContainer.innerHTML = '';
    this.renderedLines.clear();
  }
}

// ============================================================================
// Cursor Manager
// ============================================================================

class CursorManager {
  constructor() {
    this.cursors = [{ line: 0, col: 0 }]; // Primary cursor
    this.selections = []; // Array of { start: {line, col}, end: {line, col} }
  }

  /**
   * Add a new cursor
   */
  addCursor(line, col) {
    // Check if cursor already exists at this position
    const exists = this.cursors.some(c => c.line === line && c.col === col);
    if (!exists) {
      this.cursors.push({ line, col });
      this.sortCursors();
    }
  }

  /**
   * Remove cursor at index (cannot remove primary cursor if it's the only one)
   */
  removeCursor(index) {
    if (this.cursors.length > 1 && index > 0) {
      this.cursors.splice(index, 1);
    }
  }

  /**
   * Remove all cursors except primary
   */
  removeSecondaryCursors() {
    this.cursors = [this.cursors[0]];
    this.selections = [];
  }

  /**
   * Sort cursors by position
   */
  sortCursors() {
    this.cursors.sort((a, b) => {
      if (a.line !== b.line) return a.line - b.line;
      return a.col - b.col;
    });
  }

  /**
   * Get primary cursor
   */
  getPrimaryCursor() {
    return this.cursors[0];
  }

  /**
   * Get all cursors
   */
  getAllCursors() {
    return this.cursors;
  }

  /**
   * Move cursor
   */
  moveCursor(index, direction, amount = 1, maxLine = Infinity, maxCols = []) {
    if (index >= this.cursors.length) return;
    
    const cursor = this.cursors[index];
    
    switch (direction) {
      case 'left':
        if (cursor.col > 0) {
          cursor.col = Math.max(0, cursor.col - amount);
        } else if (cursor.line > 0) {
          cursor.line--;
          cursor.col = maxCols[cursor.line] || 0;
        }
        break;
      case 'right':
        const maxCol = maxCols[cursor.line] || 0;
        if (cursor.col < maxCol) {
          cursor.col = Math.min(maxCol, cursor.col + amount);
        } else if (cursor.line < maxLine - 1) {
          cursor.line++;
          cursor.col = 0;
        }
        break;
      case 'up':
        if (cursor.line > 0) {
          cursor.line = Math.max(0, cursor.line - amount);
          cursor.col = Math.min(cursor.col, maxCols[cursor.line] || 0);
        }
        break;
      case 'down':
        if (cursor.line < maxLine - 1) {
          cursor.line = Math.min(maxLine - 1, cursor.line + amount);
          cursor.col = Math.min(cursor.col, maxCols[cursor.line] || 0);
        }
        break;
      case 'home':
        cursor.col = 0;
        break;
      case 'end':
        cursor.col = maxCols[cursor.line] || 0;
        break;
    }
  }

  /**
   * Move all cursors
   */
  moveAllCursors(direction, amount = 1, maxLine = Infinity, maxCols = []) {
    for (let i = 0; i < this.cursors.length; i++) {
      this.moveCursor(i, direction, amount, maxLine, maxCols);
    }
  }

  /**
   * Set cursor position
   */
  setCursor(index, line, col) {
    if (index < this.cursors.length) {
      this.cursors[index].line = line;
      this.cursors[index].col = col;
    }
  }

  /**
   * Set primary cursor
   */
  setPrimaryCursor(line, col) {
    this.cursors[0] = { line, col };
  }
}

// ============================================================================
// Selection Manager
// ============================================================================

class SelectionManager {
  constructor() {
    this.selections = []; // Array of { start: {line, col}, end: {line, col}, anchor: {line, col} }
    this.isSelecting = false;
    this.selectionAnchor = null;
  }

  /**
   * Start a new selection
   */
  startSelection(line, col) {
    this.selectionAnchor = { line, col };
    this.isSelecting = true;
    // Clear existing selections
    this.selections = [{
      start: { line, col },
      end: { line, col },
      anchor: { line, col }
    }];
  }

  /**
   * Extend selection to new position
   */
  extendSelection(line, col) {
    if (!this.selectionAnchor) {
      this.startSelection(line, col);
      return;
    }

    const anchor = this.selectionAnchor;
    const start = this.normalizePosition(anchor, { line, col });
    const end = this.normalizePosition({ line, col }, anchor);

    if (this.selections.length === 0) {
      this.selections = [{
        start,
        end,
        anchor
      }];
    } else {
      this.selections[0] = { start, end, anchor };
    }
  }

  /**
   * Normalize two positions to start/end
   */
  normalizePosition(pos1, pos2) {
    if (pos1.line < pos2.line) return pos1;
    if (pos1.line > pos2.line) return pos2;
    return pos1.col <= pos2.col ? pos1 : pos2;
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selections = [];
    this.isSelecting = false;
    this.selectionAnchor = null;
  }

  /**
   * Get all selections
   */
  getSelections() {
    return this.selections;
  }

  /**
   * Check if there are any selections
   */
  hasSelection() {
    return this.selections.length > 0 && this.selections.some(sel => 
      sel.start.line !== sel.end.line || sel.start.col !== sel.end.col
    );
  }

  /**
   * Get selected text from piece table
   */
  getSelectedText(pieceTable) {
    if (!this.hasSelection()) return '';

    const texts = [];
    for (const sel of this.selections) {
      if (sel.start.line === sel.end.line && sel.start.col === sel.end.col) {
        continue; // Empty selection
      }

      const startOffset = pieceTable.lineColToOffset(sel.start.line, sel.start.col);
      const endOffset = pieceTable.lineColToOffset(sel.end.line, sel.end.col);
      const text = pieceTable.getText(startOffset, endOffset);
      texts.push(text);
    }

    return texts.join('\n');
  }

  /**
   * Add selection for a cursor
   */
  addSelectionForCursor(cursor, pieceTable) {
    // If cursor has a selection, add it
    // For now, we'll use the cursor position as both start and end
    // This can be extended later for cursor-based selections
    this.selections.push({
      start: { line: cursor.line, col: cursor.col },
      end: { line: cursor.line, col: cursor.col },
      anchor: { line: cursor.line, col: cursor.col }
    });
  }

  /**
   * Get selection ranges as offsets
   */
  getSelectionRanges(pieceTable) {
    const ranges = [];
    for (const sel of this.selections) {
      if (sel.start.line === sel.end.line && sel.start.col === sel.end.col) {
        continue;
      }
      ranges.push({
        start: pieceTable.lineColToOffset(sel.start.line, sel.start.col),
        end: pieceTable.lineColToOffset(sel.end.line, sel.end.col),
        startPos: sel.start,
        endPos: sel.end
      });
    }
    return ranges;
  }

  /**
   * Finish selection (stop selecting mode)
   */
  finishSelection() {
    this.isSelecting = false;
    // Keep selections but stop tracking anchor for extension
  }
}

// ============================================================================
// Find/Replace Manager
// ============================================================================

class FindReplaceManager {
  constructor(editor) {
    this.editor = editor;
    this.matches = [];
    this.currentMatchIndex = -1;
    this.searchText = '';
    this.replaceText = '';
    this.caseSensitive = false;
    this.wholeWord = false;
    this.useRegex = false;
    this.isVisible = false;
    this.isReplaceMode = false;
    
    this.setupUI();
  }

  setupUI() {
    this.findBar = document.getElementById('find-replace-bar');
    this.findInput = document.getElementById('find-input');
    this.replaceInput = document.getElementById('replace-input');
    this.replaceSection = document.getElementById('replace-section');
    this.findPrevBtn = document.getElementById('find-prev');
    this.findNextBtn = document.getElementById('find-next');
    this.replaceBtn = document.getElementById('replace-btn');
    this.replaceAllBtn = document.getElementById('replace-all-btn');
    this.findCloseBtn = document.getElementById('find-close');
    this.findMatches = document.getElementById('find-matches');
    this.caseSensitiveCheck = document.getElementById('find-case-sensitive');
    this.wholeWordCheck = document.getElementById('find-whole-word');
    this.regexCheck = document.getElementById('find-regex');
    
    // Event listeners
    this.findInput.addEventListener('input', () => this.onFindInput());
    this.findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.findNext();
      } else if (e.key === 'Escape') {
        this.hide();
      }
    });
    
    this.replaceInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });
    
    this.findPrevBtn.addEventListener('click', () => this.findPrevious());
    this.findNextBtn.addEventListener('click', () => this.findNext());
    this.replaceBtn.addEventListener('click', () => this.replace());
    this.replaceAllBtn.addEventListener('click', () => this.replaceAll());
    this.findCloseBtn.addEventListener('click', () => this.hide());
    
    this.caseSensitiveCheck.addEventListener('change', () => {
      this.caseSensitive = this.caseSensitiveCheck.checked;
      this.onFindInput();
    });
    
    this.wholeWordCheck.addEventListener('change', () => {
      this.wholeWord = this.wholeWordCheck.checked;
      this.onFindInput();
    });
    
    this.regexCheck.addEventListener('change', () => {
      this.useRegex = this.regexCheck.checked;
      this.onFindInput();
    });
  }

  show(replaceMode = false) {
    this.isVisible = true;
    this.isReplaceMode = replaceMode;
    this.findBar.style.display = 'block';
    this.replaceSection.style.display = replaceMode ? 'flex' : 'none';
    this.findInput.focus();
    this.findInput.select();
    
    if (this.searchText) {
      this.onFindInput();
    }
  }

  hide() {
    this.isVisible = false;
    this.findBar.style.display = 'none';
    this.matches = [];
    this.currentMatchIndex = -1;
    this.editor.selectionManager.clearSelection();
    this.editor.updateSelections();
    this.editor.editorContent.focus();
  }

  onFindInput() {
    this.searchText = this.findInput.value;
    if (this.searchText.length === 0) {
      this.matches = [];
      this.currentMatchIndex = -1;
      this.findMatches.textContent = '';
      this.editor.selectionManager.clearSelection();
      this.editor.updateSelections();
      return;
    }
    
    this.findAllMatches();
    this.currentMatchIndex = this.matches.length > 0 ? 0 : -1;
    this.highlightMatch();
    this.updateMatchCounter();
  }

  findAllMatches() {
    this.matches = [];
    const text = this.editor.pieceTable.getAllText();
    
    if (this.useRegex) {
      try {
        const flags = this.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(this.searchText, flags);
        let match;
        while ((match = regex.exec(text)) !== null) {
          this.matches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0]
          });
        }
      } catch (e) {
        // Invalid regex
        this.matches = [];
      }
    } else {
      let searchText = this.searchText;
      if (!this.caseSensitive) {
        searchText = searchText.toLowerCase();
      }
      
      let searchRegex;
      if (this.wholeWord) {
        searchRegex = new RegExp(`\\b${this.escapeRegex(searchText)}\\b`, this.caseSensitive ? 'g' : 'gi');
      } else {
        searchRegex = new RegExp(this.escapeRegex(searchText), this.caseSensitive ? 'g' : 'gi');
      }
      
      let match;
      const textToSearch = this.caseSensitive ? text : text.toLowerCase();
      while ((match = searchRegex.exec(text)) !== null) {
        this.matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }
    }
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  highlightMatch() {
    if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.matches.length) {
      this.editor.selectionManager.clearSelection();
      this.editor.updateSelections();
      return;
    }
    
    const match = this.matches[this.currentMatchIndex];
    const startPos = this.editor.pieceTable.offsetToLineCol(match.start);
    const endPos = this.editor.pieceTable.offsetToLineCol(match.end);
    
    this.editor.selectionManager.startSelection(startPos.line, startPos.col);
    this.editor.selectionManager.extendSelection(endPos.line, endPos.col);
    this.editor.cursorManager.setPrimaryCursor(endPos.line, endPos.col);
    
    // Scroll to match
    this.editor.virtualScroller.scrollToLine(startPos.line, this.editor.pieceTable);
    
    this.editor.updateSelections();
    this.editor.updateCursors();
    this.updateMatchCounter();
  }

  findNext() {
    if (this.matches.length === 0) {
      this.onFindInput();
      return;
    }
    
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
    this.highlightMatch();
  }

  findPrevious() {
    if (this.matches.length === 0) {
      this.onFindInput();
      return;
    }
    
    this.currentMatchIndex = this.currentMatchIndex <= 0 
      ? this.matches.length - 1 
      : this.currentMatchIndex - 1;
    this.highlightMatch();
  }

  replace() {
    if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.matches.length) {
      return;
    }
    
    const match = this.matches[this.currentMatchIndex];
    const startPos = this.editor.pieceTable.offsetToLineCol(match.start);
    const endPos = this.editor.pieceTable.offsetToLineCol(match.end);
    
    // Delete selected text
    this.editor.pieceTable.delete(match.start, match.end - match.start);
    
    // Insert replacement
    this.replaceText = this.replaceInput.value;
    this.editor.pieceTable.insert(match.start, this.replaceText);
    
    // Update cursor
    const newCol = startPos.col + this.replaceText.length;
    this.editor.cursorManager.setPrimaryCursor(startPos.line, newCol);
    
    // Re-find matches
    this.onFindInput();
  }

  replaceAll() {
    if (this.matches.length === 0) {
      return;
    }
    
    this.replaceText = this.replaceInput.value;
    
    // Sort matches by offset (reverse order for safe deletion)
    const sortedMatches = [...this.matches].sort((a, b) => b.start - a.start);
    
    for (const match of sortedMatches) {
      this.editor.pieceTable.delete(match.start, match.end - match.start);
      this.editor.pieceTable.insert(match.start, this.replaceText);
    }
    
    // Clear selection and refresh
    this.editor.selectionManager.clearSelection();
    this.editor.requestTokenization();
    this.editor.render();
    this.hide();
  }

  updateMatchCounter() {
    if (this.matches.length === 0) {
      this.findMatches.textContent = '';
    } else {
      this.findMatches.textContent = `${this.currentMatchIndex + 1} of ${this.matches.length}`;
    }
  }
}

// ============================================================================
// Bracket Matcher
// ============================================================================

class BracketMatcher {
  constructor() {
    this.bracketPairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`'
    };
    this.openingBrackets = new Set(Object.keys(this.bracketPairs));
    this.closingBrackets = new Set(Object.values(this.bracketPairs));
  }

  /**
   * Find matching bracket position
   */
  findMatchingBracket(pieceTable, line, col) {
    const lineText = pieceTable.getLine(line);
    if (col >= lineText.length) return null;
    
    const char = lineText[col];
    let isOpening = this.openingBrackets.has(char);
    let isClosing = this.closingBrackets.has(char);
    
    if (!isOpening && !isClosing) return null;
    
    const targetBracket = isOpening ? this.bracketPairs[char] : 
      Object.keys(this.bracketPairs).find(k => this.bracketPairs[k] === char);
    
    if (!targetBracket) return null;
    
    const direction = isOpening ? 1 : -1;
    let depth = 1;
    let currentLine = line;
    let currentCol = col + direction;
    
    while (currentLine >= 0 && currentLine < pieceTable.getLineCount()) {
      const currentLineText = pieceTable.getLine(currentLine);
      
      while (currentCol >= 0 && currentCol < currentLineText.length) {
        const currentChar = currentLineText[currentCol];
        
        // Skip strings and comments
        if (this.isInString(currentLineText, currentCol) || 
            this.isInComment(currentLineText, currentCol)) {
          currentCol += direction;
          continue;
        }
        
        if (currentChar === char) {
          depth++;
        } else if (currentChar === targetBracket) {
          depth--;
          if (depth === 0) {
            return { line: currentLine, col: currentCol };
          }
        }
        
        currentCol += direction;
      }
      
      // Move to next/previous line
      currentLine += direction;
      if (currentLine >= 0 && currentLine < pieceTable.getLineCount()) {
        currentCol = direction > 0 ? 0 : pieceTable.getLine(currentLine).length - 1;
      }
    }
    
    return null; // No matching bracket found
  }

  isInString(lineText, col) {
    // Simple check - look for unescaped quotes before this position
    let inString = false;
    let quoteChar = null;
    for (let i = 0; i < col; i++) {
      if (lineText[i] === '\\' && inString) {
        i++; // Skip escaped character
        continue;
      }
      if ((lineText[i] === '"' || lineText[i] === "'" || lineText[i] === '`') && 
          (quoteChar === null || lineText[i] === quoteChar)) {
        inString = !inString;
        quoteChar = inString ? lineText[i] : null;
      }
    }
    return inString;
  }

  isInComment(lineText, col) {
    // Check if position is in a comment
    const beforeCol = lineText.substring(0, col);
    return beforeCol.includes('//') || 
           (beforeCol.lastIndexOf('/*') > beforeCol.lastIndexOf('*/'));
  }

  /**
   * Get bracket at cursor position
   */
  getBracketAtCursor(pieceTable, line, col) {
    const lineText = pieceTable.getLine(line);
    if (col < lineText.length) {
      const char = lineText[col];
      if (this.openingBrackets.has(char) || this.closingBrackets.has(char)) {
        return char;
      }
    }
    // Check character before cursor
    if (col > 0) {
      const char = lineText[col - 1];
      if (this.openingBrackets.has(char) || this.closingBrackets.has(char)) {
        return char;
      }
    }
    return null;
  }
}

// ============================================================================
// History Manager (Undo/Redo)
// ============================================================================

class HistoryManager {
  constructor(maxSize = 1000) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = maxSize;
    this.isUndoing = false;
    this.isRedoing = false;
  }

  /**
   * Push an operation to the undo stack
   */
  pushOperation(operation) {
    if (this.isUndoing || this.isRedoing) {
      return; // Don't record operations during undo/redo
    }
    
    this.undoStack.push(operation);
    
    // Limit stack size
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
    
    // Clear redo stack when new operation is pushed
    this.redoStack = [];
  }

  /**
   * Undo the last operation
   */
  undo() {
    if (this.undoStack.length === 0) {
      return null;
    }
    
    this.isUndoing = true;
    const operation = this.undoStack.pop();
    this.redoStack.push(operation);
    this.isUndoing = false;
    
    return operation;
  }

  /**
   * Redo the last undone operation
   */
  redo() {
    if (this.redoStack.length === 0) {
      return null;
    }
    
    this.isRedoing = true;
    const operation = this.redoStack.pop();
    this.undoStack.push(operation);
    this.isRedoing = false;
    
    return operation;
  }

  /**
   * Check if undo is possible
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Create an insert operation
   */
  createInsertOperation(offset, text, cursorPositions) {
    return {
      type: 'insert',
      offset,
      text,
      cursorPositions: cursorPositions.map(c => ({ ...c })),
      undo: (pieceTable, cursorManager) => {
        // Undo insert = delete
        pieceTable.delete(offset, text.length);
        cursorManager.cursors = cursorPositions.map(c => ({ ...c }));
      },
      redo: (pieceTable, cursorManager) => {
        // Redo insert = insert again
        pieceTable.insert(offset, text);
        cursorManager.cursors = cursorPositions.map(c => ({ ...c }));
      }
    };
  }

  /**
   * Create a delete operation
   */
  createDeleteOperation(offset, length, deletedText, cursorPositions) {
    return {
      type: 'delete',
      offset,
      length,
      deletedText,
      cursorPositions: cursorPositions.map(c => ({ ...c })),
      undo: (pieceTable, cursorManager) => {
        // Undo delete = insert
        pieceTable.insert(offset, deletedText);
        cursorManager.cursors = cursorPositions.map(c => ({ ...c }));
      },
      redo: (pieceTable, cursorManager) => {
        // Redo delete = delete again
        pieceTable.delete(offset, length);
        cursorManager.cursors = cursorPositions.map(c => ({ ...c }));
      }
    };
  }
}

// ============================================================================
// Main Code Editor Class
// ============================================================================

class CodeEditor {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      language: options.language || 'javascript',
      lineHeight: options.lineHeight || 21,
      ...options
    };
    
    // Core components
    this.pieceTable = new PieceTable(options.initialText || '');
    this.cursorManager = new CursorManager();
    this.selectionManager = new SelectionManager();
    this.historyManager = new HistoryManager();
    this.virtualScroller = new VirtualScroller(
      container.querySelector('#editor-content'),
      this.options.lineHeight
    );
    this.findReplaceManager = new FindReplaceManager(this);
    this.bracketMatcher = new BracketMatcher();
    
    // Syntax highlighting
    this.syntaxWorker = new Worker('worker.js');
    this.tokensMap = new Map();
    this.tokenizationQueue = new Set();
    this.tokenizationDebounce = null;
    
    // State
    this.language = this.options.language;
    this.isFocused = false;
    this.wordWrap = false;
    this.currentFilePath = null;
    this.isModified = false;
    this.tabs = [];
    this.activeTabId = null;
    this.autocompleteVisible = false;
    this.autocompleteSuggestions = [];
    this.autocompleteSelectedIndex = 0;
    this.diagnostics = [];
    this.errorPanelVisible = false;
    this.autoSave = false;
    this.formatOnSave = false;
    this.currentTheme = 'dark';
    
    // DOM elements
    this.editorContent = container.querySelector('#editor-content');
    this.editorLines = container.querySelector('#editor-lines');
    this.cursorsContainer = container.querySelector('#editor-cursors');
    this.selectionsContainer = container.querySelector('#editor-selections');
    this.bracketMatchesContainer = container.querySelector('#editor-bracket-matches');
    this.fileNameElement = container.querySelector('.file-name');
    
    // Text measurement for accurate cursor positioning
    this.textMeasurer = this.createTextMeasurer();
    
    this.init();
  }

  /**
   * Create a hidden element for measuring text width
   * Uses exact same font settings as the editor
   */
  createTextMeasurer() {
    const measurer = document.createElement('span');
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre;
      font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
      font-size: 14px;
      line-height: 21px;
      padding: 0;
      margin: 0;
      font-variant-ligatures: none;
      font-feature-settings: normal;
    `;
    document.body.appendChild(measurer);
    return measurer;
  }

  /**
   * Measure text width accurately
   */
  measureText(text) {
    this.textMeasurer.textContent = text;
    return this.textMeasurer.offsetWidth;
  }

  /**
   * Get character width (for monospace fonts, all chars should be same width)
   */
  getCharWidth() {
    if (!this._charWidth) {
      this._charWidth = this.measureText('M'); // Use 'M' as reference for monospace
    }
    return this._charWidth;
  }

  init() {
    this.setupEventListeners();
    this.setupSyntaxWorker();
    this.setupTitleEditing();
    this.setupWindowControls();
    this.render();
  }

  setupWindowControls() {
    const closeBtn = this.container.querySelector('.window-control.close');
    const minimizeBtn = this.container.querySelector('.window-control.minimize');
    const maximizeBtn = this.container.querySelector('.window-control.maximize');
    
    // Close button - show confirmation and close/reload
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to close the editor? Any unsaved changes will be lost.')) {
          // Try to close the window (works if opened via window.open)
          if (window.opener) {
            window.close();
          } else {
            // If can't close, reload the page
            window.location.reload();
          }
        }
      });
    }
    
    // Minimize button - toggle editor visibility
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        const editorWrapper = this.container.querySelector('.editor-wrapper');
        if (editorWrapper) {
          if (editorWrapper.style.display === 'none') {
            editorWrapper.style.display = 'flex';
            minimizeBtn.title = 'Minimize';
          } else {
            editorWrapper.style.display = 'none';
            minimizeBtn.title = 'Restore';
          }
        }
      });
    }
    
    // Maximize button - toggle fullscreen
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
          // Enter fullscreen
          const container = this.container;
          if (container.requestFullscreen) {
            container.requestFullscreen();
          } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
          } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
          } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
          }
          maximizeBtn.title = 'Exit Fullscreen';
        } else {
          // Exit fullscreen
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
          maximizeBtn.title = 'Maximize';
        }
      });
      
      // Update button state when fullscreen changes
      document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
          maximizeBtn.title = 'Exit Fullscreen';
        } else {
          maximizeBtn.title = 'Maximize';
        }
      });
      
      document.addEventListener('webkitfullscreenchange', () => {
        if (document.webkitFullscreenElement) {
          maximizeBtn.title = 'Exit Fullscreen';
        } else {
          maximizeBtn.title = 'Maximize';
        }
      });
    }
  }

  setupTitleEditing() {
    // Make file name editable on double-click
    this.fileNameElement.addEventListener('dblclick', () => {
      this.editFileName();
    });
    
    // Also allow Enter key when focused
    this.fileNameElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.finishEditingFileName();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.cancelEditingFileName();
      }
    });
  }

  editFileName() {
    const currentName = this.fileNameElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'file-name-input';
    input.style.cssText = `
      background: transparent;
      border: 1px solid #3a3a4a;
      color: #d4d4d4;
      font-family: inherit;
      font-size: inherit;
      padding: 2px 8px;
      border-radius: 4px;
      outline: none;
      width: 200px;
      text-align: center;
    `;
    
    this.fileNameElement.textContent = '';
    this.fileNameElement.appendChild(input);
    input.focus();
    input.select();
    
    // Store original value for cancel
    this.originalFileName = currentName;
    this.fileNameInput = input;
    
    // Finish on blur
    input.addEventListener('blur', () => {
      this.finishEditingFileName();
    });
  }

  finishEditingFileName() {
    if (this.fileNameInput) {
      const newName = this.fileNameInput.value.trim() || 'Untitled';
      this.fileNameElement.textContent = newName;
      this.fileNameElement.removeChild(this.fileNameInput);
      this.fileNameInput = null;
      this.originalFileName = null;
      
      // Update page title
      document.title = `${newName} - Code Editor`;
    }
  }

  cancelEditingFileName() {
    if (this.fileNameInput) {
      this.fileNameElement.textContent = this.originalFileName || 'Untitled';
      this.fileNameElement.removeChild(this.fileNameInput);
      this.fileNameInput = null;
      this.originalFileName = null;
    }
  }

  setFileName(name) {
    this.fileNameElement.textContent = name;
    document.title = `${name} - Code Editor`;
  }

  setupEventListeners() {
    // Focus
    this.editorContent.addEventListener('focus', () => {
      this.isFocused = true;
      this.updateCursors();
    });
    
    this.editorContent.addEventListener('blur', () => {
      this.isFocused = false;
    });
    
    // Keyboard events
    this.editorContent.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.editorContent.addEventListener('keypress', (e) => this.handleKeyPress(e));
    this.editorContent.addEventListener('input', (e) => this.handleInput(e));
    
    // Mouse events
    this.editorContent.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.editorContent.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.editorContent.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.editorContent.addEventListener('click', (e) => this.handleClick(e));
    
    // Prevent text selection on double/triple click
    this.editorContent.addEventListener('selectstart', (e) => {
      if (!this.selectionManager.isSelecting) {
        e.preventDefault();
      }
    });
    
    // Scroll
    this.editorContent.addEventListener('scroll', () => {
      this.render();
    });
    
    // Prevent default behaviors
    this.editorContent.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Tab: Unindent
          this.unindentLine();
        } else {
          // Tab: Indent
          this.indentLine();
        }
      }
    });
  }

  setupSyntaxWorker() {
    try {
      this.syntaxWorker.onmessage = (e) => {
        try {
          const { tokens, lineStart, lineEnd, error } = e.data;
          
          if (error) {
            console.warn('Syntax highlighting error:', error);
            return;
          }
          
          for (let lineNum = lineStart; lineNum <= lineEnd; lineNum++) {
            if (tokens[lineNum - lineStart]) {
              this.tokensMap.set(lineNum, tokens[lineNum - lineStart]);
            }
          }
          
          this.tokenizationQueue.delete(`${lineStart}-${lineEnd}`);
          this.render();
        } catch (err) {
          console.error('Error processing syntax worker message:', err);
        }
      };
      
      this.syntaxWorker.onerror = (error) => {
        console.error('Syntax worker error:', error);
      };
    } catch (err) {
      console.error('Failed to setup syntax worker:', err);
    }
  }

  handleKeyDown(e) {
    const cursors = this.cursorManager.getAllCursors();
    const lineCount = this.pieceTable.getLineCount();
    const maxCols = this.getMaxCols();
    
    // Handle navigation
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const primaryCursor = this.cursorManager.getPrimaryCursor();
        if (e.shiftKey) {
          // Extend selection
          if (!this.selectionManager.selectionAnchor) {
            this.selectionManager.startSelection(primaryCursor.line, primaryCursor.col);
          }
          if (e.ctrlKey || e.metaKey) {
            this.cursorManager.moveAllCursors('left', 5, lineCount, maxCols);
          } else {
            this.cursorManager.moveAllCursors('left', 1, lineCount, maxCols);
          }
          const newCursor = this.cursorManager.getPrimaryCursor();
          this.selectionManager.extendSelection(newCursor.line, newCursor.col);
          this.updateSelections();
        } else {
          // Clear selection and move cursor
          this.selectionManager.clearSelection();
          if (e.ctrlKey || e.metaKey) {
            this.cursorManager.moveAllCursors('left', 5, lineCount, maxCols);
          } else {
            this.cursorManager.moveAllCursors('left', 1, lineCount, maxCols);
          }
          this.updateSelections();
        }
        this.updateCursors();
        this.updateStatusBar();
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        const primaryCursor2 = this.cursorManager.getPrimaryCursor();
        if (e.shiftKey) {
          // Extend selection
          if (!this.selectionManager.selectionAnchor) {
            this.selectionManager.startSelection(primaryCursor2.line, primaryCursor2.col);
          }
          if (e.ctrlKey || e.metaKey) {
            this.cursorManager.moveAllCursors('right', 5, lineCount, maxCols);
          } else {
            this.cursorManager.moveAllCursors('right', 1, lineCount, maxCols);
          }
          const newCursor2 = this.cursorManager.getPrimaryCursor();
          this.selectionManager.extendSelection(newCursor2.line, newCursor2.col);
          this.updateSelections();
        } else {
          // Clear selection and move cursor
          this.selectionManager.clearSelection();
          if (e.ctrlKey || e.metaKey) {
            this.cursorManager.moveAllCursors('right', 5, lineCount, maxCols);
          } else {
            this.cursorManager.moveAllCursors('right', 1, lineCount, maxCols);
          }
          this.updateSelections();
        }
        this.updateCursors();
        this.updateStatusBar();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        const primaryCursor3 = this.cursorManager.getPrimaryCursor();
        if (e.shiftKey) {
          // Extend selection
          if (!this.selectionManager.selectionAnchor) {
            this.selectionManager.startSelection(primaryCursor3.line, primaryCursor3.col);
          }
          this.cursorManager.moveAllCursors('up', 1, lineCount, maxCols);
          const newCursor3 = this.cursorManager.getPrimaryCursor();
          this.selectionManager.extendSelection(newCursor3.line, newCursor3.col);
          this.updateSelections();
        } else {
          // Clear selection and move cursor
          this.selectionManager.clearSelection();
          this.cursorManager.moveAllCursors('up', 1, lineCount, maxCols);
          this.updateSelections();
        }
        this.updateCursors();
        this.updateStatusBar();
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        const primaryCursor4 = this.cursorManager.getPrimaryCursor();
        if (e.shiftKey) {
          // Extend selection
          if (!this.selectionManager.selectionAnchor) {
            this.selectionManager.startSelection(primaryCursor4.line, primaryCursor4.col);
          }
          this.cursorManager.moveAllCursors('down', 1, lineCount, maxCols);
          const newCursor4 = this.cursorManager.getPrimaryCursor();
          this.selectionManager.extendSelection(newCursor4.line, newCursor4.col);
          this.updateSelections();
        } else {
          // Clear selection and move cursor
          this.selectionManager.clearSelection();
          this.cursorManager.moveAllCursors('down', 1, lineCount, maxCols);
          this.updateSelections();
        }
        this.updateCursors();
        this.updateStatusBar();
        break;
        
      case 'Home':
        e.preventDefault();
        this.cursorManager.moveAllCursors('home', 1, lineCount, maxCols);
        this.updateCursors();
        this.updateStatusBar();
        break;
        
      case 'End':
        e.preventDefault();
        this.cursorManager.moveAllCursors('end', 1, lineCount, maxCols);
        this.updateCursors();
        this.updateStatusBar();
        break;
        
      case 'Backspace':
        e.preventDefault();
        this.handleBackspace();
        break;
        
      case 'Delete':
        e.preventDefault();
        this.handleDelete();
        break;
        
      case 'Enter':
        e.preventDefault();
        this.insertTextWithIndent();
        break;
        
      case 'Escape':
        if (this.cursorManager.cursors.length > 1) {
          this.cursorManager.removeSecondaryCursors();
          this.updateCursors();
        }
        this.selectionManager.clearSelection();
        this.updateSelections();
        break;
        
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.shiftKey) {
            // Redo (Ctrl+Shift+Z or Cmd+Shift+Z)
            this.performRedo();
          } else {
            // Undo (Ctrl+Z or Cmd+Z)
            this.performUndo();
          }
        }
        break;
        
      case 'y':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Redo (Ctrl+Y or Cmd+Y) - alternative to Ctrl+Shift+Z
          this.performRedo();
        }
        break;
        
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Select all
          this.selectAll();
        }
        break;
        
      case 'c':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Copy
          this.copy();
        }
        break;
        
      case 'v':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Paste
          this.paste();
        }
        break;
        
      case 'x':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Cut
          this.cut();
        }
        break;
        
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.shiftKey) {
            // Duplicate selection
            this.duplicateSelection();
          } else {
            // Duplicate line
            this.duplicateLine();
          }
        }
        break;
        
      case 'l':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Select line
          this.selectCurrentLine();
        }
        break;
        
      case '/':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          // Toggle comment
          this.toggleComment();
        }
        break;
        
      case 'k':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (this.findReplaceManager.isVisible) {
            // If find bar is open, handle comment shortcuts
            // This would require additional logic, simplified for now
          }
        }
        break;
    }
  }
  
  selectAll() {
    const lineCount = this.pieceTable.getLineCount();
    if (lineCount === 0) return;
    
    const lastLine = this.pieceTable.getLine(lineCount - 1);
    this.selectionManager.startSelection(0, 0);
    this.selectionManager.extendSelection(lineCount - 1, lastLine.length);
    this.cursorManager.setPrimaryCursor(lineCount - 1, lastLine.length);
    this.updateSelections();
    this.updateCursors();
    this.updateStatusBar();
  }
  
  async copy() {
    let text = '';
    if (this.selectionManager.hasSelection()) {
      text = this.selectionManager.getSelectedText(this.pieceTable);
    } else {
      // Copy current line if no selection
      const cursor = this.cursorManager.getPrimaryCursor();
      text = this.pieceTable.getLine(cursor.line);
    }
    
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        // Fallback for older browsers
        this.fallbackCopyText(text);
      }
    }
  }
  
  async cut() {
    if (this.selectionManager.hasSelection()) {
      const text = this.selectionManager.getSelectedText(this.pieceTable);
      if (text) {
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          this.fallbackCopyText(text);
        }
        
        // Delete selected text
        const ranges = this.selectionManager.getSelectionRanges(this.pieceTable);
        for (let i = ranges.length - 1; i >= 0; i--) {
          const range = ranges[i];
          this.pieceTable.delete(range.start, range.end - range.start);
        }
        
        this.selectionManager.clearSelection();
        this.requestTokenization();
        this.render();
      }
    }
  }
  
  async paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (this.selectionManager.hasSelection()) {
          // Replace selection
          const ranges = this.selectionManager.getSelectionRanges(this.pieceTable);
          for (let i = ranges.length - 1; i >= 0; i--) {
            const range = ranges[i];
            this.pieceTable.delete(range.start, range.end - range.start);
            this.pieceTable.insert(range.start, text);
          }
          this.selectionManager.clearSelection();
        } else {
          // Insert at cursor
          this.insertText(text);
        }
        this.requestTokenization();
        this.render();
      }
    } catch (err) {
      // Fallback or permission denied
      console.warn('Paste failed:', err);
    }
  }
  
  fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.warn('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  }
  
  duplicateLine() {
    const cursor = this.cursorManager.getPrimaryCursor();
    const lineText = this.pieceTable.getLine(cursor.line);
    const offset = this.pieceTable.lineColToOffset(cursor.line + 1, 0);
    this.pieceTable.insert(offset, lineText + '\n');
    this.requestTokenization();
    this.render();
  }
  
  duplicateSelection() {
    if (this.selectionManager.hasSelection()) {
      const text = this.selectionManager.getSelectedText(this.pieceTable);
      const cursor = this.cursorManager.getPrimaryCursor();
      const offset = this.pieceTable.lineColToOffset(cursor.line, cursor.col);
      this.insertText(text);
    }
  }
  
  selectCurrentLine() {
    const cursor = this.cursorManager.getPrimaryCursor();
    this.selectLine(cursor.line);
  }
  
  indentLine() {
    const cursor = this.cursorManager.getPrimaryCursor();
    const lineText = this.pieceTable.getLine(cursor.line);
    const offset = this.pieceTable.lineColToOffset(cursor.line, 0);
    
    // Insert 2 spaces at the beginning
    this.pieceTable.insert(offset, '  ');
    cursor.col += 2;
    
    this.requestTokenization();
    this.render();
  }
  
  unindentLine() {
    const cursor = this.cursorManager.getPrimaryCursor();
    const lineText = this.pieceTable.getLine(cursor.line);
    const offset = this.pieceTable.lineColToOffset(cursor.line, 0);
    
    // Remove up to 2 spaces
    if (lineText.startsWith('  ')) {
      this.pieceTable.delete(offset, 2);
      cursor.col = Math.max(0, cursor.col - 2);
    } else if (lineText.startsWith(' ')) {
      this.pieceTable.delete(offset, 1);
      cursor.col = Math.max(0, cursor.col - 1);
    }
    
    this.requestTokenization();
    this.render();
  }

  toggleComment() {
    // Simple comment toggle for JavaScript
    if (this.language === 'javascript') {
      const cursor = this.cursorManager.getPrimaryCursor();
      const lineText = this.pieceTable.getLine(cursor.line);
      const offset = this.pieceTable.lineColToOffset(cursor.line, 0);
      
      if (lineText.trim().startsWith('//')) {
        // Uncomment
        const uncommented = lineText.replace(/^\s*\/\//, '');
        this.pieceTable.delete(offset, lineText.length);
        this.pieceTable.insert(offset, uncommented);
      } else {
        // Comment
        const commented = '// ' + lineText;
        this.pieceTable.delete(offset, lineText.length);
        this.pieceTable.insert(offset, commented);
      }
      
      this.requestTokenization();
      this.render();
    }
  }
  
  performUndo() {
    const operation = this.historyManager.undo();
    if (operation) {
      operation.undo(this.pieceTable, this.cursorManager);
      this.selectionManager.clearSelection();
      this.requestTokenization();
      this.render();
    }
  }
  
  performRedo() {
    const operation = this.historyManager.redo();
    if (operation) {
      operation.redo(this.pieceTable, this.cursorManager);
      this.selectionManager.clearSelection();
      this.requestTokenization();
      this.render();
    }
  }

  handleKeyPress(e) {
    // Handle printable characters
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    // Get the character - use e.key for modern browsers
    const char = e.key;
    
    // Check if it's a printable character (not a special key)
    if (char && char.length === 1) {
      // Exclude special keys that are handled in keydown
      const specialKeys = ['Enter', 'Tab', 'Backspace', 'Delete', 'Escape', 
                          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
                          'Home', 'End'];
      
      if (!specialKeys.includes(char)) {
        e.preventDefault();
        this.insertText(char);
        // Trigger autocomplete after typing
        setTimeout(() => this.triggerAutocomplete(), 100);
      }
    }
  }

  handleInput(e) {
    // Input event doesn't fire on non-contenteditable divs
    // Text input is handled by keypress instead
    // This method is kept for potential future use with contenteditable
  }

  handleMouseDown(e) {
    const { line, col } = this.getClickPosition(e);
    
    if (e.altKey) {
      // Alt+Click: Add cursor
      e.preventDefault();
      this.cursorManager.addCursor(line, col);
      this.updateCursors();
      this.updateStatusBar();
      return;
    }
    
    if (e.shiftKey) {
      // Shift+Click: Extend selection
      e.preventDefault();
      const primaryCursor = this.cursorManager.getPrimaryCursor();
      this.selectionManager.startSelection(primaryCursor.line, primaryCursor.col);
      this.selectionManager.extendSelection(line, col);
      this.cursorManager.setPrimaryCursor(line, col);
      this.updateSelections();
      this.updateCursors();
      this.updateStatusBar();
      return;
    }
    
    // Regular click: Start selection or set cursor
    if (e.detail === 1) {
      // Single click
      this.selectionManager.startSelection(line, col);
      this.cursorManager.setPrimaryCursor(line, col);
      this.cursorManager.removeSecondaryCursors();
      this.isDragging = false;
    } else if (e.detail === 2) {
      // Double click: Select word
      e.preventDefault();
      this.selectWord(line, col);
    } else if (e.detail === 3) {
      // Triple click: Select line
      e.preventDefault();
      this.selectLine(line);
    }
    
    this.editorContent.focus();
  }

  handleMouseMove(e) {
    if (this.selectionManager.isSelecting && (e.buttons === 1 || e.which === 1)) {
      // Dragging to select
      const { line, col } = this.getClickPosition(e);
      this.selectionManager.extendSelection(line, col);
      this.cursorManager.setPrimaryCursor(line, col);
      this.updateSelections();
      this.updateCursors();
      this.updateStatusBar();
      this.isDragging = true;
    }
  }

  handleMouseUp(e) {
    if (this.selectionManager.isSelecting) {
      this.selectionManager.finishSelection();
      if (!this.isDragging) {
        // Click without drag - clear selection
        this.selectionManager.clearSelection();
        this.updateSelections();
      }
      this.isDragging = false;
    }
  }

  handleClick(e) {
    // Click handler for non-drag clicks
    if (!this.isDragging) {
      const { line, col } = this.getClickPosition(e);
      this.cursorManager.setPrimaryCursor(line, col);
      this.updateCursors();
      this.updateStatusBar();
    }
  }

  handleAltClick(e) {
    const { line, col } = this.getClickPosition(e);
    this.cursorManager.addCursor(line, col);
    this.updateCursors();
    this.updateStatusBar();
  }

  selectWord(line, col) {
    const lineText = this.pieceTable.getLine(line) || '';
    if (lineText.length === 0) return;
    
    // Find word boundaries
    let start = col;
    let end = col;
    
    // Move start backward to word beginning
    while (start > 0 && /\w/.test(lineText[start - 1])) {
      start--;
    }
    
    // Move end forward to word end
    while (end < lineText.length && /\w/.test(lineText[end])) {
      end++;
    }
    
    this.selectionManager.startSelection(line, start);
    this.selectionManager.extendSelection(line, end);
    this.cursorManager.setPrimaryCursor(line, end);
    this.updateSelections();
    this.updateCursors();
  }

  selectLine(line) {
    const lineText = this.pieceTable.getLine(line) || '';
    this.selectionManager.startSelection(line, 0);
    this.selectionManager.extendSelection(line, lineText.length);
    this.cursorManager.setPrimaryCursor(line, lineText.length);
    this.updateSelections();
    this.updateCursors();
  }

  getClickPosition(e) {
    const rect = this.editorContent.getBoundingClientRect();
    const y = e.clientY - rect.top + this.editorContent.scrollTop;
    const x = e.clientX - rect.left;
    
    const wrappedLine = Math.floor(y / this.options.lineHeight);
    
    if (this.wordWrap) {
      // Convert wrapped line to logical line
      const logical = this.virtualScroller.wrappedToLogical(wrappedLine, 0, this.pieceTable);
      const line = logical.logicalLine;
      const lineText = this.pieceTable.getLine(line) || '';
      
      // Get the segment that was clicked
      const wrapped = this.virtualScroller.wrapLine(lineText, line);
      const segmentIndex = Math.floor(wrappedLine - this.virtualScroller.logicalToWrapped(line, 0, this.pieceTable).wrappedLine);
      const segment = wrapped[Math.min(segmentIndex, wrapped.length - 1)];
      
      // Calculate column within segment
      const paddingLeft = 16;
      const clickX = x - paddingLeft;
      const segmentText = segment.text;
      
      let col = segment.startCol;
      if (segmentText.length > 0) {
        let left = 0;
        let right = segmentText.length;
        
        while (left < right) {
          const mid = Math.floor((left + right) / 2);
          const textBeforeMid = segmentText.substring(0, mid);
          const widthBeforeMid = this.measureText(textBeforeMid);
          
          if (widthBeforeMid < clickX) {
            left = mid + 1;
          } else {
            right = mid;
          }
        }
        
        const col1 = Math.max(0, left - 1);
        const col2 = Math.min(segmentText.length, left);
        
        const text1 = segmentText.substring(0, col1);
        const text2 = segmentText.substring(0, col2);
        const width1 = this.measureText(text1);
        const width2 = this.measureText(text2);
        
        const dist1 = Math.abs(clickX - width1);
        const dist2 = Math.abs(clickX - width2);
        
        const segmentCol = dist1 < dist2 ? col1 : col2;
        col = segment.startCol + segmentCol;
      }
      
      return { line: Math.max(0, line), col: Math.max(0, Math.min(col, lineText.length)) };
    } else {
      const line = wrappedLine;
      const lineText = this.pieceTable.getLine(line) || '';
      
      // Calculate column by measuring text width (vim-style positioning)
      const paddingLeft = 16;
      const clickX = x - paddingLeft;
      
      // Binary search for the closest column position
      let col = 0;
      if (lineText.length > 0) {
        let left = 0;
        let right = lineText.length;
        
        while (left < right) {
          const mid = Math.floor((left + right) / 2);
          const textBeforeMid = lineText.substring(0, mid);
          const widthBeforeMid = this.measureText(textBeforeMid);
          
          if (widthBeforeMid < clickX) {
            left = mid + 1;
          } else {
            right = mid;
          }
        }
        
        // Check which position is closer
        const col1 = Math.max(0, left - 1);
        const col2 = Math.min(lineText.length, left);
        
        const text1 = lineText.substring(0, col1);
        const text2 = lineText.substring(0, col2);
        const width1 = this.measureText(text1);
        const width2 = this.measureText(text2);
        
        const dist1 = Math.abs(clickX - width1);
        const dist2 = Math.abs(clickX - width2);
        
        col = dist1 < dist2 ? col1 : col2;
      } else {
        // Empty line - cursor at position 0
        col = 0;
      }
      
      return { line: Math.max(0, line), col: Math.max(0, col) };
    }
  }

  insertText(text) {
    try {
      const cursors = this.cursorManager.getAllCursors();
      
      // Store cursor positions before operation
      const cursorPositionsBefore = cursors.map(c => ({ line: c.line, col: c.col }));
      
      // Sort cursors in reverse order to maintain offsets
      const sortedCursors = [...cursors].sort((a, b) => {
        if (a.line !== b.line) return b.line - a.line;
        return b.col - a.col;
      });
      
      const operations = [];
      
      for (const cursor of sortedCursors) {
        try {
          const offset = this.pieceTable.lineColToOffset(cursor.line, cursor.col);
          this.pieceTable.insert(offset, text);
          
          // Record operation for undo
          operations.push(this.historyManager.createInsertOperation(offset, text, cursorPositionsBefore));
          
          // Update cursor position
          if (text === '\n') {
            // Newline: move to start of next line
            cursor.line++;
            cursor.col = 0;
          } else {
            const newCol = cursor.col + text.length;
            const lineText = this.pieceTable.getLine(cursor.line);
            if (newCol <= lineText.length) {
              cursor.col = newCol;
            } else {
              // Text wrapped to next line (shouldn't happen with monospace, but handle it)
              cursor.line++;
              cursor.col = newCol - lineText.length - 1;
            }
          }
        } catch (err) {
          console.error('Error inserting text at cursor:', err);
        }
      }
      
      // Push operations to history (combine multiple cursor inserts into one operation)
      if (operations.length > 0) {
        const combinedOperation = {
          type: 'multi-insert',
          operations,
          undo: (pieceTable, cursorManager) => {
            // Undo in reverse order
            for (let i = operations.length - 1; i >= 0; i--) {
              try {
                operations[i].undo(pieceTable, cursorManager);
              } catch (err) {
                console.error('Error undoing operation:', err);
              }
            }
          },
          redo: (pieceTable, cursorManager) => {
            // Redo in forward order
            for (const op of operations) {
              try {
                op.redo(pieceTable, cursorManager);
              } catch (err) {
                console.error('Error redoing operation:', err);
              }
            }
          }
        };
        this.historyManager.pushOperation(combinedOperation);
      }
      
      this.requestTokenization();
      this.render();
      this.updateCursors();
      this.updateAriaLabel();
      
      // Mark as modified
      if (!this.historyManager.isUndoing && !this.historyManager.isRedoing) {
        this.isModified = true;
        if (this.activeTabId) {
          this.updateTabModified(this.activeTabId, true);
        }
        
        // Auto-save if enabled
        if (this.autoSave) {
          setTimeout(() => {
            if (this.currentFilePath) {
              this.saveFile();
            }
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error in insertText:', err);
    }
  }

  handleBackspace() {
    const cursors = this.cursorManager.getAllCursors();
    const cursorPositionsBefore = cursors.map(c => ({ line: c.line, col: c.col }));
    const sortedCursors = [...cursors].sort((a, b) => {
      if (a.line !== b.line) return b.line - a.line;
      return b.col - a.col;
    });
    
    const operations = [];
    
    for (const cursor of sortedCursors) {
      if (cursor.col > 0) {
        const offset = this.pieceTable.lineColToOffset(cursor.line, cursor.col);
        const deletedChar = this.pieceTable.getText(offset - 1, offset);
        this.pieceTable.delete(offset - 1, 1);
        operations.push(this.historyManager.createDeleteOperation(offset - 1, 1, deletedChar, cursorPositionsBefore));
        cursor.col--;
      } else if (cursor.line > 0) {
        // Merge with previous line
        const offset = this.pieceTable.lineColToOffset(cursor.line, cursor.col);
        const prevLine = this.pieceTable.getLine(cursor.line - 1);
        const deletedChar = this.pieceTable.getText(offset - 1, offset);
        this.pieceTable.delete(offset - 1, 1);
        operations.push(this.historyManager.createDeleteOperation(offset - 1, 1, deletedChar, cursorPositionsBefore));
        cursor.line--;
        cursor.col = prevLine.length;
      }
    }
    
    // Push operations to history
    if (operations.length > 0) {
      const combinedOperation = {
        type: 'multi-delete',
        operations,
        undo: (pieceTable, cursorManager) => {
          for (let i = operations.length - 1; i >= 0; i--) {
            operations[i].undo(pieceTable, cursorManager);
          }
        },
        redo: (pieceTable, cursorManager) => {
          for (const op of operations) {
            op.redo(pieceTable, cursorManager);
          }
        }
      };
      this.historyManager.pushOperation(combinedOperation);
    }
    
    this.requestTokenization();
    this.render();
    this.updateCursors();
  }

  handleDelete() {
    const cursors = this.cursorManager.getAllCursors();
    const cursorPositionsBefore = cursors.map(c => ({ line: c.line, col: c.col }));
    const sortedCursors = [...cursors].sort((a, b) => {
      if (a.line !== b.line) return b.line - a.line;
      return b.col - a.col;
    });
    
    const operations = [];
    
    for (const cursor of sortedCursors) {
      const lineText = this.pieceTable.getLine(cursor.line);
      if (cursor.col < lineText.length) {
        const offset = this.pieceTable.lineColToOffset(cursor.line, cursor.col);
        const deletedChar = this.pieceTable.getText(offset, offset + 1);
        this.pieceTable.delete(offset, 1);
        operations.push(this.historyManager.createDeleteOperation(offset, 1, deletedChar, cursorPositionsBefore));
      } else if (cursor.line < this.pieceTable.getLineCount() - 1) {
        // Merge with next line
        const offset = this.pieceTable.lineColToOffset(cursor.line, cursor.col);
        const deletedChar = this.pieceTable.getText(offset, offset + 1);
        this.pieceTable.delete(offset, 1);
        operations.push(this.historyManager.createDeleteOperation(offset, 1, deletedChar, cursorPositionsBefore));
      }
    }
    
    // Push operations to history
    if (operations.length > 0) {
      const combinedOperation = {
        type: 'multi-delete',
        operations,
        undo: (pieceTable, cursorManager) => {
          for (let i = operations.length - 1; i >= 0; i--) {
            operations[i].undo(pieceTable, cursorManager);
          }
        },
        redo: (pieceTable, cursorManager) => {
          for (const op of operations) {
            op.redo(pieceTable, cursorManager);
          }
        }
      };
      this.historyManager.pushOperation(combinedOperation);
    }
    
    this.requestTokenization();
    this.render();
    this.updateCursors();
  }

  getMaxCols() {
    const lineCount = this.pieceTable.getLineCount();
    const maxCols = [];
    for (let i = 0; i < lineCount; i++) {
      maxCols.push(this.pieceTable.getLine(i).length);
    }
    return maxCols;
  }

  requestTokenization() {
    // Debounce tokenization
    clearTimeout(this.tokenizationDebounce);
    this.tokenizationDebounce = setTimeout(() => {
      this.tokenizeVisibleLines();
    }, 100);
  }

  tokenizeVisibleLines() {
    if (!this.syntaxWorker) return;
    
    try {
      const lineCount = this.pieceTable.getLineCount();
      const range = this.virtualScroller.getVisibleRange(lineCount, this.pieceTable);
      
      // For wrapped lines, we still tokenize logical lines
      const startLine = this.wordWrap ? 0 : Math.max(0, range.start);
      const endLine = this.wordWrap ? lineCount - 1 : Math.min(lineCount - 1, range.end);
      
      const lines = [];
      for (let i = startLine; i <= endLine; i++) {
        try {
          lines.push(this.pieceTable.getLine(i));
        } catch (err) {
          console.warn(`Error getting line ${i}:`, err);
          lines.push('');
        }
      }
      
      const queueKey = `${startLine}-${endLine}`;
      if (!this.tokenizationQueue.has(queueKey)) {
        this.tokenizationQueue.add(queueKey);
        this.syntaxWorker.postMessage({
          text: lines.join('\n'),
          language: this.language,
          lineStart: startLine,
          lineEnd: endLine
        });
      }
    } catch (err) {
      console.error('Error in tokenizeVisibleLines:', err);
    }
  }
  
  insertTextWithIndent() {
    const cursors = this.cursorManager.getAllCursors();
    const cursor = cursors[0]; // Primary cursor
    
    // Get current line and detect indentation
    const currentLine = this.pieceTable.getLine(cursor.line);
    const indentMatch = currentLine.match(/^(\s*)/);
    const currentIndent = indentMatch ? indentMatch[1] : '';
    
    // Check if line ends with opening bracket
    const trimmedLine = currentLine.trim();
    const endsWithBracket = /[{\[\(]$/.test(trimmedLine);
    
    // Calculate new indentation
    let newIndent = currentIndent;
    if (endsWithBracket) {
      // Increase indent for next line
      newIndent += '  '; // 2 spaces
    }
    
    // Insert newline with indentation
    const textToInsert = '\n' + newIndent;
    this.insertText(textToInsert);
  }

  updateCursors() {
    this.cursorsContainer.innerHTML = '';
    
    const cursors = this.cursorManager.getAllCursors();
    const lineHeight = this.options.lineHeight;
    const paddingLeft = 16; // Match editor-line padding
    
    for (let i = 0; i < cursors.length; i++) {
      const cursor = cursors[i];
      const lineText = this.pieceTable.getLine(cursor.line) || '';
      
      let topPosition, leftPosition;
      
      if (this.wordWrap) {
        // Convert logical position to wrapped position
        const wrapped = this.virtualScroller.logicalToWrapped(cursor.line, cursor.col, this.pieceTable);
        const wrappedLine = wrapped.wrappedLine;
        
        // Get the segment for this wrapped line
        const wrappedSegments = this.virtualScroller.wrapLine(lineText, cursor.line);
        const segment = wrappedSegments[wrapped.segmentIndex] || wrappedSegments[0];
        
        // Calculate position within segment
        const segmentStartCol = segment.startCol;
        const segmentText = lineText.substring(segmentStartCol, cursor.col);
        const segmentTextWidth = this.measureText(segmentText);
        
        topPosition = wrappedLine * lineHeight;
        leftPosition = paddingLeft + segmentTextWidth;
      } else {
        // Non-wrapped: use direct measurement
        const textBeforeCursor = lineText.substring(0, cursor.col);
        const textWidth = this.measureText(textBeforeCursor);
        
        topPosition = cursor.line * lineHeight;
        leftPosition = paddingLeft + textWidth;
      }
      
      const cursorDiv = document.createElement('div');
      cursorDiv.className = 'cursor';
      if (i > 0) {
        cursorDiv.classList.add('cursor-secondary');
      }
      cursorDiv.style.top = `${topPosition}px`;
      cursorDiv.style.left = `${leftPosition}px`;
      
      this.cursorsContainer.appendChild(cursorDiv);
    }
    
    // Update bracket matching after cursor update
    this.updateBracketMatching();
  }

  render() {
    try {
      this.virtualScroller.renderVisibleLines(this.pieceTable, this.tokensMap);
      this.updateSelections();
      this.updateCursors();
      this.updateStatusBar();
      this.updateAriaLabel();
      this.updateMinimap();
      this.tokenizeVisibleLines();
    } catch (err) {
      console.error('Error in render:', err);
    }
  }
  
  updateStatusBar() {
    const cursor = this.cursorManager.getPrimaryCursor();
    this.statusLineCol.textContent = `Ln ${cursor.line + 1}, Col ${cursor.col + 1}`;
    
    // Selection info
    if (this.selectionManager.hasSelection()) {
      const selections = this.selectionManager.getSelections();
      if (selections.length > 0) {
        const sel = selections[0];
        const startOffset = this.pieceTable.lineColToOffset(sel.start.line, sel.start.col);
        const endOffset = this.pieceTable.lineColToOffset(sel.end.line, sel.end.col);
        const selectedText = this.pieceTable.getText(startOffset, endOffset);
        const lines = selectedText.split('\n').length;
        const chars = selectedText.length;
        this.statusSelection.textContent = `${lines} line${lines !== 1 ? 's' : ''}, ${chars} char${chars !== 1 ? 's' : ''} selected`;
      } else {
        this.statusSelection.textContent = '';
      }
    } else {
      this.statusSelection.textContent = '';
    }
    
    // Language
    const langNames = {
      javascript: 'JavaScript',
      html: 'HTML',
      css: 'CSS',
      python: 'Python',
      typescript: 'TypeScript',
      json: 'JSON',
      markdown: 'Markdown'
    };
    this.statusLanguage.textContent = langNames[this.language] || this.language;
    
    // Encoding and line ending (static for now)
    this.statusEncoding.textContent = 'UTF-8';
    this.statusEncoding.setAttribute('aria-label', 'Encoding: UTF-8');
    this.statusLineEnding.textContent = 'LF';
    this.statusLineEnding.setAttribute('aria-label', 'Line ending: LF');
    this.statusTabSize.textContent = 'Spaces: 2';
    this.statusTabSize.setAttribute('aria-label', 'Tab size: 2 spaces');
    
    // Word wrap indicator
    if (this.statusBar) {
      let wrapIndicator = this.statusBar.querySelector('#status-word-wrap');
      if (!wrapIndicator) {
        wrapIndicator = document.createElement('span');
        wrapIndicator.className = 'status-item';
        wrapIndicator.id = 'status-word-wrap';
        const statusRight = this.statusBar.querySelector('.status-right');
        if (statusRight) {
          statusRight.appendChild(wrapIndicator);
        }
      }
      if (this.wordWrap) {
        wrapIndicator.textContent = 'Wrap: On';
        wrapIndicator.setAttribute('aria-label', 'Word wrap: Enabled');
      } else {
        wrapIndicator.textContent = 'Wrap: Off';
        wrapIndicator.setAttribute('aria-label', 'Word wrap: Disabled');
      }
    }
  }

  updateAriaLabel() {
    const cursor = this.cursorManager.getPrimaryCursor();
    const lineCount = this.pieceTable.getLineCount();
    const lineText = this.pieceTable.getLine(cursor.line) || '';
    
    // Update editor content aria-label with current position and context
    this.editorContent.setAttribute(
      'aria-label',
      `Code editor. Line ${cursor.line + 1} of ${lineCount}, Column ${cursor.col + 1}. ${lineText.length} characters on this line.`
    );
    
    // Update role and other accessibility attributes
    this.editorContent.setAttribute('role', 'textbox');
    this.editorContent.setAttribute('aria-multiline', 'true');
    this.editorContent.setAttribute('aria-readonly', 'false');
  }

  updateBracketMatching() {
    if (!this.bracketMatcher || !this.bracketMatchesContainer) return;
    
    this.bracketMatchesContainer.innerHTML = '';
    
    const cursor = this.cursorManager.getPrimaryCursor();
    const lineText = this.pieceTable.getLine(cursor.line) || '';
    
    // Check if cursor is at a bracket position
    if (cursor.col < lineText.length) {
      const char = lineText[cursor.col];
      const matchingPos = this.bracketMatcher.findMatchingBracket(
        this.pieceTable, 
        cursor.line, 
        cursor.col
      );
      
      if (matchingPos) {
        // Highlight both brackets
        this.renderBracketHighlight(cursor.line, cursor.col);
        this.renderBracketHighlight(matchingPos.line, matchingPos.col);
      }
    }
    
    // Also check character before cursor
    if (cursor.col > 0) {
      const char = lineText[cursor.col - 1];
      const matchingPos = this.bracketMatcher.findMatchingBracket(
        this.pieceTable, 
        cursor.line, 
        cursor.col - 1
      );
      
      if (matchingPos) {
        this.renderBracketHighlight(cursor.line, cursor.col - 1);
        this.renderBracketHighlight(matchingPos.line, matchingPos.col);
      }
    }
  }

  renderBracketHighlight(line, col) {
    const lineHeight = this.options.lineHeight;
    const paddingLeft = 16;
    const lineText = this.pieceTable.getLine(line) || '';
    
    if (col >= lineText.length) return;
    
    const char = lineText[col];
    const charWidth = this.measureText(char);
    
    let topPosition, leftPosition;
    
    if (this.wordWrap) {
      // Convert to wrapped position
      const wrapped = this.virtualScroller.logicalToWrapped(line, col, this.pieceTable);
      const wrappedLine = wrapped.wrappedLine;
      const wrappedSegments = this.virtualScroller.wrapLine(lineText, line);
      const segment = wrappedSegments[wrapped.segmentIndex] || wrappedSegments[0];
      
      const segmentText = lineText.substring(segment.startCol, col);
      const segmentTextWidth = this.measureText(segmentText);
      
      topPosition = wrappedLine * lineHeight;
      leftPosition = paddingLeft + segmentTextWidth;
    } else {
      const textBeforeChar = lineText.substring(0, col);
      const textWidth = this.measureText(textBeforeChar);
      
      topPosition = line * lineHeight;
      leftPosition = paddingLeft + textWidth;
    }
    
    const highlight = document.createElement('div');
    highlight.className = 'bracket-match';
    highlight.style.top = `${topPosition}px`;
    highlight.style.left = `${leftPosition}px`;
    highlight.style.width = `${charWidth}px`;
    highlight.style.height = `${lineHeight}px`;
    
    this.bracketMatchesContainer.appendChild(highlight);
  }

  setText(text) {
    this.pieceTable.setText(text);
    this.cursorManager.setPrimaryCursor(0, 0);
    this.tokensMap.clear();
    this.render();
  }

  getText() {
    return this.pieceTable.getAllText();
  }

  setLanguage(language) {
    this.language = language;
    this.tokensMap.clear();
    this.render();
  }
  
  toggleWordWrap() {
    this.wordWrap = !this.wordWrap;
    this.virtualScroller.setWordWrap(this.wordWrap);
    this.virtualScroller.wrappedLines.clear();
    this.virtualScroller.renderedLines.clear();
    this.render();
    this.updateStatusBar();
  }
  
  setWordWrap(enabled) {
    this.wordWrap = enabled;
    this.virtualScroller.setWordWrap(enabled);
    this.virtualScroller.wrappedLines.clear();
    this.virtualScroller.renderedLines.clear();
    this.render();
    this.updateStatusBar();
  }

  isFoldable(lineText) {
    const trimmed = lineText.trim();
    return trimmed.endsWith('{') || 
           trimmed.endsWith('[') || 
           trimmed.startsWith('function') ||
           trimmed.startsWith('class') ||
           trimmed.startsWith('if') ||
           trimmed.startsWith('for') ||
           trimmed.startsWith('while');
  }

  foldAtLine(line) {
    this.foldedLines.add(line);
    this.render();
  }

  unfoldAtLine(line) {
    this.foldedLines.delete(line);
    this.render();
  }

  toggleFoldAtLine(line) {
    if (this.foldedLines.has(line)) {
      this.unfoldAtLine(line);
    } else {
      this.foldAtLine(line);
    }
  }
}

// Initialize editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.editor-container');
  const editor = new CodeEditor(container, {
    language: 'javascript',
    initialText: `// Welcome to Code Editor
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
`
  });
  
  // Make editor globally accessible for debugging
  window.editor = editor;
});

