/* NovaOS Taskbar Module */

export function initTaskbar() {
    const clockEl = document.getElementById('taskbar-clock');
    if (!clockEl) return;

    if (clockEl.dataset.initialized) return;
    clockEl.dataset.initialized = 'true';
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        clockEl.textContent = `${hours}:${minutes} ${ampm}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}
