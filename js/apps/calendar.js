/* Local-only calendar with a compact event store. */
import { Storage } from '../storage.js';
import { showNotification } from '../notifications.js';

const pad = value => String(value).padStart(2, '0');
const keyFor = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function renderCalendarApp(container) {
    let view = new Date();
    view.setDate(1);
    let events = Storage.get('calendarEvents', []);
    if (!Array.isArray(events)) events = [];

    function save() { Storage.set('calendarEvents', events); }
    function render() {
        const month = view.getMonth(); const year = view.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const today = keyFor(new Date());
        const cells = Array.from({ length: firstDay }, () => '<div class="calendar-day empty"></div>');
        for (let day = 1; day <= days; day++) {
            const date = new Date(year, month, day); const dateKey = keyFor(date);
            const dayEvents = events.filter(event => event.date === dateKey);
            cells.push(`<button class="calendar-day ${dateKey === today ? 'today' : ''}" data-date="${dateKey}" aria-label="${date.toDateString()}"><span>${day}</span>${dayEvents.slice(0, 2).map(event => `<small title="${escapeHtml(event.title)}">${escapeHtml(event.title)}</small>`).join('')}</button>`);
        }
        container.innerHTML = `<div class="calendar-app app-container">
            <div class="calendar-toolbar"><button class="fm-btn" id="calendar-prev" aria-label="Previous month">←</button><h2>${view.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h2><button class="fm-btn" id="calendar-next" aria-label="Next month">→</button><button class="fm-btn" id="calendar-today">Today</button></div>
            <div class="calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
            <div class="calendar-grid">${cells.join('')}</div>
            <div class="calendar-events"><strong>Events this month</strong><div id="calendar-event-list">${renderEvents(year, month)}</div></div>
        </div>`;
        container.querySelector('#calendar-prev')?.addEventListener('click', () => { view.setMonth(month - 1); render(); });
        container.querySelector('#calendar-next')?.addEventListener('click', () => { view.setMonth(month + 1); render(); });
        container.querySelector('#calendar-today')?.addEventListener('click', () => { view = new Date(); view.setDate(1); render(); });
        container.querySelectorAll('.calendar-day[data-date]').forEach(cell => cell.addEventListener('click', () => addEvent(cell.dataset.date)));
        container.querySelectorAll('[data-delete-event]').forEach(button => button.addEventListener('click', () => { events = events.filter(event => event.id !== button.dataset.deleteEvent); save(); render(); }));
    }
    function renderEvents(year, month) {
        const monthKey = `${year}-${pad(month + 1)}`;
        const items = events.filter(event => event.date.startsWith(monthKey)).sort((a, b) => a.date.localeCompare(b.date));
        return items.length ? items.map(event => `<div class="calendar-event"><span><b>${event.date}</b> ${escapeHtml(event.title)}</span><button class="icon-text-button" data-delete-event="${event.id}" aria-label="Delete ${escapeHtml(event.title)}">×</button></div>`).join('') : '<p class="empty-state">Click a day to add a local event.</p>';
    }
    function addEvent(date) {
        const title = prompt(`Add event for ${date}:`, 'New event');
        if (!title || !title.trim()) return;
        events.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, date, title: title.trim() }); save(); showNotification('Calendar', 'Event saved locally.'); render();
    }
    render();
}

function escapeHtml(value) { const node = document.createElement('div'); node.textContent = value || ''; return node.innerHTML; }
