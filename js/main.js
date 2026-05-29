/* ============================================================
   HN Quốc Tế — main.js
   Taste-Skill inspired interactions: scroll reveals, sticky nav,
   counter animation, marquee pause-on-hover, mobile menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Sticky Header with backdrop blur ───
    const header = document.querySelector('header');
    
    const handleScroll = () => {
        if (window.scrollY > 30) {
            header.style.paddingTop = '0.75rem';
            header.style.paddingBottom = '0.75rem';
        } else {
            header.style.paddingTop = '1.25rem';
            header.style.paddingBottom = '1.25rem';
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ─── 2. Mobile Menu Toggle ───
    const mobileBtn = document.getElementById('mobile-btn');
    const navPills = document.getElementById('nav-pills');

    if (mobileBtn && navPills) {
        mobileBtn.addEventListener('click', () => {
            navPills.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navPills.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });

        // Close on link click
        navPills.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navPills.classList.remove('active');
                mobileBtn.querySelector('i').className = 'fas fa-bars';
            });
        });
    }

    // ─── 3. Scroll Reveal (IntersectionObserver) ───
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => {
        // Don't observe elements that are already active (hero)
        if (!el.classList.contains('active')) {
            revealObserver.observe(el);
        }
    });

    // ─── 4. Counter Animation ───
    const counters = document.querySelectorAll('.stat-number[data-target]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                const duration = 2000; // ms
                const startTime = performance.now();

                const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = easeOutQuart(progress);
                    
                    const current = Math.floor(easedProgress * target);
                    
                    // Format with suffix
                    if (target >= 1000) {
                        counter.textContent = current.toLocaleString() + '+';
                    } else if (target === 98) {
                        counter.textContent = current + '%';
                    } else {
                        counter.textContent = current + '+';
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                };

                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ─── 5. Smooth scroll for anchor links ───
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

    // ─── 6. Active nav pill highlight ───
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-pill[href^="#"]');

    const highlightNav = () => {
        const scrollY = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.style.color = '';
                    link.style.fontWeight = '';
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.style.color = 'var(--text-primary)';
                        link.style.fontWeight = '600';
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

    // ─── 7. Parallax-lite for hero glow ───
    const heroGlow = document.querySelector('.hero-glow');
    
    if (heroGlow) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroGlow.style.transform = `translateY(${scrolled * 0.2}px)`;
            }
        }, { passive: true });
    }

});
