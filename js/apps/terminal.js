/* NovaOS Terminal App */

export function renderTerminal(container) {
    container.innerHTML = `
        <div class="terminal-container" id="terminal-box">
            <div class="terminal-output" id="terminal-output">
                <div>NovaOS v2.4.0 [Virtual Environment]</div>
                <div>Type <strong>help</strong> to see available commands.</div>
                <br>
            </div>
            <div class="terminal-prompt-line">
                <span style="color: #a855f7;">root@novaos:~#</span>
                <input type="text" class="terminal-input" id="terminal-input" autofocus autocomplete="off" spellcheck="false">
            </div>
        </div>
    `;

    const outputBox = container.querySelector('#terminal-output');
    const inputBox = container.querySelector('#terminal-input');
    const terminalBox = container.querySelector('#terminal-box');

    let history = [];
    let historyIndex = -1;

    function appendOutput(text, isHtml = false) {
        const div = document.createElement('div');
        if (isHtml) {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        outputBox.appendChild(div);
        terminalBox.scrollTop = terminalBox.scrollHeight;
    }

    inputBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = inputBox.value.trim();
            if (!cmd) return;

            history.push(cmd);
            historyIndex = history.length;

            appendOutput(`root@novaos:~# ${cmd}`);
            processCommand(cmd);
            inputBox.value = '';
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                inputBox.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                inputBox.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                inputBox.value = '';
            }
        }
    });

    function processCommand(rawCmd) {
        const parts = rawCmd.split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts[1];

        switch (cmd) {
            case 'help':
                appendOutput('Available commands:\n  help     - Show this help message\n  clear    - Clear terminal screen\n  date     - Show current date\n  time     - Show current time\n  about    - Show NovaOS info\n  whoami   - Display current user\n  ls       - List virtual directories\n  neofetch - Display system info art\n  echo     - Print text');
                break;
            case 'clear':
                outputBox.innerHTML = '';
                break;
            case 'date':
                appendOutput(new Date().toDateString());
                break;
            case 'time':
                appendOutput(new Date().toLocaleTimeString());
                break;
            case 'about':
                appendOutput('NovaOS v2.4 — A futuristic browser-based virtual operating system.');
                break;
            case 'whoami':
                appendOutput('root (NovaOS Administrator)');
                break;
            case 'ls':
                appendOutput('Documents/\nPictures/\nProjects/\nDownloads/');
                break;
            case 'neofetch':
                appendOutput(`
      ___  _   _             ___  ____ 
     / _ \\| | | |           / _ \\/ ___|
    | | | | | | |   _____  | | | \\___ \\
    | |_| | |_| |  |_____| | |_| |___) |
     \\___/ \\___/            \\___/|____/ 
    ---------------------------------
    OS: NovaOS v2.4 Web-Native
    Kernel: Vanilla JS ES2026
    Shell: NovaBash 1.0
    Theme: Neon Purple Glassmorphic
    Storage: LocalStorage Active
                `, false);
                break;
            case 'echo':
                appendOutput(parts.slice(1).join(' '));
                break;
            default:
                appendOutput(`command not found: ${cmd}. Type 'help' for available commands.`);
                break;
        }
    }

    container.addEventListener('click', () => {
        inputBox.focus();
    });
}
