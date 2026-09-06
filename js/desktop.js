/* NovaOS desktop icon selection, opening, and persisted drag positioning. */
import { launchApp } from './start-menu.js';
import { initContextMenu } from './context-menu.js';
import { Storage } from './storage.js';

const GRID = 112;
const PADDING = 18;

export function initDesktop() {
    const desktopEnv = document.getElementById('desktop-env');
    const grid = document.getElementById('desktop-icons');
    if (!desktopEnv || !grid || grid.dataset.initialized) return;
    grid.dataset.initialized = 'true';
    const icons = [...grid.querySelectorAll('.desktop-icon')];
    const stored = Storage.get('desktopPositions', {});
    const positions = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};

    // New desktops start as one horizontal app row. User-arranged positions remain untouched.
    function defaultPosition(index) { return { left: PADDING + index * GRID, top: PADDING }; }
    function bounds(position) { return { left: Math.max(PADDING, position.left), top: Math.max(PADDING, Math.min(position.top, Math.max(PADDING, grid.clientHeight - GRID))) }; }
    function occupied(candidate, icon) { return icons.some(other => other !== icon && Math.abs((Number(other.dataset.x) || 0) - candidate.left) < GRID * 0.7 && Math.abs((Number(other.dataset.y) || 0) - candidate.top) < GRID * 0.7); }
    function findOpenSpot(candidate, icon) { let point = bounds(candidate); for (let attempt = 0; attempt < 40 && occupied(point, icon); attempt++) point = bounds({ left: point.left + GRID, top: point.top + (attempt % 6 === 5 ? GRID : 0) }); return point; }
    function place(icon, candidate, save = false) { const point = findOpenSpot(candidate, icon); icon.style.left = `${point.left}px`; icon.style.top = `${point.top}px`; icon.dataset.x = point.left; icon.dataset.y = point.top; if (save) { positions[icon.dataset.app] = point; Storage.set('desktopPositions', positions); } }

    icons.forEach((icon, index) => {
        const appId = icon.dataset.app;
        place(icon, positions[appId] || defaultPosition(index));
        let clickTimer = null; let dragging = false; let pointerId = null; let origin = null;
        icon.addEventListener('click', event => {
            event.stopPropagation();
            if (icon.dataset.justDragged === 'true') { icon.dataset.justDragged = 'false'; return; }
            icons.forEach(item => item.classList.remove('selected')); icon.classList.add('selected');
            if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; launchApp(appId); }
            else clickTimer = setTimeout(() => { clickTimer = null; }, 300);
        });
        icon.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            pointerId = event.pointerId; origin = { x: event.clientX, y: event.clientY, left: Number(icon.dataset.x) || 0, top: Number(icon.dataset.y) || 0 }; dragging = false;
            icon.setPointerCapture(pointerId);
        });
        icon.addEventListener('pointermove', event => {
            if (!origin || event.pointerId !== pointerId) return;
            const dx = event.clientX - origin.x; const dy = event.clientY - origin.y;
            if (!dragging && Math.hypot(dx, dy) < 5) return;
            dragging = true; icon.classList.add('dragging'); document.body.classList.add('is-dragging');
            const point = bounds({ left: origin.left + dx, top: origin.top + dy }); icon.style.left = `${point.left}px`; icon.style.top = `${point.top}px`;
        });
        const stopDrag = event => {
            if (!origin || event.pointerId !== pointerId) return;
            if (dragging) { const point = { left: Math.round((Number.parseFloat(icon.style.left) - PADDING) / GRID) * GRID + PADDING, top: Math.round((Number.parseFloat(icon.style.top) - PADDING) / GRID) * GRID + PADDING }; place(icon, point, true); icon.dataset.justDragged = 'true'; }
            icon.classList.remove('dragging'); document.body.classList.remove('is-dragging');
            try { icon.releasePointerCapture(pointerId); } catch (_) {} origin = null; pointerId = null;
        };
        icon.addEventListener('pointerup', stopDrag); icon.addEventListener('pointercancel', stopDrag);
    });
    desktopEnv.addEventListener('click', () => icons.forEach(icon => icon.classList.remove('selected')));
    initContextMenu();
}
