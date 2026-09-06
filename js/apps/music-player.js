/* Native-looking demo player. No audio source is requested when demo assets are absent. */
import { Storage } from '../storage.js';

const TRACKS = [
    { title: 'Neon Horizons', artist: 'Nova Ensemble', duration: 224, color: 'linear-gradient(135deg,#7c3aed,#ec4899)' },
    { title: 'Orbiting', artist: 'Lumen', duration: 198, color: 'linear-gradient(135deg,#06b6d4,#6366f1)' },
    { title: 'Afterglow', artist: 'Satellite Dreams', duration: 251, color: 'linear-gradient(135deg,#f59e0b,#ef4444)' }
];
const format = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function renderMusicPlayer(container) {
    const saved = Storage.get('musicPrefs', { index: 0, volume: 70, shuffle: false, repeat: false });
    let state = { index: Number.isInteger(saved.index) && TRACKS[saved.index] ? saved.index : 0, volume: Math.min(100, Math.max(0, Number(saved.volume) || 70)), shuffle: !!saved.shuffle, repeat: !!saved.repeat, playing: false, time: 0 };
    let timer = null;
    function persist() { Storage.set('musicPrefs', { index: state.index, volume: state.volume, shuffle: state.shuffle, repeat: state.repeat }); }
    function changeTrack(next) { state.index = state.shuffle ? Math.floor(Math.random() * TRACKS.length) : (state.index + next + TRACKS.length) % TRACKS.length; state.time = 0; persist(); render(); }
    function render() {
        if (timer) { clearInterval(timer); timer = null; }
        const track = TRACKS[state.index];
        container.innerHTML = `<div class="music-app app-container"><div class="music-art" style="background:${track.color}"><span>♫</span></div><div class="music-now"><span class="simulation-label">Demo mode · no audio asset loaded</span><h2>${track.title}</h2><p>${track.artist}</p></div><input id="music-progress" class="music-progress" type="range" min="0" max="${track.duration}" value="${state.time}" aria-label="Track progress"><div class="music-times"><span>${format(state.time)}</span><span>${format(track.duration)}</span></div><div class="music-controls"><button id="music-shuffle" class="music-toggle ${state.shuffle ? 'active' : ''}" aria-label="Toggle shuffle">⇄</button><button id="music-prev" aria-label="Previous track">⏮</button><button id="music-play" class="music-play" aria-label="${state.playing ? 'Pause' : 'Play'}">${state.playing ? '❚❚' : '▶'}</button><button id="music-next" aria-label="Next track">⏭</button><button id="music-repeat" class="music-toggle ${state.repeat ? 'active' : ''}" aria-label="Toggle repeat">↻</button></div><div class="music-volume"><label for="music-volume">🔊 Volume</label><input id="music-volume" type="range" min="0" max="100" value="${state.volume}"></div><div class="playlist"><strong>Playlist</strong>${TRACKS.map((item, index) => `<button class="playlist-item ${index === state.index ? 'active' : ''}" data-track="${index}"><span>${index + 1}. ${item.title}</span><small>${item.artist} · ${format(item.duration)}</small></button>`).join('')}</div></div>`;
        container.querySelector('#music-play')?.addEventListener('click', () => { state.playing = !state.playing; render(); });
        container.querySelector('#music-prev')?.addEventListener('click', () => changeTrack(-1)); container.querySelector('#music-next')?.addEventListener('click', () => changeTrack(1));
        container.querySelector('#music-shuffle')?.addEventListener('click', () => { state.shuffle = !state.shuffle; persist(); render(); }); container.querySelector('#music-repeat')?.addEventListener('click', () => { state.repeat = !state.repeat; persist(); render(); });
        container.querySelector('#music-progress')?.addEventListener('input', event => { state.time = Number(event.target.value); render(); });
        container.querySelector('#music-volume')?.addEventListener('input', event => { state.volume = Number(event.target.value); persist(); });
        container.querySelectorAll('[data-track]').forEach(button => button.addEventListener('click', () => { state.index = Number(button.dataset.track); state.time = 0; persist(); render(); }));
        if (state.playing) timer = setInterval(() => { if (!document.body.contains(container)) return clearInterval(timer); if (++state.time >= track.duration) { if (state.repeat) state.time = 0; else changeTrack(1); } else { const progress = container.querySelector('#music-progress'); const time = container.querySelector('.music-times span'); if (progress) progress.value = state.time; if (time) time.textContent = format(state.time); } }, 1000);
    }
    render();
}
