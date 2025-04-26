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
                <h1>Welcome to Testly</h1>
                <p class="welcome-subtitle">your solution to finding the right personalised medical test or treatment <strong>for you</strong></p>
                <p class="welcome-subtitle"><strong>COMPARE</strong>, <strong>BOOK</strong> and <strong>TRACK</strong>, all in one place.</p>
                <button class="how-it-works-btn">How does it work?</button>
                <p class="guidance-question">Need guidance to find the right personalised test or treatment for you?</p>
                <div class="guidance-buttons">
                    <button class="guidance-btn yes-btn">Yes, I need GUIDANCE</button>
                    <button class="guidance-btn no-btn">No thanks, I already know what I'm looking for. Take me straight to PICK FOR MYSELF</button>
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

        // How it works button click
        const howItWorksBtn = this.overlay.querySelector('.how-it-works-btn');
        howItWorksBtn.addEventListener('click', () => {
            // TODO: Implement how it works functionality
            console.log('How it works clicked');
        });

        // Guidance buttons click
        const guidanceBtns = this.overlay.querySelectorAll('.guidance-btn');
        guidanceBtns.forEach(button => {
            button.addEventListener('click', () => {
                // TODO: Implement guidance functionality
                console.log('Guidance button clicked:', button.textContent);
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