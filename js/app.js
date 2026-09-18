/* NovaOS Master Entry Point */

import { initLanding } from './landing.js?v=7';
import { initDesktop } from './desktop.js?v=7';
import { initTaskbar } from './taskbar.js?v=7';
import { initStartMenu, launchApp } from './start-menu.js?v=7';
import { closeAllWindows } from './window-manager.js?v=7';
import { showNotification } from './notifications.js?v=7';
import { Storage } from './storage.js?v=7';
import { initWorkspaces } from './workspaces.js?v=7';
import { initLockScreen } from './lock-screen.js?v=7';
import { applyWallpaper } from './apps/settings.js?v=7';

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

        // Apply wallpaper (presets + custom upload)
        if (desktopEnv) applyWallpaper(settings.wallpaper || 'default');

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
