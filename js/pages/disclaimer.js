export async function displayDisclaimerPage() {
  return `
    <section class="disclaimer-hero">
      <div class="disclaimer-hero-content">
        <h1>Disclaimer</h1>
        <p class="disclaimer-subtitle">Important information about our content</p>
      </div>
    </section>

    <section class="disclaimer-content-section">
      <div class="disclaimer-content">
        <div class="disclaimer-container">
          <div class="disclaimer-header">
            <h2>Disclaimer – Testly</h2>
          </div>
          
          <div class="disclaimer-section">
            <p>The information on testlyhealth.com is for informational purposes only and is not medical advice. Always consult a qualified healthcare professional before making any medical decisions or starting treatment.</p>
          </div>
          
          <div class="disclaimer-section">
            <p>Some links on our site are affiliate links, meaning we may earn a commission if you click and purchase, at no extra cost to you. We aim to feature only reputable UK providers, but we do not control their services or websites.</p>
          </div>
          
          <div class="disclaimer-section">
            <p>While we make every effort to keep information accurate and up to date, Testly accepts no liability for any loss or damage arising from reliance on the content provided.</p>
          </div>
        </div>
      </div>
    </section>
  `;
} 