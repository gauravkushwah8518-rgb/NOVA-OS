/* NovaOS Start Menu Module */

import { openAppWindow } from './window-manager.js?v=7';
import { renderFileManager } from './apps/file-manager.js?v=7';
import { renderNotesApp } from './apps/notes.js?v=7';
import { renderCalculator } from './apps/calculator.js?v=7';
import { renderTerminal } from './apps/terminal.js?v=7';
import { renderPaintApp } from './apps/paint.js?v=7';
import { renderSettingsApp } from './apps/settings.js?v=7';
import { renderClockApp } from './apps/clock.js?v=7';
import { renderAboutApp } from './apps/about.js?v=7';
import { renderMusicPlayer } from './apps/music-player.js?v=7';
import { renderCalendarApp } from './apps/calendar.js?v=7';
import { renderWeatherApp } from './apps/weather.js?v=7';
import { showNotification } from './notifications.js?v=7';
import { lockNovaOS } from './lock-screen.js?v=7';

export const APPS_CONFIG = [
    { id: 'files', title: 'Files', icon: '📁', render: renderFileManager },
    { id: 'notes', title: 'Notes', icon: '📝', render: renderNotesApp },
    { id: 'calculator', title: 'Calculator', icon: '🧮', render: renderCalculator },
    { id: 'terminal', title: 'Terminal', icon: '🖥️', render: renderTerminal },
    { id: 'paint', title: 'Paint', icon: '🎨', render: renderPaintApp },
    { id: 'settings', title: 'Settings', icon: '⚙️', render: renderSettingsApp },
    { id: 'clock', title: 'Clock', icon: '⏰', render: renderClockApp },
    { id: 'about', title: 'About', icon: 'ℹ️', render: renderAboutApp },
    { id: 'music', title: 'Music Player', icon: '🎵', render: renderMusicPlayer },
    { id: 'calendar', title: 'Calendar', icon: '📅', render: renderCalendarApp },
    { id: 'weather', title: 'Weather', icon: '☀️', render: renderWeatherApp }
];

export function launchApp(appId) {
    const app = APPS_CONFIG.find(a => a.id === appId);
    if (app) {
        openAppWindow(app.id, app.title, app.icon, app.render);
    }
}

export function initStartMenu(onShutdown) {
    const startBtn = document.getElementById('taskbar-start-btn');
    const startMenu = document.getElementById('start-menu');
    const searchInput = document.getElementById('start-search');
    const appsListContainer = document.getElementById('start-apps-list');
    const shutdownBtn = document.getElementById('start-shutdown-btn');
    const lockBtn = document.getElementById('start-lock-btn');
    const searchTrigger = document.getElementById('taskbar-search-trigger');

    if (!startBtn || !startMenu) return;
    if (startMenu.dataset.initialized) return;
    startMenu.dataset.initialized = 'true';

    function populateApps(filter = '') {
        if (!appsListContainer) return;
        appsListContainer.innerHTML = '';
        const filtered = APPS_CONFIG.filter(a => a.title.toLowerCase().includes(filter.toLowerCase()));
        
        if (filtered.length === 0) {
            appsListContainer.innerHTML = `<div style="grid-column: span 4; text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 20px;">No applications found</div>`;
            return;
        }

        filtered.forEach(app => {
            const item = document.createElement('div');
            item.className = 'start-app-item';
            item.innerHTML = `
                <div class="start-app-icon">${app.icon}</div>
                <span class="start-app-name">${app.title}</span>
            `;
            item.addEventListener('click', () => {
                launchApp(app.id);
                startMenu.classList.remove('active');
            });
            appsListContainer.appendChild(item);
        });
    }

    populateApps();

    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('active');
        if (startMenu.classList.contains('active') && searchInput) {
            searchInput.focus();
        }
    });

    if (searchTrigger) {
        searchTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.add('active');
            if (searchInput) searchInput.focus();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            populateApps(e.target.value);
        });
    }

    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && !startBtn.contains(e.target) && (!searchTrigger || !searchTrigger.contains(e.target))) {
            startMenu.classList.remove('active');
        }
    });

    if (shutdownBtn) {
        shutdownBtn.addEventListener('click', () => {
            startMenu.classList.remove('active');
            showNotification("NovaOS", "Shutting down system...");
            setTimeout(() => {
                if (onShutdown) onShutdown();
            }, 1000);
        });
    }

    if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            startMenu.classList.remove('active');
            lockNovaOS();
        });
    }
}
