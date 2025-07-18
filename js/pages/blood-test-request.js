export async function displayBloodTestRequestPage() {
  return `
    <section class="compare-hero">
      <div class="compare-hero-content">
        <h1>Can't find what you're looking for?</h1>
        <p class="compare-subtitle">Tell us about the blood test or category you need, and we'll work on adding it to our platform.</p>
      </div>
    </section>

    <section class="compare-content-section">
      <div class="compare-content">
        <div class="request-form-container">
          <form id="blood-test-request-form" class="request-form" action="https://formspree.io/f/mjkokabk" method="POST">
            <div class="form-group">
              <label for="request-type">What type of blood test are you looking for? *</label>
              <select id="request-type" name="requestType" required>
                <option value="">Select an option</option>
                <option value="specific-test">A specific blood test</option>
                <option value="test-category">A category of tests</option>
                <option value="biomarker">A specific biomarker</option>
                <option value="health-concern">Tests for a health concern</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div class="form-group">
              <label for="request-details">Please describe what you're looking for: *</label>
              <textarea 
                id="request-details" 
                name="requestDetails" 
                rows="4" 
                placeholder="e.g., I'm looking for tests related to autoimmune conditions, or I need a test that measures cortisol levels throughout the day..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="urgency">How urgent is this for you? *</label>
              <select id="urgency" name="urgency" required>
                <option value="">Select urgency level</option>
                <option value="very-urgent">Very urgent - I need this soon</option>
                <option value="moderate">Moderate - I'd like it within a few weeks</option>
                <option value="not-urgent">Not urgent - Just planning ahead</option>
              </select>
            </div>

            <div class="form-group">
              <label for="email">Your email address *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="your.email@example.com"
                required
              >
              <small>We'll let you know when we add tests related to your request</small>
            </div>

            <div class="form-group">
              <label for="additional-info">Any additional information that might help us understand your needs?</label>
              <textarea 
                id="additional-info" 
                name="additionalInfo" 
                rows="3" 
                placeholder="e.g., I'm looking for tests that can be done at home, or I need tests that are covered by insurance..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn">
                Submit Request
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </form>

          <div id="success-message" class="success-message hidden">
            <div class="success-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3>Thank you for your request!</h3>
              <p>We've received your blood test request and will review it carefully. We're constantly expanding our test offerings based on user needs.</p>
              <button onclick="window.location.hash='#/blood-test-categories'" class="back-to-search-btn">
                Back to Blood Test Categories
              </button>
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

// Form submission handler
export function initializeBloodTestRequestPage() {
  const form = document.getElementById('blood-test-request-form');
  const successMessage = document.getElementById('success-message');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      
      // Add hidden fields to identify this as a blood test request
      formData.append('_subject', 'Blood Test Request - New Category/Test Needed');
      formData.append('_source', 'blood-test-request-form');
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
      
      try {
        // Submit to Formspree (same as contact form)
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Show success message
          form.style.display = 'none';
          successMessage.classList.remove('hidden');
        } else {
          throw new Error('Failed to submit request');
        }
        
      } catch (error) {
        console.error('Error submitting blood test request:', error);
        alert('Sorry, there was an error submitting your request. Please try again.');
      } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
} 