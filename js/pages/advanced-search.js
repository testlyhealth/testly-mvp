import { supabase } from '../api/supabase.js';

export function getAdvancedSearchPageContent() {
  return `
    <!-- Advanced Search Page -->
    <section class="advanced-search-page">
      <div class="container">
        <div class="advanced-search-header">
          <h1>Advanced Search</h1>
          <p class="advanced-search-subtitle">
            Find the exact blood test or treatment you're looking for. Use our advanced search to filter by biomarkers, providers, price, and more.
          </p>
        </div>
        
        <div class="advanced-search-content">
          <!-- Quick Search Section -->
          <div class="quick-search-container" style="max-width: 600px; margin: 3rem auto; background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
            <div class="side-box-content" style="width: 100%;">
              <h3 style="text-align: center; margin-bottom: 1.5rem; color: #333; font-size: 1.5rem; font-weight: 600;">Quick Search</h3>
              <div class="search-tabs">
                <button class="tab-button active">Test / Treatment</button>
                <button class="tab-button">Problem</button>
              </div>
              <div class="search-form">
                <!-- Blood tests form -->
                <div class="form-content blood-tests-form">
                  <div class="form-group">
                    <label>Select a test or treatment *</label>
                    <select class="product-category-select">
                      <option value="">Select a test or treatment...</option>
                      <option value="blood-tests">Blood tests</option>
                      <option value="weight-loss">Weight loss</option>
                      <option value="coming-soon">Others coming soon</option>
                    </select>
                  </div>
                  <div class="form-group category-section">
                    <label></label>
                    <select class="category-select">
                      <option value="">---</option>
                    </select>
                  </div>
                  <div class="form-group biomarker-section">
                    <label></label>
                    <div class="biomarker-search-container">
                      <input type="text" class="biomarker-search-input" placeholder="---">
                      <div class="biomarker-dropdown" style="display: none;">
                        <!-- Results will be populated here -->
                      </div>
                    </div>
                  </div>
                  
                  <!-- Second biomarker section (initially hidden) -->
                  <div class="form-group second-biomarker-section" style="display: none;">
                    <label>Add another biomarker?</label>
                    <div class="biomarker-search-container">
                      <input type="text" class="biomarker-search-input-2" placeholder="Start typing a biomarker...">
                      <div class="biomarker-dropdown-2" style="display: none;">
                        <!-- Results will be populated here -->
                      </div>
                    </div>
                  </div>
                  <button class="search-button">
                    Search
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Problem form -->
                <div class="form-content problem-form" style="opacity: 0; visibility: hidden; position: absolute;">
                  <div class="form-group">
                    <label>What's your symptom or health aim?</label>
                    <select class="symptom-select">
                      <option value="">Choose an option</option>
                      <!-- Problem options will be loaded from database -->
                    </select>
                  </div>
                  <div class="form-group" style="visibility: hidden;">
                    <label>Placeholder</label>
                    <div class="biomarker-search-container">
                      <input type="text" placeholder="Placeholder">
                    </div>
                  </div>
                  <div class="form-group" style="visibility: hidden;">
                    <label>Placeholder</label>
                    <input type="text" placeholder="Placeholder">
                  </div>
                  <button class="search-button">
                    Find Solutions
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function initializeAdvancedSearchPage() {
  // Initialize the quick search functionality
  setupSearchTabs();
  setupQuickSearchForm();
  setupBiomarkerSearch();
  loadProblemList(); // Load problem list from database
}

// Copy the search functionality from home.js
function setupSearchTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const bloodTestsForm = document.querySelector('.blood-tests-form');
  const problemForm = document.querySelector('.problem-form');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show/hide appropriate form using opacity and visibility instead of display
      if (button.textContent === 'Test / Treatment') {
        bloodTestsForm.style.opacity = '1';
        bloodTestsForm.style.visibility = 'visible';
        bloodTestsForm.style.position = 'absolute';
        problemForm.style.opacity = '0';
        problemForm.style.visibility = 'hidden';
        problemForm.style.position = 'absolute';
      } else if (button.textContent === 'Problem') {
        bloodTestsForm.style.opacity = '0';
        bloodTestsForm.style.visibility = 'hidden';
        bloodTestsForm.style.position = 'absolute';
        problemForm.style.opacity = '1';
        problemForm.style.visibility = 'visible';
        problemForm.style.position = 'absolute';
      }
    });
  });
}

function setupQuickSearchForm() {
  const searchButton = document.querySelector('.blood-tests-form .search-button');
  if (searchButton) {
    searchButton.addEventListener('click', handleQuickSearch);
  }
  
  // Setup category section visibility based on first dropdown
  const productCategorySelect = document.querySelector('.product-category-select');
  const categorySection = document.querySelector('.category-section');
  
  // Initialize with "---" placeholder if no option is selected
  if (productCategorySelect && !productCategorySelect.value) {
    const categorySelect = document.querySelector('.category-select');
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">---</option>';
    }
  }
  
  if (productCategorySelect && categorySection) {
    productCategorySelect.addEventListener('change', (e) => {
      const selectedValue = e.target.value;
      
      // Clear validation errors when user makes a selection
      clearValidationErrors();
      
      if (selectedValue === 'blood-tests') {
        // Show category section when blood tests is selected
        categorySection.style.display = 'block';
        // Show biomarker sections
        const biomarkerSection = document.querySelector('.biomarker-section');
        const secondBiomarkerSection = document.querySelector('.second-biomarker-section');
        if (biomarkerSection) biomarkerSection.style.display = 'block';
        if (secondBiomarkerSection) secondBiomarkerSection.style.display = 'none'; // Hide second biomarker section initially
        // Load categories if not already loaded
        loadBloodTestCategories();
        // Update labels to show proper text
        const categoryLabel = categorySection.querySelector('label');
        const biomarkerLabel = biomarkerSection?.querySelector('label');
        if (categoryLabel) categoryLabel.textContent = 'What category do you need? *';
        if (biomarkerLabel) biomarkerLabel.textContent = 'Any specific biomarkers you need?';
        
        // Update biomarker input placeholder to show proper text
        const biomarkerInput = document.querySelector('.biomarker-search-input');
        if (biomarkerInput) biomarkerInput.placeholder = 'Start typing a biomarker...';
      } else {
        // Keep sections visible but show placeholder content
        categorySection.style.display = 'block';
        const biomarkerSection = document.querySelector('.biomarker-section');
        const secondBiomarkerSection = document.querySelector('.second-biomarker-section');
        if (biomarkerSection) biomarkerSection.style.display = 'block';
        if (secondBiomarkerSection) secondBiomarkerSection.style.display = 'none';
        
        // Update labels to show blank text
        const categoryLabel = categorySection.querySelector('label');
        const biomarkerLabel = biomarkerSection?.querySelector('label');
        if (categoryLabel) categoryLabel.textContent = '';
        if (biomarkerLabel) biomarkerLabel.textContent = '';
        
        // Clear selections and show placeholder text
        const categorySelect = document.querySelector('.category-select');
        const biomarkerInput = document.querySelector('.biomarker-search-input');
        const biomarkerInput2 = document.querySelector('.biomarker-search-input-2');
        if (categorySelect) {
          categorySelect.innerHTML = '<option value="">---</option>';
          categorySelect.selectedIndex = 0; // Ensure the first option is selected
        }
        if (biomarkerInput) biomarkerInput.value = '';
        if (biomarkerInput2) biomarkerInput2.value = '';
      }
    });
  }
}

function handleQuickSearch() {
  const productCategory = document.querySelector('.product-category-select')?.value;
  const category = document.querySelector('.category-select')?.value;
  const biomarker1 = document.querySelector('.biomarker-search-input')?.value;
  const biomarker2 = document.querySelector('.biomarker-search-input-2')?.value;
  
  // Clear previous validation errors
  clearValidationErrors();
  
  // Validate required fields
  let hasErrors = false;
  
  // Check if product category is selected
  if (!productCategory) {
    showValidationError('.product-category-select', 'Please select a test or treatment');
    hasErrors = true;
  }
  
  // Check if category is selected (only for blood tests)
  if (productCategory === 'blood-tests' && !category) {
    showValidationError('.category-select', 'Please select a category');
    hasErrors = true;
  }
  
  // If there are validation errors, don't proceed
  if (hasErrors) {
    return;
  }
  
  // Build search parameters
  const searchParams = new URLSearchParams();
  
  if (productCategory && productCategory !== 'all') {
    searchParams.set('productCategory', productCategory);
  }
  
  // Combine biomarkers if both are selected (only use actually selected ones)
  const biomarkers = [];
  if (biomarker1 && document.querySelector('.biomarker-search-input')?.dataset.selectedBiomarker === biomarker1) {
    biomarkers.push(biomarker1);
  }
  if (biomarker2 && document.querySelector('.biomarker-search-input-2')?.dataset.selectedBiomarker === biomarker2) {
    biomarkers.push(biomarker2);
  }
  
  if (biomarkers.length > 0) {
    searchParams.set('biomarkers', biomarkers.join(','));
  }
  
  // Navigate to category page with search parameters
  if (category === 'all') {
    // If "All" is selected, go to blood tests page with all categories parameter
    searchParams.set('showAll', 'true');
    const url = `#/blood-tests${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    window.location.hash = url;
  } else if (category && category !== 'all') {
    // Add category as filter parameter
    searchParams.set('filter', category);
            const url = `#/search-results${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    window.location.hash = url;
  } else {
    // If no category selected, go to blood tests page
    const url = `#/blood-tests${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    window.location.hash = url;
  }
}

