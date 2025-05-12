import { setupMenuToggle } from './menu.js';
import { displayCategoryProducts } from './products.js';
import { displayHomePage } from './home.js';
import { displayBlogPage } from './blog.js';
import { displayArticle } from './article.js';
import { displayBloodTestsPage } from './pages/blood-tests.js';
import { $, $all } from './dom.js';
import { initLoginModal } from './login-modal.js';
import { LandingPage } from './components/landing-page.js';
import { initUserDropdown } from './user-dropdown.js';
import Router from './router.js';
import store from './store.js';

// Define routes
const routes = [
  { path: '/blood-tests', template: 'blood-tests.html' },
  { path: '/general-health', template: 'general-health.html' },
  { path: '/category/weight-loss', template: 'weight-loss.html' },
  { path: '/category/mens-health', template: 'mens-health.html' },
  { path: '/category/womens-health', template: 'womens-health.html' },
  { path: '/category/supplements', template: 'supplements.html' }
];

// Initialize router
const router = new Router(routes);

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

// Initialize the app
function init() {
  // Initialize the router
  router.init();
  
  // Setup blood tests menu
  setupBloodTestsMenu();
  
  // Start the app
  router.handleRoute();
}

// Start the app when the DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Setup blood tests menu
function setupBloodTestsMenu() {
  const bloodTestsLink = document.querySelector('.blood-tests-link');
  const bloodTestsMenu = document.querySelector('.blood-tests-menu');
  
  if (!bloodTestsLink || !bloodTestsMenu) return;
  
  // Toggle menu on click
  bloodTestsLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    bloodTestsMenu.classList.toggle('visible');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.blood-tests-menu') && !e.target.closest('.blood-tests-link')) {
      bloodTestsMenu.classList.remove('visible');
    }
  });
  
  // Close menu when clicking a menu item
  bloodTestsMenu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      bloodTestsMenu.classList.remove('visible');
    });
  });
}

// Initialize UI components
function initializeUI() {
    // Burger menu functionality
    const burgerMenu = document.querySelector('.burger-menu');
    const burgerDropdown = document.querySelector('#burger-dropdown');
    
    burgerMenu.addEventListener('click', () => {
        burgerDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.menu-dropdown-wrapper')) {
            burgerDropdown.classList.add('hidden');
        }
    });

    // Make logo clickable to return to home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            window.location.hash = '#/';
        });
    }
}
