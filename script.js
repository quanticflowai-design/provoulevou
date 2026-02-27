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

            // Toggle icon
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');

                // Reset icon
                const icon = menuToggle.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

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
    // Video Demo Modal Logic
    const demoTriggers = document.querySelectorAll('.demo-trigger');
    const demoModal = document.getElementById('demo-modal');
    const demoVideo = document.getElementById('demo-video');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');

    if (demoTriggers.length > 0 && demoModal && demoVideo) {
        demoTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                demoModal.classList.add('active');

                // Ensure video starts from beginning, with sound and plays
                demoVideo.currentTime = 0;
                demoVideo.muted = false; // Ensure sound is active
                const playPromise = demoVideo.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Video play failed:", error);
                    });
                }

                document.body.style.overflow = 'hidden'; // Prevent scroll
            });
        });

        const closeModal = () => {
            demoModal.classList.remove('active');
            demoVideo.pause();
            demoVideo.currentTime = 0; // Reset video
            document.body.style.overflow = ''; // Restore scroll
        };

        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

        // Close on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && demoModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('h4');
        const answer = item.querySelector('p');

        if (question && answer) {
            // Initially hide answer via CSS if needed, but doing it in JS ensures it works if JS is disabled
            // Alternatively, manage via CSS class. Let's do a simple inline style toggle for now
            answer.style.display = 'none';
            question.style.cursor = 'pointer';

            // Add a plus/minus icon indicator conceptually by changing rotation or replacing icon, 
            // but just click toggle is fine for basic interactivity

            question.addEventListener('click', () => {
                // Close others
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherAnswer = otherItem.querySelector('p');
                        if (otherAnswer) otherAnswer.style.display = 'none';
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current
                const isHidden = answer.style.display === 'none';
                answer.style.display = isHidden ? 'block' : 'none';

                if (isHidden) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    });

});
