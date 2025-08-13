import { $, $all } from './dom.js';
import { CardService } from './services/cardService.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
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
      // Don't trigger selection if clicking on buttons or interactive elements
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.toggle-biomarkers') || e.target.closest('.toggle-all-biomarkers') || e.target.closest('.add-to-compare-checkbox') || e.target.closest('.add-to-compare-label')) {
        return;
      }
      
      hasInteracted = true;
      
      // Remove selection from all cards
      $all('.blood-test-card').forEach(c => c.classList.remove('selected'));
      
      // Add selection to clicked card
      card.classList.add('selected');
      lastHoveredCard = card;

      // Open overlay with test details
      const testId = card.dataset.testId;
      console.log('Card clicked, testId:', testId);
      console.log('currentTests:', currentTests);
      
      // Log the structure of the first test to see what properties it has
      if (currentTests.length > 0) {
        console.log('First test object:', currentTests[0]);
        console.log('Available properties:', Object.keys(currentTests[0]));
      }
      
      // Log all test IDs to see what we're working with
      console.log('All test IDs in currentTests:');
      currentTests.forEach((t, index) => {
        console.log(`Test ${index}: id=${t.id}, test_name="${t.test_name}", name="${t.name}"`);
      });
      
      // Try to find test by ID first, then by name as fallback
      let test = currentTests.find(t => t.id == testId);
      if (!test) {
        // Fallback to name matching for backward compatibility
        test = currentTests.find(t => 
          t.test_name === testId || 
          t.name === testId || 
          t.title === testId ||
          t.testName === testId
        );
      }
      console.log('Found test:', test);
      if (test) {
        console.log('Opening overlay for test ID:', test.id, 'Name:', test.test_name || test.name || test.title || test.testName);
        bloodTestOverlay.open(test);
      } else {
        console.log('No test found for testId:', testId);
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
      <div class="results-container"><aside class="filter-panel">
          <div class="filter-panel-content">
            ${filterPanel}
          </div>
        </aside><div class="main-content">

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
    
    // Check for applied filters from homepage form
    const minPriceMatch = hash.match(/[?&]minPrice=([^&]+)/);
    if (minPriceMatch) {
      appliedFilters.push({
        type: 'minPrice',
        value: decodeURIComponent(minPriceMatch[1]),
        display: `Min price: ${decodeURIComponent(minPriceMatch[1])}`
      });
    }
    
    const maxPriceMatch = hash.match(/[?&]maxPrice=([^&]+)/);
    if (maxPriceMatch) {
      appliedFilters.push({
        type: 'maxPrice',
        value: decodeURIComponent(maxPriceMatch[1]),
        display: `Max price: ${decodeURIComponent(maxPriceMatch[1])}`
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
    
    const methodMatch = hash.match(/[?&]method=([^&]+)/);
    if (methodMatch) {
      appliedFilters.push({
        type: 'method',
        value: decodeURIComponent(methodMatch[1]),
        display: `Method: ${decodeURIComponent(methodMatch[1])}`
      });
    }
    
    const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
    if (biomarkerMatch) {
      const biomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
      biomarkers.forEach(biomarker => {
        appliedFilters.push({
          type: 'biomarker',
          value: biomarker,
          display: biomarker.replace(/\+/g, ' ')
        });
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
          <button class="filters-btn" aria-label="Toggle filters panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
            </svg>
            Filters
          </button>
          <div class="sort-dropdown desktop-only">
            <button class="sort-btn" aria-label="Sort results" aria-expanded="false">
              Sort: Relevance
            </button>
            <div class="sort-dropdown-menu" style="display: none;">
              <button class="sort-option" data-sort="relevance">Sort by relevance</button>
              <button class="sort-option" data-sort="price-asc">Sort by price: Low to high</button>
              <button class="sort-option" data-sort="price-desc">Sort by price: High to low</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    console.log('Setting filter tags container HTML');
    filterTagsContainer.innerHTML = resultsCountHTML;
    console.log('Filter tags container HTML set');
    
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
        } else if (type === 'biomarker') {
          // Remove specific biomarker from biomarkers parameter - FIRST INSTANCE - DEBUGGING
          let biomarkerVal = params.get('biomarkers') || '';
          let biomarkers = biomarkerVal.split(',').map(b => b.trim()).filter(Boolean);
          biomarkers = biomarkers.filter(b => b !== value);
          if (biomarkers.length > 0) {
            params.set('biomarkers', biomarkers.join(','));
          } else {
            params.delete('biomarkers');
          }
          
          // Special handling for "Male hormone check" - remove the special parameters
          if (value === 'Testosterone') {
            // Check if this is a male hormone check by looking at the URL parameters
            const hash = window.location.hash;
            if (hash.includes('testosteroneFullHormoneOnly=true')) {
              params.delete('testosteroneFullHormoneOnly');
            }
            if (hash.includes('testosteroneFullHormone=true')) {
              params.delete('testosteroneFullHormone');
            }
            if (hash.includes('testosteroneOnly=true')) {
              params.delete('testosteroneOnly');
            }
          }
        } else if (type === 'male-hormone-check') {
          console.log('🎯 MALE HORMONE CHECK TAG REMOVAL TRIGGERED');
          // Special handling for "Male hormone check" - remove ALL biomarkers and special parameters
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
    
    // Add event listener to filters button
    const filtersBtn = filterTagsContainer.querySelector('.filters-btn');
    if (filtersBtn) {
      filtersBtn.addEventListener('click', () => {
        const filterPanel = document.querySelector('.filter-panel');
        if (filterPanel) {
          filterPanel.classList.toggle('visible');
        }
      });
    }
  }
  
  // Set up a function to update filter tags when URL changes
  function updateFilterTagsFromURL() {
    const filterTagsContainer = document.querySelector('.filter-tags');
    if (!filterTagsContainer) return;
    
    // Get URL parameters to show applied filters
    const hash = window.location.hash;
    const appliedFilters = [];
    
    // Check for applied filters from homepage form
    const minPriceMatch = hash.match(/[?&]minPrice=([^&]+)/);
    if (minPriceMatch) {
      appliedFilters.push({
        type: 'minPrice',
        value: decodeURIComponent(minPriceMatch[1]),
        display: `Min price: ${decodeURIComponent(minPriceMatch[1])}`
      });
    }
    
    const maxPriceMatch = hash.match(/[?&]maxPrice=([^&]+)/);
    if (maxPriceMatch) {
      appliedFilters.push({
        type: 'maxPrice',
        value: decodeURIComponent(maxPriceMatch[1]),
        display: `Max price: ${decodeURIComponent(maxPriceMatch[1])}`
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
    
    const methodMatch = hash.match(/[?&]method=([^&]+)/);
    if (methodMatch) {
      appliedFilters.push({
        type: 'method',
        value: decodeURIComponent(methodMatch[1]),
        display: `Method: ${decodeURIComponent(methodMatch[1])}`
      });
    }
    
    const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
    if (biomarkerMatch) {
      const biomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
      
      // Check if this is a testosterone-only search
      const testosteroneOnlyMatch = hash.match(/[?&]testosteroneOnly=([^&]+)/);
      const isTestosteroneOnly = testosteroneOnlyMatch && decodeURIComponent(testosteroneOnlyMatch[1]) === 'true';
      
      // Check if this is a testosterone full hormone profile search
      const testosteroneFullHormoneMatch = hash.match(/[?&]testosteroneFullHormone=([^&]+)/);
      const isTestosteroneFullHormone = testosteroneFullHormoneMatch && decodeURIComponent(testosteroneFullHormoneMatch[1]) === 'true';
      
      console.log('🔍 Filter tag debug:', {
        hash: hash,
        biomarkers: biomarkers,
        testosteroneOnlyMatch: testosteroneOnlyMatch,
        isTestosteroneOnly: isTestosteroneOnly,
        testosteroneFullHormoneMatch: testosteroneFullHormoneMatch,
        isTestosteroneFullHormone: isTestosteroneFullHormone,
        hasTestosterone: biomarkers.includes('Testosterone')
      });
      
      if (isTestosteroneOnly && biomarkers.includes('Testosterone')) {
        console.log('🔍 Creating "Testosterone only" filter tag');
        // Create special "Testosterone only" filter tag
        appliedFilters.push({
          type: 'biomarker',
          value: 'Testosterone',
          display: 'Testosterone only'
        });
      } else if (isTestosteroneFullHormone) {
        console.log('🔍 Creating "Male hormone check" filter tag');
        // Create special "Male hormone check" filter tag
        appliedFilters.push({
          type: 'biomarker',
          value: 'Testosterone',
          display: 'Male hormone check'
        });
      } else if (isTestosteroneFullHormoneGeneralHealth) {
        console.log('🔍 Creating "Male hormone check + general health check" filter tag');
        // Create special "Male hormone check + general health check" filter tag
        appliedFilters.push({
          type: 'biomarker',
          value: 'Testosterone',
          display: 'Male hormone check + general health check'
        });
      } else {
        console.log('🔍 Creating regular biomarker filter tags');
        // Regular biomarker filter tags
        biomarkers.forEach(biomarker => {
          appliedFilters.push({
            type: 'biomarker',
            value: biomarker,
            display: biomarker.replace(/\+/g, ' ')
          });
        });
      }
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
    
    const resultsCountHTML = `
      <div class="filter-tags-container">
        <div class="filter-tags-list">
          ${filterTagsHTML}
        </div>
        <div class="results-controls">
          <div class="results-count">
            <span>${tests.length} result${tests.length !== 1 ? 's' : ''}</span>
          </div>
          <button class="filters-btn" aria-label="Toggle filters panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
            </svg>
            Filters
          </button>
          <div class="sort-dropdown desktop-only">
            <button class="sort-btn" aria-label="Sort results" aria-expanded="false">
              Sort: Relevance
            </button>
            <div class="sort-dropdown-menu" style="display: none;">
              <button class="sort-option" data-sort="relevance">Sort by relevance</button>
              <button class="sort-option" data-sort="price-asc">Sort by price: Low to high</button>
              <button class="sort-option" data-sort="price-desc">Sort by price: High to low</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    filterTagsContainer.innerHTML = resultsCountHTML;
    
    // Re-attach event listeners
    const filterTagsList = filterTagsContainer.querySelector('.filter-tags-list');
    if (filterTagsList) {
      // FIRST INSTANCE - DEBUGGING
      filterTagsList.addEventListener('click', (e) => {
        console.log('🔍 FIRST INSTANCE - Filter tag clicked:', e.target);
        const button = e.target.closest('.remove-tag');
        if (!button) {
          console.log('🔍 FIRST INSTANCE - No remove button found');
          return;
        }
        console.log('🔍 FIRST INSTANCE - Remove button clicked');
        
        e.preventDefault();
        e.stopPropagation();
        
        const tag = button.closest('.filter-tag');
        if (!tag) {
          console.log('🔍 FIRST INSTANCE - No filter tag found');
          return;
        }
        
        const type = tag.dataset.type;
        const value = tag.dataset.value;
        console.log('🔍 FIRST INSTANCE - Removing filter tag:', type, value);
        
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
        } else if (type === 'biomarker') {
          // Remove specific biomarker from biomarkers parameter - SECOND INSTANCE
          let biomarkerVal = params.get('biomarkers') || '';
          let biomarkers = biomarkerVal.split(',').map(b => b.trim()).filter(Boolean);
          biomarkers = biomarkers.filter(b => b !== value);
          if (biomarkers.length > 0) {
            params.set('biomarkers', biomarkers.join(','));
          } else {
            params.delete('biomarkers');
          }
          
          // Special handling for "Male hormone check" - remove the special parameters
          if (value === 'Testosterone') {
            // Check if this is a male hormone check by looking at the URL parameters
            const hash = window.location.hash;
            if (hash.includes('testosteroneFullHormoneOnly=true')) {
              params.delete('testosteroneFullHormoneOnly');
            }
            if (hash.includes('testosteroneFullHormone=true')) {
              params.delete('testosteroneFullHormone');
            }
            if (hash.includes('testosteroneOnly=true')) {
              params.delete('testosteroneOnly');
            }
          }
        } else if (type === 'male-hormone-check') {
          console.log('🎯 MALE HORMONE CHECK TAG REMOVAL TRIGGERED - SECOND INSTANCE');
          // Special handling for "Male hormone check" - remove ALL biomarkers and special parameters
          params.delete('biomarkers');
          params.delete('testosteroneFullHormoneOnly');
          params.delete('testosteroneFullHormone');
          params.delete('testosteroneOnly');
          console.log('🎯 Parameters after removal (second):', params.toString());
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
    
    // Re-attach filters button event listener
    const filtersBtn = filterTagsContainer.querySelector('.filters-btn');
    if (filtersBtn) {
      filtersBtn.addEventListener('click', () => {
        const filterPanel = document.querySelector('.filter-panel');
        if (filterPanel) {
          filterPanel.classList.toggle('visible');
        }
      });
    }
  }
  
  // Set up hash change listener to update filter tags
  window.addEventListener('hashchange', updateFilterTagsFromURL);
  
  
  console.log('Passing selectedProblem to setupFilterPanel:', selectedProblem);
  console.log('Current tests length being passed to setupFilterPanel:', currentTests.length);
  
  if (!skipFilterPanel) {

    // Import setupFilterPanel function
    const { setupFilterPanel } = await import('./filter-panel.js');
    console.log('🔍 setupFilterPanel imported, calling it with', currentTests.length, 'tests');
    
    // Simple test to see if this code is running
    console.log('🔍 Filter panel setup code is executing!');
    
          // Define the callback function
      const filterCallback = async (filterState) => {
        console.log('🔍 FILTER CALLBACK TRIGGERED with filterState:', filterState);
      
      // Handle filter state object (new approach)
      if (!Array.isArray(filterState)) {
        // New case: filterState is an object with categories, providers, etc.
        const selectedCategories = filterState.categories || [];
        console.log('🔍 Selected categories in filter callback:', selectedCategories);
        const selectedProviders = filterState.providers || [];
        
        // Check if filtered tests are provided directly (for price/provider filtering)
        if (filterState.filteredTests) {
          
          // Re-enrich the filtered tests with biomarker data
          const testIds = filterState.filteredTests.map(t => t.id);
          
          // Fetch biomarker data for these specific tests
          const enriched = await fetchAndEnrichTests({ categoryId: 3 }); // Fetch all tests in category
          const enrichedMap = new Map(enriched.map(t => [t.id, t]));
          
          // Replace the filtered tests with their enriched versions
          const reEnrichedTests = filterState.filteredTests.map(test => {
            const enrichedTest = enrichedMap.get(test.id);
            if (enrichedTest) {
              // Test re-enriched successfully
            } else {
              // No enriched data found for this test
            }
            return enrichedTest || test; // Fallback to original if not found
          });
          
          filteredTests = reEnrichedTests;
          sortAscending = true;
          window.sortAscending = sortAscending;
          updateSortButtonText(sortAscending);
          currentTests = sortTests(filteredTests, sortAscending);
          
          // Update the global tests to match what we're displaying
          window._allGeneralHealthTests = reEnrichedTests;
          
          updateTestGridContent(currentTests);
          return; // Exit early since we're using the provided filtered tests
        }
        
        console.log('Fetching tests for categories:', selectedCategories, 'providers:', selectedProviders);
        
        // Get current biomarker filter from URL
        const hash = window.location.hash;
        const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
        const selectedBiomarkers = biomarkerMatch ? 
          decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean) : [];
        
        console.log('Current biomarker filter:', selectedBiomarkers);
        
        // Fetch and enrich tests based on the filter state
        // For now, handle multiple categories by fetching each one and combining results
        let allEnrichedTests = [];
        
        if (selectedCategories.length > 0) {
          // Fetch tests from categories - fetchAndEnrichTests will handle TRT monitoring filtering
          for (const category of selectedCategories) {
            const enriched = await fetchAndEnrichTests({ 
              category: category,
              provider: selectedProviders.length > 0 ? selectedProviders[0] : null 
            });
            allEnrichedTests = allEnrichedTests.concat(enriched);
          }
          // Remove duplicates based on test ID
          const uniqueTests = [];
          const seenIds = new Set();
          allEnrichedTests.forEach(test => {
            if (!seenIds.has(test.id)) {
              seenIds.add(test.id);
              uniqueTests.push(test);
            }
          });
          allEnrichedTests = uniqueTests;
          console.log('Fetched tests for categories:', allEnrichedTests.length);
        } else {
          // No categories selected, use the initially filtered tests instead of fetching all
          console.log('🔍 No categories selected, using initial filtered tests');
          allEnrichedTests = window._allGeneralHealthTests || [];
          console.log('🔍 Using initial filtered tests:', allEnrichedTests.length);
          
          // Apply provider filter if specified
          if (selectedProviders.length > 0) {
            console.log('Applying provider filter to initial tests:', selectedProviders);
            allEnrichedTests = allEnrichedTests.filter(test => 
              selectedProviders.includes(test.provider?.name || test.provider)
            );
            console.log('Tests after provider filtering:', allEnrichedTests.length);
          }
        }
        
        // Apply biomarker filtering if biomarkers are selected
        if (selectedBiomarkers.length > 0) {
          console.log('🔍 SEARCH RESULTS: Applying biomarker filter to', allEnrichedTests.length, 'tests');
          console.log('🔍 SEARCH RESULTS: Looking for biomarkers:', selectedBiomarkers);
          
          // Log all tests before filtering
          console.log('🔍 SEARCH RESULTS: All tests before biomarker filtering:', allEnrichedTests.map(t => ({
            id: t.id,
            name: t.name,
            provider: t.provider?.name,
            biomarker_names: t.biomarker_names || []
          })));
          
          allEnrichedTests = allEnrichedTests.filter(test => {
            const testBiomarkers = test.biomarker_names || [];
            console.log(`🔍 SEARCH RESULTS: Test "${test.name}" has biomarkers:`, testBiomarkers);
            
            const hasAllBiomarkers = selectedBiomarkers.every(searchBiomarker => {
              // Normalize the search biomarker (replace + with space, lowercase)
              const normalizedSearch = searchBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
              
              // Check if any test biomarker matches (case insensitive, handle + vs space)
              const hasMatch = testBiomarkers.some(testBiomarker => {
                if (!testBiomarker) return false;
                const normalizedTest = testBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
                const exactMatch = normalizedTest === normalizedSearch;
                const containsMatch = normalizedTest.includes(normalizedSearch) || normalizedSearch.includes(normalizedTest);
                return exactMatch || containsMatch;
              });
              
              if (!hasMatch) {
                console.log(`  🔍 SEARCH RESULTS: Missing biomarker: "${searchBiomarker}" (normalized: "${normalizedSearch}")`);
                console.log(`  🔍 SEARCH RESULTS: Available test biomarkers:`, testBiomarkers.map(b => b.toLowerCase().replace(/\+/g, ' ').trim()));
              }
              return hasMatch;
            });
            
            if (!hasAllBiomarkers) {
              console.log(`🔍 SEARCH RESULTS: Filtering out test "${test.name}" - missing biomarkers. Test has:`, testBiomarkers, 'Looking for:', selectedBiomarkers);
            }
            return hasAllBiomarkers;
          });
          
          console.log('🔍 SEARCH RESULTS: After biomarker filtering:', allEnrichedTests.length, 'tests remaining');
          
          // Log the exact tests that passed the biomarker filter
          console.log('🔍 SEARCH RESULTS: Tests that passed biomarker filter:', allEnrichedTests.map(t => ({
            id: t.id,
            name: t.name,
            provider: t.provider?.name,
            biomarker_names: t.biomarker_names || []
          })));
        }
        
        // Apply blood taking method filtering if methods are selected
        const selectedBloodMethods = filterState.bloodTakingMethods || [];
        if (selectedBloodMethods.length > 0) {
  
          console.log('Applying blood taking method filter to', allEnrichedTests.length, 'tests');
          console.log('Looking for methods:', selectedBloodMethods);
          
          allEnrichedTests = allEnrichedTests.filter(test => {
            const testMethods = Array.isArray(test.blood_taking_methods) ? test.blood_taking_methods : [];
            console.log(`Test "${test.name}" has blood taking methods:`, testMethods);
            
            const hasMatchingMethod = testMethods.some(method => 
              selectedBloodMethods.includes(method)
            );
            
            if (!hasMatchingMethod) {
              console.log(`Filtering out test "${test.name}" - no matching blood taking methods. Test has:`, testMethods, 'Looking for:', selectedBloodMethods);
            }
            return hasMatchingMethod;
          });
          console.log('After blood taking method filtering:', allEnrichedTests.length, 'tests remaining');
        } else {
          console.log('No biomarker filter applied');
        }
        
        const enriched = allEnrichedTests;
        
        console.log('🔍 SEARCH RESULTS: Final enriched tests:', enriched.length);
        console.log('🔍 SEARCH RESULTS: Final test details:', enriched.map(t => ({
          id: t.id,
          name: t.name,
          provider: t.provider?.name,
          biomarker_names: t.biomarker_names || []
        })));
        
        filteredTests = enriched;
        sortAscending = true;
        window.sortAscending = sortAscending;
        updateSortButtonText(sortAscending);
        currentTests = sortTests(filteredTests, sortAscending);
        
        // Update the global tests to match what we're displaying
        window._allGeneralHealthTests = enriched;

        console.log('Updated window._allGeneralHealthTests to', enriched.length, 'tests');
        console.log('Test names:', enriched.map(t => t.name));
        
        updateTestGridContent(currentTests);
      } else {
        // Legacy case: filterState is an array of filtered tests
        console.log('🔍 LEGACY CASE - filterState is not an object, treating as array:', filterState);
        console.log('🔍 LEGACY CASE - filterState type:', typeof filterState);
        console.log('🔍 LEGACY CASE - filterState value:', filterState);
        filteredTests = filterState;
        console.log('🔍 LEGACY CASE - Setting filteredTests to:', filteredTests);
        sortAscending = true;
        window.sortAscending = sortAscending;
        updateSortButtonText(sortAscending);
        currentTests = sortTests(filteredTests, sortAscending);
        console.log('🔍 LEGACY CASE - After sorting, currentTests count:', currentTests.length);
        updateTestGridContent(currentTests);
      }
    };
    
    console.log('About to call setupFilterPanel with callback');
    console.log('filterCallback type:', typeof filterCallback);
    console.log('filterCallback is function:', typeof filterCallback === 'function');
    console.log('currentTests length:', currentTests.length);
    
    // Test the callback directly
    console.log('🔍 Testing callback function...');
    try {
      console.log('🔍 CALLBACK TEST - About to call filterCallback with test object');
      filterCallback({ test: 'test' });
      console.log('🔍 CALLBACK TEST - Callback test successful');
    } catch (error) {
      console.error('🔍 CALLBACK TEST - Callback test failed:', error);
    }
    
    console.log('Calling setupFilterPanel...');
    console.log('Callback function defined:', typeof filterCallback);
    try {
      setupFilterPanel(currentTests, filterCallback);
      console.log('setupFilterPanel called successfully');
    } catch (error) {
      console.error('=== ERROR: setupFilterPanel failed ===');
      console.error('Error:', error);
      console.error('Error stack:', error.stack);
    }
    
    setTimeout(() => {
      document.dispatchEvent(new Event('filterPanelReady'));
    }, 0);
  }
}

// Listen for the filterPanelReady event to set up mobile filter logic
if (!window._mobileFilterPanelSetup) {
  document.addEventListener('filterPanelReady', () => {
    // Always attach to the correct Filters button
    const filtersBtn = document.querySelector('.filters-btn.mobile-only');
    const mobilePanel = document.querySelector('.mobile-filter-panel');
    const closeBtn = document.querySelector('.close-mobile-filter');
    const filterPanel = document.querySelector('.filter-panel');
    const mobileContent = document.querySelector('.mobile-filter-content');
    if (!filtersBtn || !mobilePanel || !closeBtn || !filterPanel || !mobileContent) return;

    // Remove previous event listeners by cloning
    const newFiltersBtn = filtersBtn.cloneNode(true);
    filtersBtn.parentNode.replaceChild(newFiltersBtn, filtersBtn);
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

    function openPanel() {
      mobileContent.appendChild(filterPanel);
      mobilePanel.classList.remove('hidden');
      mobilePanel.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
    function closePanel() {
      mobilePanel.classList.remove('visible');
      mobilePanel.classList.add('hidden');
      document.body.style.overflow = '';
    }
    newFiltersBtn.addEventListener('click', () => {
      if (mobilePanel.classList.contains('visible')) {
        closePanel();
      } else {
        openPanel();
      }
    });
    newCloseBtn.addEventListener('click', closePanel);
    mobilePanel.addEventListener('click', (e) => {
      if (e.target === mobilePanel) closePanel();
    });
  });
  window._mobileFilterPanelSetup = true;

  // Setup floating filter container behavior
  function setupFloatingFilterContainer() {
    const filterContainer = document.querySelector('.filter-tags-container');
    
    if (!filterContainer) {
      console.log('Filter container not found');
      return;
    }

    console.log('Found filter container:', filterContainer);

    // Wait for the container to be properly positioned
    setTimeout(() => {
      let containerTop = filterContainer.offsetTop;
      let isFloating = false;
      
      console.log('Container top position:', containerTop);

      function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        console.log('Scroll position:', scrollTop, 'Container top:', containerTop);
        
        // Check if we've scrolled past the filter container's original position
        if (scrollTop > containerTop) {
          if (!isFloating) {
            console.log('Making container float');
            filterContainer.classList.add('floating');
            document.body.classList.add('filter-container-floating');
            isFloating = true;
          }
        } else {
          if (isFloating) {
            console.log('Removing float');
            filterContainer.classList.remove('floating');
            document.body.classList.remove('filter-container-floating');
            isFloating = false;
          }
        }
      }

      // Add scroll event listener
      window.addEventListener('scroll', handleScroll);
      
      // Handle window resize to recalculate positions
      window.addEventListener('resize', () => {
        containerTop = filterContainer.offsetTop;
        console.log('Recalculated container top:', containerTop);
      });
    }, 500); // Increased timeout to ensure page is fully loaded
  }

  // Initialize floating behavior
  setupFloatingFilterContainer();
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

// Function to initialize filter panel with search parameters
async function initializeFilterPanelWithParameters(searchParams) {
  try {
    console.log('🔍 Initializing filter panel with parameters:', searchParams);
    
    // Wait for the filter panel to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const filterPanel = document.querySelector('.filter-panel-content');
    if (!filterPanel) {
      console.log('🔍 Filter panel not found, waiting...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }
    
    // Set method selection if specified
    if (searchParams.method) {
      const methodCheckboxes = filterPanel.querySelectorAll('input[name="blood-method"]');
      methodCheckboxes.forEach(checkbox => {
        if (checkbox.value === searchParams.method) {
          checkbox.checked = true;
          console.log('🔍 Set method checkbox:', searchParams.method);
        } else {
          checkbox.checked = false;
        }
      });
    }
    
    // Set price range if specified
    if (searchParams.minPrice || searchParams.maxPrice) {
      const priceMinSlider = filterPanel.querySelector('#price-min');
      const priceMaxSlider = filterPanel.querySelector('#price-max');
      const priceMinValue = filterPanel.querySelector('#price-min-value');
      const priceMaxValue = filterPanel.querySelector('#price-max-value');
      
      if (priceMinSlider && searchParams.minPrice) {
        const minPrice = parseFloat(searchParams.minPrice.replace('£', ''));
        priceMinSlider.value = minPrice;
        if (priceMinValue) priceMinValue.textContent = `£${minPrice}`;
        console.log('🔍 Set min price:', minPrice);
      }
      
      if (priceMaxSlider && searchParams.maxPrice) {
        const maxPrice = parseFloat(searchParams.maxPrice.replace('£', ''));
        priceMaxSlider.value = maxPrice;
        if (priceMaxValue) priceMaxValue.textContent = `£${maxPrice}`;
        console.log('🔍 Set max price:', maxPrice);
      }
    }
    
    // Update filter tags to reflect the applied filters
    const filterTagsContainer = document.querySelector('.filter-tags');
    if (filterTagsContainer) {
      // Trigger a filter update to refresh the display
      const filterCallback = window._filterCallback;
      if (filterCallback) {
        console.log('🔍 Triggering filter update to refresh display');
        await filterCallback({
          priceRange: {
            min: searchParams.minPrice ? parseFloat(searchParams.minPrice.replace('£', '')) : null,
            max: searchParams.maxPrice ? parseFloat(searchParams.maxPrice.replace('£', '')) : null
          },
          bloodTakingMethods: searchParams.method ? [searchParams.method] : [],
          biomarkers: searchParams.biomarkers || []
        });
      }
    }
    
    console.log('🔍 Filter panel initialization complete');
  } catch (error) {
    console.error('🔍 Error initializing filter panel with parameters:', error);
  }
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
    
    // Check if this is a testosterone-only search
    const testosteroneOnlyMatch = hash.match(/[?&]testosteroneOnly=([^&]+)/);
    const isTestosteroneOnly = testosteroneOnlyMatch && decodeURIComponent(testosteroneOnlyMatch[1]) === 'true';
    console.log('Is testosterone-only search:', isTestosteroneOnly);
    
    // Check if this is a testosterone full hormone profile search
    const testosteroneFullHormoneMatch = hash.match(/[?&]testosteroneFullHormone=([^&]+)/);
    const isTestosteroneFullHormone = testosteroneFullHormoneMatch && decodeURIComponent(testosteroneFullHormoneMatch[1]) === 'true';
    console.log('Is testosterone full hormone profile search:', isTestosteroneFullHormone);
    
    // Check if this is a male hormone check only search
    const testosteroneFullHormoneOnlyMatch = hash.match(/[?&]testosteroneFullHormoneOnly=([^&]+)/);
    const isTestosteroneFullHormoneOnly = testosteroneFullHormoneOnlyMatch && decodeURIComponent(testosteroneFullHormoneOnlyMatch[1]) === 'true';
    console.log('Is male hormone check only search:', isTestosteroneFullHormoneOnly);
    
    // Check if this is a male hormone check + general health check search
    const testosteroneFullHormoneGeneralHealthMatch = hash.match(/[?&]testosteroneFullHormoneGeneralHealth=([^&]+)/);
    const isTestosteroneFullHormoneGeneralHealth = testosteroneFullHormoneGeneralHealthMatch && decodeURIComponent(testosteroneFullHormoneGeneralHealthMatch[1]) === 'true';
    console.log('Is male hormone check + general health check search:', isTestosteroneFullHormoneGeneralHealth);
    
    // Check if this is a TRT monitoring search
    const trtMonitoringMatch = hash.match(/[?&]trtMonitoring=([^&]+)/);
    const isTRTMonitoring = trtMonitoringMatch && decodeURIComponent(trtMonitoringMatch[1]) === 'true';
    console.log('Is TRT monitoring search:', isTRTMonitoring);
    
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
    
    // Apply biomarker filtering
    if (selectedBiomarkers.length > 0) {
      console.log('🔍 APPLYING BIOMARKER FILTER for:', selectedBiomarkers);
      
      if (isTestosteroneOnly && selectedBiomarkers.includes('Testosterone')) {
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
          // Regular biomarker filtering
          console.log('🔍 APPLYING REGULAR BIOMARKER FILTERING');
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
        console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after biomarker filtering`);
        beforeFilter = tests.length;
      }
    } else {
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
    
    // Create filter panel with tests data - hide categories and problems for men's health page
          try {
        console.log('🔍 ABOUT TO CREATE FILTER PANEL - Tests count:', tests.length);
        const filterPanel = await createFilterPanel(tests, { hideCategories: true, hideProblems: true });
        console.log('🔍 FILTER PANEL CREATED - Tests count still:', tests.length);
        // Create and return the page structure
        const content = createPageStructure(filterPanel, null);
        // Add a custom event listener for when the content is rendered
        document.addEventListener('contentRendered', async () => {
          if (window._allGeneralHealthTests) {
            console.log('🔍 CONTENT RENDERED - Tests count in window._allGeneralHealthTests:', window._allGeneralHealthTests.length);
            // Set up the filter panel properly with search parameters
            initializePageElements(window._allGeneralHealthTests, null, false);
            
            // Initialize filter panel with search parameters if they exist
            if (window._searchParameters) {
              console.log('🔍 Initializing filter panel with search parameters:', window._searchParameters);
              await initializeFilterPanelWithParameters(window._searchParameters);
            }
          
          // Open filter panel if requested
          if (shouldOpenFilters) {
            console.log('=== FILTER DEBUG: Should open filters is true ===');
            
            // On desktop, just show the filter panel overlay
            setTimeout(() => {
              const filterPanel = document.querySelector('.filter-panel');
              console.log('=== FILTER DEBUG: Looking for filter panel ===');
              console.log('=== FILTER DEBUG: Filter panel found:', !!filterPanel);
              
              if (filterPanel) {
                console.log('=== FILTER DEBUG: Making filter panel visible ===');
                // Show the filter panel by triggering the same event as the Filters button
                const filtersBtn = document.querySelector('.filters-btn');
                if (filtersBtn) {
                  console.log('=== FILTER DEBUG: Found desktop filters button, clicking it ===');
                  filtersBtn.click();
                } else {
                  console.log('=== FILTER DEBUG: Desktop filters button not found ===');
                }
              } else {
                console.log('=== FILTER DEBUG: Filter panel not found ===');
              }
            }, 500);
          }
        } else {
          console.error('window._allGeneralHealthTests is not set!');
        }
      }, { once: true });
      
      
      return content;
    } catch (error) {
      console.error('=== ERROR: createFilterPanel failed ===');
      console.error('Error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  } catch (error) {
    console.error('Error loading general health page:', error);
    return createErrorContent();
  }
} 