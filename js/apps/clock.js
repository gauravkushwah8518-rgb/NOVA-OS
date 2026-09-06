/* NovaOS Clock App */

export function renderClockApp(container) {
    container.innerHTML = `
        <div class="clock-container">
            <div class="clock-digital" id="app-clock-display">00:00:00</div>
            <div class="clock-date" id="app-clock-date">Loading date...</div>
        </div>
    `;

    const timeEl = container.querySelector('#app-clock-display');
    const dateEl = container.querySelector('#app-clock-date');

    function update() {
        const now = new Date();
        if (timeEl) timeEl.textContent = now.toLocaleTimeString();
        if (dateEl) dateEl.textContent = now.toDateString();
    }

    update();
    const timer = setInterval(update, 1000);

    // Clear interval when container is removed
    const observer = new MutationObserver(() => {
        if (!document.body.contains(container)) {
            clearInterval(timer);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
