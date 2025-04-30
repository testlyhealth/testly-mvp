import { setupMenuToggle } from './menu.js';
import { displayCategoryProducts } from './products.js';
import { displayHomePage } from './pages/home.js';
import { displayBlogPage } from './blog.js';
import { displayArticle } from './article.js';
import { displayBloodTestsPage } from './blood-tests.js';
import { $, $all } from './dom.js';
import { initLoginModal } from './login-modal.js';
import { LandingPage } from './components/landing-page.js';
import { initUserDropdown } from './user-dropdown.js';

// Main application router
class Router {
    constructor() {
        this.routes = new Map();
        this.init();
    }

    init() {
        // Handle initial route
        window.addEventListener('load', () => this.handleRoute());
        
        // Handle route changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Register routes
        this.registerRoutes();
    }

    registerRoutes() {
        // Empty string route (homepage) is handled by static HTML
        this.routes.set('blood-tests', this.showBloodTests);
        this.routes.set('category/weight-loss', this.showWeightLoss);
        this.routes.set('category/mens-health', this.showMensHealth);
        this.routes.set('category/womens-health', this.showWomensHealth);
        this.routes.set('category/supplements', this.showSupplements);
    }

    async handleRoute() {
        const hash = window.location.hash.slice(2) || ''; // Remove #/ and get path
        
        // If we're on the homepage (empty hash), don't do anything
        if (!hash) {
            return;
        }

        const handler = this.routes.get(hash);
        
        if (handler) {
            await handler();
        } else {
            this.show404();
        }
    }

    // Route handlers
    async showBloodTests() {
        const main = document.querySelector('main');
        main.innerHTML = '<p>Blood Tests page content loading...</p>';
        // TODO: Load blood tests content
    }

    async showWeightLoss() {
        const main = document.querySelector('main');
        main.innerHTML = '<p>Weight Loss page content loading...</p>';
        // TODO: Load weight loss content
    }

    async showMensHealth() {
        const main = document.querySelector('main');
        main.innerHTML = "<p>Men's Health page content loading...</p>";
        // TODO: Load men's health content
    }

    async showWomensHealth() {
        const main = document.querySelector('main');
        main.innerHTML = "<p>Women's Health page content loading...</p>";
        // TODO: Load women's health content
    }

    async showSupplements() {
        const main = document.querySelector('main');
        main.innerHTML = '<p>Supplements page content loading...</p>';
        // TODO: Load supplements content
    }

    show404() {
        const main = document.querySelector('main');
        main.innerHTML = '<p>Page not found</p>';
    }
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();
    initializeUI();
});

// Firebase auth state observer
window.addEventListener('firebaseReady', () => {
    window.firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is signed in');
            // TODO: Update UI for signed-in user
        } else {
            console.log('No user is signed in');
            // TODO: Update UI for signed-out user
        }
    });
});

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

  // Add click handlers to category links
  $all('.category-list a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryId = e.target.textContent.toLowerCase().replace(/\s+/g, '-');
      window.location.hash = `#/category/${categoryId}`;
    });
  });
});
