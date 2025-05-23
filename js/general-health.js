import { $, $all } from './dom.js';
import { CardService } from './services/cardService.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
import { basket } from './basket.js';
import { getUrl } from './config.js';

// Initialize card service
const cardService = new CardService();

// Provider logo mapping
const providerLogoMap = {
  'Numan': 'numan.png',
  'Nuffield Health': 'nuffield.png',
  'London Health Company': 'london health company.png',
  'Lloyds Pharmacy': 'lloyds pharmacy.png',
  'London Medical Laboratory': 'london medical laboratory.png',
  'Selph': 'selph.png',
  'Bluecrest': 'bluecrest.png',
  'Lola': 'lola.png',
  'Superdrug': 'superdrug.png',
  'Thriva': 'thriva.png',
  'Forth': 'forth.png',
  'Medichecks': 'medichecks.png'
};

// Function to get grouped biomarkers
async function getGroupedBiomarkers(biomarkers) {
  try {
    const response = await fetch(getUrl('data/biomarker-groupings.json'));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const groupings = await response.json();
    
    // Create a map of biomarker groups
    const groups = new Map();
    
    // Add all biomarkers to "All Tests" group
    groups.set('All Tests', biomarkers);
    
    // Group biomarkers by their categories
    biomarkers.forEach(biomarker => {
      const category = biomarker.category || 'Uncategorized';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category).push(biomarker);
    });
    
    return groups;
  } catch (error) {
    console.error('Error loading biomarker groupings:', error);
    return new Map([['All Tests', biomarkers]]);
  }
}

