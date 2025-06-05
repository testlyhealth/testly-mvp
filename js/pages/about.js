export async function displayAboutPage() {
  return `
    <section class="about-hero">
      <div class="about-hero-content">
        <h1>Our Story</h1>
        <p class="about-subtitle">Founded by doctors, built for everyone</p>
      </div>
    </section>

    <section class="about-story">
      <div class="about-content">
        <div class="about-text">
          <h2>From NHS to Health Tech</h2>
          <p>Testly was created by two NHS doctors, Dr Charles Winter and Dr Adam Hill, who saw firsthand how confusing and overwhelming the world of online health can be. After years of treating patients in the NHS, they recognized a growing need for a solution that would help people take control of their own health journey.</p>
          <p>Their experience in both traditional healthcare and the digital health space gave them unique insights into the challenges people face when trying to navigate online health services. They created Testly to bridge this gap, making health information and services more accessible and understandable for everyone.</p>
        </div>
      </div>
    </section>

    <section class="about-mission">
      <div class="about-content">
        <h2>Our Mission</h2>
        <p>To simplify healthcare by providing clear, accessible, and trustworthy information and services that empower people to make informed decisions about their health.</p>
        
        <div class="mission-values">
          <div class="value-card">
            <i class="fas fa-heart"></i>
            <h3>Patient-Centered</h3>
            <p>Everything we do is designed with the patient's needs and understanding in mind.</p>
          </div>
          <div class="value-card">
            <i class="fas fa-shield-alt"></i>
            <h3>Trust & Safety</h3>
            <p>We maintain the highest standards of medical accuracy and data security.</p>
          </div>
          <div class="value-card">
            <i class="fas fa-lightbulb"></i>
            <h3>Innovation</h3>
            <p>We continuously improve our platform to better serve our users' needs.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="about-team">
      <div class="about-content">
        <h2>Meet Our Founders</h2>
        <div class="founders-grid">
          <div class="founder-card">
            <div class="founder-image">
              <img src="images/charles-winter.jpg" alt="Dr Charles Winter" />
            </div>
            <h3>Dr Charles Winter</h3>
            <p>NHS Doctor & Health Tech Innovator</p>
          </div>
          <div class="founder-card">
            <div class="founder-image">
              <img src="images/adam-hill.jpg" alt="Dr Adam Hill" />
            </div>
            <h3>Dr Adam Hill</h3>
            <p>NHS Doctor & Digital Health Expert</p>
          </div>
        </div>
      </div>
    </section>

    <section class="about-cta">
      <div class="about-content">
        <h2>Ready to Take Control of Your Health?</h2>
        <p>Start your journey with Testly today</p>
        <div class="cta-buttons">
          <a href="#/blood-tests" class="cta-button">Compare Blood Tests</a>
          <a href="#/contact" class="cta-button secondary">Contact Us</a>
        </div>
      </div>
    </section>
  `;
} 