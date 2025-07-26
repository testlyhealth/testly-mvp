export async function displayComparePage() {
  return `
    <section class="general-health-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Compare <span style="color: #1E88E5;">blood tests</span>
        </h1>
        <p class="hero-subtitle">
          Blood tests from accredited labs covering the health of your <strong class="gh-em">heart</strong>, <strong class="gh-em">liver</strong>, <strong class="gh-em">kidneys</strong>, <strong class="gh-em">cholesterol</strong>, <strong class="gh-em">vitamins</strong> and more.
        </p>
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