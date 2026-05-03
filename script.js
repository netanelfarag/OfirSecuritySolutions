document.addEventListener('DOMContentLoaded', () => {
    // --- Hero Section Parallax ---
    const hero = document.getElementById('hero');
    const heroBg = document.querySelector('.hero-background');

    if (hero && heroBg) {
        if (window.matchMedia("(pointer: fine)").matches) {
            hero.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const moveX = (clientX / window.innerWidth - 0.5) * 20;
                const moveY = (clientY / window.innerHeight - 0.5) * 20;
                heroBg.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
            });

            hero.addEventListener('mouseleave', () => {
                heroBg.style.transform = `translate(0px, 0px)`;
            });
        }
    }
    
    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            if(scrollIndicator) scrollIndicator.style.opacity = '0';
        } else {
            navbar.classList.remove('scrolled');
            if(scrollIndicator) scrollIndicator.style.opacity = '0.8';
        }
    });
    
    // --- Mobile Menu Logic ---
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('is-active');
            navMenu.classList.toggle('active');
        });

        navMenu.addEventListener('click', () => {
            menuToggle.classList.remove('is-active');
            navMenu.classList.remove('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('is-active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                
                if (entry.target.classList.contains('about-content')) {
                    const counters = entry.target.querySelectorAll('.counter-value');
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        const duration = 2000;
                        const increment = target / (duration / 16);
                        
                        let current = 0;
                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.innerText = Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.innerText = target;
                            }
                        };
                        updateCounter();
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden, .slide-from-right, .slide-from-left');
    hiddenElements.forEach((el, index) => {
        if(el.classList.contains('service-card')) {
            el.style.transitionDelay = `${(index % 3) * 0.15}s`;
        }
        observer.observe(el);
    });

    // --- Gallery Carousel (Hybrid Auto + Manual Grab) ---
    const galleryContainer = document.querySelector('.carousel-container');
    const galleryTrack = document.getElementById('gallery-track');
    
    if (galleryContainer && galleryTrack) {
        // 1. Infinite Cloning
        const items = Array.from(galleryTrack.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            galleryTrack.appendChild(clone);
        });

        // 2. State Variables
        let isDown = false;
        let startX;
        let scrollLeft;
        let scrollSpeed = 0.8; // Auto-scroll speed
        let currentScroll = 0;
        let trackHalfWidth = galleryTrack.scrollWidth / 2;

        // Update width on resize
        window.addEventListener('resize', () => {
            trackHalfWidth = galleryTrack.scrollWidth / 2;
        });

        // 3. Manual Drag Logic (Mouse + Touch)
        const startDragging = (pageX) => {
            isDown = true;
            galleryContainer.classList.add('grabbing');
            startX = pageX - galleryContainer.offsetLeft;
            scrollLeft = galleryContainer.scrollLeft;
            currentScroll = galleryContainer.scrollLeft;
        };

        const stopDragging = () => {
            if (!isDown) return;
            isDown = false;
            galleryContainer.classList.remove('grabbing');
            currentScroll = galleryContainer.scrollLeft;
        };

        const moveDragging = (pageX) => {
            if (!isDown) return;
            const x = pageX - galleryContainer.offsetLeft;
            const walk = (x - startX) * 2;
            galleryContainer.scrollLeft = scrollLeft - walk;
            currentScroll = galleryContainer.scrollLeft;
        };

        // Mouse Events
        galleryContainer.addEventListener('mousedown', (e) => startDragging(e.pageX));
        galleryContainer.addEventListener('mouseleave', stopDragging);
        galleryContainer.addEventListener('mouseup', stopDragging);
        galleryContainer.addEventListener('mousemove', (e) => {
            if (isDown) {
                e.preventDefault();
                moveDragging(e.pageX);
            }
        });

        // Touch Events
        galleryContainer.addEventListener('touchstart', (e) => startDragging(e.touches[0].pageX), { passive: true });
        galleryContainer.addEventListener('touchend', stopDragging);
        galleryContainer.addEventListener('touchmove', (e) => {
            if (isDown) moveDragging(e.touches[0].pageX);
        }, { passive: true });

        // 3b. Disable Wheel Scroll & Image Drag
        galleryContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
        }, { passive: false });

        galleryTrack.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') e.preventDefault();
        });

        // 4. Smooth Auto-Scroll Loop
        function step() {
            if (!isDown) {
                currentScroll += scrollSpeed;
                
                // Infinite Reset Logic
                if (currentScroll >= trackHalfWidth) {
                    currentScroll = 0;
                }
                
                galleryContainer.scrollLeft = currentScroll;
            }
            requestAnimationFrame(step);
        }

        // Start the loop
        requestAnimationFrame(step);
    }

    // --- Lightbox ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox && lightboxImg && galleryTrack) {
        galleryTrack.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                const img = item.querySelector('img');
                if (img) {
                    lightbox.style.display = 'flex';
                    lightboxImg.src = img.src;
                }
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', () => lightbox.style.display = 'none');
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.style.display = 'none';
        });
    }

    // --- Particles & Cursor Glow ---
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#0ea5e9" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3, "random": false },
                "size": { "value": 2, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#0ea5e9", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 1.2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 150, "line_linked": { "opacity": 0.8 } }, "push": { "particles_nb": 3 } }
            },
            "retina_detect": true
        });
    }

    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });
    }

    // --- Services Tabs ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-tab');
                const isActive = btn.classList.contains('active');
                
                // On mobile, if clicking an already active tab, we just close it
                if (isActive && window.innerWidth <= 992) {
                    btn.classList.remove('active');
                    document.getElementById(targetId).classList.remove('active');
                    return;
                }

                // Deactivate all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));

                // Activate selected
                const panelsToActivate = document.getElementById(targetId);
                const buttonsToActivate = document.querySelectorAll(`.tab-btn[data-tab="${targetId}"]`);
                
                buttonsToActivate.forEach(b => b.classList.add('active'));
                if (panelsToActivate) {
                    panelsToActivate.classList.add('active');
                    
                    // Snap logic
                    setTimeout(() => {
                        const offset = 130; // Account for fixed navbar, snapped lower for more breathing room
                        
                        // On mobile, we snap to the button (title). On desktop, we snap to the panel.
                        const targetElement = (window.innerWidth <= 992) ? btn : panelsToActivate;
                        
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }, 50);
                }
            });
        });
    }

    // --- EmailJS Form Submission ---
    const contactForm = document.getElementById('contactForm');
    const statusMessage = document.getElementById('statusMessage');

    if (contactForm && typeof emailjs !== 'undefined') {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const formData = new FormData(contactForm);

            // Honeypot check
            if (formData.get("honeypot")) {
                console.warn("Spam detected");
                return;
            }

            // Prepare template parameters matching EmailJS template
            const templateParams = {
                from_name: formData.get("fullName"),
                from_email: formData.get("email"),
                phone: formData.get("phone"),
                company: formData.get("company") || "לא צוין",
                message: formData.get("message"),
                to_email: "ofirsecur@outlook.co.il",
            };

            // Disable button and show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalHtml = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="btn-text">שולח...</span> <i class="fas fa-spinner fa-spin"></i>';
            }

            // Send via EmailJS
            emailjs.send("service_bkb3yyq", "template_qjw4wmd", templateParams)
                .then(function() {
                    if (statusMessage) {
                        statusMessage.innerHTML = '<div style="color: #4ade80; margin-top: 15px; padding: 12px; border: 1px solid #4ade80; border-radius: 8px; background: rgba(74, 222, 128, 0.1); font-weight: 500;">הודעתך נשלחה בהצלחה! נחזור אליך בקרוב.</div>';
                    }
                    contactForm.reset();
                }, function(error) {
                    console.error("EmailJS Error:", error);
                    if (statusMessage) {
                        statusMessage.innerHTML = '<div style="color: #f87171; margin-top: 15px; padding: 12px; border: 1px solid #f87171; border-radius: 8px; background: rgba(248, 113, 113, 0.1); font-weight: 500;">שגיאה בשליחת ההודעה. אנא נסה שוב או צור קשר טלפונית.</div>';
                    }
                })
                .finally(function() {
                    // Re-enable button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = submitBtn.dataset.originalHtml;
                    }
                    // Clear status message after 6 seconds
                    setTimeout(() => { 
                        if (statusMessage) statusMessage.innerHTML = ''; 
                    }, 6000);
                });
        });
    } else if (contactForm) {
        console.error("EmailJS SDK not found. Ensure initialization in index.html is correct.");
    }

    // --- Lenis Smooth Scroll ---
    try {
        if (typeof Lenis !== 'undefined') {
            const lenis = new Lenis({
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            });
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href');
                    if (targetId !== "#") {
                        e.preventDefault();
                        lenis.scrollTo(targetId);
                    }
                });
            });
        }
    } catch (e) {
        console.warn('Lenis init failed:', e);
    }
});

