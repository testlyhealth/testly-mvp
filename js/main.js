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
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!bloodTestsLink || !bloodTestsMenu) return;

  // Helper: is mobile
  function isMobile() {
    return window.innerWidth <= 900;
  }

  // Toggle menu on click and prevent navigation
  bloodTestsLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMobile()) {
      // On mobile, open mobile menu instead
      if (mobileMenu) {
        mobileMenu.classList.add('visible');
      }
      bloodTestsMenu.classList.add('hidden');
      return;
    }
    // On desktop, toggle blood tests menu
    bloodTestsMenu.classList.toggle('hidden');
    // Hide mobile menu if open
    if (mobileMenu) mobileMenu.classList.remove('visible');
  });

  // Close menu when clicking outside (desktop only)
  document.addEventListener('click', (e) => {
    if (!isMobile() && !bloodTestsMenu.contains(e.target) && !bloodTestsLink.contains(e.target)) {
      bloodTestsMenu.classList.add('hidden');
    }
  });

  // Close menu when mouse leaves (desktop only)
  bloodTestsMenu.addEventListener('mouseleave', () => {
    if (!isMobile()) {
      bloodTestsMenu.classList.add('hidden');
    }
  });

  // Close menu when navigating to a new page
  window.addEventListener('hashchange', () => {
    bloodTestsMenu.classList.add('hidden');
    if (mobileMenu) mobileMenu.classList.remove('visible');
  });
}

// Setup mobile menu
function setupMobileMenu() {
  const burgerMenu = document.querySelector('.burger-menu');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuBack = document.querySelector('.mobile-menu-back');
  const mobileMenuPrimary = document.querySelector('.mobile-menu-primary');
  const mobileMenuSecondary = document.querySelector('.mobile-menu-secondary');
  const bloodTestsMenu = document.querySelector('.blood-tests-menu');

  if (!burgerMenu || !mobileMenu) return;

  // Always hide mobile menu on load
  mobileMenu.classList.add('hidden');
  mobileMenu.classList.remove('visible');
  if (mobileMenuPrimary && mobileMenuSecondary) {
    mobileMenuPrimary.classList.remove('hidden');
    mobileMenuSecondary.classList.remove('visible');
  }

  // Toggle mobile menu
  burgerMenu.addEventListener('click', () => {
    if (bloodTestsMenu) bloodTestsMenu.classList.add('hidden');
    mobileMenu.classList.toggle('visible');
    mobileMenu.classList.toggle('hidden');
    if (mobileMenu.classList.contains('visible')) {
      mobileMenuPrimary.classList.remove('hidden');
      mobileMenuSecondary.classList.remove('visible');
    }
  });

  // Handle back button
  if (mobileMenuBack && mobileMenuPrimary && mobileMenuSecondary) {
    mobileMenuBack.addEventListener('click', () => {
      mobileMenuPrimary.classList.remove('hidden');
      mobileMenuSecondary.classList.remove('visible');
    });
  }

  // Handle submenu items
  const submenuItems = document.querySelectorAll('.has-submenu');
  submenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (mobileMenuPrimary && mobileMenuSecondary) {
        mobileMenuPrimary.classList.add('hidden');
        mobileMenuSecondary.classList.add('visible');
      }
    });
  });

  // Close mobile menu when any link in the mobile menu is clicked, except for .has-submenu
  const mobileMenuLinks = mobileMenu.querySelectorAll('a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (!link.classList.contains('has-submenu')) {
        mobileMenu.classList.remove('visible');
        mobileMenu.classList.add('hidden');
        if (mobileMenuPrimary && mobileMenuSecondary) {
          mobileMenuPrimary.classList.remove('hidden');
          mobileMenuSecondary.classList.remove('visible');
        }
      }
      // else, let the submenu handler take over
    });
  });

  // Hide mobile menu on navigation
  window.addEventListener('hashchange', () => {
    mobileMenu.classList.remove('visible');
    mobileMenu.classList.add('hidden');
    if (mobileMenuPrimary && mobileMenuSecondary) {
      mobileMenuPrimary.classList.remove('hidden');
      mobileMenuSecondary.classList.remove('visible');
    }
  });

  // Also close mobile menu when logo is clicked
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      mobileMenu.classList.remove('visible');
      mobileMenu.classList.add('hidden');
      if (mobileMenuPrimary && mobileMenuSecondary) {
        mobileMenuPrimary.classList.remove('hidden');
        mobileMenuSecondary.classList.remove('visible');
      }
    });
  }
}

// Initialize UI components
function initializeUI() {
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
