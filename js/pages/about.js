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



    <section class="about-team">
      <div class="about-content">
        <h2>Meet Our Founders</h2>
        <div class="founders-grid">
          <div class="founder-card">
            <div class="founder-image">
              <img src="images/Charles.png" alt="Dr Charles Winter" />
            </div>
            <h3>Dr Charles Winter</h3>
            <p>NHS Doctor & Health Tech Innovator</p>
          </div>
          <div class="founder-card">
            <div class="founder-image">
              <img src="images/Adam.png" alt="Dr Adam Hill" />
            </div>
            <h3>Dr Adam Hill</h3>
            <p>NHS Doctor & Digital Health Expert</p>
          </div>
        </div>
      </div>
    </section>


  `;
} 