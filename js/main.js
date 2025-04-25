import { setupMenuToggle } from './menu.js';
import { displayCategoryProducts } from './products.js';
import { displayHomePage } from './home.js';
import { displayBlogPage } from './blog.js';
import { displayArticle } from './article.js';
import { $, $all } from './dom.js';
import { initLoginModal } from './login-modal.js';
import { WelcomeOverlay } from './components/welcome-overlay.js';
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
  // Initial route
  handleRoute();
  
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

  // Initialize login modal
  initLoginModal();

  // Initialize welcome overlay
  const welcomeOverlay = new WelcomeOverlay();
  welcomeOverlay.init();

  // Initialize user dropdown
  initUserDropdown();

  // Add click handler for Guide me button
  $('.guide-me').addEventListener('click', () => {
    welcomeOverlay.showOverlay();
  });
});
