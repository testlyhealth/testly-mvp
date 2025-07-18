export async function displayBloodTestSearchOptionsPage() {
  return `
    <section class="compare-hero">
      <div class="compare-hero-content">
        <h1>How would you like to search for blood tests?</h1>
        <p class="compare-subtitle">Choose the search method that works best for you.</p>
      </div>
    </section>

    <section class="compare-content-section">
      <div class="compare-content">
        <div class="compare-grid">
          <div class="compare-tile option-specific" onclick="window.location.hash='#/blood-test-categories'">
            <div class="tile-content">
              <h3>
                <span class="tile-icon-inline">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H21V21H3V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 9H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                Search by category
              </h3>
              <p><em>Thyroid health, Vitamins and minerals, General health, etc.</em></p>
            </div>
          </div>

          <div class="compare-tile option-concern" onclick="window.location.hash='#/advanced'">
            <div class="tile-content">
              <h3>
                <span class="tile-icon-inline">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                Search by biomarkers
              </h3>
              <p><em>Vitamin D, Testosterone, TSH (thyroid stimulating hormone), etc.</em></p>
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