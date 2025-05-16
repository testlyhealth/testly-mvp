import { getGroupedBiomarkers } from '../utils/biomarkerUtils.js';
import { $all } from '../dom.js';

export class CardService {
  constructor() {
    this.providerLogoMap = {
      'London Health Company': 'london health company.png',
      'Numan': 'numan.png',
      'Medichecks': 'medichecks.png',
      'London Medical Laboratory': 'london medical laboratory.png',
      'Superdrug': 'superdrug.png',
      'Bluecrest': 'bluecrest.png',
      'Thriva': 'thriva.png',
      'Forth': 'forth.png'
    };
  }

  async createCard(test, options = {}) {
    const {
      showRank = false,
      showBiomarkers = true,
      showDetails = true
    } = options;

    // Get the provider logo filename
    const providerLogo = this.providerLogoMap[test.provider] || `${test.provider}.png`;
    
    // Get grouped biomarkers
    const groupedBiomarkers = await this.getGroupedBiomarkers(test.biomarkers);
    
    // Ensure required fields have fallback values
    const testData = {
      ...test,
      "blood test location": test["blood test location"] || [],
      "Days till results returned": test["Days till results returned"] || "N/A",
      "pricing information": test["pricing information"] || "Contact provider for pricing details",
      "doctors report": test["doctors report"] || "No",
      "lab accreditations": test["lab accreditations"] || ["Not specified"],
      "trust pilot score": test["trust pilot score"] || "N/A",
      link: test.link || "#"
    };
    
    return `
      <div class="product-card blood-test-card" data-test-id="${testData.test_name}">
        ${showRank ? `<div class="test-rank">${options.rank}</div>` : ''}
        <div class="test-header">
          <div class="provider-info">
            <img src="images/logos/${providerLogo}" alt="${testData.provider} logo" class="provider-logo">
          </div>
          <h3 class="test-name"><span class="provider-name">${testData.provider}</span> - ${testData.test_name}</h3>
        </div>
        <p>${testData.description || ''}</p>
        <div class="test-details">
          <div class="test-price">£${testData.price || 'N/A'}</div>
          ${showBiomarkers ? `
            <div class="biomarkers-section">
              <div class="biomarkers-header">
                <div class="biomarker-info">
                  <h4>Tests included: ${testData["biomarker number"] || '0'}</h4>
                  <button class="toggle-all-biomarkers" aria-expanded="false">Show all</button>
                </div>
              </div>
              <div class="biomarkers-list">
                ${Array.from(groupedBiomarkers.entries()).map(([group, biomarkers]) => `
                  <div class="biomarker-group">
                    <div class="group-header">
                      <h4>${group}</h4>
                      <button class="toggle-biomarkers" aria-expanded="false">
                        <span class="toggle-icon">▼</span>
                      </button>
                    </div>
                    <ul class="biomarker-items hidden">
                      ${biomarkers.map(biomarker => `
                        <li>${biomarker}</li>
                      `).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${showDetails ? `
            <div class="test-locations">
              <h4>Available at:</h4>
              <ul>
                ${testData["blood test location"].map(location => `<li>${location}</li>`).join('')}
              </ul>
            </div>
            <div class="test-results">
              <p>Results in ${testData["Days till results returned"]} days</p>
            </div>
            <button class="toggle-details" aria-expanded="false">Details</button>
            <div class="additional-details hidden">
              <div class="detail-section">
                <h4>Pricing Information</h4>
                <p>${testData["pricing information"]}</p>
              </div>
              <div class="detail-section">
                <h4>Doctor's Report</h4>
                <p>${testData["doctors report"] === "Yes" ? "Includes a doctor's report" : "No doctor's report included"}</p>
              </div>
              <div class="detail-section">
                <h4>Lab Accreditations</h4>
                <ul>
                  ${testData["lab accreditations"].map(accreditation => `<li>${accreditation}</li>`).join('')}
                </ul>
              </div>
              <div class="detail-section">
                <h4>Trustpilot Score</h4>
                <p>${testData["trust pilot score"]}/5</p>
              </div>
              <div class="detail-section">
                <h4>Learn More</h4>
                <a href="${testData.link}" target="_blank" class="provider-link">Visit ${testData.provider} website</a>
              </div>
            </div>
          ` : ''}
        </div>
        <button class="add-to-basket" data-test-id="${testData.test_name}">Add to Basket</button>
      </div>
    `;
  }

  async getGroupedBiomarkers(biomarkers) {
    try {
      // Ensure biomarkers is an array
      const biomarkerArray = Array.isArray(biomarkers) ? biomarkers : [];
      
      // Try to fetch the groupings, but don't fail if it doesn't exist
      let groupings = [];
      try {
        const response = await fetch('/data/biomarker-groupings.json');
        if (response.ok) {
          groupings = await response.json();
        }
      } catch (error) {
        console.warn('Could not load biomarker groupings, using default grouping');
        // Use a simple default grouping if the file can't be loaded
        groupings = [
          { group: 'All Tests', biomarkers: biomarkerArray }
        ];
      }
      
      const grouped = new Map();
      biomarkerArray.forEach(biomarker => {
        let found = false;
        for (const group of groupings) {
          // Check both regular and advanced biomarkers
          const allBiomarkers = [
            ...(group.biomarkers || []),
            ...(group['advanced-biomarkers'] || [])
          ];
          
          if (allBiomarkers.some(b => b.toLowerCase() === biomarker.toLowerCase())) {
            if (!grouped.has(group.group)) {
              grouped.set(group.group, []);
            }
            grouped.get(group.group).push(biomarker);
            found = true;
            break;
          }
        }
        if (!found) {
          if (!grouped.has('Other')) {
            grouped.set('Other', []);
          }
          grouped.get('Other').push(biomarker);
        }
      });
      
      return grouped;
    } catch (error) {
      console.error('Error in getGroupedBiomarkers:', error);
      return new Map([['All Tests', Array.isArray(biomarkers) ? biomarkers : []]]);
    }
  }

  async createCards(tests, options = {}) {
    console.log('Creating cards...');
    // Sort tests by price
    const sortedTests = [...tests].sort((a, b) => a.price - b.price);
    
    // Create cards with ranking
    const cards = await Promise.all(
      sortedTests.map((test, index) => 
        this.createCard(test, { ...options, rank: index + 1 })
      )
    );
    
    return cards.join('');
  }

  setupCardEventHandlers(tests) {
    console.log('Setting up card event handlers...');
    
    // Remove any existing event listeners first
    $all('.biomarker-group').forEach(group => {
      const toggleButton = group.querySelector('.toggle-biomarkers');
      if (toggleButton) {
        const newButton = toggleButton.cloneNode(true);
        toggleButton.parentNode.replaceChild(newButton, toggleButton);
      }
    });
    
    // Add event listeners to the "Add to Basket" buttons
    $all('.add-to-basket').forEach(button => {
      button.addEventListener('click', (e) => {
        const testId = e.target.dataset.testId;
        const test = tests.find(t => t.test_name === testId);
        if (test) {
          // Dispatch a custom event that can be handled by the basket service
          const event = new CustomEvent('addToBasket', { detail: { test } });
          document.dispatchEvent(event);
        }
      });
    });

    // Add event listeners to individual group toggle buttons
    $all('.biomarker-group').forEach(group => {
      const toggleButton = group.querySelector('.toggle-biomarkers');
      const biomarkerItems = group.querySelector('.biomarker-items');
      
      if (!toggleButton || !biomarkerItems) {
        console.error('Missing elements in group:', {
          hasToggleButton: !!toggleButton,
          hasBiomarkerItems: !!biomarkerItems
        });
        return;
      }
      
      toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        biomarkerItems.classList.toggle('hidden');
        toggleButton.setAttribute('aria-expanded', !isExpanded);
        toggleButton.innerHTML = `<span class="toggle-icon">${isExpanded ? '▼' : '▲'}</span>`;
      });
    });

    // Add event listeners to the "Show all/Hide all" buttons
    $all('.toggle-all-biomarkers').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const biomarkersSection = e.target.closest('.biomarkers-section');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        // Toggle all biomarker items
        biomarkersSection.querySelectorAll('.biomarker-items').forEach(items => {
          items.classList.toggle('hidden', isExpanded);
        });
        
        // Update all toggle buttons
        biomarkersSection.querySelectorAll('.toggle-biomarkers').forEach(toggle => {
          toggle.setAttribute('aria-expanded', !isExpanded);
          toggle.innerHTML = `<span class="toggle-icon">${isExpanded ? '▼' : '▲'}</span>`;
        });
        
        // Update the "Show all" button
        button.setAttribute('aria-expanded', !isExpanded);
        button.textContent = isExpanded ? 'Show all' : 'Hide all';
      });
    });

    // Add event listeners to the details toggle buttons
    $all('.toggle-details').forEach(button => {
      button.addEventListener('click', (e) => {
        const detailsSection = e.target.closest('.test-details').querySelector('.additional-details');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        detailsSection.classList.toggle('hidden');
        button.setAttribute('aria-expanded', !isExpanded);
        button.textContent = isExpanded ? 'Details' : 'Hide details';
      });
    });
  }
} 