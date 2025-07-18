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
          <div class="compare-tile option-specific" onclick="window.location.hash='#/category-select'">
            <div class="tile-content">
              <h3>
                <span class="tile-icon-inline">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                I know what I want
              </h3>
              <p><em>"I already have a specific test or treatment in mind."</em></p>
            </div>
          </div>

          <div class="compare-tile option-concern" onclick="window.location.hash='#/category-select'">
            <div class="tile-content">
              <h3>
                <span class="tile-icon-inline">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                I have a health concern
              </h3>
              <p><em>"I have symptoms or a goal but don't know the option I need."</em></p>
            </div>
          </div>

          <div class="compare-tile option-checkup" onclick="window.location.hash='#/category/general-health'">
            <div class="tile-content">
              <h3>
                <span class="tile-icon-inline">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                I want a general health check
              </h3>
              <p><em>"I'm looking for a complete health MOT or wellness package."</em></p>
            </div>
          </div>

          <div class="compare-tile option-browse" onclick="window.location.hash='#/'">
            <div class="tile-content">
              <h3>
                <span class="tile-icon-inline">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H21V21H3V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 9H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                I'm just browsing
              </h3>
              <p><em>"I want to explore what's out there before deciding."</em></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
} 