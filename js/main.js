import { setupMenuToggle } from './menu.js';
import { displayCategoryProducts } from './products.js';
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
  { path: '/general-health', template: null }, // Special case for general health
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

// Initialize the app
function init() {
  // Initialize the router
  router.init();
  
  // Setup blood tests menu
  setupBloodTestsMenu();
  
  // Setup mobile menu
  setupMobileMenu();
  
  // Initialize UI components
  initializeUI();
  
  // Initialize login modal
  initLoginModal();
  
  // Initialize user dropdown
  initUserDropdown();
}

// Setup blood tests menu
function setupBloodTestsMenu() {
  const bloodTestsLink = document.querySelector('.blood-tests-link');
  const bloodTestsMenu = document.querySelector('.blood-tests-menu');
  
  if (!bloodTestsLink || !bloodTestsMenu) return;
  
  // Toggle menu on click and prevent navigation
  bloodTestsLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    bloodTestsMenu.classList.toggle('visible');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!bloodTestsMenu.contains(e.target) && !bloodTestsLink.contains(e.target)) {
      bloodTestsMenu.classList.remove('visible');
    }
  });
  
  // Close menu when mouse leaves
  bloodTestsMenu.addEventListener('mouseleave', () => {
    bloodTestsMenu.classList.remove('visible');
  });
  
  // Close menu when navigating to a new page
  window.addEventListener('hashchange', () => {
    bloodTestsMenu.classList.remove('visible');
  });
}

// Setup mobile menu
function setupMobileMenu() {
  const burgerMenu = document.querySelector('.burger-menu');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuBack = document.querySelector('.mobile-menu-back');
  const mobileMenuPrimary = document.querySelector('.mobile-menu-primary');
  const mobileMenuSecondary = document.querySelector('.mobile-menu-secondary');
  
  if (!burgerMenu || !mobileMenu) return;
  
  // Toggle mobile menu
  burgerMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('visible');
  });
  
  // Handle back button
  if (mobileMenuBack && mobileMenuPrimary && mobileMenuSecondary) {
    mobileMenuBack.addEventListener('click', () => {
      mobileMenuPrimary.style.display = 'block';
      mobileMenuSecondary.classList.remove('visible');
    });
  }
  
  // Handle submenu items
  const submenuItems = document.querySelectorAll('.has-submenu');
  submenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (mobileMenuPrimary && mobileMenuSecondary) {
        mobileMenuPrimary.style.display = 'none';
        mobileMenuSecondary.classList.add('visible');
      }
    });
  });

  // Handle all menu items (both primary and secondary)
  const menuItems = document.querySelectorAll('.mobile-menu-list a');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't prevent default for submenu items
      if (!item.classList.contains('has-submenu')) {
        // Close the mobile menu
        mobileMenu.classList.remove('visible');
        // Reset the secondary menu state
        if (mobileMenuPrimary && mobileMenuSecondary) {
          mobileMenuPrimary.style.display = 'block';
          mobileMenuSecondary.classList.remove('visible');
        }
      }
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

// Start the app
init();
