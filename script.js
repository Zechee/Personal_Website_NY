// ============================================================
// Enhanced Particle Network System
// ============================================================
class ParticleNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 200 };
        this.colors = [
            { r: 124, g: 58, b: 237 },   // purple
            { r: 6, g: 214, b: 160 },     // teal
            { r: 6, g: 182, b: 212 },     // cyan
            { r: 244, g: 63, b: 94 },     // rose
        ];
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const count = Math.min(
            Math.floor((this.canvas.width * this.canvas.height) / 12000),
            150
        );
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 2.5 + 1,
                color: color,
                opacity: Math.random() * 0.5 + 0.3,
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now() * 0.001;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Pulse size
            const pulseFactor = 1 + Math.sin(time * 2 + p.pulsePhase) * 0.3;

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around
            if (p.x > this.canvas.width + 10) p.x = -10;
            if (p.x < -10) p.x = this.canvas.width + 10;
            if (p.y > this.canvas.height + 10) p.y = -10;
            if (p.y < -10) p.y = this.canvas.height + 10;

            // Mouse interaction - attract particles gently
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.vx += dx * force * 0.0008;
                    p.vy += dy * force * 0.0008;
                }
            }

            // Dampen velocity
            p.vx *= 0.998;
            p.vy *= 0.998;

            // Draw particle with glow
            const r = p.radius * pulseFactor;
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
            gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`);
            gradient.addColorStop(0.4, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Solid core
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity + 0.2})`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.2;
                    const grad = this.ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
                    grad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${opacity})`);
                    grad.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${opacity})`);

                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = grad;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }

            // Draw connection to mouse
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const opacity = (1 - dist / this.mouse.radius) * 0.35;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================================
// Text Scramble Effect
// ============================================================
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyz';
        this.frameRequest = null;
        this.frame = 0;
        this.queue = [];
        this.resolve = null;
    }

    setText(newText) {
        const oldText = this.el.textContent;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 20);
            const end = start + Math.floor(Math.random() * 20) + 10;
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0; i < this.queue.length; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            if (this.resolve) this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(() => this.update());
            this.frame++;
        }
    }
}

// ============================================================
// Custom Cursor
// ============================================================
class CustomCursor {
    constructor() {
        this.dot = document.getElementById('cursorDot');
        this.outline = document.getElementById('cursorOutline');
        if (!this.dot || !this.outline || window.innerWidth <= 768) return;

        this.mouseX = 0;
        this.mouseY = 0;
        this.outlineX = 0;
        this.outlineY = 0;
        this.isHover = false;

        this.bindEvents();
        this.animate();
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.dot.style.left = e.clientX + 'px';
            this.dot.style.top = e.clientY + 'px';
        });

        // Hover effect on interactive elements
        const hoverEls = document.querySelectorAll('a, button, [data-magnetic], input, textarea, .portfolio-card, .skill-card, .contact-card, .stat-card');
        hoverEls.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.dot.classList.add('hover');
                this.outline.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                this.dot.classList.remove('hover');
                this.outline.classList.remove('hover');
            });
        });
    }

    animate() {
        this.outlineX += (this.mouseX - this.outlineX) * 0.12;
        this.outlineY += (this.mouseY - this.outlineY) * 0.12;

        this.outline.style.left = this.outlineX + 'px';
        this.outline.style.top = this.outlineY + 'px';

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================================
// Magnetic Effect
// ============================================================
class MagneticEffect {
    constructor() {
        if (window.innerWidth <= 768) return;
        const elements = document.querySelectorAll('[data-magnetic]');
        elements.forEach(el => this.applyMagnetic(el));
    }

    applyMagnetic(el) {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            setTimeout(() => { el.style.transition = ''; }, 400);
        });
    }
}

// ============================================================
// Scroll Animations
// ============================================================
class ScrollAnimator {
    constructor() {
        this.elements = document.querySelectorAll('[data-animate]');
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = parseInt(entry.target.dataset.delay || 0);
                        setTimeout(() => {
                            entry.target.classList.add('in-view');
                        }, delay);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        this.elements.forEach(el => this.observer.observe(el));
    }

    reobserve(container) {
        const newEls = container.querySelectorAll('[data-animate]');
        newEls.forEach(el => {
            el.classList.remove('in-view');
            this.observer.observe(el);
        });
    }
}

// ============================================================
// 3D Tilt Effect
// ============================================================
class TiltEffect {
    constructor() {
        if (window.innerWidth <= 768) return;
        document.querySelectorAll('[data-tilt]').forEach(el => this.applyTilt(el));
    }

