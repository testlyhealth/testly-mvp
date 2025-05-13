import { $, $all } from './dom.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
import { basket } from './basket.js';

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
async function getGroupedBiomarkers(testsIncluded) {
  try {
    const response = await fetch('data/biomarker-groupings.json');
    const groupings = await response.json();
    
    const grouped = new Map();
    testsIncluded.forEach(test => {
      let found = false;
      for (const group of groupings) {
        if (group.biomarkers.includes(test)) {
          if (!grouped.has(group.group)) {
            grouped.set(group.group, []);
          }
          grouped.get(group.group).push(test);
          found = true;
          break;
        }
      }
      if (!found) {
        if (!grouped.has('Other')) {
          grouped.set('Other', []);
        }
        grouped.get('Other').push(test);
      }
    });
    
    return grouped;
  } catch (error) {
    console.error('Error loading biomarker groupings:', error);
    return new Map([['All Tests', testsIncluded]]);
  }
}

// Single source of truth for card creation
async function createTestCard(test, index) {
  const groupedBiomarkers = await getGroupedBiomarkers(test.testsIncluded);
  const providerLogo = providerLogoMap[test.provider] || 'default-logo.png';
  
  return `
    <div class="product-card blood-test-card" data-test-id="${test.id}">
      <div class="test-rank">${index + 1}</div>
      <div class="test-header">
        <div class="provider-info">
          <img src="images/logos/${providerLogo}" alt="${test.provider} logo" class="provider-logo">
          <span class="provider-name">${test.provider}</span>
        </div>
        <h3 class="test-name">${test.name}</h3>
      </div>
      <p>${test.description}</p>
      <div class="test-details">
        <div class="test-price">£${test.price}</div>
        <div class="biomarkers-section">
          <div class="biomarkers-header">
            <div class="biomarker-info">
              <h4>Tests Included: ${test.testsIncluded.length}</h4>
              <button class="toggle-biomarkers" aria-expanded="true">Hide</button>
            </div>
          </div>
          <div class="biomarkers-list">
            ${Array.from(groupedBiomarkers.entries()).map(([group, tests]) => `
              <div class="biomarker-group">
                <h5 class="group-header">${group}</h5>
                <ul>
                  ${tests.map(test => `<li>${test}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="test-locations">
          <h4>Sample Type:</h4>
          <p>${test.sampleType}</p>
        </div>
        <div class="test-results">
          <p>Results in ${test.turnaroundTime}</p>
        </div>
        <button class="toggle-details" aria-expanded="false">Details</button>
        <div class="additional-details hidden">
          <div class="detail-section">
            <h4>Last Updated</h4>
            <p>${test.lastUpdated}</p>
          </div>
          <div class="detail-section">
            <h4>Learn More</h4>
            <a href="${test.url}" target="_blank" class="provider-link">Visit ${test.provider} website</a>
          </div>
        </div>
      </div>
      <button class="add-to-basket" data-test-id="${test.id}">Add to Basket</button>
    </div>
  `;
}

// Function to filter tests based on criteria
function filterTests(tests, filters) {
  return tests.filter(test => {
    // Filter by price range
    if (filters.priceRange) {
      if (test.price < filters.priceRange.min || test.price > filters.priceRange.max) {
        return false;
      }
    }

    // Filter by provider
    if (filters.provider && filters.provider !== 'all') {
      if (test.provider !== filters.provider) {
        return false;
      }
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      if (test.category !== filters.category) {
        return false;
      }
    }

    return true;
  });
}

// Function to attach event listeners to test cards
function attachTestCardEventListeners() {
  // Add event listeners to the toggle buttons
  $all('.toggle-biomarkers').forEach(button => {
    button.addEventListener('click', (e) => {
      const biomarkersList = e.target.closest('.biomarkers-section').querySelector('.biomarkers-list');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      biomarkersList.classList.toggle('hidden');
      button.setAttribute('aria-expanded', !isExpanded);
      button.textContent = isExpanded ? 'Show' : 'Hide';
    });
  });

  // Add event listeners to the details toggle buttons
  $all('.toggle-details').forEach(button => {
    button.addEventListener('click', (e) => {
      const detailsSection = e.target.closest('.test-details').querySelector('.additional-details');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      detailsSection.classList.toggle('hidden');
      button.setAttribute('aria-expanded', !isExpanded);
      button.textContent = isExpanded ? 'Details' : 'Hide details';
    });
  });
}

// Function to create test cards HTML
async function createTestCardsHTML(tests) {
  // Sort tests by price
  const sortedTests = [...tests].sort((a, b) => a.price - b.price);
  
  // Create cards with ranking
  const cards = await Promise.all(sortedTests.map((test, index) => createTestCard(test, index)));
  return cards.join('');
}

// Function to update the test grid with new content
async function updateTestGridContent(tests) {
  const testsGrid = $('.tests-grid');
  if (!testsGrid) return;

  // Update the grid content
  testsGrid.innerHTML = await createTestCardsHTML(tests);
  
  // Wait for the next frame to ensure DOM is updated
  requestAnimationFrame(() => {
    attachTestCardEventListeners();
  });
}

// Function to update the tests grid
async function updateTestsGrid(tests) {
  await updateTestGridContent(tests);
  return `
    <div class="tests-grid">
      ${await createTestCardsHTML(tests)}
    </div>
  `;
}

// Function to create the page structure
function createPageStructure(filterPanel, testsGrid) {
  return `
    <div class="general-health-page">
      <div class="filter-panel">
        ${filterPanel}
      </div>
      <div class="main-content">
        <div class="category-header">
          <h2>General Health Blood Tests</h2>
          <p>Comprehensive blood tests to assess your overall health and wellbeing</p>
        </div>
        <div class="tests-grid">
          ${testsGrid}
        </div>
      </div>
    </div>
  `;
}

// Function to create error content
function createErrorContent() {
  return `
    <div class="error-message">
      <p>Error loading blood tests. Please try again later.</p>
      <button onclick="window.location.reload()">Retry</button>
    </div>
  `;
}

// Function to initialize page elements and event listeners
async function initializePageElements(tests) {
  const mainContent = $('main');
  if (!mainContent) {
    console.error('Main content container not found');
    return createErrorContent();
  }

  // Create the filter panel
  const filterPanel = createFilterPanel(tests);
  
  // Create the test cards HTML
  const testsGrid = await createTestCardsHTML(tests);
  
  // Create and set the main content
  const content = createPageStructure(filterPanel, testsGrid);
  mainContent.innerHTML = content;
  
  // Add event listeners after the content is added to the DOM
  attachTestCardEventListeners();

  // Setup filter panel functionality
  setupFilterPanel(tests, async (filteredTests) => {
    await updateTestGridContent(filteredTests);
  });

  return content;
}

// Initialize the page
export async function displayGeneralHealthPage() {
  try {
    // Fetch the tests data
    const response = await fetch('data/blood-tests/tests.json');
    const data = await response.json();
    const tests = data.tests;
    
    // Initialize page elements and return content
    const content = await initializePageElements(tests);
    if (!content) {
      return createErrorContent();
    }
    return content;
  } catch (error) {
    console.error('Error loading blood tests:', error);
    return createErrorContent();
  }
} 