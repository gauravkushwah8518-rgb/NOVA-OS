/* Simulated weather only — no network access or external service. */
import { Storage } from '../storage.js';

const WEATHER = {
    Bhopal: { temp: 29, feels: 31, condition: 'Sunny', icon: '☀️', humidity: '41%', wind: '12 km/h', high: 32, low: 22 },
    Delhi: { temp: 33, feels: 36, condition: 'Hazy sunshine', icon: '🌤️', humidity: '35%', wind: '16 km/h', high: 36, low: 25 },
    Mumbai: { temp: 28, feels: 32, condition: 'Light rain', icon: '🌦️', humidity: '78%', wind: '19 km/h', high: 30, low: 25 },
    Bengaluru: { temp: 24, feels: 24, condition: 'Partly cloudy', icon: '⛅', humidity: '59%', wind: '11 km/h', high: 27, low: 19 },
    'New York': { temp: 19, feels: 18, condition: 'Clear', icon: '🌙', humidity: '49%', wind: '15 km/h', high: 22, low: 14 },
    London: { temp: 16, feels: 15, condition: 'Cloudy', icon: '☁️', humidity: '71%', wind: '18 km/h', high: 18, low: 11 },
    Tokyo: { temp: 26, feels: 28, condition: 'Clear', icon: '☀️', humidity: '57%', wind: '10 km/h', high: 29, low: 21 }
};

export function renderWeatherApp(container) {
    let preferences = Storage.get('weatherPrefs', { city: 'Bhopal' });
    if (!WEATHER[preferences.city]) preferences = { city: 'Bhopal' };
    function render() {
        const city = preferences.city; const weather = WEATHER[city];
        const forecast = Array.from({ length: 5 }, (_, index) => ({ day: index === 0 ? 'Today' : new Date(Date.now() + index * 86400000).toLocaleDateString(undefined, { weekday: 'short' }), icon: ['☀️', '⛅', '🌦️', '☁️', '☀️'][index], high: weather.high - index % 3, low: weather.low - index % 2 }));
        container.innerHTML = `<div class="weather-app app-container"><div class="weather-toolbar"><label for="weather-city">Simulated city</label><select id="weather-city">${Object.keys(WEATHER).map(name => `<option ${name === city ? 'selected' : ''}>${name}</option>`).join('')}</select><span class="simulation-label">Local demo data</span></div><div class="weather-hero"><div class="weather-icon">${weather.icon}</div><div><h1>${weather.temp}°</h1><p>${weather.condition} · ${city}</p><small>Feels like ${weather.feels}° · H ${weather.high}° / L ${weather.low}°</small></div></div><div class="weather-stats"><div><span>Humidity</span><b>${weather.humidity}</b></div><div><span>Wind</span><b>${weather.wind}</b></div><div><span>Updated</span><b>Simulated now</b></div></div><div class="weather-forecast">${forecast.map(day => `<div><b>${day.day}</b><span>${day.icon}</span><small>${day.high}° / ${day.low}°</small></div>`).join('')}</div></div>`;
        container.querySelector('#weather-city')?.addEventListener('change', event => { preferences.city = event.target.value; Storage.set('weatherPrefs', preferences); render(); });
    }
    render();
}
