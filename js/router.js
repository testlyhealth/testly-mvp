import { loadingOverlay } from './components/loading-overlay.js';
import { displayBloodTestsPage } from './pages/blood-tests.js';
import { displayCategoryProducts } from './products.js';
import { getHomePageContent, initializeHomePage } from './pages/home.js';
import { displayGeneralHealthPage } from './general-health.js';
import { getAdvancedSearchPageContent, initializeAdvancedSearchPage } from './pages/advanced-search.js';
import { getBrowsePageContent, initializeBrowsePage } from './pages/browse.js';
import { getHelpPageContent, initializeHelpPage } from './pages/help.js';
import { displayAboutPage } from './pages/about.js';
import { displayContactPage, initializeContactPage } from './pages/contact.js';
import { supabase } from './api/supabase.js';
import { displayPrivacyPage } from './pages/privacy.js';
import { displayCookiesPage } from './pages/cookies.js';
import { displayDisclaimerPage } from './pages/disclaimer.js';
import { displayAffiliatePage } from './pages/affiliate.js';
import { ComparePage } from './pages/compare.js';
import { displayCategorySelectPage } from './pages/category-select.js';
import { displayBloodTestCategoriesPage } from './pages/blood-test-categories.js';
import { displayBloodTestSearchOptionsPage } from './pages/blood-test-search-options.js';
import { displayBloodTestRequestPage, initializeBloodTestRequestPage } from './pages/blood-test-request.js';
import { displayComingSoonPage } from './pages/coming-soon.js';
import { displayWeightLossPage, initializeWeightLossPage } from './pages/weight-loss.js';
import { displayAdminPage, initializeAdminPage } from './pages/admin.js';

// Router class to handle SPA navigation
export default class Router {
  constructor(routes) {
    this.routes = routes;
    this.mainContent = document.querySelector('main');
    this.init = this.init.bind(this);
    this.handleRoute = this.handleRoute.bind(this);
    this._lastFullHash = null; // Track last full hash
  }

  init() {
    // Handle initial route
    this.handleRoute();
    
    // Listen for hash changes
    window.addEventListener('hashchange', this.handleRoute);
  }

