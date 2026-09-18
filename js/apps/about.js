/* NovaOS About App */

export function renderAboutApp(container) {
    container.innerHTML = `
        <div class="about-container">
            <div class="about-logo"><img src="public/assets/novaos-logo.png?v=7" alt="NovaOS logo" /></div>
            <h2 style="font-size: 1.5rem; font-weight: 800;">NovaOS</h2>
            <p style="font-size: 0.95rem; color: var(--text-muted);">Your OS. Reimagined.</p>
            <div style="font-size: 0.85rem; color: var(--text-dim); margin-top: 10px;">
                Created by: <strong>Gaurav Kushwah</strong>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid rgba(168,85,247,0.2); margin-top: 10px; text-align: left; width: 100%;">
                <div>✨ Pure HTML5, CSS3 & Vanilla JavaScript</div>
                <div>✨ Glassmorphism UI & Neon Glow</div>
                <div>✨ Zero External Framework Dependencies</div>
            </div>
        </div>
    `;
}
