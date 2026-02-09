const display = document.getElementById('display');
const history = document.getElementById('history');
const buttons = document.querySelectorAll('.btn');
const themeToggleBtn = document.getElementById('theme-toggle');

// State
// State
let currentExpression = '';
let lastResult = '';
// unused: operator, shouldResetDisplay

// Theme Logic
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    const icon = themeToggleBtn.querySelector('i');

    if (isLight) {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
});

// Calculator Logic
// Calculator Logic
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const num = button.dataset.num;

        if (num !== undefined) {
            append(num);
        } else if (action) {
            handleAction(action);
        }
    });
});

function append(val) {
    if (currentExpression === 'Error') currentExpression = '';
    currentExpression += val;
    updateDisplay();
}

function handleAction(action) {
    if (currentExpression === 'Error') currentExpression = '';

    switch (action) {
        case 'clear':
            currentExpression = '';
            history.textContent = '';
            break;
        case 'delete':
            currentExpression = currentExpression.toString().slice(0, -1);
            break;
        case 'decimal':
            append('.');
            break;
        case 'add': append('+'); break;
        case 'subtract': append('-'); break;
        case 'multiply': append('*'); break;
        case 'divide': append('/'); break;
        case 'percent': append('/100'); break;
        case 'open-paren': append('('); break;
        case 'close-paren': append(')'); break;

        case 'sin': append('sin('); break;
        case 'cos': append('cos('); break;
        case 'tan': append('tan('); break;
        case 'log': append('log('); break;
        case 'ln': append('ln('); break;
        case 'sqrt': append('sqrt('); break;
        case 'power': append('^'); break;
        case 'pi': append('π'); break;
        case 'e': append('e'); break;
        case 'ans': append(lastResult); break;

        case 'calculate':
            calculate();
            break;
    }
    updateDisplay();
}

function calculate() {
    try {
        let evalString = currentExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/sin\(/g, 'Math.sin(Math.PI/180*') // Degree mode
            .replace(/cos\(/g, 'Math.cos(Math.PI/180*')
            .replace(/tan\(/g, 'Math.tan(Math.PI/180*')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**');

        // Close open parentheses automatically
        const openP = (evalString.match(/\(/g) || []).length;
        const closeP = (evalString.match(/\)/g) || []).length;
        if (openP > closeP) {
            evalString += ')'.repeat(openP - closeP);
        }

        const result = eval(evalString);

        if (!isFinite(result) || isNaN(result)) {
            throw new Error("Invalid Result");
        }

        lastResult = result;
        // Check if result is float
        if (Number.isInteger(result)) {
            currentExpression = result.toString();
        } else {
            // Avoid precision errors like 0.30000000000000004
            currentExpression = parseFloat(result.toFixed(8)).toString();
        }

        history.textContent = evalString
            .replace(/Math\./g, '')
            .replace(/PI/g, 'π')
            .replace(/E/g, 'e')
            .replace(/\*\*/g, '^');

    } catch (e) {
        currentExpression = 'Error';
    }
    updateDisplay();
}

function updateDisplay() {
    display.textContent = currentExpression || '0';
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key >= '0' && key <= '9') append(key);
    if (key === '.') append('.');
    if (key === '+') append('+');
    if (key === '-') append('-');
    if (key === '*') append('*');
    if (key === '/') append('/');
    if (key === '(') append('(');
    if (key === ')') append(')');
    if (key === '^') append('^');
    if (key === 'Enter' || key === '=') handleAction('calculate');
    if (key === 'Backspace') handleAction('delete');
    if (key === 'Escape') handleAction('clear');
});