// --- Accessibility Menu Logic (Self-Executing) ---
(function() {
    const a11yToggle = document.getElementById('a11y-toggle');
    const a11yMenu = document.getElementById('a11y-menu');
    const a11yClose = document.getElementById('a11y-close');
    
    if (!a11yToggle || !a11yMenu) return;

    function toggleMenu(show) {
        if (show === undefined) show = a11yMenu.classList.contains('hidden-menu');
        if (show) {
            a11yMenu.style.display = 'flex';
            a11yMenu.offsetHeight; 
            a11yMenu.classList.remove('hidden-menu');
        } else {
            a11yMenu.classList.add('hidden-menu');
            setTimeout(() => {
                if (a11yMenu.classList.contains('hidden-menu')) a11yMenu.style.display = 'none';
            }, 300);
        }
    }

    a11yToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    if (a11yClose) a11yClose.addEventListener('click', () => toggleMenu(false));

    document.addEventListener('click', function(e) {
        if (a11yMenu && !a11yMenu.contains(e.target) && e.target !== a11yToggle && !a11yToggle.contains(e.target)) {
            if (!a11yMenu.classList.contains('hidden-menu')) toggleMenu(false);
        }
    });

    if (a11yMenu.classList.contains('hidden-menu')) a11yMenu.style.display = 'none';
    else a11yMenu.style.display = 'flex';

    const btnInc = document.getElementById('a11y-text-inc');
    const btnDec = document.getElementById('a11y-text-dec');
    const btnFont = document.getElementById('a11y-font');
    const btnContrast = document.getElementById('a11y-contrast');
    const btnLinks = document.getElementById('a11y-links');
    const btnAnim = document.getElementById('a11y-anim');
    const btnReset = document.getElementById('a11y-reset');

    let state;
    try {
        state = JSON.parse(localStorage.getItem('a11y_state'));
    } catch (e) {
        console.error("Failed to parse a11y state", e);
    }
    
    if (!state || typeof state !== 'object') {
        state = { textSize: 100, font: false, contrast: false, links: false, anim: false };
    }

    function applyState() {
        document.documentElement.style.fontSize = state.textSize + '%';
        if (btnFont) {
            document.body.classList.toggle('a11y-readable-font', state.font);
            btnFont.classList.toggle('active', state.font);
        }
        if (btnContrast) {
            document.body.classList.toggle('a11y-high-contrast', state.contrast);
            btnContrast.classList.toggle('active', state.contrast);
        }
        if (btnLinks) {
            document.body.classList.toggle('a11y-highlight-links', state.links);
            btnLinks.classList.toggle('active', state.links);
        }
        if (btnAnim) {
            document.body.classList.toggle('a11y-no-animations', state.anim);
            btnAnim.classList.toggle('active', state.anim);
        }
        localStorage.setItem('a11y_state', JSON.stringify(state));
    }

    if (btnInc) btnInc.addEventListener('click', () => { if (state.textSize < 150) state.textSize += 10; applyState(); });
    if (btnDec) btnDec.addEventListener('click', () => { if (state.textSize > 80) state.textSize -= 10; applyState(); });
    if (btnFont) btnFont.addEventListener('click', () => { state.font = !state.font; applyState(); });
    if (btnContrast) btnContrast.addEventListener('click', () => { state.contrast = !state.contrast; applyState(); });
    if (btnLinks) btnLinks.addEventListener('click', () => { state.links = !state.links; applyState(); });
    if (btnAnim) btnAnim.addEventListener('click', () => { state.anim = !state.anim; applyState(); });
    if (btnReset) btnReset.addEventListener('click', () => { state = { textSize: 100, font: false, contrast: false, links: false, anim: false }; applyState(); });

    applyState();
})();
