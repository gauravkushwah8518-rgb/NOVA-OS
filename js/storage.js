/* NovaOS Storage Utility */

export const Storage = {
    get(key, defaultValue) {
        try {
            const item = localStorage.getItem(`novaos_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn(`LocalStorage error for key ${key}:`, e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(`novaos_${key}`, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn(`LocalStorage write error for key ${key}:`, e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(`novaos_${key}`);
        } catch (e) {
            console.warn(`LocalStorage remove error for key ${key}:`, e);
        }
    }
};

// All data stays in the browser. These helpers intentionally only touch NovaOS keys.
export const BACKUP_KEYS = ['settings', 'filesystem', 'notes', 'desktopPositions', 'calendarEvents', 'workspaceState', 'musicPrefs', 'weatherPrefs', 'lockConfig'];

export function createBackup() {
    const data = {};
    BACKUP_KEYS.forEach(key => { data[key] = Storage.get(key, null); });
    return { app: 'NovaOS', version: 1, exportedAt: new Date().toISOString(), data };
}

export function validateBackup(candidate) {
    if (!candidate || typeof candidate !== 'object' || candidate.app !== 'NovaOS' || candidate.version !== 1 || !candidate.data || typeof candidate.data !== 'object' || Array.isArray(candidate.data)) {
        return { valid: false, error: 'This is not a compatible NovaOS backup.' };
    }
    return { valid: true };
}

export function restoreBackup(candidate) {
    const validation = validateBackup(candidate);
    if (!validation.valid) return validation;
    try {
        BACKUP_KEYS.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(candidate.data, key) && candidate.data[key] !== null) Storage.set(key, candidate.data[key]);
        });
        return { valid: true };
    } catch (error) {
        console.warn('NovaOS backup restore failed:', error);
        return { valid: false, error: 'NovaOS could not apply this backup safely.' };
    }
}
