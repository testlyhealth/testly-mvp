// Home page module
import { $, $all } from '../dom.js';
import { blogPosts } from '../blog-data.js';
import { CardService } from '../services/cardService.js';
import { supabase } from '../api/supabase.js';
import { applyMaleHormoneCheckFilter } from '../general-health.js';

// Function to get count of tests in men's health and hormones category
async function getMensHealthTestCount() {
  try {
    const { data, error } = await supabase
      .from('blood_test_category_link_table')
      .select('*')
      .eq('blood_test_category_id', 3);
    
    if (error) {
      console.error('Error fetching men\'s health test count:', error);
      return 0;
    }
    
    return data.length || 0;
  } catch (error) {
    console.error('Error getting men\'s health test count:', error);
    return 0;
  }
}

// Function to get highest price in men's health and hormones category
async function getHighestPriceInCategory() {
  try {
    console.log('Querying for highest price in category 3...');
    
    const { data, error } = await supabase
      .from('blood_test_category_link_table')
      .select(`
        provider_blood_test_id,
        provider_blood_tests!inner (
          price
        )
      `)
      .eq('blood_test_category_id', 3);
    
    if (error) {
      console.error('Error fetching highest price:', error);
      return 209; // Default fallback
    }
    
    console.log('Raw data from query:', data);
    
    if (!data || data.length === 0) {
      console.log('No data found for category 3');
      return 209; // Default fallback
    }
    
    const prices = data.map(item => item.provider_blood_tests.price).filter(price => price != null);
    console.log('Extracted prices:', prices);
    
    const highestPrice = Math.max(...prices);
    console.log('Highest price found:', highestPrice);
    
    return highestPrice || 209;
  } catch (error) {
    console.error('Error getting highest price:', error);
    return 209; // Default fallback
  }
}

// Function to update search button count
async function updateSearchButtonCount() {
  try {
    const count = await getMensHealthTestCount();
    const testCountElement = document.querySelector('.search-button .test-count');
    if (testCountElement) {
      testCountElement.textContent = count;
    }
  } catch (error) {
    console.error('Error updating search button count:', error);
  }
}

// Function to get test count for min price bracket (tests >= price)
async function getMinPriceTestCount(price) {
  try {
    const { data, error } = await supabase
      .from('blood_test_category_link_table')
      .select(`
        provider_blood_test_id,
        provider_blood_tests!inner (
          price
        )
      `)
      .eq('blood_test_category_id', 3)
      .gte('provider_blood_tests.price', price);
    
    if (error) {
      console.error('Error fetching min price test count:', error);
      return 0;
    }
    
    return data.length || 0;
  } catch (error) {
    console.error('Error getting min price test count:', error);
    return 0;
  }
}

// Function to get test count for max price bracket (tests <= price)
async function getMaxPriceTestCount(price) {
  try {
    const { data, error } = await supabase
      .from('blood_test_category_link_table')
      .select(`
        provider_blood_test_id,
        provider_blood_tests!inner (
          price
        )
      `)
      .eq('blood_test_category_id', 3)
      .lte('provider_blood_tests.price', price);
    
    if (error) {
      console.error('Error fetching max price test count:', error);
      return 0;
    }
    
    return data.length || 0;
  } catch (error) {
    console.error('Error getting max price test count:', error);
    return 0;
  }
}

// Function to get test count for min price bracket within specific test IDs (tests >= price)
async function getMinPriceTestCountForTests(price, testIds) {
  try {
    const { data, error } = await supabase
      .from('provider_blood_tests')
      .select('id')
      .in('id', testIds)
      .gte('price', price);
    
    if (error) {
      console.error('Error fetching min price test count for specific tests:', error);
      return 0;
    }
    
    return data.length || 0;
  } catch (error) {
    console.error('Error getting min price test count for specific tests:', error);
    return 0;
  }
}

// Function to get test count for max price bracket within specific test IDs (tests <= price)
async function getMaxPriceTestCountForTests(price, testIds) {
  try {
    const { data, error } = await supabase
      .from('provider_blood_tests')
      .select('id')
      .in('id', testIds)
      .lte('price', price);
    
    if (error) {
      console.error('Error fetching max price test count for specific tests:', error);
      return 0;
    }
    
    return data.length || 0;
  } catch (error) {
    console.error('Error getting max price test count for specific tests:', error);
    return 0;
  }
}



// Function to get all blood taking methods from men's health and hormones category
async function getMethodsInCategory() {
  try {
    const { data, error } = await supabase
      .from('blood_test_category_link_table')
      .select(`
        provider_blood_test_id,
        provider_blood_tests!inner (
          blood_taking_method_link_table (
            blood_taking_methods (
              name
            )
          )
        )
      `)
      .eq('blood_test_category_id', 3);
    
    if (error) {
      console.error('Error fetching methods:', error);
      return [];
    }
    
    console.log('Raw method data from database:', data.slice(0, 3));
    
    // Count tests per method
    const methodCounts = {};
    data.forEach(item => {
      const methods = item.provider_blood_tests.blood_taking_method_link_table;
      if (methods && methods.length > 0) {
        methods.forEach(methodLink => {
          if (methodLink.blood_taking_methods) {
            const methodName = methodLink.blood_taking_methods.name;
            methodCounts[methodName] = (methodCounts[methodName] || 0) + 1;
          }
        });
      }
    });
    
    console.log('Method counts:', methodCounts);
    
    // Convert to array and sort by method name
    const methodsWithCounts = Object.entries(methodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('Final methods with counts:', methodsWithCounts);
    return methodsWithCounts;
  } catch (error) {
    console.error('Error getting methods:', error);
    return [];
  }
}



// Function to update method dropdown
async function updateMethodDropdown() {
  try {
    const methods = await getMethodsInCategory();
    console.log('Available methods for dropdown:', methods);
    const methodSelects = document.querySelectorAll('.dropdown-select-4');
    
    methodSelects.forEach(methodSelect => {
      if (methodSelect) {
        methodSelect.innerHTML = '<option value="">Method</option>';
        methods.forEach(method => {
          const option = document.createElement('option');
          option.value = method.name;
          option.textContent = `${method.name} (${method.count})`;
          methodSelect.appendChild(option);
        });
        console.log('Method dropdown populated with options:', methodSelect.options.length - 1);
      }
    });
  } catch (error) {
    console.error('Error updating method dropdown:', error);
  }
}

// Function to generate price options and update dropdowns
async function updatePriceDropdowns() {
  try {
    console.log('Updating price dropdowns...');
    const highestPrice = await getHighestPriceInCategory();
    console.log('Highest price for dropdowns:', highestPrice);
    
    const priceOptions = [];
    
    // Generate options from 0 to highest price in increments of 50
    // Round up to the next £50 increment to ensure the highest price is included
    const roundedHighestPrice = Math.ceil(highestPrice / 50) * 50;
    for (let price = 0; price <= roundedHighestPrice; price += 50) {
      priceOptions.push(price);
    }
    
    console.log('Generated price options:', priceOptions);
    
    // Update min price dropdowns on both sides
    const minPriceSelects = document.querySelectorAll('.dropdown-select-1');
    minPriceSelects.forEach(async (minPriceSelect) => {
      if (minPriceSelect) {
        console.log('Found min price select element');
        minPriceSelect.innerHTML = '<option value="">Min price</option>';
        
        for (const price of priceOptions) {
          const count = await getMinPriceTestCount(price);
          const option = document.createElement('option');
          option.value = price;
          option.textContent = `£${price} (${count})`;
          minPriceSelect.appendChild(option);
        }
      } else {
        console.log('Min price select element not found');
      }
    });
    
    // Update max price dropdowns on both sides
    const maxPriceSelects = document.querySelectorAll('.dropdown-select-2');
    maxPriceSelects.forEach(async (maxPriceSelect) => {
      if (maxPriceSelect) {
        console.log('Found max price select element');
        maxPriceSelect.innerHTML = '<option value="">Max price</option>';
        
        for (const price of priceOptions) {
          // Skip £0 for max price dropdown
          if (price === 0) continue;
          
          const count = await getMaxPriceTestCount(price);
          const option = document.createElement('option');
          option.value = price;
          option.textContent = `£${price} (${count})`;
          maxPriceSelect.appendChild(option);
        }
      } else {
        console.log('Max price select element not found');
      }
    });
  } catch (error) {
    console.error('Error updating price dropdowns:', error);
  }
}

// Initialize card service
const cardService = new CardService();

// Static homepage content
export function getHomePageContent() {
    return `
        <!-- Hero Section -->
    <section class="hero-section" id="hero-form">
      <div class="hero-bg-color-banner"></div>
      <div class="hero-bg-banner"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <div class="hero-title-line">
            <span class="checkmark">✓</span>
            <span class="title-word blue">Compare</span>
          </div>
          <div class="hero-title-line">
            <span class="checkmark">✓</span>
            <span class="title-word">Book</span>
          </div>
          <div class="hero-title-line">
            <span class="checkmark">✓</span>
            <span class="title-word">Track</span>
          </div>
        </h1>
        <p class="hero-subtitle">
          <span style="color: #1E88E5;">Health comparison</span> made simple
        </p>

        <div class="hero-cta">
          <p class="cta-note">Free comparison • No booking fees • Trusted providers</p>
        </div>
      </div>
      
      <div class="hero-side-box">
        <div class="side-box-content">
          <h3>Find <span style="color: #1E88E5; text-decoration: underline;">testosterone</span> solutions</h3>
                      <div class="search-tabs">
              <div class="tab-toggle">
                <button class="tab-button active" data-tab="blood-tests">Help me choose</button>
                <button class="tab-button" data-tab="let-me-pick">Let me pick</button>
              </div>
            </div>
          
          <div class="search-form">
            <!-- Blood tests form -->
            <div class="form-content blood-tests-form">
              <!-- Testosterone options dropdown -->
              <div class="form-group" style="margin: 5px 0 20px 0;">
                <select class="testosterone-options-select">
                  <option value="">Choose your testosterone options</option>
                  <option value="browse-all">All</option>
                  <option value="testosterone-only">Testosterone only</option>
                  <option value="testosterone-full-hormone-only">Male hormone check only (includes testosterone)</option>
                  <option value="testosterone-full-hormone">Male hormone check + general health check</option>
                  <option value="trt-monitoring">TRT monitoring</option>
                </select>
              </div>
              <!-- Method dropdown -->
              <div class="form-group dropdown-row">
                <div class="dropdown-container">
                  <select class="dropdown-select-4">
                    <option value="">Method</option>
                    <option value="All">All</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
              </div>
              
              <!-- Side by side dropdown boxes -->
              <div class="form-group dropdown-row">
                <div class="dropdown-container">
                  <select class="dropdown-select-1">
                    <option value="">Min price</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
                <div class="dropdown-container">
                  <select class="dropdown-select-2">
                    <option value="">Max price</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
              </div>
              
              <button class="search-button">
                Search <span class="test-count">0</span> tests
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="form-links-container">
                <div class="reset-filters-link">
                  <a href="#" class="reset-filters">Reset filters</a>
                </div>
                <div class="advanced-search-link">
                  <a href="#" class="advanced-search-text" id="advanced-search-link">Advanced search</a>
                </div>
              </div>
            </div>
            
            <!-- Problem form -->
            <div class="form-content problem-form" style="opacity: 0; visibility: hidden; position: absolute;">
              <!-- Add a biomarker box -->
              <div class="form-group">
                <div class="biomarker-search-container">
                  <input type="text" class="biomarker-search-input" placeholder="Add a biomarker">
                  <div class="biomarker-dropdown" style="display: none;">
                    <!-- Results will be populated here -->
                  </div>
                </div>
              </div>
              
              <!-- Add another biomarker box -->
              <div class="form-group second-biomarker-section">
                <div class="biomarker-search-container">
                  <input type="text" class="biomarker-search-input-2" placeholder="Add another biomarker">
                  <div class="biomarker-dropdown-2" style="display: none;">
                    <!-- Results will be populated here -->
                  </div>
                </div>
              </div>
              
              <!-- Method dropdown -->
              <div class="form-group">
                <select class="dropdown-select-4">
                  <option value="">Method</option>
                  <!-- Method options will be loaded dynamically -->
                </select>
              </div>

              <!-- Side by side dropdown boxes -->
              <div class="form-group dropdown-row">
                <div class="dropdown-container">
                  <select class="dropdown-select-1">
                    <option value="">Min price</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
                <div class="dropdown-container">
                  <select class="dropdown-select-2">
                    <option value="">Max price</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                  </select>
                </div>
              </div>

              <button class="search-button">
                Search <span class="test-count">0</span> tests
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="form-links-container">
                <div class="reset-filters-link">
                  <a href="#" class="reset-filters">Reset filters</a>
                </div>
                <div class="advanced-search-link">
                  <a href="#" class="advanced-search-text" id="advanced-search-link">Advanced search</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <div class="container">
        <div class="how-it-works-content">
          <h2 class="how-it-works-title">How does it work?</h2>
          <div class="how-it-works-steps">
            <div class="step active">
              <div class="step-corner-icon compare-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" stroke-width="2" fill="none"/>
                  <line x1="9" y1="3" x2="9" y2="21" stroke="white" stroke-width="2"/>
                  <line x1="15" y1="3" x2="15" y2="21" stroke="white" stroke-width="2"/>
                  <line x1="3" y1="9" x2="21" y2="9" stroke="white" stroke-width="2"/>
                  <line x1="3" y1="15" x2="21" y2="15" stroke="white" stroke-width="2"/>
                </svg>
              </div>
              <h3>Compare</h3>
              <p>Compare prices and providers to <strong>find the best</strong> option for you - and your <strong>budget</strong></p>
                               <div class="step-button">
                   <button class="step-cta-button" onclick="scrollToForm()">Compare now</button>
                 </div>
            </div>
            <div class="step">
              <div class="step-corner-icon book-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h18v18H3z" stroke="white" stroke-width="2" fill="none"/>
                  <path d="M7 7h10v2H7z" fill="white"/>
                  <path d="M7 11h8v2H7z" fill="white"/>
                  <path d="M7 15h6v2H7z" fill="white"/>
                  <circle cx="17" cy="17" r="2" fill="white"/>
                  <path d="M15 15l4 4" stroke="#1E88E5" stroke-width="2"/>
                </svg>
              </div>
              <h3>Book</h3>
              <p>Book your test or treatment directly with the provider of your choice</p>
                               <div class="step-button">
                   <button class="step-cta-button" onclick="scrollToForm()">Find tests</button>
                 </div>
            </div>
            <div class="step">
              <div class="step-corner-icon track-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21h18" stroke="white" stroke-width="2"/>
                  <path d="M3 3v18" stroke="white" stroke-width="2"/>
                  <path d="M7 14l3-3 3 3 4-4" stroke="white" stroke-width="2" fill="none"/>
                  <path d="M19 7l-4 4" stroke="white" stroke-width="2" fill="none"/>
                  <path d="M15 11l4-4" stroke="white" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <h3>Track</h3>
              <p><strong>Anonymously</strong> upload your results from <strong>any provider</strong> and track them all in one place - upload past results too!</p>
              <div class="step-button">
                <button class="step-cta-button">Track results</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

        <!-- Trust Indicators Section -->
    <section class="trust-section">
      <div class="container">
        <div class="trust-content">
          <div class="trust-text">
            <h2>Why choose Testly?</h2>
            <div class="trust-features">
              <div class="trust-feature">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <h4>Compare prices instantly</h4>
                  <p>See all providers and prices in one place</p>
                </div>
              </div>
              <div class="trust-feature">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <h4>No booking fees</h4>
                  <p>Book directly with providers at their listed prices</p>
                </div>
              </div>
              <div class="trust-feature">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <h4>Trusted providers</h4>
                  <p>All providers are verified and regulated</p>
                </div>
              </div>
              <div class="trust-feature">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <h4>Doctor-led</h4>
                  <p>Services and content written and chosen by doctors</p>
                </div>
              </div>
              <div class="trust-feature">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <h4>Expert guidance</h4>
                  <p>Professional advice to help you choose the right tests</p>
                </div>
              </div>
              <div class="trust-feature">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <h4>Easy booking</h4>
                  <p>Simple and straightforward booking process</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Multi-Provider Results Section -->
    <section class="multi-provider-section">
      <div class="container">
        <div class="multi-provider-content">
          <h2>Have test results from <span style="color: #1E88E5;">multiple providers</span>?</h2>
          <p>Track your results <strong>in one single place</strong> and gain insights into your health.</p>
          <div class="multi-provider-image">
            <img src="images/graph_my_results.png" alt="Blood test results table showing hormone data across multiple dates" />
          </div>
          <div class="multi-provider-cta">
            <button class="multi-provider-button">Track my results</button>
          </div>
        </div>
      </div>
    </section>

    <!-- New Banner Section -->
    <section class="new-banner-section">
      <div class="container">
        <div class="new-banner-content">
          <div class="banner-text">
            <h2>Ready to take control of your health?</h2>
            <p>Make informed health decisions with Testly</p>
          </div>
          <div class="banner-actions">
            <button class="banner-cta-button" onclick="scrollToForm()">
              Get started today
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="featured-section">
      <div class="container">
        <h2 class="section-title">Popular blood tests</h2>
        <p class="section-subtitle">Our top blood tests starting from <strong>£33</strong></p>
        <div class="featured-grid" id="featured-blood-tests-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; padding: 2rem;">
          <style>
            #featured-blood-tests-grid .blood-test-card {
              border-radius: 25px;
              overflow: hidden;
            }
          </style>
          <!-- Blood test cards will be populated here dynamically -->
        </div>
        <div class="featured-cta">
          <button class="secondary-cta-button">
            Graph my results
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
        </section>
  `;
}

// Homepage-specific functionality
export function initializeHomePage() {
  loadFeaturedBloodTest();
  loadProblemList(); // Load problem list from database
  setupNavigationHandlers();
  setupCategoryCards();

  setupSearchTabs();
  setupOptionCardSelection();
      updateSearchButtonCountSimple('default'); // Update search button count using new simple function
  updateMethodDropdown(); // Update method dropdown
  updatePriceDropdowns(); // Update price dropdowns
  setupDynamicCountUpdate(); // Setup dynamic count updates
  
  // Set initial count for all search buttons
  setTimeout(() => {
    updateSearchButtonCountSimple('default');
  }, 100);
  
  // Setup step card interactions
  setTimeout(() => {
    setupStepCardInteractions();
  }, 200);
  
  // Make scrollToQuickSearch function globally available
  window.scrollToQuickSearch = scrollToQuickSearch;
  
  // Make scrollToForm function globally available
  window.scrollToForm = scrollToForm;
}

// Function to scroll to form and highlight it briefly
function scrollToForm() {
  const formSection = document.getElementById('hero-form');
  if (formSection) {
    // Scroll to the form section
    formSection.scrollIntoView({ behavior: 'smooth' });
    
    // Add highlight class briefly
    formSection.classList.add('form-highlight');
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
      formSection.classList.remove('form-highlight');
    }, 2000);
  }
}

