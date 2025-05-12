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
        <h4>Provider</h4>
        <select id="provider-filter">
          <option value="all">All Providers</option>
          ${providers.map(provider => `
            <option value="${provider}">${provider}</option>
          `).join('')}
        </select>
      </div>

      <div class="filter-section">
        <h4>Location</h4>
        <select id="location-filter">
          <option value="all">All Locations</option>
          ${locations.map(location => `
            <option value="${location}">${location}</option>
          `).join('')}
        </select>
      </div>

      <div class="filter-section">
        <h4>Minimum Biomarkers</h4>
        <input type="number" id="biomarker-count" min="0" value="0">
      </div>

      <div class="filter-section">
        <h4>Additional Options</h4>
        <div class="checkbox-option">
          <input type="checkbox" id="doctors-report">
          <label for="doctors-report">Include Doctor's Report</label>
        </div>
      </div>

      <div class="filter-buttons">
        <button id="apply-filters" class="apply-filters-btn">Apply Filters</button>
        <button id="reset-filters" class="reset-filters-btn">Reset</button>
      </div>
    </div>
  `;
}

// Function to setup filter panel functionality
export function setupFilterPanel(tests, updateCallback) {
  // First try to find the filter panel content
  let filterPanel = $('.filter-panel-content');
  
  // If not found, try to find the filter panel and then its content
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
    provider: 'all',
    location: 'all',
    biomarkerCount: 0,
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

  // Other filter inputs
  const providerFilter = filterPanel.querySelector('#provider-filter');
  const locationFilter = filterPanel.querySelector('#location-filter');
  const biomarkerCount = filterPanel.querySelector('#biomarker-count');
  const doctorsReport = filterPanel.querySelector('#doctors-report');

  // Filter buttons
  const applyFiltersBtn = filterPanel.querySelector('#apply-filters');
  const resetFiltersBtn = filterPanel.querySelector('#reset-filters');

  // Update price range values and apply filters
  function updatePriceRange() {
    let min = parseFloat(priceMin.value);
    let max = parseFloat(priceMax.value);
    
    // Ensure min doesn't exceed max
    if (min > max) {
      min = max;
      priceMin.value = max;
    }
    
    // Ensure max doesn't go below min
    if (max < min) {
      max = min;
      priceMax.value = min;
    }
    
    // Update the displayed values with 2 decimal places
    priceMinValue.textContent = `£${min.toFixed(2)}`;
    priceMaxValue.textContent = `£${max.toFixed(2)}`;

    // Update current filters
    currentFilters.priceRange = {
      min: min,
      max: max
    };

    // Apply filters immediately
    const filteredTests = tests.filter(test => {
      // Price range filter
      if (test.price < min || test.price > max) {
        return false;
      }

      // Provider filter
      if (currentFilters.provider !== 'all' && test.provider !== currentFilters.provider) {
        return false;
      }

      // Location filter
      if (currentFilters.location !== 'all' && !test["blood test location"].includes(currentFilters.location)) {
        return false;
      }

      // Biomarker count filter
      if (test["biomarker number"] < currentFilters.biomarkerCount) {
        return false;
      }

      // Doctor's report filter
      if (currentFilters.doctorsReport && test["doctors report"] !== "Yes") {
        return false;
      }

      return true;
    });

    updateCallback(filteredTests);
  }

  // Event listeners for price range
  priceMin.addEventListener('input', updatePriceRange);
  priceMax.addEventListener('input', updatePriceRange);

  // Apply filters button click
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      currentFilters = {
        priceRange: {
          min: parseFloat(priceMin.value),
          max: parseFloat(priceMax.value)
        },
        provider: providerFilter.value,
        location: locationFilter.value,
        biomarkerCount: parseInt(biomarkerCount.value) || 0,
        doctorsReport: doctorsReport.checked
      };
      updatePriceRange();
    });
  }

  // Reset filters
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      // Reset price range
      const minPrice = Math.min(...tests.map(test => test.price));
      const maxPrice = Math.max(...tests.map(test => test.price));
      priceMin.value = minPrice;
      priceMax.value = maxPrice;
      priceMinValue.textContent = `£${minPrice.toFixed(2)}`;
      priceMaxValue.textContent = `£${maxPrice.toFixed(2)}`;

      // Reset other filters
      if (providerFilter) providerFilter.value = 'all';
      if (locationFilter) locationFilter.value = 'all';
      if (biomarkerCount) biomarkerCount.value = '0';
      if (doctorsReport) doctorsReport.checked = false;

      // Reset current filters
      currentFilters = {
        priceRange: {
          min: minPrice,
          max: maxPrice
        },
        provider: 'all',
        location: 'all',
        biomarkerCount: 0,
        doctorsReport: false
      };

      // Apply reset filters
      updatePriceRange();
    });
  }

  // Initial filter application
  updatePriceRange();
} 