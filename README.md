# NovaOS

> Your OS. Reimagined.

## About

NovaOS is a browser-based futuristic virtual operating system created entirely with HTML, CSS and Vanilla JavaScript. It features a glassmorphism desktop environment, interactive windowed applications, and a premium neon purple design system.

## Created By

**[GAURAV KUSHWAH]**

## Technologies

* HTML5
* CSS3
* Vanilla JavaScript
* Canvas API
* LocalStorage
* Web APIs (IntersectionObserver, Pointer Events, Drag & Drop)

## Features

* Futuristic desktop environment
* Glassmorphism UI with frosted glass effects
* Purple neon theme with ambient glow
* Interactive draggable windows with z-index management
* File Manager with create, rename, delete, and navigate
* Notes with search, color tags, and pinning
* Calculator with keyboard input support
* Terminal with command history and multiple commands
* Paint with pencil, eraser, undo/redo, and color picker
* Settings with theme switching and wallpaper selection
* Clock with live time and date
* Start Menu with app search
* Taskbar with open app indicators
* Notification system with slide-in/out animations
* Custom cursor with particle trail
* Interactive particle background with mouse interaction
* 3D tilt effect on hero preview
* Scroll-triggered section animations
* Button ripple effects
* Context menu on desktop
* Cinematic boot sequence transition
* Responsive mobile experience
* Local data persistence via LocalStorage
* Reduced-motion accessibility support

## No API

This project does not require any API key or external backend. Everything runs client-side in the browser.

## How To Run

Simply open:

```
index.html
```

in a modern browser (Chrome, Edge, Firefox, Safari). No installation required.

**Note:** For ES module support, you may need to serve via a local HTTP server:

```bash
python3 -m http.server 8765
# Then open http://localhost:8765
```

## Architecture

* **HTML** — Semantic structure for landing page and desktop environment
* **CSS** — Modular stylesheets (variables, reset, animations, landing, desktop, windows, taskbar, start-menu, apps, responsive)
* **JavaScript** — ES module architecture with separate files for each system component and application
* **LocalStorage** — Persistent storage for notes, filesystem, settings, and preferences
* **Canvas** — Used for particle background animation and Paint application

## Project Structure

```
NovaOS/
├── index.html
├── README.md
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── animations.css
│   ├── landing.css
│   ├── desktop.css
│   ├── windows.css
│   ├── taskbar.css
│   ├── start-menu.css
│   ├── apps.css
│   └── responsive.css
└── js/
    ├── app.js
    ├── landing.js
    ├── desktop.js
    ├── window-manager.js
    ├── taskbar.js
    ├── start-menu.js
    ├── context-menu.js
    ├── notifications.js
    ├── storage.js
    └── apps/
        ├── file-manager.js
        ├── notes.js
        ├── calculator.js
        ├── terminal.js
        ├── paint.js
        ├── settings.js
        ├── clock.js
        └── about.js
```


   # NOVA-OS