// Setup step card interactions for the "How it works" section
function setupStepCardInteractions() {
  const stepCards = document.querySelectorAll('.step');
  
  if (stepCards.length === 0) {
    // If cards aren't loaded yet, try again in a bit
    setTimeout(setupStepCardInteractions, 100);
    return;
  }
  
  stepCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Remove active class from all cards
      stepCards.forEach(c => c.classList.remove('active'));
      // Add active class to hovered card
      card.classList.add('active');
    });
    
    // Remove the mouseleave event listener so the last hovered card stays highlighted
  });
  
  // Add click handlers for the step buttons
  const stepButtons = document.querySelectorAll('.step-cta-button');
  stepButtons.forEach((button, index) => {
    if (index === 0) {
      // First button (Compare now) - scroll to form
      button.addEventListener('click', () => {
        scrollToForm();
      });
    } else if (index === 2) {
      // Third button (Track results) - go to track waiting list
      button.addEventListener('click', () => {
        window.location.hash = '#/track-waiting-list';
      });
    }
  });
}

// Load featured blood tests from database
async function loadFeaturedBloodTest() {
  try {
    // Fetch the three specified tests in parallel with enriched data
    const [test1Result, test2Result, test3Result] = await Promise.all([
      supabase
        .from('provider_blood_tests')
        .select(`
          *,
          providers:provider_id (
            name
          ),
          biomarker_link_table (
            biomarkers (
              name
            )
          ),
          blood_taking_method_link_table (
            blood_taking_methods (
              name
            )
          )
        `)
        .eq('id', 5)
        .single(),
      supabase
        .from('provider_blood_tests')
        .select(`
          *,
          providers:provider_id (
            name
          ),
          biomarker_link_table (
            biomarkers (
              name
            )
          ),
          blood_taking_method_link_table (
            blood_taking_methods (
              name
            )
          )
        `)
        .eq('id', 63)
        .single(),
      supabase
        .from('provider_blood_tests')
        .select(`
          *,
          providers:provider_id (
            name
          ),
          biomarker_link_table (
            biomarkers (
              name
            )
          ),
          blood_taking_method_link_table (
            blood_taking_methods (
              name
            )
          )
        `)
        .eq('id', 152)
        .single()
    ]);

    // Collect all successful test data
    const tests = [];
    const results = [test1Result, test2Result, test3Result];
    
    results.forEach((result, index) => {
      if (result.error) {
        console.error(`Error fetching blood test ${index + 1}:`, result.error);
      } else if (result.data) {
        // Convert database format to CardService format with enriched data
        const biomarkers = result.data.biomarker_link_table?.map(link => link.biomarkers?.name).filter(Boolean) || [];
        const bloodTakingMethods = result.data.blood_taking_method_link_table?.map(link => link.blood_taking_methods?.name).filter(Boolean) || [];
        
        const testData = {
          name: result.data.name,
          provider: result.data.providers?.name || 'Unknown Provider',
          price: result.data.price || 0,
          biomarkers: biomarkers,
          url: result.data.url || '#',
          logo: result.data.logo_url || '',
          description: result.data.description || '',
          blood_taking_method: bloodTakingMethods.join(', ') || 'Finger prick',
          results_returned: result.data.results_returned || '2 days',
          doctors_report: result.data.doctors_report ? 'Yes' : 'No',
          trustpilot_score: result.data.trustpilot_score || 4.5,
          biomarker_count: biomarkers.length || result.data.biomarker_column || 0,
          grouped_biomarkers: {
            "General Health": biomarkers
          }
        };
        tests.push(testData);
      }
    });

    // Create blood test cards using CardService
    if (tests.length > 0) {
      const bloodTestCards = await Promise.all(
        tests.map(async (test, index) => {
          return await cardService.createCard(test, { rank: index + 1 });
        })
      );

      // Update the featured grid with the new cards
      const featuredGrid = document.getElementById('featured-blood-tests-grid');
      if (featuredGrid) {
        featuredGrid.innerHTML = bloodTestCards.join('');
        
        // Setup event handlers for the new cards
        cardService.setupCardEventHandlers(tests);
      }
    }
  } catch (error) {
    console.error('Error loading featured blood tests:', error);
  }
}

// Update the first card with real data
function updateFirstCard(testData) {
  console.log('Updating first card with data:', testData);
  
  const firstCard = document.querySelector('.featured-card');
  if (!firstCard) {
    console.error('No featured card found in DOM');
    return;
  }
  
  console.log('Found featured card:', firstCard);

  // Update provider name
  const providerName = firstCard.querySelector('.provider-name');
  if (providerName) {
    const name = testData.providers?.name || 'Provider Name';
    providerName.textContent = name;
    console.log('Updated provider name to:', name);
  } else {
    console.error('Provider name element not found');
  }

  // Update test name
  const testName = firstCard.querySelector('.test-name');
  if (testName) {
    testName.textContent = testData.name || 'Blood Test Name';
  }

  // Update biomarker count
  const biomarkerCount = firstCard.querySelector('.biomarker-count');
  if (biomarkerCount) {
    const count = testData.biomarker_number || 15;
    const digitEmojis = count.toString().split('').map(digit => {
      const emojiMap = {
        '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
        '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
      };
      return emojiMap[digit] || digit;
    }).join('');
    biomarkerCount.textContent = `Biomarkers tested: ${digitEmojis}`;
  }

  // Update price
  const testPrice = firstCard.querySelector('.test-price');
  if (testPrice) {
    const price = testData.price || 45;
    testPrice.textContent = `£${price}`;
  }

  // Update logo with actual provider logo image
  const placeholderLogo = firstCard.querySelector('.placeholder-logo');
  if (placeholderLogo && testData.providers?.name) {
    const providerName = testData.providers.name;
    const logoFileName = providerName.toLowerCase().replace(/ /g, ' ') + '.png';
    placeholderLogo.innerHTML = `<img src="images/logos/${logoFileName}" alt="${providerName} logo" style="width: 100%; height: 100%; object-fit: contain;">`;
  }

  // Set background logo image on the card
  if (testData.providers?.name) {
    const providerName = testData.providers.name;
    const logoFileName = providerName.toLowerCase().replace(/ /g, ' ') + '.png';
    firstCard.style.setProperty('--background-logo', `url('images/logos/${logoFileName}')`);
  }

  // Update View Test button link and add arrow
  const viewTestBtn = firstCard.querySelector('.view-test-btn');
  if (viewTestBtn) {
    // Add arrow icon if not already present
    if (!viewTestBtn.querySelector('svg')) {
      viewTestBtn.innerHTML = `
        View test
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
    
    if (testData.url) {
      viewTestBtn.onclick = () => {
        window.open(testData.url, '_blank');
      };
    }
  }
}

// Update the second card with real data
function updateSecondCard(testData) {
  console.log('Updating second card with data:', testData);
  
  const featuredCards = document.querySelectorAll('.featured-card');
  const secondCard = featuredCards[1]; // Get the second card
  if (!secondCard) {
    console.error('No second featured card found in DOM');
    return;
  }
  
  console.log('Found second featured card:', secondCard);

  // Update provider name
  const providerName = secondCard.querySelector('.provider-name');
  if (providerName) {
    const name = testData.providers?.name || 'Provider Name';
    providerName.textContent = name;
    console.log('Updated second card provider name to:', name);
  } else {
    console.error('Second card provider name element not found');
  }

  // Update test name
  const testName = secondCard.querySelector('.test-name');
  if (testName) {
    testName.textContent = testData.name || 'Blood Test Name';
  }

  // Update biomarker count
  const biomarkerCount = secondCard.querySelector('.biomarker-count');
  if (biomarkerCount) {
    const count = testData.biomarker_number || 15;
    const digitEmojis = count.toString().split('').map(digit => {
      const emojiMap = {
        '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
        '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
      };
      return emojiMap[digit] || digit;
    }).join('');
    biomarkerCount.textContent = `Biomarkers tested: ${digitEmojis}`;
  }

  // Update price
  const testPrice = secondCard.querySelector('.test-price');
  if (testPrice) {
    const price = testData.price || 45;
    testPrice.textContent = `£${price}`;
  }

  // Update logo with actual provider logo image
  const placeholderLogo = secondCard.querySelector('.placeholder-logo');
  if (placeholderLogo && testData.providers?.name) {
    const providerName = testData.providers.name;
    const logoFileName = providerName.toLowerCase().replace(/ /g, ' ') + '.png';
    placeholderLogo.innerHTML = `<img src="images/logos/${logoFileName}" alt="${providerName} logo" style="width: 100%; height: 100%; object-fit: contain;">`;
  }

  // Set background logo image on the card
  if (testData.providers?.name) {
    const providerName = testData.providers.name;
    const logoFileName = providerName.toLowerCase().replace(/ /g, ' ') + '.png';
    secondCard.style.setProperty('--background-logo', `url('images/logos/${logoFileName}')`);
  }

  // Update View Test button link and add arrow
  const viewTestBtn = secondCard.querySelector('.view-test-btn');
  if (viewTestBtn) {
    // Add arrow icon if not already present
    if (!viewTestBtn.querySelector('svg')) {
      viewTestBtn.innerHTML = `
        View test
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
    
    if (testData.url) {
      viewTestBtn.onclick = () => {
        window.open(testData.url, '_blank');
      };
    }
  }
}

// Update the third card with real data
function updateThirdCard(testData) {
  console.log('Updating third card with data:', testData);
  
  const featuredCards = document.querySelectorAll('.featured-card');
  const thirdCard = featuredCards[2]; // Get the third card
  if (!thirdCard) {
    console.error('No third featured card found in DOM');
    return;
  }
  
  console.log('Found third featured card:', thirdCard);

  // Update provider name
  const providerName = thirdCard.querySelector('.provider-name');
  if (providerName) {
    const name = testData.providers?.name || 'Provider Name';
    providerName.textContent = name;
    console.log('Updated third card provider name to:', name);
      } else {
    console.error('Third card provider name element not found');
  }

  // Update test name
  const testName = thirdCard.querySelector('.test-name');
  if (testName) {
    testName.textContent = testData.name || 'Blood Test Name';
  }

  // Update biomarker count
  const biomarkerCount = thirdCard.querySelector('.biomarker-count');
  if (biomarkerCount) {
    const count = testData.biomarker_number || 15;
    const digitEmojis = count.toString().split('').map(digit => {
      const emojiMap = {
        '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
        '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
      };
      return emojiMap[digit] || digit;
    }).join('');
    biomarkerCount.textContent = `Biomarkers tested: ${digitEmojis}`;
  }

  // Update price
  const testPrice = thirdCard.querySelector('.test-price');
  if (testPrice) {
    const price = testData.price || 45;
    testPrice.textContent = `£${price}`;
  }

  // Update logo with actual provider logo image
  const placeholderLogo = thirdCard.querySelector('.placeholder-logo');
  if (placeholderLogo && testData.providers?.name) {
    const providerName = testData.providers.name;
    const logoFileName = providerName.toLowerCase().replace(/ /g, ' ') + '.png';
    placeholderLogo.innerHTML = `<img src="images/logos/${logoFileName}" alt="${providerName} logo" style="width: 100%; height: 100%; object-fit: contain;">`;
  }

  // Set background logo image on the card
  if (testData.providers?.name) {
    const providerName = testData.providers.name;
    const logoFileName = providerName.toLowerCase().replace(/ /g, ' ') + '.png';
    thirdCard.style.setProperty('--background-logo', `url('images/logos/${logoFileName}')`);
  }

  // Update View Test button link and add arrow
  const viewTestBtn = thirdCard.querySelector('.view-test-btn');
  if (viewTestBtn) {
    // Add arrow icon if not already present
    if (!viewTestBtn.querySelector('svg')) {
      viewTestBtn.innerHTML = `
        View test
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
    
    if (testData.url) {
      viewTestBtn.onclick = () => {
        window.open(testData.url, '_blank');
      };
    }
  }
}

// Update the fourth card with real data
function updateFourthCard(testData) {
  console.log('Updating fourth card with data:', testData);
  
  const featuredCards = document.querySelectorAll('.featured-card');
  const fourthCard = featuredCards[3]; // Get the fourth card
  if (!fourthCard) {
    console.error('No fourth featured card found in DOM');
    return;
  }
  
  console.log('Found fourth featured card:', fourthCard);

  // Update provider name
  const providerName = fourthCard.querySelector('.provider-name');
  if (providerName) {
    const name = testData.providers?.name || 'Provider Name';
    providerName.textContent = name;
    console.log('Updated fourth card provider name to:', name);
  } else {
    console.error('Fourth card provider name element not found');
  }

  // Update test name
  const testName = fourthCard.querySelector('.test-name');
  if (testName) {
    testName.textContent = testData.name || 'Blood Test Name';
  }

  // Update biomarker count
  const biomarkerCount = fourthCard.querySelector('.biomarker-count');
  if (biomarkerCount) {
    const count = testData.biomarker_number || 15;
    const digitEmojis = count.toString().split('').map(digit => {
      const emojiMap = {
        '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
        '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
      };
      return emojiMap[digit] || digit;
    }).join('');
    biomarkerCount.textContent = `Biomarkers tested: ${digitEmojis}`;
  }

  // Update price
  const testPrice = fourthCard.querySelector('.test-price');
  if (testPrice) {
    const price = testData.price || 45;
    testPrice.textContent = `£${price}`;
  }

  // Update logo with actual provider logo image
  const placeholderLogo = fourthCard.querySelector('.placeholder-logo');
  if (placeholderLogo && testData.providers?.name) {
    const providerName = testData.providers.name;
    const logoFileName = providerName.toLowerCase().replace(/ /g, ' ') + '.png';
    placeholderLogo.innerHTML = `<img src="images/logos/${logoFileName}" alt="${providerName} logo" style="width: 100%; height: 100%; object-fit: contain;">`;
  }

  // Set background logo image on the card
  if (testData.providers?.name) {
    const providerName = testData.providers.name;
    const logoFileName = providerName.toLowerCase().replace(/ /g, ' ') + '.png';
    fourthCard.style.setProperty('--background-logo', `url('images/logos/${logoFileName}')`);
  }

  // Update View Test button link and add arrow
  const viewTestBtn = fourthCard.querySelector('.view-test-btn');
  if (viewTestBtn) {
    // Add arrow icon if not already present
    if (!viewTestBtn.querySelector('svg')) {
      viewTestBtn.innerHTML = `
        View test
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
    
    if (testData.url) {
      viewTestBtn.onclick = () => {
        window.open(testData.url, '_blank');
      };
    }
  }
}

// Setup category card navigation
function setupCategoryCards() {
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      if (category) {
        window.location.hash = `#/category/${category}`;
      }
    });
  });
}