// Single source of truth for card creation
async function createTestCard(test, index) {
  const groupedBiomarkers = await getGroupedBiomarkers(test.biomarkers);
  const providerLogo = providerLogoMap[test.provider] || `${test.provider.toLowerCase().replace(/ /g, ' ')}.png`;
  
  // Calculate total number of biomarkers
  const totalBiomarkers = test.biomarkers.length;
  
  return `
    <div class="product-card blood-test-card" data-test-id="${test.test_name}">
      <div class="test-rank">${index + 1}</div>
      <div class="test-header">
        <div class="provider-info">
          <img src="images/logos/${providerLogo}" alt="${test.provider} logo" class="provider-logo">
          <span class="provider-name">${test.provider}</span>
        </div>
        <h3 class="test-name">${test.test_name}</h3>
      </div>
      <p>${test.description}</p>
      <div class="test-details">
        <div class="test-price">£${test.price}</div>
        <div class="biomarkers-section">
          <div class="biomarkers-header">
            <div class="biomarker-info">
              <h4>Tests Included: ${totalBiomarkers}</h4>
              <button class="toggle-all-biomarkers" aria-expanded="false">Show all</button>
            </div>
          </div>
          <div class="biomarkers-list hidden">
            ${Array.from(groupedBiomarkers.entries()).map(([group, tests]) => `
              <div class="biomarker-group">
                <div class="group-header">
                  <h4>${group}</h4>
                  <button class="toggle-biomarkers" aria-expanded="false">
                    <span class="toggle-icon">▼</span>
                  </button>
                </div>
                <ul class="biomarker-items hidden">
                  ${tests.map(test => `<li>${test}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="test-locations">
          <h4>Sample Type:</h4>
          <p>${test['blood test location'].join(', ')}</p>
        </div>
        <div class="test-results">
          <p>Results in ${test['Days till results returned']} days</p>
        </div>
        <button class="toggle-details" aria-expanded="false">Details</button>
        <div class="additional-details hidden">
          <div class="detail-section">
            <h4>Doctor's Report</h4>
            <p>${test['doctors report']}</p>
          </div>
          <div class="detail-section">
            <h4>Lab Accreditations</h4>
            <p>${test['lab accreditations'].join(', ')}</p>
          </div>
          <div class="detail-section">
            <h4>Learn More</h4>
            <a href="${test.link}" target="_blank" class="provider-link">Visit ${test.provider} website</a>
          </div>
        </div>
      </div>
      <button class="add-to-basket" data-test-id="${test.test_name}">Add to Basket</button>
    </div>
  `;
}

// Function to filter tests based on criteria
function filterTests(tests, filters = {}) {
  // If no filters are provided, return all tests
  if (!filters || Object.keys(filters).length === 0) {
    return tests;
  }

  return tests.filter(test => {
    // Filter by price range
    if (filters.priceRange) {
      if (test.price < filters.priceRange.min || test.price > filters.priceRange.max) {
        return false;
      }
    }

    // Filter by provider
    if (filters.providers && filters.providers.length > 0) {
      if (!filters.providers.includes(test.provider)) {
        return false;
      }
    }

    // Filter by location
    if (filters.locations && filters.locations.length > 0) {
      if (!test["blood test location"].some(loc => filters.locations.includes(loc))) {
        return false;
      }
    }

    // Filter by doctor's report
    if (filters.doctorsReport && test["doctors report"] !== "Yes") {
      return false;
    }

    return true;
  });
}

// Function to create test cards HTML
async function createTestCardsHTML(tests) {
  return await cardService.createCards(tests);
}

// Function to update the test grid with new content
async function updateTestGridContent(tests) {
  const testsGrid = $('.products-grid');
  if (!testsGrid) return;

  try {
    const newContent = await cardService.createCards(tests);
    testsGrid.innerHTML = newContent;
    
    // Reattach event listeners
    attachEventListeners(tests);
  } catch (error) {
    console.error('Error creating cards:', error);
    testsGrid.innerHTML = '<div class="error-message">Error loading tests. Please try again later.</div>';
  }
}

// Function to attach event listeners
function attachEventListeners(tests) {
  // Toggle biomarkers (individual group)
    $all('.toggle-biomarkers').forEach(button => {
      button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only toggle the biomarker-items for this group
      const group = button.closest('.biomarker-group');
      const items = group.querySelector('.biomarker-items');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
      items.classList.toggle('hidden', isExpanded);
        button.setAttribute('aria-expanded', !isExpanded);
      button.innerHTML = `<span class=\"toggle-icon\">${isExpanded ? '▼' : '▲'}</span>`;
    });
    });

  // Group headers
    $all('.group-header').forEach(header => {
      header.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const biomarkerItems = header.nextElementSibling;
        const isExpanded = !biomarkerItems.classList.contains('hidden');
        
        biomarkerItems.classList.toggle('hidden');
      header.setAttribute('aria-expanded', !isExpanded);
      
      // Update the header text to show expand/collapse state
      const headerText = header.textContent.split(' (')[0];
      header.textContent = `${headerText} (${biomarkerItems.querySelectorAll('li').length} tests) ${isExpanded ? '▼' : '▶'}`;
    });
  });

  // Toggle details
    $all('.toggle-details').forEach(button => {
      button.addEventListener('click', (e) => {
      const details = e.target.nextElementSibling;
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

      details.classList.toggle('hidden');
        button.setAttribute('aria-expanded', !isExpanded);
      button.textContent = isExpanded ? 'Show Details' : 'Hide Details';
    });
  });

  // Add to basket buttons
  $all('.add-to-basket').forEach(button => {
    button.addEventListener('click', (e) => {
      const testId = e.target.dataset.testId;
      const test = tests.find(t => t.test_name === testId);
      if (test) {
        const event = new CustomEvent('addToBasket', { detail: { test } });
        document.dispatchEvent(event);
      }
    });
  });

  // Toggle all biomarkers (Show all/Hide all)
  $all('.toggle-all-biomarkers').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const biomarkersSection = e.target.closest('.biomarkers-section');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      // Toggle all biomarker items and their toggle buttons
      biomarkersSection.querySelectorAll('.biomarker-group').forEach(group => {
        const items = group.querySelector('.biomarker-items');
        const toggle = group.querySelector('.toggle-biomarkers');
        if (items && toggle) {
          items.classList.toggle('hidden', isExpanded);
          toggle.setAttribute('aria-expanded', !isExpanded);
          toggle.innerHTML = `<span class="toggle-icon">${isExpanded ? '▼' : '▲'}</span>`;
        }
      });
      // Update the "Show all" button
      button.setAttribute('aria-expanded', !isExpanded);
      button.textContent = isExpanded ? 'Show all' : 'Hide all';
    });
  });
}

// Function to create general health title
function createGeneralHealthTitle() {
  return `
    <section class="general-health-title-section">
      <h1 class="general-health-title">
        Compare and book blood tests
      </h1>
      <p class="general-health-subheading">
        <strong>General health:</strong> Blood tests from accredited labs covering the health of your <strong class="gh-em">heart</strong>, <strong class="gh-em">liver</strong>, <strong class="gh-em">kidneys</strong>, <strong class="gh-em">cholesterol</strong>, <strong class="gh-em">vitamins</strong> and more.
      </p>
    </section>
  `;
}

// Function to create page structure
function createPageStructure(filterPanel, testsGrid) {
  return `
    <div class="page-container">
      <aside class="filter-panel">
        ${filterPanel}
      </aside>
      <div class="main-content">
        ${createGeneralHealthTitle()}
        <div class="products-grid"></div>
      </div>
    </div>
  `;
}

// Function to create error content
function createErrorContent() {
  return `
    <div class="error-container">
      <h2>Error Loading Content</h2>
      <p>We're having trouble loading the tests. Please try again later.</p>
    </div>
  `;
}

