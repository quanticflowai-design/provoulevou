document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Sticky Header Scroll Effect (Removed as per user request for fixed top behavior without scroll change)
    // const header = document.querySelector('.header');
    // window.addEventListener('scroll', () => { ... });

    // Simple reveal animation on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.solution-card, .process-item');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // WhatsApp Form Handler
    const whatsappForm = document.querySelector('.cta-form');
    // If the form exists (it should, but good to check)
    if (whatsappForm) {
        whatsappForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const phoneInput = whatsappForm.querySelector('input[type="tel"]');
            const phoneNumber = phoneInput.value;

            // Basic validation - check if not empty (required attribute handles this mostly, but good for JS logic)
            if (phoneNumber) {
                // Formatting the message
                const message = `Olá, tenho interesse no Provador Virtual. Meu contato é: ${phoneNumber}`;
                const encodedMessage = encodeURIComponent(message);

                // Destination number
                const destinationNumber = '5511938034714';

                // Construct WhatsApp URL
                const whatsappUrl = `https://wa.me/${destinationNumber}?text=${encodedMessage}`;

                // Open in new tab
                window.open(whatsappUrl, '_blank');
            }
        });

        // Input Masking
        const phoneInput = whatsappForm.querySelector('input[type="tel"]');
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 11) value = value.slice(0, 11); // Limit to 11 digits

            if (value.length > 10) {
                // (XX) XXXXX-XXXX
                value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 6) {
                // (XX) XXXX-XXXX (incomplete)
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                // (XX) XXXX...
                value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                // (XX...
                value = value.replace(/^(\d*)/, '($1');
            }

            e.target.value = value;
        });
    }

    // Neural Network Background Effect
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 15 : 30; // Much fewer particles
        const connectionDistance = isMobile ? 120 : 160;
        const mouseRadius = 150;
        let mouse = { x: null, y: null };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('resize', () => {
            resizeCanvas();
        });

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + (isMobile ? 3 : 2); // Larger particles
                this.speedX = Math.random() * 0.5 - 0.25; // Slower movement
                this.speedY = Math.random() * 0.5 - 0.25;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;

                // Mouse interaction
                if (mouse.x && mouse.y) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouseRadius) {
                        if (this.x < mouse.x && this.x > 0) this.x -= 2;
                        else if (this.x > mouse.x && this.x < canvas.width) this.x += 2;
                        if (this.y < mouse.y && this.y > 0) this.y -= 2;
                        else if (this.y > mouse.y && this.y < canvas.height) this.y += 2;
                    }
                }
            }

            draw() {
                ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.strokeStyle = `rgba(139, 92, 246, ${1 - distance / connectionDistance})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        resizeCanvas();
        animate();
    }
});
