/**
 * Vitalis Empreendimentos - Modern Website JavaScript
 * Advanced interactions, animations and user experience
 */

'use strict';

// ============================
// CONFIGURATION & CONSTANTS
// ============================

const CONFIG = {
    // Animation settings
    SCROLL_THRESHOLD: 100,
    COUNTER_DURATION: 2000,
    LOADING_DURATION: 3000,
    PARTICLE_COUNT: 50,
    
    // Performance settings
    THROTTLE_DELAY: 16,
    DEBOUNCE_DELAY: 300,
    
    // Theme settings
    THEME_STORAGE_KEY: 'vitalis-theme',
    DEFAULT_THEME: 'light',
    
    CALCULATOR_ENDPOINT: '/api/calculate-roi'
};

const SELECTORS = {
    // Navigation
    navbar: '#navbar',
    navToggle: '#nav-toggle',
    navMenu: '#nav-menu',
    navLinks: '.nav-link',
    themeToggle: '#theme-toggle',
    mobileThemeToggle: '#mobile-theme-toggle',
    
    // Loading
    loadingScreen: '#loading',
    
    // Hero section
    heroStats: '.stat-number',
    particles: '#particles',
    
    // Projects
    projectFilters: '.filter-btn',
    projectsGrid: '#projects-grid',
    projectCards: '.project-card',
    
    // FAQ
    faqQuestions: '.faq-question',
    faqItems: '.faq-item',
    
    // Contact form
    contactForm: '#contact-form',

    // Investment calculator
    investmentAmount: '#investment-amount',
    investmentPeriod: '#investment-period',
    rangeValue: '.range-value',
    estimatedValue: '#estimated-value',
    totalReturn: '#total-return',
    annualRoi: '#annual-roi'
};

// ============================
// UTILITY FUNCTIONS
// ============================

/**
 * Utility functions for common operations
 */
const Utils = {
    /**
     * Throttle function execution
     */
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    },

    /**
     * Debounce function execution
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold
        );
    },

    /**
     * Smooth scroll to element
     */
    scrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Format currency
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    /**
     * Format percentage
     */
    formatPercentage(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value / 100);
    },

    /**
     * Generate random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Easing function for smooth animations
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    },

    /**
     * Get CSS custom property value
     */
    getCSSVariable(property) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(property)
            .trim();
    }
};

// ============================
// THEME MANAGEMENT
// ============================

class ThemeManager {
    constructor() {
        this.themeToggle = document.querySelector(SELECTORS.themeToggle);
        this.mobileThemeToggle = document.querySelector(SELECTORS.mobileThemeToggle);
        this.currentTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY) || CONFIG.DEFAULT_THEME;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    bindEvents() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        if (this.mobileThemeToggle) {
            this.mobileThemeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(CONFIG.THEME_STORAGE_KEY)) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem(CONFIG.THEME_STORAGE_KEY, this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Update mobile toggle accessibility attributes
        if (this.mobileThemeToggle) {
            const isDark = theme === 'dark';
            this.mobileThemeToggle.setAttribute('aria-checked', isDark);
            
            // Update toggle text
            const toggleText = this.mobileThemeToggle.querySelector('.theme-toggle-text');
            if (toggleText) {
                toggleText.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
            }
        }
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChange', { 
            detail: { theme } 
        }));
    }

    getTheme() {
        return this.currentTheme;
    }
}

// ============================
// LOADING SCREEN
// ============================

class LoadingScreen {
    constructor() {
        this.loadingElement = document.querySelector(SELECTORS.loadingScreen);
        this.progressBar = this.loadingElement?.querySelector('.progress-bar');
        this.init();
    }

    init() {
        if (!this.loadingElement) return;

        // Simulate loading progress
        this.simulateProgress();
        
        // Hide loading screen after assets are loaded
        window.addEventListener('load', () => {
            setTimeout(() => this.hide(), 500);
        });
    }

    simulateProgress() {
        if (!this.progressBar) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Utils.random(1, 5);
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            this.progressBar.style.width = `${progress}%`;
        }, 50);
    }

    hide() {
        if (!this.loadingElement) return;

        this.loadingElement.classList.add('hidden');
        document.body.classList.remove('loading');
        
        // Remove from DOM after animation
        setTimeout(() => {
            this.loadingElement.remove();
        }, 500);
    }
}

