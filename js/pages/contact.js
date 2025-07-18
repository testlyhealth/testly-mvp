export async function displayContactPage() {
  return `
    <section class="contact-hero" style="padding: 1rem 2rem;">
      <div class="contact-hero-content">
        <h1>Contact Us</h1>
        <p class="contact-subtitle">Get in touch with our team</p>
      </div>
    </section>

    <section class="contact-form-section" style="padding: 0.5rem 2rem;">
      <div class="contact-content">
        <div class="contact-form-container" style="padding: 1rem;">
          <h2>Send us a message</h2>
          <p>Have a question or need help? We'd love to hear from you.</p>
          
          <form class="contact-form" id="contactForm" action="https://formspree.io/f/mjkokabk" method="POST">
            <div class="form-group">
              <label for="name">Name *</label>
              <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
              <label for="email">Email *</label>
              <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="subject">Subject *</label>
              <input type="text" id="subject" name="subject" required>
            </div>
            
            <div class="form-group">
              <label for="message">Message *</label>
              <textarea id="message" name="message" rows="6" required></textarea>
            </div>
            
            <div style="text-align: left; margin-top: 1rem;">
              <button type="submit" style="background: #007bff !important; color: white !important; padding: 0.75rem 1.5rem !important; border: none !important; border-radius: 4px !important; font-size: 1rem !important; font-weight: 500 !important; cursor: pointer !important; display: inline-block !important;">Send Message</button>
            </div>
          </form>
          
          <div id="contactMessage" style="margin-top: 1rem; padding: 1rem; border-radius: 4px; display: none;"></div>
        </div>
      </div>
    </section>
  `;
}

// Add form handling after the page is rendered
export function initializeContactPage() {
  const form = document.getElementById('contactForm');
  const messageDiv = document.getElementById('contactMessage');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const subject = formData.get('subject');
      const message = formData.get('message');
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      try {
        // Submit to Formspree
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Show success message
          showMessage('Thank you! Your message has been sent successfully.', 'success');
          form.reset();
        } else {
          throw new Error('Failed to send message');
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
      } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
    messageDiv.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`;
    
    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
} 