/* NovaOS Landing Page Interactions, Particles, 3D Tilt & Boot */

import { showNotification } from './notifications.js';

export function initLanding(onBootComplete) {
    // 1. Custom Cursor with particle trail
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch && cursor) {
        cursor.style.display = 'none';
    } else if (!isTouch) {
        let particleTimer = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (cursorDot) {
                cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
            }

            // Spawn cursor trail particles occasionally
            if (!prefersReducedMotion && Date.now() - particleTimer > 80) {
                particleTimer = Date.now();
                spawnCursorParticle(mouseX, mouseY);
            }
        });

        function animateCursor() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            if (cursorRing) {
                cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover states
        document.querySelectorAll('button, a, .feature-card, .showcase-card, .desktop-icon, .context-item, .start-app-item').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    function spawnCursorParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'cursor-particle';
        particle.style.left = `${x + (Math.random() - 0.5) * 16}px`;
        particle.style.top = `${y + (Math.random() - 0.5) * 16}px`;
        document.body.appendChild(particle);
        requestAnimationFrame(() => {
            particle.style.opacity = '0';
            particle.style.transform = `scale(0.2) translate(${(Math.random()-0.5)*30}px, ${(Math.random()-0.5)*30}px)`;
        });
        setTimeout(() => particle.remove(), 500);
    }

    // 2. Navbar Scroll Effect & Mobile Hamburger
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (hamburger && mobileDrawer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileDrawer.classList.toggle('active');
        });
        mobileDrawer.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', () => {
                mobileDrawer.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // 3. 3D Tilt Effect on Hero Preview
    const previewBox = document.getElementById('hero-preview-box');
    if (previewBox && !isTouch) {
        const heroSection = document.getElementById('hero');
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotateX = (-y / (rect.height / 2)) * 8;
            const rotateY = (x / (rect.width / 2)) * 8;
            previewBox.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            previewBox.style.transform = `rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    }

    // 4. Hero Parallax on Scroll
    if (!prefersReducedMotion && previewBox) {
        const heroSection = document.getElementById('hero');
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroRect = heroSection.getBoundingClientRect();
            if (heroRect.bottom > 0) {
                const progress = Math.min(scrollY / (window.innerHeight * 0.6), 1);
                const scale = 1 - progress * 0.08;
                const glow = 0.25 + progress * 0.4;
                previewBox.style.boxShadow = `0 25px 60px rgba(0,0,0,0.7), 0 0 ${40 + progress * 40}px rgba(168,85,247,${glow})`;
                if (!isTouch) {
                    // Don't override 3D tilt transform on desktop
                } else {
                    previewBox.style.transform = `scale(${scale})`;
                }
            }
        });
    }

    // 5. Interactive Particle Canvas
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const baseCount = Math.min(Math.floor(width * height / 18000), 80);
        const particleCount = prefersReducedMotion ? 15 : baseCount;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1
            });
        }

        let pMouseX = -1000, pMouseY = -1000;
        window.addEventListener('mousemove', (e) => {
            pMouseX = e.clientX;
            pMouseY = e.clientY;
        });

        function renderParticles() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Mouse push
                const dx = pMouseX - p.x;
                const dy = pMouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const angle = Math.atan2(dy, dx);
                    p.x -= Math.cos(angle) * 1.5;
                    p.y -= Math.sin(angle) * 1.5;
                }

                // Draw particle with glow
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
                gradient.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
                gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(192, 132, 252, 0.8)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                // Connection lines
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let distance = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (distance < 120) {
                        ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - distance / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(renderParticles);
        }
        if (!prefersReducedMotion) {
            renderParticles();
        }
    }

    // 6. Scroll Animation Observer
    const animatedSections = document.querySelectorAll('[data-animate]');
    if (animatedSections.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        animatedSections.forEach(section => observer.observe(section));
    }

    // 7. System Status Animation Bars
    setInterval(() => {
        const cpuBar = document.getElementById('stat-cpu');
        const cpuVal = document.getElementById('val-cpu');
        const memBar = document.getElementById('stat-mem');
        const memVal = document.getElementById('val-mem');

        if (cpuBar && cpuVal) {
            const randCpu = Math.floor(25 + Math.random() * 35);
            cpuBar.style.width = `${randCpu}%`;
            cpuVal.textContent = `${randCpu}%`;
        }
        if (memBar && memVal) {
            const randMem = Math.floor(50 + Math.random() * 15);
            memBar.style.width = `${randMem}%`;
            memVal.textContent = `${randMem}%`;
        }
    }, 2500);

    // 8. Ripple Effect on Buttons
    document.querySelectorAll('.ripple-container').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });

    // 9. Boot Sequence Transition
    const bootScreen = document.getElementById('boot-screen');
    const bootLogText = document.getElementById('boot-log-text');
    const bootProgressFill = document.getElementById('boot-progress-fill');

    function startBootSequence(callback) {
        if (!bootScreen) return;
        bootScreen.classList.add('active');

        const logs = [
            "NOVAOS BIOS v2.4",
            "INITIALIZING SYSTEM KERNEL...",
            "LOADING SECURITY PROTOCOLS...",
            "MOUNTING VIRTUAL FILESYSTEM...",
            "LOADING CORE MODULES...",
            "LOADING DESKTOP ENVIRONMENT...",
            "STARTING WINDOW MANAGER...",
            "LOADING APPLICATIONS...",
            "SYSTEM READY.",
            "WELCOME TO NOVAOS."
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < logs.length) {
                if (bootLogText) bootLogText.textContent = logs[index];
                if (bootProgressFill) bootProgressFill.style.width = `${Math.floor(((index + 1) / logs.length) * 100)}%`;
                index++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    bootScreen.classList.remove('active');
                    if (callback) callback();
                }, 500);
            }
        }, 280);
    }

    // Launch triggers
    const launchTriggers = ['nav-launch-btn', 'mobile-launch-btn', 'hero-launch-btn', 'cta-boot-btn'];
    launchTriggers.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                startBootSequence(onBootComplete);
            });
        }
    });

    // Showcase demo app triggers from landing page
    document.querySelectorAll('.showcase-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const appName = e.target.getAttribute('data-app');
            startBootSequence(() => {
                if (onBootComplete) onBootComplete(appName);
            });
        });
    });
}
