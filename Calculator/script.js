// State
let currentInput = "0";
let expression = [];
let history = [];
let shouldResetScreen = false;
let isResultDisplayed = false;

// DOM Elements
const mainDisplay = document.getElementById("main-display");
const expressionDisplay = document.getElementById("expression-display");
const keypad = document.getElementById("keypad");
const historyBtn = document.getElementById("history-btn");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

// Constants
const MAX_DIGITS = 12;

// Event Listeners
keypad.addEventListener("click", handleButtonClick);
window.addEventListener("keydown", handleKeyboardInput);
historyBtn.addEventListener("click", toggleHistory);
clearHistoryBtn.addEventListener("click", clearHistory);
// Close history when clicking outside
document.addEventListener("click", (e) => {
  if (!historyPanel.contains(e.target) && !historyBtn.contains(e.target)) {
    historyPanel.classList.add("hidden");
  }
});

// Initial Display
updateDisplay();

function handleButtonClick(e) {
  const button = e.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const value = button.dataset.value;

  processInput(action, value);
}

function handleKeyboardInput(e) {
  const key = e.key;

  if (key >= "0" && key <= "9") {
    processInput("number", key);
  } else if (key === ".") {
    processInput("decimal");
  } else if (key === "=" || key === "Enter") {
    processInput("calculate");
  } else if (key === "Backspace") {
    processInput("delete"); // We can add a backspace feature or treat as C
  } else if (key === "Escape") {
    processInput("clear");
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    processInput("operator", key);
  } else if (key === "%") {
    processInput("percent");
  }
}

function processInput(action, value) {
  switch (action) {
    case "number":
      handleNumber(value);
      break;
    case "operator":
      handleOperator(value);
      break;
    case "decimal":
      handleDecimal();
      break;
    case "clear":
      handleClear();
      break;
    case "calculate":
      handleCalculate();
      break;
    case "negate":
      handleNegate();
      break;
    case "percent":
      handlePercent();
      break;
    case "delete":
      handleBackspace();
      break;
  }
  updateDisplay();
}

// Logic Functions
function handleNumber(num) {
  if (currentInput === "Error") handleClear();

  if (shouldResetScreen || isResultDisplayed) {
    currentInput = num;
    shouldResetScreen = false;
    isResultDisplayed = false;
  } else {
    if (currentInput === "0") {
      currentInput = num;
    } else {
      if (currentInput.replace(/[^0-9]/g, "").length < MAX_DIGITS) {
        currentInput += num;
      }
    }
  }
}

function handleDecimal() {
  if (shouldResetScreen || isResultDisplayed) {
    currentInput = "0.";
    shouldResetScreen = false;
    isResultDisplayed = false;
    return;
  }
  if (!currentInput.includes(".")) {
    currentInput += ".";
  }
}

function handleOperator(op) {
  if (currentInput === "Error") return;

  if (isResultDisplayed) {
    // Continue calculation with result
    expression = [currentInput, op];
    isResultDisplayed = false;
    shouldResetScreen = true;
  } else if (shouldResetScreen) {
    // Just changing the operator if user hits + then *
    expression[expression.length - 1] = op;
  } else {
    // Push current number and new operator
    expression.push(currentInput);
    expression.push(op);
    shouldResetScreen = true;
  }
}

function handleNegate() {
  if (currentInput === "Error") return;
  if (currentInput === "0") return;

  if (currentInput.startsWith("-")) {
    currentInput = currentInput.slice(1);
  } else {
    currentInput = "-" + currentInput;
  }
}

function handlePercent() {
  if (currentInput === "Error") return;
  const value = parseFloat(currentInput);
  currentInput = (value / 100).toString();
}

function handleClear() {
  currentInput = "0";
  expression = [];
  shouldResetScreen = false;
  isResultDisplayed = false;
}

function handleBackspace() {
  if (shouldResetScreen || isResultDisplayed || currentInput === "Error") {
    handleClear();
    return;
  }

  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }
}

function handleCalculate() {
  if (isResultDisplayed || currentInput === "Error") return;

  // Add final number to expression
  expression.push(currentInput);

  // Save full expression for history before clearing
  const fullExpression = [...expression];

  const result = evaluateExpression(expression);

  // Add to history
  addToHistory(fullExpression, formatResult(result));

  currentInput = formatResult(result);
  expression = []; // Clear expression after calculation
  shouldResetScreen = true;
  isResultDisplayed = true;
}

function addToHistory(expr, result) {
  const expressionString = expr
    .join(" ")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");

  history.unshift({ expression: expressionString, result: result });
  if (history.length > 10) history.pop(); // Keep last 10 items
  renderHistory();
}

function toggleHistory() {
  historyPanel.classList.toggle("hidden");
}

function clearHistory() {
  history = [];
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML =
      '<div class="text-xs text-text-secondary text-center py-4">No history yet</div>';
    return;
  }

  history.forEach((item) => {
    const div = document.createElement("div");
    div.className =
      "flex flex-col p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors";
    div.innerHTML = `
            <div class="text-xs text-text-secondary text-right mb-1">${item.expression} =</div>
            <div class="text-lg text-text-main font-medium text-right">${item.result}</div>
        `;
    div.addEventListener("click", () => {
      currentInput = item.result;
      expression = [];
      shouldResetScreen = true;
      isResultDisplayed = true;
      updateDisplay();
      historyPanel.classList.add("hidden");
    });
    historyList.appendChild(div);
  });
}

function formatResult(num) {
  if (!isFinite(num) || isNaN(num)) return "Error";

  // Fix floating point issues (e.g. 0.1 + 0.2)
  let result = parseFloat(num.toPrecision(12));
  // Remove trailing zeros
  return result.toString();
}

// Stack-based Evaluation
function evaluateExpression(tokens) {
  if (tokens.length === 0) return 0;

  const values = [];
  const ops = [];

  const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!isNaN(parseFloat(token))) {
      values.push(parseFloat(token));
    } else if (token in precedence) {
      while (
        ops.length > 0 &&
        precedence[ops[ops.length - 1]] >= precedence[token]
      ) {
        const op = ops.pop();
        const b = values.pop();
        const a = values.pop();
        values.push(applyOp(op, a, b));
      }
      ops.push(token);
    }
  }

  while (ops.length > 0) {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    values.push(applyOp(op, a, b));
  }

  return values[0];
}

function applyOp(op, a, b) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      if (b === 0) return NaN; // Will result in 'Error'
      return a / b;
  }
  return 0;
}

// UI Update
function updateDisplay() {
  // Format Main Display (current number)
  const formattedInput = formatNumberForDisplay(currentInput);
  mainDisplay.textContent = formattedInput;

  // Format Expression Display
  const expressionString = expression
    .join(" ")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
  expressionDisplay.textContent = expressionString;

  // Scale font size if number is too long (basic handling)
  if (currentInput.length > 9) {
    mainDisplay.classList.remove("text-6xl");
    mainDisplay.classList.add("text-4xl");
  } else {
    mainDisplay.classList.remove("text-4xl");
    mainDisplay.classList.add("text-6xl");
  }
}

function formatNumberForDisplay(numStr) {
  if (numStr === "Error") return "Error";
  if (numStr.endsWith(".")) {
    // Handle "123." case - parseint would lose the decimal
    const parts = numStr.split(".");
    return parseFloat(parts[0]).toLocaleString("en-US") + ".";
  }

  if (numStr.includes(".")) {
    const parts = numStr.split(".");
    return parseFloat(parts[0]).toLocaleString("en-US") + "." + parts[1];
  }

  return parseFloat(numStr).toLocaleString("en-US");
}
