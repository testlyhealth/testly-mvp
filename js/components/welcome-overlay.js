import { $, $all } from '../dom.js';

// Welcome overlay component
export class WelcomeOverlay {
    constructor() {
        this.overlay = null;
        this.closeButton = null;
        this.skipButton = null;
        this.options = null;
    }

    init() {
        // Create overlay if it doesn't exist in localStorage
        if (!localStorage.getItem('welcomeOverlayShown')) {
            this.createOverlay();
            this.setupEventListeners();
        }
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'welcome-overlay';
        overlay.innerHTML = `
            <div class="welcome-content">
                <button class="close-button">&times;</button>
                <button class="skip-button">SKIP >></button>
                <div class="welcome-header">
                    <h1>Testly</h1>
                    <h2>Take control of your health with ease.</h2>
                    <p>Compare, book and track tests and treatments, all in one place.</p>
                </div>
                <div class="welcome-options">
                    <div class="welcome-option blood-tests" data-category="blood-tests">
                        <h3>Take me to blood tests</h3>
                    </div>
                    <div class="welcome-option comparisons" data-category="comparisons">
                        <h3>I'm weighing up my options, take me to comparisons</h3>
                    </div>
                    <div class="welcome-option doctor" data-category="doctor">
                        <h3>I'd like to talk to a doctor</h3>
                    </div>
                    <div class="welcome-option questionnaire" data-category="questionnaire">
                        <h3>I'm not sure what I want... take me to the health improvement questionnaire</h3>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
        this.closeButton = overlay.querySelector('.close-button');
        this.skipButton = overlay.querySelector('.skip-button');
        this.options = overlay.querySelectorAll('.welcome-option');
    }

    setupEventListeners() {
        // Close button click
        this.closeButton.addEventListener('click', () => this.closeOverlay());

        // Skip button click
        this.skipButton.addEventListener('click', () => this.closeOverlay());

        // Option clicks
        this.options.forEach(option => {
            option.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.handleOptionClick(category);
            });
        });
    }

    handleOptionClick(category) {
        // Navigate to the selected category
        window.location.href = `#${category}`;
        this.closeOverlay();
    }

    closeOverlay() {
        this.overlay.classList.add('fade-out');
        setTimeout(() => {
            this.overlay.remove();
            localStorage.setItem('welcomeOverlayShown', 'true');
        }, 300);
    }
} 