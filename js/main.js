document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on load
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    console.log("Portfolio loaded successfully!");

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Toggle icon between bars and times (X)
            const icon = menuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Smooth Scrolling for anchor links (Polyfill-like behavior if needed, or just for offset)
    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Account for fixed header height (80px) + some breathing room
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Update active class manually on click for immediate feedback
                document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // ScrollSpy: Highlight active nav link on scroll
    const sections = document.querySelectorAll('section');
    const navLinksList = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // 30% of viewport offset for better trigger point
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinksList.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Animate Statistics
    const statsSection = document.querySelector('.hero-stats');
    const statsHelper = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    animateStats();
                    hasAnimated = true;
                }
            });
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    function animateStats() {
        statsHelper.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const isFloat = target % 1 !== 0;
            const duration = 2000; // ms
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;

            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.innerText = isFloat ? current.toFixed(1) : Math.floor(current);
            }, stepTime);
        });
    }

    // Project Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category');

                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.style.display = 'block';
                    // Optional: Add fade-in animation
                    card.classList.add('fade-in');
                    setTimeout(() => card.classList.remove('fade-in'), 500);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simple validation visualization
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Simulate loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Simulate API call delay
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitBtn.style.backgroundColor = 'var(--secondary-color)'; // Green

                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = '';
                    alert('Thank you for your message! I will get back to you soon.');
                }, 2000);
            }, 1500);
        });
    }

    // Guestbook Features
    const guestbookForm = document.getElementById('guestbook-form');
    const guestbookList = document.getElementById('guestbook-list');
    const STORAGE_KEY = 'portfolio_guestbook';

    function loadGuestbook() {
        if (!guestbookList) return;

        const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        if (messages.length === 0) {
            guestbookList.innerHTML = '<p class="text-center text-muted">No messages yet. Be the first to say hi!</p>';
            return;
        }

        guestbookList.innerHTML = messages.map(msg => `
            <div class="gb-message card-hover" data-id="${msg.id}">
                <div class="gb-header">
                    <strong>${escapeHtml(msg.name)}</strong>
                    <small>${msg.date}</small>
                </div>
                <p>${escapeHtml(msg.text)}</p>
                <button class="btn-delete" onclick="deleteMessage(${msg.id})" title="Delete Message">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    function saveMessage(name, text) {
        const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const newMessage = {
            id: Date.now(),
            name: name,
            text: text,
            date: new Date().toLocaleDateString()
        };

        messages.unshift(newMessage); // Add to top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        loadGuestbook();
    }

    // Expose delete function globally so onclick works (cleaner way would be event delegation)
    window.deleteMessage = function (id) {
        if (confirm('Are you sure you want to delete this message?')) {
            const messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const updatedMessages = messages.filter(msg => msg.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
            loadGuestbook();
        }
    };

    if (guestbookForm) {
        guestbookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('gb-name');
            const messageInput = document.getElementById('gb-message');

            if (nameInput.value.trim() && messageInput.value.trim()) {
                saveMessage(nameInput.value, messageInput.value);

                // Reset form
                nameInput.value = '';
                messageInput.value = '';

                // Visual feedback
                const btn = guestbookForm.querySelector('button');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Posted!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 1500);
            }
        });

        // Initial load
        loadGuestbook();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
