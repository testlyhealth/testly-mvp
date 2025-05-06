import { loadingOverlay } from './components/loading-overlay.js';
import { displayBloodTestsPage } from './pages/blood-tests.js';

// Router class to handle SPA navigation
export default class Router {
  constructor(routes) {
    this.routes = routes;
    this.originalHomeContent = null;
    this.mainContent = document.querySelector('main');
    this.init = this.init.bind(this);
    this.handleRoute = this.handleRoute.bind(this);
  }

  init() {
    // Store original homepage content
    this.originalHomeContent = this.mainContent.innerHTML;
    
    // Set up hash change listener
    window.addEventListener('hashchange', this.handleRoute);
    
    // Handle initial route
    this.handleRoute();
  }

  async handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    
    // Show loading overlay
    loadingOverlay.show();
    
    try {
      // If it's the home route, restore original content
      if (hash === '/') {
        await this.renderHome();
      } else if (hash === '/blood-tests') {
        // Handle blood tests page
        const content = await displayBloodTestsPage();
        await this.render(content);
      } else {
        // Find matching route
        const route = this.routes.find(r => r.path === hash);
        
        if (route) {
          try {
            const template = await this.loadTemplate(route.template);
            await this.render(template);
          } catch (error) {
            console.error('Error loading template:', error);
            // Show error page or fallback content
            await this.renderError('Page Not Found', 'The page you\'re looking for doesn\'t exist.');
          }
        } else {
          // Handle 404 - route not found
          await this.renderError('Page Not Found', 'The page you\'re looking for doesn\'t exist.');
        }
      }
    } finally {
      // Hide loading overlay
      loadingOverlay.hide();
    }
  }

  async renderHome() {
    if (this.originalHomeContent) {
      // Store the current scroll position
      const scrollPosition = window.scrollY;
      
      // Create a temporary container to hold the new content
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = this.originalHomeContent;
      
      // Add transition classes
      this.mainContent.classList.add('page-transition');
      this.mainContent.classList.remove('visible');
      
      // Wait for transition out
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update content while preserving layout
      this.mainContent.innerHTML = this.originalHomeContent;
      
      // Force a reflow
      this.mainContent.offsetHeight;
      
      // Add visible class for transition in
      this.mainContent.classList.add('visible');
      
      // Restore scroll position
      window.scrollTo(0, scrollPosition);
      
      // Initialize dynamic content
      this.initializeHomePageContent();
    }
  }

  initializeHomePageContent() {
    // Initialize dynamic text animation
    const dynamicText = document.querySelector('.dynamic-text');
    if (dynamicText) {
      const phrases = [
        'blood tests',
        'weight loss treatments',
        'hormone clinics',
        'supplements'
      ];
      let currentIndex = 0;

      function updateDynamicText() {
        dynamicText.classList.add('fade-out');
        
        setTimeout(() => {
          dynamicText.textContent = phrases[currentIndex];
          dynamicText.classList.remove('fade-out');
          currentIndex = (currentIndex + 1) % phrases.length;
        }, 500);
      }

      // Initial update
      updateDynamicText();
      
      // Set up the interval for subsequent updates
      setInterval(updateDynamicText, 3000);
    }

    // Handle video playback
    const videos = document.querySelectorAll('.hero-video');
    videos.forEach((video, index) => {
      if (index === 1) { // testosterone video
        const timeUpdateHandler = function() {
          if (video.currentTime >= 6) { // Stop after 6 seconds
            video.pause();
            video.currentTime = 6; // Keep at 6 second mark
            video.removeEventListener('timeupdate', timeUpdateHandler);
          }
        };
        video.addEventListener('timeupdate', timeUpdateHandler);
      }

      video.onended = function() {
        video.pause();
        if (index === 0) { // scales video
          video.currentTime = video.duration;
        } else { // testosterone video
          video.currentTime = 6; // Keep at 6 second mark
        }
      };
    });

    // Handle weight loss banner video
    const weightLossVideo = document.querySelector('.health-banner-video');
    if (weightLossVideo) {
      weightLossVideo.playbackRate = 0.75;
      weightLossVideo.pause();
      // Only play when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            weightLossVideo.play();
          }
        });
      }, { threshold: 0.3 });
      observer.observe(weightLossVideo);
      weightLossVideo.onended = function() {
        weightLossVideo.pause();
        weightLossVideo.currentTime = weightLossVideo.duration;
        observer.disconnect();
      };
    }
  }

  async loadTemplate(templateName) {
    try {
      const response = await fetch(`templates/${templateName}`);
      if (!response.ok) {
        throw new Error('Template not found');
      }
      return await response.text();
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }

  async render(content) {
    // Only add transition classes for non-home pages
    if (window.location.hash !== '' && window.location.hash !== '#/') {
      this.mainContent.classList.add('page-transition');
      this.mainContent.classList.remove('visible');
      
      // Wait for transition out
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Update content
    this.mainContent.innerHTML = content;
    
    // Force a reflow
    this.mainContent.offsetHeight;
    
    // Add visible class for transition in
    this.mainContent.classList.add('visible');
  }

  async renderError(title, message) {
    const errorContent = `
      <div class="error-container">
        <h2>${title}</h2>
        <p>${message}</p>
        <a href="#/" class="cta-button">Return Home</a>
      </div>
    `;
    await this.render(errorContent);
  }
} 