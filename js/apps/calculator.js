/* NovaOS Calculator App */

export function renderCalculator(container) {
    container.innerHTML = `
        <div class="app-container calculator-app-shell">
            <div class="calc-container">
                <div class="calc-glass-navbar">
                    <div><span class="calc-nav-icon">🧮</span><span>Calculator</span></div>
                    <span class="calc-nav-status">Ready</span>
                </div>
                <div class="calc-display" id="calc-display">0</div>
                <div class="calc-grid">
                    <button class="calc-btn" data-action="clear">C</button>
                    <button class="calc-btn" data-action="sign">±</button>
                    <button class="calc-btn" data-action="percent">%</button>
                    <button class="calc-btn op" data-action="op" data-op="/">÷</button>
                    
                    <button class="calc-btn" data-val="7">7</button>
                    <button class="calc-btn" data-val="8">8</button>
                    <button class="calc-btn" data-val="9">9</button>
                    <button class="calc-btn op" data-action="op" data-op="*">×</button>
                    
                    <button class="calc-btn" data-val="4">4</button>
                    <button class="calc-btn" data-val="5">5</button>
                    <button class="calc-btn" data-val="6">6</button>
                    <button class="calc-btn op" data-action="op" data-op="-">-</button>
                    
                    <button class="calc-btn" data-val="1">1</button>
                    <button class="calc-btn" data-val="2">2</button>
                    <button class="calc-btn" data-val="3">3</button>
                    <button class="calc-btn op" data-action="op" data-op="+">+</button>
                    
                    <button class="calc-btn" data-val="0" style="grid-column: span 2;">0</button>
                    <button class="calc-btn" data-val=".">.</button>
                    <button class="calc-btn eq" data-action="calculate">=</button>
                </div>
            </div>
        </div>
    `;

    const display = container.querySelector('#calc-display');
    let currentValue = '0';
    let previousValue = null;
    let operation = null;
    let resetNext = false;

    function updateDisplay() {
        // Truncate long decimals for display
        let displayVal = currentValue;
        if (displayVal.includes('.') && displayVal.length > 12) {
            displayVal = parseFloat(displayVal).toPrecision(10);
        }
        display.textContent = displayVal;
    }

    function handleNumber(val) {
        if (val === '.' && currentValue.includes('.')) return;
        if (currentValue === '0' || resetNext) {
            currentValue = val === '.' ? '0.' : val;
            resetNext = false;
        } else {
            currentValue += val;
        }
        updateDisplay();
    }

    function handleOperator(op) {
        if (previousValue !== null && operation && !resetNext) {
            calculate();
        }
        previousValue = currentValue;
        operation = op;
        resetNext = true;
    }

    function calculate() {
        if (previousValue === null || operation === null) return;
        const prev = parseFloat(previousValue);
        const curr = parseFloat(currentValue);
        let result = 0;

        switch (operation) {
            case '+': result = prev + curr; break;
            case '-': result = prev - curr; break;
            case '*': result = prev * curr; break;
            case '/':
                if (curr === 0) { result = 'Error'; }
                else { result = prev / curr; }
                break;
        }

        currentValue = String(result);
        previousValue = null;
        operation = null;
        resetNext = true;
        updateDisplay();
    }

    // Button click handling
    container.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');
            const action = btn.getAttribute('data-action');

            if (val !== null) {
                handleNumber(val);
            } else if (action === 'clear') {
                currentValue = '0';
                previousValue = null;
                operation = null;
                resetNext = false;
                updateDisplay();
            } else if (action === 'op') {
                handleOperator(btn.getAttribute('data-op'));
            } else if (action === 'calculate') {
                calculate();
            } else if (action === 'sign') {
                if (currentValue !== '0') {
                    currentValue = String(parseFloat(currentValue) * -1);
                    updateDisplay();
                }
            } else if (action === 'percent') {
                currentValue = String(parseFloat(currentValue) / 100);
                updateDisplay();
            }
        });
    });

    // Keyboard input support
    function handleKeyboard(e) {
        if (!document.body.contains(container)) return;
        const key = e.key;
        if (key >= '0' && key <= '9') { handleNumber(key); e.preventDefault(); }
        else if (key === '.') { handleNumber('.'); e.preventDefault(); }
        else if (key === '+') { handleOperator('+'); e.preventDefault(); }
        else if (key === '-') { handleOperator('-'); e.preventDefault(); }
        else if (key === '*') { handleOperator('*'); e.preventDefault(); }
        else if (key === '/') { handleOperator('/'); e.preventDefault(); }
        else if (key === 'Enter' || key === '=') { calculate(); e.preventDefault(); }
        else if (key === 'Escape' || key === 'c' || key === 'C') {
            currentValue = '0'; previousValue = null; operation = null; resetNext = false;
            updateDisplay(); e.preventDefault();
        }
        else if (key === 'Backspace') {
            if (currentValue.length > 1) { currentValue = currentValue.slice(0, -1); }
            else { currentValue = '0'; }
            updateDisplay(); e.preventDefault();
        }
        else if (key === '%') {
            currentValue = String(parseFloat(currentValue) / 100);
            updateDisplay(); e.preventDefault();
        }
    }

    document.addEventListener('keydown', handleKeyboard);
    // Cleanup when window removed
    const obs = new MutationObserver(() => {
        if (!document.body.contains(container)) {
            document.removeEventListener('keydown', handleKeyboard);
            obs.disconnect();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });
}
