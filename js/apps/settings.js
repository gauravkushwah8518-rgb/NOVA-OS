/* NovaOS Settings extends the existing local preferences with safe backup and lock controls. */
import { Storage, createBackup, restoreBackup, validateBackup } from '../storage.js?v=7';
import { showNotification } from '../notifications.js?v=7';
import { lockNovaOS } from '../lock-screen.js?v=7';

export const WALLPAPERS = {
    default: 'radial-gradient(circle at 50% 30%, #1e1035 0%, #080410 80%)',
    purple: 'radial-gradient(circle at 50% 30%, #581c87 0%, #0f0728 80%)',
    midnight: 'radial-gradient(circle at 50% 30%, #3b0764 0%, #030108 80%)',
    ocean: 'radial-gradient(circle at 50% 30%, #0c4a6e 0%, #020617 80%)',
    sunset: 'radial-gradient(circle at 50% 30%, #831843 0%, #0c0209 80%)',
    forest: 'radial-gradient(circle at 50% 30%, #14532d 0%, #02120a 80%)'
};

function fileToWallpaperDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('read failed'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('decode failed'));
            img.onload = () => {
                const scale = Math.min(1, 1920 / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
    });
}

export function renderSettingsApp(container) {
    let settings = Storage.get('settings', { theme: 'dark', wallpaper: 'default' });
    if (!settings || typeof settings !== 'object') settings = { theme: 'dark', wallpaper: 'default' };
    container.innerHTML = `<div class="app-container"><div class="settings-layout"><div class="settings-sidebar"><button class="settings-tab-btn active" data-tab="appearance">Appearance</button><button class="settings-tab-btn" data-tab="desktop">Desktop</button><button class="settings-tab-btn" data-tab="security">Lock screen</button><button class="settings-tab-btn" data-tab="data">Data</button><button class="settings-tab-btn" data-tab="system">System Info</button></div><div class="settings-content-pane" id="settings-pane"></div></div></div>`;
    const pane = container.querySelector('#settings-pane'); const tabs = container.querySelectorAll('.settings-tab-btn');
    function renderTab(tab) {
        tabs.forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
        if (tab === 'appearance') {
            const customSet = !!Storage.get('customWallpaper', null);
            const presetButtons = Object.keys(WALLPAPERS).map(name => `<button class="wallpaper-option ${settings.wallpaper === name ? 'active' : ''}" data-wp="${name}" aria-label="${name} wallpaper" style="background:${WALLPAPERS[name]}"></button>`).join('');
            const customThumb = customSet ? `<button class="wallpaper-option ${settings.wallpaper === 'custom' ? 'active' : ''}" data-wp="custom" aria-label="Custom wallpaper" style="background-image:url('${Storage.get('customWallpaper')}')"></button>` : '';
            pane.innerHTML = `<div class="setting-group"><span class="setting-label">Theme Mode</span><div class="setting-options"><button class="fm-btn theme-btn ${settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">Dark Neon</button><button class="fm-btn theme-btn ${settings.theme === 'light' ? 'active' : ''}" data-theme="light">Light Lavender</button></div></div><div class="setting-group"><span class="setting-label">Desktop Wallpaper</span><div class="setting-options">${presetButtons}${customThumb}</div><div class="wallpaper-upload-row"><button class="fm-btn" id="wallpaper-upload-btn">Upload image…</button><input id="wallpaper-upload-input" type="file" accept="image/*" hidden>${customSet ? '<button class="fm-btn" id="wallpaper-remove-btn">Remove custom</button>' : ''}<span class="wallpaper-upload-hint">JPG or PNG · saved locally, never uploaded</span></div></div>`;
            pane.querySelectorAll('.theme-btn').forEach(button => button.addEventListener('click', () => { settings.theme = button.dataset.theme; Storage.set('settings', settings); document.documentElement.toggleAttribute('data-theme', settings.theme === 'light'); if (settings.theme === 'light') document.documentElement.setAttribute('data-theme', 'light'); showNotification('Settings', 'Theme updated.'); renderTab('appearance'); }));
            pane.querySelectorAll('.wallpaper-option').forEach(button => button.addEventListener('click', () => { settings.wallpaper = button.dataset.wp; Storage.set('settings', settings); applyWallpaper(settings.wallpaper); showNotification('Settings', 'Wallpaper updated.'); renderTab('appearance'); }));
            const uploadInput = pane.querySelector('#wallpaper-upload-input');
            pane.querySelector('#wallpaper-upload-btn')?.addEventListener('click', () => uploadInput?.click());
            uploadInput?.addEventListener('change', async () => {
                const file = uploadInput.files?.[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) { showNotification('Settings', 'Choose an image file (JPG or PNG).'); return; }
                if (file.size > 8 * 1024 * 1024) { showNotification('Settings', 'Image too large — pick one under 8 MB.'); return; }
                try {
                    Storage.set('customWallpaper', await fileToWallpaperDataUrl(file));
                    settings.wallpaper = 'custom'; Storage.set('settings', settings);
                    applyWallpaper('custom');
                    showNotification('Settings', 'Custom wallpaper applied.');
                    renderTab('appearance');
                } catch (_) { showNotification('Settings', 'Could not process that image.'); }
            });
            pane.querySelector('#wallpaper-remove-btn')?.addEventListener('click', () => { Storage.remove('customWallpaper'); settings.wallpaper = 'default'; Storage.set('settings', settings); applyWallpaper('default'); showNotification('Settings', 'Custom wallpaper removed.'); renderTab('appearance'); });
        } else if (tab === 'desktop') {
            pane.innerHTML = `<div class="setting-group"><span class="setting-label">Desktop icons</span><p class="setting-copy">Drag icons to rearrange them. Positions are automatically saved locally and restored after a refresh.</p><button class="fm-btn" id="reset-icon-layout">Reset icon layout</button></div><div class="setting-group"><span class="setting-label">Virtual workspaces</span><p class="setting-copy">Four workspace buttons are available in the taskbar. Windows stay assigned to the workspace where they were opened.</p></div>`;
            pane.querySelector('#reset-icon-layout')?.addEventListener('click', () => { Storage.remove('desktopPositions'); showNotification('Settings', 'Icon layout reset. Refresh NovaOS to apply it.'); });
        } else if (tab === 'security') {
            const lock = Storage.get('lockConfig', { pin: '1234' }); const pin = lock && /^\d{4,12}$/.test(lock.pin) ? lock.pin : '1234';
            pane.innerHTML = `<div class="setting-group"><span class="setting-label">NovaOS lock screen</span><p class="setting-copy">This is a browser UI simulation, not real device security.</p><label class="setting-label" for="new-pin">PIN (4–12 digits)</label><input id="new-pin" class="setting-input" type="password" inputmode="numeric" maxlength="12" value="${pin}"><div class="setting-options"><button class="fm-btn" id="save-pin">Save PIN</button><button class="fm-btn" id="lock-now">Lock now</button></div></div>`;
            pane.querySelector('#save-pin')?.addEventListener('click', () => { const value = pane.querySelector('#new-pin').value; if (!/^\d{4,12}$/.test(value)) { showNotification('Settings', 'Use 4–12 digits for the PIN.'); return; } Storage.set('lockConfig', { pin: value }); showNotification('Settings', 'PIN saved locally.'); });
            pane.querySelector('#lock-now')?.addEventListener('click', lockNovaOS);
        } else if (tab === 'data') {
            pane.innerHTML = `<div class="setting-group"><span class="setting-label">Export User Data</span><p class="setting-copy">Downloads settings, notes, simulated files, icon positions, calendar events, workspaces, music preferences, and lock configuration as a local JSON backup.</p><button class="fm-btn" id="export-data">Export User Data</button></div><div class="setting-group"><span class="setting-label">Import User Data</span><p class="setting-copy">A compatible backup replaces only included NovaOS data on this browser. It is never uploaded.</p><input id="import-data" type="file" accept="application/json,.json"><button class="fm-btn" id="import-data-btn">Import selected backup</button></div>`;
            pane.querySelector('#export-data')?.addEventListener('click', exportData); pane.querySelector('#import-data-btn')?.addEventListener('click', () => importData(pane.querySelector('#import-data')));
        } else {
            pane.innerHTML = `<div class="setting-group"><span class="setting-label">NovaOS System Information</span><div class="system-info"><div><strong>OS Version:</strong> NovaOS v2.5 Upgrade</div><div><strong>Architecture:</strong> Browser-native Vanilla JavaScript</div><div><strong>Storage:</strong> LocalStorage Active</div><div><strong>Services:</strong> Offline/local only</div></div></div>`;
        }
    }
    tabs.forEach(button => button.addEventListener('click', () => renderTab(button.dataset.tab))); renderTab('appearance');
}

