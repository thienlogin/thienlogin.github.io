/* ============================================================
   HN Quốc Tế — main.js
   Premium interactions: scroll reveals, sticky nav,
   counter animation, 3D floating carousel, mobile menu
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
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => {
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
                const duration = 2000;
                const startTime = performance.now();

                const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = easeOutQuart(progress);

                    const current = Math.floor(easedProgress * target);

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

    // ─── 8. Interactive Curved Fan Carousel ───
    const diagCarousel = document.querySelector('.hero-diagonal-carousel');
    const diagTrack = document.querySelector('.diagonal-track');
    const diagCards = document.querySelectorAll('.diagonal-card');

    if (diagCarousel && diagTrack && diagCards.length) {
        let currentScroll = 0;
        let isDragging = false;
        let startY = 0;
        let lastScrollY = 0;
        let autoScrollSpeed = 0.3; // Reduced speed for an elegant slow scroll
        let maxScroll = 0;

        function calculateDimensions() {
            // Calculate half of the track height for seamless 6-card loop
            const cardHeight = diagCards[0].offsetHeight;
            const style = window.getComputedStyle(diagCards[0]);
            const marginBottom = parseFloat(style.marginBottom) || 0;
            // 6 original cards + their margins = exact half of the 12-card loop
            maxScroll = (cardHeight + marginBottom) * 6;
        }

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);

        // --- Drag Events ---
        diagCarousel.style.cursor = 'grab';

        function onDragStart(e) {
            isDragging = true;
            diagCarousel.style.cursor = 'grabbing';
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            lastScrollY = currentScroll;
            // Prevent default to stop text selection while dragging
            if (e.cancelable) e.preventDefault();
        }

        function onDragMove(e) {
            if (!isDragging) return;
            const y = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const deltaY = y - startY;
            // Dragging down moves track up (decreases scroll position)
            currentScroll = lastScrollY - (deltaY * 1.5); // Multiply by 1.5 for slightly faster drag response
        }

        function onDragEnd() {
            isDragging = false;
            diagCarousel.style.cursor = 'grab';
        }

        // Mouse listeners
        diagCarousel.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);

        // Touch listeners (passive: false is needed to prevent scroll with e.preventDefault())
        diagCarousel.addEventListener('touchstart', onDragStart, { passive: false });
        diagCarousel.addEventListener('touchmove', onDragMove, { passive: false });
        diagCarousel.addEventListener('touchend', onDragEnd);

        // --- Animation Loop ---
        function updateCarousel() {
            if (!isDragging) {
                // Auto scroll so cards flow from top to bottom
                currentScroll -= autoScrollSpeed;
            }

            // Seamless infinite loop math
            if (currentScroll >= maxScroll) currentScroll -= maxScroll;
            if (currentScroll < 0) currentScroll += maxScroll;

            // Apply translation to the track
            diagTrack.style.transform = `translateY(-${currentScroll}px)`;

            // Calculate card curves based on position
            const rect = diagCarousel.getBoundingClientRect();
            const containerTop = rect.top;
            const containerHeight = rect.height;
            const centerY = containerTop + containerHeight / 2;

            diagCards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenterY = cardRect.top + cardRect.height / 2;

                const distFromCenter = (cardCenterY - centerY) / (containerHeight / 2);
                const clamped = Math.max(-1, Math.min(1, distFromCenter));

                let scale;
                if (clamped <= 0) {
                    scale = 0.3 + (1 - Math.abs(clamped)) * 0.7;
                } else {
                    scale = 1.0 - clamped * 0.5;
                }

                // Smooth parabolic C-Curve (responsive amplitude)
                const curveFactor = 1 - Math.pow(Math.abs(clamped), 1.5);
                const curveAmplitude = window.innerWidth * -0.08; // 8vw equivalent
                const tx = curveFactor * curveAmplitude;

                card.style.transform = `translateX(${tx.toFixed(1)}px) scale(${scale.toFixed(3)})`;
            });

            requestAnimationFrame(updateCarousel);
        }

        requestAnimationFrame(updateCarousel);
    }

});