// Function to inject the Filters button on mobile
function injectMobileFiltersButton(retryCount = 0) {
  if (window.innerWidth > 768) return;
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  // Prevent duplicate button
  if (mainContent.querySelector('.filters-btn.mobile-only')) return;
  const btn = document.createElement('button');
  btn.className = 'filters-btn mobile-only';
  btn.setAttribute('aria-label', 'Open filters');
  btn.textContent = 'Filters';
  // Insert button after the title section
  const titleSection = mainContent.querySelector('.general-health-title-section');
  if (titleSection && titleSection.nextSibling) {
    mainContent.insertBefore(btn, titleSection.nextSibling);
  } else {
    mainContent.appendChild(btn);
  }
  console.log('[injectMobileFiltersButton] Injected Filters button');

  // Setup open/close logic for the mobile filter panel
  const mobilePanel = document.querySelector('.mobile-filter-panel');
  const closeBtn = document.querySelector('.close-mobile-filter');
  const filterPanel = document.querySelector('.filter-panel');
  const mobileContent = document.querySelector('.mobile-filter-content');
  if (!mobilePanel || !closeBtn || !mobileContent) {
    console.log('[injectMobileFiltersButton] Missing mobilePanel, closeBtn, or mobileContent');
    return;
  }
  if (!filterPanel) {
    console.log('[injectMobileFiltersButton] .filter-panel not found, retryCount:', retryCount);
    // Retry up to 10 times with a short delay
    if (retryCount < 10) {
      setTimeout(() => injectMobileFiltersButton(retryCount + 1), 100);
    }
    return;
  }
  console.log('[injectMobileFiltersButton] Found .filter-panel, setting up open/close logic');

  // Store the original parent and next sibling of the filter panel
  const originalParent = filterPanel.parentNode;
  const originalNextSibling = filterPanel.nextSibling;

  function openPanel() {
    console.log('[openPanel] Moving filterPanel into mobile overlay');
    // Move the filter panel into the mobile overlay
    mobileContent.appendChild(filterPanel);
    mobilePanel.classList.remove('hidden');
    mobilePanel.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closePanel() {
    console.log('[closePanel] Moving filterPanel back to original location');
    // Move the filter panel back to its original location
    if (originalNextSibling) {
      originalParent.insertBefore(filterPanel, originalNextSibling);
    } else {
      originalParent.appendChild(filterPanel);
    }
    mobilePanel.classList.remove('visible');
    mobilePanel.classList.add('hidden');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    if (mobilePanel.classList.contains('visible')) {
      closePanel();
    } else {
      openPanel();
    }
  });
  closeBtn.addEventListener('click', closePanel);
  // Optional: close on overlay click
  mobilePanel.addEventListener('click', (e) => {
    if (e.target === mobilePanel) closePanel();
  });
}

// Function to initialize page elements
async function initializePageElements(tests) {
  console.log('Initializing page elements with', tests.length, 'tests');
  // Get the tests grid
  const testsGrid = $('.products-grid');
  if (!testsGrid) {
    console.error('Products grid not found');
    return;
  }
  // Create cards using CardService
  const cards = await cardService.createCards(tests);
  testsGrid.innerHTML = cards;
  // Initialize filter panel
  setupFilterPanel(tests, (filteredTests) => {
    updateTestGridContent(filteredTests);
  });
  // Dispatch event after filter panel is rendered
  setTimeout(() => {
    document.dispatchEvent(new Event('filterPanelReady'));
  }, 0);
}

// Listen for the filterPanelReady event to set up mobile filter logic
if (!window._filterPanelReadyListenerAdded) {
  document.addEventListener('filterPanelReady', () => {
    injectMobileFiltersButton();
  });
  window._filterPanelReadyListenerAdded = true;
}

// SPA-safe: Use MutationObserver to watch for .filter-panel
function observeFilterPanelForMobile() {
  if (window.innerWidth > 768) return;
  const observer = new MutationObserver((mutations, obs) => {
    const filterPanel = document.querySelector('.filter-panel');
    if (filterPanel) {
      console.log('[MutationObserver] .filter-panel detected in DOM');
      injectMobileFiltersButton();
      obs.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('[observeFilterPanelForMobile] Started observing for .filter-panel');
}

// Call the observer on script load (or after navigation)
observeFilterPanelForMobile();

// Export the main function
export async function displayGeneralHealthPage() {
  try {
    const response = await fetch(getUrl('data/providers.json'));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tests = await response.json();
    
    // Create filter panel with tests data
    const filterPanel = createFilterPanel(tests);
    
    // Create and return the page structure
    const content = createPageStructure(filterPanel, null);
    
    // Store tests data in a global variable for later use (never delete)
    window._allGeneralHealthTests = tests;
    
    // Add a custom event listener for when the content is rendered
    document.addEventListener('contentRendered', () => {
      if (window._allGeneralHealthTests) {
        initializePageElements(window._allGeneralHealthTests);
      }
    }, { once: true });
    
    return content;
  } catch (error) {
    console.error('Error loading general health page:', error);
    return createErrorContent();
  }
} 