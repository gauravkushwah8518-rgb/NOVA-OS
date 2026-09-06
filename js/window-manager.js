/* NovaOS central window manager: focus, drag, resize, snap, and workspace visibility. */
import { getCurrentWorkspace, switchWorkspace } from './workspaces.js';

let highestZIndex = 100;
const openWindows = new Map();
const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;

export function initWindowManager() {}

export function openAppWindow(appId, appTitle, appIcon, renderContentCallback) {
    const desktopEnv = document.getElementById('desktop-env');
    if (!desktopEnv) return;
    if (openWindows.has(appId)) {
        const current = openWindows.get(appId);
        if (current.workspace !== getCurrentWorkspace()) switchWorkspace(current.workspace);
        current.windowEl.classList.remove('minimized'); current.taskbarIcon?.classList.add('active'); bringWindowToFront(current.windowEl); return;
    }
    const offset = (openWindows.size % 5) * 30;
    const winEl = document.createElement('section');
    winEl.className = 'os-window focused animate-fade-in'; winEl.style.zIndex = ++highestZIndex; winEl.style.top = `${60 + offset}px`; winEl.style.left = `${80 + offset}px`;
    winEl.dataset.app = appId; winEl.dataset.workspace = String(getCurrentWorkspace());
    winEl.innerHTML = `<div class="window-header"><div class="window-title-area"><span class="window-icon">${appIcon}</span><span class="window-title">${appTitle}</span></div><div class="window-controls"><button class="win-ctrl-btn workspace" title="Move to next workspace" aria-label="Move ${appTitle} to next workspace">◫</button><button class="win-ctrl-btn minimize" title="Minimize" aria-label="Minimize ${appTitle}">🗕</button><button class="win-ctrl-btn maximize" title="Maximize ${appTitle}" aria-label="Maximize ${appTitle}">🗖</button><button class="win-ctrl-btn close" title="Close" aria-label="Close ${appTitle}">✕</button></div></div><div class="window-content" id="window-content-${appId}"></div>${resizeHandles()}`;
    desktopEnv.appendChild(winEl);
    renderContentCallback?.(winEl.querySelector(`#window-content-${appId}`), winEl);
    const taskbarApps = document.getElementById('taskbar-apps');
    let taskbarIcon = null;
    if (taskbarApps) {
        taskbarIcon = document.createElement('button'); taskbarIcon.className = 'taskbar-app-icon active'; taskbarIcon.title = appTitle; taskbarIcon.setAttribute('aria-label', appTitle); taskbarIcon.innerHTML = appIcon;
        taskbarIcon.addEventListener('click', () => {
            const record = openWindows.get(appId); if (!record) return;
            if (record.workspace !== getCurrentWorkspace()) switchWorkspace(record.workspace);
            if (winEl.classList.contains('minimized')) { winEl.classList.remove('minimized'); taskbarIcon.classList.add('active'); bringWindowToFront(winEl); }
            else if (getHighestFocusedWindow() === winEl) { winEl.classList.add('minimized'); taskbarIcon.classList.remove('active'); }
            else bringWindowToFront(winEl);
        }); taskbarApps.appendChild(taskbarIcon);
    }
    openWindows.set(appId, { windowEl: winEl, taskbarIcon, workspace: getCurrentWorkspace() });
    wireControls(winEl, appId, taskbarIcon); wireDragAndSnap(winEl); wireResize(winEl); winEl.addEventListener('mousedown', () => bringWindowToFront(winEl));
    bringWindowToFront(winEl); updateWorkspaceVisibility();
}

function resizeHandles() { return ['n','s','e','w','nw','ne','sw','se'].map(direction => `<span class="resize-handle resize-${direction}" data-resize="${direction}" aria-hidden="true"></span>`).join(''); }
function wireControls(winEl, appId, taskbarIcon) {
    const min = winEl.querySelector('.minimize'); const max = winEl.querySelector('.maximize'); const close = winEl.querySelector('.close'); const workspace = winEl.querySelector('.workspace');
    [min, max, close, workspace].forEach(button => button?.addEventListener('pointerdown', event => event.stopPropagation()));
    min?.addEventListener('click', event => { event.stopPropagation(); winEl.classList.add('minimized'); taskbarIcon?.classList.remove('active'); });
    max?.addEventListener('click', event => { event.stopPropagation(); toggleMaximize(winEl); });
    workspace?.addEventListener('click', event => { event.stopPropagation(); const record = openWindows.get(appId); if (!record) return; record.workspace = record.workspace % 4 + 1; winEl.dataset.workspace = String(record.workspace); switchWorkspace(record.workspace); });
    close?.addEventListener('click', event => { event.stopPropagation(); winEl.remove(); taskbarIcon?.remove(); openWindows.delete(appId); });
    winEl.querySelector('.window-header')?.addEventListener('dblclick', event => { if (!event.target.closest('.window-controls')) toggleMaximize(winEl); });
}
function toggleMaximize(winEl) { if (winEl.classList.contains('maximized')) restoreBounds(winEl); else { saveBounds(winEl); winEl.classList.add('maximized'); } bringWindowToFront(winEl); }
function saveBounds(winEl) { if (!winEl.dataset.restoreBounds) winEl.dataset.restoreBounds = JSON.stringify({ left: winEl.style.left, top: winEl.style.top, width: winEl.style.width, height: winEl.style.height }); }
function restoreBounds(winEl) { const saved = parseBounds(winEl); winEl.classList.remove('maximized', 'snapped'); if (saved) Object.assign(winEl.style, saved); delete winEl.dataset.restoreBounds; }
function parseBounds(winEl) { try { return JSON.parse(winEl.dataset.restoreBounds || ''); } catch (_) { return null; } }

