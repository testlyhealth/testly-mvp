import { setupMenuToggle } from './menu.js';
import { displayCategoryProducts } from './products.js';
import { displayHomePage } from './home.js';
import { displayBlogPage } from './blog.js';
import { displayArticle } from './article.js';
import { displayBloodTestsPage } from './blood-tests.js';
import { $, $all } from './dom.js';
import { initLoginModal } from './login-modal.js';
import { LandingPage } from './components/landing-page.js';
import { initUserDropdown } from './user-dropdown.js';

// Handle routing
function handleRoute() {
  const hash = window.location.hash;
  const path = window.location.pathname;
  
  // Clear any existing content
  const bloodTestsGrid = $('.blood-tests-grid');
  const productGrid = $('.product-grid');
  
  if (bloodTestsGrid) {
    bloodTestsGrid.innerHTML = '';
    bloodTestsGrid.style.display = 'none';
  }
  
  if (productGrid) {
    productGrid.style.display = 'block';
  }
  
  if (path.includes('blood-tests.html')) {
    if (bloodTestsGrid) {
      bloodTestsGrid.style.display = 'block';
    }
    displayBloodTestsPage();
  } else if (hash.startsWith('#/blog/')) {
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
  { name: "Women's Health", id: 'womens-health' },
  { name: "Men's Health", id: 'mens-health' },
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
  // Initialize components
  initLoginModal();
  initUserDropdown();
  setupMenuToggle();
  setupAllDropdown();

  // Create product grid if it doesn't exist
  let mainContent = document.querySelector('.product-grid');
  if (!mainContent) {
    mainContent = document.createElement('main');
    mainContent.className = 'product-grid';
    document.body.appendChild(mainContent);
  }

  // Handle initial route
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
});
