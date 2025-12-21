/**
 * Syntax Highlighting Web Worker
 * Tokenizes code using regex patterns to keep main thread responsive
 */

// Language definitions with regex patterns
const languages = {
  javascript: {
    patterns: [
      {
        name: "comment",
        regex: /\/\/.*|\/\*[\s\S]*?\*\//g,
        type: "comment",
      },
      {
        name: "string",
        regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        type: "string",
      },
      {
        name: "number",
        regex: /\b\d+\.?\d*\b/g,
        type: "number",
      },
      {
        name: "keyword",
        regex:
          /\b(?:function|const|let|var|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|class|extends|super|import|export|default|async|await|yield|from|of|in|typeof|instanceof|void|delete|true|false|null|undefined)\b/g,
        type: "keyword",
      },
      {
        name: "operator",
        regex: /[+\-*/%=<>!&|?:;.,()[\]{}]/g,
        type: "operator",
      },
      {
        name: "function",
        regex: /\b\w+(?=\s*\()/g,
        type: "function",
      },
    ],
  },

  html: {
    patterns: [
      {
        name: "comment",
        regex: /<!--[\s\S]*?-->/g,
        type: "comment",
      },
      {
        name: "tag",
        regex: /<\/?[\w\s="/.':;#-\/]+>/g,
        type: "tag",
      },
      {
        name: "attribute",
        regex: /\s+[\w-]+(?=\s*=)/g,
        type: "attribute",
      },
      {
        name: "string",
        regex: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        type: "string",
      },
    ],
  },

  css: {
    patterns: [
      {
        name: "comment",
        regex: /\/\*[\s\S]*?\*\//g,
        type: "comment",
      },
      {
        name: "selector",
        regex: /[^{}]+(?=\{)/g,
        type: "selector",
      },
      {
        name: "property",
        regex: /[\w-]+(?=\s*:)/g,
        type: "property",
      },
      {
        name: "string",
        regex: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        type: "string",
      },
      {
        name: "number",
        regex: /:\s*[\d.]+(?:px|em|rem|%|vh|vw|deg|s|ms)?/g,
        type: "number",
      },
      {
        name: "keyword",
        regex:
          /\b(?:@media|@import|@keyframes|@font-face|important|auto|none|inherit|initial|unset)\b/g,
        type: "keyword",
      },
    ],
  },

  python: {
    patterns: [
      {
        name: "comment",
        regex: /#.*/g,
        type: "comment",
      },
      {
        name: "string",
        regex: /(["'])(?:(?=(\\?))\2.)*?\1|("""[\s\S]*?""")|('''[\s\S]*?''')/g,
        type: "string",
      },
      {
        name: "number",
        regex: /\b\d+\.?\d*\b/g,
        type: "number",
      },
      {
        name: "keyword",
        regex:
          /\b(?:def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|pass|break|continue|raise|assert|del|global|nonlocal|True|False|None|and|or|not|in|is)\b/g,
        type: "keyword",
      },
      {
        name: "function",
        regex: /\b\w+(?=\s*\()/g,
        type: "function",
      },
      {
        name: "operator",
        regex: /[+\-*/%=<>!&|?:;.,()[\]{}]/g,
        type: "operator",
      },
    ],
  },

  typescript: {
    patterns: [
      {
        name: "comment",
        regex: /\/\/.*|\/\*[\s\S]*?\*\//g,
        type: "comment",
      },
      {
        name: "string",
        regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        type: "string",
      },
      {
        name: "number",
        regex: /\b\d+\.?\d*\b/g,
        type: "number",
      },
      {
        name: "keyword",
        regex:
          /\b(?:function|const|let|var|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|class|extends|super|import|export|default|async|await|yield|from|of|in|typeof|instanceof|void|delete|true|false|null|undefined|interface|type|enum|namespace|module|declare|public|private|protected|static|readonly|abstract|implements|as|is|keyof)\b/g,
        type: "keyword",
      },
      {
        name: "operator",
        regex: /[+\-*/%=<>!&|?:;.,()[\]{}]/g,
        type: "operator",
      },
      {
        name: "function",
        regex: /\b\w+(?=\s*\()/g,
        type: "function",
      },
    ],
  },

  json: {
    patterns: [
      {
        name: "string",
        regex: /"([^"\\]|\\.)*"/g,
        type: "string",
      },
      {
        name: "number",
        regex: /\b\d+\.?\d*\b/g,
        type: "number",
      },
      {
        name: "keyword",
        regex: /\b(?:true|false|null)\b/g,
        type: "keyword",
      },
      {
        name: "operator",
        regex: /[{}\[\]:,]/g,
        type: "operator",
      },
    ],
  },

  markdown: {
    patterns: [
      {
        name: "comment",
        regex: /<!--[\s\S]*?-->/g,
        type: "comment",
      },
      {
        name: "heading",
        regex: /^#{1,6}\s+.+$/gm,
        type: "keyword",
      },
      {
        name: "string",
        regex: /\[([^\]]+)\]\([^\)]+\)/g,
        type: "string",
      },
      {
        name: "operator",
        regex: /[*_`~]/g,
        type: "operator",
      },
      {
        name: "number",
        regex: /^\s*\d+\.\s/gm,
        type: "number",
      },
    ],
  },

  java: {
    patterns: [
      {
        name: "comment",
        regex: /\/\/.*|\/\*[\s\S]*?\*\//g,
        type: "comment",
      },
      {
        name: "string",
        regex: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        type: "string",
      },
      {
        name: "number",
        regex: /\b\d+\.?\d*\b/g,
        type: "number",
      },
      {
        name: "keyword",
        regex:
          /\b(?:public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|new|this|super|void|int|long|float|double|boolean|char|String|true|false|null)\b/g,
        type: "keyword",
      },
      {
        name: "function",
        regex: /\b\w+(?=\s*\()/g,
        type: "function",
      },
      {
        name: "operator",
        regex: /[+\-*/%=<>!&|?:;.,()[\]{}]/g,
        type: "operator",
      },
    ],
  },

  cpp: {
    patterns: [
      {
        name: "comment",
        regex: /\/\/.*|\/\*[\s\S]*?\*\//g,
        type: "comment",
      },
      {
        name: "string",
        regex: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        type: "string",
      },
      {
        name: "number",
        regex: /\b\d+\.?\d*\b/g,
        type: "number",
      },
      {
        name: "keyword",
        regex:
          /\b(?:#include|#define|#ifdef|#ifndef|#endif|using|namespace|class|struct|public|private|protected|virtual|static|const|if|else|for|while|do|switch|case|break|continue|return|try|catch|throw|new|delete|this|int|long|float|double|bool|char|void|auto|true|false|nullptr)\b/g,
        type: "keyword",
      },
      {
        name: "function",
        regex: /\b\w+(?=\s*\()/g,
        type: "function",
      },
      {
        name: "operator",
        regex: /[+\-*/%=<>!&|?:;.,()[\]{}]/g,
        type: "operator",
      },
    ],
  },

  sql: {
    patterns: [
      {
        name: "comment",
        regex: /--.*|\/\*[\s\S]*?\*\//g,
        type: "comment",
      },
      {
        name: "string",
        regex: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        type: "string",
      },
      {
        name: "number",
        regex: /\b\d+\.?\d*\b/g,
        type: "number",
      },
      {
        name: "keyword",
        regex:
          /\b(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|JOIN|INNER|LEFT|RIGHT|OUTER|ON|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|DISTINCT|COUNT|SUM|AVG|MAX|MIN|CASE|WHEN|THEN|ELSE|END)\b/gi,
        type: "keyword",
      },
      {
        name: "operator",
        regex: /[+\-*/%=<>!&|?:;.,()[\]{}]/g,
        type: "operator",
      },
    ],
  },
};

/**
 * Tokenize a single line of text
 */
function tokenizeLine(line, language) {
  if (!languages[language]) {
    return [{ type: "text", value: line, start: 0, end: line.length }];
  }

  const patterns = languages[language].patterns;
  const tokens = [];
  const matches = [];

  // Find all matches from all patterns
  patterns.forEach((pattern) => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(line)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: pattern.type,
        value: match[0],
      });
    }
  });

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep first)
  const nonOverlapping = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      nonOverlapping.push(match);
      lastEnd = match.end;
    }
  }

  // Build tokens array, filling gaps with plain text
  let currentPos = 0;
  for (const match of nonOverlapping) {
    // Add plain text before match
    if (match.start > currentPos) {
      tokens.push({
        type: "text",
        value: line.substring(currentPos, match.start),
        start: currentPos,
        end: match.start,
      });
    }

    // Add matched token
    tokens.push({
      type: match.type,
      value: match.value,
      start: match.start,
      end: match.end,
    });

    currentPos = match.end;
  }

  // Add remaining plain text
  if (currentPos < line.length) {
    tokens.push({
      type: "text",
      value: line.substring(currentPos),
      start: currentPos,
      end: line.length,
    });
  }

  // If no tokens, return single text token
  if (tokens.length === 0) {
    tokens.push({
      type: "text",
      value: line,
      start: 0,
      end: line.length,
    });
  }

  return tokens;
}

/**
 * Tokenize multiple lines
 */
function tokenize(text, language, lineStart = 0) {
  const lines = text.split("\n");
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tokens = tokenizeLine(line, language);
    result.push(tokens);
  }

  return result;
}

// Handle messages from main thread
self.onmessage = function (e) {
  const { text, language, lineStart, lineEnd } = e.data;

  try {
    const tokens = tokenize(text, language || "javascript", lineStart);

    self.postMessage({
      tokens,
      lineStart: lineStart || 0,
      lineEnd: lineEnd || tokens.length - 1,
    });
  } catch (error) {
    self.postMessage({
      error: error.message,
      tokens: [],
      lineStart: lineStart || 0,
      lineEnd: lineEnd || 0,
    });
  }
};
