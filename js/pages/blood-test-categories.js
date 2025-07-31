import { supabase } from '../api/supabase.js';

export async function displayBloodTestCategoriesPage() {
  try {
    // Fetch blood test categories from the database
    const { data: categories, error } = await supabase
      .from('blood_test_categories')
      .select('name')
      .order('name');

    if (error) {
      throw error;
    }

    // Extract category names and add "Other" option
    const categoryNames = categories.map(cat => cat.name);
    categoryNames.push('Other');

    // Generate category tiles
    const categoryTiles = categoryNames.map((category, index) => {
      const optionClass = getOptionClass(index);
      
      // Special handling for "Other" category
      const targetRoute = category === 'Other' ? '#/blood-test-request' : `#/search-results?filter=${encodeURIComponent(category)}`;
      
      return `
        <div class="compare-tile ${optionClass}" onclick="window.location.hash='${targetRoute}'">
          <div class="tile-content">
            <h3>${category}</h3>
          </div>
        </div>
      `;
    }).join('');

    return `
      <section class="compare-hero">
        <div class="compare-hero-content">
          <h1>What blood test category are you looking for?</h1>
          <p class="compare-subtitle">Choose the blood test category that best matches what you're looking for.</p>
        </div>
      </section>

      <section class="compare-content-section">
        <div class="compare-content">
          <div class="category-select-grid">
            ${categoryTiles}
          </div>
        </div>
      </section>

      <div class="back-button-container">
        <button onclick="history.back()" class="back-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8333 10H4.16666M4.16666 10L10 15.8333M4.16666 10L10 4.16666" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back
        </button>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching blood test categories:', error);
    // Fallback content
    return `
      <section class="compare-hero">
        <div class="compare-hero-content">
          <h1>What blood test category are you looking for?</h1>
          <p class="compare-subtitle">Choose the blood test category that best matches what you're looking for.</p>
        </div>
      </section>

      <section class="compare-content-section">
        <div class="compare-content">
          <div class="category-select-grid">
            <div class="compare-tile option-specific" onclick="window.location.hash='#/search-results?filter=General Health'">
              <div class="tile-content">
                <h3>General Health</h3>
              </div>
            </div>
            <div class="compare-tile option-concern" onclick="window.location.hash='#/search-results?filter=Hormone Health'">
              <div class="tile-content">
                <h3>Hormone Health</h3>
              </div>
            </div>
            <div class="compare-tile option-checkup" onclick="window.location.hash='#/search-results?filter=Heart Health'">
              <div class="tile-content">
                <h3>Heart Health</h3>
              </div>
            </div>
            <div class="compare-tile option-browse" onclick="window.location.hash='#/blood-test-request'">
              <div class="tile-content">
                <h3>Other</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="back-button-container">
        <button onclick="history.back()" class="back-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8333 10H4.16666M4.16666 10L10 15.8333M4.16666 10L10 4.16666" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back
        </button>
      </div>
    `;
  }
}

function getOptionClass(index) {
  const classes = ['option-specific', 'option-concern', 'option-checkup', 'option-browse'];
  return classes[index % classes.length];
} 