// Function to show validation error
function showValidationError(selector, message) {
  const element = document.querySelector(selector);
  if (element) {
    element.style.borderColor = '#dc3545';
    element.style.borderWidth = '2px';
    
    // Add error message below the field
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    
    // Insert error message after the field
    element.parentNode.insertBefore(errorDiv, element.nextSibling);
  }
}

// Function to clear validation errors
function clearValidationErrors() {
  // Remove red borders
  const elements = document.querySelectorAll('.product-category-select, .category-select');
  elements.forEach(element => {
    element.style.borderColor = '';
    element.style.borderWidth = '';
  });
  
  // Remove error messages
  const errorMessages = document.querySelectorAll('.validation-error');
  errorMessages.forEach(error => error.remove());
}

// Load blood test categories from database
async function loadBloodTestCategories() {
  try {
    const { supabase } = await import('../api/supabase.js');
    const { data, error } = await supabase
      .from('blood_test_categories')
      .select('name')
      .order('name');
    
    if (error) {
      console.error('Error fetching blood test categories:', error);
      return;
    }
    
    const categorySelect = document.querySelector('.category-select');
    if (categorySelect && data) {
      // Clear existing options and set proper placeholder
      categorySelect.innerHTML = '<option value="">Select a category...</option>';
      
      // Add "All" option at the beginning
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'All';
      categorySelect.appendChild(allOption);
      
      // Add categories from database
      data.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
      
      // Add change event listener to clear validation errors
      categorySelect.addEventListener('change', () => {
        clearValidationErrors();
      });
    }
  } catch (error) {
    console.error('Error loading blood test categories:', error);
  }
}

