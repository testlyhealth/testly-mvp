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

// Define categories for the All dropdown
const categories = [
  { name: 'General Health', id: 'general-health' },
  { name: 'Weight Loss', id: 'weight-loss' },
  { name: 'Sleep', id: 'sleep' },
  { name: 'Hormones', id: 'hormones' },
  { name: 'Women’s Health', id: 'womens-health' },
  { name: 'Men’s Health', id: 'mens-health' },
  { name: 'Heart Health', id: 'heart-health' },
  { name: 'Gut Health', id: 'gut-health' },
  { name: 'Supplements', id: 'supplements' }
];

function setupAllDropdown() {
  const dropdown = document.getElementById('burger-dropdown');
  if (!dropdown) return;
  dropdown.innerHTML = `<ul>${categories.map(cat => `<li data-id="${cat.id}">${cat.name}</li>`).join('')}</ul>`;
  dropdown.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      window.location.hash = `#/category/${li.dataset.id}`;
      dropdown.classList.add('hidden');
    });
  });

  // Show/hide dropdown on hover
  const wrapper = document.querySelector('.menu-dropdown-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => {
      dropdown.classList.remove('hidden');
    });
    wrapper.addEventListener('mouseleave', () => {
      dropdown.classList.add('hidden');
    });
  }
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
  setupAllDropdown();
});
