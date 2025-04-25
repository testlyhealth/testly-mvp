import { $, $all } from './dom.js';

export function createFilterPanel(tests) {
  // Get unique providers from the tests
  const providers = [...new Set(tests.map(test => test.provider))].sort();

  return `
    <div class="filter-panel">
      <div class="filter-section">
        <h3>Price Range</h3>
        <div class="price-filters">
          <label>
            <input type="checkbox" value="all" checked> All
          </label>
          <label>
            <input type="checkbox" value="50"> Under £50
          </label>
          <label>
            <input type="checkbox" value="100"> Up to £100
          </label>
          <label>
            <input type="checkbox" value="200"> Up to £200
          </label>
          <label>
            <input type="checkbox" value="300"> Up to £300
          </label>
          <label>
            <input type="checkbox" value="500"> Up to £500
          </label>
        </div>
      </div>

      <div class="filter-section">
        <h3>Trustpilot Score</h3>
        <div class="trustpilot-filters">
          <label>
            <input type="checkbox" value="all" checked> All
          </label>
          <label>
            <input type="checkbox" value="5"> ★★★★★
          </label>
          <label>
            <input type="checkbox" value="4"> ★★★★☆
          </label>
          <label>
            <input type="checkbox" value="3"> ★★★☆☆
          </label>
          <label>
            <input type="checkbox" value="2"> ★★☆☆☆
          </label>
          <label>
            <input type="checkbox" value="1"> ★☆☆☆☆
          </label>
          <label>
            <input type="checkbox" value="0"> ☆☆☆☆☆
          </label>
        </div>
      </div>

      <div class="filter-section">
        <h3>Test Location</h3>
        <div class="location-filters">
          <label>
            <input type="checkbox" value="all" checked> All
          </label>
          <label>
            <input type="checkbox" value="Home"> 🏠 Home
          </label>
          <label>
            <input type="checkbox" value="Clinic"> 🏥 Clinic
          </label>
          <label>
            <input type="checkbox" value="Nurse/phlebotomist to house"> 👨‍⚕️ Nurse Visit
          </label>
          <label>
            <input type="checkbox" value="Self-arrange"> 📋 Self-arrange
          </label>
        </div>
      </div>

      <div class="filter-section">
        <h3>Results Time</h3>
        <div class="results-time-filters">
          <label>
            <input type="checkbox" value="all" checked> All
          </label>
          <label>
            <input type="checkbox" value="24"> Within 24 hours
          </label>
          <label>
            <input type="checkbox" value="1-3"> 1-3 days
          </label>
          <label>
            <input type="checkbox" value="4-5"> 4-5 days
          </label>
          <label>
            <input type="checkbox" value="6-7"> 6-7 days
          </label>
          <label>
            <input type="checkbox" value="7+"> More than 7 days
          </label>
        </div>
      </div>

      <div class="filter-section">
        <h3>Provider</h3>
        <div class="provider-filters">
          <label>
            <input type="checkbox" value="all" checked> All
          </label>
          ${providers.map(provider => `
            <label>
              <input type="checkbox" value="${provider}"> ${provider}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="filter-section biomarker-filter-section">
        <button class="toggle-biomarker-filter" aria-expanded="false">
          Advanced search
        </button>
        <div class="biomarker-filter-content hidden">
          <div class="biomarker-groups">
            <div class="biomarker-group">
              <button class="toggle-biomarker-group" aria-expanded="true">
                Cardiovascular Health
                <span class="toggle-icon">▼</span>
              </button>
              <div class="biomarker-group-content">
                <div class="biomarker-filters">
                  <label>
                    <input type="checkbox" value="all"> All
                  </label>
                </div>
                <div class="biomarker-checkboxes">
                  <label><input type="checkbox" value="Total cholesterol"> Total cholesterol</label>
                  <label><input type="checkbox" value="LDL"> LDL</label>
                  <label><input type="checkbox" value="HDL"> HDL</label>
                  <label><input type="checkbox" value="Non-HDL"> Non-HDL</label>
                  <label><input type="checkbox" value="Triglycerides"> Triglycerides</label>
                  <label><input type="checkbox" value="Total cholesterol:HDL ratio"> Total cholesterol:HDL ratio</label>
                </div>
              </div>
            </div>

            <div class="biomarker-group">
              <button class="toggle-biomarker-group" aria-expanded="true">
                Liver Function
                <span class="toggle-icon">▼</span>
              </button>
              <div class="biomarker-group-content">
                <div class="biomarker-filters">
                  <label>
                    <input type="checkbox" value="all"> All
                  </label>
                </div>
                <div class="biomarker-checkboxes">
                  <label><input type="checkbox" value="ALT"> ALT</label>
                  <label><input type="checkbox" value="AST"> AST</label>
                  <label><input type="checkbox" value="ALP"> ALP</label>
                  <label><input type="checkbox" value="Gamma-GT"> Gamma-GT</label>
                  <label><input type="checkbox" value="Bilirubin"> Bilirubin</label>
                </div>
              </div>
            </div>

            <div class="biomarker-group">
              <button class="toggle-biomarker-group" aria-expanded="true">
                Kidney Function
                <span class="toggle-icon">▼</span>
              </button>
              <div class="biomarker-group-content">
                <div class="biomarker-filters">
                  <label>
                    <input type="checkbox" value="all"> All
                  </label>
                </div>
                <div class="biomarker-checkboxes">
                  <label><input type="checkbox" value="Creatinine"> Creatinine</label>
                  <label><input type="checkbox" value="eGFR"> eGFR</label>
                  <label><input type="checkbox" value="Urea"> Urea</label>
                </div>
              </div>
            </div>

            <div class="biomarker-group">
              <button class="toggle-biomarker-group" aria-expanded="true">
                Vitamins & Minerals
                <span class="toggle-icon">▼</span>
              </button>
              <div class="biomarker-group-content">
                <div class="biomarker-filters">
                  <label>
                    <input type="checkbox" value="all"> All
                  </label>
                </div>
                <div class="biomarker-checkboxes">
                  <label><input type="checkbox" value="Vitamin D"> Vitamin D</label>
                  <label><input type="checkbox" value="Vitamin B12"> Vitamin B12</label>
                  <label><input type="checkbox" value="Folate"> Folate</label>
                  <label><input type="checkbox" value="Iron"> Iron</label>
                  <label><input type="checkbox" value="Ferritin"> Ferritin</label>
                </div>
              </div>
            </div>

            <div class="biomarker-group">
              <button class="toggle-biomarker-group" aria-expanded="true">
                Hormones
                <span class="toggle-icon">▼</span>
              </button>
              <div class="biomarker-group-content">
                <div class="biomarker-filters">
                  <label>
                    <input type="checkbox" value="all"> All
                  </label>
                </div>
                <div class="biomarker-checkboxes">
                  <label><input type="checkbox" value="TSH"> TSH</label>
                  <label><input type="checkbox" value="Free T3"> Free T3</label>
                  <label><input type="checkbox" value="Free T4"> Free T4</label>
                  <label><input type="checkbox" value="Testosterone"> Testosterone</label>
                  <label><input type="checkbox" value="Oestradiol"> Oestradiol</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button id="reset-filters" class="reset-filters">Reset Filters</button>
    </div>
  `;
}

export function setupFilterPanel(tests, onFilterChange) {
  const filterPanel = $('.filter-panel');
  if (!filterPanel) return;

  // Initialize all checkboxes
  initializeCheckboxes();

  // Setup filter interactions
  setupFilterInteractions();
  setupBiomarkerFilters();
  setupAdvancedSearch();

  // Initial filter application
  applyFilters();

  function initializeCheckboxes() {
    // Check all "All" checkboxes by default
    const allCheckboxes = $all('.filter-panel input[value="all"]');
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = true;
    });

    // Uncheck other checkboxes in the same groups
    const otherCheckboxes = $all('.filter-panel input[type="checkbox"]:not([value="all"])');
    otherCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  }

  function setupFilterInteractions() {
    const filterCategories = [
      { name: 'price', selector: '.price-filters' },
      { name: 'trustpilot', selector: '.trustpilot-filters' },
      { name: 'location', selector: '.location-filters' },
      { name: 'resultsTime', selector: '.results-time-filters' },
      { name: 'provider', selector: '.provider-filters' }
    ];

    filterCategories.forEach(category => {
      setupFilterCategory(category.selector);
    });
  }

  function setupFilterCategory(selector) {
    const container = $(selector);
    if (!container) return;

    const allCheckbox = container.querySelector('input[value="all"]');
    const otherCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]:not([value="all"])'));

    if (!allCheckbox) return;

    // When "All" is checked, uncheck others
    allCheckbox.addEventListener('change', () => {
      if (allCheckbox.checked) {
        otherCheckboxes.forEach(cb => {
          cb.checked = false;
        });
      }
      applyFilters();
    });

    // When others are checked, uncheck "All"
    otherCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          allCheckbox.checked = false;
        }
        
        // If no individual checkboxes are checked, check "All"
        const anyChecked = otherCheckboxes.some(cb => cb.checked);
        if (!anyChecked) {
          allCheckbox.checked = true;
        }
        
        applyFilters();
      });
    });
  }

  function setupBiomarkerFilters() {
    const biomarkerGroups = $all('.biomarker-group');
    biomarkerGroups.forEach(group => {
      const allCheckbox = group.querySelector('.biomarker-filters input[value="all"]');
      const checkboxes = Array.from(group.querySelectorAll('.biomarker-checkboxes input[type="checkbox"]'));
      
      if (allCheckbox) {
        allCheckbox.addEventListener('change', () => {
          if (allCheckbox.checked) {
            checkboxes.forEach(cb => {
              cb.checked = false;
            });
          }
          applyFilters();
        });

        checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
              allCheckbox.checked = false;
            }
            
            // If no individual checkboxes are checked, check "All"
            const anyChecked = checkboxes.some(cb => cb.checked);
            if (!anyChecked) {
              allCheckbox.checked = true;
            }
            
            applyFilters();
          });
        });
      }
    });

    // Setup biomarker group toggles
    const groupToggles = $all('.toggle-biomarker-group');
    groupToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        const content = toggle.nextElementSibling;
        if (content) {
          content.style.display = isExpanded ? 'none' : 'block';
          toggle.querySelector('.toggle-icon').textContent = isExpanded ? '▶' : '▼';
        }
      });
    });
  }

  function setupAdvancedSearch() {
    const toggleButton = $('.toggle-biomarker-filter');
    const biomarkerContent = $('.biomarker-filter-content');
    
    if (toggleButton && biomarkerContent) {
      toggleButton.addEventListener('click', () => {
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        toggleButton.setAttribute('aria-expanded', !isExpanded);
        biomarkerContent.classList.toggle('hidden');
      });
    }
  }

  // Reset filters button
  const resetBtn = $('#reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      initializeCheckboxes();
      applyFilters();
    });
  }

  function applyFilters() {
    const filters = {
      priceRanges: getSelectedValues('.price-filters'),
      locations: getSelectedValues('.location-filters'),
      resultsTime: getSelectedValues('.results-time-filters'),
      trustpilotScore: getSelectedValues('.trustpilot-filters'),
      providers: getSelectedValues('.provider-filters'),
      biomarkers: Array.from($all('.biomarker-checkboxes input[type="checkbox"]:checked'))
        .map(cb => cb.value)
    };

    const filteredTests = tests.filter(test => {
      // Price filter
      if (!filters.priceRanges.includes('all')) {
        const hasMatchingPriceRange = filters.priceRanges.some(maxPrice => {
          const price = parseFloat(maxPrice);
          return test.price <= price;
        });
        if (!hasMatchingPriceRange) return false;
      }

      // Location filter
      if (!filters.locations.includes('all')) {
        const hasMatchingLocation = test["blood test location"].some(location => 
          filters.locations.includes(location)
        );
        if (!hasMatchingLocation) return false;
      }

      // Results time filter
      if (!filters.resultsTime.includes('all')) {
        const days = test["Days till results returned"];
        const hasMatchingResultsTime = filters.resultsTime.some(time => {
          if (time === '24') return days <= 1;
          if (time === '1-3') return days >= 1 && days <= 3;
          if (time === '4-5') return days >= 4 && days <= 5;
          if (time === '6-7') return days >= 6 && days <= 7;
          if (time === '7+') return days > 7;
          return false;
        });
        if (!hasMatchingResultsTime) return false;
      }

      // Trustpilot score filter
      if (!filters.trustpilotScore.includes('all')) {
        const hasMatchingTrustpilotScore = filters.trustpilotScore.some(score => {
          const testScore = parseFloat(test["trust pilot score"]);
          return testScore >= parseFloat(score);
        });
        if (!hasMatchingTrustpilotScore) return false;
      }

      // Provider filter
      if (!filters.providers.includes('all')) {
        if (!filters.providers.includes(test.provider)) return false;
      }

      // Biomarker filter
      if (filters.biomarkers.length > 0) {
        const hasMatchingBiomarkers = filters.biomarkers.every(biomarker =>
          test.biomarkers.includes(biomarker)
        );
        if (!hasMatchingBiomarkers) return false;
      }

      return true;
    });

    onFilterChange(filteredTests);
  }

  function getSelectedValues(selector) {
    const checkboxes = $all(`${selector} input[type="checkbox"]`);
    return Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }
} 