function wireDragAndSnap(winEl) {
    const header = winEl.querySelector('.window-header'); if (!header) return; let drag = null;
    header.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.target.closest('.window-controls')) return;
        if (winEl.classList.contains('maximized')) { const saved = parseBounds(winEl); restoreBounds(winEl); if (saved) { winEl.style.left = `${Math.max(0, event.clientX - 140)}px`; winEl.style.top = '20px'; } }
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: winEl.offsetLeft, top: winEl.offsetTop }; header.setPointerCapture(event.pointerId); bringWindowToFront(winEl);
    });
    header.addEventListener('pointermove', event => { if (!drag || event.pointerId !== drag.id) return; const desktop = document.getElementById('desktop-env'); if (!desktop) return; winEl.style.left = `${Math.max(0, drag.left + event.clientX - drag.x)}px`; winEl.style.top = `${Math.max(0, drag.top + event.clientY - drag.y)}px`; showSnapPreview(event.clientX, event.clientY, desktop); });
    const release = event => { if (!drag || event.pointerId !== drag.id) return; const desktop = document.getElementById('desktop-env'); if (desktop) applyEdgeSnap(winEl, event.clientX, event.clientY, desktop); hideSnapPreview(); try { header.releasePointerCapture(drag.id); } catch (_) {} drag = null; };
    header.addEventListener('pointerup', release); header.addEventListener('pointercancel', release);
}
function snapPreview() { let preview = document.getElementById('window-snap-preview'); if (!preview) { preview = document.createElement('div'); preview.id = 'window-snap-preview'; document.getElementById('desktop-env')?.appendChild(preview); } return preview; }
function showSnapPreview(x, y, desktop) { const rect = desktop.getBoundingClientRect(); const preview = snapPreview(); if (!preview) return; let style = null; if (x <= rect.left + 24) style = { left: 0, top: 0, width: rect.width / 2, height: rect.height - 48 }; else if (x >= rect.right - 24) style = { left: rect.width / 2, top: 0, width: rect.width / 2, height: rect.height - 48 }; else if (y <= rect.top + 20) style = { left: 0, top: 0, width: rect.width, height: rect.height - 48 }; if (!style) return hideSnapPreview(); Object.assign(preview.style, { display: 'block', left: `${style.left}px`, top: `${style.top}px`, width: `${style.width}px`, height: `${style.height}px` }); }
function hideSnapPreview() { const preview = document.getElementById('window-snap-preview'); if (preview) preview.style.display = 'none'; }
function applyEdgeSnap(winEl, x, y, desktop) { const rect = desktop.getBoundingClientRect(); const height = desktop.clientHeight - 48; if (x <= rect.left + 24) applySnap(winEl, { left: '0px', top: '0px', width: `${Math.floor(desktop.clientWidth / 2)}px`, height: `${height}px` }); else if (x >= rect.right - 24) applySnap(winEl, { left: `${Math.floor(desktop.clientWidth / 2)}px`, top: '0px', width: `${Math.ceil(desktop.clientWidth / 2)}px`, height: `${height}px` }); else if (y <= rect.top + 20) { saveBounds(winEl); winEl.classList.add('maximized'); } }
function applySnap(winEl, bounds) { if (!winEl.classList.contains('snapped')) saveBounds(winEl); winEl.classList.remove('maximized'); winEl.classList.add('snapped'); Object.assign(winEl.style, bounds); }

function wireResize(winEl) {
    winEl.querySelectorAll('[data-resize]').forEach(handle => handle.addEventListener('pointerdown', event => {
        event.preventDefault(); event.stopPropagation(); if (winEl.classList.contains('maximized')) return;
        const direction = handle.dataset.resize; const initial = { x: event.clientX, y: event.clientY, left: winEl.offsetLeft, top: winEl.offsetTop, width: winEl.offsetWidth, height: winEl.offsetHeight }; handle.setPointerCapture(event.pointerId); bringWindowToFront(winEl);
        const move = moveEvent => { const dx = moveEvent.clientX - initial.x; const dy = moveEvent.clientY - initial.y; let { left, top, width, height } = initial; if (direction.includes('e')) width = Math.max(MIN_WIDTH, initial.width + dx); if (direction.includes('s')) height = Math.max(MIN_HEIGHT, initial.height + dy); if (direction.includes('w')) { width = Math.max(MIN_WIDTH, initial.width - dx); left = initial.left + (initial.width - width); } if (direction.includes('n')) { height = Math.max(MIN_HEIGHT, initial.height - dy); top = initial.top + (initial.height - height); } Object.assign(winEl.style, { left: `${Math.max(0, left)}px`, top: `${Math.max(0, top)}px`, width: `${width}px`, height: `${height}px` }); };
        const end = endEvent => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end); try { handle.releasePointerCapture(endEvent.pointerId); } catch (_) {} };
        handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
    }));
}
function bringWindowToFront(winEl) { highestZIndex++; winEl.style.zIndex = highestZIndex; document.querySelectorAll('.os-window').forEach(window => window.classList.remove('focused')); winEl.classList.add('focused'); }
function getHighestFocusedWindow() { return [...document.querySelectorAll('.os-window:not(.minimized):not(.workspace-hidden)')].sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0))[0] || null; }
function updateWorkspaceVisibility() { const current = getCurrentWorkspace(); openWindows.forEach(record => { const visible = record.workspace === current; record.windowEl.classList.toggle('workspace-hidden', !visible); record.taskbarIcon?.classList.toggle('workspace-hidden', !visible); }); }
document.addEventListener('novaos:workspace-change', updateWorkspaceVisibility);
export function closeAllWindows() { openWindows.forEach(record => { record.windowEl.remove(); record.taskbarIcon?.remove(); }); openWindows.clear(); }
