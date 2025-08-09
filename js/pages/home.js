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
    const methodSelect = document.querySelector('.dropdown-select-4');
    
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
    
    // Update min price dropdown
    const minPriceSelect = document.querySelector('.dropdown-select-1');
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
    
    // Update max price dropdown
    const maxPriceSelect = document.querySelector('.dropdown-select-2');
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
    <section class="hero-section">
      <div class="hero-bg-color-banner"></div>
      <div class="hero-bg-banner"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span style="color: #1E88E5;">Health</span> comparison<br>made simple
        </h1>
        <p class="hero-subtitle">
          Compare <span style="color: #1E88E5;">testosterone</span> blood tests<br>and clinics
        </p>

        <div class="hero-cta">
          <p class="cta-note">Free comparison • No booking fees • Trusted providers</p>
        </div>
      </div>
      
      <div class="hero-side-box">
        <div class="side-box-content">
          <h3>Find your <span style="color: #1E88E5;">testosterone</span> solution</h3>
                      <div class="search-tabs">
              <div class="tab-toggle">
                <button class="tab-button active" data-tab="blood-tests">Help me choose</button>
                <button class="tab-button" data-tab="clinics">Let me pick</button>
              </div>
            </div>
          
          <!-- Testosterone options dropdown -->
          <div class="form-group" style="margin: 5px 0 20px 0;">
            <select class="testosterone-options-select" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
              <option value="">Choose your testosterone options</option>
              <option value="browse-all">All</option>
                            <option value="testosterone-only">Testosterone only</option>
              <option value="testosterone-full-hormone-only">Male hormone check only (includes testosterone)</option>
              <option value="testosterone-full-hormone">Male hormone check + general health check</option>
              <option value="trt-monitoring">TRT monitoring</option>
            </select>
          </div>
          
          <div class="search-form">
            <!-- Blood tests form -->
            <div class="form-content blood-tests-form">
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
              
              <!-- Biomarker search box -->
              <div class="form-group">
                <div class="biomarker-search-container">
                  <input type="text" class="biomarker-search-input" placeholder="Add a biomarker">
                  <div class="biomarker-dropdown" style="display: none;">
                    <!-- Results will be populated here -->
                  </div>
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
    </section>

    <!-- Video Section -->
    <section class="video-section">
      <div class="container">
        <div class="video-placeholder">
          <div class="video-container">
            <div class="video-placeholder-content">
              <div class="play-button">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Watch our introduction video</h3>
              <p>Learn how Testly can help you make informed health decisions</p>
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

    <!-- New Floating Section -->
    <section class="floating-section">
      <div class="container">
        <div class="floating-square">
          <div class="square-content">
            <h2>Talk to a doctor</h2>
            <p>Discuss your symptoms or health goals with one of our doctors and find a solution that works for you</p>
            <button class="waiting-list-btn">Join our waiting list</button>
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
            <p>Join thousands of people who are already making informed health decisions with Testly</p>
          </div>
          <div class="banner-actions">
            <button class="banner-cta-button">
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
            View all blood tests
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
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
  setupCTAButtons();
  setupSearchTabs();
  setupOptionCardSelection();
  updateSearchButtonCount(); // Update search button count
  updateMethodDropdown(); // Update method dropdown
  updatePriceDropdowns(); // Update price dropdowns
  setupDynamicCountUpdate(); // Setup dynamic count updates
  
  // Make scrollToQuickSearch function globally available
  window.scrollToQuickSearch = scrollToQuickSearch;
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

// Setup CTA button navigation
function setupCTAButtons() {
  const primaryCTAs = document.querySelectorAll('.primary-cta-button');
  const secondaryCTAs = document.querySelectorAll('.secondary-cta-button');
  
  primaryCTAs.forEach(primaryCTA => {
    primaryCTA.addEventListener('click', () => {
      window.location.hash = '#/compare';
    });
  });
  
  secondaryCTAs.forEach((secondaryCTA, index) => {
    secondaryCTA.addEventListener('click', () => {
      // First button (View all blood tests) goes to General Health
      if (index === 0) {
        window.location.hash = '#/category/General%20health?filter=General%20health';
      }
      // Second button (Graph my results) goes to graph page
      else if (index === 1) {
        window.location.hash = '#/graph';
      }
    });
  });
}

