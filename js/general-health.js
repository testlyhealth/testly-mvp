import { $, $all } from './dom.js';
import { CardService } from './services/cardService.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
import { basket } from './basket.js';
import { getUrl } from './config.js';
import { supabase } from './api/supabase.js';

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

// Store sort direction and test lists globally
let sortAscending = true;
let filteredTests = [];
let currentTests = [];

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
              <h4>${totalBiomarkers} biomarkers included</h4>
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
        <div class="card-actions">
          <button class="toggle-details" aria-expanded="false">Details</button>
          <button class="add-to-basket" data-test-id="${test.test_name}">Add to Basket</button>
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
function updateSortButtonText(ascending) {
  const sortBtn = document.querySelector('.sort-btn.mobile-only');
  if (sortBtn) {
    sortBtn.innerHTML = `Sort: Price ${ascending ? '&#8593;' : '&#8595;'}`;
  }
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
    
    // Update filter tags with results count
    const filterTagsContainer = document.querySelector('.filter-tags');
    if (filterTagsContainer) {
      const filterTagsList = filterTagsContainer.querySelector('.filter-tags-list');
      if (filterTagsList) {
        // Get current filter tags HTML
        const currentTags = filterTagsList.innerHTML;
        // Create results count HTML
        const resultsCountHTML = `
          <div class="results-count">
            <span>${enriched.length} result${enriched.length !== 1 ? 's' : ''}</span>
          </div>
        `;
        // Update the container
        filterTagsContainer.innerHTML = `
          <div class="filter-tags-list">
            ${currentTags}
          </div>
          ${resultsCountHTML}
        `;
      }
    }
    
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
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.toggle-biomarkers') || e.target.closest('.toggle-all-biomarkers')) {
        return;
      }
      
      hasInteracted = true;
      
      // Remove selection from all cards
      $all('.blood-test-card').forEach(c => c.classList.remove('selected'));
      
      // Add selection to clicked card
      card.classList.add('selected');
      lastHoveredCard = card;
    });
  });

  // Sort button
  const sortBtn = document.querySelector('.sort-btn.mobile-only');
  if (sortBtn) {
    const newSortBtn = sortBtn.cloneNode(true);
    sortBtn.parentNode.replaceChild(newSortBtn, sortBtn);
    newSortBtn.addEventListener('click', () => {
      sortAscending = !sortAscending;
      const sorted = sortTests(filteredTests, sortAscending);
      currentTests = sorted;
      updateTestGridContent(currentTests);
      updateSortButtonText(sortAscending);
    });
    updateSortButtonText(sortAscending);
  }

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
      // Do NOT set innerHTML or change the arrow here; let CSS handle rotation
    });
  });

  // Group headers
  $all('.group-header').forEach(header => {
    header.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const group = header.closest('.biomarker-group');
      const biomarkerItems = group.querySelector('.biomarker-items');
      const toggleButton = group.querySelector('.toggle-biomarkers');
      const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
      biomarkerItems.classList.toggle('hidden');
      toggleButton.setAttribute('aria-expanded', !isExpanded);
      // Do NOT swap the arrow character; let CSS handle rotation
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
          // Do NOT swap the arrow character; let CSS handle rotation
        }
      });
      // Update the "Show all" button
      button.setAttribute('aria-expanded', !isExpanded);
    });
  });
}

// Function to create general health title
function createGeneralHealthTitle() {
  return `
    <section class="general-health-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Compare <span style="color: #1E88E5;">blood tests</span>
        </h1>
        <p class="hero-subtitle">
          Blood tests from accredited labs covering the health of your <strong class="gh-em">heart</strong>, <strong class="gh-em">liver</strong>, <strong class="gh-em">kidneys</strong>, <strong class="gh-em">cholesterol</strong>, <strong class="gh-em">vitamins</strong> and more.
        </p>
      </div>
    </section>
  `;
}