// ============================
// NAVIGATION
// ============================

class Navigation {
    constructor() {
        this.navbar = document.querySelector(SELECTORS.navbar);
        this.navToggle = document.querySelector(SELECTORS.navToggle);
        this.navMenu = document.querySelector(SELECTORS.navMenu);
        this.navLinks = document.querySelectorAll(SELECTORS.navLinks);
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateActiveLink();
    }

    bindEvents() {
        // Toggle mobile menu
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    Utils.scrollTo(targetElement, 80);
                    this.closeMenu();
                }
            });
        });

        // Handle scroll for navbar style and active link
        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
            this.updateActiveLink();
        }, CONFIG.THROTTLE_DELAY));

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.isMenuOpen) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }

    openMenu() {
        this.navMenu.classList.add('active');
        this.navToggle.classList.add('active');
        this.navbar.classList.add('menu-open');
        this.navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        this.navbar.classList.remove('menu-open');
        this.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        this.isMenuOpen = false;
    }

    handleScroll() {
        if (!this.navbar) return;

        if (window.scrollY > CONFIG.SCROLL_THRESHOLD) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (correspondingLink) {
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
    }
}

// ============================
// PARTICLE SYSTEM
// ============================

class ParticleSystem {
    constructor() {
        this.container = document.querySelector(SELECTORS.particles);
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        if (!this.container) return;

        this.createParticles();
        this.animate();
        
        // Handle visibility change to pause/resume animation
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    createParticles() {
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const particle = this.createParticle();
            this.particles.push(particle);
            this.container.appendChild(particle.element);
        }
    }

    createParticle() {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.width = '2px';
        element.style.height = '2px';
        element.style.background = Utils.getCSSVariable('--color-primary');
        element.style.borderRadius = '50%';
        element.style.opacity = Utils.random(0.1, 0.3);
        element.style.pointerEvents = 'none';

        const particle = {
            element,
            x: Utils.random(0, this.container.offsetWidth),
            y: Utils.random(0, this.container.offsetHeight),
            vx: Utils.random(-0.5, 0.5),
            vy: Utils.random(-0.5, 0.5),
            size: Utils.random(1, 3)
        };

        element.style.left = particle.x + 'px';
        element.style.top = particle.y + 'px';
        element.style.width = particle.size + 'px';
        element.style.height = particle.size + 'px';

        return particle;
    }

    animate() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.container.offsetWidth;
            if (particle.x > this.container.offsetWidth) particle.x = 0;
            if (particle.y < 0) particle.y = this.container.offsetHeight;
            if (particle.y > this.container.offsetHeight) particle.y = 0;

            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        if (!this.animationId) {
            this.animate();
        }
    }
}

// ============================
// COUNTER ANIMATION
// ============================

class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll(SELECTORS.heroStats);
        this.hasAnimated = false;
        this.init();
    }

    init() {
        if (this.counters.length === 0) return;

        // Use intersection observer for better performance
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateCounters();
                        this.hasAnimated = true;
                    }
                });
            },
            { threshold: 0.5 }
        );

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounters() {
        this.counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = CONFIG.COUNTER_DURATION;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const current = Math.floor(Utils.easeOutCubic(progress) * target);
                counter.textContent = current.toLocaleString('pt-BR');
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = target.toLocaleString('pt-BR');
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
}

// ============================
// PROJECT FILTERING
// ============================

class ProjectFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll(SELECTORS.projectFilters);
        this.projectCards = document.querySelectorAll(SELECTORS.projectCards);
        this.projectsGrid = document.querySelector(SELECTORS.projectsGrid);
        this.init();
    }

    init() {
        if (this.filterButtons.length === 0) return;

        this.bindEvents();
        this.generateAdditionalProjects();
    }

    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterProjects(filter);
                this.updateActiveButton(button);
            });
        });

        const viewAllTrigger = document.querySelector('[data-filter-all-trigger]');
        if (viewAllTrigger) {
            viewAllTrigger.addEventListener('click', () => {
                const allButton = Array.from(this.filterButtons).find(button => button.getAttribute('data-filter') === 'all');
                if (allButton) {
                    this.filterProjects('all');
                    this.updateActiveButton(allButton);
                }
            });
        }
    }

    filterProjects(filter) {
        this.projectCards.forEach(card => {
            const status = card.getAttribute('data-status');
            const shouldShow = filter === 'all' || status === filter;

            if (shouldShow) {
                card.style.display = 'block';
                card.classList.add('animate-in');
            } else {
                card.style.display = 'none';
                card.classList.remove('animate-in');
            }
        });
    }

    updateActiveButton(activeButton) {
        this.filterButtons.forEach(button => button.classList.remove('active'));
        activeButton.classList.add('active');
    }

    generateAdditionalProjects() {
        if (!this.projectsGrid) return;

        const additionalProjects = [
            {
                title: 'Residencial Prime',
                description: 'Apartamentos de alto padrão com vista panorâmica da cidade',
                category: 'luxury residential',
                status: 'in-progress',
                image: './assets/img/obra2.avif',
                specs: ['3-4 quartos', '2-3 banheiros', '120-180m²']
            },
            {
                title: 'Edifício Corporate',
                description: 'Complexo comercial moderno no centro financeiro',
                category: 'commercial',
                status: 'launch',
                image: './assets/img/obra3.avif',
                specs: ['Escritórios', 'Salas comerciais', '50-200m²']
            },
            {
                title: 'Condomínio Garden',
                description: 'Casas em condomínio fechado com área verde',
                category: 'residential',
                status: 'delivered',
                image: './assets/img/obra4.avif',
                specs: ['3-4 quartos', '2-3 banheiros', '150-200m²']
            },
            {
                title: 'Tower Excellence',
                description: 'Arranha-céu residencial de luxo com heliponto',
                category: 'luxury residential',
                status: 'in-progress',
                image: './assets/img/obra5.avif',
                specs: ['4-5 quartos', '3-4 banheiros', '200-300m²']
            },
            {
                title: 'Shopping Vitalis Plaza',
                description: 'Centro comercial com lojas e entretenimento',
                category: 'commercial',
                status: 'launch',
                image: './assets/img/obra6.avif',
                specs: ['Lojas', 'Restaurantes', 'Cinema']
            }
        ];

        additionalProjects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            this.projectsGrid.appendChild(projectCard);
        });

        // Update project cards list
        this.projectCards = document.querySelectorAll(SELECTORS.projectCards);
    }

    createProjectCard(project) {
        const statusClass = project.status === 'delivered' ? 'delivered' : 
                          project.status === 'in-progress' ? 'in-progress' : 'launch';
        const statusText = project.status === 'delivered' ? 'Entregue' : 
                          project.status === 'in-progress' ? 'Em Andamento' : 'Lançamento';

        const card = document.createElement('article');
        card.className = 'project-card';
        card.setAttribute('data-category', project.category);
        card.setAttribute('data-status', project.status);
        card.setAttribute('data-aos', 'fade-up');

        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}" loading="lazy">
                <img src="${project.image}" alt="${project.title} - foto 2" hidden>
                <img src="${project.image}" alt="${project.title} - foto 3" hidden>
                <img src="${project.image}" alt="${project.title} - foto 4" hidden>
                <img src="${project.image}" alt="${project.title} - foto 5" hidden>
                <img src="${project.image}" alt="${project.title} - foto 6" hidden>
                <img src="${project.image}" alt="${project.title} - foto 7" hidden>
                <img src="${project.image}" alt="${project.title} - foto 8" hidden>
                <div class="project-overlay">
                    <div class="project-badges">
                        <span class="badge badge-status ${statusClass}">${statusText}</span>
                        <span class="badge badge-category">${project.category.includes('luxury') ? 'Luxo' : project.category.includes('commercial') ? 'Comercial' : 'Residencial'}</span>
                    </div>
                    <div class="project-actions">
                        <button type="button" class="btn-icon" title="Ver Detalhes" data-modal-trigger>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-specs">
                    ${project.specs.map(spec => `
                        <div class="spec-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                            <span>${spec}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="project-cta">
                    <button type="button" class="btn btn-outline" data-modal-trigger>Saiba Mais</button>
                    <button type="button" class="btn btn-outline" data-location-trigger data-location-address="Endereço a definir" data-location-url="https://www.google.com/maps/place/Vitalis+Empreendimentos/data=!4m2!3m1!1s0x0:0x9548fff714355653?sa=X&amp;ved=1t:2428&amp;ictx=111">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10C21 17 12 23 12 23S3 17 3 10A9 9 0 0 1 12 1A9 9 0 0 1 21 10Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Mapa
                    </button>
                    <a href="https://wa.me/5511998925853?text=Gostaria de saber mais sobre o ${project.title}" class="btn btn-whatsapp" target="_blank" aria-label="Contato via WhatsApp" title="WhatsApp">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.863 3.488"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;

        return card;
    }
}

// ============================
// PROJECT DETAILS MODAL
// ============================

class ProjectModal {
    constructor() {
        this.modal = document.getElementById('project-modal');
        this.lightbox = document.getElementById('image-lightbox');
        this.init();
    }

    init() {
        if (!this.modal || !this.lightbox) return;

        this.gallery = document.getElementById('modal-gallery');
        this.galleryImage = document.getElementById('modal-gallery-image');
        this.galleryCounter = document.getElementById('modal-gallery-counter');
        this.galleryThumbs = document.getElementById('modal-gallery-thumbs');
        this.badges = this.modal.querySelector('#modal-badges');
        this.title = this.modal.querySelector('#modal-project-title');
        this.description = this.modal.querySelector('#modal-description');
        this.specs = this.modal.querySelector('#modal-specs');
        this.lightboxImage = document.getElementById('lightbox-image');

        this.images = [];
        this.currentIndex = 0;
        this.lastFocused = null;

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal-trigger]');
            if (trigger) {
                const card = trigger.closest('.project-card');
                if (card) this.open(card);
                return;
            }

            if (e.target.closest('[data-modal-close]')) {
                this.close();
                return;
            }

            if (e.target.closest('[data-gallery-prev]')) {
                this.showImage(this.currentIndex - 1);
                return;
            }

            if (e.target.closest('[data-gallery-next]')) {
                this.showImage(this.currentIndex + 1);
                return;
            }

            const thumb = e.target.closest('[data-gallery-thumb]');
            if (thumb) {
                this.showImage(Number(thumb.dataset.galleryThumb));
                return;
            }

            if (e.target.closest('[data-gallery-zoom]')) {
                this.openLightbox();
                return;
            }

            if (e.target.closest('[data-lightbox-close]')) {
                this.closeLightbox();
                return;
            }

            if (e.target.closest('[data-lightbox-prev]')) {
                this.showImage(this.currentIndex - 1);
                this.updateLightboxImage();
                return;
            }

            if (e.target.closest('[data-lightbox-next]')) {
                this.showImage(this.currentIndex + 1);
                this.updateLightboxImage();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.lightbox.classList.contains('active')) {
                    this.closeLightbox();
                } else if (this.modal.classList.contains('active')) {
                    this.close();
                }
                return;
            }

            if (!this.modal.classList.contains('active') || this.images.length <= 1) return;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.showImage(this.currentIndex + (e.key === 'ArrowRight' ? 1 : -1));
                if (this.lightbox.classList.contains('active')) this.updateLightboxImage();
            }
        });
    }

    open(card) {
        this.images = Array.from(card.querySelectorAll('.project-image img')).map(img => ({
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || ''
        }));

        const specs = Array.from(card.querySelectorAll('.spec-item'));
        const statusBadge = card.querySelector('.badge-status');
        const categoryBadge = card.querySelector('.badge-category');

        this.gallery.classList.toggle('single-image', this.images.length <= 1);

        this.galleryThumbs.innerHTML = this.images
            .map((img, i) => `<img src="${img.src}" alt="${img.alt}" data-gallery-thumb="${i}">`)
            .join('');

        this.badges.innerHTML = [statusBadge, categoryBadge]
            .filter(Boolean)
            .map(badge => `<span class="${badge.className}">${badge.textContent}</span>`)
            .join('');

        this.title.textContent = card.querySelector('.project-title')?.textContent || '';
        this.description.textContent = card.querySelector('.project-description')?.textContent || '';
        this.specs.innerHTML = specs.map(spec => spec.outerHTML).join('');

        this.showImage(0);

        this.lastFocused = document.activeElement;
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        this.modal.querySelector('.project-modal-close')?.focus();
    }

    showImage(index) {
        if (!this.images.length) return;
        this.currentIndex = (index + this.images.length) % this.images.length;
        const image = this.images[this.currentIndex];

        this.galleryImage.src = image.src;
        this.galleryImage.alt = image.alt;
        this.galleryCounter.textContent = `${this.currentIndex + 1}/${this.images.length}`;

        this.galleryThumbs.querySelectorAll('img').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === this.currentIndex);
        });
    }

    openLightbox() {
        this.lightbox.classList.toggle('single-image', this.images.length <= 1);
        this.updateLightboxImage();
        this.lightbox.classList.add('active');
        this.lightbox.setAttribute('aria-hidden', 'false');
    }

    updateLightboxImage() {
        const image = this.images[this.currentIndex];
        if (!image) return;
        this.lightboxImage.src = image.src;
        this.lightboxImage.alt = image.alt;
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        this.lightbox.setAttribute('aria-hidden', 'true');
    }

    close() {
        this.closeLightbox();
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.lastFocused?.focus();
    }
}

// ============================
// PROJECT LOCATION MODAL
// ============================

// Google blocks regular "maps/place" URLs from being loaded inside an iframe,
// so the frame uses the free "output=embed" search format while the visible
// "Abrir no Google Maps" button links straight to the real place URL.
const LOCATION_MAP_EMBED_SRC = 'https://www.google.com/maps?q=Vitalis+Empreendimentos%2C+Rua+Serra+de+Botucatu%2C+878%2C+S%C3%A3o+Paulo+-+SP&output=embed';

class LocationModal {
    constructor() {
        this.modal = document.getElementById('location-modal');
        this.init();
    }

    init() {
        if (!this.modal) return;

        this.title = this.modal.querySelector('#location-modal-title');
        this.address = this.modal.querySelector('#location-modal-address');
        this.link = this.modal.querySelector('#location-modal-link');
        this.iframe = this.modal.querySelector('#location-modal-iframe');
        this.lastFocused = null;

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-location-trigger]');
            if (trigger) {
                const card = trigger.closest('.project-card');
                if (card) this.open(trigger, card);
                return;
            }

            if (e.target.closest('[data-location-close]')) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(trigger, card) {
        this.title.textContent = card.querySelector('.project-title')?.textContent || '';
        this.address.textContent = trigger.dataset.locationAddress || 'Endereço a definir';
        this.link.href = trigger.dataset.locationUrl || '#';
        this.iframe.src = trigger.dataset.locationMap || LOCATION_MAP_EMBED_SRC;

        this.lastFocused = document.activeElement;
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        this.modal.querySelector('.project-modal-close')?.focus();
    }

    close() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.iframe.src = '';
        this.lastFocused?.focus();
    }
}

// ============================
// PRIVACY POLICY MODAL
// ============================

class PrivacyModal {
    constructor() {
        this.modal = document.getElementById('privacy-modal');
        this.init();
    }

    init() {
        if (!this.modal) return;
        this.lastFocused = null;
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-privacy-trigger]')) {
                e.preventDefault();
                this.open();
                return;
            }

            if (e.target.closest('[data-privacy-close]')) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open() {
        this.lastFocused = document.activeElement;
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        this.modal.querySelector('.project-modal-close')?.focus();
    }

    close() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.lastFocused?.focus();
    }
}

// ============================
// FAQ FUNCTIONALITY
// ============================

class FAQ {
    constructor() {
        this.faqQuestions = document.querySelectorAll(SELECTORS.faqQuestions);
        this.faqItems = document.querySelectorAll(SELECTORS.faqItems);
        this.init();
    }

    init() {
        if (this.faqQuestions.length === 0) return;
        this.bindEvents();
    }

    bindEvents() {
        this.faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                this.toggleFAQ(faqItem);
            });
        });
    }

    toggleFAQ(targetItem) {
        const isOpen = targetItem.classList.contains('open');
        
        // Close all other FAQs
        this.faqItems.forEach(item => {
            if (item !== targetItem) {
                item.classList.remove('open');
                const question = item.querySelector('.faq-question');
                if (question) {
                    question.setAttribute('aria-expanded', 'false');
                }
            }
        });
        
        // Toggle target FAQ
        if (isOpen) {
            targetItem.classList.remove('open');
            targetItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        } else {
            targetItem.classList.add('open');
            targetItem.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
        }
    }
}

// ============================
// INVESTMENT CALCULATOR
// ============================

class InvestmentCalculator {
    constructor() {
        this.amountInput = document.querySelector(SELECTORS.investmentAmount);
        this.periodSlider = document.querySelector(SELECTORS.investmentPeriod);
        this.rangeValue = document.querySelector(SELECTORS.rangeValue);
        this.estimatedValueEl = document.querySelector(SELECTORS.estimatedValue);
        this.totalReturnEl = document.querySelector(SELECTORS.totalReturn);
        this.annualRoiEl = document.querySelector(SELECTORS.annualRoi);
        
        this.baseRoi = 0.19; // 19% annual ROI
        this.init();
    }

    init() {
        if (!this.amountInput || !this.periodSlider) return;
        
        this.bindEvents();
        this.calculate();
    }

    bindEvents() {
        // Format currency input
        this.amountInput.addEventListener('input', Utils.debounce(() => {
            this.formatCurrencyInput();
            this.calculate();
        }, CONFIG.DEBOUNCE_DELAY));

        // Handle period slider
        this.periodSlider.addEventListener('input', () => {
            this.updateRangeValue();
            this.calculate();
        });

        // Initial range value update
        this.updateRangeValue();
    }

    formatCurrencyInput() {
        let value = this.amountInput.value.replace(/\D/g, '');
        if (value) {
            value = parseInt(value);
            this.amountInput.value = Utils.formatCurrency(value);
        }
    }

    updateRangeValue() {
        if (this.rangeValue) {
            const years = this.periodSlider.value;
            this.rangeValue.textContent = `${years} ano${years > 1 ? 's' : ''}`;
        }
    }

    calculate() {
        const amountText = this.amountInput.value.replace(/\D/g, '');
        const amount = parseInt(amountText) || 500000;
        const years = parseInt(this.periodSlider.value) || 5;
        
        // Calculate compound interest
        const finalValue = amount * Math.pow(1 + this.baseRoi, years);
        const totalReturn = finalValue - amount;
        const totalReturnPercentage = (totalReturn / amount) * 100;
        const annualRoi = this.baseRoi * 100;
        
        // Update display
        if (this.estimatedValueEl) {
            this.estimatedValueEl.textContent = Utils.formatCurrency(finalValue);
        }
        
        if (this.totalReturnEl) {
            this.totalReturnEl.textContent = `+${Utils.formatPercentage(totalReturnPercentage)}`;
        }
        
        if (this.annualRoiEl) {
            this.annualRoiEl.textContent = `${annualRoi.toFixed(2)}%`;
        }
    }
}

// ============================
// CONTACT FORM
// ============================

class ContactForm {
    constructor() {
        this.form = document.querySelector(SELECTORS.contactForm);
        this.init();
    }

    init() {
        if (!this.form) return;
        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Phone number formatting
        const phoneInput = this.form.querySelector('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', () => this.formatPhoneNumber(phoneInput));
        }
    }

    handleSubmit(e) {
        if (!this.validateForm()) {
            e.preventDefault();
            return;
        }

        // Hold the native submission briefly so the sending animation is
        // actually visible before the browser navigates to FormSubmit.
        // A real (non-fetch) POST still avoids CORS/file:// issues.
        e.preventDefault();

        const submitButton = this.form.querySelector('button[type="submit"]');
        submitButton.classList.add('is-sending');
        submitButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2L12 6"></path>
                <path d="M12 18L12 22"></path>
                <path d="M4.93 4.93L7.76 7.76"></path>
                <path d="M16.24 16.24L19.07 19.07"></path>
                <path d="M2 12L6 12"></path>
                <path d="M18 12L22 12"></path>
                <path d="M4.93 19.07L7.76 16.24"></path>
                <path d="M16.24 7.76L19.07 4.93"></path>
            </svg>
            <span>Enviando...</span>
        `;
        submitButton.disabled = true;

        setTimeout(() => this.form.submit(), 700);
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const isCheckbox = field.type === 'checkbox';
        const value = isCheckbox ? '' : field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (isCheckbox) {
            if (field.hasAttribute('required') && !field.checked) {
                isValid = false;
                errorMessage = 'É necessário aceitar para continuar';
            }
        } else if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        }

        // Email validation
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Digite um email válido';
            }
        }

        // Phone validation
        if (field.name === 'phone' && value) {
            const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Digite um telefone válido';
            }
        }

        this.toggleFieldError(field, !isValid, errorMessage);
        return isValid;
    }

    toggleFieldError(field, hasError, message = '') {
        const fieldGroup = field.closest('.form-group');
        const visualTarget = field.type === 'checkbox' ? fieldGroup.querySelector('.checkmark') : field;
        let errorElement = fieldGroup.querySelector('.field-error');

        if (hasError) {
            if (visualTarget) visualTarget.style.borderColor = 'var(--color-accent)';

            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'field-error';
                errorElement.style.color = 'var(--color-accent)';
                errorElement.style.fontSize = 'var(--font-size-sm)';
                errorElement.style.marginTop = 'var(--space-1)';
                errorElement.style.display = 'block';
                fieldGroup.appendChild(errorElement);
            }

            errorElement.textContent = message;
        } else {
            if (visualTarget) visualTarget.style.borderColor = '';
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    clearFieldError(field) {
        const fieldGroup = field.closest('.form-group');
        const visualTarget = field.type === 'checkbox' ? fieldGroup.querySelector('.checkmark') : field;
        if (visualTarget) visualTarget.style.borderColor = '';
        const errorElement = fieldGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 6) {
                value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
            } else if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        
        input.value = value;
    }
}

