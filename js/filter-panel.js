import { $, $all } from './dom.js';

// Add this helper function at the top of the file, after the imports
function generateSafeId(text) {
  return text.toLowerCase()
    .replace(/[&]/g, 'and')  // Replace & with 'and'
    .replace(/[^a-z0-9-]/g, '-')  // Replace other special chars with hyphens
    .replace(/-+/g, '-')  // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
}

// Function to create the filter panel HTML
export function createFilterPanel(tests) {
  // Get unique providers and locations
  const providers = [...new Set(tests.map(test => test.provider))];
  const locations = [...new Set(tests.flatMap(test => test["blood test location"]))];
  
  // Get price range
  const prices = tests.map(test => test.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Hardcoded categories
  const categories = [
    'General Health',
    'Hormone Health',
    'Heart Health',
    'Performance',
    'Thyroid',
    'Fertility',
    'Vitamins & Minerals'
  ];
  
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
            <input type="checkbox" id="category-all">
            <label for="category-all">All Categories</label>
          </div>
          ${categories.map(category => `
            <div class="checkbox-option">
              <input type="checkbox" id="category-${generateSafeId(category)}" class="category-checkbox" value="${category}" ${category === 'General Health' ? 'checked' : ''}>
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
              <label for="provider-${provider.toLowerCase().replace(/\s+/g, '-')}">${provider}</label>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="filter-section">
        <h4>Locations</h4>
        <div class="provider-checkboxes">
          <div class="checkbox-option">
            <input type="checkbox" id="location-all" checked>
            <label for="location-all">All Locations</label>
          </div>
          ${locations.map(location => `
            <div class="checkbox-option">
              <input type="checkbox" id="location-${location.toLowerCase().replace(/\s+/g, '-')}" class="location-checkbox" value="${location}">
              <label for="location-${location.toLowerCase().replace(/\s+/g, '-')}">${location}</label>
            </div>
          `).join('')}
      </div>
      </div>

      <div class="filter-section">
        <h4>Additional Options</h4>
        <div class="checkbox-option">
          <input type="checkbox" id="doctors-report">
          <label for="doctors-report">Doctor's report included</label>
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

// Function to setup filter panel functionality
export function setupFilterPanel(tests, updateCallback, rootPanel = null) {
  // Use the provided rootPanel, or default to querying the DOM
  let filterPanel = rootPanel || $('.filter-panel-content');
  if (!filterPanel) {
    const filterPanelContainer = $('.filter-panel');
    if (filterPanelContainer) {
      filterPanel = filterPanelContainer.querySelector('.filter-panel-content');
    }
  }
  if (!filterPanel) {
    console.error('Filter panel not found. Available elements:', {
      filterPanelContent: $('.filter-panel-content'),
      filterPanel: $('.filter-panel'),
      mainContent: $('.main-content')
    });
    return;
  }

  // Create filter tags container in the appropriate location
  let filterTagsContainer = document.querySelector('.filter-tags');
  if (!filterTagsContainer) {
    filterTagsContainer = document.createElement('div');
    filterTagsContainer.className = 'filter-tags';
    
    // For mobile, insert before the filter button
    const filterBtn = document.querySelector('.filters-btn.mobile-only');
    if (filterBtn) {
      filterBtn.insertAdjacentElement('beforebegin', filterTagsContainer);
    } else {
      // For desktop, insert into main-content before products-grid
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        // Insert at the start of main-content
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

  // Price range inputs
  const priceMin = filterPanel.querySelector('#price-min');
  const priceMax = filterPanel.querySelector('#price-max');
  const priceMinValue = filterPanel.querySelector('#price-min-value');
  const priceMaxValue = filterPanel.querySelector('#price-max-value');

  if (!priceMin || !priceMax || !priceMinValue || !priceMaxValue) {
    console.error('Price range elements not found in filter panel:', {
      priceMin: !!priceMin,
      priceMax: !!priceMax,
      priceMinValue: !!priceMinValue,
      priceMaxValue: !!priceMaxValue
    });
    return;
  }

  // Provider checkboxes
  const providerAll = filterPanel.querySelector('#provider-all');
  const providerCheckboxes = filterPanel.querySelectorAll('.provider-checkbox');

  // Location checkboxes
  const locationAll = filterPanel.querySelector('#location-all');
  const locationCheckboxes = filterPanel.querySelectorAll('.location-checkbox');

  // Category checkboxes
  const categoryAll = filterPanel.querySelector('#category-all');
  const categoryCheckboxes = filterPanel.querySelectorAll('.category-checkbox');

  // Other filter inputs
  const doctorsReport = filterPanel.querySelector('#doctors-report');

  // Reset filters button
  const resetFiltersBtn = filterPanel.querySelector('#reset-filters');

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

    // Location tags
    if (filters.locations.length > 0) {
      filters.locations.forEach(location => {
        tags.push(`
          <div class="filter-tag" data-type="location" data-value="${location}">
            <span>Location: ${location}</span>
            <button class="remove-tag" aria-label="Remove location filter">×</button>
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
          case 'location':
            const locationCheckbox = document.querySelector(`#location-${generateSafeId(value)}`);
            if (locationCheckbox) {
              locationCheckbox.checked = false;
              locationAll.checked = false;
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
  function applyFilters() {
    // Update current filters
    currentFilters = {
      priceRange: {
        min: parseFloat(priceMin.value),
        max: parseFloat(priceMax.value)
      },
      providers: Array.from(providerCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      locations: Array.from(locationCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      categories: Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      doctorsReport: doctorsReport.checked
    };

    // Update filter tags
    updateFilterTags(currentFilters);

    // Apply filters
    const filteredTests = tests.filter(test => {
      // Price range filter
      if (test.price < currentFilters.priceRange.min || test.price > currentFilters.priceRange.max) {
        return false;
      }

      // Provider filter
      if (currentFilters.providers.length > 0 && !currentFilters.providers.includes(test.provider)) {
        return false;
      }

      // Location filter
      if (currentFilters.locations.length > 0 && !test["blood test location"].some(loc => currentFilters.locations.includes(loc))) {
        return false;
      }

      // Category filter - only apply if General Health is selected
      if (currentFilters.categories.length > 0) {
        if (!currentFilters.categories.includes('General Health')) {
          return false;
        }
      }

      // Doctor's report filter
      if (currentFilters.doctorsReport && test["doctors report"] !== "Yes") {
        return false;
      }

      return true;
    });

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
      applyFilters();
    });
  }

  // Handle "All Locations" checkbox
  if (locationAll) {
    locationAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      locationCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        checkbox.disabled = isChecked;
      });
      applyFilters();
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
      applyFilters();
    });
  }

  // Handle individual provider checkboxes
  providerCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(providerCheckboxes).every(cb => cb.checked);
      providerAll.checked = allChecked;
      applyFilters();
    });
  });

  // Handle individual location checkboxes
  locationCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(locationCheckboxes).every(cb => cb.checked);
      locationAll.checked = allChecked;
      applyFilters();
    });
  });

  // Handle individual category checkboxes
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(categoryCheckboxes).every(cb => cb.checked);
      categoryAll.checked = allChecked;
      applyFilters();
    });
  });

  // Handle doctor's report checkbox
  if (doctorsReport) {
    doctorsReport.addEventListener('change', applyFilters);
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

      // Reset location checkboxes
      locationAll.checked = true;
      locationCheckboxes.forEach(checkbox => {
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

      applyFilters();
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
    applyFilters();
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
    applyFilters();
  });

  // Initial filter application
  applyFilters();

  // Attach advanced search button event listener after panel is in DOM
  const advBtn = document.querySelector('.advanced-search-btn');
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
} 