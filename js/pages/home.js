// Home page module
import { $, $all } from '../dom.js';
import { blogPosts } from '../blog-data.js';
import { CardService } from '../services/cardService.js';
import { supabase } from '../api/supabase.js';

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
          Compare <span class="rolling-text" id="rolling-text">blood tests</span>
        </p>

        <div class="hero-cta">
          <button class="primary-cta-button">
            Compare now
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <p class="cta-note">Free comparison • No booking fees • Trusted providers</p>
        </div>
      </div>
      
      <div class="hero-side-box">
        <div class="side-box-content">
          <h3>Find your solution</h3>
          <div class="search-tabs">
            <button class="tab-button active">Test / Treatment</button>
            <button class="tab-button">Problem / Symptom</button>
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
    </section>

    <!-- Get Started Section -->
    <section class="get-started-section">
      <div class="container">
        <h2 class="get-started-title">Let's get started.<br>What do you need?</h2>
        
        <div class="option-cards">
          <div class="option-card selected">
            <div class="card-icon question-icon" style="background: #FFB74D;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="option-title"><span style="color: #1E88E5;">Help</span> with my symptoms</h3>
            <p class="option-description">Not sure what you need? Tell us your symptoms and we'll guide you to the right solution.</p>
            <button class="option-card-btn" onclick="window.location.hash = '#/help'">
              Get help
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div class="option-card">
            <div class="card-icon glasses-icon" style="background: #CE93D8;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="option-title">I'm just <span style="color: #1E88E5;">browsing</span></h3>
            <p class="option-description">Explore our range of health tests and treatments to see what's available.</p>
            <button class="option-card-btn" onclick="window.location.hash = '#/browse'">
              Browse
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div class="option-card">
            <div class="card-icon search-icon" style="background: #81C784;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="option-title">I <span style="color: #1E88E5;">know</span> what I want</h3>
            <p class="option-description">You have a specific test or treatment in mind. Let's find the best provider for you.</p>
            <button class="option-card-btn" onclick="scrollToQuickSearch()">
              Search
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
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
  setupRollingText();
  setupSearchTabs();
  setupOptionCardSelection();
  
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
  const secondaryCTA = document.querySelector('.secondary-cta-button');
  
  primaryCTAs.forEach(primaryCTA => {
    primaryCTA.addEventListener('click', () => {
      window.location.hash = '#/compare';
    });
  });
  
  if (secondaryCTA) {
    secondaryCTA.addEventListener('click', () => {
      // Navigate to the General Health category page
      window.location.hash = '#/category/General%20health?filter=General%20health';
    });
  }
}

// Setup navigation handlers
function setupNavigationHandlers() {
  // Add any additional navigation setup here
}

// Setup rolling text animation
function setupRollingText() {
  const rollingTextElement = document.getElementById('rolling-text');
  if (!rollingTextElement) return;

  const textOptions = [
    'blood tests',
    'weight loss treatments',
    'ADHD assessments',
    'fertility treatments',
    'hormone clinics',
    'supplements'
  ];

  let currentIndex = 1; // Start at second option (weight loss treatments)

  function updateText() {
    rollingTextElement.style.opacity = '0';
    
    setTimeout(() => {
      rollingTextElement.textContent = textOptions[currentIndex];
      rollingTextElement.style.opacity = '1';
      currentIndex = (currentIndex + 1) % textOptions.length;
    }, 300);
  }

  // Start the cycle after 3 seconds (so it doesn't immediately change from the initial "blood tests")
  setTimeout(() => {
    // Update text every 3 seconds
    setInterval(updateText, 3000);
  }, 3000);
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
              
              // Show/hide appropriate form using opacity and visibility instead of display
              if (button.textContent === 'Test / Treatment') {
                bloodTestsForm.style.opacity = '1';
                bloodTestsForm.style.visibility = 'visible';
                bloodTestsForm.style.position = 'absolute';
                problemForm.style.opacity = '0';
                problemForm.style.visibility = 'hidden';
                problemForm.style.position = 'absolute';
              } else if (button.textContent === 'Problem / Symptom') {
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
          console.log('=== DEBUG: setupQuickSearchForm ===');
          
          const searchButton = document.querySelector('.blood-tests-form .search-button');
          console.log('Blood tests search button found:', !!searchButton);
          if (searchButton) {
            searchButton.addEventListener('click', handleQuickSearch);
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
          
          // Combine biomarkers if both are selected
          const biomarkers = [];
          if (biomarker1) biomarkers.push(biomarker1);
          if (biomarker2) biomarkers.push(biomarker2);
          
          if (biomarkers.length > 0) {
            searchParams.set('biomarkers', biomarkers.join(','));
          }
          
          // Navigate to category page with search parameters
          if (productCategory === 'weight-loss') {
            // Redirect to weight loss page
            window.location.hash = '#/weight-loss';
          } else if (productCategory === 'coming-soon') {
            // Redirect to blood test request page
            window.location.hash = '#/blood-test-request';
          } else if (category === 'all') {
            // If "All" is selected, go to blood tests page with all categories parameter
            searchParams.set('showAll', 'true');
            const url = `#/blood-tests${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
            window.location.hash = url;
          } else if (category && category !== 'all') {
            // Add category as filter parameter
            searchParams.set('filter', category);
            const url = `#/general-health${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
            window.location.hash = url;
          } else {
            // If no category selected, go to blood tests page
            const url = `#/blood-tests${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
            window.location.hash = url;
          }
        }
        
        function handleProblemSearch() {
          console.log('=== DEBUG: handleProblemSearch function called ===');
          const selectedProblem = document.querySelector('.symptom-select')?.value;
          
          console.log('=== DEBUG: handleProblemSearch ===');
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
          window.location.hash = '#/general-health';
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