export function applyWallpaper(wallpaper) {
    const desktop = document.getElementById('desktop-env');
    if (!desktop) return;
    if (wallpaper === 'custom') {
        const custom = Storage.get('customWallpaper', null);
        if (custom) { desktop.style.backgroundImage = `url("${custom}")`; return; }
        wallpaper = 'default';
    }
    desktop.style.backgroundImage = WALLPAPERS[wallpaper] || WALLPAPERS.default;
}
function exportData() { const blob = new Blob([JSON.stringify(createBackup(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'nova-os-backup.json'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); showNotification('Settings', 'Local backup exported.'); }
function importData(input) { const file = input?.files?.[0]; if (!file) { showNotification('Settings', 'Choose a backup JSON file first.'); return; } const reader = new FileReader(); reader.onerror = () => showNotification('Settings', 'NovaOS could not read that file.'); reader.onload = () => { let candidate; try { candidate = JSON.parse(String(reader.result)); } catch (_) { showNotification('Settings', 'That file is not valid JSON.'); return; } const validation = validateBackup(candidate); if (!validation.valid) { showNotification('Settings', validation.error); return; } if (!confirm('Replace the included NovaOS data with this backup?')) return; const restored = restoreBackup(candidate); if (!restored.valid) { showNotification('Settings', restored.error); return; } showNotification('Settings', 'Backup imported. Reloading NovaOS…'); setTimeout(() => location.reload(), 350); }; reader.readAsText(file); }
