/* NovaOS Paint App */

import { showNotification } from '../notifications.js';

export function renderPaintApp(container) {
    container.innerHTML = `
        <div class="paint-layout">
            <div class="paint-toolbar">
                <button class="fm-btn paint-tool-btn active" id="paint-pencil" title="Pencil">✏️</button>
                <button class="fm-btn paint-tool-btn" id="paint-eraser" title="Eraser">🧹</button>
                
                <label style="font-size: 0.85rem; font-weight: 600; margin-left: 10px;">Color:</label>
                <input type="color" id="paint-color" value="#c084fc" style="width: 32px; height: 32px; border: none; cursor: pointer; background: none;">
                
                <label style="font-size: 0.85rem; font-weight: 600; margin-left: 10px;">Size:</label>
                <input type="range" id="paint-size" min="1" max="30" value="5" style="accent-color: #a855f7; width: 80px;">
                
                <div style="margin-left: auto; display: flex; gap: 6px;">
                    <button class="fm-btn" id="paint-undo" title="Undo">↩</button>
                    <button class="fm-btn" id="paint-redo" title="Redo">↪</button>
                    <button class="fm-btn" id="paint-clear-btn" title="Clear Canvas">🗑️</button>
                </div>
            </div>
            <div class="paint-canvas-wrapper" id="paint-wrapper">
                <canvas class="paint-canvas" id="paint-canvas"></canvas>
            </div>
        </div>
    `;

    const canvas = container.querySelector('#paint-canvas');
    const wrapper = container.querySelector('#paint-wrapper');
    const ctx = canvas.getContext('2d');
    const colorPicker = container.querySelector('#paint-color');
    const sizePicker = container.querySelector('#paint-size');
    const clearBtn = container.querySelector('#paint-clear-btn');
    const pencilBtn = container.querySelector('#paint-pencil');
    const eraserBtn = container.querySelector('#paint-eraser');
    const undoBtn = container.querySelector('#paint-undo');
    const redoBtn = container.querySelector('#paint-redo');

    let undoStack = [];
    let redoStack = [];
    let isEraser = false;
    const MAX_HISTORY = 30;

    function resizeCanvas() {
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        undoStack = [];
        redoStack = [];
    }

    setTimeout(resizeCanvas, 50);

    function saveState() {
        if (undoStack.length >= MAX_HISTORY) undoStack.shift();
        undoStack.push(canvas.toDataURL());
        redoStack = [];
    }

    function undo() {
        if (undoStack.length === 0) return;
        redoStack.push(canvas.toDataURL());
        const imgData = undoStack.pop();
        const img = new Image();
        img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
        img.src = imgData;
    }

    function redo() {
        if (redoStack.length === 0) return;
        undoStack.push(canvas.toDataURL());
        const imgData = redoStack.pop();
        const img = new Image();
        img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
        img.src = imgData;
    }

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('pointerdown', (e) => {
        isDrawing = true;
        saveState();
        const rect = canvas.getBoundingClientRect();
        lastX = (e.clientX - rect.left) * (canvas.width / rect.width);
        lastY = (e.clientY - rect.top) * (canvas.height / rect.height);
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        ctx.strokeStyle = isEraser ? '#ffffff' : colorPicker.value;
        ctx.lineWidth = isEraser ? parseInt(sizePicker.value) * 3 : parseInt(sizePicker.value);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastX = x;
        lastY = y;
    });

    canvas.addEventListener('pointerup', () => isDrawing = false);
    canvas.addEventListener('pointerleave', () => isDrawing = false);

    pencilBtn.addEventListener('click', () => {
        isEraser = false;
        pencilBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        canvas.style.cursor = 'crosshair';
    });

    eraserBtn.addEventListener('click', () => {
        isEraser = true;
        eraserBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        canvas.style.cursor = 'cell';
    });

    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    clearBtn.addEventListener('click', () => {
        saveState();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        showNotification('Paint', 'Canvas cleared.');
    });
}
