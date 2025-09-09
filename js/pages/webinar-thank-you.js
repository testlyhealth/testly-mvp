export async function displayWebinarThankYouPage() {
  return `
    <div class="thank-you-page">
      <div class="thank-you-container">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        
        <h1 class="thank-you-title">You're in!</h1>
        <p class="thank-you-message">We'll send you the webinar link by email.</p>
        
        <div class="next-steps">
          <h3>What happens next?</h3>
          <ul>
            <li>Check your email for confirmation</li>
            <li>We'll send you the webinar details closer to the date</li>
            <li>Join us for an informative session about TRT</li>
          </ul>
        </div>
        
        <div class="thank-you-actions">
          <a href="#/" class="cta-button">Return to Home</a>
          <a href="#/blood-tests" class="secondary-button">Browse Blood Tests</a>
        </div>
      </div>
    </div>
  `;
}

export function initializeWebinarThankYouPage() {
  // Track page view in GA4
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: 'Webinar Thank You',
      page_location: window.location.href
    });
  }
}
