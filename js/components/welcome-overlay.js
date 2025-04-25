import { $, $all } from '../dom.js';

// Welcome overlay component
export class WelcomeOverlay {
    constructor() {
        this.overlay = null;
        this.closeButton = null;
        this.skipButton = null;
    }

    init() {
        this.createOverlay();
        this.setupEventListeners();
    }

    createOverlay() {
        // Remove any existing overlays first
        const existingOverlays = document.querySelectorAll('.welcome-overlay');
        existingOverlays.forEach(overlay => overlay.remove());

        const overlay = document.createElement('div');
        overlay.className = 'welcome-overlay';
        overlay.innerHTML = `
            <div class="welcome-content">
                <button class="close-button">&times;</button>
                <h1>Testly</h1>
                <p class="welcome-subtitle"><strong>Compare</strong>, <strong>book</strong> and <strong>track</strong> personalised medical tests and treatments,<br>all in <u>one</u> place</p>
                <div class="welcome-buttons">
                    <button class="welcome-button guide-me">
                        <span class="button-text">I'm not sure what I'm looking for, guide me</span>
                        <i class="fas fa-compass"></i>
                    </button>
                    <button class="welcome-button take-me">
                        <span class="button-text">I already know what I want, take me to it</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="welcome-button doctor">
                        <span class="button-text">I want to get advice from a doctor</span>
                        <i class="fas fa-user-md"></i>
                    </button>
                    <button class="welcome-button questionnaire">
                        <span class="button-text">I want to take the health improvement questionnaire</span>
                        <i class="fas fa-clipboard-list"></i>
                    </button>
                </div>
                <button class="skip-button">SKIP >></button>
            </div>
        `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
        this.closeButton = overlay.querySelector('.close-button');
        this.skipButton = overlay.querySelector('.skip-button');
    }

    setupEventListeners() {
        // Close button click
        this.closeButton.addEventListener('click', () => this.closeOverlay());
        
        // Skip button click
        this.skipButton.addEventListener('click', () => this.closeOverlay());

        // Welcome button clicks
        const buttons = this.overlay.querySelectorAll('.welcome-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // For now, just close the overlay
                this.closeOverlay();
            });
        });
    }

    closeOverlay() {
        if (this.overlay) {
            this.overlay.classList.add('fade-out');
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 300);
        }
    }

    showOverlay() {
        this.createOverlay();
        this.setupEventListeners();
    }
} 