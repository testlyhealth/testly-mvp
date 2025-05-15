import { getGroupedBiomarkers } from '../utils/biomarkerUtils.js';

export class CardService {
  constructor() {
    this.providerLogoMap = {
      'Medichecks': 'medichecks.png',
      'Thriva': 'thriva.png',
      'LetsGetChecked': 'letsgetchecked.png',
      'Blue Horizon': 'bluehorizon.png',
      'YorkTest': 'yorktest.png'
    };
  }

  async createCard(test, options = {}) {
    const {
      showRank = true,
      showBiomarkers = true,
      showDetails = true,
      rank = null
    } = options;

    const groupedBiomarkers = await getGroupedBiomarkers(test.biomarkers);
    const providerLogo = this.providerLogoMap[test.provider] || 'default-logo.png';
    const totalBiomarkers = test.biomarkers.length;

    return `
      <div class="product-card blood-test-card" data-test-id="${test.test_name}">
        ${showRank && rank !== null ? `<div class="test-rank">${rank}</div>` : ''}
        <div class="test-header">
          <div class="provider-info">
            <img src="images/logos/${providerLogo}" alt="${test.provider} logo" class="provider-logo">
            <span class="provider-name">${test.provider}</span>
          </div>
          <h3 class="test-name">${test.test_name}</h3>
        </div>
        <p>${test.description}</p>
        <div class="test-details">
          <div class="test-price">£${test.price}</div>
          ${showBiomarkers ? `
            <div class="biomarkers-section">
              <div class="biomarkers-header">
                <div class="biomarker-info">
                  <h4>Tests Included: ${totalBiomarkers}</h4>
                  <button class="toggle-biomarkers" aria-expanded="false">Show</button>
                </div>
              </div>
              <div class="biomarkers-list hidden">
                ${Array.from(groupedBiomarkers.entries()).map(([group, tests]) => `
                  <div class="biomarker-group">
                    <h5 class="group-header" style="cursor: pointer; padding: 8px; background: #f5f5f5; margin: 4px 0; border-radius: 4px;">
                      ${group} (${tests.length} tests)
                    </h5>
                    <ul class="biomarker-items hidden" style="padding-left: 20px;">
                      ${tests.map(test => `<li>${test}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${showDetails ? `
            <div class="test-locations">
              <h4>Sample Type:</h4>
              <p>${test["blood test location"].join(', ')}</p>
            </div>
            <div class="test-results">
              <p>Results in ${test["Days till results returned"]}</p>
            </div>
            <button class="toggle-details" aria-expanded="false">Details</button>
            <div class="additional-details hidden">
              <div class="detail-section">
                <h4>Pricing Information</h4>
                <p>${test["pricing information"]}</p>
              </div>
              <div class="detail-section">
                <h4>Doctor's Report</h4>
                <p>${test["doctors report"] === "Yes" ? "Includes a doctor's report" : "No doctor's report included"}</p>
              </div>
              <div class="detail-section">
                <h4>Lab Accreditations</h4>
                <ul>
                  ${test["lab accreditations"].map(accreditation => `<li>${accreditation}</li>`).join('')}
                </ul>
              </div>
              <div class="detail-section">
                <h4>Trustpilot Score</h4>
                <p>${test["trust pilot score"]}/5</p>
              </div>
              <div class="detail-section">
                <h4>Learn More</h4>
                <a href="${test.link}" target="_blank" class="provider-link">Visit ${test.provider} website</a>
              </div>
            </div>
          ` : ''}
        </div>
        <button class="add-to-basket" data-test-id="${test.test_name}">Add to Basket</button>
      </div>
    `;
  }

  async createCards(tests, options = {}) {
    const sortedTests = [...tests].sort((a, b) => a.price - b.price);
    const cards = await Promise.all(
      sortedTests.map((test, index) => 
        this.createCard(test, { ...options, rank: index + 1 })
      )
    );
    return cards.join('');
  }
} 