document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       1. Scroll Progress Bar
       ========================================================= */
    const progressBar = document.getElementById("myBar");
    window.addEventListener('scroll', () => {
        let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        let scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });

    /* =========================================================
       2. Intersection Observer for Scroll Animations
       ========================================================= */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% visible
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* =========================================================
       5. Hero Canvas AI Neural Network Background
       ========================================================= */
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });

        // Mouse interaction
        let mouse = {
            x: null,
            y: null,
            radius: (canvas.height / 80) * (canvas.width / 80)
        };

        const heroContainer = document.getElementById('hero');
        heroContainer.addEventListener('mousemove', (event) => {
            // Get proper mouse coordinates rel to canvas
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });

        heroContainer.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
                // Add a glowing effect
                this.baseColor = color;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#d4af37';
                ctx.fill();
                ctx.shadowBlur = 0; // reset
            }

            update() {
                // Bounce off edges
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

                // Collision detection with mouse push
                if (mouse.x != undefined && mouse.y != undefined) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius + this.size) {
                        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 1.5;
                        if (mouse.x > this.x && this.x > this.size * 10) this.x -= 1.5;
                        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 1.5;
                        if (mouse.y > this.y && this.y > this.size * 10) this.y -= 1.5;
                        // Brighten particle near mouse
                        this.color = '#f3e5ab';
                    } else {
                        this.color = this.baseColor;
                    }
                }

                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            // Calc density based on screen size
            let numberOfParticles = (canvas.height * canvas.width) / 10000;
            // Cap it so it doesn't lag
            if (numberOfParticles > 120) numberOfParticles = 120;

            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;

                // Mix of gold and white particles
                let color = Math.random() > 0.6 ? '#d4af37' : 'rgba(255, 255, 255, 0.5)';

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function connectParticles() {
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                        + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = 'rgba(212, 175, 55,' + opacityValue + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            // Clear trail
            ctx.clearRect(0, 0, innerWidth, innerHeight);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connectParticles();
        }

        initParticles();
        animate();
    }

    /* =========================================================
       6. Countdown Timer Logic
       ========================================================= */
    const hrDisplay = document.getElementById('timer-hr');
    const minDisplay = document.getElementById('timer-min');
    const secDisplay = document.getElementById('timer-sec');

    if (hrDisplay && minDisplay && secDisplay) {
        // Set total remaining time in seconds (11 minutes)
        let totalTime = 11 * 60;

        const updateTimer = () => {
            if (totalTime <= 0) {
                clearInterval(timerInterval);
                hrDisplay.textContent = '00';
                minDisplay.textContent = '00';
                secDisplay.textContent = '00';
                return;
            }

            const hrs = Math.floor(totalTime / 3600);
            const remainingSecs = totalTime % 3600;
            const mins = Math.floor(remainingSecs / 60);
            const secs = remainingSecs % 60;

            // Format with leading zeros
            hrDisplay.textContent = hrs.toString().padStart(2, '0');
            minDisplay.textContent = mins.toString().padStart(2, '0');
            secDisplay.textContent = secs.toString().padStart(2, '0');

            totalTime--;
        };

        // Initialize immediately and then loop
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }
});