// ============================
// AOS (ANIMATE ON SCROLL) INITIALIZATION
// ============================

class AnimationController {
    constructor() {
        this.init();
    }

    init() {
        // Initialize AOS if available
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 600,
                easing: 'ease-out-cubic',
                once: true,
                offset: 100,
                delay: 0
            });
        }

        // Custom scroll animations for elements without AOS
        this.initCustomScrollAnimations();
    }

    initCustomScrollAnimations() {
        const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
        
        if (animatedElements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        animatedElements.forEach(element => observer.observe(element));
    }
}

// ============================
// PERFORMANCE OPTIMIZATIONS
// ============================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
        this.optimizeScrollPerformance();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.src || img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.src || img.dataset.src;
            });
        }
    }

    preloadCriticalResources() {
        // Preload critical images
        const criticalImages = [
            './assets/img/obra1.avif',
            './assets/img/obra2.avif'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    optimizeScrollPerformance() {
        // Add will-change property to scrolling elements
        const scrollElements = document.querySelectorAll('.hero, .navbar');
        scrollElements.forEach(element => {
            element.style.willChange = 'transform';
        });

        // Remove will-change after scroll ends
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                scrollElements.forEach(element => {
                    element.style.willChange = 'auto';
                });
            }, 150);
        });
    }
}

