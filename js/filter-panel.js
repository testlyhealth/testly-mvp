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
        <p>£0 - £${maxPrice}</p>
        <div class="price-slider">
          <input type="range" id="price-min" min="0" max="${maxPrice}" value="0" step="10">
          <input type="range" id="price-max" min="0" max="${maxPrice}" value="${maxPrice}" step="10">
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

      <button id="apply-filters" class="apply-filters-btn">Apply Filters</button>
      <button id="reset-filters" class="reset-filters-btn">Reset Filters</button>
    </div>
  `;
}

// Function to setup filter panel functionality
export function setupFilterPanel(tests, updateCallback) {
  const filterPanel = $('.filter-panel-content');
  if (!filterPanel) return;

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
  const priceMin = $('#price-min');
  const priceMax = $('#price-max');
  const priceMinValue = $('#price-min-value');
  const priceMaxValue = $('#price-max-value');

  // Other filter inputs
  const providerFilter = $('#provider-filter');
  const locationFilter = $('#location-filter');
  const biomarkerCount = $('#biomarker-count');
  const doctorsReport = $('#doctors-report');

  // Filter buttons
  const applyFiltersBtn = $('#apply-filters');
  const resetFiltersBtn = $('#reset-filters');

  // Update price range values
  function updatePriceRange() {
    const min = parseInt(priceMin.value);
    const max = parseInt(priceMax.value);
    
    if (min > max) {
      priceMin.value = max;
    }
    
    if (max < min) {
      priceMax.value = min;
    }
  }

  // Event listeners for price range
  priceMin.addEventListener('input', updatePriceRange);
  priceMax.addEventListener('input', updatePriceRange);
  priceMinValue.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    if (value >= parseInt(priceMin.min) && value <= parseInt(priceMin.max)) {
      priceMin.value = value;
      updatePriceRange();
    }
  });
  priceMaxValue.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    if (value >= parseInt(priceMax.min) && value <= parseInt(priceMax.max)) {
      priceMax.value = value;
      updatePriceRange();
    }
  });

  // Apply filters
  applyFiltersBtn.addEventListener('click', () => {
    currentFilters = {
      priceRange: {
        min: parseInt(priceMin.value),
        max: parseInt(priceMax.value)
      },
      provider: providerFilter.value,
      location: locationFilter.value,
      biomarkerCount: parseInt(biomarkerCount.value) || 0,
      doctorsReport: doctorsReport.checked
    };

    const filteredTests = tests.filter(test => {
      // Price range filter
      if (test.price < currentFilters.priceRange.min || test.price > currentFilters.priceRange.max) {
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
  });

  // Reset filters
  resetFiltersBtn.addEventListener('click', () => {
    // Reset price range
    const minPrice = Math.min(...tests.map(test => test.price));
    const maxPrice = Math.max(...tests.map(test => test.price));
    priceMin.value = minPrice;
    priceMax.value = maxPrice;
    priceMinValue.value = minPrice;
    priceMaxValue.value = maxPrice;

    // Reset other filters
    providerFilter.value = 'all';
    locationFilter.value = 'all';
    biomarkerCount.value = '0';
    doctorsReport.checked = false;

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

    // Update the grid with all tests
    updateCallback(tests);
  });
} 