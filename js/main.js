import { setupMenuToggle } from './menu.js';
import { displayCategoryProducts } from './products.js';
import { displayHomePage } from './home.js';
import { displayBlogPage } from './blog.js';
import { displayArticle } from './article.js';
import { $, $all } from './dom.js';
import { initLoginModal } from './login-modal.js';
import { LandingPage } from './components/landing-page.js';
import { initUserDropdown } from './user-dropdown.js';

// Handle routing
function handleRoute() {
  const hash = window.location.hash;
  
  if (hash.startsWith('#/blog/')) {
    const articleId = hash.split('/')[2];
    displayArticle(articleId);
  } else if (hash === '#/blog') {
    displayBlogPage();
  } else if (hash.startsWith('#/category/')) {
    const categoryId = hash.split('/')[2];
    displayCategoryProducts(categoryId);
  } else {
    displayHomePage();
  }

  // Reinitialize menu functionality after content changes
  setupMenuToggle();
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize landing page
  const landingPage = new LandingPage();
  landingPage.init();

  // Listen for landing page closure
  window.addEventListener('landingPageClosed', (event) => {
    const route = event.detail.route;
    if (route) {
        window.location.hash = route;
    } else {
        // Show homepage
        const mainContent = document.querySelector('.product-grid');
        if (mainContent) {
            mainContent.style.display = 'block';
            displayHomePage();
            // Initialize other components
            initLoginModal();
            initUserDropdown();
        }
    }
  });

  // Handle route changes
  window.addEventListener('hashchange', handleRoute);
  
  // Make logo clickable to return to home
  $('.logo').addEventListener('click', () => {
    window.location.hash = '';
  });
  
  // Add click handlers to category links
  $all('.category-list a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryId = e.target.textContent.toLowerCase().replace(/\s+/g, '-');
      window.location.hash = `#/category/${categoryId}`;
    });
  });

  // Initialize menu functionality
  setupMenuToggle();
});
