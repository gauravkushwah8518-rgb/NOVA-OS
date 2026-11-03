/* NovaOS global keyboard shortcuts: Esc, Ctrl+L, Alt+Tab, Alt+D. */
import { focusNextWindow, toggleShowDesktop } from './window-manager.js?v=7';
import { lockNovaOS } from './lock-screen.js?v=7';

function isTypingTarget(event) {
    const target = event.target;
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest('input, textarea, select, [contenteditable="true"], .terminal-input'));
}

export function initShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Before boot or after shutdown: no desktop to act on.
        const desktopEnv = document.getElementById('desktop-env');
        if (!desktopEnv || !desktopEnv.classList.contains('active')) return;

        // Lock screen is open: no shortcuts run; the PIN field handles its own keys.
        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen && lockScreen.classList.contains('active')) return;

        // Esc closes the start menu if it is open. Runs even while typing.
        if (!event.ctrlKey && !event.altKey && !event.metaKey && event.key === 'Escape') {
            const startMenu = document.getElementById('start-menu');
            if (startMenu?.classList.contains('active')) event.preventDefault();
            startMenu?.classList.remove('active');
            return;
        }

        // Ctrl+L locks the screen. Runs even while typing.
        if (event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLowerCase() === 'l') {
            event.preventDefault();
            lockNovaOS();
            return;
        }

        // Window management shortcuts do nothing while the user is typing.
        if (isTypingTarget(event)) return;

        // Alt+Tab cycles open windows in the current workspace to the front.
        if (event.altKey && !event.ctrlKey && !event.metaKey && event.key === 'Tab') {
            event.preventDefault();
            focusNextWindow();
            return;
        }

        // Alt+D toggles show desktop: minimize all visible windows, or restore them.
        if (event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 'd') {
            event.preventDefault();
            toggleShowDesktop();
            return;
        }
    });
}
