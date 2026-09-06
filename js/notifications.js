/* NovaOS Notification System */

export function showNotification(title, message, duration = 3500) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div class="toast-header">
            <span>🔔 ${title}</span>
            <span style="cursor:pointer; font-size: 0.9rem; opacity: 0.7; transition: opacity 0.2s;" class="toast-close" title="Dismiss">&times;</span>
        </div>
        <div class="toast-body">${message}</div>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');
    closeBtn.addEventListener('click', () => dismissToast(toast));

    setTimeout(() => {
        if (toast.parentElement) dismissToast(toast);
    }, duration);
}

function dismissToast(toast) {
    toast.style.animation = 'notifSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
}
