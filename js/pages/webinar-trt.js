export async function displayWebinarTrtPage() {
  return `
    <div class="webinar-page">
      <div class="webinar-container">
        <!-- Hero Section -->
        <div class="webinar-hero">
          <h1 class="webinar-headline">Thinking about TRT? Get the facts in our free webinar.</h1>
          <p class="webinar-subheadline">What testosterone therapy is, how it works, and what to check before considering it.</p>
        </div>

        <!-- Benefits Section -->
        <div class="webinar-benefits">
          <h2>What you'll learn:</h2>
          <ul class="benefits-list">
            <li>
              <i class="fas fa-check-circle"></i>
              <span>What TRT is (and isn't) - separating fact from fiction</span>
            </li>
            <li>
              <i class="fas fa-check-circle"></i>
              <span>Risks & benefits explained simply - making informed decisions</span>
            </li>
            <li>
              <i class="fas fa-check-circle"></i>
              <span>What blood tests reveal before any treatment - the essential checks</span>
            </li>
          </ul>
        </div>

        <!-- Email Capture Form -->
        <div class="webinar-form-section">
          <div class="form-container">
            <h3>Reserve your spot</h3>
            <form class="webinar-form" id="webinarForm" action="https://formspree.io/f/mjkokabk" method="POST">
              <input type="hidden" name="subject" value="TRT Webinar Signup">
              
              <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required>
              </div>
              
              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
              </div>
              
              <button type="submit" class="cta-button">
                <i class="fas fa-calendar-plus"></i>
                Reserve my spot
              </button>
            </form>
          </div>
        </div>

        <!-- Trust Element -->
        <div class="webinar-trust">
          <div class="trust-content">
            <div class="trust-badge">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="trust-text">
              <p><strong>Hosted by Testly</strong> — UK's health test comparison site</p>
              <p class="trust-doctors">Featuring insights from Dr Charles Hand and Dr Adam Hill, experienced TRT specialists</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Function to show messages
function showWebinarMessage(message, type) {
  // Remove any existing messages
  const existingMessage = document.querySelector('.webinar-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `webinar-message ${type}`;
  messageDiv.innerHTML = `
    <div class="message-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;

  // Insert after the form
  const formSection = document.querySelector('.webinar-form-section');
  formSection.insertAdjacentElement('afterend', messageDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

export function initializeWebinarTrtPage() {
  // Track page view in GA4
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: 'TRT Webinar Landing Page',
      page_location: window.location.href,
      page_path: '/webinar-trt'
    });
  }

  const form = document.getElementById('webinarForm');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      // Show loading state
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reserving your spot...';
      submitButton.disabled = true;
      
      try {
        // Track form submission in GA4
        if (typeof gtag !== 'undefined') {
          gtag('event', 'webinar_signup', {
            event_category: 'engagement',
            event_label: 'trt_webinar',
            value: 1
          });
        }
        
        // Submit to Formspree (exactly like contact form)
        const formData = new FormData(form);
        
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Show success message
          showWebinarMessage('Thank you! You\'ve been added to our webinar list. We\'ll send you the details by email.', 'success');
          form.reset();
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        alert('Sorry, there was an error submitting your form. Please try again.');
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      }
    });
  }
}
