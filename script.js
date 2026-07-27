(() => {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.getElementById("siteHeader");
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileNav = document.getElementById("mobileNav");

    const setHeaderState = () => {
        header?.classList.toggle("scrolled", window.scrollY > 28);
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    const setMenu = (open) => {
        if (!menuToggle || !mobileNav) return;

        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        mobileNav.classList.toggle("open", open);
        document.body.classList.toggle("menu-open", open);
    };

    menuToggle?.addEventListener("click", () => {
        setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    mobileNav?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setMenu(false);
    });

    const revealItems = document.querySelectorAll(".reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -5% 0px"
        });

        revealItems.forEach((item) => revealObserver.observe(item));
    }

    const navLinks = document.querySelectorAll(".desktop-nav a");
    const navSections = [...navLinks]
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            const visibleSection = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visibleSection) return;

            navLinks.forEach((link) => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === `#${visibleSection.target.id}`
                );
            });
        }, {
            rootMargin: "-28% 0px -58% 0px",
            threshold: [0, 0.25, 0.6]
        });

        navSections.forEach((section) => sectionObserver.observe(section));
    }

    const cursorAura = document.querySelector(".cursor-aura");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (cursorAura && finePointer && !reducedMotion) {
        let currentX = window.innerWidth / 2;
        let currentY = window.innerHeight / 2;
        let targetX = currentX;
        let targetY = currentY;

        window.addEventListener("pointermove", (event) => {
            targetX = event.clientX;
            targetY = event.clientY;
            document.body.classList.add("has-pointer");
        }, { passive: true });

        const renderAura = () => {
            currentX += (targetX - currentX) * 0.11;
            currentY += (targetY - currentY) * 0.11;
            cursorAura.style.transform = `translate3d(${currentX - 230}px, ${currentY - 230}px, 0)`;
            requestAnimationFrame(renderAura);
        };

        renderAura();

        document.querySelectorAll(".magnetic").forEach((element) => {
            element.addEventListener("pointermove", (event) => {
                const rect = element.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                element.style.transform = `translate3d(${x * 0.08}px, ${y * 0.12}px, 0)`;
            });

            element.addEventListener("pointerleave", () => {
                element.style.transform = "";
            });
        });
    }

    const localTime = document.getElementById("localTime");
    const updateAucklandTime = () => {
        if (!localTime) return;

        const time = new Intl.DateTimeFormat("en-NZ", {
            timeZone: "Pacific/Auckland",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(new Date());

        localTime.textContent = `Auckland · ${time}`;
    };

    updateAucklandTime();
    window.setInterval(updateAucklandTime, 30_000);

    class SignalField {
        constructor(canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext("2d");
            this.frame = 0;
            this.width = 0;
            this.height = 0;
            this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            this.pointer = { x: 0.5, y: 0.5, active: false };
            this.points = Array.from({ length: 18 }, (_, index) => ({
                angle: (Math.PI * 2 * index) / 18,
                radius: 0.26 + (index % 4) * 0.08,
                speed: 0.16 + (index % 3) * 0.06,
                phase: index * 0.73,
                color: index % 4 === 0 ? "#d8ff3e" : "#6e8bff"
            }));

            this.resize = this.resize.bind(this);
            this.draw = this.draw.bind(this);

            this.resize();
            this.bind();
            this.draw();
        }

        bind() {
            const wrapper = this.canvas.parentElement;
            window.addEventListener("resize", this.resize, { passive: true });

            wrapper?.addEventListener("pointermove", (event) => {
                const rect = wrapper.getBoundingClientRect();
                this.pointer.x = (event.clientX - rect.left) / rect.width;
                this.pointer.y = (event.clientY - rect.top) / rect.height;
                this.pointer.active = true;
            }, { passive: true });

            wrapper?.addEventListener("pointerleave", () => {
                this.pointer.active = false;
            });
        }

        resize() {
            const rect = this.canvas.getBoundingClientRect();
            this.width = Math.max(1, rect.width);
            this.height = Math.max(1, rect.height);
            this.canvas.width = Math.floor(this.width * this.pixelRatio);
            this.canvas.height = Math.floor(this.height * this.pixelRatio);
            this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        }

        draw() {
            const context = this.context;
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const base = Math.min(this.width, this.height);
            const time = this.frame / 60;

            context.clearRect(0, 0, this.width, this.height);

            const positions = this.points.map((point) => {
                const movement = Math.sin(time * point.speed + point.phase) * 0.025;
                const radius = base * (point.radius + movement);
                const angle = point.angle + time * point.speed * 0.16;
                const pointerShiftX = this.pointer.active
                    ? (this.pointer.x - 0.5) * base * 0.05
                    : 0;
                const pointerShiftY = this.pointer.active
                    ? (this.pointer.y - 0.5) * base * 0.05
                    : 0;

                return {
                    x: centerX + Math.cos(angle) * radius + pointerShiftX,
                    y: centerY + Math.sin(angle) * radius + pointerShiftY,
                    color: point.color
                };
            });

            positions.forEach((point, index) => {
                const next = positions[(index + 1) % positions.length];

                context.beginPath();
                context.moveTo(point.x, point.y);
                context.lineTo(next.x, next.y);
                context.strokeStyle = "rgba(243, 242, 234, 0.10)";
                context.lineWidth = 0.75;
                context.stroke();

                if (index % 3 === 0) {
                    context.beginPath();
                    context.moveTo(point.x, point.y);
                    context.lineTo(centerX, centerY);
                    context.strokeStyle = index % 2 === 0
                        ? "rgba(216, 255, 62, 0.13)"
                        : "rgba(110, 139, 255, 0.13)";
                    context.stroke();
                }

                context.beginPath();
                context.arc(point.x, point.y, index % 4 === 0 ? 2.1 : 1.2, 0, Math.PI * 2);
                context.fillStyle = point.color;
                context.fill();
            });

            if (!reducedMotion) {
                this.frame += 1;
                requestAnimationFrame(this.draw);
            }
        }
    }

    const signalCanvas = document.getElementById("signalCanvas");
    if (signalCanvas) new SignalField(signalCanvas);

    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");

    contactForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const submitLabel = submitButton?.querySelector(".submit-label");
        const originalLabel = submitLabel?.textContent || "Transmit message";

        if (submitButton) submitButton.disabled = true;
        if (submitLabel) submitLabel.textContent = "Transmitting…";
        if (formStatus) formStatus.textContent = "";

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                body: new FormData(contactForm),
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error("Message service unavailable");

            contactForm.reset();
            if (submitLabel) submitLabel.textContent = "Signal received ✓";
            if (formStatus) formStatus.textContent = "Thanks — I’ll get back to you soon.";

            window.setTimeout(() => {
                if (submitLabel) submitLabel.textContent = originalLabel;
            }, 4000);
        } catch {
            if (submitLabel) submitLabel.textContent = originalLabel;
            if (formStatus) {
                formStatus.innerHTML = 'Transmission failed. Please email <a href="mailto:zeqiyin@aol.com">zeqiyin@aol.com</a>.';
            }
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
})();
