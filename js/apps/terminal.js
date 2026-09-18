/* NovaOS Terminal — NovaBash 2.0. Operates on the Files app's local simulated filesystem. */
import { Storage } from '../storage.js?v=7';

const DEFAULT_FILES = () => [
    { id: '1', name: 'Documents', type: 'folder', items: [{ id: '1-1', name: 'Welcome.txt', type: 'file', content: 'Welcome to NovaOS virtual file manager! All files are saved locally.' }, { id: '1-2', name: 'Project_Roadmap.txt', type: 'file', content: '- Build futuristic UI\\n- Add interactive apps\\n- Optimize performance' }] },
    { id: '2', name: 'Pictures', type: 'folder', items: [{ id: '2-1', name: 'Nebula_Wallpaper.png', type: 'image', content: 'placeholder' }] },
    { id: '3', name: 'Projects', type: 'folder', items: [{ id: '3-1', name: 'NovaOS_Spec.md', type: 'file', content: '# NovaOS Specification\\nPure HTML5, CSS3, and Vanilla JavaScript.' }] },
    { id: '4', name: 'Downloads', type: 'folder', items: [] }
];

const escapeHtml = value => { const node = document.createElement('div'); node.textContent = value == null ? '' : String(value); return node.innerHTML; };

const COLORS = {
    dir: '#c084fc',
    exe: '#34d399',
    file: '#e9d5ff',
    err: '#f87171',
    info: '#93c5fd',
    warn: '#fbbf24',
    dim: 'rgba(233, 213, 255, 0.55)'
};

