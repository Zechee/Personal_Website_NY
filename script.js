// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const typingText = document.getElementById('typingText');
const cursorGlow = document.getElementById('cursorGlow');

// ===== Typing Animation =====
const roles = [
    'Full Stack Developer',
    'Software Engineer',
    '.NET Specialist',
    'Problem Solver',
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
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500; // Pause before next word
    }

    setTimeout(typeRole, typingSpeed);
}

// Start typing animation
setTimeout(typeRole, 1000);

// ===== Navbar Scroll Effect =====
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===== Mobile Navigation =====
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking a link
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
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
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
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    
    requestAnimationFrame(animateGlow);
}

// Only enable cursor glow on desktop
if (window.innerWidth > 768) {
    animateGlow();
} else {
    cursorGlow.style.display = 'none';
}

// ===== Scroll Reveal Animation =====
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;
    
    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (elementTop < windowHeight - revealPoint) {
            element.classList.add('active');
        }
    });
}

// Add reveal class to elements
document.querySelectorAll('.section-title, .skill-category, .timeline-item, .project-card, .education-card').forEach(el => {
    el.classList.add('reveal');
});

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check

// ===== Smooth Scroll for Safari =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
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
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
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
            submitBtn.innerHTML = '<i class="fas fa-times"></i> Error!';
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// ===== Code Window 3D Tilt Effect =====
const codeWindow = document.querySelector('.code-window');

if (codeWindow && window.innerWidth > 768) {
    codeWindow.addEventListener('mousemove', (e) => {
        const rect = codeWindow.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        codeWindow.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    codeWindow.addEventListener('mouseleave', () => {
        codeWindow.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
}

// ===== Parallax Effect for Hero =====
const heroSection = document.querySelector('.hero');

if (heroSection && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

// ===== Console Easter Egg =====
console.log('%c👋 Hey there, curious developer!', 'font-size: 24px; font-weight: bold;');
console.log('%cLooks like you\'re checking out the code. Nice!', 'font-size: 14px;');
console.log('%cFeel free to reach out: zeqiyin@aol.com', 'font-size: 14px; color: #6366f1;');