// Load problem list from database
async function loadProblemList() {
  try {
    console.log('Loading problem list from database (advanced search)...');
    const { supabase } = await import('../api/supabase.js');
    const { data, error } = await supabase
      .from('problem_list')
      .select('name')
      .order('name');
    
    console.log('Problem list query result (advanced search):', { data, error });
    console.log('Data length (advanced search):', data ? data.length : 'null');
    console.log('First few items (advanced search):', data ? data.slice(0, 3) : 'null');
    
    if (error) {
      console.error('Error fetching problem list:', error);
      // Fallback to hardcoded list if database table doesn't exist
      console.log('Using fallback problem list (advanced search)');
      const fallbackProblems = [
        'Fatigue',
        'Weight gain',
        'Low energy',
        'Sleep issues',
        'Digestive problems',
        'Hormonal imbalance',
        'Stress & anxiety',
        'Immune support',
        'General wellness'
      ];
      
      const symptomSelect = document.querySelector('.symptom-select');
      if (symptomSelect) {
        symptomSelect.innerHTML = '<option value="">Choose an option</option>';
        fallbackProblems.forEach(problem => {
          const option = document.createElement('option');
          option.value = problem.toLowerCase().replace(/\s+/g, '-');
          option.textContent = problem;
          symptomSelect.appendChild(option);
          console.log('Added fallback problem option (advanced search):', problem);
        });
      }
      return;
    }
    
    const symptomSelect = document.querySelector('.symptom-select');
    console.log('Found symptom select element (advanced search):', symptomSelect);
    
    if (symptomSelect && data) {
      console.log('Populating dropdown with', data.length, 'problems (advanced search)');
      // Clear existing options and set proper placeholder
      symptomSelect.innerHTML = '<option value="">Choose an option</option>';
      
      // Add problems from database
      data.forEach(problem => {
        const option = document.createElement('option');
        option.value = problem.name;
        option.textContent = problem.name;
        symptomSelect.appendChild(option);
        console.log('Added problem option (advanced search):', problem.name);
      });
    } else {
      console.log('No symptom select element found or no data returned (advanced search)');
    }
  } catch (error) {
    console.error('Error loading problem list:', error);
  }
}

// Setup biomarker search functionality
function setupBiomarkerSearch() {
  const biomarkerInput = document.querySelector('.biomarker-search-input');
  const biomarkerDropdown = document.querySelector('.biomarker-dropdown');
  
  if (!biomarkerInput || !biomarkerDropdown) return;
  
  let searchTimeout;
  let selectedIndex = -1;
  
  biomarkerInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      biomarkerDropdown.style.display = 'none';
      return;
    }
    
    // Debounce the search
    searchTimeout = setTimeout(() => {
      searchBiomarkers(query, biomarkerDropdown);
    }, 300);
  });
  
  biomarkerInput.addEventListener('keydown', (e) => {
    const options = biomarkerDropdown.querySelectorAll('.biomarker-option');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
        updateSelection(options);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(options);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && options[selectedIndex]) {
          selectBiomarker(options[selectedIndex], biomarkerInput, biomarkerDropdown);
        }
        break;
      case 'Escape':
        biomarkerDropdown.style.display = 'none';
        selectedIndex = -1;
        break;
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!biomarkerInput.contains(e.target) && !biomarkerDropdown.contains(e.target)) {
      biomarkerDropdown.style.display = 'none';
      selectedIndex = -1;
    }
  });
  
  // Setup second biomarker search
  setupSecondBiomarkerSearch();
}

