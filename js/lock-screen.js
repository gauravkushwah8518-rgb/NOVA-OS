/* UI-only lock screen. This is not operating-system security. */
import { Storage } from './storage.js';

const DEFAULT = { pin: '1234' };
function config() { const saved = Storage.get('lockConfig', DEFAULT); return saved && typeof saved.pin === 'string' && /^\d{4,12}$/.test(saved.pin) ? saved : { ...DEFAULT }; }

export function initLockScreen() {
    if (document.getElementById('lock-screen')) return;
    const overlay = document.createElement('div'); overlay.id = 'lock-screen'; overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `<div class="lock-card"><div class="lock-brand">NOVA<span>OS</span></div><div class="lock-clock" id="lock-clock"></div><div class="lock-date" id="lock-date"></div><p>Enter your PIN to continue</p><input id="lock-pin" type="password" inputmode="numeric" maxlength="12" aria-label="PIN" autocomplete="off"><div class="lock-feedback" id="lock-feedback" role="status"></div><div class="pin-pad">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(key => key === '' ? '<span></span>' : `<button data-pin-key="${key}" aria-label="${key === '⌫' ? 'Backspace' : key}">${key}</button>`).join('')}</div><button class="fm-btn lock-unlock" id="lock-unlock">Unlock</button><small>NovaOS lock is a local UI simulation, not real device security.</small></div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#lock-pin'); const feedback = overlay.querySelector('#lock-feedback');
    function updateClock() { const now = new Date(); const clock = overlay.querySelector('#lock-clock'); const date = overlay.querySelector('#lock-date'); if (clock) clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); if (date) date.textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); }
    updateClock(); setInterval(updateClock, 30000);
    function unlock() { if (input.value === config().pin) { overlay.classList.add('unlocking'); setTimeout(() => { overlay.classList.remove('active', 'unlocking'); overlay.setAttribute('aria-hidden', 'true'); input.value = ''; feedback.textContent = ''; }, 380); } else { feedback.textContent = 'Incorrect PIN. Try again.'; input.classList.add('error'); setTimeout(() => input.classList.remove('error'), 450); } }
    overlay.querySelectorAll('[data-pin-key]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.pinKey === '⌫' ? input.value.slice(0, -1) : `${input.value}${button.dataset.pinKey}`; input.focus(); }));
    overlay.querySelector('#lock-unlock')?.addEventListener('click', unlock); input.addEventListener('keydown', event => { if (event.key === 'Enter') unlock(); });
}

export function lockNovaOS() { const overlay = document.getElementById('lock-screen'); if (!overlay) return; overlay.classList.add('active'); overlay.setAttribute('aria-hidden', 'false'); setTimeout(() => overlay.querySelector('#lock-pin')?.focus(), 100); }
