/* NovaOS Notes App */

import { Storage } from '../storage.js';
import { showNotification } from '../notifications.js';

const NOTE_COLORS = [
    { name: 'Default', value: 'transparent' },
    { name: 'Purple', value: 'rgba(168,85,247,0.15)' },
    { name: 'Blue', value: 'rgba(59,130,246,0.15)' },
    { name: 'Green', value: 'rgba(16,185,129,0.15)' },
    { name: 'Yellow', value: 'rgba(234,179,8,0.15)' },
    { name: 'Red', value: 'rgba(239,68,68,0.15)' }
];

const DEFAULT_NOTES = [
    { id: '1', title: 'Welcome Note', body: 'Welcome to NovaOS Notes! Your thoughts are saved locally.', date: '2026-09-04', color: 'transparent', pinned: false },
    { id: '2', title: 'Ideas & Features', body: '- Glassmorphism desktop\n- Interactive window manager\n- Zero latency shell', date: '2026-09-04', color: 'rgba(168,85,247,0.15)', pinned: true }
];

export function renderNotesApp(container) {
    let notes = Storage.get('notes', DEFAULT_NOTES);
    let activeNoteId = notes[0] ? notes[0].id : null;
    let searchQuery = '';

    function getFilteredNotes() {
        let filtered = notes.filter(n =>
            n.title.toLowerCase().includes(searchQuery) ||
            n.body.toLowerCase().includes(searchQuery)
        );
        // Pinned notes first
        filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        return filtered;
    }

    function render() {
        const filtered = getFilteredNotes();
        const activeNote = notes.find(n => n.id === activeNoteId) || filtered[0] || null;
        if (activeNote) activeNoteId = activeNote.id;

        const colorOptions = NOTE_COLORS.map(c =>
            `<div class="note-color-dot" data-color="${c.value}" title="${c.name}" style="width:20px;height:20px;border-radius:50%;cursor:pointer;border:2px solid ${activeNote && activeNote.color === c.value ? '#a855f7' : 'transparent'};background:${c.value === 'transparent' ? 'rgba(255,255,255,0.1)' : c.value};transition:border 0.2s;"></div>`
        ).join('');

        container.innerHTML = `
            <div class="app-container">
                <div class="notes-layout">
                    <div class="notes-sidebar">
                        <button class="fm-btn" id="notes-new-btn">+ New Note</button>
                        <input type="text" class="note-title-input" id="notes-search" placeholder="🔍 Search notes..." value="${searchQuery}" style="font-size:0.85rem;">
                        <div class="notes-list" id="notes-list-area">
                            ${filtered.length === 0 ? '<div style="color:var(--text-muted);font-size:0.85rem;padding:20px;text-align:center;">No notes found</div>' : ''}
                            ${filtered.map(n => `
                                <div class="note-preview-card ${n.id === activeNoteId ? 'active' : ''}" data-id="${n.id}" style="background:${n.color || 'transparent'};">
                                    <div style="display:flex;justify-content:space-between;align-items:center;">
                                        <div style="font-weight:700;font-size:0.85rem;margin-bottom:2px;">${n.pinned ? '📌 ' : ''}${n.title || 'Untitled'}</div>
                                    </div>
                                    <div style="font-size:0.75rem;color:var(--text-muted);">${n.date}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="note-editor-area">
                        ${activeNote ? `
                            <div style="display:flex;gap:8px;align-items:center;">
                                <input type="text" class="note-title-input" id="note-title" value="${activeNote.title}" placeholder="Note Title..." style="flex:1;">
                                <button class="fm-btn" id="note-pin-btn" title="Pin/Unpin">${activeNote.pinned ? '📌' : '📍'}</button>
                                <button class="fm-btn" id="note-delete-btn" style="background:rgba(239,68,68,0.2);color:#ef4444;">Delete</button>
                            </div>
                            <div style="display:flex;gap:6px;align-items:center;">
                                <span style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">Color:</span>
                                ${colorOptions}
                            </div>
                            <textarea class="note-body-input" id="note-body" placeholder="Write your thoughts here...">${activeNote.body}</textarea>
                        ` : '<div style="color:var(--text-muted);padding:40px;">No notes selected. Click "+ New Note".</div>'}
                    </div>
                </div>
            </div>
        `;

        // Listeners
        container.querySelector('#notes-new-btn').addEventListener('click', () => {
            const newNote = { id: Date.now().toString(), title: 'New Note', body: '', date: new Date().toISOString().split('T')[0], color: 'transparent', pinned: false };
            notes.unshift(newNote);
            activeNoteId = newNote.id;
            Storage.set('notes', notes);
            showNotification('Notes', 'New note created.');
            render();
        });

        const searchInput = container.querySelector('#notes-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase();
                render();
            });
        }

        container.querySelectorAll('.note-preview-card').forEach(card => {
            card.addEventListener('click', () => { activeNoteId = card.getAttribute('data-id'); render(); });
        });

        const titleInput = container.querySelector('#note-title');
        const bodyInput = container.querySelector('#note-body');

        if (titleInput && activeNote) {
            titleInput.addEventListener('input', (e) => {
                activeNote.title = e.target.value;
                activeNote.date = new Date().toISOString().split('T')[0];
                Storage.set('notes', notes);
            });
        }

        if (bodyInput && activeNote) {
            bodyInput.addEventListener('input', (e) => {
                activeNote.body = e.target.value;
                Storage.set('notes', notes);
            });
        }

        container.querySelector('#note-pin-btn')?.addEventListener('click', () => {
            activeNote.pinned = !activeNote.pinned;
            Storage.set('notes', notes);
            showNotification('Notes', activeNote.pinned ? 'Note pinned.' : 'Note unpinned.');
            render();
        });

        container.querySelector('#note-delete-btn')?.addEventListener('click', () => {
            notes = notes.filter(n => n.id !== activeNoteId);
            activeNoteId = notes[0] ? notes[0].id : null;
            Storage.set('notes', notes);
            showNotification('Notes', 'Note deleted.');
            render();
        });

        container.querySelectorAll('.note-color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                if (!activeNote) return;
                activeNote.color = dot.getAttribute('data-color');
                Storage.set('notes', notes);
                render();
            });
        });
    }

    render();
}