function setupSecondBiomarkerSearch() {
  const biomarkerInput2 = document.querySelector('.biomarker-search-input-2');
  const biomarkerDropdown2 = document.querySelector('.biomarker-dropdown-2');
  
  if (!biomarkerInput2 || !biomarkerDropdown2) return;
  
  let searchTimeout2;
  let selectedIndex2 = -1;
  
  biomarkerInput2.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout2);
    
    if (query.length < 2) {
      biomarkerDropdown2.style.display = 'none';
      return;
    }
    
    // Debounce the search
    searchTimeout2 = setTimeout(() => {
      searchBiomarkers(query, biomarkerDropdown2);
    }, 300);
  });
  
  biomarkerInput2.addEventListener('keydown', (e) => {
    const options = biomarkerDropdown2.querySelectorAll('.biomarker-option');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex2 = Math.min(selectedIndex2 + 1, options.length - 1);
        updateSelection(options);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex2 = Math.max(selectedIndex2 - 1, -1);
        updateSelection(options);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex2 >= 0 && options[selectedIndex2]) {
          selectSecondBiomarker(options[selectedIndex2]);
        }
        break;
      case 'Escape':
        biomarkerDropdown2.style.display = 'none';
        selectedIndex2 = -1;
        break;
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!biomarkerInput2.contains(e.target) && !biomarkerDropdown2.contains(e.target)) {
      biomarkerDropdown2.style.display = 'none';
      selectedIndex2 = -1;
    }
  });
}

// Search biomarkers function
async function searchBiomarkers(query, dropdownElement) {
  try {
    const { supabase } = await import('../api/supabase.js');
    const { data, error } = await supabase
      .from('biomarkers')
      .select('name')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20);
    
    if (error) {
      console.error('Error fetching biomarkers:', error);
      return;
    }
    
    const biomarkerNames = data.map(item => item.name);
    displayBiomarkerResults(biomarkerNames, dropdownElement);
  } catch (error) {
    console.error('Error searching biomarkers:', error);
  }
}

// Display biomarker search results
function displayBiomarkerResults(biomarkers, dropdownElement) {
  if (biomarkers.length === 0) {
    dropdownElement.innerHTML = '<div class="biomarker-option">No biomarkers found</div>';
  } else {
    dropdownElement.innerHTML = biomarkers
      .map(biomarker => `<div class="biomarker-option" data-value="${biomarker}">${biomarker}</div>`)
      .join('');
    
    // Add click event listeners based on which dropdown this is
    dropdownElement.querySelectorAll('.biomarker-option').forEach(option => {
      if (dropdownElement.classList.contains('biomarker-dropdown-2')) {
        option.addEventListener('click', () => selectSecondBiomarker(option));
      } else {
        option.addEventListener('click', () => selectBiomarker(option, null, dropdownElement));
      }
    });
  }
  
  dropdownElement.style.display = 'block';
}

// Select a biomarker
function selectBiomarker(option, inputElement, dropdownElement) {
  const biomarkerInput = inputElement || document.querySelector('.biomarker-search-input');
  const biomarkerDropdown = dropdownElement || document.querySelector('.biomarker-dropdown');
  
  biomarkerInput.value = option.dataset.value;
  biomarkerDropdown.style.display = 'none';
  biomarkerInput.focus();
  
  // Show second biomarker section if first biomarker is selected
  if (biomarkerInput.classList.contains('biomarker-search-input') && option.dataset.value) {
    const secondSection = document.querySelector('.second-biomarker-section');
    if (secondSection) {
      secondSection.style.display = 'block';
      // Update placeholder for second biomarker input
      const biomarkerInput2 = document.querySelector('.biomarker-search-input-2');
      if (biomarkerInput2) biomarkerInput2.placeholder = 'Start typing a biomarker...';
    }
  }
}

// Select second biomarker
function selectSecondBiomarker(option) {
  const biomarkerInput2 = document.querySelector('.biomarker-search-input-2');
  const biomarkerDropdown2 = document.querySelector('.biomarker-dropdown-2');
  
  biomarkerInput2.value = option.dataset.value;
  biomarkerDropdown2.style.display = 'none';
  biomarkerInput2.focus();
}

// Update selection in dropdown
function updateSelection(options) {
  options.forEach((option, index) => {
    if (index === selectedIndex) {
      option.classList.add('selected');
      option.scrollIntoView({ block: 'nearest' });
    } else {
      option.classList.remove('selected');
    }
  });
}