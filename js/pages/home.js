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
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            The simple way to choose<br>
            <span class="hero-highlight">trusted health tests and treatments</span>
        </h1>
          <div class="hero-explainer-section">
            <div class="explainer-left">
              <p class="explainer-intro">Testly compares trusted UK providers for:</p>
            </div>
            <div class="explainer-right">
              <div class="services-grid">
                <div class="services-column">
                  <div class="service-item">✅ Weight loss treatments</div>
                  <div class="service-item">✅ Blood tests</div>
                  <div class="service-item">✅ ADHD assessments</div>
                </div>
                <div class="services-column">
                  <div class="service-item">✅ Fertility clinics</div>
                  <div class="service-item">✅ Hormone clinics</div>
                  <div class="service-item">✅ Gut health tests</div>
                </div>
                <div class="services-column">
                  <div class="service-item">✅ Scans</div>
                  <div class="service-item">✅ Supplements</div>
                  <div class="service-item">✅ And more</div>
                </div>
              </div>
            </div>
          </div>
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

      </div>
    </section>

    <!-- Quick Categories Section -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">What are you looking for?</h2>
        <div class="categories-grid">
          <div class="category-card" data-category="weight-loss">
            <div class="category-image">
              <img src="images/weight-loss.jpg" alt="Weight loss">
            </div>
            <div class="category-content">
              <div class="category-text">
                <h3>Weight loss</h3>
                <p>Effective treatments and support programs</p>
              </div>
              <button class="get-started-btn">
                Get started
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="category-card" data-category="blood-tests">
            <div class="category-image">
              <img src="images/blood-vials.jpg" alt="Blood tests">
            </div>
            <div class="category-content">
              <div class="category-text">
                <h3>Blood tests</h3>
                <p>Comprehensive health screening and monitoring</p>
              </div>
              <button class="get-started-btn">
                Get started
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="category-card" data-category="fertility">
            <div class="category-image">
              <img src="images/fertility.jpg" alt="Fertility">
            </div>
            <div class="category-content">
              <div class="category-text">
                <h3>Fertility</h3>
                <p>Fertility testing and treatment options</p>
              </div>
              <button class="get-started-btn">
                Get started
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="category-card" data-category="adhd">
            <div class="category-image">
              <img src="images/ADHD.jpg" alt="ADHD">
            </div>
            <div class="category-content">
              <div class="category-text">
                <h3>ADHD</h3>
                <p>Assessment and treatment for ADHD</p>
              </div>
              <button class="get-started-btn">
                Get started
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="category-card" data-category="scans">
            <div class="category-image">
              <img src="images/mri.jpg" alt="Scans">
            </div>
            <div class="category-content">
              <div class="category-text">
                <h3>Scans</h3>
                <p>MRI, CT and diagnostic imaging services</p>
              </div>
              <button class="get-started-btn">
                Get started
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
        </div>
      </div>
          
          <div class="category-card" data-category="more">
            <div class="category-image">
              <img src="images/options.jpg" alt="More services">
            </div>
            <div class="category-content">
              <div class="category-text">
                <h3>More services</h3>
                <p>Explore additional health and wellness options</p>
              </div>
              <button class="get-started-btn">
                Get started
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
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
                  <h4>No AI</h4>
                  <p>All medical content written by doctors</p>
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
            <div class="trust-cta">
              <button class="primary-cta-button">
                Compare now
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="featured-section">
      <div class="container">
        <h2 class="section-title">Popular blood tests</h2>
        <div class="featured-grid">
          <div class="featured-card">
            <div class="card-content">
              <div class="card-header">
                <div class="provider-logo">
                  <div class="placeholder-logo"></div>
                </div>
                <div class="provider-info">
                  <h3 class="provider-name">Provider Name</h3>
                  <h4 class="test-name">Blood Test Name</h4>
                </div>
              </div>
              <div class="card-details">
                <div class="test-info">
                  <span class="biomarker-count">15 biomarkers</span>
                  <span class="test-price">£45</span>
                </div>
                <button class="view-test-btn">View Test</button>
              </div>
            </div>
          </div>
          
          <div class="featured-card">
            <div class="card-content">
              <div class="card-header">
                <div class="provider-logo">
                  <div class="placeholder-logo"></div>
                </div>
                <div class="provider-info">
                  <h3 class="provider-name">Provider Name</h3>
                  <h4 class="test-name">Blood Test Name</h4>
                </div>
              </div>
              <div class="card-details">
                <div class="test-info">
                  <span class="biomarker-count">15 biomarkers</span>
                  <span class="test-price">£45</span>
                </div>
                <button class="view-test-btn">View Test</button>
              </div>
      </div>
    </div>

          <div class="featured-card">
            <div class="card-content">
              <div class="card-header">
                <div class="provider-logo">
                  <div class="placeholder-logo"></div>
                </div>
                <div class="provider-info">
                  <h3 class="provider-name">Provider Name</h3>
                  <h4 class="test-name">Blood Test Name</h4>
                </div>
              </div>
              <div class="card-details">
                <div class="test-info">
                  <span class="biomarker-count">15 biomarkers</span>
                  <span class="test-price">£45</span>
                </div>
                <button class="view-test-btn">View Test</button>
              </div>
      </div>
      </div>
          
          <div class="featured-card">
            <div class="card-content">
              <div class="card-header">
                <div class="provider-logo">
                  <div class="placeholder-logo"></div>
                </div>
                <div class="provider-info">
                  <h3 class="provider-name">Provider Name</h3>
                  <h4 class="test-name">Blood Test Name</h4>
                </div>
              </div>
              <div class="card-details">
                <div class="test-info">
                  <span class="biomarker-count">15 biomarkers</span>
                  <span class="test-price">£45</span>
                </div>
                <button class="view-test-btn">View Test</button>
              </div>
            </div>
          </div>
        </div>
        <div class="featured-cta">
          <button class="secondary-cta-button">
            View All Blood Tests
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
  setupNavigationHandlers();
  setupCategoryCards();
  setupCTAButtons();
}

