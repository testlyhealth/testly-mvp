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
              <a href="#/advanced" class="compare-btn">Search Now</a>
            </div>
          </div>

          <div class="compare-tile">
            <div class="tile-content">
              <h3>2. I have a health concern</h3>
              <p><em>"I have symptoms or a goal but I'm not sure which test or treatment is right."</em></p>
              <a href="#/advanced" class="compare-btn">Find My Options</a>
            </div>
          </div>

          <div class="compare-tile">
            <div class="tile-content">
              <h3>3. I want a general health check</h3>
              <p><em>"I'm looking for a complete health MOT or wellness package."</em></p>
              <a href="#/category/general-health" class="compare-btn">See Top Tests</a>
            </div>
          </div>

          <div class="compare-tile">
            <div class="tile-content">
              <h3>4. I'm just browsing</h3>
              <p><em>"I want to explore what's out there before deciding."</em></p>
              <a href="#/" class="compare-btn">Browse Categories</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
} 