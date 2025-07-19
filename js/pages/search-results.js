export async function displaySearchResultsPage() {
  return `
    <div class="container">
      <!-- Hero Section with Search Form -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <h1 class="hero-title">
              Search Results
            </h1>
            <p class="hero-subtitle">
              Refine your search or explore the results below
            </p>
            
            <!-- Quick Search Form -->
            <div class="hero-side-box">
              <div class="side-box-content">
                <h3>Quick Search</h3>
                <div class="search-tabs">
                  <button class="tab-button active" data-tab="tests">Tests/Treatments</button>
                  <button class="tab-button" data-tab="problems">Problems</button>
                </div>
                
                <form class="search-form" id="quick-search-form">
                  <div class="form-content">
                    <!-- Product Category Selection -->
                    <div class="form-group">
                      <label for="product-category">What are you looking for?</label>
                      <select id="product-category" name="productCategory" required>
                        <option value="">Select category</option>
                        <option value="blood-tests">Blood tests</option>
                        <option value="supplements">Supplements</option>
                        <option value="treatments">Treatments</option>
                      </select>
                    </div>
                    
                    <!-- Category Selection (initially hidden) -->
                    <div class="form-group" id="category-group" style="display: none;">
                      <label for="category-select">Select category</label>
                      <select id="category-select" name="category">
                        <option value="">Choose a category</option>
                        <option value="general-health">General health</option>
                        <option value="female-health">Female health and hormones</option>
                        <option value="male-health">Male health and hormones</option>
                        <option value="thyroid-health">Thyroid health</option>
                        <option value="heart-health">Heart and metabolic health</option>
                        <option value="vitamins">Vitamins and minerals</option>
                        <option value="sports">Sports and nutrition</option>
                        <option value="toxicology">Toxicology</option>
                        <option value="fertility">Fertility</option>
                        <option value="infectious">Infectious diseases</option>
                        <option value="autoimmunity">Autoimmunity and inflammation</option>
                        <option value="genetics">Genetics</option>
                        <option value="haematology">Haematology</option>
                        <option value="allergies">Allergies</option>
                      </select>
                    </div>
                    
                    <!-- Biomarker Search (initially hidden) -->
                    <div class="form-group" id="biomarker-group" style="display: none;">
                      <label for="biomarker-search">Search for specific biomarkers</label>
                      <div class="biomarker-search-container">
                        <input 
                          type="text" 
                          id="biomarker-search" 
                          class="biomarker-search-input" 
                          placeholder="Start typing biomarker name..."
                          autocomplete="off"
                        >
                        <div class="biomarker-dropdown" id="biomarker-dropdown" style="display: none;"></div>
                      </div>
                    </div>
                    
                    <!-- Second Biomarker Search (initially hidden) -->
                    <div class="form-group" id="biomarker-group-2" style="display: none;">
                      <label for="biomarker-search-2">Add another biomarker (optional)</label>
                      <div class="biomarker-search-container">
                        <input 
                          type="text" 
                          id="biomarker-search-2" 
                          class="biomarker-search-input" 
                          placeholder="Start typing biomarker name..."
                          autocomplete="off"
                        >
                        <div class="biomarker-dropdown" id="biomarker-dropdown-2" style="display: none;"></div>
                      </div>
                    </div>
                    
                    <button type="submit" class="search-button">
                      <span>Search</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Search Results Section -->
      <section class="search-results-section">
        <div class="container">
          <div class="results-header">
            <h2>Your Search Results</h2>
            <p>Based on your selection, here are the relevant tests and treatments</p>
          </div>
          
          <!-- Results will be populated here -->
          <div class="results-grid" id="results-grid">
            <div class="loading-results">
              <p>Loading results...</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function initializeSearchResultsPage() {
  // Initialize the quick search form functionality
  initializeQuickSearchForm();
  
  // Load and display results based on URL parameters
  loadSearchResults();
}

function initializeQuickSearchForm() {
  const form = document.getElementById('quick-search-form');
  const productCategory = document.getElementById('product-category');
  const categoryGroup = document.getElementById('category-group');
  const categorySelect = document.getElementById('category-select');
  const biomarkerGroup = document.getElementById('biomarker-group');
  const biomarkerGroup2 = document.getElementById('biomarker-group-2');
  const biomarkerSearch = document.getElementById('biomarker-search');
  const biomarkerSearch2 = document.getElementById('biomarker-search-2');
  const tabButtons = document.querySelectorAll('.tab-button');
  
  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Reset form when switching tabs
      form.reset();
      categoryGroup.style.display = 'none';
      biomarkerGroup.style.display = 'none';
      biomarkerGroup2.style.display = 'none';
    });
  });
  
  // Product category change
  productCategory.addEventListener('change', () => {
    const selectedCategory = productCategory.value;
    
    if (selectedCategory === 'blood-tests') {
      categoryGroup.style.display = 'block';
      biomarkerGroup.style.display = 'block';
    } else {
      categoryGroup.style.display = 'none';
      biomarkerGroup.style.display = 'none';
      biomarkerGroup2.style.display = 'none';
    }
  });
  
  // Category selection change
  categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    
    if (selectedCategory) {
      biomarkerGroup2.style.display = 'block';
    } else {
      biomarkerGroup2.style.display = 'none';
    }
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const searchParams = new URLSearchParams();
    
    // Add form data to URL parameters
    for (const [key, value] of formData.entries()) {
      if (value) {
        searchParams.set(key, value);
      }
    }
    
    // Navigate to search results with parameters
    window.location.hash = `#/search-results?${searchParams.toString()}`;
  });
}

async function loadSearchResults() {
  const resultsGrid = document.getElementById('results-grid');
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productCategory = urlParams.get('productCategory');
  const category = urlParams.get('category');
  const biomarkers = urlParams.get('biomarkers');
  
  try {
    // For now, show a placeholder message
    // Later this will fetch actual results based on the parameters
    resultsGrid.innerHTML = `
      <div class="results-placeholder">
        <h3>Search Parameters:</h3>
        <ul>
          <li><strong>Product Category:</strong> ${productCategory || 'Not specified'}</li>
          <li><strong>Category:</strong> ${category || 'Not specified'}</li>
          <li><strong>Biomarkers:</strong> ${biomarkers || 'Not specified'}</li>
        </ul>
        <p>This is where the actual search results will be displayed based on your selection.</p>
      </div>
    `;
  } catch (error) {
    console.error('Error loading search results:', error);
    resultsGrid.innerHTML = `
      <div class="error-message">
        <p>Error loading search results. Please try again.</p>
      </div>
    `;
  }
} 