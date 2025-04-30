import { $ } from './dom.js';

export function displayGeneralHealthTests() {
  const mainContent = $('main');
  if (!mainContent) return;

  const thrivaTest = {
    provider: "Thriva",
    test_name: "Baseline blood test",
    price: 110,
    biomarkers: 14,
    logo: "images/logos/thriva.png",
    link: "https://thriva.co/products/baseline-blood-test",
    description: "Comprehensive health screening with the best balance of biomarkers and value",
    days_till_results: "2-3",
    lab_accreditations: ["UKAS", "ISO 15189"],
    trust_pilot_score: 4.9,
    doctors_report: "Yes",
    pricing_information: "Includes free shipping and doctor's report"
  };

  const medichecksTest = {
    provider: "Medichecks",
    test_name: "Health and lifestyle blood test",
    price: 89,
    biomarkers: 19,
    logo: "images/logos/medichecks.png",
    link: "https://www.medichecks.com/products/health-and-lifestyle-check-blood-test",
    description: "Essential health markers at an affordable price",
    days_till_results: "2-3",
    lab_accreditations: ["UKAS", "ISO 15189"],
    trust_pilot_score: 4.8,
    doctors_report: "Yes",
    pricing_information: "Includes free shipping and doctor's report"
  };

  const lolaTest = {
    provider: "Lola",
    test_name: "Comprehensive health check",
    price: 299,
    biomarkers: 56,
    logo: "images/logos/lola.png",
    link: "https://www.lola.com/comprehensive-health-check",
    description: "The most comprehensive health screening available with extensive biomarker coverage",
    days_till_results: "2-3",
    lab_accreditations: ["UKAS", "ISO 15189"],
    trust_pilot_score: 4.8,
    doctors_report: "Yes",
    pricing_information: "Includes free shipping, doctor's report, and detailed analysis"
  };

  mainContent.innerHTML = `
    <div class="page-title">
      <h1>General Health Blood Tests</h1>
      <p>Compare and find the best general health blood tests for your needs</p>
    </div>

    <div class="recommendations">
      <div class="recommendation-column">
        <h3 class="recommendation-heading">Best Overall Value</h3>
        <div class="recommendation-box">
          <div class="provider-info">
            <img src="${thrivaTest.logo}" alt="${thrivaTest.provider} logo" class="provider-logo" style="height: 40px; margin-bottom: 1rem;" />
            <span class="provider-name">${thrivaTest.provider}</span>
          </div>
          <h2>${thrivaTest.test_name}</h2>
          <p>${thrivaTest.description}</p>
          <div class="test-details">
            <div class="price">£${thrivaTest.price}</div>
            <div class="biomarkers">${thrivaTest.biomarkers} biomarkers</div>
            <div class="results-time">Results in ${thrivaTest.days_till_results} days</div>
            <div class="accreditations">
              <strong>Lab Accreditations:</strong> ${thrivaTest.lab_accreditations.join(', ')}
            </div>
            <div class="trust-score">
              <strong>Trustpilot Score:</strong> ${thrivaTest.trust_pilot_score}/5
            </div>
            <div class="doctors-report">
              <strong>Doctor's Report:</strong> ${thrivaTest.doctors_report === "Yes" ? "Included" : "Not included"}
            </div>
            <div class="pricing-info">
              <strong>Includes:</strong> ${thrivaTest.pricing_information}
            </div>
          </div>
          <a href="${thrivaTest.link}" class="button" target="_blank">View Details</a>
        </div>
      </div>

      <div class="recommendation-column">
        <h3 class="recommendation-heading">Best Value for Money</h3>
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
      </div>

      <div class="recommendation-column">
        <h3 class="recommendation-heading">No Expense Spared</h3>
        <div class="recommendation-box">
          <div class="provider-info">
            <img src="${lolaTest.logo}" alt="${lolaTest.provider} logo" class="provider-logo" style="height: 40px; margin-bottom: 1rem;" />
            <span class="provider-name">${lolaTest.provider}</span>
          </div>
          <h2>${lolaTest.test_name}</h2>
          <p>${lolaTest.description}</p>
          <div class="test-details">
            <div class="price">£${lolaTest.price}</div>
            <div class="biomarkers">${lolaTest.biomarkers} biomarkers</div>
            <div class="results-time">Results in ${lolaTest.days_till_results} days</div>
            <div class="accreditations">
              <strong>Lab Accreditations:</strong> ${lolaTest.lab_accreditations.join(', ')}
            </div>
            <div class="trust-score">
              <strong>Trustpilot Score:</strong> ${lolaTest.trust_pilot_score}/5
            </div>
            <div class="doctors-report">
              <strong>Doctor's Report:</strong> ${lolaTest.doctors_report === "Yes" ? "Included" : "Not included"}
            </div>
            <div class="pricing-info">
              <strong>Includes:</strong> ${lolaTest.pricing_information}
            </div>
          </div>
          <a href="${lolaTest.link}" class="button" target="_blank">View Details</a>
        </div>
      </div>
    </div>
  `;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  displayGeneralHealthTests();
}); 