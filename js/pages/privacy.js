export async function displayPrivacyPage() {
  return `
    <section class="privacy-hero">
      <div class="privacy-hero-content">
        <h1>Privacy Policy</h1>
        <p class="privacy-subtitle">How we protect your data</p>
      </div>
    </section>

    <section class="privacy-content-section">
      <div class="privacy-content">
        <div class="privacy-container">
          <div class="privacy-header">
            <h2>Privacy Policy – Testly</h2>
            <p class="last-updated">Last updated: 18/07/2025</p>
          </div>
          
          <div class="privacy-intro">
            <p>Testly ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and protect information when you visit testlyhealth.com.</p>
          </div>
          
          <div class="privacy-section">
            <h3>1. Who We Are</h3>
            <p>Testly is a UK-based platform that compares private health tests and treatments. Our aim is to help you find trusted providers and make informed decisions.</p>
          </div>
          
          <div class="privacy-section">
            <h3>2. What Data We Collect</h3>
            <p>We collect minimal personal information:</p>
            <ul>
              <li><strong>Contact form submissions:</strong> If you use our contact form, we collect your name, email address, and the message you send.</li>
              <li><strong>Login details:</strong> If you log in via Gmail or another method, we do not store or use your personal information beyond what is necessary to enable the login (currently not in use).</li>
              <li><strong>Affiliate link interactions:</strong> When you click on an affiliate link, Awin or other partners may place cookies to track clicks and purchases (see Section 4).</li>
            </ul>
            <p>We do not collect sensitive personal data or store health-related data.</p>
          </div>
          
          <div class="privacy-section">
            <h3>3. How We Use Your Information</h3>
            <ul>
              <li>To respond to enquiries you send via our contact form.</li>
              <li>To improve our website and services.</li>
              <li>To track affiliate link performance and generate commission (via third-party cookies).</li>
            </ul>
            <p>We do not sell or share your data with third parties for marketing purposes.</p>
          </div>
          
          <div class="privacy-section">
            <h3>4. Cookies and Tracking</h3>
            <p><strong>Affiliate Cookies:</strong> Some links on this site are affiliate links provided by Awin or other networks. These links use cookies to track when you click through and make a purchase, so we can earn a commission.</p>
            <p><strong>Analytics Cookies:</strong> We use Google Analytics 4 (GA4) to understand how visitors use our website and improve our services. GA4 collects information such as pages visited, time spent on site, browser type, device type, and general geographic location (city-level). Your IP address is anonymised before storage, and data is stored for a maximum of 14 months.</p>
            <p>Analytics cookies and tracking will only be activated if you provide consent via our cookie banner.</p>
            
            <h4>Local Storage</h4>
            <p>We use your browser's local storage to remember your cookie preferences and certain on-site settings (e.g., form selections). This information is stored locally on your device and is not transmitted to our servers.</p>
          </div>
          
          <div class="privacy-section">
            <h3>5. Third Parties</h3>
            <p>When you click on an affiliate link, you are redirected to the provider's website. These providers may collect and process your data in line with their own privacy policies. We recommend reading those policies when visiting external sites.</p>
            <p><strong>Google Analytics:</strong> We use Google Analytics 4, provided by Google LLC, to gather statistical data about website usage. Data may be processed outside the UK/EU. You can learn more in Google's Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>.</p>
          </div>
          
          <div class="privacy-section">
            <h3>6. Your Data Rights (UK GDPR)</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Withdraw consent to data processing (e.g., via cookies).</li>
            </ul>
            <p>To make a request, contact us at <a href="mailto:testlyhealth@gmail.com">testlyhealth@gmail.com</a>.</p>
            <p>You can withdraw consent for analytics tracking at any time by adjusting your cookie settings via the "Cookie Settings" link at the bottom of our site.</p>
          </div>
          
          <div class="privacy-section">
            <h3>7. Data Storage and Security</h3>
            <p>We take reasonable measures to protect your information. Contact form submissions are stored only as long as necessary to respond to your enquiry.</p>
          </div>
          
          <div class="privacy-section">
            <h3>8. Affiliate Disclosure</h3>
            <p>Some of the links on Testly are affiliate links. This means we may earn a commission if you click and make a purchase, at no extra cost to you. We only feature providers we believe are reputable and relevant.</p>
          </div>
          
          <div class="privacy-section">
            <h3>9. Contact Us</h3>
            <p>For privacy-related questions, contact us:</p>
            <p><strong>Email:</strong> <a href="mailto:testlyhealth@gmail.com">testlyhealth@gmail.com</a></p>
          </div>
        </div>
      </div>
    </section>
  `;
} 