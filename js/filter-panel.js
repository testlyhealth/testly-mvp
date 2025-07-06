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
  
  // Check for a filter query parameter in the URL
  let selectedCategory = null;
  try {
    const urlHash = window.location.hash;
    const filterMatch = urlHash.match(/[?&]filter=([^&]+)/);
    if (filterMatch) {
      selectedCategory = decodeURIComponent(filterMatch[1]);
    }
  } catch (e) {}

  return `
    <div class="filter-panel-content">
      <h3>Filter Results</h3>
      
      <div class="filter-section">
        <h4>Price</h4>
        <div class="price-range">
          <span id="price-min-value">£${minPrice.toFixed(2)}</span> - <span id="price-max-value">£${maxPrice.toFixed(2)}</span>
        </div>
        <div class="price-slider">
          <input type="range" id="price-min" min="${minPrice}" max="${maxPrice}" value="${minPrice}" step="1">
          <input type="range" id="price-max" min="${minPrice}" max="${maxPrice}" value="${maxPrice}" step="1">
        </div>
      </div>

      <div class="filter-section">
        <h4>Category</h4>
        <div class="provider-checkboxes">
          <div class="checkbox-option">
            <input type="checkbox" id="category-all" ${selectedCategory ? '' : 'checked'}>
            <label for="category-all">All Categories</label>
          </div>
          ${categories.map(category => `
            <div class="checkbox-option">
              <input type="checkbox" id="category-${generateSafeId(category)}" class="category-checkbox" value="${category}" ${(selectedCategory ? (category === selectedCategory ? 'checked' : '') : (category === 'General Health' ? 'checked' : ''))}>
              <label for="category-${generateSafeId(category)}">${category}</label>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="filter-section">
        <h4>Providers</h4>
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

      <div class="filter-buttons">
        <button id="reset-filters" class="reset-filters-btn">Reset</button>
        <button class="advanced-search-btn advanced-search-spacing">
          <span>Advanced search</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
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
  const doctorsReport = filterPanel.querySelector('#doctors-report');
  const resetFiltersBtn = filterPanel.querySelector('#reset-filters');

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

  let currentFilters = {
    priceRange: {
      min: Math.min(...tests.map(test => test.price)),
      max: Math.max(...tests.map(test => test.price))
    },
    providers: [],
    locations: [],
    categories: [],
    doctorsReport: false
  };

  // Initialize filter tags with current filters
  if (filterTagsContainer) {
    updateFilterTags(currentFilters);
  } else {
    console.error('Failed to create filter tags container');
  }

  // Function to create filter tags HTML
  function createFilterTags(filters) {
    const tags = [];
    
    // Price range tag - always show it
    tags.push(`
      <div class="filter-tag" data-type="price">
        <span>Price: £${filters.priceRange.min.toFixed(2)} - £${filters.priceRange.max.toFixed(2)}</span>
        <button class="remove-tag" aria-label="Remove price filter">×</button>
      </div>
    `);

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
      filters.categories.forEach(category => {
        tags.push(`
          <div class="filter-tag" data-type="category" data-value="${category}">
            <span>Category: ${category}</span>
            <button class="remove-tag" aria-label="Remove category filter">×</button>
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

    return tags.join('');
  }

  // Function to update filter tags
  function updateFilterTags(filters) {
    const filterTagsContainer = document.querySelector('.filter-tags');
    if (!filterTagsContainer) {
      console.warn('Filter tags container not found');
      return;
    }

    const tagsHTML = createFilterTags(filters);
    filterTagsContainer.innerHTML = tagsHTML;

    // Add event listeners to remove buttons
    filterTagsContainer.querySelectorAll('.remove-tag').forEach(button => {
      button.addEventListener('click', (e) => {
        const tag = e.target.closest('.filter-tag');
        const type = tag.dataset.type;
        const value = tag.dataset.value;

        switch (type) {
          case 'price':
            priceMin.value = Math.min(...tests.map(test => test.price));
            priceMax.value = Math.max(...tests.map(test => test.price));
            priceMinValue.textContent = `£${priceMin.value.toFixed(2)}`;
            priceMaxValue.textContent = `£${priceMax.value.toFixed(2)}`;
            break;
          case 'provider':
            const providerCheckbox = document.querySelector(`#provider-${generateSafeId(value)}`);
            if (providerCheckbox) {
              providerCheckbox.checked = false;
              providerAll.checked = false;
            }
            break;
          case 'category':
            const categoryCheckbox = document.querySelector(`#category-${generateSafeId(value)}`);
            if (categoryCheckbox) {
              categoryCheckbox.checked = false;
              categoryAll.checked = false;
            }
            break;
          case 'doctorsReport':
            doctorsReport.checked = false;
            break;
        }

        applyFilters();
      });
    });
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
      categories: Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      doctorsReport: doctorsReport ? doctorsReport.checked : false
    };

    // Update filter tags
    updateFilterTags(currentFilters);

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
      // No category filter, use all tests
      availableTests = tests;
      filteredTests = tests;
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

    // Now apply price and provider filters to availableTests
    filteredTests = availableTests.filter(test => {
      // Price range filter
      if (test.price < currentFilters.priceRange.min || test.price > currentFilters.priceRange.max) {
        return false;
      }
      // Provider filter
      if (currentFilters.providers.length > 0 && !currentFilters.providers.includes(test.provider?.name || test.provider)) {
        return false;
      }
      // Doctor's report filter
      if (currentFilters.doctorsReport && test["doctors report"] !== "Yes") {
        return false;
      }
      return true;
    });

    // Sort by price ascending
    filteredTests.sort((a, b) => a.price - b.price);

    // Call the update callback with the filtered tests
    updateCallback(filteredTests);
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
      categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        checkbox.disabled = isChecked;
      });
      applyFilters().catch(console.error);
    });
  }

  // Handle individual category checkboxes
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(categoryCheckboxes).every(cb => cb.checked);
      categoryAll.checked = allChecked;
      // On category change, call the async updateCallback with the new filter state
      const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      updateCallback({
        categories: selectedCategories,
        providers: Array.from(providerCheckboxes).filter(cb => cb.checked).map(cb => cb.value),
        priceRange: {
          min: parseFloat(priceMin.value),
          max: parseFloat(priceMax.value)
        },
        doctorsReport: doctorsReport ? doctorsReport.checked : false
      });
    });
  });

  // Handle individual provider checkboxes
  providerCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(providerCheckboxes).every(cb => cb.checked);
      providerAll.checked = allChecked;
      // On provider change, call the async updateCallback with the new filter state
      const selectedProviders = Array.from(providerCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      updateCallback({
        categories: Array.from(categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value),
        providers: selectedProviders,
        priceRange: {
          min: parseFloat(priceMin.value),
          max: parseFloat(priceMax.value)
        },
        doctorsReport: doctorsReport ? doctorsReport.checked : false
      });
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
    updateFilterTags(currentFilters);
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
    updateFilterTags(currentFilters);
    applyFilters().catch(console.error);
  });

  // Initial filter application
  applyFilters().catch(console.error);

  // Attach advanced search button event listener after panel is in DOM
  const advBtn = document.querySelector('.advanced-search-btn');
  const mobileAdvBtn = document.querySelector('.advanced-search-btn.mobile-only');
  
  if (advBtn) {
    advBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Close mobile filter panel if it's open
      const mobilePanel = document.querySelector('.mobile-filter-panel');
      if (mobilePanel && mobilePanel.classList.contains('visible')) {
        mobilePanel.classList.remove('visible');
        setTimeout(() => {
          mobilePanel.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      }
      window.location.hash = '#/advanced';
    });
  }

  if (mobileAdvBtn) {
    mobileAdvBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#/advanced';
    });
  }
} 