// Setup navigation handlers
function setupNavigationHandlers() {
  // Add any additional navigation setup here
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
              } else if (tabType === 'clinics') {
                bloodTestsForm.style.opacity = '0';
                bloodTestsForm.style.visibility = 'hidden';
                bloodTestsForm.style.position = 'absolute';
                problemForm.style.opacity = '1';
                problemForm.style.visibility = 'visible';
                problemForm.style.position = 'relative';
              }
            });
          });
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
          
          // Setup problem form submission
          const problemSearchButton = document.querySelector('.problem-form .search-button');
          console.log('Problem search button found:', !!problemSearchButton);
          console.log('Problem search button element:', problemSearchButton);
          if (problemSearchButton) {
            console.log('Adding click listener to problem search button');
            console.log('Button text content:', problemSearchButton.textContent);
            console.log('Button HTML:', problemSearchButton.outerHTML);
            console.log('Button onclick attribute:', problemSearchButton.onclick);
            console.log('Button event listeners:', problemSearchButton.onclick);
            
            // Add multiple event listeners to catch any issues
            problemSearchButton.addEventListener('click', (e) => {
              console.log('=== PROBLEM SEARCH BUTTON CLICKED ===');
              console.log('Event:', e);
              e.preventDefault();
              e.stopPropagation();
              console.log('About to call handleProblemSearch');
              handleProblemSearch();
              console.log('handleProblemSearch called');
            });
            
            problemSearchButton.addEventListener('mousedown', (e) => {
              console.log('=== PROBLEM SEARCH BUTTON MOUSEDOWN ===');
            });
            
            // Also try adding to the parent form
            const problemForm = document.querySelector('.problem-form');
            if (problemForm) {
              problemForm.addEventListener('submit', (e) => {
                console.log('=== PROBLEM FORM SUBMIT ===');
                e.preventDefault();
                handleProblemSearch();
              });
            }
          } else {
            console.error('Problem search button not found!');
            console.log('Available .search-button elements:', document.querySelectorAll('.search-button'));
            console.log('Available .problem-form elements:', document.querySelectorAll('.problem-form'));
            console.log('All buttons in problem form:', document.querySelectorAll('.problem-form button'));
            console.log('All buttons with text "Find Solutions":', Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.includes('Find Solutions')));
          }
          
          // Setup reset filters functionality
          const resetFiltersLink = document.querySelector('.reset-filters');
          if (resetFiltersLink) {
            resetFiltersLink.addEventListener('click', (e) => {
              e.preventDefault();
              resetHomePageForm();
            });
          }
          
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
          
          // Add parameter to indicate filter panel should be open
          searchParams.set('openFilters', 'true');
          
          // Navigate to the search results page with filters open
          const url = `#/search-results${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
          console.log('Navigating to search results with filters open:', url);
          window.location.hash = url;
        }
        
        function handleTestosteroneOptionChange(selectedValue) {
          console.log('Testosterone option changed to:', selectedValue);
          console.log('🔧 handleTestosteroneOptionChange called with value:', selectedValue);
          
          // Clear the biomarker input
          const biomarkerInput = document.querySelector('.biomarker-search-input');
          if (biomarkerInput) {
            biomarkerInput.value = '';
          }
          
          if (selectedValue === 'testosterone-only') {
            // Set "Testosterone" as the biomarker and add a special tag
            if (biomarkerInput) {
              biomarkerInput.value = 'Testosterone';
            }
            
            // Add a special class or data attribute to indicate this is "testosterone only"
            biomarkerInput.setAttribute('data-testosterone-only', 'true');
            
            // Update the search count
            updateDynamicCount();
            
            console.log('Set biomarker to "Testosterone" with testosterone-only filter');
          } else if (selectedValue === 'testosterone-full-hormone') {
            // Don't set any biomarker value, just add the special attribute
            if (biomarkerInput) {
              biomarkerInput.value = '';
            }
            
            // Add a special class or data attribute to indicate this is "testosterone full hormone profile"
            biomarkerInput.setAttribute('data-testosterone-full-hormone', 'true');
            
            // Update the search count
            updateDynamicCount();
            
            console.log('Set testosterone-full-hormone filter (no biomarker value)');

          } else if (selectedValue === 'testosterone-full-hormone-only') {
            // Set the 3 required biomarkers for male hormone check only
            if (biomarkerInput) {
              biomarkerInput.value = 'Testosterone, Free testosterone, SHBG';
            }
            
            // Add a special attribute to indicate this is "male hormone check only"
            biomarkerInput.setAttribute('data-testosterone-full-hormone-only', 'true');
            
            // Update the search count
            updateDynamicCount();
            
            console.log('Set male hormone check only filter with required biomarkers');

          } else if (selectedValue === 'testosterone-full-hormone-general-health') {
            // Don't set any biomarker value, just add the special attribute
            if (biomarkerInput) {
              biomarkerInput.value = '';
            }
            
            // Add a special class or data attribute to indicate this is "testosterone full hormone profile + related general health tests"
            biomarkerInput.setAttribute('data-testosterone-full-hormone-general-health', 'true');
            console.log('🔧 Set data-testosterone-full-hormone-general-health attribute to true');
            
            // Update the search count
            updateDynamicCount();
            
            console.log('Set testosterone-full-hormone-general-health filter (no biomarker value)');
            console.log('🔧 Calling updateDynamicCount for testosterone-full-hormone-general-health');
          } else {
            // Clear any special attributes
            if (biomarkerInput) {
              biomarkerInput.removeAttribute('data-testosterone-only');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone');
              biomarkerInput.removeAttribute('data-testosterone-full-hormone-only');
            }
            
            // Update the search count
            updateDynamicCount();
          }
        }
        
        function handleProblemSearch() {
      
          const selectedProblem = document.querySelector('.symptom-select')?.value;
          
      
          console.log('Selected problem value:', selectedProblem);
          console.log('Selected problem text:', document.querySelector('.symptom-select option:checked')?.textContent);
          
          // Clear previous validation errors
          clearValidationErrors();
          
          // Validate required fields
          let hasErrors = false;
          
          // Check if a problem is selected
          if (!selectedProblem) {
            showValidationError('.symptom-select', 'Please select a symptom or health aim');
            hasErrors = true;
          }
          
          // If there are validation errors, don't proceed
          if (hasErrors) {
            return;
          }
          
          // Store the selected problem in localStorage for the general health page to pick up
          localStorage.setItem('selectedProblem', selectedProblem);
          console.log('Stored selected problem in localStorage:', selectedProblem);
          
          // Navigate to the general health page
          console.log('Navigating to general health page');
          window.location.hash = '#/search-results';
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
  
  // Get form elements
  const minPriceSelect = document.querySelector('.dropdown-select-1');
  const maxPriceSelect = document.querySelector('.dropdown-select-2');
  const methodSelect = document.querySelector('.dropdown-select-4');
  const biomarkerInput1 = document.querySelector('.biomarker-search-input');
  const biomarkerInput2 = document.querySelector('.biomarker-search-input-2');
  
  // Add event listeners to price dropdowns (only update count, not other dropdowns)
  if (minPriceSelect) {
    minPriceSelect.addEventListener('change', () => {
      console.log('🔧 Min price dropdown changed');
      updateDynamicCount();
    });
  }
  if (maxPriceSelect) {
    maxPriceSelect.addEventListener('change', () => {
      console.log('🔧 Max price dropdown changed');
      updateDynamicCount();
    });
  }
  
  // Add event listener to method dropdown (update count AND other dropdowns)
  if (methodSelect) {
    methodSelect.addEventListener('change', async () => {
      console.log('🔧 Method dropdown changed to:', methodSelect.value);
      await updateDynamicCount();
      await updateDropdownsBasedOnSelections();
    });
  }
  
  // Add event listeners to biomarker inputs (debounced)
  if (biomarkerInput1) {
    biomarkerInput1.addEventListener('input', debounce(() => {
      console.log('🔧 Biomarker input 1 changed');
      updateDynamicCount();
    }, 500));
    
    // Also listen for when the input is cleared
    biomarkerInput1.addEventListener('change', () => {
      console.log('🔧 Biomarker input 1 value changed to:', biomarkerInput1.value);
      updateDynamicCount();
    });
  }
  if (biomarkerInput2) {
    biomarkerInput2.addEventListener('input', debounce(() => {
      console.log('🔧 Biomarker input 2 changed');
      updateDynamicCount();
    }, 500));
    
    // Also listen for when the input is cleared
    biomarkerInput2.addEventListener('change', () => {
      console.log('🔧 Biomarker input 2 value changed to:', biomarkerInput2.value);
      updateDynamicCount();
    });
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
  console.log('🔧 updateDynamicCount called');
  console.log('🔧 Stack trace:', new Error().stack);
  
  // Get current form values
  const minPrice = document.querySelector('.dropdown-select-1')?.value;
  const maxPrice = document.querySelector('.dropdown-select-2')?.value;
  const method = document.querySelector('.dropdown-select-4')?.value;
  const biomarker1 = document.querySelector('.biomarker-search-input')?.value;
  const biomarker2 = document.querySelector('.biomarker-search-input-2')?.value;
  
  console.log('🔧 Current form values:', { minPrice, maxPrice, method, biomarker1, biomarker2 });
  
  try {
    // Check for special testosterone options first - these should override the initial count
    const biomarkerInput = document.querySelector('.biomarker-search-input');
    const isTestosteroneOnly = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-only') === 'true';
    const isTestosteroneFullHormone = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone') === 'true';
    const isTestosteroneFullHormoneOnly = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone-only') === 'true';
    const isTestosteroneFullHormoneGeneralHealth = biomarkerInput && biomarkerInput.getAttribute('data-testosterone-full-hormone-general-health') === 'true';
    console.log('🔧 updateDynamicCount: isTestosteroneFullHormoneGeneralHealth =', isTestosteroneFullHormoneGeneralHealth);
    
    let testCount;
    
    if (isTestosteroneOnly && biomarker1 === 'Testosterone') {
      // Get testosterone-only count (tests that contain ONLY testosterone)
      testCount = await getTestosteroneOnlyTestCount();
      console.log('After testosterone-only filter:', testCount);
    } else if (isTestosteroneFullHormone) {
      // Get testosterone full hormone profile count
      testCount = await getTestosteroneFullHormoneTestCount();
      console.log('After testosterone-full-hormone filter:', testCount);
    } else if (isTestosteroneFullHormoneOnly) {
      // Get male hormone check only count (tests with required biomarkers AND 10 or fewer total biomarkers)
      testCount = await getMaleHormoneCheckOnlyCount();
      console.log('After male hormone check only filter:', testCount);
    } else if (isTestosteroneFullHormoneGeneralHealth) {
      console.log('🔧 updateDynamicCount: Processing testosterone-full-hormone-general-health option');
      // Get testosterone full hormone profile + related general health tests count (same as regular biomarker search)
      testCount = await getBiomarkerTestCount(['Testosterone', 'Free testosterone', 'SHBG']);
      console.log('After testosterone-full-hormone-general-health filter:', testCount);
    } else {
      // Start with all tests in the men's health category for regular filtering
      testCount = await getMensHealthTestCount();
      console.log('Initial test count:', testCount);
      
      // Apply filters one by one and get updated counts
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
        // Get method-specific count
        testCount = await getMethodTestCount(method);
        console.log('After method filter:', testCount);
      }
      
      // Apply regular biomarker filtering
      const selectedBiomarkers = [];
      if (biomarker1 && biomarker1 !== '') {
        selectedBiomarkers.push(biomarker1);
      }
      if (biomarker2 && biomarker2 !== '') {
        selectedBiomarkers.push(biomarker2);
      }
      
      if (selectedBiomarkers.length > 0) {
        // Get biomarker-specific count
        testCount = await getBiomarkerTestCount(selectedBiomarkers);
        console.log('After biomarker filter:', testCount);
      }
    }
    
    // Update the search button count
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
      const countSpan = searchButton.querySelector('.test-count');
      if (countSpan) {
        countSpan.textContent = testCount;
      }
    }
    
    console.log('Final test count:', testCount);
    
  } catch (error) {
    console.error('Error updating dynamic count:', error);
  }
}

// Get test count for specific biomarkers
async function getBiomarkerTestCount(biomarkerNames) {
  try {
    // Get biomarker IDs
    const { data: biomarkerData, error: biomarkerError } = await supabase
      .from('biomarkers')
      .select('id')
      .in('name', biomarkerNames);
    
    if (biomarkerError || !biomarkerData || biomarkerData.length === 0) {
      console.error('Error fetching biomarkers:', biomarkerError);
      return 0;
    }
    
    const biomarkerIds = biomarkerData.map(b => b.id);
    
    // Get tests in men's health category
    const { data: linkData, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3);
    
    if (linkError) {
      console.error('Error fetching category links:', linkError);
      return 0;
    }
    
    const categoryTestIds = linkData.map(row => row.provider_blood_test_id);
    
    if (categoryTestIds.length === 0) return 0;
    
    // Get tests that contain ALL the selected biomarkers
    const { data: biomarkerLinks, error: biomarkerLinkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id')
      .in('biomarker_id', biomarkerIds)
      .in('provider_blood_test_id', categoryTestIds);
    
    if (biomarkerLinkError) {
      console.error('Error fetching biomarker links:', biomarkerLinkError);
      return 0;
    }
    
    // Group by test ID and count how many biomarkers each test has
    const testBiomarkerCounts = {};
    biomarkerLinks.forEach(link => {
      const testId = link.provider_blood_test_id;
      testBiomarkerCounts[testId] = (testBiomarkerCounts[testId] || 0) + 1;
    });
    
    // Count tests that have ALL the selected biomarkers
    const testsWithAllBiomarkers = Object.entries(testBiomarkerCounts)
      .filter(([testId, count]) => count === biomarkerNames.length)
      .map(([testId]) => testId);
    
    return testsWithAllBiomarkers.length;
    
  } catch (error) {
    console.error('Error getting biomarker test count:', error);
    return 0;
  }
}

// Get test count for testosterone-only tests (tests that contain ONLY testosterone)
async function getTestosteroneOnlyTestCount() {
  try {
    console.log('🔍 Getting testosterone-only test count...');
    
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
  
  // Get current selections
  const method = document.querySelector('.dropdown-select-4')?.value;
  const minPrice = document.querySelector('.dropdown-select-1')?.value;
  const maxPrice = document.querySelector('.dropdown-select-2')?.value;
  
  console.log('🔧 Current selections - Method:', method, 'MinPrice:', minPrice, 'MaxPrice:', maxPrice);
  
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
    
    // Update min price dropdown
    await updateMinPriceDropdown(minPrice, maxPrice, testIds);
    
    // Update max price dropdown
    await updateMaxPriceDropdown(minPrice, maxPrice, testIds);
    
  } catch (error) {
    console.error('Error updating price dropdowns:', error);
  }
}

// Update min price dropdown
async function updateMinPriceDropdown(minPrice, maxPrice, testIds = null) {
  const minPriceSelect = document.querySelector('.dropdown-select-1');
  if (!minPriceSelect) return;
  
  // Store current selection
  const currentSelection = minPriceSelect.value;
  
  // Clear existing options
  minPriceSelect.innerHTML = '<option value="">Min price</option>';
  
  // Generate price options from min to max in £50 increments
  for (let price = 0; price <= maxPrice; price += 50) {
    if (price >= minPrice) {
      const count = testIds ? await getMinPriceTestCountForTests(price, testIds) : await getMinPriceTestCount(price);
      const option = document.createElement('option');
      option.value = `£${price}`;
      option.textContent = `£${price} (${count})`;
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
}

// Update max price dropdown
async function updateMaxPriceDropdown(minPrice, maxPrice, testIds = null) {
  const maxPriceSelect = document.querySelector('.dropdown-select-2');
  if (!maxPriceSelect) return;
  
  // Store current selection
  const currentSelection = maxPriceSelect.value;
  
  // Clear existing options
  maxPriceSelect.innerHTML = '<option value="">Max price</option>';
  
  // Generate price options from min to max in £50 increments
  for (let price = minPrice; price <= maxPrice; price += 50) {
    const count = testIds ? await getMaxPriceTestCountForTests(price, testIds) : await getMaxPriceTestCount(price);
    const option = document.createElement('option');
    option.value = `£${price}`;
    option.textContent = `£${price} (${count})`;
    maxPriceSelect.appendChild(option);
  }
  
  // Restore selection if it's still valid
  if (currentSelection && currentSelection !== '') {
    const optionExists = Array.from(maxPriceSelect.options).some(option => option.value === currentSelection);
    if (optionExists) {
      maxPriceSelect.value = currentSelection;
    }
  }
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
  
  // Reset all dropdown selects
  const dropdownSelects = document.querySelectorAll('.blood-tests-form select');
  dropdownSelects.forEach(select => {
    select.value = '';
  });
  
  // Reset biomarker search inputs
  const biomarkerInputs = document.querySelectorAll('.biomarker-search-input, .biomarker-search-input-2');
  biomarkerInputs.forEach(input => {
    input.value = '';
  });
  
  // Hide biomarker dropdowns
  const biomarkerDropdowns = document.querySelectorAll('.biomarker-dropdown, .biomarker-dropdown-2');
  biomarkerDropdowns.forEach(dropdown => {
    dropdown.style.display = 'none';
  });
  
  // Clear any validation errors
  clearValidationErrors();
  
  // Reset test count
  const testCountElement = document.querySelector('.test-count');
  if (testCountElement) {
    testCountElement.textContent = '0';
  }
  
  // Reset problem form if visible
  const problemForm = document.querySelector('.problem-form');
  if (problemForm) {
    const problemSelect = problemForm.querySelector('.symptom-select');
    if (problemSelect) {
      problemSelect.value = '';
    }
  }
  
  console.log('✅ Homepage form reset complete');
} 