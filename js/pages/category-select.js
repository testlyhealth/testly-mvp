import { supabase } from '../api/supabase.js';

export async function displayCategorySelectPage() {
  try {
    // Fetch categories from the database
    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('name')
      .order('name');

    if (error) {
      throw error;
    }

    // Extract category names and filter to only show Weight loss, Blood tests, and Other
    const categoryNames = categories.map(cat => cat.name);
    const filteredCategories = [];
    
    // Add categories in specific order: Blood tests first, Weight loss second, Other last
    if (categoryNames.includes('Blood tests')) {
      filteredCategories.push('Blood tests');
    }
    if (categoryNames.includes('Weight loss')) {
      filteredCategories.push('Weight loss');
    }
    filteredCategories.push('Other');

    // Generate category tiles
    const categoryTiles = filteredCategories.map((category, index) => {
      const optionClass = getCategoryOptionClass(category);
      const icon = getCategoryIcon(category, index);
      
      // Special handling for Blood tests and Other categories
      let targetRoute;
      if (category === 'Blood tests') {
        targetRoute = '#/blood-test-search-options';
      } else if (category === 'Other') {
        targetRoute = '#/blood-test-request';
      } else {
        targetRoute = `#/coming-soon/${encodeURIComponent(category)}`;
      }
      
      return `
        <div class="compare-tile ${optionClass}" onclick="window.location.hash='${targetRoute}'">
          <div class="tile-content">
            <h3>${category}</h3>
            ${category === 'Blood tests' ? '<p><em>- compare trusted UK blood test providers</em></p>' : ''}
            ${category === 'Weight loss' ? '<p><em>- find leading UK clinics and treatments</em></p>' : ''}
            ${category === 'Other' ? '<p><em>- can\'t find your category? Request it here</em></p>' : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <section class="compare-hero">
        <div class="compare-hero-content">
          <h1>What category is your test or treatment in?</h1>
          <p class="compare-subtitle">Choose the category that best matches what you're looking for.</p>
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
    console.error('Error fetching categories:', error);
    return `
      <section class="compare-hero">
        <div class="compare-hero-content">
          <h1>What category is your test or treatment in?</h1>
          <p class="compare-subtitle">Choose the category that best matches what you're looking for.</p>
        </div>
      </section>

      <section class="compare-content-section">
        <div class="compare-content">
          <div class="category-select-grid">
            <div class="compare-tile option-specific" onclick="window.location.hash='#/category/general-health'">
              <div class="tile-content">
                <h3>General Health</h3>
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

function getCategoryOptionClass(category) {
  // Assign specific colors based on category names
  if (category === 'Blood tests') {
    return 'option-concern'; // Red outline
  } else if (category === 'Weight loss') {
    return 'option-specific'; // Blue outline
  } else if (category === 'Other') {
    return 'option-checkup'; // Green outline
  } else {
    // Fallback to default pattern
    return 'option-browse';
  }
}

function getCategoryIcon(category, index) {
  // Default icons for different categories
  const icons = {
    'Blood Tests': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    'Hormones': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    'Vitamins': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    'Other': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3H21V21H3V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 9H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  };

  // Try to match category name to specific icons
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('blood')) return icons['Blood Tests'];
  if (categoryLower.includes('hormone')) return icons['Hormones'];
  if (categoryLower.includes('vitamin') || categoryLower.includes('mineral')) return icons['Vitamins'];
  if (category === 'Other') return icons['Other'];

  // Default icons based on index
  const defaultIcons = [
    icons['Blood Tests'],
    icons['Hormones'],
    icons['Vitamins'],
    icons['Other']
  ];
  
  return defaultIcons[index % defaultIcons.length];
} 