// Load featured blood tests from database
async function loadFeaturedBloodTest() {
  try {
    // Fetch all four tests in parallel
    const [test1Result, test2Result, test3Result, test4Result] = await Promise.all([
      supabase
        .from('provider_blood_tests')
        .select(`
          *,
          providers:provider_id (
            name
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
          )
        `)
        .eq('id', 4)
        .single(),
      supabase
        .from('provider_blood_tests')
        .select(`
          *,
          providers:provider_id (
            name
          )
        `)
        .eq('id', 152)
        .single()
    ]);

    if (test1Result.error) {
      console.error('Error fetching first blood test:', test1Result.error);
    } else if (test1Result.data) {
      updateFirstCard(test1Result.data);
    }

    if (test2Result.error) {
      console.error('Error fetching second blood test:', test2Result.error);
    } else if (test2Result.data) {
      updateSecondCard(test2Result.data);
    }

    if (test3Result.error) {
      console.error('Error fetching third blood test:', test3Result.error);
    } else if (test3Result.data) {
      updateThirdCard(test3Result.data);
    }

    if (test4Result.error) {
      console.error('Error fetching fourth blood test:', test4Result.error);
    } else if (test4Result.data) {
      updateFourthCard(test4Result.data);
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

  // Update View Test button link
  const viewTestBtn = firstCard.querySelector('.view-test-btn');
  if (viewTestBtn && testData.url) {
    viewTestBtn.onclick = () => {
      window.open(testData.url, '_blank');
    };
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

  // Update View Test button link
  const viewTestBtn = secondCard.querySelector('.view-test-btn');
  if (viewTestBtn && testData.url) {
    viewTestBtn.onclick = () => {
      window.open(testData.url, '_blank');
    };
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

  // Update View Test button link
  const viewTestBtn = thirdCard.querySelector('.view-test-btn');
  if (viewTestBtn && testData.url) {
    viewTestBtn.onclick = () => {
      window.open(testData.url, '_blank');
    };
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

  // Update View Test button link
  const viewTestBtn = fourthCard.querySelector('.view-test-btn');
  if (viewTestBtn && testData.url) {
    viewTestBtn.onclick = () => {
      window.open(testData.url, '_blank');
    };
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
  const primaryCTA = document.querySelector('.primary-cta-button');
  const secondaryCTA = document.querySelector('.secondary-cta-button');
  
  if (primaryCTA) {
    primaryCTA.addEventListener('click', () => {
            window.location.hash = '#/blood-tests';
        });
    }
  
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