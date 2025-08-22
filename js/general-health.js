import { $, $all } from './dom.js';
import { CardService } from './services/cardService.js';
import { basket } from './basket.js';
import { getUrl } from './config.js';
import { supabase } from './api/supabase.js';
import { bloodTestOverlay } from './components/blood-test-overlay.js';
console.log('bloodTestOverlay imported:', bloodTestOverlay);

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
  'Medichecks': 'medichecks.png',
  'Blue horizon blood tests': 'blue horizon blood tests.png',
  'Blood Tests London': 'bloodtestslondon.png',
  'Goodbody Clinic': 'goodbodyclinic.png',
  'One day tests': 'one day tests.png'
};

// Store sort direction and test lists globally
let sortAscending = true;
let filteredTests = [];
let currentTests = [];

// Expose sort state to global scope for filter panel access
window.sortAscending = sortAscending;
window.sortType = 'relevance'; // Default sort type

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
  // Use the enriched biomarker data instead of the old test.biomarkers
  const biomarkerNames = test.biomarker_names || [];
  const groupedBiomarkers = test.grouped_biomarkers || {};

  const providerLogo = providerLogoMap[test.provider] || `${test.provider.toLowerCase().replace(/ /g, '')}.png`;
  
  // Calculate total number of biomarkers
  const totalBiomarkers = biomarkerNames.length;
  
  // Truncate description to approximately 4 lines (roughly 200 characters)
  const maxDescriptionLength = 200;
  let truncatedDescription = test.description;
  if (test.description.length > maxDescriptionLength) {
    // Find the last complete word within the limit
    const truncated = test.description.substring(0, maxDescriptionLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      truncatedDescription = truncated.substring(0, lastSpaceIndex) + '...';
    } else {
      truncatedDescription = truncated + '...';
    }
  }
  
  return `
    <div class="product-card blood-test-card" data-test-id="${test.id}">
      <div class="test-rank">${index + 1}</div>
      <div class="test-header">
        <div class="provider-info">
          <img src="images/logos/${providerLogo}" alt="${test.provider} logo" class="provider-logo">
          <span class="provider-name">${test.provider}</span>
        </div>
        <h3 class="test-name">${test.test_name}</h3>
      </div>
      <p class="description-limited">${truncatedDescription}</p>
      <div class="test-details">
        <div class="test-price">£${test.price}</div>
        <div class="biomarkers-section">
          <div class="biomarkers-header">
            <div class="biomarker-info">
              <h4>${totalBiomarkers} biomarkers included</h4>
              <button class="toggle-all-biomarkers" aria-expanded="false">Show all</button>
            </div>
          </div>
          <div class="biomarkers-list hidden">
            ${Object.entries(groupedBiomarkers).map(([group, biomarkers]) => `
              <div class="biomarker-group">
                <div class="group-header">
                  <h4>${group}</h4>
                  <button class="toggle-biomarkers" aria-expanded="false">
                    <span class="toggle-icon">▼</span>
                  </button>
                </div>
                <ul class="biomarker-items hidden">
                  ${biomarkers.map(biomarker => `<li>${biomarker}</li>`).join('')}
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
        <div class="card-actions">
          <button class="toggle-details" aria-expanded="false">Details</button>
          <button class="add-to-basket" data-test-id="${test.id}">Add to Basket</button>
        </div>
      </div>
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

// Shared function to apply male hormone check filtering (same logic as results page)
export function applyMaleHormoneCheckFilter(tests) {
  console.log('Applying male hormone check filter (shared function)');
  
  // Define the required biomarkers for male hormone check
  const requiredBiomarkers = ['Testosterone', 'Free testosterone', 'SHBG'];
  
  return tests.filter(test => {
    const testBiomarkerNames = test.biomarker_names || [];
    
    // Check if the test has ALL the required biomarkers (same logic as results page)
    const hasAllRequiredBiomarkers = requiredBiomarkers.every(requiredBiomarker => 
      testBiomarkerNames.some(biomarker => 
        biomarker && biomarker.toLowerCase().includes(requiredBiomarker.toLowerCase())
      )
    );
    
    // Additional filter: test must have 10 or fewer total biomarkers
    const hasLimitedBiomarkers = testBiomarkerNames.length <= 10;
    
    if (hasAllRequiredBiomarkers && hasLimitedBiomarkers) {
      console.log(`✅ SHARED FUNCTION INCLUDED: Test "${test.name}" (ID: ${test.id}) - has required biomarkers and ≤10 total biomarkers (${testBiomarkerNames.length})`);
    } else if (hasAllRequiredBiomarkers && !hasLimitedBiomarkers) {
      console.log(`❌ SHARED FUNCTION EXCLUDED: Test "${test.name}" (ID: ${test.id}) - has required biomarkers but >10 total biomarkers (${testBiomarkerNames.length})`);
    } else {
      console.log(`❌ SHARED FUNCTION EXCLUDED: Test "${test.name}" (ID: ${test.id}) - missing required biomarkers`);
    }
    
    return hasAllRequiredBiomarkers && hasLimitedBiomarkers;
  });
}

// Function to create test cards HTML
async function createTestCardsHTML(tests) {
  return await cardService.createCards(tests);
}

// Function to sort tests by price
function sortTests(tests, ascending = true) {
  const sorted = [...tests].sort((a, b) => {
    const priceA = typeof a.price === 'number' ? a.price : Number(String(a.price).replace(/[^\d.]/g, ''));
    const priceB = typeof b.price === 'number' ? b.price : Number(String(b.price).replace(/[^\d.]/g, ''));
    return ascending ? priceA - priceB : priceB - priceA;
  });
  return sorted;
}

    // Function to update sort button text
  function updateSortButtonText(sortType) {
    const sortBtn = document.querySelector('.sort-btn.mobile-only');
    if (sortBtn) {
      // For mobile, we'll keep the simple price up/down logic
      const isAscending = sortType === 'price-asc';
      if (sortType === 'relevance') {
        sortBtn.innerHTML = 'Sort: Relevance';
      } else {
        sortBtn.innerHTML = `Sort: Price ${isAscending ? '&#8593;' : '&#8595;'}`;
      }
    }
  
      // Update desktop sort button if it exists
    const desktopSortBtn = document.querySelector('.sort-btn');
    if (desktopSortBtn) {
      switch (sortType) {
        case 'price-asc':
          desktopSortBtn.innerHTML = 'Sort: Price <span class="sort-arrow">▲</span>';
          break;
        case 'price-desc':
          desktopSortBtn.innerHTML = 'Sort: Price <span class="sort-arrow">▼</span>';
          break;
        case 'relevance':
          desktopSortBtn.innerHTML = 'Sort: Relevance';
          break;
      }
    }
}

// Sort callback function for filter panel
function handleSortChange(sortType) {
  window.sortType = sortType;
  
  let sorted;
  switch (sortType) {
    case 'price-asc':
      sortAscending = true;
      window.sortAscending = true;
      sorted = sortTests(filteredTests, true);
      break;
    case 'price-desc':
      sortAscending = false;
      window.sortAscending = false;
      sorted = sortTests(filteredTests, false);
      break;
    case 'relevance':
      // For relevance, we'll keep the original order or implement relevance logic
      sorted = [...filteredTests];
      break;
    default:
      sorted = sortTests(filteredTests, true);
  }
  
  currentTests = sorted;
  updateTestGridContent(currentTests);
  updateSortButtonText(sortType);
}

