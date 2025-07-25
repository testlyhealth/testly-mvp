import { $, $all } from './dom.js';
import { supabase } from './api/supabase.js';

// Add this helper function at the top of the file, after the imports
function generateSafeId(text) {
  return text.toLowerCase()
    .replace(/[&]/g, 'and')  // Replace & with 'and'
    .replace(/[^a-z0-9-]/g, '-')  // Replace other special chars with hyphens
    .replace(/-+/g, '-')  // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
}

// Helper: Fetch biomarkers for a grouping from Supabase
async function fetchBiomarkersForGrouping(groupingName) {
  // 1. Get grouping id
  const { data: groupRows, error: groupError } = await supabase
    .from('biomarker_groupings')
    .select('id')
    .eq('name', groupingName)
    .limit(1);
  if (groupError || !groupRows || groupRows.length === 0) return [];
  const groupingId = groupRows[0].id;

  // 2. Get biomarker ids for this grouping
  const { data: linkRows, error: linkError } = await supabase
    .from('biomarker_groupings_link_table')
    .select('biomarker_id')
    .eq('biomarker_grouping_id', groupingId);
  if (linkError || !linkRows || linkRows.length === 0) return [];
  const biomarkerIds = linkRows.map(row => row.biomarker_id);

  // 3. Get biomarker names
  const { data: biomarkerRows, error: biomarkerError } = await supabase
    .from('biomarkers')
    .select('id, name')
    .in('id', biomarkerIds)
    .order('name');
  if (biomarkerError || !biomarkerRows) return [];
  return biomarkerRows;
}