    applyTilt(el) {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            el.style.transform = `perspective(800px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg) scale(1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            setTimeout(() => { el.style.transition = ''; }, 500);
        });
    }
}

// ============================================================
// Initialize Everything
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- Particles ---
    const canvas = document.getElementById('particleCanvas');
    if (canvas && window.innerWidth > 768) {
        new ParticleNetwork(canvas);
    }

    // --- Custom Cursor ---
    new CustomCursor();

    // --- Magnetic Effect ---
    new MagneticEffect();

    // --- Scroll Animations ---
    const scrollAnimator = new ScrollAnimator();

    // --- 3D Tilt ---
    new TiltEffect();

    // --- Text Scramble for Hero Role ---
    const roleEl = document.getElementById('roleText');
    if (roleEl) {
        const scrambler = new TextScramble(roleEl);
        const roles = [
            'Software Developer',
            'Analyst Developer @ FNZ',
            '.NET Specialist',
            'Full Stack Engineer',
            'AI Enthusiast',
        ];
        let roleIndex = 0;

        const nextRole = () => {
            scrambler.setText(roles[roleIndex]).then(() => {
                setTimeout(nextRole, 2500);
            });
            roleIndex = (roleIndex + 1) % roles.length;
        };

        setTimeout(nextRole, 800);
    }

    // --- Navbar Scroll ---
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    // --- Mobile Navigation ---
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    function highlightNav() {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                } 
            }
        });
    }
    window.addEventListener('scroll', highlightNav);

    // --- Animated Counters ---
    function animateCounters() {
        document.querySelectorAll('.stat-num').forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.floor(target * ease);
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const obs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                obs.unobserve(aboutSection);
            }
        }, { threshold: 0.3 });
        obs.observe(aboutSection);
    }

    // --- Skill Bars Animation ---
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        const obs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(() => {
                    document.querySelectorAll('.skill-fill').forEach(bar => {
                        const width = bar.dataset.width;
                        bar.style.width = width + '%';
                        // Add glow dot after animation
                        setTimeout(() => bar.classList.add('animated'), 1500);
                    });
                }, 300);
                obs.unobserve(skillsSection);
            }
        }, { threshold: 0.2 });
        obs.observe(skillsSection);
    }

    // --- Timeline Line Fill Animation ---
    function animateTimelineLines() {
        document.querySelectorAll('.timeline-container:not(.hidden)').forEach(container => {
            const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const progress = Math.min(
                    Math.max((viewportHeight - rect.top) / (rect.height + viewportHeight), 0),
                    1
                );
                const fill = container.querySelector('.timeline-line-fill');
                if (fill) fill.style.height = (progress * 100) + '%';
            }
        });
    }
    window.addEventListener('scroll', animateTimelineLines);
    animateTimelineLines();

    // --- Experience/Education Tabs ---
    const expTabs = document.querySelectorAll('.exp-tab');
    const workTimeline = document.getElementById('workTimeline');
    const eduTimeline = document.getElementById('eduTimeline');

    expTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            expTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;
            if (target === 'work') {
                workTimeline.classList.remove('hidden');
                eduTimeline.classList.add('hidden');
            } else {
                workTimeline.classList.add('hidden');
                eduTimeline.classList.remove('hidden');
            }

            // Re-trigger animations for the newly visible timeline
            const visible = document.querySelector('.timeline-container:not(.hidden)');
            if (visible) {
                scrollAnimator.reobserve(visible);
            }
            animateTimelineLines();
        });
    });

    // --- Portfolio Filters ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            portfolioItems.forEach(item => {
                const cat = item.dataset.category;
                if (filter === 'all' || cat === filter) {
                    item.classList.remove('hide');
                    item.style.animation = 'none';
                    item.offsetHeight; // trigger reflow
                    item.style.animation = '';
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const position = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    });

    // --- Form Submission ---
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const original = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Sending...</span>';
            btn.disabled = true;

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: new FormData(this),
                    headers: { 'Accept': 'application/json' },
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> <span class="btn-text">Sent!</span>';
                    btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    this.reset();
                    setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; }, 3000);
                } else {
                    throw new Error('Failed');
                }
            } catch {
                btn.innerHTML = '<i class="fas fa-times"></i> <span class="btn-text">Error</span>';
                btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; }, 3000);
            }
        });
    }

    // --- Hero Parallax ---
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = document.querySelector('.hero-content');
            if (heroContent && scrolled < window.innerHeight) {
                heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.7));
            }
        });
    }

    // --- Console Easter Egg ---
    console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #7c3aed;');
    console.log('%cChecking out the code? Nice!', 'font-size: 14px; color: #06d6a0;');
    console.log('%cReach out: zeqiyin@aol.com', 'font-size: 14px; color: #a78bfa;');
});

// Add scramble char styling dynamically
const style = document.createElement('style');
style.textContent = `.scramble-char { color: var(--text-muted); font-weight: 400; }`;
document.head.appendChild(style);
