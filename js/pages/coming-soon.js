export async function displayComingSoonPage(categoryName) {
  return `
    <section class="compare-hero">
      <div class="compare-hero-content">
        <h1>${categoryName} is coming soon!</h1>
        <p class="compare-subtitle">We're working hard to bring you comprehensive ${categoryName.toLowerCase()} options. Check back soon!</p>
      </div>
    </section>

    <section class="compare-content-section">
      <div class="compare-content">
        <div class="coming-soon-container">
          <div class="coming-soon-content">
            <div class="coming-soon-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2>We're building something great</h2>
            <p>Our team is currently developing comprehensive ${categoryName.toLowerCase()} options to help you find the best tests and treatments.</p>
            <p>Want to be notified when we launch? <a href="#/contact" class="contact-link">Get in touch</a> and we'll let you know!</p>
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