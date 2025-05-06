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
import Router from './router.js';
import store from './store.js';

// Define routes
const routes = [
  { path: '/blood-tests', template: 'blood-tests.html' },
  { path: '/category/weight-loss', template: 'weight-loss.html' },
  { path: '/category/mens-health', template: 'mens-health.html' },
  { path: '/category/womens-health', template: 'womens-health.html' },
  { path: '/category/supplements', template: 'supplements.html' }
];

// Initialize router
const router = new Router(routes);

// Handle route changes
async function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  
  if (hash === '/blood-tests') {
    try {
      store.setLoading(true);
      const content = await displayBloodTestsPage();
      router.render(content);
    } catch (error) {
      console.error('Error loading blood tests page:', error);
      store.setError('Failed to load blood tests page. Please try again.');
    } finally {
      store.setLoading(false);
    }
  } else {
    const route = routes.find(r => r.path === hash) || routes.find(r => r.path === '*');
    
    if (route) {
      try {
        store.setLoading(true);
        const template = await router.loadTemplate(route.template);
        router.render(template);
      } catch (error) {
        console.error('Error loading route:', error);
        store.setError('Failed to load page. Please try again.');
      } finally {
        store.setLoading(false);
      }
    }
  }
}

// Initialize the application
function initApp() {
  // Set up navigation click handlers
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        window.location.hash = href;
      }
    });
  });

  // Set up login button
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // TODO: Implement login modal
      console.log('Login clicked');
    });
  }

  // Subscribe to state changes
  store.subscribe((state) => {
    // Update UI based on state changes
    updateUI(state);
  });

  // Initialize Firebase auth state listener
  if (window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged((user) => {
      store.setUser(user);
      updateLoginButton(user);
    });
  }

  // Initialize router
  router.init();
}

// Update login button based on auth state
function updateLoginButton(user) {
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    if (user) {
      loginBtn.innerHTML = '<i class="fas fa-user-check"></i>';
      loginBtn.title = 'Account';
      loginBtn.classList.add('signed-in');
    } else {
      loginBtn.innerHTML = '<i class="fas fa-user"></i>';
      loginBtn.title = 'Login';
      loginBtn.classList.remove('signed-in');
    }
  }
}

// Update UI based on state
function updateUI(state) {
  // Update login button
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    if (state.user) {
      loginBtn.innerHTML = '<i class="fas fa-user-check"></i>';
      loginBtn.title = 'Logged in';
    } else {
      loginBtn.innerHTML = '<i class="fas fa-user"></i>';
      loginBtn.title = 'Login';
    }
  }

  // Update cart count if we have a cart button
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    const itemCount = state.cart.reduce((total, item) => total + item.quantity, 0);
    cartBtn.setAttribute('data-count', itemCount);
  }

  // Show loading state
  if (state.loading) {
    document.body.classList.add('loading');
  } else {
    document.body.classList.remove('loading');
  }

  // Show error if any
  if (state.error) {
    showError(state.error);
  }
}

// Show error notification
function showError(message) {
  const existingError = document.querySelector('.error-notification');
  if (existingError) {
    existingError.remove();
  }

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-notification';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Initialize the app when Firebase is ready
window.addEventListener('firebaseReady', initApp);

// Initialize router
router.init();

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
    initializeUI();
    initUserDropdown();
    initApp();
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

  // Handle navigation
  const navLinks = document.querySelectorAll('.main-nav a:not(.logo)');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('href').substring(1);
      window.location.hash = path;
    });
  });

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
