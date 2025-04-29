import { $ } from './dom.js';

export function displayGeneralHealthTests() {
  const mainContent = $('main');
  if (!mainContent) return;

  const medichecksTest = {
    provider: "Medichecks",
    test_name: "Health and lifestyle blood test",
    price: 89,
    biomarkers: 19,
    logo: "images/logos/medichecks.png",
    link: "https://www.medichecks.com/products/health-and-lifestyle-check-blood-test",
    description: "Comprehensive health screening with the best balance of biomarkers and value",
    days_till_results: "2-3",
    lab_accreditations: ["UKAS", "ISO 15189"],
    trust_pilot_score: 4.8,
    doctors_report: "Yes",
    pricing_information: "Includes free shipping and doctor's report"
  };

  mainContent.innerHTML = `
    <div class="page-title">
      <h1>General Health Blood Tests</h1>
      <p>Compare and find the best general health blood tests for your needs</p>
    </div>

    <div class="recommendations">
      <div class="recommendation-box">
        <div class="provider-info">
          <img src="${medichecksTest.logo}" alt="${medichecksTest.provider} logo" class="provider-logo" style="height: 40px; margin-bottom: 1rem;" />
          <span class="provider-name">${medichecksTest.provider}</span>
        </div>
        <h2>${medichecksTest.test_name}</h2>
        <p>${medichecksTest.description}</p>
        <div class="test-details">
          <div class="price">£${medichecksTest.price}</div>
          <div class="biomarkers">${medichecksTest.biomarkers} biomarkers</div>
          <div class="results-time">Results in ${medichecksTest.days_till_results} days</div>
          <div class="accreditations">
            <strong>Lab Accreditations:</strong> ${medichecksTest.lab_accreditations.join(', ')}
          </div>
          <div class="trust-score">
            <strong>Trustpilot Score:</strong> ${medichecksTest.trust_pilot_score}/5
          </div>
          <div class="doctors-report">
            <strong>Doctor's Report:</strong> ${medichecksTest.doctors_report === "Yes" ? "Included" : "Not included"}
          </div>
          <div class="pricing-info">
            <strong>Includes:</strong> ${medichecksTest.pricing_information}
          </div>
        </div>
        <a href="${medichecksTest.link}" class="button" target="_blank">View Details</a>
      </div>

      <div class="recommendation-box">
        <h2>Best Value for Money</h2>
        <p>Essential health markers at an affordable price</p>
        <div class="price">£99</div>
        <a href="#" class="button">View Details</a>
      </div>

      <div class="recommendation-box">
        <h2>No Expense Spared</h2>
        <p>The most comprehensive health screening available</p>
        <div class="price">£299</div>
        <a href="#" class="button">View Details</a>
      </div>
    </div>
  `;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  displayGeneralHealthTests();
}); 