// ============================
// APPLICATION INITIALIZATION
// ============================

class App {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components.themeManager = new ThemeManager();
            this.components.loadingScreen = new LoadingScreen();
            this.components.navigation = new Navigation();
            this.components.particleSystem = new ParticleSystem();
            this.components.counterAnimation = new CounterAnimation();
            this.components.projectFilter = new ProjectFilter();
            this.components.projectModal = new ProjectModal();
            this.components.locationModal = new LocationModal();
            this.components.privacyModal = new PrivacyModal();
            this.components.faq = new FAQ();
            this.components.investmentCalculator = new InvestmentCalculator();
            this.components.contactForm = new ContactForm();
            this.components.animationController = new AnimationController();
            this.components.performanceOptimizer = new PerformanceOptimizer();

            // Global event listeners
            this.bindGlobalEvents();

            console.log('🚀 Vitalis Empreendimentos - Website initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }

    bindGlobalEvents() {
        // Handle theme changes
        window.addEventListener('themeChange', (e) => {
            console.log(`Theme changed to: ${e.detail.theme}`);
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            console.log('Connection restored');
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost');
        });

        // Handle errors
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    // Public API for external access
    getComponent(name) {
        return this.components[name];
    }

    getAllComponents() {
        return this.components;
    }
}

// Initialize the application
const vitalisWebsite = new App();

// Export for external access
window.Vitalis = {
    app: vitalisWebsite,
    utils: Utils,
    config: CONFIG
};

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .fade-in-up {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-up.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    .fade-in-left {
        opacity: 0;
        transform: translateX(-30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-left.animated {
        opacity: 1;
        transform: translateX(0);
    }
    
    .fade-in-right {
        opacity: 0;
        transform: translateX(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-right.animated {
        opacity: 1;
        transform: translateX(0);
    }
    
    .animate-in {
        animation: fadeInScale 0.6s ease;
    }
    
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);
