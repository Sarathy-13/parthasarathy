// Gamification Logic - Partha Sarathy Portfolio

document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitcher();
    initCanvasBackground();
    initTypingEffect();
    init3DTilt();
});

/* --- Theme Switcher --- */
function initThemeSwitcher() {
    const toggleBtn = document.getElementById('theme-toggle');
    const switcher = document.querySelector('.theme-switcher');
    const themeBtns = document.querySelectorAll('.theme-btn');

    // Toggle menu
    toggleBtn.addEventListener('click', () => {
        switcher.classList.toggle('open');
    });

    // Theme selection
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            themeBtns.forEach(b => b.classList.remove('active'));
            // Add to current
            btn.classList.add('active');

            // Set theme
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
        });
    });
}

function setTheme(themeName) {
    const body = document.body;

    // Remove existing theme attributes
    body.removeAttribute('data-theme');

    if (themeName !== 'cyberpunk') { // Cyberpunk is default (no attribute needed, or use specific class)
        body.setAttribute('data-theme', themeName);
    }

    // Update Canvas Colors based on theme
    updateCanvasColors(themeName);
}

/* --- Interactive Canvas Background --- */
let canvas, ctx;
let particles = [];
let animationId;
let themeColors = {
    cyberpunk: { color: 'rgba(0, 243, 255, 0.2)', line: 'rgba(0, 243, 255, 0.05)' },
    hacker: { color: 'rgba(0, 255, 0, 0.2)', line: 'rgba(0, 255, 0, 0.05)' },
    retro: { color: 'rgba(255, 0, 85, 0.2)', line: 'rgba(255, 0, 85, 0.05)' }
};
let currentTheme = 'cyberpunk';

let mouse = {
    x: null,
    y: null,
    radius: 150 // Interaction radius
};

function initCanvasBackground() {
    canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    createParticles();
    animateParticles();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles(); // Re-create on resize
}

function createParticles() {
    particles = [];
    const particleCount = Math.floor(window.innerWidth / 15); // Density based on width

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            baseX: Math.random() * canvas.width, // Backup for return (optional, simpler for floating)
            baseY: Math.random() * canvas.height
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = themeColors[currentTheme] || themeColors.cyberpunk;

    particles.forEach((p, index) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse Interaction
        if (mouse.x != null) {
            let dx = mouse.x - p.x;
            let dy = mouse.y - p.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                const directionX = forceDirectionX * force * 5; // Strength
                const directionY = forceDirectionY * force * 5;

                p.x -= directionX;
                p.y -= directionY;
            }
        }

        // Draw Dot
        ctx.fillStyle = colors.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect Lines
        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.strokeStyle = colors.line;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animateParticles);
}

function updateCanvasColors(theme) {
    currentTheme = theme;
    // Special effect for Hacker theme (Matrix Rain - simplified for compatibility)
    // For now, just changing colors is sufficient for consistency
}

/* --- Typing Effect --- */
function initTypingEffect() {
    const heroGreeting = document.querySelector('.hero-greeting');
    if (!heroGreeting) return;

    const text = heroGreeting.textContent;
    heroGreeting.textContent = '';

    let i = 0;
    function type() {
        if (i < text.length) {
            heroGreeting.textContent += text.charAt(i);
            i++;
            setTimeout(type, 100);
        } else {
            // Add blinking cursor
            heroGreeting.innerHTML += '<span class="typing-cursor">&nbsp;</span>';
        }
    }

    // Start after a delay
    setTimeout(type, 500);
}

/* --- 3D Tilt Effect for Cards --- */
function init3DTilt() {
    const cards = document.querySelectorAll('.project-card, .skill-card, .cert-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', handleHover);
        card.addEventListener('mouseleave', resetTilt);
    });
}

function handleHover(e) {
    const card = this;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    card.style.zIndex = '10';
}

function resetTilt() {
    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    this.style.zIndex = '1';
}
