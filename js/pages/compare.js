export async function displayComparePage() {
  return `
    <section class="compare-hero">
      <div class="compare-hero-content">
        <h1>What brings you here today?</h1>
        <p class="compare-subtitle">Choose the option that best matches what you need — we'll guide you from there.</p>
      </div>
    </section>

    <section class="compare-content-section">
      <div class="compare-content">
        <div class="compare-grid">
          <div class="compare-tile">
            <div class="tile-content">
              <h3>1. I know what I want</h3>
              <p><em>"I already have a specific test or treatment in mind."</em></p>
              <a href="#/advanced" class="compare-btn"><span>Search Now</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.16666 10H15.8333M15.8333 10L10.8333 5M15.8333 10L10.8333 15" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <div class="compare-tile">
            <div class="tile-content">
              <h3>2. I have a health concern</h3>
              <p><em>"I have symptoms or a goal but I'm not sure which test or treatment is right."</em></p>
              <a href="#/advanced" class="compare-btn"><span>Find My Options</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.16666 10H15.8333M15.8333 10L10.8333 5M15.8333 10L10.8333 15" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <div class="compare-tile">
            <div class="tile-content">
              <h3>3. I want a general health check</h3>
              <p><em>"I'm looking for a complete health MOT or wellness package."</em></p>
              <a href="#/category/general-health" class="compare-btn"><span>See Top Tests</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.16666 10H15.8333M15.8333 10L10.8333 5M15.8333 10L10.8333 15" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <div class="compare-tile">
            <div class="tile-content">
              <h3>4. I'm just browsing</h3>
              <p><em>"I want to explore what's out there before deciding."</em></p>
              <a href="#/" class="compare-btn"><span>Browse Categories</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.16666 10H15.8333M15.8333 10L10.8333 5M15.8333 10L10.8333 15" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
} 