export function renderTerminal(container) {
    container.innerHTML = `
        <div class="terminal-container" id="terminal-box">
            <div class="terminal-output" id="terminal-output">
                <div>NovaOS v2.5.0 [Virtual Environment]</div>
                <div>Type <strong>help</strong> for commands, <strong>Tab</strong> to complete, <strong>↑/↓</strong> for history.</div>
                <br>
            </div>
            <div class="terminal-prompt-line">
                <span class="terminal-prompt" id="terminal-prompt">root@novaos:~#</span>
                <input type="text" class="terminal-input" id="terminal-input" autofocus autocomplete="off" spellcheck="false">
            </div>
        </div>
    `;

    const outputBox = container.querySelector('#terminal-output');
    const inputBox = container.querySelector('#terminal-input');
    const promptEl = container.querySelector('#terminal-prompt');
    const terminalBox = container.querySelector('#terminal-box');

    let history = [];
    let historyIndex = -1;
    let cwd = []; // path of folder ids, mirrors Files app

    /* ---------- filesystem helpers (shared with the Files app storage) ---------- */
    function loadFs() {
        let fs = Storage.get('filesystem', null);
        if (!Array.isArray(fs)) fs = DEFAULT_FILES();
        return fs;
    }
    function resolve(pathStr, create = false) {
        const fs = loadFs();
        let folder = fs;
        const parts = String(pathStr || '').split('/').filter(Boolean);
        if (String(pathStr || '').startsWith('/')) { cwd = []; }
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') { cwd.pop(); folder = walk(fs, cwd); continue; }
            if (part === '~') { cwd = []; folder = fs; continue; }
            let entry = folder.find(item => item.name.toLowerCase() === part.toLowerCase() && item.type === 'folder');
            if (!entry && create) { entry = { id: String(Date.now()) + Math.floor(Math.random() * 99), name: part, type: 'folder', items: [] }; folder.push(entry); Storage.set('filesystem', fs); }
            if (!entry) return { error: `cd: no such directory: ${part}` };
            if (entry.type !== 'folder') return { error: `cd: not a directory: ${part}` };
            cwd.push(entry.id);
            folder = entry.items || [];
        }
        return { folder, fs };
    }
    function walk(fs, ids) { let folder = fs; for (const id of ids) { const entry = folder.find(item => item.id === id); if (!entry?.items) return fs; folder = entry.items; } return folder; }
    function currentFolder() { const fs = loadFs(); return walk(fs, cwd); }
    function findEntry(pathStr) {
        const fs = loadFs();
        const parts = String(pathStr || '').split('/').filter(Boolean);
        let folder = walk(fs, cwd);
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === '.') continue;
            if (part === '..') { folder = walk(fs, cwd.slice(0, Math.max(0, cwd.length - 1 - parts.slice(0, i).filter(p => p !== '.' && p !== '..').length))); continue; }
            const entry = folder.find(item => item.name.toLowerCase() === part.toLowerCase());
            if (!entry) return { error: `no such file or directory: ${pathStr}` };
            if (i === parts.length - 1) return { entry };
            if (entry.type !== 'folder') return { error: `not a directory: ${pathStr}` };
            folder = entry.items || [];
        }
        return { error: `no such file or directory: ${pathStr}` };
    }
    function displayPath() {
        const fs = loadFs();
        const names = [];
        let folder = fs;
        for (const id of cwd) { const entry = folder.find(item => item.id === id); if (!entry) break; names.push(entry.name); folder = entry.items || []; }
        return '~/' + names.join('/');
    }
    function updatePrompt() { promptEl.textContent = `root@novaos:${displayPath()}#`; }
    updatePrompt();

    /* ---------- output helpers ---------- */
    function appendOutput(text, isHtml = false) {
        const div = document.createElement('div');
        if (isHtml) div.innerHTML = text;
        else { div.style.whiteSpace = 'pre-wrap'; div.textContent = text; }
        outputBox.appendChild(div);
        terminalBox.scrollTop = terminalBox.scrollHeight;
    }
    const colored = (text, color) => `<span style="color:${color}">${escapeHtml(text)}</span>`;

    /* ---------- tab completion ---------- */
    function complete() {
        const value = inputBox.value;
        const parts = value.split(' ');
        const frag = parts[parts.length - 1];
        if (parts.length === 1) {
            const commands = ['help', 'clear', 'date', 'time', 'about', 'whoami', 'ls', 'cd', 'cat', 'mkdir', 'touch', 'rm', 'pwd', 'echo', 'open', 'neofetch', 'history', 'reboot'];
            const matches = commands.filter(c => c.startsWith(frag.toLowerCase()));
            if (matches.length === 1) inputBox.value = matches[0] + ' ';
            else if (matches.length > 1) { appendOutput(`${escapeHtml(value)}${colored(matches.join('  '), COLORS.info)}`, true); }
            return;
        }
        const fs = loadFs();
        const folder = walk(fs, cwd);
        const matches = folder.filter(item => item.name.toLowerCase().startsWith(frag.toLowerCase()));
        if (matches.length === 1) { parts[parts.length - 1] = matches[0].name; inputBox.value = parts.join(' ') + (matches[0].type === 'folder' ? '/' : ' '); }
        else if (matches.length > 1) { appendOutput(colored(matches.map(m => m.name + (m.type === 'folder' ? '/' : '')).join('  '), COLORS.info), true); }
    }

    /* ---------- input handling ---------- */
    inputBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = inputBox.value.trim();
            if (!cmd) { appendOutput(`${escapeHtml(promptEl.textContent)} `); return; }
            history.push(cmd);
            historyIndex = history.length;
            appendOutput(`${colored('root@novaos', COLORS.dir)}:${colored(displayPath(), COLORS.exe)}# ${escapeHtml(cmd)}`, true);
            processCommand(cmd);
            inputBox.value = '';
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) { historyIndex--; inputBox.value = history[historyIndex]; }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < history.length - 1) { historyIndex++; inputBox.value = history[historyIndex]; }
            else { historyIndex = history.length; inputBox.value = ''; }
            e.preventDefault();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            complete();
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            outputBox.innerHTML = '';
        }
    });

    /* ---------- command engine ---------- */
    function processCommand(rawCmd) {
        const parts = rawCmd.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        const arg = args[0];

        switch (cmd) {
            case 'help':
                appendOutput(
`Available commands:
  ${colored('help', COLORS.exe)}       - Show this help message
  ${colored('ls', COLORS.exe)} [path]  - List files and folders
  ${colored('cd', COLORS.exe)} [path]  - Change directory (supports .. ~ .)
  ${colored('pwd', COLORS.exe)}        - Print working directory
  ${colored('cat', COLORS.exe)} <file> - Print a text file's contents
  ${colored('mkdir', COLORS.exe)} <name> - Create a folder
  ${colored('touch', COLORS.exe)} <name> - Create an empty file
  ${colored('rm', COLORS.exe)} <name>  - Delete a file or folder
  ${colored('open', COLORS.exe)} <app> - Launch an app (files, notes, calc, paint, music, settings...)
  ${colored('echo', COLORS.exe)} <text>  - Print text
  ${colored('date', COLORS.exe)} / ${colored('time', COLORS.exe)}   - Show current date / time
  ${colored('whoami', COLORS.exe)}     - Display current user
  ${colored('history', COLORS.exe)}    - Show command history
  ${colored('neofetch', COLORS.exe)}   - Display system info art
  ${colored('about', COLORS.exe)}      - Show NovaOS info
  ${colored('clear', COLORS.exe)} (or Ctrl+L) - Clear the screen
  ${colored('reboot', COLORS.exe)}     - Restart NovaOS`, true);
                break;
            case 'clear':
                outputBox.innerHTML = '';
                break;
            case 'pwd':
                appendOutput(displayPath());
                break;
            case 'ls': {
                const target = arg ? resolve(arg) : { folder: currentFolder() };
                if (target.error) { appendOutput(colored(target.error, COLORS.err), true); break; }
                const items = target.folder || [];
                if (!items.length) { appendOutput(colored('(empty)', COLORS.dim), true); break; }
                appendOutput(items.map(item => item.type === 'folder' ? colored(item.name + '/', COLORS.dir) : item.type === 'image' ? colored(item.name, COLORS.warn) : colored(item.name, COLORS.file)).join('   '), true);
                break;
            }
            case 'cd': {
                if (!arg || arg === '~') { cwd = []; updatePrompt(); break; }
                const result = resolve(arg);
                if (result.error) { appendOutput(colored(result.error, COLORS.err), true); break; }
                updatePrompt();
                break;
            }
            case 'cat': {
                if (!arg) { appendOutput(colored('cat: missing file operand', COLORS.err), true); break; }
                const found = findEntry(arg);
                if (found.error) { appendOutput(colored(`cat: ${found.error}`, COLORS.err), true); break; }
                if (found.entry.type === 'folder') { appendOutput(colored(`cat: ${arg}: Is a directory`, COLORS.err), true); break; }
                appendOutput(String(found.entry.content ?? '(binary file)'));
                break;
            }
            case 'mkdir': {
                if (!arg) { appendOutput(colored('mkdir: missing operand', COLORS.err), true); break; }
                const fs = loadFs();
                const folder = walk(fs, cwd);
                if (folder.some(item => item.name.toLowerCase() === arg.toLowerCase())) { appendOutput(colored(`mkdir: '${arg}' already exists`, COLORS.err), true); break; }
                folder.push({ id: String(Date.now()), name: arg, type: 'folder', items: [] });
                Storage.set('filesystem', fs);
                appendOutput(colored(`Created directory '${arg}'`, COLORS.info), true);
                break;
            }
            case 'touch': {
                if (!arg) { appendOutput(colored('touch: missing file operand', COLORS.err), true); break; }
                const fs = loadFs();
                const folder = walk(fs, cwd);
                if (folder.some(item => item.name.toLowerCase() === arg.toLowerCase())) { appendOutput(colored(`touch: '${arg}' already exists`, COLORS.warn), true); break; }
                folder.push({ id: String(Date.now()), name: arg, type: 'file', content: '' });
                Storage.set('filesystem', fs);
                appendOutput(colored(`Created file '${arg}'`, COLORS.info), true);
                break;
            }
            case 'rm': {
                if (!arg) { appendOutput(colored('rm: missing operand', COLORS.err), true); break; }
                const fs = loadFs();
                const folder = walk(fs, cwd);
                const index = folder.findIndex(item => item.name.toLowerCase() === arg.toLowerCase());
                if (index === -1) { appendOutput(colored(`rm: cannot remove '${arg}': No such file or directory`, COLORS.err), true); break; }
                const [removed] = folder.splice(index, 1);
                Storage.set('filesystem', fs);
                appendOutput(colored(`Removed '${removed.name}'`, COLORS.info), true);
                break;
            }
            case 'open': {
                const alias = { files: 'files', notes: 'notes', calculator: 'calculator', calc: 'calculator', terminal: 'terminal', paint: 'paint', settings: 'settings', clock: 'clock', about: 'about', music: 'music', calendar: 'calendar', weather: 'weather' };
                const appId = alias[(arg || '').toLowerCase()];
                if (!appId) { appendOutput(colored(`open: unknown app '${arg || ''}'. Try: files, notes, calc, paint, music, settings`, COLORS.err), true); break; }
                appendOutput(colored(`Launching ${appId}…`, COLORS.info), true);
                import('../start-menu.js?v=7').then(m => m.launchApp(appId));
                break;
            }
            case 'reboot':
                appendOutput(colored('Rebooting NovaOS…', COLORS.warn), true);
                setTimeout(() => location.reload(), 600);
                break;
            case 'date':
                appendOutput(new Date().toDateString());
                break;
            case 'time':
                appendOutput(new Date().toLocaleTimeString());
                break;
            case 'about':
                appendOutput('NovaOS v2.5 — A futuristic browser-based virtual operating system by Gaurav Kushwah.');
                break;
            case 'whoami':
                appendOutput('root (NovaOS Administrator)');
                break;
            case 'history':
                history.forEach((entry, i) => appendOutput(colored(String(i + 1).padStart(3) + '  ', COLORS.dim) + escapeHtml(entry), true));
                break;
            case 'echo':
                appendOutput(args.join(' '));
                break;
            case 'neofetch':
                appendOutput(`      ___  _   _             ___  ____
     / _ \\| | | |           / _ \\/ ___|
    | | | | | | |   _____  | | | \\___ \\
    | |_| | |_| |  |_____| | |_| |___) |
     \\___/ \\___/            \\___/|____/
    ---------------------------------
    ${colored('OS:', COLORS.dir)} NovaOS v2.5 Web-Native
    ${colored('Kernel:', COLORS.dir)} Vanilla JS ES2026
    ${colored('Shell:', COLORS.dir)} NovaBash 2.0
    ${colored('Theme:', COLORS.dir)} Neon Purple Glassmorphic
    ${colored('Storage:', COLORS.dir)} LocalStorage Active
    ${colored('Author:', COLORS.dir)} Gaurav Kushwah`, true);
                break;
            default:
                appendOutput(colored(`command not found: ${cmd}`, COLORS.err) + colored(` — type 'help' for available commands.`, COLORS.dim), true);
        }
    }

    container.addEventListener('click', () => inputBox.focus());
}
