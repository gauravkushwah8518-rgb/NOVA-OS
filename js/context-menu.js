/* NovaOS Context Menu Module */

import { showNotification } from './notifications.js';
import { launchApp } from './start-menu.js?v=7';

export function initContextMenu() {
    const desktopEnv = document.getElementById('desktop-env');
    const contextMenu = document.getElementById('desktop-context-menu');

    if (!desktopEnv || !contextMenu) return;

    desktopEnv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const x = Math.min(e.clientX, window.innerWidth - 210);
        const y = Math.min(e.clientY, window.innerHeight - 250);

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.add('active');
    });

    document.addEventListener('click', () => {
        contextMenu.classList.remove('active');
    });

    // Context actions
    document.getElementById('ctx-new-folder')?.addEventListener('click', () => {
        showNotification("NovaOS", "New virtual folder created on desktop.");
    });

    document.getElementById('ctx-new-file')?.addEventListener('click', () => {
        showNotification("NovaOS", "New text document created.");
    });

    document.getElementById('ctx-refresh')?.addEventListener('click', () => {
        showNotification("NovaOS", "Desktop refreshed successfully.");
    });

    document.getElementById('ctx-wallpaper')?.addEventListener('click', () => {
        launchApp('settings');
    });

    document.getElementById('ctx-settings')?.addEventListener('click', () => {
        launchApp('settings');
    });
}
