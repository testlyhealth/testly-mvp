import { $, $all } from './dom.js';
import { CardService } from './services/cardService.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
import { basket } from './basket.js';

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
    const response = await fetch('data/biomarker-groupings.json');
    const groupings = await response.json();
    
    const grouped = new Map();
    biomarkers.forEach(biomarker => {
      let found = false;
      for (const group of groupings) {
        // Check both regular and advanced biomarkers
        const allBiomarkers = [
          ...(group.biomarkers || []),
          ...(group['advanced-biomarkers'] || [])
        ];
        
        if (allBiomarkers.some(b => b.toLowerCase() === biomarker.toLowerCase())) {
          if (!grouped.has(group.group)) {
            grouped.set(group.group, []);
          }
          grouped.get(group.group).push(biomarker);
          found = true;
          break;
        }
      }
      if (!found) {
        if (!grouped.has('Other')) {
          grouped.set('Other', []);
        }
        grouped.get('Other').push(biomarker);
      }
    });
    
    return grouped;
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
              <button class="toggle-biomarkers" aria-expanded="false">Show</button>
            </div>
          </div>
          <div class="biomarkers-list hidden">
            ${Array.from(groupedBiomarkers.entries()).map(([group, tests]) => `
              <div class="biomarker-group">
                <h5 class="group-header" style="cursor: pointer; padding: 8px; background: #f5f5f5; margin: 4px 0; border-radius: 4px;">
                  ${group} (${tests.length} tests) ▶
                </h5>
                <ul class="biomarker-items hidden" style="padding-left: 20px;">
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

// Function to create test cards HTML
async function createTestCardsHTML(tests) {
  return await cardService.createCards(tests);
}

// Function to update the test grid with new content
async function updateTestGridContent(tests) {
  const testsGrid = $('.tests-grid');
  if (!testsGrid) return;

  const newContent = await createTestCardsHTML(tests);
  testsGrid.innerHTML = newContent;
  
  // Reattach event listeners
  attachEventListeners();
}

// Function to attach event listeners
function attachEventListeners() {
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

  // Details toggle
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

// Function to create the page structure
function createPageStructure(filterPanel, testsGrid) {
  return `
    <div class="general-health-page">
      <div class="filter-panel" id="filter-panel">
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
    <div class="error-container">
      <h2>Error</h2>
      <p>Failed to load the page content. Please try again later.</p>
    </div>
  `;
}

// Function to initialize page elements and event listeners
async function initializePageElements(tests) {
  console.log('initializePageElements called with', tests.length, 'tests');
  const mainContent = $('main');
  if (!mainContent) {
    console.error('Main content container not found');
    return createErrorContent();
  }

  // Create the filter panel
  console.log('Creating filter panel...');
  const filterPanel = createFilterPanel(tests);
  
  // Create the test cards HTML
  console.log('Creating test cards HTML...');
  const testsGrid = await createTestCardsHTML(tests);
  console.log('Test cards HTML created, length:', testsGrid.length);
  
  // Create and set the main content
  console.log('Creating page structure...');
  const content = createPageStructure(filterPanel, testsGrid);
  console.log('Page structure created, length:', content.length);
  
  // Update the main content
  mainContent.innerHTML = content;
  
  // Wait for the DOM to be fully updated
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // Set up event handlers once after the content is in the DOM
  cardService.setupCardEventHandlers(tests);

  // Setup filter panel functionality
  console.log('Setting up filter panel...');
  const filterPanelElement = $('.filter-panel');
  if (filterPanelElement) {
    filterPanelElement.style.height = 'calc(100vh - 64px)'; // Account for header height
    filterPanelElement.style.top = '64px'; // Position below header
  }
  
  setupFilterPanel(tests, async (filteredTests) => {
    console.log('Filter panel callback with', filteredTests.length, 'tests');
    const newContent = await createTestCardsHTML(filteredTests);
    const testsGrid = $('.tests-grid');
    if (testsGrid) {
      testsGrid.innerHTML = newContent;
      // Wait for DOM update before setting up event handlers
      await new Promise(resolve => setTimeout(resolve, 0));
      // Set up event handlers again after updating the content
      cardService.setupCardEventHandlers(filteredTests);
    }
  });

  return content;
}

// Export the display function
export async function displayGeneralHealthPage() {
  try {
    const response = await fetch('/data/providers.json');
    const tests = await response.json();
    return await initializePageElements(tests);
  } catch (error) {
    console.error('Error loading general health page:', error);
    return createErrorContent();
  }
} 