// Setup navigation handlers
function setupNavigationHandlers() {
  // Add click handler for the multi-provider button
  const multiProviderButton = document.querySelector('.multi-provider-button');
  if (multiProviderButton) {
    multiProviderButton.addEventListener('click', () => {
      window.location.hash = '#/track-waiting-list';
    });
  }
  
  // Add click handler for the Graph my results button
  const graphResultsButton = document.querySelector('.secondary-cta-button');
  if (graphResultsButton) {
    graphResultsButton.addEventListener('click', () => {
      window.location.hash = '#/graph';
    });
  }
}



// Setup search tab switching functionality
        function setupSearchTabs() {
          const tabButtons = document.querySelectorAll('.tab-button');
          const bloodTestsForm = document.querySelector('.blood-tests-form');
          const problemForm = document.querySelector('.problem-form');
          
          // Setup biomarker search functionality
          setupBiomarkerSearch();
          
          // Setup form submission
          setupQuickSearchForm();
          
          tabButtons.forEach(button => {
            button.addEventListener('click', () => {
              // Remove active class from all buttons
              tabButtons.forEach(btn => btn.classList.remove('active'));
              
              // Add active class to clicked button
              button.classList.add('active');
              
              // Get the tab type from data attribute
              const tabType = button.getAttribute('data-tab');
              
              // Show/hide appropriate form using opacity and visibility instead of display
              if (tabType === 'blood-tests') {
                bloodTestsForm.style.opacity = '1';
                bloodTestsForm.style.visibility = 'visible';
                bloodTestsForm.style.position = 'relative';
                problemForm.style.opacity = '0';
                problemForm.style.visibility = 'hidden';
                problemForm.style.position = 'absolute';
                
                // Reset the blood tests form
                resetForm(bloodTestsForm);
                
                // Sync price selections from problem form to blood tests form
                syncPriceSelections(problemForm, bloodTestsForm);
              } else if (tabType === 'let-me-pick') {
                bloodTestsForm.style.opacity = '0';
                bloodTestsForm.style.visibility = 'hidden';
                bloodTestsForm.style.position = 'absolute';
                problemForm.style.opacity = '1';
                problemForm.style.visibility = 'visible';
                problemForm.style.position = 'relative';
                
                // Reset the problem form
                resetForm(problemForm);
                
                // Sync price selections from blood tests form to problem form
                syncPriceSelections(bloodTestsForm, problemForm);
                
                // Populate the method dropdown when Let me pick side becomes visible
                updateMethodDropdown();
              }
              
              // Update the count after switching tabs
              updateSearchButtonCountSimple('default');
            });
          });
        }
        
        // Function to reset form fields
        function resetForm(form) {
          // Reset all dropdowns to first option
          const dropdowns = form.querySelectorAll('select');
          dropdowns.forEach(dropdown => {
            if (dropdown.options.length > 0) {
              dropdown.selectedIndex = 0;
            }
          });
          
          // Reset all text inputs
          const inputs = form.querySelectorAll('input[type="text"]');
          inputs.forEach(input => {
            input.value = '';
          });
          
          // Clear any biomarker selections
          const biomarkerInputs = form.querySelectorAll('.biomarker-search-input, .biomarker-search-input-2');
          biomarkerInputs.forEach(input => {
            input.value = '';
            // Remove any data attributes
            input.removeAttribute('data-testosterone-only');
            input.removeAttribute('data-testosterone-full-hormone');
            input.removeAttribute('data-testosterone-full-hormone-only');
            input.removeAttribute('data-testosterone-full-hormone-general-health');
            input.removeAttribute('data-trt-monitoring');
          });
          
          // Clear any biomarker dropdowns
          const biomarkerDropdowns = form.querySelectorAll('.biomarker-dropdown');
          biomarkerDropdowns.forEach(dropdown => {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
          });
        }
        
        // Function to sync price selections between forms
        function syncPriceSelections(sourceForm, targetForm) {
          const sourceMinPrice = sourceForm.querySelector('.dropdown-select-1')?.value;
          const sourceMaxPrice = sourceForm.querySelector('.dropdown-select-2')?.value;
          
          const targetMinPrice = targetForm.querySelector('.dropdown-select-1');
          const targetMaxPrice = targetForm.querySelector('.dropdown-select-2');
          
          if (sourceMinPrice && targetMinPrice) {
            targetMinPrice.value = sourceMinPrice;
          }
          if (sourceMaxPrice && targetMaxPrice) {
            targetMaxPrice.value = sourceMaxPrice;
          }
        }
        
        function setupQuickSearchForm() {
      
          
          const searchButton = document.querySelector('.blood-tests-form .search-button');
          console.log('Blood tests search button found:', !!searchButton);
          console.log('Blood tests search button element:', searchButton);
          if (searchButton) {
            console.log('Adding click listener to blood tests search button');
            console.log('Button text content:', searchButton.textContent);
            console.log('Button HTML:', searchButton.outerHTML);
            searchButton.addEventListener('click', (e) => {
              console.log('=== BLOOD TESTS SEARCH BUTTON CLICKED ===');
              console.log('Event:', e);
              e.preventDefault();
              e.stopPropagation();
              console.log('About to call handleQuickSearch');
              handleQuickSearch();
              console.log('handleQuickSearch called');
            });
          } else {
            console.error('Blood tests search button not found!');
            console.log('Available .search-button elements:', document.querySelectorAll('.search-button'));
            console.log('Available .blood-tests-form elements:', document.querySelectorAll('.blood-tests-form'));
            console.log('All buttons in blood tests form:', document.querySelectorAll('.blood-tests-form button'));
          }
          
          // Setup problem form submission - REDONE for reliability
          console.log('🔍 Setting up problem search button...');
          
          // Function to setup the problem search button
          function setupProblemSearchButton() {
            const problemSearchButton = document.querySelector('.problem-form .search-button');
            console.log('🔍 Problem search button found:', !!problemSearchButton);
            
            if (problemSearchButton) {
              console.log('✅ Setting up click listener for problem search button');
              
              // Remove any existing listeners to avoid duplicates
              const newButton = problemSearchButton.cloneNode(true);
              problemSearchButton.parentNode.replaceChild(newButton, problemSearchButton);
              
              // Add the click listener
              newButton.addEventListener('click', function(e) {
                console.log('🎯 PROBLEM SEARCH BUTTON CLICKED!');
                e.preventDefault();
                e.stopPropagation();
                handleProblemSearch();
              });
              
              // Also add onclick as backup
              newButton.onclick = function(e) {
                console.log('🎯 PROBLEM SEARCH BUTTON CLICKED (onclick)!');
                e.preventDefault();
                e.stopPropagation();
                handleProblemSearch();
              };
              
              console.log('✅ Problem search button setup complete');
            } else {
              console.error('❌ Problem search button not found!');
              console.log('Available .search-button elements:', document.querySelectorAll('.search-button'));
              console.log('Available .problem-form elements:', document.querySelectorAll('.problem-form'));
            }
          }
          
          // Setup the button immediately
          setupProblemSearchButton();
          
          // Also try again after a short delay to ensure DOM is ready
          setTimeout(setupProblemSearchButton, 100);
          
          // Setup reset filters functionality for both sides
          const resetFiltersLinks = document.querySelectorAll('.reset-filters');
          resetFiltersLinks.forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              resetHomePageForm();
            });
          });
          
          // Setup advanced search functionality
          const advancedSearchLink = document.querySelector('#advanced-search-link');
          if (advancedSearchLink) {
            advancedSearchLink.addEventListener('click', (e) => {
              e.preventDefault();
              handleAdvancedSearch(e);
            });
          }
          
          // Setup testosterone options dropdown
          const testosteroneOptionsSelect = document.querySelector('.testosterone-options-select');
          if (testosteroneOptionsSelect) {
            testosteroneOptionsSelect.addEventListener('change', (e) => {
              const selectedValue = e.target.value;
              handleTestosteroneOptionChange(selectedValue);
            });
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
                if (secondBiomarkerSection) secondBiomarkerSection.style.display = 'block'; // Show second biomarker section
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
                if (secondBiomarkerSection) secondBiomarkerSection.style.display = 'block';
                
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
      
          // Get form values from the new form structure
          const minPrice = document.querySelector('.dropdown-select-1')?.value;
          const maxPrice = document.querySelector('.dropdown-select-2')?.value;
          const method = document.querySelector('.dropdown-select-4')?.value;
          const biomarker1 = document.querySelector('.biomarker-search-input')?.value;
          const biomarker2 = document.querySelector('.biomarker-search-input-2')?.value;
          
          console.log('Form values:', { minPrice, maxPrice, method, biomarker1, biomarker2 });
          console.log('Method dropdown selected option:', document.querySelector('.dropdown-select-4 option:checked')?.textContent);
          
          // Clear previous validation errors
          clearValidationErrors();
          
          // Build search parameters
          const searchParams = new URLSearchParams();
          
          // Add price filters
          if (minPrice && minPrice !== '') {
            searchParams.set('minPrice', minPrice);
          }
          if (maxPrice && maxPrice !== '') {
            searchParams.set('maxPrice', maxPrice);
          }
          
          // Add method filter
          if (method && method !== '') {
            searchParams.set('method', method);
          }
          
          // Check if this is a testosterone-only case
          const biomarkerInput = document.querySelector('.biomarker-search-input');
          const isTestosteroneOnly = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-only') === 'true';
          const isTestosteroneFullHormone = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone') === 'true';
          const isTestosteroneFullHormoneOnly = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone-only') === 'true';
          const isTestosteroneFullHormoneGeneralHealth = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone-general-health') === 'true';
          const isTRTMonitoring = biomarkerInput && biomarkerInput.getAttribute('data-trt-monitoring') === 'true';
          console.log('🔧 updateDynamicCount: isTestosteroneFullHormoneGeneralHealth =', isTestosteroneFullHormoneGeneralHealth);
          console.log('🔧 updateDynamicCount: isTRTMonitoring =', isTRTMonitoring);
          
          // Combine biomarkers if both are selected
          const biomarkers = [];
          if (biomarker1) biomarkers.push(biomarker1);
          if (biomarker2) biomarkers.push(biomarker2);
          
          if (isTestosteroneFullHormone) {
            // For testosterone full hormone profile, we need to pass the required biomarkers
            searchParams.set('biomarkers', 'Testosterone,Free testosterone,SHBG');
            searchParams.set('testosteroneFullHormone', 'true');
          } else if (isTestosteroneFullHormoneOnly) {
            // For male hormone check only, pass the required biomarkers and set the special parameter
            searchParams.set('biomarkers', 'Testosterone,Free testosterone,SHBG');
            searchParams.set('testosteroneFullHormoneOnly', 'true');
          } else if (isTestosteroneFullHormoneGeneralHealth) {
            // For testosterone full hormone profile + related general health tests, pass the biomarkers and set the special parameter
            searchParams.set('biomarkers', 'Testosterone,Free testosterone,SHBG');
            searchParams.set('testosteroneFullHormoneGeneralHealth', 'true');
          } else if (biomarkers.length > 0) {
            searchParams.set('biomarkers', biomarkers.join(','));
          }
          
          if (isTestosteroneOnly) {
            searchParams.set('testosteroneOnly', 'true');
          }
          
          if (isTRTMonitoring) {
            searchParams.set('trtMonitoring', 'true');
          }
          
          // Always navigate to the search results page
          const url = `#/search-results${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
          console.log('Navigating to:', url);
          window.location.hash = url;
        }
        
        function handleAdvancedSearch(event) {
          event.preventDefault();
      
          
          // Get form values from the new form structure
          const minPrice = document.querySelector('.dropdown-select-1')?.value;
          const maxPrice = document.querySelector('.dropdown-select-2')?.value;
          const method = document.querySelector('.dropdown-select-4')?.value;
          const biomarker1 = document.querySelector('.biomarker-search-input')?.value;
          const biomarker2 = document.querySelector('.biomarker-search-input-2')?.value;
          
          console.log('Form values:', { minPrice, maxPrice, method, biomarker1, biomarker2 });
          
          // Clear previous validation errors
          clearValidationErrors();
          
          // Build search parameters
          const searchParams = new URLSearchParams();
          
          // Add price filters
          if (minPrice && minPrice !== '') {
            searchParams.set('minPrice', minPrice);
          }
          if (maxPrice && maxPrice !== '') {
            searchParams.set('maxPrice', maxPrice);
          }
          
          // Add method filter
          if (method && method !== '') {
            searchParams.set('method', method);
          }
          
          // Check if this is a testosterone-only case
          const biomarkerInput = document.querySelector('.biomarker-search-input');
          const isTestosteroneOnly = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-only') === 'true';
          const isTestosteroneFullHormone = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone') === 'true';
          const isTestosteroneFullHormoneOnly = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone-only') === 'true';
          const isTestosteroneFullHormoneGeneralHealth = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone-general-health') === 'true';
          const isTRTMonitoring = biomarkerInput && biomarkerInput.getAttribute('data-trt-monitoring') === 'true';
          
          // Combine biomarkers if both are selected
          const biomarkers = [];
          if (biomarker1) biomarkers.push(biomarker1);
          if (biomarker2) biomarkers.push(biomarker2);
          
          if (isTestosteroneFullHormone) {
            // For testosterone full hormone profile, we need to pass the required biomarkers
            searchParams.set('biomarkers', 'Testosterone,Free testosterone,SHBG');
            searchParams.set('testosteroneFullHormone', 'true');
          } else if (isTestosteroneFullHormoneOnly) {
            // For male hormone check only, pass the required biomarkers and set the special parameter
            searchParams.set('biomarkers', 'Testosterone,Free testosterone,SHBG');
            searchParams.set('testosteroneFullHormoneOnly', 'true');
          } else if (isTestosteroneFullHormoneGeneralHealth) {
            // For testosterone full hormone profile + related general health tests, pass the biomarkers and set the special parameter
            searchParams.set('biomarkers', 'Testosterone,Free testosterone,SHBG');
            searchParams.set('testosteroneFullHormoneGeneralHealth', 'true');
          } else if (biomarkers.length > 0) {
            searchParams.set('biomarkers', biomarkers.join(','));
          }
          
          if (isTestosteroneOnly) {
            searchParams.set('testosteroneOnly', 'true');
          }
          
          if (isTRTMonitoring) {
            searchParams.set('trtMonitoring', 'true');
          }
          
          // Add parameter to indicate filter panel should be open
          searchParams.set('openFilters', 'true');
          
          // Navigate to the search results page with filters open
          const url = `#/search-results${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
          console.log('Navigating to search results with filters open:', url);
          window.location.hash = url;
        }
        
        async function handleTestosteroneOptionChange(selectedValue) {
          // Simple test to see if we can even execute basic JavaScript
          console.log('🚨🚨🚨 BASIC TEST - Function can execute JavaScript');
          
          // Test console object access
          try {
            console.log('🚨🚨🚨 BASIC TEST - Console object accessible');
          } catch (error) {
            console.error('🚨🚨🚨 ERROR accessing console object:', error);
            return;
          }
          
          // Test parameter access with error handling
          try {
            console.log('🚨🚨🚨 BASIC TEST - selectedValue parameter:', selectedValue);
            console.log('🚨🚨🚨 BASIC TEST - typeof selectedValue:', typeof selectedValue);
          } catch (error) {
            console.error('🚨🚨🚨 ERROR accessing selectedValue parameter:', error);
            console.error('🚨🚨🚨 Error stack:', error.stack);
            return;
          }
          
          try {
            console.log('TESTOSTERONE OPTION CHANGED TO:', selectedValue);
            console.log('🔧 handleTestosteroneOptionChange called with value:', selectedValue);
            console.log('🔧 Stack trace:', new Error().stack);
            console.log('🚨🚨🚨 Function entered successfully - about to check DOM elements');
          } catch (error) {
            console.error('🚨🚨🚨 Error in initial logging:', error);
            return;
          }
          
          // Check which side is currently active
          let bloodTestsForm, problemForm;
          try {
            console.log('🚨🚨🚨 About to query DOM elements...');
            bloodTestsForm = document.querySelector('.blood-tests-form');
            problemForm = document.querySelector('.problem-form');
            
            console.log('🚨🚨🚨 Form detection - bloodTestsForm:', bloodTestsForm);
            console.log('🚨🚨🚨 Form detection - problemForm:', problemForm);
            console.log('🚨🚨🚨 Form detection - bloodTestsForm style:', bloodTestsForm?.style?.opacity, bloodTestsForm?.style?.visibility);
            console.log('🚨🚨🚨 Form detection - problemForm style:', problemForm?.style?.opacity, problemForm?.style?.visibility);
          } catch (error) {
            console.error('🚨🚨🚨 Error querying DOM elements:', error);
            console.error('🚨🚨🚨 Error stack:', error.stack);
            return;
          }
          
          // Only proceed if we're on the "Help me choose" side
          if (bloodTestsForm.style.opacity === '0' || bloodTestsForm.style.visibility === 'hidden') {
            console.log('🔧 Testosterone options only work on "Help me choose" side, ignoring selection');
            console.log('🚨🚨🚨 EARLY RETURN - Form is hidden or has opacity 0');
            return;
          }
          
          console.log('🚨🚨🚨 Form check passed - proceeding with testosterone option change');
          
          // Clear the biomarker input
          const biomarkerInput = document.querySelector('.biomarker-search-input');
          console.log('🚨🚨🚨 Biomarker input search result:', biomarkerInput);
          console.log('🚨🚨🚨 All biomarker inputs on page:', document.querySelectorAll('.biomarker-search-input'));
          
          if (biomarkerInput) {
            biomarkerInput.value = '';
            console.log('🚨🚨🚨 Cleared biomarker input value');
          } else {
            console.log('🚨🚨🚨 WARNING: No biomarker input found!');
          }
          
          if (selectedValue === 'testosterone-only') {
            // Clear any existing data attributes first
            if (biomarkerInput) {
              biomarkerInput.removeAttribute('data-testosterone-only');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone-only');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone-general-health');
              biomarkerInput.removeAttribute('data-trt-monitoring');
            }
            
            // Set "Testosterone" as the biomarker and add a special tag
            if (biomarkerInput) {
              biomarkerInput.value = 'Testosterone';
            }
            
            // Add a special class or data attribute to indicate this is "testosterone only"
            biomarkerInput.setAttribute('data-testosterone-only', 'true');
            
            console.log('🚨🚨🚨 SET data-testosterone-only = true on biomarker input:', biomarkerInput);
            console.log('🚨🚨🚨 Biomarker input now has attributes:', biomarkerInput.getAttributeNames());
            
                        // Update the search count using the new simple function
            console.log('🚀 Calling new simple count update function');
            try {
              const result = await updateSearchButtonCountSimple('testosterone-only');
              console.log('🚀 Simple count update completed with result:', result);
            } catch (error) {
              console.error('🚀 Error in simple count update:', error);
            }
            
            console.log('🚨🚨🚨 AFTER updateDynamicCount - biomarker input value:', biomarkerInput?.value);
            console.log('🚨🚨🚨 AFTER updateDynamicCount - biomarker input attributes:', biomarkerInput?.getAttributeNames());
            console.log('🚨🚨🚨 AFTER updateDynamicCount - biomarker input data-testosterone-only:', biomarkerInput?.getAttribute('data-testosterone-only'));
            
            console.log('Set biomarker to "Testosterone" with testosterone-only filter');
          } else if (selectedValue === 'testosterone-full-hormone') {
            // Clear any existing data attributes first
            if (biomarkerInput) {
              biomarkerInput.removeAttribute('data-testosterone-only');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone-only');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone-general-health');
              biomarkerInput.removeAttribute('data-trt-monitoring');
            }
            
            // Don't set any biomarker value, just add the special attribute
            if (biomarkerInput) {
              biomarkerInput.value = '';
            }
            
            // Add a special class or data attribute to indicate this is "testosterone full hormone profile"
            biomarkerInput.setAttribute('data-testosterone-full-hormone', 'true');
            
            // Update the search count using the new simple function
            console.log('🚀 Calling new simple count update function for full-hormone');
            try {
              const result = await updateSearchButtonCountSimple('testosterone-full-hormone');
              console.log('🚀 Simple count update completed with result:', result);
            } catch (error) {
              console.error('🚀 Error in simple count update for full-hormone:', error);
            }
            
            console.log('🚨🚨🚨 AFTER updateDynamicCount - biomarker input value:', biomarkerInput?.value);
            console.log('🚨🚨🚨 AFTER updateDynamicCount - biomarker input attributes:', biomarkerInput?.getAttributeNames());
            console.log('🚨🚨🚨 AFTER updateDynamicCount - biomarker input data-testosterone-full-hormone:', biomarkerInput?.getAttribute('data-testosterone-full-hormone'));
            
            console.log('Set testosterone-full-hormone filter (no biomarker value)');
          } else if (selectedValue === 'testosterone-full-hormone-only') {
            // Set the 3 required biomarkers for male hormone check only
            if (biomarkerInput) {
              biomarkerInput.value = 'Testosterone, Free testosterone, SHBG';
            }
            
            // Add a special attribute to indicate this is "male hormone check only"
            biomarkerInput.setAttribute('data-testosterone-full-hormone-only', 'true');
            
            // Update the search count using the new simple function
            console.log('🚀 Calling new simple count update function for full-hormone-only');
            try {
              const result = await updateSearchButtonCountSimple('testosterone-full-hormone-only');
              console.log('🚀 Simple count update completed with result:', result);
            } catch (error) {
              console.error('🚀 Error in simple count update for full-hormone-only:', error);
            }
            
            console.log('Set male hormone check only filter with required biomarkers');
          } else if (selectedValue === 'testosterone-full-hormone-general-health') {
            // Don't set any biomarker value, just add the special attribute
            if (biomarkerInput) {
              biomarkerInput.value = '';
            }
            
            // Add a special class or data attribute to indicate this is "testosterone full hormone profile + related general health tests"
            biomarkerInput.setAttribute('data-testosterone-full-hormone-general-health', 'true');
            console.log('🔧 Set data-testosterone-full-hormone-general-health attribute to true');
            
            // Update the search count using the new simple function
            console.log('🚀 Calling new simple count update function for general-health');
            try {
              const result = await updateSearchButtonCountSimple('testosterone-full-hormone-general-health');
              console.log('🚀 Simple count update completed with result:', result);
            } catch (error) {
              console.error('🚀 Error in simple count update for general-health:', error);
            }
            
            console.log('Set testosterone-full-hormone-general-health filter (no biomarker value)');
            console.log('🔧 Calling updateDynamicCount for testosterone-full-hormone-general-health');
          } else if (selectedValue === 'trt-monitoring') {
            // Don't set any biomarker value, just add the special attribute
            if (biomarkerInput) {
              biomarkerInput.value = '';
            }
            
            // Add a special attribute to indicate this is "TRT monitoring"
            biomarkerInput.setAttribute('data-trt-monitoring', 'true');
            console.log('🔧 Set data-trt-monitoring attribute to true');
            
            // Update the search count using the new simple function
            console.log('🚀 Calling new simple count update function for TRT monitoring');
            try {
              const result = await updateSearchButtonCountSimple('trt-monitoring');
              console.log('🚀 Simple count update completed with result:', result);
            } catch (error) {
              console.error('🚀 Error in simple count update for TRT monitoring:', error);
            }
            
            console.log('Set TRT monitoring filter (no biomarker value)');
            console.log('🔧 Calling updateDynamicCount for TRT monitoring');
          } else {
            // Clear any special attributes
            if (biomarkerInput) {
              biomarkerInput.removeAttribute('data-testosterone-only');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone-only');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone-general-health');
              biomarkerInput.removeAttribute('data-trt-monitoring');
            }
            
            // Update the search count using the new simple function
            console.log('🚀 Calling new simple count update function for clear');
            try {
              const result = await updateSearchButtonCountSimple('default');
              console.log('🚀 Simple count update completed with result:', result);
            } catch (error) {
              console.error('🚀 Error in simple count update for clear:', error);
            }
          }
        }
        
        function handleProblemSearch() {
      
          const biomarker1 = document.querySelector('.problem-form .biomarker-search-input')?.value;
          const biomarker2 = document.querySelector('.problem-form .biomarker-search-input-2')?.value;
          const minPrice = document.querySelector('.problem-form .dropdown-select-1')?.value;
          const maxPrice = document.querySelector('.problem-form .dropdown-select-2')?.value;
          const method = document.querySelector('.problem-form .dropdown-select-4')?.value;
      
          console.log('Selected biomarker 1:', biomarker1);
          console.log('Selected biomarker 2:', biomarker2);
          console.log('Selected min price:', minPrice);
          console.log('Selected max price:', maxPrice);
          console.log('Selected method:', method);
          
          // Clear previous validation errors
          clearValidationErrors();
          
          // Validate required fields
          let hasErrors = false;
          
          // Check if at least one biomarker is selected
          if (!biomarker1 && !biomarker2) {
            showValidationError('.problem-form .biomarker-search-input', 'Please select at least one biomarker');
            hasErrors = true;
          }
          
          // If there are validation errors, don't proceed
          if (hasErrors) {
            return;
          }
          
          // Build search parameters for URL instead of localStorage
          const searchParams = new URLSearchParams();
          
          // Add biomarkers
          const biomarkers = [];
          if (biomarker1) biomarkers.push(biomarker1);
          if (biomarker2) biomarkers.push(biomarker2);
          if (biomarkers.length > 0) {
            searchParams.set('biomarkers', biomarkers.join(','));
          }
          
          // Add price filters
          if (minPrice && minPrice !== '') {
            searchParams.set('minPrice', minPrice);
          }
          if (maxPrice && maxPrice !== '') {
            searchParams.set('maxPrice', maxPrice);
          }
          
          // Add method filter
          if (method && method !== '') {
            searchParams.set('method', method);
          }
          
          console.log('🔍 Built search parameters:', searchParams.toString());
          
          // Navigate to the search results page with parameters
          const url = `#/search-results${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
          console.log('🔍 Navigating to:', url);
          window.location.hash = url;
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
          const elements = document.querySelectorAll('.product-category-select, .category-select, .biomarker-search-input');
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
    console.log('Loading problem list from database...');
    const { data, error } = await supabase
      .from('problem_list')
      .select('name')
      .order('name');
    
    console.log('Problem list query result:', { data, error });
    console.log('Data length:', data ? data.length : 'null');
    console.log('First few items:', data ? data.slice(0, 3) : 'null');
    
    if (error) {
      console.error('Error fetching problem list:', error);
      // Fallback to hardcoded list if database table doesn't exist
      console.log('Using fallback problem list');
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
          console.log('Added fallback problem option:', problem);
        });
      }
      return;
    }
    
    const symptomSelect = document.querySelector('.symptom-select');
    console.log('Found symptom select element:', symptomSelect);
    
    if (symptomSelect && data) {
      console.log('Populating dropdown with', data.length, 'problems');
      console.log('Problem data from database:', data);
      // Clear existing options and set proper placeholder
      symptomSelect.innerHTML = '<option value="">Choose an option</option>';
      
      // Add problems from database
      data.forEach(problem => {
        const option = document.createElement('option');
        option.value = problem.name;
        option.textContent = problem.name;
        symptomSelect.appendChild(option);
        console.log('Added problem option:', { value: problem.name, text: problem.name });
      });
      
      console.log('Final dropdown options:', Array.from(symptomSelect.options).map(opt => ({ value: opt.value, text: opt.textContent })));
    } else {
      console.log('No symptom select element found or no data returned');
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
          
          // Update the search count when biomarker is selected
          updateDynamicCount();
        }
        
        // Select second biomarker
        function selectSecondBiomarker(option) {
          const biomarkerInput2 = document.querySelector('.biomarker-search-input-2');
          const biomarkerDropdown2 = document.querySelector('.biomarker-dropdown-2');
          
          biomarkerInput2.value = option.dataset.value;
          biomarkerDropdown2.style.display = 'none';
          biomarkerInput2.focus();
          
          // Update the search count when biomarker is selected
          updateDynamicCount();
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

// Setup dynamic selection for option cards
function setupOptionCardSelection() {
  const optionCards = document.querySelectorAll('.option-card');
  let lastHoveredCard = optionCards[0]; // Start with the first card as default
  
  optionCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Remove selected class from all cards
      optionCards.forEach(c => c.classList.remove('selected'));
      // Add selected class to hovered card
      card.classList.add('selected');
      // Update the last hovered card
      lastHoveredCard = card;
    });
    
    card.addEventListener('mouseleave', () => {
      // Remove selected class from all cards
      optionCards.forEach(c => c.classList.remove('selected'));
      // Add selected class back to the last hovered card
      lastHoveredCard.classList.add('selected');
    });
  });
}

// Function to scroll to quick search and add animation
function scrollToQuickSearch() {
  const heroSideBox = document.querySelector('.hero-side-box');
  if (heroSideBox) {
    // Scroll to the quick search box
    heroSideBox.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
    
    // Add blue outline animation
    heroSideBox.style.transition = 'box-shadow 0.3s ease-in-out';
    heroSideBox.style.boxShadow = '0 0 0 3px #1E88E5, 0 4px 12px rgba(30, 136, 229, 0.3)';
    
    // Remove the animation after 2 seconds
    setTimeout(() => {
      heroSideBox.style.boxShadow = '';
    }, 2000);
  }
}

// Setup dynamic count updates based on form selections
function setupDynamicCountUpdate() {
  console.log('🔧 Setting up dynamic count updates');
  
  // Get form elements from both sides
  const minPriceSelects = document.querySelectorAll('.dropdown-select-1');
  const maxPriceSelects = document.querySelectorAll('.dropdown-select-2');
  const methodSelects = document.querySelectorAll('.dropdown-select-4');
  const biomarkerInputs1 = document.querySelectorAll('.biomarker-search-input');
  const biomarkerInputs2 = document.querySelectorAll('.biomarker-search-input-2');
  
  // Add event listeners to price dropdowns on both sides
  minPriceSelects.forEach(minPriceSelect => {
    if (minPriceSelect) {
      minPriceSelect.addEventListener('change', () => {
        console.log('🔧 Min price dropdown changed on side:', minPriceSelect.closest('.form-content')?.classList.contains('blood-tests-form') ? 'Help me choose' : 'Let me pick');
        updateDynamicCount();
        // Also update the other side's price dropdowns to stay in sync
        updatePriceDropdownsOnOtherSide(minPriceSelect);
      });
    }
  });
  
  maxPriceSelects.forEach(maxPriceSelect => {
    if (maxPriceSelect) {
      maxPriceSelect.addEventListener('change', () => {
        console.log('🔧 Max price dropdown changed on side:', maxPriceSelect.closest('.form-content')?.classList.contains('blood-tests-form') ? 'Help me choose' : 'Let me pick');
        updateDynamicCount();
        // Also update the other side's price dropdowns to stay in sync
        updatePriceDropdownsOnOtherSide(maxPriceSelect);
      });
    }
  });
  
  // Add event listener to method dropdowns on both sides
  methodSelects.forEach(methodSelect => {
    if (methodSelect) {
      methodSelect.addEventListener('change', async () => {
        console.log('🔧 Method dropdown changed to:', methodSelect.value, 'on side:', methodSelect.closest('.form-content')?.classList.contains('blood-tests-form') ? 'Help me choose' : 'Let me pick');
        await updateDynamicCount();
        await updateDropdownsBasedOnSelections();
      });
    }
  });
  
  // Add event listeners to biomarker inputs on both sides (debounced)
  biomarkerInputs1.forEach(biomarkerInput1 => {
    if (biomarkerInput1) {
      biomarkerInput1.addEventListener('input', debounce(() => {
        console.log('🔧 Biomarker input 1 changed on side:', biomarkerInput1.closest('.form-content')?.classList.contains('blood-tests-form') ? 'Help me choose' : 'Let me pick');
        updateDynamicCount();
      }, 500));
      
      // Also listen for when the input is cleared
      biomarkerInput1.addEventListener('change', () => {
        console.log('🔧 Biomarker input 1 value changed to:', biomarkerInput1.value, 'on side:', biomarkerInput1.closest('.form-content')?.classList.contains('blood-tests-form') ? 'Help me choose' : 'Let me pick');
        updateDynamicCount();
      });
    }
  });
  
  biomarkerInputs2.forEach(biomarkerInput2 => {
    if (biomarkerInput2) {
      biomarkerInput2.addEventListener('input', debounce(() => {
        console.log('🔧 Biomarker input 2 changed on side:', biomarkerInput2.closest('.form-content')?.classList.contains('blood-tests-form') ? 'Help me choose' : 'Let me pick');
        updateDynamicCount();
      }, 500));
      
      // Also listen for when the input is cleared
      biomarkerInput2.addEventListener('change', () => {
        console.log('🔧 Biomarker input 2 value changed to:', biomarkerInput2.value, 'on side:', biomarkerInput2.closest('.form-content')?.classList.contains('blood-tests-form') ? 'Help me Choose' : 'Let me pick');
        updateDynamicCount();
      });
    }
  });
}

// Function to update price dropdowns on the other side when one side changes
async function updatePriceDropdownsOnOtherSide(changedSelect) {
  const currentSide = changedSelect.closest('.form-content');
  const isBloodTestsForm = currentSide.classList.contains('blood-tests-form');
  
  // Get the other side's form
  const otherSide = isBloodTestsForm ? 
    document.querySelector('.problem-form') : 
    document.querySelector('.blood-tests-form');
  
  if (!otherSide) return;
  
  // Get the current price selections from the changed side
  const currentMinPrice = changedSelect.closest('.form-content').querySelector('.dropdown-select-1')?.value;
  const currentMaxPrice = changedSelect.closest('.form-content').querySelector('.dropdown-select-2')?.value;
  
  // Update the other side's price dropdowns to match
  const otherMinPriceSelect = otherSide.querySelector('.dropdown-select-1');
  const otherMaxPriceSelect = otherSide.querySelector('.dropdown-select-2');
  
  if (otherMinPriceSelect && currentMinPrice) {
    otherMinPriceSelect.value = currentMinPrice;
  }
  if (otherMaxPriceSelect && currentMaxPrice) {
    otherMaxPriceSelect.value = currentMaxPrice;
  }
}

// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Update the count based on current form selections
async function updateDynamicCount() {
  console.log('updateDynamicCount STARTED');
  console.log('updateDynamicCount called');
  console.log('🔧 Stack trace:', new Error().stack);
  // Get current form values from the currently visible side
  const visibleForm = document.querySelector('.form-content[style*="opacity: 1"], .form-content[style*="visibility: visible"]') || 
                     document.querySelector('.blood-tests-form'); // fallback to blood-tests-form
  
  if (!visibleForm) {
    console.log('🔧 No visible form found');
    return;
  }
  
  const minPrice = visibleForm.querySelector('.dropdown-select-1')?.value;
  const maxPrice = visibleForm.querySelector('.dropdown-select-2')?.value;
  const method = visibleForm.querySelector('.dropdown-select-4')?.value;
  const biomarker1 = visibleForm.querySelector('.biomarker-search-input')?.value;
  const biomarker2 = visibleForm.querySelector('.biomarker-search-input-2')?.value;
  
  console.log('🔧 Current form values from', visibleForm.classList.contains('blood-tests-form') ? 'Help me choose' : 'Let me pick', 'side:', { minPrice, maxPrice, method, biomarker1, biomarker2 });
  
  try {
    let testCount;
    
    // Check if this is the "let me pick" side (problem-form)
    if (visibleForm.classList.contains('problem-form')) {
      // Handle "let me pick" side logic
      const selectedBiomarkers = [];
      if (biomarker1 && biomarker1 !== '') {
        selectedBiomarkers.push(biomarker1);
      }
      if (biomarker2 && biomarker2 !== '') {
        selectedBiomarkers.push(biomarker2);
      }
      
      if (selectedBiomarkers.length > 0) {
        // Start with biomarker-specific count
        testCount = await getBiomarkerTestCount(selectedBiomarkers);
        console.log('After biomarker filter:', testCount);
        
        // Apply additional filters if selected
        if (method && method !== '') {
          // Get method-specific count for the selected biomarkers
          const methodTestIds = await getMethodTestIds(method);
          if (methodTestIds.length > 0) {
            // Filter the biomarker results by method
            const filteredCount = await getBiomarkerTestCount(selectedBiomarkers, methodTestIds);
            testCount = filteredCount;
            console.log('After method filter:', testCount);
          }
        }
        
        if (minPrice && minPrice !== '') {
          const minPriceValue = parseFloat(minPrice.replace('£', ''));
          // Get the current test IDs that match the biomarkers
          const currentTestIds = await getBiomarkerTestIds(selectedBiomarkers);
          if (currentTestIds.length > 0) {
            testCount = await getMinPriceTestCountForTests(minPriceValue, currentTestIds);
            console.log('After min price filter:', testCount);
          }
        }
        
        if (maxPrice && maxPrice !== '') {
          const maxPriceValue = parseFloat(maxPrice.replace('£', ''));
          // Get the current test IDs that match the biomarkers
          const currentTestIds = await getBiomarkerTestIds(selectedBiomarkers);
          if (currentTestIds.length > 0) {
            testCount = await getMaxPriceTestCountForTests(maxPriceValue, currentTestIds);
            console.log('After max price filter:', testCount);
          }
        }
      } else {
        // No biomarkers selected, start with all tests
        testCount = await getMensHealthTestCount();
        console.log('Initial test count (no biomarkers):', testCount);
        
        // Apply filters one by one
        if (minPrice && minPrice !== '') {
          const minPriceValue = parseFloat(minPrice.replace('£', ''));
          testCount = await getMinPriceTestCount(minPriceValue);
          console.log('After min price filter:', testCount);
        }
        
        if (maxPrice && maxPrice !== '') {
          const maxPriceValue = parseFloat(maxPrice.replace('£', ''));
          testCount = await getMaxPriceTestCount(maxPriceValue);
          console.log('After max price filter:', testCount);
        }
        
        if (method && method !== '') {
          testCount = await getMethodTestCount(method);
          console.log('After method filter:', testCount);
        }
      }
    } else {
      // Handle "help me choose" side logic (existing code)
      const biomarkerInput = visibleForm.querySelector('.biomarker-search-input');
      console.log('🚨🚨🚨 Found biomarker input:', biomarkerInput);
      console.log('🚨🚨🚨 Biomarker input value:', biomarkerInput?.value);
      console.log('🚨🚨🚨 Biomarker input attributes:', biomarkerInput?.getAttributeNames());
      
      const isTestosteroneOnly = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-only') === 'true';
      const isTestosteroneFullHormone = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone') === 'true';
      const isTestosteroneFullHormoneOnly = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone-only') === 'true';
      const isTestosteroneFullHormoneGeneralHealth = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone-general-health') === 'true';
      const isTRTMonitoring = biomarkerInput && biomarkerInput.getAttribute('data-trt-monitoring') === 'true';
      
      console.log('🚨🚨🚨 updateDynamicCount: biomarkerInput found:', !!biomarkerInput);
      console.log('🚨🚨🚨 updateDynamicCount: biomarkerInput element:', biomarkerInput);
      console.log('🚨🚨🚨 updateDynamicCount: isTestosteroneOnly =', isTestosteroneOnly);
      console.log('🚨🚨🚨 updateDynamicCount: isTestosteroneFullHormone =', isTestosteroneFullHormone);
      console.log('🚨🚨🚨 updateDynamicCount: isTestosteroneFullHormoneOnly =', isTestosteroneFullHormoneOnly);
      console.log('🚨🚨🚨 updateDynamicCount: isTestosteroneFullHormoneGeneralHealth =', isTestosteroneFullHormoneGeneralHealth);
      console.log('🚨🚨🚨 updateDynamicCount: isTRTMonitoring =', isTRTMonitoring);
      console.log('🚨🚨🚨 updateDynamicCount: isTestosteroneOnly =', isTestosteroneOnly);
      console.log('🚨🚨🚨 updateDynamicCount: isTestosteroneFullHormone =', isTestosteroneFullHormone);
      console.log('🚨🚨🚨 updateDynamicCount: isTestosteroneFullHormoneGeneralHealth =', isTestosteroneFullHormoneGeneralHealth);
      console.log('🚨🚨🚨 updateDynamicCount: isTRTMonitoring =', isTRTMonitoring);
      if (biomarkerInput) {
        console.log('🔧 updateDynamicCount: biomarkerInput data attributes:', {
          'data-testosterone-only': biomarkerInput.getAttribute('data-testosterone-only'),
          'data-testosterone-full-hormone': biomarkerInput.getAttribute('data-testosterone-full-hormone'),
          'data-testosterone-full-hormone-only': biomarkerInput.getAttribute('data-testosterone-full-hormone-only'),
          'data-testosterone-full-hormone-general-health': biomarkerInput.getAttribute('data-testosterone-full-hormone-general-health'),
          'data-trt-monitoring': biomarkerInput.getAttribute('data-trt-monitoring')
        });
      }
      
      if (isTestosteroneOnly) {
        console.log('🚨🚨🚨 updateDynamicCount: Processing testosterone-only option');
        testCount = await getTestosteroneOnlyTestCount();
        console.log('🚨🚨🚨 After testosterone-only filter:', testCount);
      } else if (isTestosteroneFullHormone) {
        testCount = await getTestosteroneFullHormoneTestCount();
        console.log('After testosterone-full-hormone filter:', testCount);
      } else if (isTestosteroneFullHormoneOnly) {
        testCount = await getMaleHormoneCheckOnlyCount();
        console.log('After male hormone check only filter:', testCount);
      } else if (isTestosteroneFullHormoneGeneralHealth) {
        console.log('🔧 updateDynamicCount: Processing testosterone-full-hormone-general-health option');
        testCount = await getBiomarkerTestCount(['Testosterone', 'Free testosterone', 'SHBG']);
        console.log('After testosterone-full-hormone-general-health filter:', testCount);
      } else if (isTRTMonitoring) {
        console.log('🔧 updateDynamicCount: Processing TRT monitoring option');
        testCount = await getTRTMonitoringTestCount();
        console.log('After TRT monitoring filter:', testCount);
      } else {
        testCount = await getMensHealthTestCount();
        console.log('Initial test count:', testCount);
        
        const selectedBiomarkers = [];
        if (biomarker1 && biomarker1 !== '') {
          selectedBiomarkers.push(biomarker1);
        }
        if (biomarker2 && biomarker2 !== '') {
          selectedBiomarkers.push(biomarker2);
        }
        
        if (selectedBiomarkers.length > 0) {
          testCount = await getBiomarkerTestCount(selectedBiomarkers);
          console.log('After biomarker filter:', testCount);
        }
      }
      
      // Apply price and method filters to ALL results (including testosterone options)
      if (minPrice && minPrice !== '') {
        const minPriceValue = parseFloat(minPrice.replace('£', ''));
        // For testosterone options, we need to filter the existing results, not start over
        if (isTestosteroneOnly || isTestosteroneFullHormone || isTestosteroneFullHormoneOnly || isTestosteroneFullHormoneGeneralHealth || isTRTMonitoring) {
          // Get the current test IDs and apply price filter to them
          let currentTestIds;
          if (isTestosteroneOnly) {
            currentTestIds = await getTestosteroneOnlyTestIds();
          } else if (isTestosteroneFullHormone) {
            currentTestIds = await getTestosteroneFullHormoneTestIds();
          } else if (isTestosteroneFullHormoneOnly) {
            currentTestIds = await getMaleHormoneCheckOnlyTestIds();
          } else if (isTestosteroneFullHormoneGeneralHealth) {
            currentTestIds = await getBiomarkerTestIds(['Testosterone', 'Free testosterone', 'SHBG']);
          } else if (isTRTMonitoring) {
            currentTestIds = await getTRTMonitoringTestIds();
          }
          if (currentTestIds && currentTestIds.length > 0) {
            testCount = await getMinPriceTestCountForTests(minPriceValue, currentTestIds);
          }
        } else {
          testCount = await getMinPriceTestCount(minPriceValue);
        }
        console.log('After min price filter:', testCount);
      }
      
      if (maxPrice && maxPrice !== '') {
        const maxPriceValue = parseFloat(maxPrice.replace('£', ''));
        // For testosterone options, we need to filter the existing results, not start over
        if (isTestosteroneOnly || isTestosteroneFullHormone || isTestosteroneFullHormoneOnly || isTestosteroneFullHormoneGeneralHealth || isTRTMonitoring) {
          // Get the current test IDs and apply price filter to them
          let currentTestIds;
          if (isTestosteroneOnly) {
            currentTestIds = await getTestosteroneOnlyTestIds();
          } else if (isTestosteroneFullHormone) {
            currentTestIds = await getTestosteroneFullHormoneTestIds();
          } else if (isTestosteroneFullHormoneOnly) {
            currentTestIds = await getMaleHormoneCheckOnlyTestIds();
          } else if (isTestosteroneFullHormoneGeneralHealth) {
            currentTestIds = await getBiomarkerTestIds(['Testosterone', 'Free testosterone', 'SHBG']);
          } else if (isTRTMonitoring) {
            currentTestIds = await getTRTMonitoringTestIds();
          }
          if (currentTestIds && currentTestIds.length > 0) {
            testCount = await getMaxPriceTestCountForTests(maxPriceValue, currentTestIds);
          }
        } else {
          testCount = await getMaxPriceTestCount(maxPriceValue);
        }
        console.log('After max price filter:', testCount);
      }
      
      if (method && method !== '') {
        // For testosterone options, we need to filter the existing results, not start over
        if (isTestosteroneOnly || isTestosteroneFullHormone || isTestosteroneFullHormoneOnly || isTestosteroneFullHormoneGeneralHealth || isTRTMonitoring) {
          // Get the current test IDs and apply method filter to them
          let currentTestIds;
          if (isTestosteroneOnly) {
            currentTestIds = await getTestosteroneOnlyTestIds();
          } else if (isTestosteroneFullHormone) {
            currentTestIds = await getTestosteroneFullHormoneTestIds();
          } else if (isTestosteroneFullHormoneOnly) {
            currentTestIds = await getMaleHormoneCheckOnlyTestIds();
          } else if (isTestosteroneFullHormoneGeneralHealth) {
            currentTestIds = await getBiomarkerTestIds(['Testosterone', 'Free testosterone', 'SHBG']);
          } else if (isTRTMonitoring) {
            currentTestIds = await getTRTMonitoringTestIds();
          }
          if (currentTestIds && currentTestIds.length > 0) {
            const methodTestIds = await getMethodTestIds(method);
            if (methodTestIds.length > 0) {
              // Find intersection: tests that have BOTH testosterone criteria AND method
              const intersectionTestIds = currentTestIds.filter(id => methodTestIds.includes(id));
              testCount = intersectionTestIds.length;
            }
          }
        } else {
          testCount = await getMethodTestCount(method);
        }
        console.log('After method filter:', testCount);
      }
    }
    
    // Update the search button count for the currently visible form
    const searchButton = visibleForm.querySelector('.search-button');
    if (searchButton) {
      const countSpan = searchButton.querySelector('.test-count');
      if (countSpan) {
        countSpan.textContent = testCount;
        console.log('Updated search button count to:', testCount);
      } else {
        console.log('No count span found in search button');
      }
    } else {
      console.log('No search button found in visible form');
    }
    
    console.log('updateDynamicCount COMPLETED successfully');
    console.log('Final test count:', testCount);
    
  } catch (error) {
    console.error('Error updating dynamic count:', error);
  }
}

// Get test IDs for specific biomarkers
async function getBiomarkerTestIds(biomarkerNames) {
  try {
    // Get biomarker IDs
    const { data: biomarkerData, error: biomarkerError } = await supabase
      .from('biomarkers')
      .select('id')
      .in('name', biomarkerNames);
    
    if (biomarkerError || !biomarkerData || biomarkerData.length === 0) {
      console.error('Error fetching biomarkers:', biomarkerError);
      return [];
    }
    
    const biomarkerIds = biomarkerData.map(b => b.id);
    
    // Get tests in men's health category
    const { data: linkData, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (linkError) {
      console.error('Error fetching category links:', linkError);
      return [];
    }
    
    const categoryTestIds = linkData.map(row => row.provider_blood_test_id);
    
    if (categoryTestIds.length === 0) return [];
    
    // Get tests that contain ALL the selected biomarkers
    const { data: biomarkerLinks, error: biomarkerLinkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id')
      .in('biomarker_id', biomarkerIds)
      .in('provider_blood_test_id', categoryTestIds);
    
    if (biomarkerLinkError) {
      console.error('Error fetching biomarker links:', biomarkerLinkError);
      return [];
    }
    
    // Group by test ID and count how many biomarkers each test has
    const testBiomarkerCounts = {};
    biomarkerLinks.forEach(link => {
      const testId = link.provider_blood_test_id;
      testBiomarkerCounts[testId] = (testBiomarkerCounts[testId] || 0) + 1;
    });
    
    // Return test IDs that have ALL the selected biomarkers
    const testsWithAllBiomarkers = Object.entries(testBiomarkerCounts)
      .filter(([testId, count]) => count === biomarkerNames.length)
      .map(([testId]) => testId);
    
    return testsWithAllBiomarkers;
    
  } catch (error) {
    console.error('Error getting biomarker test IDs:', error);
    return [];
  }
}

// Get test count for specific biomarkers
async function getBiomarkerTestCount(biomarkerNames, testIds = null) {
  try {
    console.log('🔍 HOMEPAGE: getBiomarkerTestCount called with biomarkers:', biomarkerNames);
    
    // Get the test IDs that match the biomarkers
    let matchingTestIds = await getBiomarkerTestIds(biomarkerNames);
    
    console.log('🔍 HOMEPAGE: Raw matching test IDs:', matchingTestIds);
    
    // If testIds are provided, filter the matching tests to only include those
    if (testIds && testIds.length > 0) {
      matchingTestIds = matchingTestIds.filter(id => testIds.includes(id));
      console.log('🔍 HOMEPAGE: After additional filtering:', matchingTestIds);
    }
    
    // Get the actual test details to see what we're counting
    if (matchingTestIds.length > 0) {
      const { data: testDetails, error: testError } = await supabase
        .from('provider_blood_tests')
        .select('id, name, provider:providers(name)')
        .in('id', matchingTestIds);
      
      if (!testError && testDetails) {
        console.log('🔍 HOMEPAGE: Tests being counted:', testDetails.map(t => ({
          id: t.id,
          name: t.name,
          provider: t.provider?.name
        })));
      }
    }
    
    console.log('🔍 HOMEPAGE: Final count:', matchingTestIds.length);
    return matchingTestIds.length;
    
  } catch (error) {
    console.error('Error getting biomarker test count:', error);
    return 0;
  }
}

// Get test count for testosterone-only tests (tests that contain ONLY testosterone)
async function getTestosteroneOnlyTestCount() {
  try {
    console.log('🔍 Getting testosterone-only test count...');
    console.log('🔍 Function called from:', new Error().stack);
    
    // Get tests in men's health category with enriched biomarker data
    const { data: tests, error } = await supabase
      .from('blood_test_category_link_table')
      .select(`
        provider_blood_test_id,
        provider_blood_tests!inner (
          id,
          name,
          biomarker_link_table (
            biomarkers (
              name
            )
          )
        )
      `)
      .eq('blood_test_category_id', 3);
    
    if (error) {
      console.error('Error fetching tests:', error);
      return 0;
    }
    
    console.log('🔍 Total tests in men\'s health category:', tests.length);
    
    // Count tests that have ONLY testosterone
    const testosteroneOnlyTests = tests.filter(test => {
      const biomarkerLinks = test.provider_blood_tests.biomarker_link_table || [];
      const biomarkerNames = biomarkerLinks
        .map(link => link.biomarkers?.name)
        .filter(Boolean);
      
      // Check if the test has exactly one biomarker and it's testosterone
      const hasOnlyOneBiomarker = biomarkerNames.length === 1;
      const hasOnlyTestosterone = biomarkerNames.some(name => 
        name && name.toLowerCase().includes('testosterone')
      );
      const isTestosteroneOnly = hasOnlyOneBiomarker && hasOnlyTestosterone;
      
      console.log(`🔍 Test ${test.provider_blood_test_id} (${test.provider_blood_tests.name}): biomarkers=${biomarkerNames.length}, biomarkers=${biomarkerNames}, hasOnlyTestosterone=${hasOnlyTestosterone}, isTestosteroneOnly=${isTestosteroneOnly}`);
      
      return isTestosteroneOnly;
    });
    
    console.log('🔍 Testosterone-only tests found:', testosteroneOnlyTests.length);
    console.log('🔍 Testosterone-only test names:', testosteroneOnlyTests.map(t => t.provider_blood_tests.name));
    return testosteroneOnlyTests.length;
    
  } catch (error) {
    console.error('Error getting testosterone-only test count:', error);
    return 0;
  }
}

// Get test count for testosterone full hormone profile tests
async function getTestosteroneFullHormoneTestCount() {
  try {
    console.log('🔍 Getting male hormone check test count...');
    

    
    // Get tests in men's health category (same approach as search results page)
    const { data: linkRows, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (linkError) {
      console.error('Error fetching link rows:', linkError);
      return 0;
    }
    
    const testIds = linkRows.map(row => row.provider_blood_test_id);
    console.log('🔍 Total test IDs in men\'s health category:', testIds.length);
    
    if (testIds.length === 0) return 0;
    
    // Fetch tests with provider info
    const { data: tests, error: testError } = await supabase
      .from('provider_blood_tests')
      .select('*, provider:providers(name)')
      .in('id', testIds);
    
    if (testError) {
      console.error('Error fetching tests:', testError);
      return 0;
    }
    
    console.log('🔍 Total tests fetched:', tests.length);
    
    // Fetch biomarker links for these tests (with chunking like search results page)
    let biomarkerLinks = [];
    const maxIdsPerQuery = 10; // Same limit as search results page
    
    if (testIds.length > maxIdsPerQuery) {
      // Split the query into chunks
      const chunks = [];
      for (let i = 0; i < testIds.length; i += maxIdsPerQuery) {
        chunks.push(testIds.slice(i, i + maxIdsPerQuery));
      }
      
      console.log(`🔍 Fetching biomarker links in ${chunks.length} chunks...`);
      
      for (let i = 0; i < chunks.length; i++) {
        const { data: chunkLinks, error: chunkError } = await supabase
          .from('biomarker_link_table')
          .select('provider_blood_test_id, biomarker_id')
          .in('provider_blood_test_id', chunks[i]);
        
        if (chunkError) {
          console.error(`Error in chunk ${i + 1}:`, chunkError);
        } else {
          biomarkerLinks = biomarkerLinks.concat(chunkLinks);
        }
      }
    } else {
      const { data: links, error: biomarkerLinkError } = await supabase
        .from('biomarker_link_table')
        .select('provider_blood_test_id, biomarker_id')
        .in('provider_blood_test_id', testIds);
      
      if (biomarkerLinkError) {
        console.error('Error fetching biomarker links:', biomarkerLinkError);
        return 0;
      }
      
      biomarkerLinks = links;
    }
    
    // Get unique biomarker IDs
    const biomarkerIds = [...new Set(biomarkerLinks.map(l => l.biomarker_id))];
    
    // Fetch biomarker names
    const { data: biomarkers, error: biomarkerError } = await supabase
      .from('biomarkers')
      .select('id, name')
      .in('id', biomarkerIds);
    
    if (biomarkerError) {
      console.error('Error fetching biomarkers:', biomarkerError);
      return 0;
    }
    
    // Enrich tests with biomarker names (same logic as search results page)
    console.log(`🔍 Enriching ${tests.length} tests with biomarker data...`);
    console.log(`🔍 Total biomarker links: ${biomarkerLinks.length}`);
    console.log(`🔍 Total biomarkers: ${biomarkers.length}`);
    
    tests.forEach(test => {
      const testId = parseInt(test.id);
      const links = biomarkerLinks.filter(link => {
        const linkTestId = parseInt(link.provider_blood_test_id);
        return linkTestId === testId;
      });
      
      console.log(`🔍 Test ${test.id} (${test.name}): found ${links.length} biomarker links`);
      
      const biomarkerNames = [];
      links.forEach(link => {
        const biomarker = biomarkers.find(b => parseInt(b.id) === parseInt(link.biomarker_id));
        if (biomarker) {
          let biomarkerName = biomarker.name;
          if (biomarkerName.includes('+')) {
            biomarkerName = biomarkerName.replace(/\+/g, ' ');
          }
          biomarkerNames.push(biomarkerName);
        } else {
          console.log(`🔍 WARNING: No biomarker found for ID ${link.biomarker_id} in test ${test.id}`);
        }
      });
      
      test.biomarker_names = biomarkerNames;
      console.log(`🔍 Test ${test.id} (${test.name}): enriched with ${biomarkerNames.length} biomarkers: ${biomarkerNames}`);
    });
    
    // Count tests that have the required biomarkers WITHOUT the ≤10 biomarker restriction
    // This is for "Male hormone check + general health check" - should show ALL tests with required biomarkers
    console.log('🔍 Filtering tests for required biomarkers (no biomarker count restrictions)');
    
    const maleHormoneCheckTests = tests.filter(test => {
      const testBiomarkerNames = test.biomarker_names || [];
      const requiredBiomarkers = ['Testosterone', 'Free testosterone', 'SHBG'];
      
      const hasAllRequiredBiomarkers = requiredBiomarkers.every(requiredBiomarker => {
        return testBiomarkerNames.some(testBiomarker => {
          if (!testBiomarker) return false;
          const normalizedTest = testBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
          const normalizedRequired = requiredBiomarker.toLowerCase().replace(/\+/g, ' ').trim();
          
          // More precise matching to avoid false positives (same logic as search results page)
          if (normalizedRequired === 'testosterone') {
            // For "Testosterone", require exact match or starts with "testosterone"
            return normalizedTest === 'testosterone' || normalizedTest.startsWith('testosterone');
          } else if (normalizedRequired === 'free testosterone') {
            // For "Free testosterone", require exact match or starts with "free testosterone"
            return normalizedTest === 'free testosterone' || normalizedTest.startsWith('free testosterone');
          } else if (normalizedRequired === 'shbg') {
            // For "SHBG", require exact match
            return normalizedTest === 'shbg';
          }
          return false;
        });
      });
      
      if (hasAllRequiredBiomarkers) {
        console.log(`✅ INCLUDED: Test "${test.name}" (ID: ${test.id}) - has required biomarkers (${testBiomarkerNames.length} total biomarkers)`);
      } else {
        console.log(`❌ EXCLUDED: Test "${test.name}" (ID: ${test.id}) - missing required biomarkers`);
      }
      
      return hasAllRequiredBiomarkers;
    });
    
    console.log('🔍 Male hormone check tests found:', maleHormoneCheckTests.length);
    console.log('🔍 Male hormone check test names:', maleHormoneCheckTests.map(t => t.name));
    return maleHormoneCheckTests.length;
    
  } catch (error) {
    console.error('Error getting male hormone check test count:', error);
    return 0;
  }
}

// Get test count for male hormone check only (tests with required biomarkers AND 10 or fewer total biomarkers)
async function getMaleHormoneCheckOnlyCount() {
  try {
    console.log('🔍 Getting male hormone check only test count...');
    
    // Get tests in men's health category
    const { data: linkRows, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (linkError) {
      console.error('Error fetching link rows:', linkError);
      return 0;
    }
    
    const testIds = linkRows.map(row => row.provider_blood_test_id);
    console.log('🔍 Total test IDs in men\'s health category:', testIds.length);
    
    if (testIds.length === 0) return 0;
    
    // Get biomarker IDs for the required biomarkers
    const { data: biomarkerData, error: biomarkerError } = await supabase
      .from('biomarkers')
      .select('id')
      .in('name', ['Testosterone', 'Free testosterone', 'SHBG']);
    
    if (biomarkerError || !biomarkerData || biomarkerData.length === 0) {
      console.error('Error fetching required biomarkers:', biomarkerError);
      return 0;
    }
    
    const requiredBiomarkerIds = biomarkerData.map(b => b.id);
    console.log('🔍 Required biomarker IDs:', requiredBiomarkerIds);
    
    // Get tests that contain ALL the required biomarkers
    const { data: biomarkerLinks, error: biomarkerLinkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id')
      .in('biomarker_id', requiredBiomarkerIds)
      .in('provider_blood_test_id', testIds);
    
    if (biomarkerLinkError) {
      console.error('Error fetching biomarker links:', biomarkerLinkError);
      return 0;
    }
    
    // Group by test ID and count how many required biomarkers each test has
    const testBiomarkerCounts = {};
    biomarkerLinks.forEach(link => {
      const testId = link.provider_blood_test_id;
      testBiomarkerCounts[testId] = (testBiomarkerCounts[testId] || 0) + 1;
    });
    
    // Get test IDs that have ALL the required biomarkers
    const testsWithAllRequiredBiomarkers = Object.entries(testBiomarkerCounts)
      .filter(([testId, count]) => count === requiredBiomarkerIds.length)
      .map(([testId]) => testId);
    
    console.log('🔍 Tests with all required biomarkers:', testsWithAllRequiredBiomarkers.length);
    
    if (testsWithAllRequiredBiomarkers.length === 0) return 0;
    
    // Now get the total biomarker count for each of these tests
    const { data: totalBiomarkerLinks, error: totalBiomarkerError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id')
      .in('provider_blood_test_id', testsWithAllRequiredBiomarkers);
    
    if (totalBiomarkerError) {
      console.error('Error fetching total biomarker links:', totalBiomarkerError);
      return 0;
    }
    
    // Count total biomarkers per test
    const testTotalBiomarkerCounts = {};
    totalBiomarkerLinks.forEach(link => {
      const testId = link.provider_blood_test_id;
      testTotalBiomarkerCounts[testId] = (testTotalBiomarkerCounts[testId] || 0) + 1;
    });
    
    // Filter tests to only include those with 10 or fewer total biomarkers
    const testsWithLimitedBiomarkers = Object.entries(testTotalBiomarkerCounts)
      .filter(([testId, count]) => count <= 10)
      .map(([testId]) => testId);
    
    console.log('🔍 Tests with 10 or fewer total biomarkers:', testsWithLimitedBiomarkers.length);
    console.log('🔍 Sample test total biomarker counts:', Object.entries(testTotalBiomarkerCounts).slice(0, 5));
    
    return testsWithLimitedBiomarkers.length;
    
  } catch (error) {
    console.error('Error getting male hormone check only test count:', error);
    return 0;
  }
}

// Get test count for TRT monitoring tests (specific hardcoded test IDs)
async function getTRTMonitoringTestCount() {
  try {
    console.log('🔍 Getting TRT monitoring test count...');
    
    // Hardcoded TRT monitoring test IDs as provided
    const trtMonitoringTestIds = [44, 52, 409, 20, 411, 405, 418, 413, 417, 407];
    console.log('🔍 TRT monitoring test IDs:', trtMonitoringTestIds);
    
    // Verify these tests exist and are in the men's health category
    const { data: tests, error } = await supabase
      .from('provider_blood_tests')
      .select(`
        id,
        name,
        price,
        blood_test_category_link_table!inner (
          blood_test_category_id
        )
      `)
      .in('id', trtMonitoringTestIds)
      .eq('blood_test_category_link_table.blood_test_category_id', 3);
    
    if (error) {
      console.error('Error fetching TRT monitoring tests:', error);
      return 0;
    }
    
    console.log('🔍 TRT monitoring tests found:', tests.length);
    console.log('🔍 TRT monitoring test names:', tests.map(t => t.name));
    
    return tests.length;
    
  } catch (error) {
    console.error('Error getting TRT monitoring test count:', error);
    return 0;
  }
}

// Get TRT monitoring test data for display purposes
async function getTRTMonitoringTests() {
  try {
    console.log('🔍 Getting TRT monitoring test data...');
    
    // Hardcoded TRT monitoring test IDs as provided
    const trtMonitoringTestIds = [44, 52, 409, 20, 411, 405, 418, 413, 417, 407];
    console.log('🔍 TRT monitoring test IDs:', trtMonitoringTestIds);
    
    // Fetch the complete test data including provider information
    const { data: tests, error } = await supabase
      .from('provider_blood_tests')
      .select(`
        id,
        name,
        price,
        description,
        provider_id,
        providers (
          name,
          logo_url
        ),
        biomarker_link_table (
          biomarkers (
            id,
            name,
            description
          )
        ),
        blood_taking_method_link_table (
          blood_taking_methods (
            id,
            name
          )
        )
      `)
      .in('id', trtMonitoringTestIds);
    
    if (error) {
      console.error('Error fetching TRT monitoring test data:', error);
      return [];
    }
    
    console.log('🔍 TRT monitoring tests data fetched:', tests.length);
    console.log('🔍 TRT monitoring test names:', tests.map(t => t.name));
    
    return tests;
    
  } catch (error) {
    console.error('Error getting TRT monitoring test data:', error);
    return [];
  }
}

// Get test count for a specific method
async function getMethodTestCount(methodName) {
  try {
    // Get method ID
    const { data: methodData, error: methodError } = await supabase
      .from('blood_taking_methods')
      .select('id')
      .eq('name', methodName)
      .single();
    
    if (methodError || !methodData) {
      console.error('Error fetching method:', methodError);
      return 0;
    }
    
    // Get tests in men's health category
    const { data: categoryLinks, error: categoryError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (categoryError) {
      console.error('Error fetching category links:', categoryError);
      return 0;
    }
    
    const categoryTestIds = categoryLinks.map(row => row.provider_blood_test_id);
    
    if (categoryTestIds.length === 0) return 0;
    
    // Get tests with this method
    const { data: methodLinks, error: methodLinkError } = await supabase
      .from('blood_taking_method_link_table')
      .select('provider_blood_test_id')
      .eq('blood_taking_method_id', methodData.id)
      .in('provider_blood_test_id', categoryTestIds);
    
    if (methodLinkError) {
      console.error('Error fetching method links:', methodLinkError);
      return 0;
    }
    
    return methodLinks.length;
  } catch (error) {
    console.error('Error in getMethodTestCount:', error);
    return 0;
  }
}

// Get test IDs for a specific provider in men's health category


// Get test IDs for a specific method in men's health category
async function getMethodTestIds(methodName) {
  try {
    // Get method ID
    const { data: methodData, error: methodError } = await supabase
      .from('blood_taking_methods')
      .select('id')
      .eq('name', methodName)
      .single();
    
    if (methodError || !methodData) {
      console.error('Error fetching method:', methodError);
      return [];
    }
    
    // Get tests in men's health category
    const { data: categoryLinks, error: categoryError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (categoryError) {
      console.error('Error fetching category links:', categoryError);
      return [];
    }
    
    const categoryTestIds = categoryLinks.map(row => row.provider_blood_test_id);
    
    if (categoryTestIds.length === 0) return [];
    
    // Get tests with this method
    const { data: methodLinks, error: methodLinkError } = await supabase
      .from('blood_taking_method_link_table')
      .select('provider_blood_test_id')
      .eq('blood_taking_method_id', methodData.id)
      .in('provider_blood_test_id', categoryTestIds);
    
    if (methodLinkError) {
      console.error('Error fetching method links:', methodLinkError);
      return [];
    }
    
    return methodLinks.map(link => link.provider_blood_test_id);
  } catch (error) {
    console.error('Error in getMethodTestIds:', error);
    return [];
  }
}

// Get all test IDs in men's health category
async function getAllTestIds() {
  try {
    const { data: categoryLinks, error: categoryError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (categoryError) {
      console.error('Error fetching category links:', categoryError);
      return [];
    }
    
    return categoryLinks.map(row => row.provider_blood_test_id);
  } catch (error) {
    console.error('Error in getAllTestIds:', error);
    return [];
  }
}

// Update dropdowns based on current selections
async function updateDropdownsBasedOnSelections() {
  console.log('🔧 updateDropdownsBasedOnSelections called');
  
  // Get current selections from the currently visible side
  const visibleForm = document.querySelector('.form-content[style*="opacity: 1"], .form-content[style*="visibility: visible"]') || 
                     document.querySelector('.blood-tests-form'); // fallback to blood-tests-form
  
  if (!visibleForm) {
    console.log('🔧 No visible form found for updating dropdowns');
    return;
  }
  
  const method = visibleForm.querySelector('.dropdown-select-4')?.value;
  const minPrice = visibleForm.querySelector('.dropdown-select-1')?.value;
  const maxPrice = visibleForm.querySelector('.dropdown-select-2')?.value;
  
  console.log('🔧 Current selections from', visibleForm.classList.contains('blood-tests-form') ? 'Help me choose' : 'Let me pick', 'side - Method:', method, 'MinPrice:', minPrice, 'MaxPrice:', maxPrice);
  
  try {
    // Update price dropdowns based on method selections (not price selections)
    if (method && method !== '') {
      console.log('🔧 Updating price dropdowns for method:', method);
      // Get test IDs for this method only
      const methodTestIds = await getMethodTestIds(method);
      if (methodTestIds.length > 0) {
        await updatePriceDropdownsForTests(methodTestIds);
      }
    } else {
      console.log('🔧 Updating price dropdowns for all tests');
      // No method selected, use all tests
      const allTestIds = await getAllTestIds();
      if (allTestIds.length > 0) {
        await updatePriceDropdownsForTests(allTestIds);
      }
    }
    
  } catch (error) {
    console.error('Error updating dropdowns:', error);
  }
}

// Get filtered test IDs based on current selections
async function getFilteredTestIds(method, minPrice, maxPrice) {
  try {
    // Start with all tests in men's health category
    const { data: categoryLinks, error: categoryError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (categoryError) {
      console.error('Error fetching category links:', categoryError);
      return [];
    }
    
    let testIds = categoryLinks.map(row => row.provider_blood_test_id);
    
    // Apply method filter
    if (method && method !== '') {
      const { data: methodData, error: methodError } = await supabase
        .from('blood_taking_methods')
        .select('id')
        .eq('name', method)
        .single();
      
      if (!methodError && methodData) {
        const { data: methodLinks, error: methodLinkError } = await supabase
          .from('blood_taking_method_link_table')
          .select('provider_blood_test_id')
          .eq('blood_taking_method_id', methodData.id)
          .in('provider_blood_test_id', testIds);
        
        if (!methodLinkError && methodLinks) {
          testIds = methodLinks.map(link => link.provider_blood_test_id);
        }
      }
    }
    
    // Apply price filters
    if (minPrice && minPrice !== '') {
      const minPriceValue = parseFloat(minPrice.replace('£', ''));
      const { data: minPriceTests, error: minPriceError } = await supabase
        .from('provider_blood_tests')
        .select('id')
        .gte('price', minPriceValue)
        .in('id', testIds);
      
      if (!minPriceError && minPriceTests) {
        testIds = minPriceTests.map(test => test.id);
      }
    }
    
    if (maxPrice && maxPrice !== '') {
      const maxPriceValue = parseFloat(maxPrice.replace('£', ''));
      const { data: maxPriceTests, error: maxPriceError } = await supabase
        .from('provider_blood_tests')
        .select('id')
        .lte('price', maxPriceValue)
        .in('id', testIds);
      
      if (!maxPriceError && maxPriceTests) {
        testIds = maxPriceTests.map(test => test.id);
      }
    }
    
    return testIds;
  } catch (error) {
    console.error('Error getting filtered test IDs:', error);
    return [];
  }
}

// Update price dropdowns for specific tests
async function updatePriceDropdownsForTests(testIds) {
  if (testIds.length === 0) return;
  
  try {
    // Get price range for these tests
    const { data: tests, error } = await supabase
      .from('provider_blood_tests')
      .select('price')
      .in('id', testIds);
    
    if (error) {
      console.error('Error fetching test prices:', error);
      return;
    }
    
    const prices = tests.map(test => test.price).filter(price => price > 0);
    if (prices.length === 0) return;
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    console.log('Price range for filtered tests:', minPrice, 'to', maxPrice);
    
    // Update min price dropdowns on both sides
    await updateMinPriceDropdown(minPrice, maxPrice, testIds);
    
    // Update max price dropdowns on both sides
    await updateMaxPriceDropdown(minPrice, maxPrice, testIds);
    
  } catch (error) {
    console.error('Error updating price dropdowns:', error);
  }
}

// Update min price dropdown
async function updateMinPriceDropdown(minPrice, maxPrice, testIds = null) {
  // Get min price selects from both sides
  const minPriceSelects = document.querySelectorAll('.dropdown-select-1');
  
  minPriceSelects.forEach(minPriceSelect => {
    if (!minPriceSelect) return;
    
    // Store current selection
    const currentSelection = minPriceSelect.value;
    
    // Clear existing options
    minPriceSelect.innerHTML = '<option value="">Min price</option>';
    
    // Generate price options from min to max in £50 increments
    for (let price = 0; price <= maxPrice; price += 50) {
      if (price >= minPrice) {
        const option = document.createElement('option');
        option.value = `£${price}`;
        option.textContent = `£${price}`;
        minPriceSelect.appendChild(option);
      }
    }
    
    // Restore selection if it's still valid
    if (currentSelection && currentSelection !== '') {
      const optionExists = Array.from(minPriceSelect.options).some(option => option.value === currentSelection);
      if (optionExists) {
        minPriceSelect.value = currentSelection;
      }
    }
  });
}

// Update max price dropdown
async function updateMaxPriceDropdown(minPrice, maxPrice, testIds = null) {
  // Get max price selects from both sides
  const maxPriceSelects = document.querySelectorAll('.dropdown-select-2');
  
  maxPriceSelects.forEach(maxPriceSelect => {
    if (!maxPriceSelect) return;
    
    // Store current selection
    const currentSelection = maxPriceSelect.value;
    
    // Clear existing options
    maxPriceSelect.innerHTML = '<option value="">Max price</option>';
    
    // Generate price options from min to max in £50 increments
    for (let price = minPrice; price <= maxPrice; price += 50) {
      const option = document.createElement('option');
      option.value = `£${price}`;
      option.textContent = `£${price}`;
      maxPriceSelect.appendChild(option);
    }
    
    // Restore selection if it's still valid
    if (currentSelection && currentSelection !== '') {
      const optionExists = Array.from(maxPriceSelect.options).some(option => option.value === currentSelection);
      if (optionExists) {
        maxPriceSelect.value = currentSelection;
      }
    }
  });
}

// Update method dropdown for specific provider
async function updateMethodDropdownForProvider(providerName) {
  console.log('🔧 updateMethodDropdownForProvider called with provider:', providerName);
  try {
    // Get provider ID
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('name', providerName)
      .single();
    
    if (providerError || !providerData) {
      console.error('Error fetching provider:', providerError);
      return;
    }
    
    // Get tests for this provider in men's health category
    const { data: linkData, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (linkError) {
      console.error('Error fetching category links:', linkError);
      return;
    }
    
    const testIds = linkData.map(row => row.provider_blood_test_id);
    
    if (testIds.length === 0) return;
    
    // Get tests for this provider
    const { data: providerTests, error: providerTestError } = await supabase
      .from('provider_blood_tests')
      .select('id')
      .eq('provider_id', providerData.id)
      .in('id', testIds);
    
    if (providerTestError || !providerTests) {
      console.error('Error fetching provider tests:', providerTestError);
      return;
    }
    
    const providerTestIds = providerTests.map(test => test.id);
    
    // Get methods for these tests
    const { data: methodLinks, error: methodLinkError } = await supabase
      .from('blood_taking_method_link_table')
      .select(`
        blood_taking_method_id,
        blood_taking_methods (
          name
        )
      `)
      .in('provider_blood_test_id', providerTestIds);
    
    if (methodLinkError) {
      console.error('Error fetching method links:', methodLinkError);
      return;
    }
    
    // Count methods
    const methodCounts = {};
    methodLinks.forEach(link => {
      const methodName = link.blood_taking_methods?.name;
      if (methodName) {
        methodCounts[methodName] = (methodCounts[methodName] || 0) + 1;
      }
    });
    
    // Update method dropdown
    const methodSelect = document.querySelector('.dropdown-select-4');
    if (methodSelect) {
      // Store current selection
      const currentSelection = methodSelect.value;
      console.log('🔧 Method dropdown current selection before update:', currentSelection);
      
      methodSelect.innerHTML = '<option value="">Method</option>';
      Object.entries(methodCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([methodName, count]) => {
          const option = document.createElement('option');
          option.value = methodName;
          option.textContent = `${methodName} (${count})`;
          methodSelect.appendChild(option);
        });
      
      // Restore selection if it's still valid
      if (currentSelection && methodCounts[currentSelection]) {
        methodSelect.value = currentSelection;
        console.log('🔧 Method dropdown selection restored to:', currentSelection);
      } else {
        console.log('🔧 Method dropdown selection not restored. Current:', currentSelection, 'Available:', Object.keys(methodCounts));
      }
    }
    
  } catch (error) {
    console.error('Error updating method dropdown for provider:', error);
  }
}

// Update provider dropdown for specific method
async function updateProviderDropdownForMethod(methodName) {
  console.log('🔧 updateProviderDropdownForMethod called with method:', methodName);
  try {
    // Get method ID
    const { data: methodData, error: methodError } = await supabase
      .from('blood_taking_methods')
      .select('id')
      .eq('name', methodName)
      .single();
    
    if (methodError || !methodData) {
      console.error('Error fetching method:', methodError);
      return;
    }
    
    // Get tests in men's health category with this method
    const { data: categoryLinks, error: categoryError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (categoryError) {
      console.error('Error fetching category links:', categoryError);
      return;
    }
    
    const categoryTestIds = categoryLinks.map(row => row.provider_blood_test_id);
    
    // Get tests with this method
    const { data: methodLinks, error: methodLinkError } = await supabase
      .from('blood_taking_method_link_table')
      .select('provider_blood_test_id')
      .eq('blood_taking_method_id', methodData.id)
      .in('provider_blood_test_id', categoryTestIds);
    
    if (methodLinkError) {
      console.error('Error fetching method links:', methodLinkError);
      return;
    }
    
    const methodTestIds = methodLinks.map(link => link.provider_blood_test_id);
    
    // Get providers for these tests
    const { data: providerTests, error: providerTestError } = await supabase
      .from('provider_blood_tests')
      .select(`
        provider_id,
        providers (
          name
        )
      `)
      .in('id', methodTestIds);
    
    if (providerTestError) {
      console.error('Error fetching provider tests:', providerTestError);
      return;
    }
    
    // Count providers
    const providerCounts = {};
    providerTests.forEach(test => {
      const providerName = test.providers?.name;
      if (providerName) {
        providerCounts[providerName] = (providerCounts[providerName] || 0) + 1;
      }
    });
    
    // Update provider dropdown
    const providerSelect = document.querySelector('.dropdown-select-3');
    if (providerSelect) {
      // Store current selection
      const currentSelection = providerSelect.value;
      console.log('🔧 Provider dropdown current selection before update:', currentSelection);
      
      providerSelect.innerHTML = '<option value="">Provider</option>';
      Object.entries(providerCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([providerName, count]) => {
          const option = document.createElement('option');
          option.value = providerName;
          option.textContent = `${providerName} (${count})`;
          providerSelect.appendChild(option);
        });
      
      // Restore selection if it's still valid
      if (currentSelection && providerCounts[currentSelection]) {
        providerSelect.value = currentSelection;
        console.log('🔧 Provider dropdown selection restored to:', currentSelection);
      } else {
        console.log('🔧 Provider dropdown selection not restored. Current:', currentSelection, 'Available:', Object.keys(providerCounts));
      }
    }
    
  } catch (error) {
    console.error('Error updating provider dropdown for method:', error);
  }
}

// Reset homepage form to default state
function resetHomePageForm() {
  console.log('🔄 Resetting homepage form...');
  
  // Reset all dropdown selects on both sides
  const allDropdownSelects = document.querySelectorAll('.blood-tests-form select, .problem-form select');
  allDropdownSelects.forEach(select => {
    select.value = '';
  });
  
  // Reset biomarker search inputs on both sides
  const biomarkerInputs = document.querySelectorAll('.biomarker-search-input, .biomarker-search-input-2');
  biomarkerInputs.forEach(input => {
    input.value = '';
    // Clear any data attributes
    input.removeAttribute('data-testosterone-only');
    input.removeAttribute('data-testosterone-full-hormone');
    input.removeAttribute('data-testosterone-full-hormone-only');
    input.removeAttribute('data-testosterone-full-hormone-general-health');
    input.removeAttribute('data-trt-monitoring');
  });
  
  // Hide biomarker dropdowns on both sides
  const biomarkerDropdowns = document.querySelectorAll('.biomarker-dropdown, .biomarker-dropdown-2');
  biomarkerDropdowns.forEach(dropdown => {
    dropdown.style.display = 'none';
  });
  
  // Clear any validation errors
  clearValidationErrors();
  
  // Reset test count on both sides
  const testCountElements = document.querySelectorAll('.test-count');
  testCountElements.forEach(element => {
    element.textContent = '0';
  });
  
  // Reset problem form if visible
  const problemForm = document.querySelector('.problem-form');
  if (problemForm) {
    const problemSelect = problemForm.querySelector('.symptom-select');
    if (problemSelect) {
      problemSelect.value = '';
    }
  }
  
  // Re-populate price dropdowns with default values
  updatePriceDropdowns().catch(console.error);
  
  // Update the dynamic count after reset
  updateDynamicCount();
  
  console.log('✅ Homepage form reset complete');
}

// Get test IDs for testosterone-only tests (tests that contain ONLY testosterone)
async function getTestosteroneOnlyTestIds() {
  try {
    console.log('🔍 Getting testosterone-only test IDs...');
    
    // Get tests in men's health category with enriched biomarker data
    const { data: tests, error } = await supabase
      .from('blood_test_category_link_table')
      .select(`
        provider_blood_test_id,
        provider_blood_tests!inner (
          id,
          name,
          biomarker_link_table (
            biomarkers (
              name
            )
          )
        )
      `)
      .eq('blood_test_category_id', 3);
    
    if (error) {
      console.error('Error fetching tests:', error);
      return [];
    }
    
    console.log('🔍 Total tests in men\'s health category:', tests.length);
    
    // Filter tests that have ONLY testosterone
    const testosteroneOnlyTests = tests.filter(test => {
      const biomarkerLinks = test.provider_blood_tests.biomarker_link_table || [];
      const biomarkerNames = biomarkerLinks
        .map(link => link.biomarkers?.name)
        .filter(Boolean);
      
      // Check if the test has exactly one biomarker and it's testosterone
      const hasOnlyOneBiomarker = biomarkerNames.length === 1;
      const hasOnlyTestosterone = biomarkerNames.some(name => 
        name && name.toLowerCase().includes('testosterone')
      );
      const isTestosteroneOnly = hasOnlyOneBiomarker && hasOnlyTestosterone;
      
      return isTestosteroneOnly;
    });
    
    const testIds = testosteroneOnlyTests.map(test => test.provider_blood_test_id);
    console.log('🔍 Testosterone-only test IDs found:', testIds.length);
    return testIds;
    
  } catch (error) {
    console.error('Error getting testosterone-only test IDs:', error);
    return [];
  }
}

// Get test IDs for testosterone full hormone profile tests
async function getTestosteroneFullHormoneTestIds() {
  try {
    console.log('🔍 Getting testosterone full hormone test IDs...');
    
    // Get tests in men's health category
    const { data: linkRows, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (linkError) {
      console.error('Error fetching link rows:', linkError);
      return [];
    }
    
    const testIds = linkRows.map(row => row.provider_blood_test_id);
    if (testIds.length === 0) return [];
    
    // Fetch tests with biomarker info
    const { data: tests, error: testError } = await supabase
      .from('provider_blood_tests')
      .select(`
        id,
        biomarker_link_table (
          biomarkers (
            name
          )
        )
      `)
      .in('id', testIds);
    
    if (testError) {
      console.error('Error fetching tests:', testError);
      return [];
    }
    
    // Filter tests that have testosterone AND other hormone-related biomarkers
    const hormoneTests = tests.filter(test => {
      const biomarkerLinks = test.biomarker_link_table || [];
      const biomarkerNames = biomarkerLinks
        .map(link => link.biomarkers?.name)
        .filter(Boolean);
      
      const hasTestosterone = biomarkerNames.some(name => 
        name && name.toLowerCase().includes('testosterone')
      );
      const hasOtherHormones = biomarkerNames.some(name => 
        name && (name.toLowerCase().includes('shbg') || 
                name.toLowerCase().includes('free testosterone') ||
                name.toLowerCase().includes('lh') ||
                name.toLowerCase().includes('fsh'))
      );
      
      return hasTestosterone && hasOtherHormones;
    });
    
    const hormoneTestIds = hormoneTests.map(test => test.id);
    console.log('🔍 Testosterone full hormone test IDs found:', hormoneTestIds.length);
    return hormoneTestIds;
    
  } catch (error) {
    console.error('Error getting testosterone full hormone test IDs:', error);
    return [];
  }
}

// Get test IDs for male hormone check only tests
async function getMaleHormoneCheckOnlyTestIds() {
  try {
    console.log('🔍 Getting male hormone check only test IDs...');
    
    // Get tests in men's health category
    const { data: linkRows, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (linkError) {
      console.error('Error fetching link rows:', linkError);
      return [];
    }
    
    const testIds = linkRows.map(row => row.provider_blood_test_id);
    if (testIds.length === 0) return [];
    
    // Fetch tests with biomarker info
    const { data: tests, error: testError } = await supabase
      .from('provider_blood_tests')
      .select(`
        id,
        biomarker_link_table (
          biomarkers (
            name
          )
        )
      `)
      .in('id', testIds);
    
    if (testError) {
      console.error('Error fetching tests:', testError);
      return [];
    }
    
    // Filter tests that have testosterone, free testosterone, and SHBG
    const hormoneCheckTests = tests.filter(test => {
      const biomarkerLinks = test.biomarker_link_table || [];
      const biomarkerNames = biomarkerLinks
        .map(link => link.biomarkers?.name)
        .filter(Boolean);
      
      const hasTestosterone = biomarkerNames.some(name => 
        name && name.toLowerCase().includes('testosterone')
      );
      const hasFreeTestosterone = biomarkerNames.some(name => 
        name && name.toLowerCase().includes('free testosterone')
      );
      const hasSHBG = biomarkerNames.some(name => 
        name && name.toLowerCase().includes('shbg')
      );
      
      return hasTestosterone && hasFreeTestosterone && hasSHBG;
    });
    
    const hormoneCheckTestIds = hormoneCheckTests.map(test => test.id);
    console.log('🔍 Male hormone check only test IDs found:', hormoneCheckTestIds.length);
    return hormoneCheckTestIds;
    
  } catch (error) {
    console.error('Error getting male hormone check only test IDs:', error);
    return [];
  }
}

// Get test IDs for TRT monitoring tests
async function getTRTMonitoringTestIds() {
  try {
    console.log('🔍 Getting TRT monitoring test IDs...');
    
    // Get tests in men's health category
    const { data: linkRows, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (linkError) {
      console.error('Error fetching link rows:', linkError);
      return [];
    }
    
    const testIds = linkRows.map(row => row.provider_blood_test_id);
    if (testIds.length === 0) return [];
    
    // Fetch tests with biomarker info
    const { data: tests, error: testError } = await supabase
      .from('provider_blood_tests')
      .select(`
        id,
        biomarker_link_table (
          biomarkers (
            name
          )
        )
      `)
      .in('id', testIds);
    
    if (testError) {
      console.error('Error fetching tests:', testError);
      return [];
    }
    
    // Filter tests that have testosterone and other TRT monitoring biomarkers
    const trtTests = tests.filter(test => {
      const biomarkerLinks = test.biomarker_link_table || [];
      const biomarkerNames = biomarkerLinks
        .map(link => link.biomarkers?.name)
        .filter(Boolean);
      
      const hasTestosterone = biomarkerNames.some(name => 
        name && name.toLowerCase().includes('testosterone')
      );
      const hasTRTMarkers = biomarkerNames.some(name => 
        name && (name.toLowerCase().includes('estradiol') || 
                name.toLowerCase().includes('psa') ||
                name.toLowerCase().includes('hemoglobin') ||
                name.toLowerCase().includes('hematocrit'))
      );
      
      return hasTestosterone && hasTRTMarkers;
    });
    
    const trtTestIds = trtTests.map(test => test.id);
    console.log('🔍 TRT monitoring test IDs found:', trtTestIds.length);
    return trtTestIds;
    
  } catch (error) {
    console.error('Error getting TRT monitoring test IDs:', error);
    return [];
  }
}

// BRAND NEW SIMPLE COUNT UPDATE FUNCTION
async function updateSearchButtonCountSimple(selectedValue) {
  console.log('🚀 NEW SIMPLE COUNT UPDATE - Starting with value:', selectedValue);
  
  try {
    let testCount = 0;
    
    // Get the count based on the selected testosterone option
    switch (selectedValue) {
      case 'testosterone-only':
        testCount = await getTestosteroneOnlyTestCount();
        break;
      case 'testosterone-full-hormone':
        testCount = await getTestosteroneFullHormoneTestCount();
        break;
      case 'testosterone-full-hormone-only':
        testCount = await getMaleHormoneCheckOnlyCount();
        break;
      case 'testosterone-full-hormone-general-health':
        testCount = await getBiomarkerTestCount(['Testosterone', 'Free testosterone', 'SHBG']);
        break;
      case 'trt-monitoring':
        testCount = await getTRTMonitoringTestCount();
        break;
      default:
        testCount = await getMensHealthTestCount();
        break;
    }
    
    console.log('🚀 NEW SIMPLE COUNT UPDATE - Calculated count:', testCount);
    
    // Update ALL search buttons on the page
    const allSearchButtons = document.querySelectorAll('.search-button');
    console.log('🚀 NEW SIMPLE COUNT UPDATE - Found search buttons:', allSearchButtons.length);
    
    allSearchButtons.forEach((button, index) => {
      const countSpan = button.querySelector('.test-count');
      if (countSpan) {
        countSpan.textContent = testCount;
        console.log(`🚀 NEW SIMPLE COUNT UPDATE - Updated button ${index + 1} to:`, testCount);
      } else {
        console.log(`🚀 NEW SIMPLE COUNT UPDATE - No count span found in button ${index + 1}`);
      }
    });
    
    console.log('🚀 NEW SIMPLE COUNT UPDATE - COMPLETED SUCCESSFULLY');
    return testCount;
    
  } catch (error) {
    console.error('🚀 NEW SIMPLE COUNT UPDATE - Error:', error);
    return 0;
  }
}

// ... existing code ...