// Function to create the filter panel HTML
export async function createFilterPanel(tests) {
  // Get price range
  const prices = tests.map(test => test.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Fetch categories from Supabase
  let categories = [];
  try {
    const { data, error } = await supabase.from('blood_test_categories').select('*').order('name');
    if (error) throw error;
    categories = data.map(cat => cat.name);
  } catch (e) {
    // Fallback to hardcoded if fetch fails
    categories = [
      'General Health',
      'Hormone Health',
      'Heart Health',
      'Performance',
      'Thyroid',
      'Fertility',
      'Vitamins & Minerals'
    ];
  }
  
  // Fetch providers from Supabase
  let providers = [];
  try {
    const { data, error } = await supabase.from('providers').select('*').order('name');
    if (error) throw error;
    providers = data.map(p => p.name);
    console.log('Supabase providers:', providers);
  } catch (e) {
    // Fallback to unique providers from tests if fetch fails
    providers = [...new Set(tests.map(test => test.provider))];
    console.log('Fallback providers:', providers);
  }
  
  // Fetch biomarker groupings from Supabase
  let biomarkerGroupings = [];
  try {
    console.log('Fetching biomarker groupings from database...');
    const { data, error } = await supabase.from('biomarker_groupings').select('name').order('name');
    console.log('Raw biomarker groupings data:', data);
    console.log('Biomarker groupings error:', error);
    
    if (error) throw error;
    biomarkerGroupings = data.map(group => group.name);
    console.log('Processed biomarker groupings:', biomarkerGroupings);
    console.log('Number of groupings found:', biomarkerGroupings.length);
    console.log('Rendering', biomarkerGroupings.length, 'biomarker groupings in HTML');
  } catch (e) {
    console.error('Error fetching biomarker groupings:', e);
    // Fallback to empty array if fetch fails
    biomarkerGroupings = [];
  }
  
  // If no groupings found in database, use fallback list
  if (biomarkerGroupings.length === 0) {
    console.log('No groupings found in database, using fallback list');
    biomarkerGroupings = [
      'Allergy testing',
      'Autoimmune disease',
      'Blood group, disorders and clotting',
      'Cardiovascular health',
      'Diabetes and glucose metabolism',
      'Digestive health',
      'Energy and metabolism',
      'Fertility and reproductive health',
      'General health',
      'Hormone health',
      'Immune system',
      'Kidney and liver function',
      'Mental health and stress',
      'Muscle and bone health',
      'Nutrition and vitamins',
      'Sexual health',
      'Sleep and recovery',
      'Thyroid function',
      'Weight management'
    ];
  }
  
  // Check for a filter query parameter in the URL
  let selectedCategory = null;
  let allCategoriesSelected = false;
  try {
    const urlHash = window.location.hash;
    const filterMatch = urlHash.match(/[?&]filter=([^&]+)/);
    if (filterMatch) {
      selectedCategory = decodeURIComponent(filterMatch[1]);
      // Fix the category name - replace + with space
      selectedCategory = selectedCategory.replace(/\+/g, ' ');
      // If filter=all, treat as all categories selected
      if (selectedCategory === 'all') {
        allCategoriesSelected = true;
        selectedCategory = null;
      } else if (selectedCategory.includes(',')) {
        const selectedCategories = selectedCategory.split(',').map(cat => cat.trim());
        // If the number of selected categories matches the total number of categories, treat as "all"
        if (selectedCategories.length >= 15) { // We have 15 categories in the database
          allCategoriesSelected = true;
        }
      }
    }
  } catch (e) {}

  return `
    <div class="filter-panel-content">
      
      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Price</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="price-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="price-options" style="display: none;">
          <div class="price-range">
            <span id="price-min-value">£${minPrice.toFixed(2)}</span> - <span id="price-max-value">£${maxPrice.toFixed(2)}</span>
          </div>
          <div class="price-slider">
            <input type="range" id="price-min" min="${minPrice}" max="${maxPrice}" value="${minPrice}" step="1">
            <input type="range" id="price-max" min="${minPrice}" max="${maxPrice}" value="${maxPrice}" step="1">
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Categories</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="category-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="category-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="category-all" ${allCategoriesSelected || !selectedCategory ? 'checked' : ''}>
              <label for="category-all">All Categories</label>
            </div>
            ${categories.map(category => `
              <div class="checkbox-option">
                <input type="checkbox" id="category-${generateSafeId(category)}" class="category-checkbox" value="${category}" ${(selectedCategory && !allCategoriesSelected ? (selectedCategory === category ? 'checked' : '') : (!selectedCategory ? (category === 'General health' ? 'checked' : '') : ''))}>
                <label for="category-${generateSafeId(category)}">${category}</label>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Biomarkers</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="biomarker-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="biomarker-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="biomarker-all" checked>
              <label for="biomarker-all">All Biomarkers</label>
            </div>
            ${biomarkerGroupings.map(grouping => `
              <div class="biomarker-grouping">
                <div class="grouping-header">
                  <button class="grouping-toggle-btn" aria-expanded="false" aria-controls="grouping-${generateSafeId(grouping)}">
                    <span class="grouping-toggle-icon">▼</span>
                    <span class="grouping-name">${grouping}</span>
                  </button>
                </div>
                <div class="grouping-content" id="grouping-${generateSafeId(grouping)}" style="display: none;">
                  <div class="grouping-checkboxes">
                    <!-- Individual biomarkers will be loaded dynamically when grouping is expanded -->
                    <div class="loading-indicator">Loading biomarkers...</div>
                  </div>
                </div>
              </div>
            `).join('')}
            ${biomarkerGroupings.length === 0 ? '<div style="color: #6b7280; font-style: italic; padding: 0.5rem;">No biomarker groupings found</div>' : ''}
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Providers</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="provider-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="provider-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="provider-all" checked>
              <label for="provider-all">All Providers</label>
            </div>
            ${providers.map(provider => `
              <div class="checkbox-option">
                <input type="checkbox" id="provider-${provider.toLowerCase().replace(/\s+/g, '-')}" class="provider-checkbox" value="${provider}">
                <label for="provider-${provider.toLowerCase().replace(/\s+/g, '-')}" >${provider}</label>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Blood taking method</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="blood-method-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="blood-method-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-all" checked>
              <label for="blood-method-all">All Methods</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-home" class="blood-method-checkbox" value="Home test">
              <label for="blood-method-home">Home test/finger prick</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-clinic" class="blood-method-checkbox" value="Clinic visit">
              <label for="blood-method-clinic">Clinic visit venous test</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-phlebotomist" class="blood-method-checkbox" value="Phlebotomist to home">
              <label for="blood-method-phlebotomist">Phlebotomist to house</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-self" class="blood-method-checkbox" value="Self arrange">
              <label for="blood-method-self">Self arrange test</label>
            </div>
          </div>
        </div>
      </div>


    </div>
  `;
}

// Track last min/max price for robust slider reset
let lastMinPrice = null;
let lastMaxPrice = null;

// Function to setup filter panel functionality
export function setupFilterPanel(tests, updateCallback, rootPanel = null) {
  // Always re-query the latest filter panel content from the DOM
  let filterPanel = rootPanel || document.querySelector('.filter-panel-content');
  if (!filterPanel) {
    const filterPanelContainer = document.querySelector('.filter-panel');
    if (filterPanelContainer) {
      filterPanel = filterPanelContainer.querySelector('.filter-panel-content');
    }
  }
  if (!filterPanel) {
    console.error('Filter panel not found. Available elements:', {
      filterPanelContent: document.querySelector('.filter-panel-content'),
      filterPanel: document.querySelector('.filter-panel'),
      mainContent: document.querySelector('.main-content')
    });
    return;
  }

  // Always re-query the latest DOM elements for controls
  const priceMin = filterPanel.querySelector('#price-min');
  const priceMax = filterPanel.querySelector('#price-max');
  const priceMinValue = filterPanel.querySelector('#price-min-value');
  const priceMaxValue = filterPanel.querySelector('#price-max-value');
  const providerAll = filterPanel.querySelector('#provider-all');
  const providerCheckboxes = filterPanel.querySelectorAll('.provider-checkbox');
  const categoryAll = filterPanel.querySelector('#category-all');
  const categoryCheckboxes = filterPanel.querySelectorAll('.category-checkbox');
  const bloodMethodAll = filterPanel.querySelector('#blood-method-all');
  const bloodMethodCheckboxes = filterPanel.querySelectorAll('.blood-method-checkbox');
  const doctorsReport = filterPanel.querySelector('#doctors-report');
  const resetFiltersBtn = filterPanel.querySelector('#reset-filters');

  // Setup toggle functionality for collapsible sections
  const toggleButtons = filterPanel.querySelectorAll('.filter-toggle-btn');
  const filterHeaders = filterPanel.querySelectorAll('.filter-section-header');
  
  // Function to toggle section
  function toggleSection(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const targetId = button.getAttribute('aria-controls');
    const targetContent = filterPanel.querySelector(`#${targetId}`);
    const toggleIcon = button.querySelector('.toggle-icon');
    
    if (targetContent) {
      if (isExpanded) {
        // Collapse
        targetContent.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');
        toggleIcon.textContent = '▼';
        
        // Remove biomarker-expanded class if this was the biomarker section
        if (targetId === 'biomarker-options') {
          filterPanel.classList.remove('biomarker-expanded');
        }
      } else {
        // Expand
        targetContent.style.display = 'block';
        button.setAttribute('aria-expanded', 'true');
        toggleIcon.textContent = '▲';
        
        // Add biomarker-expanded class if this is the biomarker section
        if (targetId === 'biomarker-options') {
          filterPanel.classList.add('biomarker-expanded');
        }
      }
    }
  }
  
  // Add click handlers to toggle buttons
  toggleButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSection(button);
    });
  });
  
  // Add click handlers to filter headers
  filterHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      // Don't trigger if clicking on the toggle button itself
      if (e.target.closest('.filter-toggle-btn')) {
        return;
      }
      e.preventDefault();
      const button = header.querySelector('.filter-toggle-btn');
      if (button) {
        toggleSection(button);
      }
    });
  });

  // Add click handlers to biomarker grouping toggle buttons
  const groupingToggleButtons = filterPanel.querySelectorAll('.grouping-toggle-btn');
  groupingToggleButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const targetId = button.getAttribute('aria-controls');
      const targetContent = filterPanel.querySelector(`#${targetId}`);
      const toggleIcon = button.querySelector('.grouping-toggle-icon');
      if (targetContent) {
        if (isExpanded) {
          // Collapse
          targetContent.style.display = 'none';
          button.setAttribute('aria-expanded', 'false');
          toggleIcon.textContent = '▼';
        } else {
          // Expand
          targetContent.style.display = 'block';
          button.setAttribute('aria-expanded', 'true');
          toggleIcon.textContent = '▲';
          // Lazy load biomarkers if not already loaded
          const checkboxesContainer = targetContent.querySelector('.grouping-checkboxes');
          if (checkboxesContainer && !checkboxesContainer.dataset.loaded) {
            const groupName = button.querySelector('.grouping-name').textContent;
            checkboxesContainer.innerHTML = '';
            const biomarkers = await fetchBiomarkersForGrouping(groupName);
            if (biomarkers.length > 0) {
              // Get selected biomarkers from URL hash
              let selectedBiomarkers = [];
              const hash = window.location.hash;
              const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
              if (biomarkerMatch) {
                selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim());
              }
              checkboxesContainer.innerHTML = biomarkers.map(b => `
                <div class="checkbox-option">
                  <input type="checkbox" class="biomarker-checkbox" id="biomarker-${b.id}" value="${b.name}"${selectedBiomarkers.includes(b.name) ? ' checked' : ''}>
                  <label for="biomarker-${b.id}">${b.name}</label>
                </div>
              `).join('');
            } else {
              checkboxesContainer.innerHTML = '<div class="loading-indicator">No biomarkers found</div>';
            }
            checkboxesContainer.dataset.loaded = 'true';
            // Add event listeners to biomarker checkboxes
            checkboxesContainer.querySelectorAll('.biomarker-checkbox').forEach(cb => {
              cb.addEventListener('change', (e) => {
                // Use URL hash as source of truth for selected biomarkers
                let selectedBiomarkers = [];
                const hash = window.location.hash;
                const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
                if (biomarkerMatch) {
                  selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
                }
                const biomarkerName = cb.value;
                if (cb.checked) {
                  if (!selectedBiomarkers.includes(biomarkerName)) {
                    selectedBiomarkers.push(biomarkerName);
                  }
                } else {
                  selectedBiomarkers = selectedBiomarkers.filter(b => b !== biomarkerName);
                }
                // --- Preserve all other params in the hash ---
                // Parse hash into base and params
                let [base, paramStr] = window.location.hash.split('?');
                base = base || '#/general-health';
                let params = new URLSearchParams(paramStr || '');
                // Update biomarkers param
                if (selectedBiomarkers.length > 0) {
                  params.set('biomarkers', selectedBiomarkers.join(','));
                } else {
                  params.delete('biomarkers');
                }
                // Remove empty params
                for (const [key, value] of params.entries()) {
                  if (!value) params.delete(key);
                }
                // Rebuild hash
                const newHash = params.toString() ? `${base}?${params.toString()}` : base;
                window.location.hash = newHash;
              });
            });
          }
        }
      }
    });
  });

  // Create filter tags container in the appropriate location
  let filterTagsContainer = document.querySelector('.filter-tags');
  if (!filterTagsContainer) {
    filterTagsContainer = document.createElement('div');
    filterTagsContainer.className = 'filter-tags';
    
    // Insert into main-content before the mobile filter buttons
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const mobileFilterButtons = mainContent.querySelector('.mobile-filter-buttons');
      if (mobileFilterButtons) {
        mainContent.insertBefore(filterTagsContainer, mobileFilterButtons);
      } else {
        // If no mobile filter buttons, insert at the start of main-content
        mainContent.insertBefore(filterTagsContainer, mainContent.firstChild);
      }
    }
  }

  // Get selected category from URL
  let selectedCategory = null;
  let allCategoriesSelected = false;
  try {
    const urlHash = window.location.hash;
    const filterMatch = urlHash.match(/[?&]filter=([^&]+)/);
    if (filterMatch) {
      selectedCategory = decodeURIComponent(filterMatch[1]);
      // Fix the category name - replace + with space
      selectedCategory = selectedCategory.replace(/\+/g, ' ');
      // If filter=all, treat as all categories selected
      if (selectedCategory === 'all') {
        allCategoriesSelected = true;
        selectedCategory = null;
      } else if (selectedCategory.includes(',')) {
        const selectedCategories = selectedCategory.split(',').map(cat => cat.trim());
        // If the number of selected categories matches the total number of categories, treat as "all"
        if (selectedCategories.length >= 15) { // We have 15 categories in the database
          allCategoriesSelected = true;
        }
      }
    }
  } catch (e) {}

  console.log('=== DEBUG: Filter Panel Setup ===');
  console.log('URL hash:', window.location.hash);
  console.log('Selected category from URL:', selectedCategory);
  console.log('Number of tests passed to filter panel:', tests.length);

  let currentFilters = {
    priceRange: {
      min: Math.min(...tests.map(test => test.price)),
      max: Math.max(...tests.map(test => test.price))
    },
    providers: [],
    locations: [],
    categories: allCategoriesSelected ? [] : (selectedCategory ? [selectedCategory] : []),
    bloodTakingMethods: [],
    doctorsReport: false
  };
  
  console.log('Initial currentFilters:', currentFilters);

  // Initialize filter tags with current filters
  if (filterTagsContainer) {
    // Don't show results count on initial load since we don't have filtered results yet
    updateFilterTags(currentFilters, null);
  } else {
    console.error('Failed to create filter tags container');
  }

  // Function to create filter tags HTML
  function createFilterTags(filters, resultsCount = null) {
    console.log('=== DEBUG: Creating Filter Tags ===');
    console.log('Filters object:', filters);
    console.log('Categories in filters:', filters.categories);
    
    const tags = [];
    // Provider tags
    if (filters.providers.length > 0) {
      filters.providers.forEach(provider => {
        tags.push(`
          <div class="filter-tag" data-type="provider" data-value="${provider}">
            <span>Provider: ${provider}</span>
            <button class="remove-tag" aria-label="Remove provider filter">×</button>
          </div>
        `);
      });
    }
    // Category tags
    if (filters.categories.length > 0) {
      console.log('Creating category tags for:', filters.categories);
      filters.categories.forEach(category => {
        tags.push(`
          <div class="filter-tag" data-type="category" data-value="${category}">
            <span>Category: ${category}</span>
            <button class="remove-tag" aria-label="Remove category filter">×</button>
          </div>
        `);
      });
    } else {
      // Show "All Categories" tag if allCategoriesSelected is true
      if (allCategoriesSelected) {
        console.log('Creating "All Categories" tag');
        tags.push(`
          <div class="filter-tag" data-type="category-all">
            <span>Category: All</span>
            <button class="remove-tag" aria-label="Remove all categories filter">×</button>
          </div>
        `);
      } else {
        console.log('No categories to create tags for');
      }
    }
    // Blood taking method tags
    if (filters.bloodTakingMethods.length > 0) {
      console.log('Creating blood taking method tags for:', filters.bloodTakingMethods);
      filters.bloodTakingMethods.forEach(method => {
        tags.push(`
          <div class="filter-tag" data-type="bloodMethod" data-value="${method}">
            <span>Method: ${method}</span>
            <button class="remove-tag" aria-label="Remove blood taking method filter">×</button>
          </div>
        `);
      });
    }
    // Doctor's report tag
    if (filters.doctorsReport) {
      tags.push(`
        <div class="filter-tag" data-type="doctorsReport">
          <span>Doctor's Report</span>
          <button class="remove-tag" aria-label="Remove doctor's report filter">×</button>
        </div>
      `);
    }
    // --- Biomarker tags from URL ---
    const hash = window.location.hash;
    const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
    if (biomarkerMatch) {
      const selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
      selectedBiomarkers.forEach(biomarker => {
        // Normalize biomarker name for display (replace + with space)
        const displayName = biomarker.replace(/\+/g, ' ');
        tags.push(`
          <div class="filter-tag" data-type="biomarker" data-value="${biomarker}">
            <span>${displayName}</span>
            <button class="remove-tag" aria-label="Remove biomarker">×</button>
          </div>
        `);
      });
    }
    
    // Create the filter tags container with results count and sort button
    const filterTagsHTML = tags.join('');
    const resultsCountHTML = resultsCount !== null ? `
      <div class="results-controls">
        <div class="results-count">
          <span>${resultsCount} result${resultsCount !== 1 ? 's' : ''}</span>
        </div>
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
    ` : '';
    
    return `
      <div class="filter-tags-container">
        <div class="filter-tags-list">
          ${filterTagsHTML}
        </div>
        ${resultsCountHTML}
      </div>
    `;
  }

  // Function to update filter tags
  function updateFilterTags(filters, resultsCount = null) {
    const filterTagsContainer = document.querySelector('.filter-tags');
    if (!filterTagsContainer) {
      console.warn('Filter tags container not found');
      return;
    }
    const tagsHTML = createFilterTags(filters, resultsCount);
    filterTagsContainer.innerHTML = tagsHTML;
    
    // Debug: Check if remove buttons are found
    const removeButtons = filterTagsContainer.querySelectorAll('.remove-tag');
    console.log('Found', removeButtons.length, 'remove buttons');
    
    // Add event listener to desktop sort dropdown
    const sortDropdown = filterTagsContainer.querySelector('.sort-dropdown.desktop-only');
    if (sortDropdown) {
      const sortBtn = sortDropdown.querySelector('.sort-btn');
      const dropdownMenu = sortDropdown.querySelector('.sort-dropdown-menu');
      const sortOptions = dropdownMenu.querySelectorAll('.sort-option');
      
      // Get current sort state from global variable or default to relevance
      const currentSortType = window.sortType !== undefined ? window.sortType : 'relevance';
      
      // Update button text based on current sort
      updateSortButtonText(sortBtn, currentSortType);
      
      // Toggle dropdown on button click
      sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = sortBtn.getAttribute('aria-expanded') === 'true';
        sortBtn.setAttribute('aria-expanded', !isExpanded);
        dropdownMenu.style.display = isExpanded ? 'none' : 'block';
      });
      
      // Handle sort option clicks
      sortOptions.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const sortType = option.getAttribute('data-sort');
          window.sortType = sortType;
          
          // Update button text
          updateSortButtonText(sortBtn, sortType);
          
          // Close dropdown
          sortBtn.setAttribute('aria-expanded', 'false');
          dropdownMenu.style.display = 'none';
          
          // Trigger sort callback if available
          if (window.sortCallback) {
            window.sortCallback(sortType);
          }
        });
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!sortDropdown.contains(e.target)) {
          sortBtn.setAttribute('aria-expanded', 'false');
          dropdownMenu.style.display = 'none';
        }
      });
    }
    
    // Helper function to update sort button text
    function updateSortButtonText(button, sortType) {
      switch (sortType) {
        case 'price-asc':
          button.innerHTML = 'Sort: Price <span class="sort-arrow">▲</span>';
          break;
        case 'price-desc':
          button.innerHTML = 'Sort: Price <span class="sort-arrow">▼</span>';
          break;
        case 'relevance':
          button.innerHTML = 'Sort: Relevance';
          break;
      }
    }
    
    // Add event listeners to remove buttons (event delegation)
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
        // Parse hash into base and params
        let [base, paramStr] = window.location.hash.split('?');
        base = base || '#/general-health';
        let params = new URLSearchParams(paramStr || '');
        if (type === 'category') {
          // Remove this category from filter param
          let filterVal = params.get('filter') || '';
          let cats = filterVal.split(',').map(c => c.trim()).filter(Boolean);
          cats = cats.filter(c => c !== value);
          if (cats.length > 0) {
            params.set('filter', cats.join(','));
          } else {
            params.set('filter', 'all');
          }
        } else if (type === 'category-all') {
          // Remove all categories, fallback to default (e.g., general-health)
          params.set('filter', 'general-health');
        } else if (type === 'biomarker') {
          // Remove this biomarker from biomarkers param
          let biomarkerVal = params.get('biomarkers') || '';
          let biomarkers = biomarkerVal.split(',').map(b => b.trim()).filter(Boolean);
          biomarkers = biomarkers.filter(b => b !== value);
          if (biomarkers.length > 0) {
            params.set('biomarkers', biomarkers.join(','));
          } else {
            params.delete('biomarkers');
          }
        } else if (type === 'provider') {
          // Remove this provider from providers param
          let providerVal = params.get('providers') || '';
          let providers = providerVal.split(',').map(p => p.trim()).filter(Boolean);
          providers = providers.filter(p => p !== value);
          if (providers.length > 0) {
            params.set('providers', providers.join(','));
          } else {
            params.delete('providers');
          }
        } else if (type === 'bloodMethod') {
          // Remove this blood taking method by unchecking the corresponding checkbox
          const checkbox = filterPanel.querySelector(`#blood-method-${value.toLowerCase().replace(/\s+/g, '-')}`);
          if (checkbox) {
            checkbox.checked = false;
            // Update "All Methods" checkbox if needed
            const allChecked = Array.from(bloodMethodCheckboxes).every(cb => cb.checked);
            if (bloodMethodAll) {
              bloodMethodAll.checked = allChecked;
            }
            // Reapply filters
            applyFilters().catch(console.error);
          }
        }
        // Remove empty params
        for (const [key, val] of params.entries()) {
          if (!val) params.delete(key);
        }
        // Rebuild hash
        const newHash = params.toString() ? `${base}?${params.toString()}` : base;
        window.location.hash = newHash;
      });
    }
  }

  // Function to apply filters
  async function applyFilters() {
    console.log('applyFilters called', currentFilters);
    // Update current filters
    currentFilters = {
      priceRange: {
        min: parseFloat(priceMin.value),
        max: parseFloat(priceMax.value)
      },
      providers: Array.from(providerCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      locations: [],
      categories: categoryAll && categoryAll.checked ? [] : Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      bloodTakingMethods: bloodMethodAll && bloodMethodAll.checked ? [] : Array.from(bloodMethodCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      doctorsReport: doctorsReport ? doctorsReport.checked : false
    };
    
    console.log('=== DEBUG: Blood Taking Method Filter ===');
    console.log('bloodMethodAll checked:', bloodMethodAll?.checked);
    console.log('bloodMethodCheckboxes:', Array.from(bloodMethodCheckboxes).map(cb => ({ value: cb.value, checked: cb.checked })));
    console.log('Selected blood taking methods:', currentFilters.bloodTakingMethods);

    let filteredTests = tests;
    let availableTests = tests;

    // If categories are selected, fetch matching tests from Supabase
    if (currentFilters.categories.length > 0) {
      // 1. Get all category IDs
      const { data: catRows, error: catError } = await supabase
        .from('blood_test_categories')
        .select('id, name')
        .in('name', currentFilters.categories);
      if (!catError && catRows && catRows.length > 0) {
        const categoryIds = catRows.map(row => row.id);
        // 2. Get all test IDs for these categories
        const { data: linkRows, error: linkError } = await supabase
          .from('blood_test_category_link_table')
          .select('provider_blood_test_id')
          .in('blood_test_category_id', categoryIds);
        if (!linkError && linkRows && linkRows.length > 0) {
          const testIds = [...new Set(linkRows.map(row => row.provider_blood_test_id))];
          // 3. Get all blood tests with those IDs
          const { data: supaTests, error: testError } = await supabase
            .from('provider_blood_tests')
            .select('*, provider:providers(name)')
            .in('id', testIds);
          if (!testError && supaTests) {
            availableTests = supaTests;
            filteredTests = supaTests;
          } else {
            availableTests = [];
            filteredTests = [];
          }
        } else {
          availableTests = [];
          filteredTests = [];
        }
      } else {
        availableTests = [];
        filteredTests = [];
      }
    } else {
      // No category filter (All Categories selected), fetch ALL tests from database
      console.log('All Categories selected, fetching all tests from database');
      const { data: allTests, error } = await supabase
        .from('provider_blood_tests')
        .select('*, provider:providers(name)');
      if (!error && allTests) {
        availableTests = allTests;
        filteredTests = allTests;
        console.log('Fetched all tests from database:', allTests.length);
      } else {
        console.error('Error fetching all tests:', error);
        availableTests = tests; // Fallback to original tests
        filteredTests = tests;
      }
    }

    // --- Update price slider range and values based on availableTests (not filtered) ---
    if (availableTests.length > 0) {
      const newMin = Math.min(...availableTests.map(t => t.price));
      const newMax = Math.max(...availableTests.map(t => t.price));
      priceMin.min = newMin;
      priceMin.max = newMax;
      priceMax.min = newMin;
      priceMax.max = newMax;

      // Only reset slider values if the available min/max has changed
      if (lastMinPrice !== newMin || lastMaxPrice !== newMax) {
        priceMin.value = newMin;
        priceMax.value = newMax;
        currentFilters.priceRange.min = newMin;
        currentFilters.priceRange.max = newMax;
      }
      lastMinPrice = newMin;
      lastMaxPrice = newMax;

      priceMinValue.textContent = `£${parseFloat(priceMin.value).toFixed(2)}`;
      priceMaxValue.textContent = `£${parseFloat(priceMax.value).toFixed(2)}`;

      // --- DEBUG LOGGING ---
      console.log('[applyFilters] newMin:', newMin, 'newMax:', newMax);
      console.log('[applyFilters] priceMin.value:', priceMin.value, 'priceMax.value:', priceMax.value);
      console.log('[applyFilters] priceMin DOM:', priceMin, 'priceMax DOM:', priceMax);
      console.log('[applyFilters] priceMin attributes:', priceMin.getAttribute('min'), priceMin.getAttribute('max'), priceMin.getAttribute('value'));
      console.log('[applyFilters] priceMax attributes:', priceMax.getAttribute('min'), priceMax.getAttribute('max'), priceMax.getAttribute('value'));
      // --- END DEBUG LOGGING ---
    }
    // --- End price slider update ---

    // Now apply price, provider, and blood taking method filters to availableTests
    console.log('=== DEBUG: Available Tests ===');
    console.log('Number of available tests:', availableTests.length);
    console.log('Sample tests with blood taking methods:', availableTests.slice(0, 3).map(t => ({
      name: t.name,
      blood_taking_methods: t.blood_taking_methods,
      hasBloodTakingMethods: !!t.blood_taking_methods,
      bloodTakingMethodsType: typeof t.blood_taking_methods,
      bloodTakingMethodsLength: Array.isArray(t.blood_taking_methods) ? t.blood_taking_methods.length : 'not array'
    })));
    
    filteredTests = availableTests.filter(test => {
      // Price range filter
      if (test.price < currentFilters.priceRange.min || test.price > currentFilters.priceRange.max) {
        return false;
      }
      // Provider filter
      if (currentFilters.providers.length > 0 && !currentFilters.providers.includes(test.provider?.name || test.provider)) {
        return false;
      }
      // Blood taking method filter - moved to filter callback
      // This filtering will be handled in the general-health.js filter callback
      // where we have access to enriched tests with blood_taking_methods
      // Doctor's report filter
      if (currentFilters.doctorsReport && test["doctors report"] !== "Yes") {
        return false;
      }
      return true;
    });

    // Sort by price ascending
    filteredTests.sort((a, b) => a.price - b.price);

    // Update filter tags with results count
    updateFilterTags(currentFilters, filteredTests.length);

    // Always call callback with filter state object to handle all filtering (biomarkers, blood taking methods, etc.)
    console.log('=== DEBUG: ApplyFilters - Using filter state callback ===');
    updateCallback({
      categories: currentFilters.categories,
      providers: currentFilters.providers,
      priceRange: currentFilters.priceRange,
      bloodTakingMethods: currentFilters.bloodTakingMethods,
      doctorsReport: currentFilters.doctorsReport
    });
  }

  // Handle "All Providers" checkbox
  if (providerAll) {
    providerAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      providerCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        checkbox.disabled = isChecked;
      });
      applyFilters().catch(console.error);
    });
  }

  // Handle "All Categories" checkbox
  if (categoryAll) {
    categoryAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
        // When "All Categories" is selected, deselect all individual categories
        categoryCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
      }
      // --- Update filter param in hash ---
      let [base, paramStr] = window.location.hash.split('?');
      base = base || '#/general-health';
      let params = new URLSearchParams(paramStr || '');
      if (isChecked) {
        params.set('filter', 'all');
      } else {
        // When "All Categories" is unchecked, keep the current individual selections
        const selectedCategories = Array.from(categoryCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        if (selectedCategories.length > 0) {
          params.set('filter', selectedCategories.join(','));
        } else {
          params.delete('filter');
        }
      }
      // Remove empty params
      for (const [key, value] of params.entries()) {
        if (!value) params.delete(key);
      }
      const newHash = params.toString() ? `${base}?${params.toString()}` : base;
      window.location.hash = newHash;
    });
  }

  // Handle individual category checkboxes
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      
      // Update "All Categories" checkbox based on selection
      const allChecked = selectedCategories.length === categoryCheckboxes.length;
      categoryAll.checked = allChecked;
      
      // --- Update filter param in hash ---
      let [base, paramStr] = window.location.hash.split('?');
      base = base || '#/general-health';
      let params = new URLSearchParams(paramStr || '');
      
      if (allChecked) {
        // If all categories are selected, use 'all'
        params.set('filter', 'all');
      } else if (selectedCategories.length > 0) {
        // If specific categories are selected, join them
        params.set('filter', selectedCategories.join(','));
      } else {
        // If no categories are selected, remove the filter param
        params.delete('filter');
      }
      
      // Remove empty params
      for (const [key, value] of params.entries()) {
        if (!value) params.delete(key);
      }
      const newHash = params.toString() ? `${base}?${params.toString()}` : base;
      window.location.hash = newHash;
    });
  });

  // Handle individual provider checkboxes
  providerCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(providerCheckboxes).every(cb => cb.checked);
      providerAll.checked = allChecked;
      // On provider change, call applyFilters to ensure price filter updates properly
      applyFilters().catch(console.error);
    });
  });

  // Handle "All Blood Methods" checkbox
  if (bloodMethodAll) {
    bloodMethodAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      bloodMethodCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        checkbox.disabled = isChecked;
      });
      applyFilters().catch(console.error);
    });
  }

  // Handle individual blood taking method checkboxes
  bloodMethodCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(bloodMethodCheckboxes).every(cb => cb.checked);
      bloodMethodAll.checked = allChecked;
      applyFilters().catch(console.error);
    });
  });

  // Handle doctor's report checkbox
  if (doctorsReport) {
    doctorsReport.addEventListener('change', () => applyFilters().catch(console.error));
  }

  // Handle reset filters button
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      // Reset price range
      priceMin.value = currentFilters.priceRange.min;
      priceMax.value = currentFilters.priceRange.max;
      priceMinValue.textContent = `£${currentFilters.priceRange.min.toFixed(2)}`;
      priceMaxValue.textContent = `£${currentFilters.priceRange.max.toFixed(2)}`;

      // Reset provider checkboxes
      providerAll.checked = true;
      providerCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        checkbox.disabled = true;
      });

      // Reset category checkboxes
      categoryAll.checked = true;
      categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        // Don't check individual checkboxes when "All Categories" is selected
      });

      // Reset blood taking method checkboxes
      bloodMethodAll.checked = true;
      bloodMethodCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        checkbox.disabled = true;
      });

      // Reset doctor's report checkbox
      doctorsReport.checked = false;

      applyFilters().catch(console.error);
    });
  }

  // Add event listeners to update price display and prevent overlap
  priceMin.addEventListener('input', () => {
    let min = parseFloat(priceMin.value);
    let max = parseFloat(priceMax.value);
    if (min > max) {
      min = max;
      priceMin.value = min;
    }
    priceMinValue.textContent = `£${min.toFixed(2)}`;
    currentFilters.priceRange.min = min;
    updateFilterTags(currentFilters, null); // Count will be updated when applyFilters runs
    applyFilters().catch(console.error);
  });
  priceMax.addEventListener('input', () => {
    let min = parseFloat(priceMin.value);
    let max = parseFloat(priceMax.value);
    if (max < min) {
      max = min;
      priceMax.value = max;
    }
    priceMaxValue.textContent = `£${max.toFixed(2)}`;
    currentFilters.priceRange.max = max;
    updateFilterTags(currentFilters, null); // Count will be updated when applyFilters runs
    applyFilters().catch(console.error);
  });

  // Initial filter application
  applyFilters().catch(console.error);
} 
