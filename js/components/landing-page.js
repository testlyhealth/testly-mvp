import { $, $all } from '../dom.js';

export class LandingPage {
    constructor() {
        this.container = null;
        this.closeButton = null;
        this.skipButton = null;
        this.guidanceOverlay = null;
    }

    init() {
        // Create the landing page
        this.createLandingPage();
        this.setupEventListeners();
    }

    createLandingPage() {
        const container = document.createElement('div');
        container.className = 'landing-page';
        container.innerHTML = `
            <button class="close-button">&times;</button>
            <div class="landing-content">
                <h1>Welcome to Testly</h1>
                <p class="landing-subtitle">your solution to finding the right personalised medical test or treatment <strong>for you</strong></p>
                <p class="landing-subtitle"><strong>COMPARE</strong>, <strong>BOOK</strong> and <strong>TRACK</strong>, all in one place.</p>
                <button class="how-it-works-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    How does it work?
                </button>
                <p class="guidance-question">Need guidance to find the right personalised test or treatment for you?</p>
                <div class="guidance-buttons">
                    <button class="guidance-btn yes-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Yes, I need GUIDANCE
                    </button>
                    <button class="guidance-btn no-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <div>
                            <div>No thanks, let me pick for myself</div>
                        </div>
                    </button>
                </div>
            </div>
            <button class="skip-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
                SKIP
            </button>
        `;
        document.body.appendChild(container);
        this.container = container;
        this.closeButton = container.querySelector('.close-button');
        this.skipButton = container.querySelector('.skip-button');
    }

    createGuidanceOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'guidance-overlay';
        overlay.innerHTML = `
            <div class="guidance-content">
                <h2>GUIDANCE</h2>
                <button class="close-guidance">&times;</button>
            </div>
        `;
        document.body.appendChild(overlay);
        this.guidanceOverlay = overlay;
        
        // Add event listener for closing guidance
        overlay.querySelector('.close-guidance').addEventListener('click', () => {
            overlay.remove();
            this.guidanceOverlay = null;
        });
    }

    setupEventListeners() {
        // Close button click - go to home page
        this.closeButton.addEventListener('click', () => {
            this.container.classList.add('fade-out');
            setTimeout(() => {
                this.container.remove();
                // Dispatch a custom event to notify the main application
                window.dispatchEvent(new CustomEvent('landingPageClosed', { detail: { route: '' } }));
            }, 300);
        });
        
        // Skip button click - go to home page
        this.skipButton.addEventListener('click', () => {
            this.container.classList.add('fade-out');
            setTimeout(() => {
                this.container.remove();
                // Dispatch a custom event to notify the main application
                window.dispatchEvent(new CustomEvent('landingPageClosed', { detail: { route: '' } }));
            }, 300);
        });

        // How it works button click
        const howItWorksBtn = this.container.querySelector('.how-it-works-btn');
        howItWorksBtn.addEventListener('click', () => {
            // TODO: Implement how it works functionality
            console.log('How it works clicked');
        });

        // Guidance buttons click
        const guidanceBtns = this.container.querySelectorAll('.guidance-btn');
        guidanceBtns.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('yes-btn')) {
                    // Show guidance overlay
                    this.createGuidanceOverlay();
                } else {
                    // Go to general health page
                    this.container.classList.add('fade-out');
                    setTimeout(() => {
                        this.container.remove();
                        // Dispatch a custom event to notify the main application
                        window.dispatchEvent(new CustomEvent('landingPageClosed', { 
                            detail: { route: '#/category/general-health' } 
                        }));
                    }, 300);
                }
            });
        });
    }
} 