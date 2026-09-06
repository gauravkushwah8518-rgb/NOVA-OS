/* NovaOS File Manager — a single local simulated filesystem with text editing. */
import { Storage } from '../storage.js';
import { showNotification } from '../notifications.js';

const DEFAULT_FILES = [
    { id: '1', name: 'Documents', type: 'folder', items: [{ id: '1-1', name: 'Welcome.txt', type: 'file', content: 'Welcome to NovaOS virtual file manager! All files are saved locally.' }, { id: '1-2', name: 'Project_Roadmap.txt', type: 'file', content: '- Build futuristic UI\n- Add interactive apps\n- Optimize performance' }] },
    { id: '2', name: 'Pictures', type: 'folder', items: [{ id: '2-1', name: 'Nebula_Wallpaper.png', type: 'image', content: 'placeholder' }] },
    { id: '3', name: 'Projects', type: 'folder', items: [{ id: '3-1', name: 'NovaOS_Spec.md', type: 'file', content: '# NovaOS Specification\nPure HTML5, CSS3, and Vanilla JavaScript.' }] },
    { id: '4', name: 'Downloads', type: 'folder', items: [] }
];
const TEXT_TYPES = ['txt', 'md', 'json', 'html', 'css', 'js'];
const escapeHtml = value => { const node = document.createElement('div'); node.textContent = value || ''; return node.innerHTML; };
const extension = name => (name.split('.').pop() || '').toLowerCase();

export function renderFileManager(container) {
    let filesystem = Storage.get('filesystem', DEFAULT_FILES); if (!Array.isArray(filesystem)) filesystem = structuredClone(DEFAULT_FILES);
    let currentPath = []; let selectedId = null; let editor = null;
    function items() { let folder = filesystem; for (const id of currentPath) { const item = folder.find(entry => entry.id === id); if (!item?.items) { currentPath = []; return filesystem; } folder = item.items; } return folder; }
    function pathName() { let folder = filesystem; const names = []; currentPath.forEach(id => { const item = folder.find(entry => entry.id === id); if (item) { names.push(item.name); folder = item.items || []; } }); return names.length ? names.join(' / ') : 'My Computer'; }
    function save() { Storage.set('filesystem', filesystem); }
    function render() {
        if (editor) return renderEditor();
        const currentItems = items();
        container.innerHTML = `<div class="app-container"><div class="fm-toolbar"><button class="fm-btn" id="fm-back-btn" ${currentPath.length ? '' : 'disabled'}>⬅ Back</button><div class="fm-path-bar">📁 root/${escapeHtml(pathName())}</div><button class="fm-btn" id="fm-new-folder">+ Folder</button><button class="fm-btn" id="fm-new-file">+ File</button><button class="fm-btn" id="fm-rename-btn" ${selectedId ? '' : 'disabled'}>✏️ Rename</button><button class="fm-btn danger" id="fm-delete-btn" ${selectedId ? '' : 'disabled'}>🗑️ Delete</button></div><div class="fm-grid" id="fm-items-grid">${currentItems.length ? currentItems.map(item => `<button class="fm-item ${item.id === selectedId ? 'selected' : ''}" data-id="${item.id}" data-type="${item.type}"><span class="fm-item-icon">${item.type === 'folder' ? '📁' : item.type === 'image' ? '🖼️' : '📄'}</span><span class="fm-item-name">${escapeHtml(item.name)}</span></button>`).join('') : '<div class="empty-state">This folder is empty.</div>'}</div></div>`;
        container.querySelector('#fm-back-btn')?.addEventListener('click', () => { currentPath.pop(); selectedId = null; render(); });
        container.querySelector('#fm-new-folder')?.addEventListener('click', () => createFolder(currentItems));
        container.querySelector('#fm-new-file')?.addEventListener('click', () => createFile(currentItems));
        container.querySelector('#fm-rename-btn')?.addEventListener('click', () => renameItem(currentItems));
        container.querySelector('#fm-delete-btn')?.addEventListener('click', () => deleteItem(currentItems));
        container.querySelectorAll('.fm-item').forEach(element => {
            const item = currentItems.find(entry => entry.id === element.dataset.id);
            let clickTimer = null;
            element.addEventListener('click', () => {
                if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; openItem(item); return; }
                clickTimer = setTimeout(() => { selectedId = element.dataset.id; render(); }, 260);
            });
            element.addEventListener('keydown', event => { if (event.key === 'Enter') openItem(item); });
        });
        container.querySelector('#fm-items-grid')?.addEventListener('click', event => { if (event.target.id === 'fm-items-grid') { selectedId = null; render(); } });
    }
    function createFolder(currentItems) { const name = prompt('Enter folder name:', 'New Folder'); if (name?.trim()) { currentItems.push({ id: String(Date.now()), name: name.trim(), type: 'folder', items: [] }); save(); showNotification('Files', `Folder “${name.trim()}” created.`); render(); } }
    function createFile(currentItems) { const name = prompt('Enter file name:', 'New Document.txt'); if (name?.trim()) { currentItems.push({ id: String(Date.now()), name: name.trim(), type: 'file', content: '' }); save(); showNotification('Files', `File “${name.trim()}” created.`); render(); } }
    function renameItem(currentItems) { const item = currentItems.find(entry => entry.id === selectedId); if (!item) return; const name = prompt('Rename to:', item.name); if (name?.trim() && name.trim() !== item.name) { item.name = name.trim(); save(); render(); } }
    function deleteItem(currentItems) { const item = currentItems.find(entry => entry.id === selectedId); if (!item || !confirm(`Delete “${item.name}”?`)) return; currentItems.splice(currentItems.indexOf(item), 1); selectedId = null; save(); showNotification('Files', 'Item deleted.'); render(); }
    function openItem(item) { if (!item) return; if (item.type === 'folder') { currentPath.push(item.id); selectedId = null; render(); return; } if (!TEXT_TYPES.includes(extension(item.name))) { showNotification('Files', 'This demo can edit text files only.'); return; } editor = { item, original: String(item.content || '') }; render(); }
    function renderEditor() {
        const { item, original } = editor;
        container.innerHTML = `<div class="file-editor app-container"><div class="fm-toolbar"><button class="fm-btn" id="editor-cancel">← Files</button><div class="fm-path-bar">✎ ${escapeHtml(item.name)} <span id="editor-dirty"></span></div><button class="fm-btn" id="editor-save">Save</button></div><textarea id="file-editor-text" class="file-editor-text" spellcheck="false" aria-label="Edit ${escapeHtml(item.name)}">${escapeHtml(original)}</textarea><small class="editor-hint">Ctrl/Cmd + S saves. Changes stay in NovaOS’s local simulated filesystem.</small></div>`;
        const text = container.querySelector('#file-editor-text'); const dirty = container.querySelector('#editor-dirty');
        const updateDirty = () => { dirty.textContent = text.value !== original ? '• Unsaved changes' : ''; };
        const leave = () => { if (text.value !== original && !confirm('Discard unsaved changes?')) return; editor = null; render(); };
        const write = () => { item.content = text.value; save(); editor = { item, original: text.value }; updateDirty(); showNotification('Files', `Saved “${item.name}”.`); };
        text.addEventListener('input', updateDirty); text.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); write(); } });
        container.querySelector('#editor-save')?.addEventListener('click', write); container.querySelector('#editor-cancel')?.addEventListener('click', leave); text.focus(); updateDirty();
    }
    render();
}
