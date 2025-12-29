/**
 * St. Movens School Website - Vanilla JavaScript Logic
 *
 * This script handles all front-end interactivity:
 * 1. Mobile navigation toggle.
 * 2. Accessible modal logic (open/close, ESC key, focus trap).
 * 3. Client-side form validation.
 * 4. News/Event filtering (Upcoming/Past).
 * 5. Smooth scrolling for internal anchors.
 * 6. Color theme switching.
 */

// 14. JS behavior: Wrap in IIFE to avoid global namespace pollution
(function() {
    'use strict';

    // --- DOM Elements ---
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav__link');
    const modal = document.getElementById('enrolment-modal');
    const modalToggles = document.querySelectorAll('[data-modal-target="enrolment-modal"]');
    const modalClosers = document.querySelectorAll('[data-modal-action="close"]');
    const enrolmentForm = document.getElementById('enrolment-form');
    const formSuccessMessage = document.getElementById('form-success-message');
    const newsFilterBtns = document.querySelectorAll('[data-news-filter]');
    const newsCards = document.querySelectorAll('.news-card');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeNameSpan = document.getElementById('current-theme-name');
    const html = document.documentElement;
    
    let lastFocusedElement; // For focus trap

    // --- 14. Mobile Navigation Toggle ---
    const toggleMobileNav = () => {
        const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true' || false;
        
        mainNav.classList.toggle('is-open');
        navToggleBtn.setAttribute('aria-expanded', !isExpanded);
        
        // Accessibility: Hide/show the navigation list from screen readers based on expanded state
        mainNav.setAttribute('aria-hidden', isExpanded); 
    };

    navToggleBtn.addEventListener('click', toggleMobileNav);

    // Close mobile nav when a link is clicked (for smooth scrolling)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('is-open')) {
                toggleMobileNav();
            }
        });
    });


    // --- 14. Open/Close Enrolment Modal (with ESC and Focus Trap) ---
    
    // Function to get all focusable elements within the modal
    const getFocusableElements = (element) => {
        return element.querySelectorAll(
            'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
    };

    const openModal = () => {
        lastFocusedElement = document.activeElement; // Store element that opened the modal
        
        // Show modal and update ARIA attributes
        modal.classList.remove('u-hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Focus trap setup
        const focusableElements = getFocusableElements(modal);
        if (focusableElements.length > 0) {
            focusableElements[0].focus(); // Focus the first focusable element
        }

        modal.addEventListener('keydown', handleFocusTrap);
    };

    const closeModal = () => {
        modal.classList.add('u-hidden');
        document.body.style.overflow = ''; // Restore background scrolling
        
        // Restore focus to the element that triggered the modal
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }

        modal.removeEventListener('keydown', handleFocusTrap);

        // Reset the form and success message display state
        enrolmentForm.reset();
        formSuccessMessage.classList.add('u-hidden');
        enrolmentForm.querySelectorAll('.form-error').forEach(el => el.classList.add('u-hidden'));
        enrolmentForm.querySelectorAll('.form-input').forEach(el => el.classList.remove('is-error'));
    };
    
    const handleFocusTrap = (e) => {
        if (e.key === 'Tab') {
            const focusableElements = getFocusableElements(modal);
            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        }
    };

    // Listeners for opening and closing
    modalToggles.forEach(btn => btn.addEventListener('click', openModal));
    modalClosers.forEach(btn => btn.addEventListener('click', closeModal));
    
    // 14. ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('u-hidden')) {
            closeModal();
        }
    });


    // --- 14. Simple Client-side Form Validation ---
    const validators = {
        name: (value) => value.trim().length >= 2 ? '' : 'Name must be at least 2 characters.',
        dob: (value) => {
            if (!value) return 'Date of Birth is required.';
            const dob = new Date(value);
            const now = new Date();
            // Simple check: DOB must be in the past
            return dob < now ? '' : 'DOB must be a past date.';
        },
        phone: (value) => /^\+?260\d{8,9}$|^\d{9,10}$/.test(value) ? '' : 'Please enter a valid Zambian phone number format.',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address.',
        select: (value) => value !== '' ? '' : 'Please select a program.',
        checkbox: (input) => input.checked ? '' : 'You must give consent.',
    };

    const validateField = (input) => {
        const type = input.dataset.validation;
        let errorMessage = '';

        if (!type) return true; // No validation required

        if (type === 'checkbox') {
            errorMessage = validators[type](input);
        } else {
            errorMessage = validators[type](input.value);
        }

        const errorElement = document.getElementById(`${input.id}-error`);

        if (errorMessage) {
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('u-hidden');
            input.classList.add('is-error');
            return false;
        } else {
            errorElement.classList.add('u-hidden');
            input.classList.remove('is-error');
            return true;
        }
    };

    const validateForm = (form) => {
        let isValid = true;
        const inputs = form.querySelectorAll('[data-validation]');

        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        return isValid;
    };

    // Add validation on blur for instant feedback
    enrolmentForm.querySelectorAll('[data-validation]').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });

    enrolmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Re-validate all fields on submit
        if (validateForm(this)) {
            // Success mock (No backend/API call)
            console.log('Form submitted successfully (mock). Data:', new FormData(this));
            
            // Show success message and hide the form elements
            this.classList.add('u-hidden');
            formSuccessMessage.classList.remove('u-hidden');
            
            // NOTE: In a real app, you would hook the API here (e.g., fetch(API_ENDPOINT, { method: 'POST', body: formData }))
        } else {
            console.warn('Form validation failed. Please check inline errors.');
            // Focus on the first invalid field
            const firstError = this.querySelector('.form-input.is-error');
            if (firstError) {
                firstError.focus();
            }
        }
    });


    // --- 14. News Toggle for Upcoming/Past events (filter client-side) ---
    newsFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.dataset.newsFilter;

            // Update active state for buttons
            newsFilterBtns.forEach(b => b.classList.remove('is-active'));
            this.classList.add('is-active');

            // Update ARIA attributes for accessibility
            newsFilterBtns.forEach(b => b.setAttribute('aria-selected', 'false'));
            this.setAttribute('aria-selected', 'true');

            // Filter cards
            newsCards.forEach(card => {
                if (card.dataset.eventType === filterType) {
                    card.classList.remove('u-hidden');
                } else {
                    card.classList.add('u-hidden');
                }
            });
        });
    });
    
    // --- 14. Smooth scroll for internal anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // Check if it's the skip link, which is handled via its default focus behavior, 
            // but we'll apply smooth scroll for the others.
            if (targetId === '#main-content') {
                 // The focus for skip link should be instant, but scroll can be smooth
                 document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
                 return;
            }

            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
            // Update URL hash for accessibility/bookmarking
            window.history.pushState(null, '', targetId);
        });
    });
    
    // --- 14. Small script to switch theme colors ---
    const setTheme = (theme) => {
        if (theme === 'modern') {
            html.classList.add('theme-modern');
            themeNameSpan.textContent = 'Modern';
            localStorage.setItem('stmovens_theme', 'modern');
        } else {
            html.classList.remove('theme-modern');
            themeNameSpan.textContent = 'Classic';
            localStorage.setItem('stmovens_theme', 'classic');
        }
    };
    
    // Check for saved theme preference on load
    const savedTheme = localStorage.getItem('stmovens_theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Simple example: if system prefers dark (though our themes are light, this shows the pattern)
        // For this light-only design, we'll default to classic unless explicitly saved.
        setTheme('classic'); 
    } else {
        setTheme('classic');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = html.classList.contains('theme-modern') ? 'modern' : 'classic';
        const newTheme = currentTheme === 'classic' ? 'modern' : 'classic';
        setTheme(newTheme);
    });

})();


// carousel items
const track = document.querySelector('.carousel-track');
const items = document.querySelectorAll('.carousel-item');

let currentIndex = 0;



function updateCarousel() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  dots.forEach(dot => dot.classList.remove('active'));
  dots[currentIndex].classList.add('active');
}

// Auto-play (optional)
setInterval(() => {
  currentIndex = (currentIndex + 1) % items.length;
  updateCarousel();
}, 5000);

// end of carousel