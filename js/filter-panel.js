import { $, $all } from './dom.js';

// Function to create the filter panel HTML
export function createFilterPanel(tests) {
  // Get unique providers and locations
  const providers = [...new Set(tests.map(test => test.provider))];
  const locations = [...new Set(tests.flatMap(test => test["blood test location"]))];
  
  // Get price range
  const prices = tests.map(test => test.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
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

  let currentFilters = {
    priceRange: {
      min: Math.min(...tests.map(test => test.price)),
      max: Math.max(...tests.map(test => test.price))
    },
    providers: [],
    locations: [],
    doctorsReport: false
  };

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

  // Other filter inputs
  const doctorsReport = filterPanel.querySelector('#doctors-report');

  // Reset filters button
  const resetFiltersBtn = filterPanel.querySelector('#reset-filters');

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
      doctorsReport: doctorsReport.checked
    };

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

      // Reset doctor's report checkbox
      doctorsReport.checked = false;

      applyFilters();
    });
  }

  // Initial filter application
  applyFilters();
} 