// Function to create page structure
function createPageStructure(filterPanel, testsGrid) {
  return `
    <div class="page-container">
      ${createGeneralHealthTitle()}
      <div class="results-container"><aside class="filter-panel">
          <div class="filter-panel-content">
            ${filterPanel}
          </div>
        </aside><div class="main-content">
          <div class="filter-tags"></div>
          <div class="mobile-filter-buttons">
            <div class="left-buttons">
              <button class="filters-btn mobile-only" aria-label="Open filters">Filters</button>
              <button class="sort-btn mobile-only" aria-label="Sort results">Sort: Price &#8593;</button>
            </div>
            <button class="advanced-search-btn mobile-only" aria-label="Advanced search">Advanced search</button>
          </div>
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
async function initializePageElements(tests) {
  console.log('Initializing page elements with', tests.length, 'tests');
  const testsGrid = $('.products-grid');
  if (!testsGrid) {
    console.error('Products grid not found');
    return;
  }
  filteredTests = tests;
  currentTests = sortTests(filteredTests, sortAscending);
  const cards = await cardService.createCards(currentTests);
  testsGrid.innerHTML = cards;
  setupFilterPanel(tests, async (filterState) => {
    console.log('=== DEBUG: Filter Panel Callback ===');
    console.log('Filter panel callback called with:', filterState);
    console.log('Initial tests passed to filter panel:', tests.length);
    
    // Handle both filter state objects and filtered test arrays
    if (Array.isArray(filterState)) {
      // Legacy case: filterState is an array of filtered tests
      filteredTests = filterState;
      sortAscending = true;
      updateSortButtonText(sortAscending);
      currentTests = sortTests(filteredTests, sortAscending);
      updateTestGridContent(currentTests);
    } else {
      // New case: filterState is an object with categories, providers, etc.
      const selectedCategories = filterState.categories || [];
      const selectedProviders = filterState.providers || [];
      
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
      
      console.log('=== DEBUG: Filter Panel Fetching ===');
      console.log('Selected categories:', selectedCategories);
      console.log('Selected providers:', selectedProviders);
      
      if (selectedCategories.length > 0) {
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
        // No categories selected, fetch all tests
        allEnrichedTests = await fetchAndEnrichTests({ 
          category: null,
          provider: selectedProviders.length > 0 ? selectedProviders[0] : null 
        });
        console.log('Fetched all tests:', allEnrichedTests.length);
      }
      
      // Apply biomarker filtering if biomarkers are selected
      if (selectedBiomarkers.length > 0) {
        console.log('Applying biomarker filter to', allEnrichedTests.length, 'tests');
        console.log('Looking for biomarkers:', selectedBiomarkers);
        
        allEnrichedTests = allEnrichedTests.filter(test => {
          const testBiomarkers = test.biomarker_names || [];
          console.log(`Test "${test.name}" has biomarkers:`, testBiomarkers);
          
          const hasAllBiomarkers = selectedBiomarkers.every(searchBiomarker => {
            // Normalize the search biomarker (replace + with space, lowercase)
            const normalizedSearch = searchBiomarker.toLowerCase().replace(/\+/g, ' ');
            
            // Check if any test biomarker matches (case insensitive, handle + vs space)
            const hasMatch = testBiomarkers.some(testBiomarker => {
              if (!testBiomarker) return false;
              const normalizedTest = testBiomarker.toLowerCase().replace(/\+/g, ' ');
              return normalizedTest === normalizedSearch;
            });
            
            if (!hasMatch) {
              console.log(`  Missing biomarker: "${searchBiomarker}" (normalized: "${normalizedSearch}")`);
            }
            return hasMatch;
          });
          
          if (!hasAllBiomarkers) {
            console.log(`Filtering out test "${test.name}" - missing biomarkers. Test has:`, testBiomarkers, 'Looking for:', selectedBiomarkers);
          }
          return hasAllBiomarkers;
        });
        console.log('After biomarker filtering:', allEnrichedTests.length, 'tests remaining');
      } else {
        console.log('No biomarker filter applied');
      }
      
      const enriched = allEnrichedTests;
      
      console.log('Final enriched tests:', enriched.length);
      
      filteredTests = enriched;
      sortAscending = true;
      updateSortButtonText(sortAscending);
      currentTests = sortTests(filteredTests, sortAscending);
      
      // Update the global tests to match what we're displaying
      window._allGeneralHealthTests = enriched;
      console.log('=== DEBUG: Filter Panel Callback Update ===');
      console.log('Updated window._allGeneralHealthTests to', enriched.length, 'tests');
      console.log('Test names:', enriched.map(t => t.name));
      
      updateTestGridContent(currentTests);
    }
  });
  setTimeout(() => {
    document.dispatchEvent(new Event('filterPanelReady'));
  }, 0);
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
async function fetchAndEnrichTests({ category = null, provider = null } = {}) {
  let tests = [];
  // 1. Fetch tests (with provider info, filtered by category/provider if needed)
  if (category) {
    // Handle multiple categories (comma-separated)
    const categories = category.split(',').map(cat => cat.trim());
    console.log('Looking for categories in database:', categories);
    
    let allTestIds = [];
    
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
    
    // Remove duplicates
    allTestIds = [...new Set(allTestIds)];
    console.log('Total unique test IDs found:', allTestIds.length);
    
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
  const testIds = tests.map(t => t.id);
  let biomarkerLinks = [];
  let biomarkerIds = [];
  let biomarkers = [];
  let methodLinks = [];
  let allMethods = [];
  if (testIds.length > 0) {
    const { data: links, error: linkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', testIds);
    if (linkError) throw linkError;
    biomarkerLinks = links;
    biomarkerIds = [...new Set(links.map(l => l.biomarker_id))];

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
  }
  if (biomarkerIds.length > 0) {
    const { data: biomarkerRows, error: biomarkerError } = await supabase
      .from('biomarkers')
      .select('id, name, group_links:biomarker_groupings_link_table(grouping:biomarker_groupings(name))')
      .in('id', biomarkerIds);
    if (biomarkerError) throw biomarkerError;
    biomarkers = biomarkerRows;
  }
  // 3. Attach grouped biomarkers, flat biomarker names, and blood taking methods to each test
  tests.forEach(test => {
    const links = biomarkerLinks.filter(link => link.provider_blood_test_id === test.id);
    const grouped = {};
    const biomarkerNames = [];
    links.forEach(link => {
      const biomarker = biomarkers.find(b => b.id === link.biomarker_id);
      if (!biomarker) return;
      biomarkerNames.push(biomarker.name);
      if (Array.isArray(biomarker.group_links) && biomarker.group_links.length > 0) {
        biomarker.group_links.forEach(gl => {
          const groupName = gl.grouping?.name || 'Other';
          if (!grouped[groupName]) grouped[groupName] = [];
          grouped[groupName].push(biomarker.name);
        });
      } else {
        if (!grouped['Other']) grouped['Other'] = [];
        grouped['Other'].push(biomarker.name);
      }
    });
    test.grouped_biomarkers = grouped;
    test.biomarker_count = links.length;
    test.biomarker_names = biomarkerNames;
    // Attach blood taking methods
    const methodIds = methodLinks.filter(l => l.provider_blood_test_id === test.id).map(l => l.blood_taking_method_id);
    test.blood_taking_methods = allMethods.filter(m => methodIds.includes(m.id)).map(m => m.name);
  });
  return tests;
}

// Export the main function
export async function displayGeneralHealthPage() {
  try {
    // --- Parse biomarkers from URL hash ---
    const hash = window.location.hash;
    let selectedCategory = null;
    let selectedBiomarkers = [];
    const filterMatch = hash.match(/[?&]filter=([^&]+)/);
    const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
    if (filterMatch) {
      selectedCategory = decodeURIComponent(filterMatch[1]);
      // Fix the category name - replace + with space
      selectedCategory = selectedCategory.replace(/\+/g, ' ');
      console.log('Selected category from URL:', selectedCategory);
    }
    if (biomarkerMatch) {
      selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
      console.log('Selected biomarkers from URL:', selectedBiomarkers);
    }
    
    console.log('=== DEBUG: URL Parameters ===');
    console.log('Full hash:', hash);
    console.log('Selected category:', selectedCategory);
    console.log('Selected biomarkers:', selectedBiomarkers);

    // --- Fetch and enrich tests ---
    let tests;
    console.log('=== DEBUG: Fetch Strategy ===');
    if (selectedBiomarkers.length > 0) {
      console.log('Biomarkers detected, checking if category also selected...');
      // If both category and biomarkers are selected, fetch from category first, then filter by biomarkers
      if (selectedCategory) {
        console.log('Both category and biomarkers selected. Fetching from category:', selectedCategory);
        tests = await fetchAndEnrichTests({ category: selectedCategory });
        console.log('Tests fetched from category:', tests.length);
        console.log('Sample test biomarker names:', tests.slice(0, 2).map(t => t.biomarker_names));
        
        // Filter to only those that include ALL selected biomarkers (case-insensitive)
        const beforeFilter = tests.length;
        tests = tests.filter(test => {
          const hasAllBiomarkers = selectedBiomarkers.every(biomarker =>
            (test.biomarker_names || []).some(name => name && name.toLowerCase() === biomarker.toLowerCase())
          );
          if (!hasAllBiomarkers) {
            console.log(`Filtering out test "${test.name}" - missing biomarkers. Test has:`, test.biomarker_names, 'Looking for:', selectedBiomarkers);
          }
          return hasAllBiomarkers;
        });
        console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after biomarker filtering`);
        console.log('Remaining tests:', tests.map(t => ({ name: t.name, biomarkers: t.biomarker_names, count: t.biomarker_count })));
      } else {
        console.log('Only biomarkers selected, fetching all tests');
        // Only biomarkers selected, fetch all tests and filter by biomarkers
        tests = await fetchAndEnrichTests({});
        console.log('All tests fetched:', tests.length);
        
        // Filter to only those that include ALL selected biomarkers (case-insensitive)
        const beforeFilter = tests.length;
        tests = tests.filter(test => {
          const hasAllBiomarkers = selectedBiomarkers.every(biomarker =>
            (test.biomarker_names || []).some(name => name && name.toLowerCase() === biomarker.toLowerCase())
          );
          if (!hasAllBiomarkers) {
            console.log(`Filtering out test "${test.name}" - missing biomarkers. Test has:`, test.biomarker_names, 'Looking for:', selectedBiomarkers);
          }
          return hasAllBiomarkers;
        });
        console.log(`Filtered from ${beforeFilter} to ${tests.length} tests after biomarker filtering`);
        console.log('Remaining tests:', tests.map(t => ({ name: t.name, biomarkers: t.biomarker_names, count: t.biomarker_count })));
      }
    } else {
      console.log('No biomarkers selected, fetching from category:', selectedCategory);
      tests = await fetchAndEnrichTests({ category: selectedCategory });
      console.log('Tests fetched:', tests.length);
    }
    window._allGeneralHealthTests = tests;
    console.log('=== DEBUG: Setting Global Tests ===');
    console.log('Setting window._allGeneralHealthTests to', tests.length, 'tests');
    console.log('Test names:', tests.map(t => t.name));
    
    // Create filter panel with tests data
    const filterPanel = await createFilterPanel(tests);
    // Create and return the page structure
    const content = createPageStructure(filterPanel, null);
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