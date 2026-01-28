/* ===================================================
   Bizarre Co - Main JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Mobile Navigation ----------
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        // Close mobile menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });

        // Mobile dropdown toggle
        document.querySelectorAll('.dropdown > a').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    trigger.parentElement.classList.toggle('active');
                }
            });
        });
    }

    // ---------- Sticky Header ----------
    const header = document.getElementById('header');
    if (header) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ---------- Back to Top ----------
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------- Stat Counter Animation ----------
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    const animateCounters = () => {
        statNumbers.forEach(el => {
            const target = parseInt(el.dataset.count);
            const duration = 2000;
            const start = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                const current = Math.round(eased * target);

                el.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    // Use Intersection Observer to trigger counter when visible
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        const statsContainer = statNumbers[0].closest('.hero-stats');
        if (statsContainer) {
            observer.observe(statsContainer);
        }
    }

    // ---------- Product Tab Filtering ----------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const productCards = document.querySelectorAll('.product-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.tab;

            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category.includes(filter)) {
                    card.style.display = '';
                    card.style.animation = 'fadeInUp 0.4s ease-out forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ---------- Add to Cart (Demo) ----------
    const cartCount = document.querySelector('.cart-count');
    let cartItems = 0;

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            cartItems++;
            if (cartCount) {
                cartCount.textContent = cartItems;
                cartCount.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    cartCount.style.transform = 'scale(1)';
                }, 200);
            }

            // Button feedback
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-shopping-bag');
                icon.classList.add('fa-check');
                btn.style.background = '#10B981';
                btn.style.color = '#fff';
                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-shopping-bag');
                    btn.style.background = '';
                    btn.style.color = '';
                }, 1500);
            }
        });
    });

    // ---------- Newsletter Form ----------
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            const btn = newsletterForm.querySelector('button');

            if (input && input.value) {
                btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
                btn.style.background = '#10B981';
                btn.style.color = '#fff';
                input.value = '';

                setTimeout(() => {
                    btn.innerHTML = 'Subscribe <i class="fas fa-paper-plane"></i>';
                    btn.style.background = '';
                    btn.style.color = '';
                }, 3000);
            }
        });
    }

    // ---------- Contact Form ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                btn.style.background = '#10B981';

                setTimeout(() => {
                    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                    btn.style.background = '';
                    contactForm.reset();
                }, 3000);
            }
        });
    }

    // ---------- Scroll Animations ----------
    const animateElements = document.querySelectorAll(
        '.category-card, .product-card, .pet-card, .testimonial-card, .value-card, .contact-info-card'
    );

    if (animateElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animateElements.forEach(el => {
            el.style.opacity = '0';
            scrollObserver.observe(el);
        });
    }

    // ---------- Hero Particles ----------
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 6 + 2}px;
                height: ${Math.random() * 6 + 2}px;
                background: ${Math.random() > 0.5 ? 'rgba(108, 43, 217, 0.1)' : 'rgba(245, 158, 11, 0.08)'};
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: float ${Math.random() * 6 + 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 4}s;
            `;
            particlesContainer.appendChild(particle);
        }

        // Add float keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); }
                25% { transform: translateY(-20px) translateX(10px); }
                50% { transform: translateY(-10px) translateX(-10px); }
                75% { transform: translateY(-30px) translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }

    // ---------- Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

});
