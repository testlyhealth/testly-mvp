import { $, $all } from './dom.js';

export function createFilterPanel(tests) {
  // Get unique providers from the tests
  const providers = [...new Set(tests.map(test => test.provider))].sort();

  return `
    <div class="filter-panel">
      <div class="filter-section">
        <h3>Price Range</h3>
        <div class="price-range">
          <div class="range-slider">
            <input type="range" id="price-min" min="0" max="500" value="0" step="10">
            <input type="range" id="price-max" min="0" max="500" value="500" step="10">
          </div>
          <div class="price-inputs">
            <input type="number" id="price-min-input" value="0" min="0" max="500">
            <span>to</span>
            <input type="number" id="price-max-input" value="500" min="0" max="500">
          </div>
        </div>
      </div>

      <div class="filter-section">
        <h3>Trustpilot Score</h3>
        <div class="trustpilot-filters">
          <label>
            <input type="checkbox" value="4.5-5" checked> 4.5 - 5.0
          </label>
          <label>
            <input type="checkbox" value="4-4.5" checked> 4.0 - 4.5
          </label>
          <label>
            <input type="checkbox" value="3-4" checked> 3.0 - 4.0
          </label>
          <label>
            <input type="checkbox" value="0-3" checked> Below 3.0
          </label>
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
          ${providers.map(provider => `
            <label>
              <input type="checkbox" value="${provider}" checked> ${provider}
            </label>
          `).join('')}
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

  // Location filters
  const locationCheckboxes = $all('.location-filters input[type="checkbox"]');
  locationCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

  // Results time filter
  const resultsTimeSelect = $('#results-time');
  resultsTimeSelect.addEventListener('change', applyFilters);

  // Trustpilot score filters
  const trustpilotCheckboxes = $all('.trustpilot-filters input[type="checkbox"]');
  trustpilotCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });

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

    // Reset checkboxes
    locationCheckboxes.forEach(checkbox => checkbox.checked = true);
    trustpilotCheckboxes.forEach(checkbox => checkbox.checked = true);
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
      locations: Array.from(locationCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      resultsTime: resultsTimeSelect.value,
      trustpilotScore: Array.from(trustpilotCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      providers: Array.from(providerCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value)
    };

    const filteredTests = tests.filter(test => {
      // Price filter
      if (test.price < filters.priceRange.min || test.price > filters.priceRange.max) {
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

      // Trustpilot score filter
      const hasMatchingTrustpilotScore = filters.trustpilotScore.some(score => {
        const [min, max] = score.split('-').map(Number);
        const testScore = parseFloat(test["trust pilot score"]);
        return testScore >= min && testScore <= max;
      });
      if (!hasMatchingTrustpilotScore) {
        return false;
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