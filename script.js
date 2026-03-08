// ===== Particles System =====
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        this.particles = [];
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(this.canvas, this.mouse);
            this.particles[i].draw(this.ctx);

            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (1 - distance / 120) * 0.15;
                    this.ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update(canvas, mouse) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= dx * force * 0.02;
                this.y -= dy * force * 0.02;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(108, 99, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize particles
const particlesCanvas = document.getElementById('particlesCanvas');
if (particlesCanvas && window.innerWidth > 768) {
    new ParticleSystem(particlesCanvas);
}

// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const typingText = document.getElementById('typingText');
const cursorGlow = document.getElementById('cursorGlow');
const backToTop = document.getElementById('backToTop');

// ===== Typing Animation =====
const roles = [
    'Software Developer',
    'Analyst Developer @ FNZ',
    '.NET Specialist',
    'Full Stack Engineer',
    'Tech Enthusiast'
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeRole() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        typingText.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typingSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500;
    }

    setTimeout(typeRole, typingSpeed);
}

setTimeout(typeRole, 1000);

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Back to top visibility
    if (backToTop) {
        if (currentScroll > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
});

// ===== Mobile Navigation =====
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

// ===== Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 120;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// ===== Cursor Glow Effect =====
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    
    if (cursorGlow) {
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
    }
    
    requestAnimationFrame(animateGlow);
}

if (window.innerWidth > 768) {
    animateGlow();
} else if (cursorGlow) {
    cursorGlow.style.display = 'none';
}

// ===== Scroll Reveal Animation =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

// ===== Animated Counter =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            
            counter.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    });
}

// Trigger counter when about section is visible
const aboutSection = document.getElementById('about');
if (aboutSection) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    counterObserver.observe(aboutSection);
}

// ===== Skill Bar Animation =====
function animateSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    bars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
    });
}

const skillsSection = document.getElementById('skills');
if (skillsSection) {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(animateSkillBars, 300);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    skillObserver.observe(skillsSection);
}

// ===== Experience / Education Tabs =====
const expTabs = document.querySelectorAll('.exp-tab');
const experienceTab = document.getElementById('experienceTab');
const educationTab = document.getElementById('educationTab');

expTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        expTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.getAttribute('data-tab');
        
        if (tabName === 'experience') {
            experienceTab.classList.remove('hidden');
            educationTab.classList.add('hidden');
        } else {
            experienceTab.classList.add('hidden');
            educationTab.classList.remove('hidden');
        }

        // Re-trigger reveal animations for newly visible items
        document.querySelectorAll('.timeline-wrapper:not(.hidden) .reveal').forEach(el => {
            el.classList.remove('active');
            setTimeout(() => {
                revealObserver.observe(el);
            }, 50);
        });
    });
});

// ===== Portfolio Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Form Submission =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Message Sent!</span>';
                submitBtn.style.background = 'linear-gradient(135deg, #00d4aa 0%, #10b981 100%)';
                this.reset();
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            submitBtn.innerHTML = '<i class="fas fa-times"></i> <span>Error!</span>';
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// ===== Parallax Effect for Hero Orbs =====
if (window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
            heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
        }
    });
}

// ===== Tilt Effect on Portfolio Cards =====
if (window.innerWidth > 768) {
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });
}

// ===== Console Easter Egg =====
console.log('%c👋 Hey there, curious developer!', 'font-size: 24px; font-weight: bold;');
console.log('%cLooks like you\'re checking out the code. Nice!', 'font-size: 14px;');
console.log('%cFeel free to reach out: zeqiyin@aol.com', 'font-size: 14px; color: #6c63ff;');
