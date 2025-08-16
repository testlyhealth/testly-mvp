export async function displayCookiesPage() {
  return `
    <section class="cookies-hero">
      <div class="cookies-hero-content">
        <h1>Cookie Policy</h1>
        <p class="cookies-subtitle">How we use cookies on our site</p>
      </div>
    </section>

    <section class="cookies-content-section">
      <div class="cookies-content">
        <div class="cookies-container">
          <div class="cookies-header">
            <h2>Cookie Policy – Testly</h2>
            <p class="last-updated">Last updated: 18/07/2025</p>
          </div>
          
          <div class="cookies-intro">
            <p>This Cookie Policy explains how Testly ("we," "our," or "us") uses cookies and similar technologies when you visit testlyhealth.com.</p>
          </div>
          
          <div class="cookies-section">
            <h3>1. What Are Cookies?</h3>
            <p>Cookies are small text files placed on your device when you browse websites. They help websites function, improve user experience, and, in some cases, track activity for analytics or affiliate purposes.</p>
            <p>This policy also applies to similar technologies such as local storage, which stores data directly in your browser. We use local storage to remember your cookie preferences and certain site settings. This data is stored locally and not sent to our servers.</p>
          </div>
          
          <div class="cookies-section">
            <h3>2. How We Use Cookies</h3>
            <p>Testly uses cookies for the following purposes:</p>
            <ul>
              <li><strong>Affiliate Tracking:</strong> Some links on our site are affiliate links provided by Awin or other networks. These links use cookies to track when you click through and make a purchase. This allows us to earn a commission at no extra cost to you.</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics 4 cookies help us understand how visitors engage with our site. These cookies may track pages visited, links clicked, and time spent on each page. They do not store personally identifiable information.</li>
            </ul>
            <p>GA4 cookies are only placed if you consent via our cookie banner. If you reject analytics cookies, no Google Analytics tracking will occur.</p>
          </div>
          
          <div class="cookies-section">
            <h3>3. Third-Party Cookies</h3>
            <p>When you click an affiliate link, our partners (e.g., Awin) may set cookies to track your activity on their website. We do not control these cookies. For more information, please refer to the privacy and cookie policies of the respective providers.</p>
            <p><strong>Google Analytics (Google LLC)</strong> – Used for website analytics. Data may be stored in the United States. Learn more: <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/cookies</a>.</p>
          </div>
          
          <div class="cookies-section">
            <h3>4. Managing Cookies</h3>
            <p>Most web browsers allow you to manage or delete cookies. You can:</p>
            <ul>
              <li>Adjust your browser settings to block cookies.</li>
              <li>Delete cookies stored on your device at any time.</li>
            </ul>
            <p>Please note that blocking cookies may affect how affiliate tracking works and could limit the functionality of some links on our site.</p>
          </div>
          
          <div class="cookies-section">
            <h3>5. Updates to This Policy</h3>
            <p>We may update this Cookie Policy if we add new technologies or tracking tools. The "Last updated" date at the top of this page will indicate when changes were made.</p>
          </div>
          
          <div class="cookies-section">
            <h3>6. Contact Us</h3>
            <p>If you have questions about this Cookie Policy, you can contact us at:</p>
            <p><strong>Email:</strong> <a href="mailto:testlyhealth@gmail.com">testlyhealth@gmail.com</a></p>
          </div>
        </div>
      </div>
    </section>
  `;
} 