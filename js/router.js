import { loadingOverlay } from './components/loading-overlay.js';
import { displayBloodTestsPage } from './pages/blood-tests.js';
import { displayCategoryProducts } from './products.js';
import { displayHomePage } from './pages/home.js';
import { displayGeneralHealthPage } from './general-health.js';
import { setupDynamicTextAnimation } from './home.js';

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
    // Store original home content
    this.originalHomeContent = this.mainContent.innerHTML;
    
    // Handle initial route
    this.handleRoute();
    
    // Listen for hash changes
    window.addEventListener('hashchange', this.handleRoute);
  }

  async handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    console.log('Router handling route:', hash);
    
    // Show loading overlay
    loadingOverlay.show();
    
    try {
      // If it's the home route, restore original content
      if (hash === '/') {
        console.log('Handling home route');
        await this.renderHome();
      } else if (hash === '/blood-tests') {
        console.log('Handling blood tests route');
        const content = await displayBloodTestsPage();
        await this.render(content);
        this.setupBloodTestsHandlers();
      } else if (hash === '/general-health') {
        console.log('Handling general health route');
        const content = await displayGeneralHealthPage();
        console.log('General health content received, length:', content.length);
        // Don't render again since displayGeneralHealthPage already renders the content
      } else if (hash.startsWith('/category/')) {
        console.log('Handling category route:', hash);
        const categoryId = hash.split('/')[2];
        const content = await displayCategoryProducts(categoryId);
        await this.render(content);
      } else {
        // Find matching route
        const route = this.routes.find(r => r.path === hash);
        console.log('Found matching route:', route);
        
        if (route) {
          if (route.template === null) {
            console.log('Handling special route:', hash);
            const content = await this.handleSpecialRoute(hash);
            await this.render(content);
          } else {
            try {
              console.log('Loading template:', route.template);
              const template = await this.loadTemplate(route.template);
              await this.render(template);
            } catch (error) {
              console.error('Error loading template:', error);
              await this.renderError('Page Not Found', 'The page you\'re looking for doesn\'t exist.');
            }
          }
        } else {
          console.log('No matching route found');
          await this.renderError('Page Not Found', 'The page you\'re looking for doesn\'t exist.');
        }
      }
    } finally {
      // Hide loading overlay
      loadingOverlay.hide();
    }
  }

  async handleSpecialRoute(hash) {
    switch (hash) {
      case '/general-health':
        return await displayGeneralHealthPage();
      default:
        throw new Error('Unknown special route');
    }
  }

  setupBloodTestsHandlers() {
    // Add click handlers to the category boxes
    this.mainContent.querySelectorAll('.category-box').forEach(box => {
      box.addEventListener('click', (e) => {
        const categoryId = box.dataset.category;
        if (categoryId) {
          // Update the URL and display category products
          window.location.hash = `#/category/${categoryId}`;
        }
      });
    });
  }

  async renderHome() {
    const content = displayHomePage();
    await this.render(content);
    setupDynamicTextAnimation();
    // Add homepage-specific event listeners if needed
    // For example, attach the blood test button event listener here if not handled elsewhere
    const bloodTestBtn = document.querySelector('.hero-grid-small .zepbound-box .cta-button');
    if (bloodTestBtn) {
      bloodTestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/blood-tests';
      });
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

  async render(content) {
    console.log('Router rendering content, length:', content.length);
    // Store the current scroll position
    const scrollPosition = window.scrollY;
    
    // Create a temporary container to hold the new content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = content;
    
    // Add transition classes
    this.mainContent.classList.add('page-transition');
    this.mainContent.classList.remove('visible');
    
    // Wait for transition out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update content while preserving layout
    console.log('Updating main content');
    this.mainContent.innerHTML = content;
    
    // Force a reflow and ensure proper layout
    this.mainContent.style.display = 'none';
    this.mainContent.offsetHeight; // Force reflow
    this.mainContent.style.display = '';
    
    // Add visible class for transition in
    this.mainContent.classList.add('visible');
    
    // Restore scroll position
    window.scrollTo(0, scrollPosition);
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
} 