// Function to update the test grid with new content
async function updateTestGridContent(tests) {
  const testsGrid = $('.products-grid');
  if (!testsGrid) return;
  try {
    // Always use the enriched objects for rendering
    const enriched = tests.map(f => (window._allGeneralHealthTests || []).find(t => t.id === f.id) || f);
    
    // Create cards with selection state - first card is selected by default
    const cardsWithSelection = enriched.map((test, index) => ({
      ...test,
      isSelected: index === 0 // First card is selected by default
    }));
    
    const newContent = await cardService.createCards(cardsWithSelection);
    testsGrid.innerHTML = newContent;
    currentTests = enriched;
    
    // Setup event handlers for the cards
    cardService.setupCardEventHandlers(cardsWithSelection);
    
    // Update filter tags with results count and sort button
    const filterTagsContainer = document.querySelector('.filter-tags');
    // REMOVE the following block that sets filterTagsContainer.innerHTML directly
    // if (filterTagsContainer) {
    //   const filterTagsList = filterTagsContainer.querySelector('.filter-tags-list');
    //   if (filterTagsList) {
    //     // Get current filter tags HTML
    //     const currentTags = filterTagsList.innerHTML;
    //     // Create results count and sort button HTML
    //     const resultsCountHTML = `
    //       <div class="results-controls">
    //         <div class="results-count">
    //           <span>${enriched.length} result${enriched.length !== 1 ? 's' : ''}</span>
    //         </div>
    //         <div class="sort-dropdown desktop-only">
    //           <button class="sort-btn" aria-label="Sort results" aria-expanded="false">
    //             Sort: Relevance
    //           </button>
    //           <div class="sort-dropdown-menu" style="display: none;">
    //             <button class="sort-option" data-sort="relevance">Sort by relevance</button>
    //             <button class="sort-option" data-sort="price-asc">Sort by price: Low to high</button>
    //             <button class="sort-option" data-sort="price-desc">Sort by price: High to low</button>
    //           </div>
    //         </div>
    //       </div>
    //     `;
    //     // Update the container
    //     filterTagsContainer.innerHTML = `
    //       <div class="filter-tags-list">
    //         ${currentTags}
    //       </div>
    //       ${resultsCountHTML}
    //     `;
        
    //     // Add event listener to the new sort dropdown
    //     const sortDropdown = filterTagsContainer.querySelector('.sort-dropdown.desktop-only');
    //     if (sortDropdown) {
    //       const sortBtn = sortDropdown.querySelector('.sort-btn');
    //       const dropdownMenu = sortDropdown.querySelector('.sort-dropdown-menu');
    //       const sortOptions = dropdownMenu.querySelectorAll('.sort-option');
              
    //       // Get current sort state from global variable or default to relevance
    //       const currentSortType = window.sortType !== undefined ? window.sortType : 'relevance';
              
    //       // Update button text based on current sort
    //       updateSortButtonText(sortBtn, currentSortType);
              
    //       // Toggle dropdown on button click
    //       sortBtn.addEventListener('click', (e) => {
    //         e.stopPropagation();
    //         const isExpanded = sortBtn.getAttribute('aria-expanded') === 'true';
    //         sortBtn.setAttribute('aria-expanded', !isExpanded);
    //         dropdownMenu.style.display = isExpanded ? 'none' : 'block';
    //       });
              
    //       // Handle sort option clicks
    //       sortOptions.forEach(option => {
    //         option.addEventListener('click', (e) => {
    //           e.stopPropagation();
    //           const sortType = option.getAttribute('data-sort');
    //           window.sortType = sortType;
              
    //           // Update button text
    //           updateSortButtonText(sortBtn, sortType);
              
    //           // Close dropdown
    //           sortBtn.setAttribute('aria-expanded', 'false');
    //           dropdownMenu.style.display = 'none';
              
    //           // Handle sort change
    //           handleSortChange(sortType);
    //         });
    //       });
              
    //       // Close dropdown when clicking outside
    //       document.addEventListener('click', (e) => {
    //         if (!sortDropdown.contains(e.target)) {
    //           sortBtn.setAttribute('aria-expanded', 'false');
    //           dropdownMenu.style.display = 'none';
    //         }
    //       });
    //     }
        
    //     // Helper function to update sort button text
    //     function updateSortButtonText(button, sortType) {
    //       switch (sortType) {
    //         case 'price-asc':
    //           button.innerHTML = 'Sort: Price <span class="sort-arrow">▲</span>';
    //           break;
    //         case 'price-desc':
    //           button.innerHTML = 'Sort: Price <span class="sort-arrow">▼</span>';
    //           break;
    //         case 'relevance':
    //           button.innerHTML = 'Sort: Relevance';
    //           break;
    //       }
    //     }
    //   }
    // }
    
    attachEventListeners();
  } catch (error) {
    console.error('Error creating cards:', error);
    testsGrid.innerHTML = '<div class="error-message">Error loading tests. Please try again later.</div>';
  }
}

// Function to attach event listeners
function attachEventListeners() {
  let lastHoveredCard = null;
  let hasInteracted = false;
  
  // Ensure first card is selected by default
  const firstCard = document.querySelector('.blood-test-card');
  if (firstCard && !firstCard.classList.contains('selected')) {
    firstCard.classList.add('selected');
    lastHoveredCard = firstCard;
  }
  
  // Card hover and selection
  $all('.blood-test-card').forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      hasInteracted = true;
      
      // Remove selection from all cards
      $all('.blood-test-card').forEach(c => c.classList.remove('selected'));
      
      // Add selection to hovered card
      card.classList.add('selected');
      lastHoveredCard = card;
    });
    
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on buttons or interactive elements
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.toggle-biomarkers') || e.target.closest('.toggle-all-biomarkers') || e.target.closest('.add-to-compare-checkbox') || e.target.closest('.add-to-compare-label')) {
        return;
      }
      
      // Get the test ID and find the test data
      const testId = card.dataset.testId;
      console.log('🔍 Card clicked! testId:', testId);
      console.log('🔍 window._allGeneralHealthTests:', window._allGeneralHealthTests);
      
      const test = window._allGeneralHealthTests.find(t => t.id == testId);
      console.log('🔍 Found test:', test);
      
      if (test) {
        console.log('🔍 Opening overlay for:', test.name);
        // Make sure overlay is created before opening
        if (!bloodTestOverlay.overlay) {
          console.log('🔍 Creating overlay...');
          bloodTestOverlay.create();
        }
        console.log('🔍 About to call bloodTestOverlay.open...');
        bloodTestOverlay.open(test);
      } else {
        console.log('🔍 No test found for ID:', testId);
      }
    });
  });

  // Sort button
  const sortBtn = document.querySelector('.sort-btn.mobile-only');
  if (sortBtn) {
    const newSortBtn = sortBtn.cloneNode(true);
    sortBtn.parentNode.replaceChild(newSortBtn, sortBtn);
    newSortBtn.addEventListener('click', () => {
      sortAscending = !sortAscending;
      window.sortAscending = sortAscending;
      const sorted = sortTests(filteredTests, sortAscending);
      currentTests = sorted;
      updateTestGridContent(currentTests);
      updateSortButtonText(sortAscending);
    });
    updateSortButtonText(sortAscending);
  }

  // Toggle biomarkers (individual group) - REMOVED: Handled by cardService.js
  // Group headers - REMOVED: Handled by cardService.js

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
      const test = currentTests.find(t => t.id == testId);
      if (test) {
        const event = new CustomEvent('addToBasket', { detail: { test } });
        document.dispatchEvent(event);
      }
    });
  });

  // Toggle all biomarkers (Show all/Hide all) - REMOVED: Handled by cardService.js
}

