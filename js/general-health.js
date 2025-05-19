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
  const providerLogo = providerLogoMap[test.provider] || 'default-logo.png';
  
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
  const testsGrid = $('.tests-grid');
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
  // Toggle biomarkers
  $all('.toggle-biomarkers').forEach(button => {
    button.addEventListener('click', (e) => {
      const biomarkersList = e.target.closest('.biomarkers-section').querySelector('.biomarkers-list');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      biomarkersList.classList.toggle('hidden');
      button.setAttribute('aria-expanded', !isExpanded);
      button.textContent = isExpanded ? 'Show' : 'Hide';
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
}

// Function to create page structure
function createPageStructure(filterPanel, testsGrid) {
  const mainContent = $('main');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="page-container">
      <aside class="filter-panel">
        ${filterPanel}
      </aside>
      <div class="main-content">
        <div class="tests-grid"></div>
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

// Function to initialize page elements
async function initializePageElements(tests) {
  console.log('initializePageElements called with', tests.length, 'tests');
  
  // Create filter panel with tests data
  const filterPanel = createFilterPanel(tests);
  
  // Create page structure
  createPageStructure(filterPanel, null);
  
  // Get the tests grid
  const testsGrid = $('.tests-grid');
  if (!testsGrid) {
    console.error('Tests grid not found');
    return;
  }
  
  // Update the grid with test cards
  await updateTestGridContent(tests);
  
  // Setup filter panel with tests data and filter function
  setupFilterPanel(tests, (filteredTests) => {
    updateTestGridContent(filteredTests);
  });
}

// Export the main function
export async function displayGeneralHealthPage() {
  try {
    const response = await fetch(getUrl('data/providers.json'));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tests = await response.json();
    await initializePageElements(tests);
  } catch (error) {
    console.error('Error loading general health page:', error);
    const mainContent = $('main');
    if (mainContent) {
      mainContent.innerHTML = createErrorContent();
    }
  }
} 