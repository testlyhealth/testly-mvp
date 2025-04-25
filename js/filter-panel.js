import { $, $all } from './dom.js';

export function createFilterPanel() {
  return `
    <div class="filter-panel">
      <div class="filter-section">
        <h3>Price Range</h3>
        <div class="price-range">
          <input type="range" id="price-min" min="0" max="500" value="0" step="10">
          <input type="range" id="price-max" min="0" max="500" value="500" step="10">
          <div class="price-inputs">
            <input type="number" id="price-min-input" value="0" min="0" max="500">
            <span>to</span>
            <input type="number" id="price-max-input" value="500" min="0" max="500">
          </div>
        </div>
      </div>

      <div class="filter-section">
        <h3>Number of Biomarkers</h3>
        <div class="biomarker-range">
          <input type="range" id="biomarker-min" min="0" max="100" value="0" step="1">
          <input type="range" id="biomarker-max" min="0" max="100" value="100" step="1">
          <div class="biomarker-inputs">
            <input type="number" id="biomarker-min-input" value="0" min="0" max="100">
            <span>to</span>
            <input type="number" id="biomarker-max-input" value="100" min="0" max="100">
          </div>
        </div>
      </div>

      <div class="filter-section">
        <h3>Test Location</h3>
        <div class="location-filters">
          <label>
            <input type="checkbox" value="Home" checked> Home
          </label>
          <label>
            <input type="checkbox" value="Clinic" checked> Clinic
          </label>
          <label>
            <input type="checkbox" value="Nurse/phlebotomist to house" checked> Nurse Visit
          </label>
        </div>
      </div>

      <div class="filter-section">
        <h3>Results Time</h3>
        <div class="results-time">
          <select id="results-time">
            <option value="any">Any time</option>
            <option value="1-3">1-3 days</option>
            <option value="4-7">4-7 days</option>
            <option value="8+">8+ days</option>
          </select>
        </div>
      </div>

      <div class="filter-section">
        <h3>Provider</h3>
        <div class="provider-filters">
          <label>
            <input type="checkbox" value="Medichecks" checked> Medichecks
          </label>
          <label>
            <input type="checkbox" value="Thriva" checked> Thriva
          </label>
          <label>
            <input type="checkbox" value="LetsGetChecked" checked> LetsGetChecked
          </label>
        </div>
      </div>

      <button id="reset-filters" class="reset-filters">Reset Filters</button>
    </div>
  `;
}

export function setupFilterPanel(tests, onFilterChange) {
  const filterPanel = $('.filter-panel');
  if (!filterPanel) return;

  // Price range handlers
  const priceMin = $('#price-min');
  const priceMax = $('#price-max');
  const priceMinInput = $('#price-min-input');
  const priceMaxInput = $('#price-max-input');

  function updatePriceRange() {
    const min = Math.min(parseInt(priceMin.value), parseInt(priceMax.value));
    const max = Math.max(parseInt(priceMin.value), parseInt(priceMax.value));
    priceMinInput.value = min;
    priceMaxInput.value = max;
    applyFilters();
  }

  priceMin.addEventListener('input', updatePriceRange);
  priceMax.addEventListener('input', updatePriceRange);
  priceMinInput.addEventListener('change', () => {
    priceMin.value = priceMinInput.value;
    updatePriceRange();
  });
  priceMaxInput.addEventListener('change', () => {
    priceMax.value = priceMaxInput.value;
    updatePriceRange();
  });

  // Biomarker range handlers
  const biomarkerMin = $('#biomarker-min');
  const biomarkerMax = $('#biomarker-max');
  const biomarkerMinInput = $('#biomarker-min-input');
  const biomarkerMaxInput = $('#biomarker-max-input');

  function updateBiomarkerRange() {
    const min = Math.min(parseInt(biomarkerMin.value), parseInt(biomarkerMax.value));
    const max = Math.max(parseInt(biomarkerMin.value), parseInt(biomarkerMax.value));
    biomarkerMinInput.value = min;
    biomarkerMaxInput.value = max;
    applyFilters();
  }

  biomarkerMin.addEventListener('input', updateBiomarkerRange);
  biomarkerMax.addEventListener('input', updateBiomarkerRange);
  biomarkerMinInput.addEventListener('change', () => {
    biomarkerMin.value = biomarkerMinInput.value;
    updateBiomarkerRange();
  });
  biomarkerMaxInput.addEventListener('change', () => {
    biomarkerMax.value = biomarkerMaxInput.value;
    updateBiomarkerRange();
  });

  // Location filters
  const locationCheckboxes = $all('.location-filters input[type="checkbox"]');
  locationCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  // Results time filter
  const resultsTimeSelect = $('#results-time');
  resultsTimeSelect.addEventListener('change', applyFilters);

  // Provider filters
  const providerCheckboxes = $all('.provider-filters input[type="checkbox"]');
  providerCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  // Reset filters button
  const resetButton = $('#reset-filters');
  resetButton.addEventListener('click', () => {
    // Reset price range
    priceMin.value = 0;
    priceMax.value = 500;
    priceMinInput.value = 0;
    priceMaxInput.value = 500;

    // Reset biomarker range
    biomarkerMin.value = 0;
    biomarkerMax.value = 100;
    biomarkerMinInput.value = 0;
    biomarkerMaxInput.value = 100;

    // Reset checkboxes
    locationCheckboxes.forEach(checkbox => checkbox.checked = true);
    providerCheckboxes.forEach(checkbox => checkbox.checked = true);

    // Reset results time
    resultsTimeSelect.value = 'any';

    applyFilters();
  });

  function applyFilters() {
    const filters = {
      priceRange: {
        min: parseInt(priceMinInput.value),
        max: parseInt(priceMaxInput.value)
      },
      biomarkerRange: {
        min: parseInt(biomarkerMinInput.value),
        max: parseInt(biomarkerMaxInput.value)
      },
      locations: Array.from(locationCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      resultsTime: resultsTimeSelect.value,
      providers: Array.from(providerCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value)
    };

    const filteredTests = tests.filter(test => {
      // Price filter
      if (test.price < filters.priceRange.min || test.price > filters.priceRange.max) {
        return false;
      }

      // Biomarker count filter
      if (test.biomarker_number < filters.biomarkerRange.min || 
          test.biomarker_number > filters.biomarkerRange.max) {
        return false;
      }

      // Location filter
      const hasMatchingLocation = test["blood test location"].some(location => 
        filters.locations.includes(location)
      );
      if (!hasMatchingLocation) {
        return false;
      }

      // Results time filter
      if (filters.resultsTime !== 'any') {
        const days = test["Days till results returned"];
        if (filters.resultsTime === '1-3' && (days < 1 || days > 3)) return false;
        if (filters.resultsTime === '4-7' && (days < 4 || days > 7)) return false;
        if (filters.resultsTime === '8+' && days < 8) return false;
      }

      // Provider filter
      if (!filters.providers.includes(test.provider)) {
        return false;
      }

      return true;
    });

    onFilterChange(filteredTests);
  }

  // Initial filter application
  applyFilters();
} 