/* NovaOS Master Entry Point */

import { initLanding } from './landing.js';
import { initDesktop } from './desktop.js';
import { initTaskbar } from './taskbar.js';
import { initStartMenu, launchApp } from './start-menu.js?v=5';
import { closeAllWindows } from './window-manager.js';
import { showNotification } from './notifications.js';
import { Storage } from './storage.js';
import { initWorkspaces } from './workspaces.js';
import { initLockScreen } from './lock-screen.js';

document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const desktopEnv = document.getElementById('desktop-env');

    // Apply saved settings on load
    const settings = Storage.get('settings', { theme: 'dark', wallpaper: 'default' });
    if (settings.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    function onBootComplete(specificAppToLaunch = null) {
        if (landingPage) landingPage.style.display = 'none';
        if (desktopEnv) desktopEnv.classList.add('active');

        // Apply wallpaper
        if (desktopEnv) {
            const wp = settings.wallpaper || 'default';
            if (wp === 'purple') {
                desktopEnv.style.backgroundImage = 'radial-gradient(circle at 50% 30%, #581c87 0%, #0f0728 80%)';
            } else if (wp === 'midnight') {
                desktopEnv.style.backgroundImage = 'radial-gradient(circle at 50% 30%, #3b0764 0%, #030108 80%)';
            }
        }

        initTaskbar();
        initDesktop();
        initWorkspaces();
        initLockScreen();
        initStartMenu(() => {
            // Shutdown action: return to landing page
            closeAllWindows();
            if (desktopEnv) desktopEnv.classList.remove('active');
            if (landingPage) landingPage.style.display = 'block';
            showNotification('NovaOS', 'System shut down. Returned to landing page.');
        });

        if (specificAppToLaunch) {
            setTimeout(() => {
                launchApp(specificAppToLaunch);
            }, 300);
        } else {
            setTimeout(() => {
                showNotification('NovaOS', 'Welcome back, User. System online.');
            }, 600);
        }
    }

    initLanding(onBootComplete);
});