  async handleRoute() {
    const fullHash = window.location.hash;
    if (this._lastFullHash === fullHash) {
      // No change, do nothing
      return;
    }
    this._lastFullHash = fullHash;
    const hash = fullHash.slice(1) || '/';
    console.log('Router handling route:', hash);
    
    // Show loading overlay
    loadingOverlay.show();
    
    try {
      // If it's the home route, handle it separately
      if (hash === '/') {
        console.log('Handling home route');
        await this.renderHome();
        return;
      }
      
      // Handle other routes
      if (hash.startsWith('/blood-tests')) {
        console.log('Handling blood tests route');
        
        // Check if showAll parameter is present
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const showAll = urlParams.get('showAll');
        
                  if (showAll === 'true') {
            // Redirect directly to general health with all categories
            const allCategories = [
              'General health', 'Female health and hormones', 'Male health and hormones', 'General hormone health',
              'Thyroid health', 'Heart and metabolic health', 'Vitamins and minerals', 'Sports and nutrition',
              'Toxicology', 'Fertility', 'Infectious diseases', 'Autoimmunity and inflammation',
              'Genetics', 'Haematology', 'Allergies'
            ];
          
          const searchParams = new URLSearchParams();
          searchParams.set('filter', allCategories.join(','));
          
          // Preserve any other parameters (like biomarkers)
          const biomarker1 = urlParams.get('biomarkers');
          if (biomarker1) {
            searchParams.set('biomarkers', biomarker1);
          }
          
          const url = `#/general-health${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
          window.location.hash = url;
          return; // Exit early since we're redirecting
        }
        
        const content = await displayBloodTestsPage();
        await this.render(content);
        this.setupBloodTestsHandlers();
      } else if (hash.startsWith('/general-health')) {
        console.log('Handling general health route');
        const content = await displayGeneralHealthPage();
        console.log('General health content received, length:', content.length);
        await this.render(content);
      } else if (hash === '/advanced-search') {
        console.log('Handling advanced search route');
        const content = getAdvancedSearchPageContent();
        await this.render(content);
        initializeAdvancedSearchPage();
      } else if (hash === '/browse') {
        console.log('Handling browse route');
        const content = getBrowsePageContent();
        await this.render(content);
        initializeBrowsePage();
      } else if (hash === '/help') {
        console.log('Handling help route');
        const content = getHelpPageContent();
        await this.render(content);
        initializeHelpPage();
      } else if (hash === '/about') {
        console.log('Handling about route');
        const content = await displayAboutPage();
        await this.render(content);
      } else if (hash === '/contact') {
        console.log('Handling contact route');
        const content = await displayContactPage();
        await this.render(content);
        // Initialize contact page after render is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        initializeContactPage();
      } else if (hash === '/privacy') {
        console.log('Handling privacy route');
        const content = await displayPrivacyPage();
        await this.render(content);
      } else if (hash === '/cookies') {
        console.log('Handling cookies route');
        const content = await displayCookiesPage();
        await this.render(content);
      } else if (hash === '/disclaimer') {
        console.log('Handling disclaimer route');
        const content = await displayDisclaimerPage();
        await this.render(content);
      } else if (hash === '/affiliate') {
        console.log('Handling affiliate route');
        const content = await displayAffiliatePage();
        await this.render(content);
      } else if (hash === '/compare') {
        console.log('Handling compare route');
        const content = await ComparePage.render();
        await this.render(content);
        // Ensure the comparison grid is updated after rendering
        if (window.updateComparisonGrid) await window.updateComparisonGrid();
      } else if (hash === '/category-select') {
        console.log('Handling category select route');
        const content = await displayCategorySelectPage();
        await this.render(content);
      } else if (hash === '/blood-test-categories') {
        console.log('Handling blood test categories route');
        const content = await displayBloodTestCategoriesPage();
        await this.render(content);
      } else if (hash === '/blood-test-search-options') {
        console.log('Handling blood test search options route');
        const content = await displayBloodTestSearchOptionsPage();
        await this.render(content);
      } else if (hash === '/blood-test-request') {
        console.log('Handling blood test request route');
        const content = await displayBloodTestRequestPage();
        await this.render(content);
        // Initialize the form after render
        await new Promise(resolve => setTimeout(resolve, 100));
        initializeBloodTestRequestPage();
      } else if (hash === '/weight-loss') {
        console.log('Handling weight loss route');
        const content = await displayWeightLossPage();
        await this.render(content);
        initializeWeightLossPage();
      } else if (hash.startsWith('/coming-soon/')) {
        console.log('Handling coming soon route');
        const categoryName = decodeURIComponent(hash.split('/')[2]);
        const content = await displayComingSoonPage(categoryName);
        await this.render(content);
      } else if (hash === '/admin') {
        console.log('Handling admin route');
        const content = await displayAdminPage();
        await this.render(content);
        // Initialize admin page after render is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        initializeAdminPage();
      } else if (hash.startsWith('/category/')) {
        console.log('Handling category route:', hash);
        const categoryId = hash.split('/')[2];
        // For now, render the general health page for all categories
        const content = await displayGeneralHealthPage();
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

  async renderHome() {
    const content = getHomePageContent();
    await this.render(content);
    initializeHomePage();
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
    
    // Reset scroll position for about page, otherwise restore previous position
    if (window.location.hash === '#/about') {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, scrollPosition);
    }

    // Attach select all event listeners if on advanced search page
    if (window.location.hash === '#/advanced') {
      document.querySelectorAll('.select-all-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
          const group = this.getAttribute('data-group');
          const checked = this.checked;
          document.querySelectorAll('input[type="checkbox"][data-group="' + group + '"]:not(.select-all-checkbox):not(.advanced)').forEach(box => {
            box.checked = checked;
          });
        });
      });
    }

    // Dispatch event to notify that content has been rendered
    document.dispatchEvent(new Event('contentRendered'));
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

  async handleSpecialRoute(hash) {
    switch (hash) {
      case '/general-health':
        return await displayGeneralHealthPage();
      default:
        throw new Error('Unknown special route');
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
} 