// Function to create general health title
function createGeneralHealthTitle() {
  return ``; // Removed hero header and subtext
}

// Function to create page structure
function createPageStructure(filterPanel, testsGrid) {
  return `
    <div class="page-container">
      ${createGeneralHealthTitle()}
      <div class="filter-tags"></div>
      <div class="results-container">
        <div class="main-content">
          <div class="products-grid"></div>
        </div>
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
async function initializePageElements(tests, selectedProblem = null, skipFilterPanel = false) {
  console.log('🔍 INITIALIZE PAGE ELEMENTS - Starting with', tests.length, 'tests');
  console.log('🔍 Selected problem passed to initializePageElements:', selectedProblem);
  const testsGrid = $('.products-grid');
  if (!testsGrid) {
    console.error('Products grid not found');
    return;
  }
  
  // Set up global sort callback
  window.sortCallback = handleSortChange;
  
  console.log('🔍 BEFORE SORTING - Tests count:', tests.length);
  filteredTests = tests;
  currentTests = sortTests(filteredTests, sortAscending);
  console.log('🔍 AFTER SORTING - Current tests count:', currentTests.length);
  console.log('🔍 ABOUT TO CREATE CARDS - Tests count:', currentTests.length);
  const cards = await cardService.createCards(currentTests);
  testsGrid.innerHTML = cards;
  
  // Set up event handlers for the newly created cards
  cardService.setupCardEventHandlers(currentTests);
  
  // Create or update filter tags container
  let filterTagsContainer = document.querySelector('.filter-tags');
  if (!filterTagsContainer) {
    // Create filter tags container if it doesn't exist
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const filterTagsDiv = document.createElement('div');
      filterTagsDiv.className = 'filter-tags';
      mainContent.insertBefore(filterTagsDiv, mainContent.firstChild);
      filterTagsContainer = filterTagsDiv;
    }
  }
  
  if (filterTagsContainer) {
    // Get URL parameters to show applied filters
    const hash = window.location.hash;
    const appliedFilters = [];
    
    // Check for testosterone option (always show first if present)
    const testosteroneOptionMatch = hash.match(/[?&]testosteroneOption=([^&]+)/);
    if (testosteroneOptionMatch) {
      const selectedTestosteroneOption = decodeURIComponent(testosteroneOptionMatch[1]);
      let displayText = '';
      
      switch (selectedTestosteroneOption) {
        case 'testosterone-only':
          displayText = 'Testosterone only';
          break;
        case 'testosterone-full-hormone-only':
          displayText = 'Male hormone check only (includes testosterone)';
          break;
        case 'testosterone-full-hormone':
          displayText = 'Male hormone check + general health check';
          break;
        case 'trt-monitoring':
          displayText = 'TRT monitoring';
          break;
        default:
          displayText = selectedTestosteroneOption.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      appliedFilters.push({
        type: 'testosterone-option',
        value: selectedTestosteroneOption,
        display: displayText
      });
    }
    
    // Check for biomarkers (individual selections from "Let me pick" side)
    const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
    if (biomarkerMatch) {
      const biomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim().replace(/\+/g, ' ')).filter(Boolean);
      
      // Only add biomarker tags if no testosterone option is selected (to avoid duplicates)
      if (!testosteroneOptionMatch) {
        biomarkers.forEach(biomarker => {
          appliedFilters.push({
            type: 'biomarker',
            value: biomarker,
            display: biomarker
          });
        });
      }
    }
    
    // Check for method filter
    const methodMatch = hash.match(/[?&]method=([^&]+)/);
    if (methodMatch) {
      const methodValue = decodeURIComponent(methodMatch[1]).replace(/\+/g, ' ');
      appliedFilters.push({
        type: 'method',
        value: methodValue,
        display: methodValue
      });
    }
    
    // Check for min price filter
    const minPriceMatch = hash.match(/[?&]minPrice=([^&]+)/);
    if (minPriceMatch) {
      const minPriceValue = decodeURIComponent(minPriceMatch[1]);
      appliedFilters.push({
        type: 'minPrice',
        value: minPriceValue,
        display: `Min: £${minPriceValue}`
      });
    }
    
    // Check for max price filter
    const maxPriceMatch = hash.match(/[?&]maxPrice=([^&]+)/);
    if (maxPriceMatch) {
      const maxPriceValue = decodeURIComponent(maxPriceMatch[1]);
      appliedFilters.push({
        type: 'maxPrice',
        value: maxPriceValue,
        display: `Max: £${maxPriceValue}`
      });
    }
    
    const providerMatch = hash.match(/[?&]provider=([^&]+)/);
    if (providerMatch) {
      const providerValue = decodeURIComponent(providerMatch[1]).replace(/\+/g, ' ');
      appliedFilters.push({
        type: 'provider',
        value: providerValue,
        display: `Provider: ${providerValue}`
      });
    }
    

    

    
    // Check for filter panel filters
    const filterMatch = hash.match(/[?&]filter=([^&]+)/);
    if (filterMatch) {
      const filters = decodeURIComponent(filterMatch[1]).split(',').map(f => f.trim()).filter(Boolean);
      filters.forEach(filter => {
        appliedFilters.push({
          type: 'category',
          value: filter,
          display: `Category: ${filter}`
        });
      });
    }
    
    // Create filter tags HTML with proper data attributes
    const filterTagsHTML = appliedFilters.map(filter => `
      <div class="filter-tag" data-type="${filter.type}" data-value="${filter.value}">
        <span>${filter.display}</span>
        <button class="remove-tag" aria-label="Remove filter">×</button>
      </div>
    `).join('');
    
    
    console.log('Tests length:', tests.length);
    console.log('Applied filters:', appliedFilters);
    
    const resultsCountHTML = `
      <div class="filter-tags-container">
        <div class="filter-tags-list">
          ${filterTagsHTML}
        </div>
        <div class="results-controls">
          <div class="results-count">
            <span>${tests.length} result${tests.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="filter-button desktop-only">
            <button class="filter-btn" aria-label="Open filters">
              Filters
            </button>
          </div>
          <div class="sort-button desktop-only">
            <button class="sort-btn" aria-label="Sort by price">
              Price: Low to High
            </button>
          </div>
        </div>
      </div>
    `;
    
    console.log('🔍 FIRST INSTANCE - Setting filter tags container HTML');
    filterTagsContainer.innerHTML = resultsCountHTML;
    console.log('🔍 FIRST INSTANCE - Filter tags container HTML set');
    
    // Set up event delegation for remove tag buttons
    const filterTagsList = filterTagsContainer.querySelector('.filter-tags-list');
    if (filterTagsList) {
      filterTagsList.addEventListener('click', (e) => {
        const button = e.target.closest('.remove-tag');
        if (!button) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const tag = button.closest('.filter-tag');
        if (!tag) return;
        
        const type = tag.dataset.type;
        const value = tag.dataset.value;
        console.log('Removing filter tag:', type, value);
        
        // Parse current URL parameters
        let [base, paramStr] = window.location.hash.split('?');
        base = base || '#/search-results';
        let params = new URLSearchParams(paramStr || '');
        
        // Remove the specific filter
        if (type === 'minPrice') {
          params.delete('minPrice');
        } else if (type === 'maxPrice') {
          params.delete('maxPrice');
        } else if (type === 'provider') {
          params.delete('provider');
        } else if (type === 'method') {
          params.delete('method');
        } else if (type === 'testosterone-option') {
          // Remove testosterone option
          params.delete('testosteroneOption');
        } else if (type === 'biomarker') {
          // Remove specific biomarker from biomarkers parameter
          let biomarkerVal = params.get('biomarkers') || '';
          let biomarkers = biomarkerVal.split(',').map(b => b.trim()).filter(Boolean);
          biomarkers = biomarkers.filter(b => b !== value);
          if (biomarkers.length > 0) {
            params.set('biomarkers', biomarkers.join(','));
          } else {
            params.delete('biomarkers');
          }
        } else if (type === 'male-hormone-check') {
          console.log('🎯 MALE HORMONE CHECK TAG REMOVAL TRIGGERED - LEGACY CODE');
          // Legacy handling - remove ALL biomarkers and special parameters
          params.delete('biomarkers');
          params.delete('testosteroneFullHormoneOnly');
          params.delete('testosteroneFullHormone');
          params.delete('testosteroneOnly');
          console.log('🎯 Parameters after removal:', params.toString());
        } else if (type === 'category') {
          // Remove specific category from filter parameter
          let filterVal = params.get('filter') || '';
          let filters = filterVal.split(',').map(f => f.trim()).filter(Boolean);
          filters = filters.filter(f => f !== value);
          if (filters.length > 0) {
            params.set('filter', filters.join(','));
          } else {
            params.delete('filter');
          }
        }
        
        // Remove empty params
        for (const [key, val] of params.entries()) {
          if (!val) params.delete(key);
        }
        
        // Rebuild hash and navigate
        const newHash = params.toString() ? `${base}?${params.toString()}` : base;
        window.location.hash = newHash;
      });
    }


    
    // Set up sort button click handler
    const sortBtn = filterTagsContainer.querySelector('.sort-btn');
    if (sortBtn) {
      sortBtn.addEventListener('click', () => {
        const currentText = sortBtn.textContent;
        let newSortType;
        
        if (currentText.includes('Low to High')) {
          // Currently low to high, switch to high to low
          newSortType = 'price-desc';
          sortBtn.textContent = 'Price: High to Low';
        } else {
          // Currently high to low, switch to low to high
          newSortType = 'price-asc';
          sortBtn.textContent = 'Price: Low to High';
        }
        
        // Sort the tests
        const sortedTests = sortTests(window._allGeneralHealthTests, newSortType === 'price-asc');
        
        // Update the test grid with sorted results
        updateTestGridContent(sortedTests);
        
        console.log(`Sorted tests by ${newSortType}, showing ${sortedTests.length} results`);
      });
    }
    
    // Set up filter button click handler
    const filterBtn = filterTagsContainer.querySelector('.filter-btn');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        const filterOverlay = document.querySelector('.filter-overlay');
        if (filterOverlay) {
          filterOverlay.style.display = 'flex';
        }
      });
    }
  }
}

// --- New: Fetch and enrich tests with biomarkers and groupings ---
async function fetchAndEnrichTests({ category = null, categoryId = null, provider = null } = {}) {
  console.log(`DEBUG: fetchAndEnrichTests called with:`, { category, categoryId, provider });
  let tests = [];
  // 1. Fetch tests (with provider info, filtered by category/provider if needed)
  if (category || categoryId) {
    let allTestIds = [];
    
    if (categoryId) {
      // Use category ID directly
      console.log('Using category ID:', categoryId);
      const { data: linkRows, error: linkError } = await supabase
        .from('blood_test_category_link_table')
        .select('provider_blood_test_id')
        .eq('blood_test_category_id', categoryId);
      if (linkError) {
        console.error('Error fetching link rows:', linkError);
        throw linkError;
      }
      const testIds = linkRows.map(row => row.provider_blood_test_id);
      console.log('Tests found for category ID', categoryId, ':', testIds.length);
      allTestIds = testIds;
    } else if (category) {
      // Handle multiple categories (comma-separated)
      const categories = category.split(',').map(cat => cat.trim());
      console.log('Looking for categories in database:', categories);
      
      // Fetch tests for each category
      for (const singleCategory of categories) {
      console.log('Looking for category:', singleCategory);
      const { data: catRows, error: catError } = await supabase
        .from('blood_test_categories')
        .select('id')
        .eq('name', singleCategory);
      if (catError) {
        console.error('Error fetching category:', catError);
        throw catError;
      }
      console.log('Category found:', singleCategory, 'ID:', catRows[0]?.id, 'Rows:', catRows.length);
      console.log('All category rows:', catRows);
      const categoryId = catRows[0]?.id;
      if (categoryId) {
        const { data: linkRows, error: linkError } = await supabase
          .from('blood_test_category_link_table')
          .select('provider_blood_test_id')
          .eq('blood_test_category_id', categoryId);
        if (linkError) {
          console.error('Error fetching link rows:', linkError);
          throw linkError;
        }
        const testIds = linkRows.map(row => row.provider_blood_test_id);
        console.log('Tests found for category', singleCategory, ':', testIds.length);
        allTestIds = [...allTestIds, ...testIds];
      }
    }
    }
    
    // Remove duplicates
    allTestIds = [...new Set(allTestIds)];
    console.log('Total unique test IDs found:', allTestIds.length);
    console.log('DEBUG: allTestIds sample:', allTestIds.slice(0, 10));
    console.log('DEBUG: allTestIds full array:', allTestIds);
    
    if (allTestIds.length > 0) {
      let query = supabase.from('provider_blood_tests').select('*, provider:providers(name)').in('id', allTestIds);
      if (provider) {
        // Get provider ID from name
        const { data: providerRows, error: providerError } = await supabase
          .from('providers')
          .select('id')
          .eq('name', provider);
        if (!providerError && providerRows && providerRows.length > 0) {
          query = query.eq('provider_id', providerRows[0].id);
        }
      }
      const { data: testRows, error: testError } = await query;
      if (testError) {
        console.error('Error fetching tests:', testError);
        throw testError;
      }
      tests = testRows;
      console.log('Tests fetched for category:', tests.length);
      console.log('Sample test names:', tests.slice(0, 3).map(t => t.name));
      console.log('DEBUG: All test IDs fetched:', tests.map(t => t.id));
      console.log('DEBUG: Sample test data:', tests.slice(0, 3).map(t => ({
        id: t.id,
        type: typeof t.id,
        name: t.name,
        provider: t.provider?.name
      })));
      
      // Check if this is a TRT monitoring search and apply the filter
      const hash = window.location.hash;
      const trtMonitoringMatch = hash.match(/[?&]trtMonitoring=([^&]+)/);
      const isTRTMonitoring = trtMonitoringMatch && decodeURIComponent(trtMonitoringMatch[1]) === 'true';
      
      if (isTRTMonitoring) {
        console.log('TRT monitoring search detected in fetchAndEnrichTests - applying TRT monitoring filter');
        const trtMonitoringTestIds = [44, 52, 409, 20, 411, 405, 418, 413, 417, 407];
        const beforeTRTFilter = tests.length;
        tests = tests.filter(test => trtMonitoringTestIds.includes(test.id));
        console.log(`Filtered from ${beforeTRTFilter} to ${tests.length} tests after TRT monitoring filter in fetchAndEnrichTests`);
      }
      
      // Debug: Check if problematic tests are in the initial fetch
      const problematicTestNames = ['Testosterone Check', 'Testosterone Plus Profile', 'Well Man Premier Plus Profile', 'Sports Hormone Profile'];
      const problematicTestsInFetch = tests.filter(test => problematicTestNames.includes(test.name));
      console.log('DEBUG: Problematic tests in initial fetch:', problematicTestsInFetch.map(t => ({ 
        id: t.id, 
        name: t.name, 
        provider: t.provider?.name,
        results_returned_time_days: t.results_returned_time_days,
        results_returned_time_min: t.results_returned_time_min,
        results_returned_time_max: t.results_returned_time_max
      })));
    }
  } else {
    let query = supabase.from('provider_blood_tests').select('*, provider:providers(name)');
    if (provider) {
      // Get provider ID from name
      const { data: providerRows, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('name', provider);
      if (!providerError && providerRows && providerRows.length > 0) {
        query = query.eq('provider_id', providerRows[0].id);
      }
    }
    const { data: allTests, error } = await query;
    if (error) {
      console.error('Error fetching all tests:', error);
      throw error;
    }
    tests = allTests;
  }
  // 2. Fetch biomarker links and biomarkers for these tests
  console.log(`DEBUG: tests array length:`, tests.length);
  console.log(`DEBUG: Sample tests:`, tests.slice(0, 3).map(t => ({ id: t.id, name: t.name })));
  const testIds = tests.map(t => t.id);
  
  // Check for problematic test IDs specifically
  const problematicTestNames = ['Testosterone Check', 'Testosterone Plus Profile', 'Well Man Premier Plus Profile', 'Sports Hormone Profile'];
  const problematicTests = tests.filter(test => problematicTestNames.includes(test.name));
  
  if (problematicTests.length > 0) {
    console.log(`DEBUG: Found ${problematicTests.length} problematic tests:`, problematicTests.map(t => ({ id: t.id, name: t.name })));
  }
  
  // Debug: Check if problematic test IDs are in the testIds array
  const problematicTestIds = [432, 433, 434, 435];
  const missingTestIds = problematicTestIds.filter(id => !testIds.includes(id));
  if (missingTestIds.length > 0) {
    console.log(`DEBUG: ❌ PROBLEMATIC TEST IDS MISSING FROM testIds:`, missingTestIds);
    console.log(`DEBUG: testIds array contains:`, testIds.slice(0, 10), `... (${testIds.length} total)`);
  } else {
    console.log(`DEBUG: ✅ All problematic test IDs found in testIds:`, problematicTestIds);
  }
  
  let biomarkerLinks = [];
  let biomarkerIds = [];
  let biomarkers = [];
  let methodLinks = [];
  let allMethods = [];
  let labAccreditationLinks = [];
  let allLabAccreditations = [];
  if (testIds.length > 0) {
    // Check if we need to split the query due to too many IDs
    const maxIdsPerQuery = 10; // Much smaller limit to avoid capacity issues
    if (testIds.length > maxIdsPerQuery) {
      // Split the query into chunks
      const chunks = [];
      for (let i = 0; i < testIds.length; i += maxIdsPerQuery) {
        chunks.push(testIds.slice(i, i + maxIdsPerQuery));
      }
      
      console.log(`DEBUG: Fetching biomarker links in ${chunks.length} chunks...`);
      
      for (let i = 0; i < chunks.length; i++) {
        const { data: chunkLinks, error: chunkError } = await supabase
          .from('biomarker_link_table')
          .select('provider_blood_test_id, biomarker_id')
          .in('provider_blood_test_id', chunks[i]);
        
        if (chunkError) {
          console.error(`Error in chunk ${i + 1}:`, chunkError);
        } else {
          biomarkerLinks = biomarkerLinks.concat(chunkLinks);
        }
      }
    } else {
      const { data: links, error: linkError } = await supabase
        .from('biomarker_link_table')
        .select('provider_blood_test_id, biomarker_id')
        .in('provider_blood_test_id', testIds);
      
      if (linkError) {
        console.error('Error in biomarker link query:', linkError);
        throw linkError;
      }
      
      biomarkerLinks = links;
    }
    
    biomarkerIds = [...new Set(biomarkerLinks.map(l => l.biomarker_id))];
  }
  
  // Fetch blood taking method links
  const { data: methodLinkRows, error: methodLinkError } = await supabase
    .from('blood_taking_method_link_table')
    .select('provider_blood_test_id, blood_taking_method_id')
    .in('provider_blood_test_id', testIds);
  if (methodLinkError) throw methodLinkError;
  methodLinks = methodLinkRows;

  // Fetch all blood taking methods
  const { data: methodRows, error: methodError } = await supabase
    .from('blood_taking_methods')
    .select('id, name');
  if (methodError) throw methodError;
  allMethods = methodRows;

  // Fetch lab accreditation links
  const { data: labAccreditationLinkRows, error: labAccreditationLinkError } = await supabase
    .from('lab_accreditation_link_table')
    .select('provider_blood_test_id, lab_accreditation_id')
    .in('provider_blood_test_id', testIds);
  if (labAccreditationLinkError) throw labAccreditationLinkError;
  labAccreditationLinks = labAccreditationLinkRows;

  // Fetch all lab accreditations
  const { data: labAccreditationRows, error: labAccreditationError } = await supabase
    .from('lab_accreditations')
    .select('id, name');
  if (labAccreditationError) throw labAccreditationError;
  allLabAccreditations = labAccreditationRows;
  
  if (biomarkerIds.length > 0) {
    console.log(`DEBUG: Fetching biomarkers for IDs:`, biomarkerIds.slice(0, 10));
    const { data: biomarkerRows, error: biomarkerError } = await supabase
      .from('biomarkers')
      .select('id, name, group_links:biomarker_groupings_link_table(grouping:biomarker_groupings(name))')
      .in('id', biomarkerIds);
    if (biomarkerError) {
      console.error('DEBUG: Error in biomarker query:', biomarkerError);
      throw biomarkerError;
    }
    biomarkers = biomarkerRows;
    console.log(`DEBUG: Biomarker query successful, returned ${biomarkerRows.length} biomarkers`);
    console.log(`DEBUG: Fetched ${biomarkers.length} biomarkers from database`);
    console.log(`DEBUG: Sample biomarkers:`, biomarkers.slice(0, 3));
    
    // Debug: Check for missing biomarker names (only log if there are issues)
    const biomarkerIdsInLinks = [...new Set(biomarkerLinks.map(l => l.biomarker_id))];
    const biomarkerIdsWithNames = biomarkerRows.map(b => b.id);
    const missingBiomarkerIds = biomarkerIdsInLinks.filter(id => !biomarkerIdsWithNames.includes(id));
    if (missingBiomarkerIds.length > 0) {
      console.log('DEBUG: WARNING - Found biomarker links pointing to non-existent biomarker IDs:', missingBiomarkerIds);
    }
    
    // Debug: Log summary of biomarker data
    console.log(`DEBUG: Biomarker enrichment summary:`);
    console.log(`- Total tests: ${tests.length}`);
    console.log(`- Total biomarker links: ${biomarkerLinks.length}`);
    console.log(`- Total unique biomarker IDs in links: ${biomarkerIdsInLinks.length}`);
    console.log(`- Total biomarker names available: ${biomarkerRows.length}`);
    console.log(`- Missing biomarker IDs: ${missingBiomarkerIds.length}`);
  }
  // 3. Attach grouped biomarkers, flat biomarker names, and blood taking methods to each test
  console.log(`DEBUG: Starting biomarker enrichment for ${tests.length} tests`);
  console.log(`DEBUG: Sample test IDs being processed:`, tests.slice(0, 5).map(t => ({ id: t.id, type: typeof t.id, name: t.name })));
  
  tests.forEach(test => {
    // Convert both IDs to numbers for comparison to handle type mismatches
    const testId = parseInt(test.id);
    
    // Use numeric comparison for consistent matching
    const links = biomarkerLinks.filter(link => {
      const linkTestId = link.provider_blood_test_id;
      const testId = test.id;
      
      // Convert both to numbers for comparison
      const linkTestIdNum = parseInt(linkTestId);
      const testIdNum = parseInt(testId);
      
      return linkTestIdNum === testIdNum;
    });
    

    

    
    const grouped = {};
    const biomarkerNames = [];
    links.forEach(link => {
      // Try multiple comparison methods for biomarker IDs
      let biomarker = biomarkers.find(b => b.id === link.biomarker_id);
      if (!biomarker) {
        // Try with parsed comparison
        biomarker = biomarkers.find(b => parseInt(b.id) === parseInt(link.biomarker_id));
      }
      if (!biomarker) {
        // Try with loose comparison
        biomarker = biomarkers.find(b => b.id == link.biomarker_id);
      }
      
      if (!biomarker) {
        if (isProblematic) {
          console.log(`DEBUG: WARNING - No biomarker found for ID ${link.biomarker_id} in test "${test.name}"`);
        }
        return;
      }
      
      // Fix URL encoding issues in biomarker names
      let biomarkerName = biomarker.name;
      if (biomarkerName.includes('+')) {
        biomarkerName = biomarkerName.replace(/\+/g, ' ');
      }
      
      biomarkerNames.push(biomarkerName);
      
      if (Array.isArray(biomarker.group_links) && biomarker.group_links.length > 0) {
        biomarker.group_links.forEach(gl => {
          const groupName = gl.grouping?.name || 'Other';
          if (!grouped[groupName]) grouped[groupName] = [];
          grouped[groupName].push(biomarkerName);
        });
      } else {
        if (!grouped['Other']) grouped['Other'] = [];
        grouped['Other'].push(biomarkerName);
      }
    });
    test.grouped_biomarkers = grouped;
    // Use the biomarker_number field from the database for total count
    test.biomarker_count = test.biomarker_number || links.length;
    test.biomarker_names = biomarkerNames;
    
    // Debug: Log biomarker count for this test
    if (test.name && test.name.toLowerCase().includes('testosterone')) {
      console.log(`🔍 Test "${test.name}" (ID: ${test.id}): ${links.length} biomarkers found`);
    }
    

    
    // Attach blood taking methods
    const methodIds = methodLinks.filter(l => parseInt(l.provider_blood_test_id) === testId).map(l => l.blood_taking_method_id);
    test.blood_taking_methods = allMethods.filter(m => methodIds.includes(m.id)).map(m => m.name);
    
    // Attach lab accreditations
    const labAccreditationIds = labAccreditationLinks.filter(l => parseInt(l.provider_blood_test_id) === testId).map(l => l.lab_accreditation_id);
    test["lab accreditations"] = allLabAccreditations.filter(la => labAccreditationIds.includes(la.id)).map(la => la.name);
    
    // Check if lab_accreditations field exists directly in the test data
    if (test.lab_accreditations) {
      // If it's a string, split it into an array
      if (typeof test.lab_accreditations === 'string') {
        test["lab accreditations"] = test.lab_accreditations.split(',').map(acc => acc.trim()).filter(acc => acc);
      }
    }
  });
  
  // Summary of biomarker enrichment results
  const testsWithBiomarkers = tests.filter(test => test.biomarker_names && test.biomarker_names.length > 0);
  const testsWithoutBiomarkers = tests.filter(test => !test.biomarker_names || test.biomarker_names.length === 0);
  
  console.log(`DEBUG: Biomarker enrichment summary:`);
  console.log(`- Total tests processed: ${tests.length}`);
  console.log(`- Tests with biomarkers: ${testsWithBiomarkers.length}`);
  console.log(`- Tests without biomarkers: ${testsWithoutBiomarkers.length}`);
  
  if (testsWithoutBiomarkers.length > 0) {
    console.log(`DEBUG: Tests without biomarkers:`, testsWithoutBiomarkers.map(t => ({
      id: t.id,
      name: t.name,
      provider: t.provider?.name
    })));
    
    // Check if these tests have biomarker links in the database
    for (const test of testsWithoutBiomarkers) {
      const testLinks = biomarkerLinks.filter(link => {
        const linkTestId = link.provider_blood_test_id;
        const testId = test.id;
        return linkTestId === testId || parseInt(linkTestId) === parseInt(testId) || linkTestId == testId;
      });
      console.log(`DEBUG: Test "${test.name}" (ID: ${test.id}) has ${testLinks.length} biomarker links in query results`);
    }
  }
  
  console.log(`DEBUG: Finished biomarker enrichment`);
  return tests;
}

// Export the main function
export async function displayGeneralHealthPage(skipFilterPanel = false) {
  try {
    // --- Check localStorage for "Let me pick" search parameters ---
    console.log('🔍 Checking localStorage for search parameters...');
    const storedBiomarker1 = localStorage.getItem('selectedBiomarker1');
    const storedBiomarker2 = localStorage.getItem('selectedBiomarker2');
    const storedMinPrice = localStorage.getItem('selectedMinPrice');
    const storedMaxPrice = localStorage.getItem('selectedMaxPrice');
    const storedMethod = localStorage.getItem('selectedMethod');
    
    console.log('📦 Stored parameters from localStorage:', {
      biomarker1: storedBiomarker1,
      biomarker2: storedBiomarker2,
      minPrice: storedMinPrice,
      maxPrice: storedMaxPrice,
      method: storedMethod
    });
    
    // --- Parse URL parameters from hash ---
    const hash = window.location.hash;
    console.log('🔍 Parsing URL parameters from hash:', hash);
    let selectedBiomarkers = [];
    let selectedMinPrice = null;
    let selectedMaxPrice = null;
    let selectedProvider = null;
    let selectedMethod = null;
    
    // Parse biomarkers
    const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
    if (biomarkerMatch) {
      selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
      // Fix URL encoding issue: convert + back to spaces
      selectedBiomarkers = selectedBiomarkers.map(b => b.replace(/\+/g, ' '));
      console.log('Selected biomarkers from URL:', selectedBiomarkers);
    }
    
    // Parse price filters
    const minPriceMatch = hash.match(/[?&]minPrice=([^&]+)/);
    if (minPriceMatch) {
      selectedMinPrice = decodeURIComponent(minPriceMatch[1]);
      console.log('Selected min price from URL:', selectedMinPrice);
    }
    
    const maxPriceMatch = hash.match(/[?&]maxPrice=([^&]+)/);
    if (maxPriceMatch) {
      selectedMaxPrice = decodeURIComponent(maxPriceMatch[1]);
      console.log('Selected max price from URL:', selectedMaxPrice);
    }
    
    // Parse provider filter
    const providerMatch = hash.match(/[?&]provider=([^&]+)/);
    if (providerMatch) {
      selectedProvider = decodeURIComponent(providerMatch[1]).replace(/\+/g, ' ');
      console.log('Selected provider from URL:', selectedProvider);
    }
    
    // Parse method filter
    const methodMatch = hash.match(/[?&]method=([^&]+)/);
    if (methodMatch) {
      selectedMethod = decodeURIComponent(methodMatch[1]).replace(/\+/g, ' ');
      console.log('Selected method from URL:', selectedMethod);
    }
    
    // --- Use localStorage parameters if no URL parameters found ---
    if (selectedBiomarkers.length === 0 && (storedBiomarker1 || storedBiomarker2)) {
      console.log('🔄 No URL biomarkers found, using localStorage biomarkers');
      if (storedBiomarker1) selectedBiomarkers.push(storedBiomarker1);
      if (storedBiomarker2) selectedBiomarkers.push(storedBiomarker2);
      console.log('✅ Updated selectedBiomarkers from localStorage:', selectedBiomarkers);
    }
    
    if (!selectedMinPrice && storedMinPrice) {
      console.log('🔄 No URL minPrice found, using localStorage minPrice');
      selectedMinPrice = storedMinPrice;
      console.log('✅ Updated selectedMinPrice from localStorage:', selectedMinPrice);
    }
    
    if (!selectedMaxPrice && storedMaxPrice) {
      console.log('🔄 No URL maxPrice found, using localStorage maxPrice');
      selectedMaxPrice = storedMaxPrice;
      console.log('✅ Updated selectedMaxPrice from localStorage:', selectedMaxPrice);
    }
    
    if (!selectedMethod && storedMethod) {
      console.log('🔄 No URL method found, using localStorage method');
      selectedMethod = storedMethod;
      console.log('✅ Updated selectedMethod from localStorage:', selectedMinPrice);
    }
    
    console.log('🎯 Final selected parameters:', {
      biomarkers: selectedBiomarkers,
      minPrice: selectedMinPrice,
      maxPrice: selectedMaxPrice,
      method: selectedMethod
    });
    
    // Check if filters should be opened
    const openFiltersMatch = hash.match(/[?&]openFilters=([^&]+)/);
    const shouldOpenFilters = openFiltersMatch && decodeURIComponent(openFiltersMatch[1]) === 'true';
    console.log('Should open filters:', shouldOpenFilters);
    
    // Get the selected testosterone option (new cleaner approach)
    const testosteroneOptionMatch = hash.match(/[?&]testosteroneOption=([^&]+)/);
    const selectedTestosteroneOption = testosteroneOptionMatch ? decodeURIComponent(testosteroneOptionMatch[1]) : null;
    console.log('Selected testosterone option:', selectedTestosteroneOption);
    
    // Parse the testosterone option for easier filtering logic
    const isTestosteroneOnly = selectedTestosteroneOption === 'testosterone-only';
    const isTestosteroneFullHormone = selectedTestosteroneOption === 'testosterone-full-hormone';
    const isTestosteroneFullHormoneOnly = selectedTestosteroneOption === 'testosterone-full-hormone-only';
    const isTestosteroneFullHormoneGeneralHealth = selectedTestosteroneOption === 'testosterone-full-hormone';
    const isTRTMonitoring = selectedTestosteroneOption === 'trt-monitoring';
    
    console.log('Parsed testosterone options:', {
      isTestosteroneOnly,
      isTestosteroneFullHormone,
      isTestosteroneFullHormoneOnly,
      isTestosteroneFullHormoneGeneralHealth,
      isTRTMonitoring
    });
    
    // Store the final parameters for filter panel initialization
    window._searchParameters = {
      biomarkers: selectedBiomarkers,
      minPrice: selectedMinPrice,
      maxPrice: selectedMaxPrice,
      method: selectedMethod,
      shouldOpenFilters: shouldOpenFilters
    };
    
    // --- Fetch and enrich tests ---
    let tests;
    // Always fetch from men's health and hormones category (ID 3)
    const selectedCategory = 'Male health and hormones';
    console.log('Always fetching from category:', selectedCategory);
    console.log('Category name being searched:', selectedCategory);
    
    // Fetch tests from men's health category
    console.log('Fetching from men\'s health category');
    tests = await fetchAndEnrichTests({ categoryId: 3 });
    console.log('Tests fetched from category:', tests.length);
    console.log('🔍 BEFORE ANY FILTERING - Test count:', tests.length);
    
    // Apply filters
    let beforeFilter = tests.length;
    console.log('🔍 STARTING FILTERING PROCESS - Initial count:', beforeFilter);
    
    // Apply testosterone option filtering (regardless of biomarkers parameter)
    if (selectedTestosteroneOption && selectedTestosteroneOption !== 'browse-all') {
      console.log('🔍 APPLYING TESTOSTERONE OPTION FILTER for:', selectedTestosteroneOption);
      
      if (isTestosteroneOnly) {
        console.log('Applying testosterone-only filter');
        
        tests = tests.filter(test => {
          const testBiomarkerNames = test.biomarker_names || [];
          
          // For testosterone-only, check if the test has ONLY testosterone
          const hasOnlyTestosterone = testBiomarkerNames.length === 1 && 
            testBiomarkerNames.some(biomarker => 
              biomarker && biomarker.toLowerCase().includes('testosterone')
            );
          
          if (!hasOnlyTestosterone) {
            console.log(`Filtering out test "${test.name}" - not testosterone-only. Test has:`, testBiomarkerNames);
          }
          return hasOnlyTestosterone;
        });
        console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after testosterone-only filtering`);
        beforeFilter = tests.length;
              } else if (isTestosteroneFullHormone) {
          console.log('Applying male hormone check + general health check filter (no biomarker count restrictions)');
          
          // For male hormone check + general health check, just filter by required biomarkers
          // NO biomarker count restrictions - show ALL tests with the required biomarkers
          tests = tests.filter(test => {
            const testBiomarkerNames = test.biomarker_names || [];
            const requiredBiomarkers = ['Testosterone', 'Free testosterone', 'SHBG'];
            
            const hasAllRequiredBiomarkers = requiredBiomarkers.every(requiredBiomarker => {
              return testBiomarkerNames.some(testBiomarker => {
                if (!testBiomarker) return false;
                const normalizedTest = testBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
                const normalizedRequired = requiredBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
                
                // More precise matching to avoid false positives
                if (normalizedRequired === 'testosterone') {
                  // For "Testosterone", require exact match or starts with "testosterone"
                  return normalizedTest === 'testosterone' || normalizedTest.startsWith('testosterone');
                } else if (normalizedRequired === 'free testosterone') {
                  // For "Free testosterone", require exact match or starts with "free testosterone"
                  return normalizedTest === 'free testosterone' || normalizedTest.startsWith('free testosterone');
                } else if (normalizedRequired === 'shbg') {
                  // For "SHBG", require exact match
                  return normalizedTest === 'shbg';
                }
                return false;
              });
            });
            
            if (!hasAllRequiredBiomarkers) {
              console.log(`Filtering out test "${test.name}" - missing required biomarkers. Test has:`, testBiomarkerNames, 'Looking for:', requiredBiomarkers);
            }
            return hasAllRequiredBiomarkers;
          });
          console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after male hormone check + general health check filtering`);
          beforeFilter = tests.length;
        } else if (isTestosteroneFullHormoneOnly) {
          console.log('Applying male hormone check only filter (≤10 biomarkers)');
          
          // Use the shared filtering function which includes the ≤10 biomarker limit
          tests = applyMaleHormoneCheckFilter(tests);
          console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after male hormone check only filtering`);
          beforeFilter = tests.length;
        } else if (isTestosteroneFullHormoneGeneralHealth) {
          console.log('Applying male hormone check + general health check filter (no biomarker count restrictions)');
          
          // For male hormone check + general health check, just filter by required biomarkers
          // NO biomarker count restrictions - show ALL tests with the required biomarkers
          tests = tests.filter(test => {
            const testBiomarkerNames = test.biomarker_names || [];
            const requiredBiomarkers = ['Testosterone', 'Free testosterone', 'SHBG'];
            
            const hasAllRequiredBiomarkers = requiredBiomarkers.every(requiredBiomarker => {
              return testBiomarkerNames.some(testBiomarker => {
                if (!testBiomarker) return false;
                const normalizedTest = testBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
                const normalizedRequired = requiredBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
                return normalizedTest.includes(normalizedRequired) || normalizedRequired.includes(normalizedTest);
              });
            });
            
            if (!hasAllRequiredBiomarkers) {
              console.log(`Filtering out test "${test.name}" - missing required biomarkers. Test has:`, testBiomarkerNames, 'Looking for:', requiredBiomarkers);
            }
            return hasAllRequiredBiomarkers;
          });
          console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after male hormone check + general health check filtering`);
          beforeFilter = tests.length;
        } else if (isTRTMonitoring) {
          console.log('Applying TRT monitoring filter (specific hardcoded tests)');
          
          // For TRT monitoring, filter to only show the specific hardcoded test IDs
          const trtMonitoringTestIds = [44, 52, 409, 20, 411, 405, 418, 413, 417, 407];
          tests = tests.filter(test => {
            const isTRTTest = trtMonitoringTestIds.includes(test.id);
            if (!isTRTTest) {
              console.log(`Filtering out test "${test.name}" (ID: ${test.id}) - not in TRT monitoring list`);
            }
            return isTRTTest;
          });
          console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after TRT monitoring filtering`);
          beforeFilter = tests.length;
        } else {
          console.log('🔍 NO TESTOSTERONE OPTION FILTERS APPLIED');
        }
      }
    
    // Apply biomarker filtering independently (for "Let me pick" side)
    if (selectedBiomarkers.length > 0 && !selectedTestosteroneOption) {
      console.log('🔍 APPLYING INDEPENDENT BIOMARKER FILTERING for "Let me pick" side');
      tests = tests.filter(test => {
        const testBiomarkerNames = test.biomarker_names || [];
        const hasAllBiomarkers = selectedBiomarkers.every(selectedBiomarker => {
          // Normalize both the search term and test biomarkers
          const normalizedSearch = selectedBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
          
          return testBiomarkerNames.some(testBiomarker => {
            if (!testBiomarker) return false;
            const normalizedTest = testBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
            const exactMatch = normalizedTest === normalizedSearch;
            const containsMatch = normalizedTest.includes(normalizedSearch) || normalizedSearch.includes(normalizedTest);
            return exactMatch || containsMatch;
          });
        });
        
        if (!hasAllBiomarkers) {
          console.log(`Filtering out test "${test.name}" - missing biomarkers. Test has:`, testBiomarkerNames, 'Looking for:', selectedBiomarkers);
          console.log(`  Normalized search terms:`, selectedBiomarkers.map(b => b.toLowerCase().replace(/\+/g, ' ').trim()));
          console.log(`  Normalized test biomarkers:`, testBiomarkerNames.map(b => b.toLowerCase().replace(/\+/g, ' ').trim()));
        }
        return hasAllBiomarkers;
      });
      console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after independent biomarker filtering`);
      beforeFilter = tests.length;
    } else if (selectedBiomarkers.length === 0 && !selectedTestosteroneOption) {
      console.log('🔍 NO BIOMARKER FILTERS APPLIED - keeping all tests');
    }
    
    // Apply price filtering
    if (selectedMinPrice && selectedMinPrice !== '') {
      const minPrice = parseFloat(selectedMinPrice.replace('£', ''));
      console.log('🔍 APPLYING MIN PRICE FILTER:', minPrice);
      tests = tests.filter(test => test.price >= minPrice);
      console.log(`🔍 Filtered from ${beforeFilter} to ${tests.length} tests after min price filtering`);
      beforeFilter = tests.length;
    } else {
      console.log('🔍 NO MIN PRICE FILTER APPLIED');
    }
    
    if (selectedMaxPrice && selectedMaxPrice !== '') {
      const maxPrice = parseFloat(selectedMaxPrice.replace('£', ''));
      console.log('🔍 APPLYING MAX PRICE FILTER:', maxPrice);
      tests = tests.filter(test => test.price <= maxPrice);
      console.log(`🔍 Filtered from ${beforeFilter} to ${tests.length} tests after max price filtering`);
      beforeFilter = tests.length;
    } else {
      console.log('🔍 NO MAX PRICE FILTER APPLIED');
    }
    
    // Apply provider filtering
    if (selectedProvider && selectedProvider !== '') {
      console.log('Applying provider filter:', selectedProvider);
      tests = tests.filter(test => test.provider?.name === selectedProvider);
      console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after provider filtering`);
      beforeFilter = tests.length;
    }
    
    // Apply method filtering
    if (selectedMethod && selectedMethod !== '') {
      console.log('🔍 APPLYING METHOD FILTER:', selectedMethod);
      console.log('🔍 Sample tests with blood taking methods:', tests.slice(0, 3).map(t => ({
        name: t.name,
        blood_taking_methods: t.blood_taking_methods
      })));
      tests = tests.filter(test => {
        const testMethods = test.blood_taking_methods || [];
        const hasMethod = testMethods.some(method => method === selectedMethod);
        if (!hasMethod) {
          console.log(`🔍 Filtering out test "${test.name}" - method "${selectedMethod}" not found in:`, testMethods);
        }
        return hasMethod;
      });
      console.log(`🔍 Filtered from ${beforeFilter} to ${tests.length} tests after method filtering`);
      beforeFilter = tests.length;
    } else {
      console.log('🔍 NO METHOD FILTER APPLIED');
    }
    window._allGeneralHealthTests = tests;
    
    console.log(`🎯 Final test count after all filtering: ${tests.length}`);
    
    // Create and return the page structure without filter panel
    try {
      const content = createPageStructure(null, null);
      
      // Add filter overlay to the page
      const filterOverlay = document.createElement('div');
      filterOverlay.className = 'filter-overlay';
      filterOverlay.style.display = 'none';
      filterOverlay.innerHTML = `
        <div class="filter-overlay-content">
          <div class="filter-overlay-header">
            <h3>Filters</h3>
            <button class="filter-overlay-close" aria-label="Close filters">×</button>
          </div>
          <div class="filter-overlay-body">
            <!-- Filter content will go here later -->
            <p>Filter options coming soon...</p>
          </div>
        </div>
      `;
      
      // Add overlay to the page
      document.body.appendChild(filterOverlay);
      
      // Set up overlay close functionality
      const closeBtn = filterOverlay.querySelector('.filter-overlay-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          filterOverlay.style.display = 'none';
        });
      }
      
      // Close overlay when clicking outside
      filterOverlay.addEventListener('click', (e) => {
        if (e.target === filterOverlay) {
          filterOverlay.style.display = 'none';
        }
      });
      
      // Add a custom event listener for when the content is rendered
      document.addEventListener('contentRendered', async () => {
        if (window._allGeneralHealthTests) {
          console.log('🔍 CONTENT RENDERED - Tests count in window._allGeneralHealthTests:', window._allGeneralHealthTests.length);
          // Set up the page elements without filter panel
          initializePageElements(window._allGeneralHealthTests, null, true);
        } else {
          console.error('window._allGeneralHealthTests is not set!');
        }
      }, { once: true });
      
      return content;
    } catch (error) {
      console.error('=== ERROR: Failed to create page ===');
      console.error('Error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  } catch (error) {
    console.error('Error loading general health page:', error);
    return createErrorContent();
  }
} 