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
import { supabase } from './api/supabase.js';

// Define routes
const routes = [
  { path: '/blood-tests', template: null },
  { path: '/general-health', template: null }, // Special case for general health
  { path: '/advanced', template: null }, // Special case for advanced search
  { path: '/about', template: null }, // Special case for about page
  { path: '/admin', template: null }, // Add admin route
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
  

  
  // Initialize UI components
  initializeUI();
  
  // Initialize login modal
  initLoginModal();
  
  // Initialize user dropdown
  initUserDropdown();
  
  // Setup header scroll behavior
  setupHeaderScrollBehavior();
}

// Setup blood tests menu
function setupBloodTestsMenu() {
  const bloodTestsLink = document.querySelector('.blood-tests-link');
  const bloodTestsMenu = document.querySelector('.blood-tests-menu');

  if (!bloodTestsLink || !bloodTestsMenu) return;

  // Toggle menu on click and prevent navigation
  bloodTestsLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    bloodTestsMenu.classList.toggle('hidden');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!bloodTestsMenu.contains(e.target) && !bloodTestsLink.contains(e.target)) {
      bloodTestsMenu.classList.add('hidden');
    }
  });

  // Close menu when mouse leaves
  bloodTestsMenu.addEventListener('mouseleave', () => {
    bloodTestsMenu.classList.add('hidden');
  });

  // Close menu when navigating to a new page
  window.addEventListener('hashchange', () => {
    bloodTestsMenu.classList.add('hidden');
  });
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





// Setup header scroll behavior
function setupHeaderScrollBehavior() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  let lastScrollTop = 0;
  let isScrolling = false;
  let scrollTimeout;

  // Add initial visible class
  header.classList.add('header-visible');

  function handleScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    clearTimeout(scrollTimeout);
    
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Always show header when at the top
    if (currentScrollTop <= 0) {
      header.classList.remove('header-hidden');
      header.classList.add('header-visible');
    } else {
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollTop > lastScrollTop && currentScrollTop > 64) {
        // Scrolling down and not at top
        header.classList.remove('header-visible');
        header.classList.add('header-hidden');
      } else if (currentScrollTop < lastScrollTop) {
        // Scrolling up
        header.classList.remove('header-hidden');
        header.classList.add('header-visible');
      }
    }
    
    lastScrollTop = currentScrollTop;
    
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 100);
  }

  // Throttle scroll events
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
}

// Start the app
init();

window.addEventListener('DOMContentLoaded', async () => {
  // Check for OAuth code or access_token in URL (fresh login)
  const hasOAuthParams = window.location.search.includes('code=') || window.location.hash.includes('access_token=');
  const { data: { session } } = await supabase.auth.getSession();
  if (session && hasOAuthParams) {
    window.location.hash = '#/admin';
    // Optionally, clean up the URL (remove ?code=...)
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
});
