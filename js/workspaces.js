/* NovaOS virtual workspaces: a small shared state layer for the window manager. */
import { Storage } from './storage.js';

const DEFAULT_STATE = { current: 1, workspaces: [1, 2, 3, 4] };
let state = DEFAULT_STATE;

function safeState() {
    const saved = Storage.get('workspaceState', DEFAULT_STATE);
    if (!saved || !Array.isArray(saved.workspaces) || saved.workspaces.length < 1) return { ...DEFAULT_STATE, workspaces: [...DEFAULT_STATE.workspaces] };
    return { current: saved.workspaces.includes(Number(saved.current)) ? Number(saved.current) : 1, workspaces: saved.workspaces.slice(0, 4) };
}

export function getCurrentWorkspace() { return state.current; }

export function initWorkspaces() {
    state = safeState();
    const switcher = document.getElementById('workspace-switcher');
    if (!switcher || switcher.dataset.initialized) return;
    switcher.dataset.initialized = 'true';

    function render() {
        switcher.innerHTML = state.workspaces.map(number => `<button class="workspace-button ${number === state.current ? 'active' : ''}" data-workspace="${number}" aria-label="Switch to workspace ${number}" title="Workspace ${number}">${number}</button>`).join('');
        switcher.querySelectorAll('.workspace-button').forEach(button => button.addEventListener('click', () => switchWorkspace(Number(button.dataset.workspace))));
    }
    render();
    document.addEventListener('novaos:workspace-change', render);
}

export function switchWorkspace(workspace) {
    if (!state.workspaces.includes(workspace) || workspace === state.current) return;
    state.current = workspace;
    Storage.set('workspaceState', state);
    document.dispatchEvent(new CustomEvent('novaos:workspace-change', { detail: { workspace } }));
}
