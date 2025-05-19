import { getGroupedBiomarkers } from '../utils/biomarkerUtils.js';
import { $all } from '../dom.js';
import { basket } from '../basket.js';
import { get } from '../utils/api.js';
import { resolvePath } from '../config.js';

export class CardService {
  constructor() {
    this.cards = new Map();
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

  async createCard(test, index) {
    try {
      const groupedBiomarkers = await this.getGroupedBiomarkers(test.biomarkers);
      const providerLogo = this.providerLogoMap[test.provider] || `${test.provider}.png`;
      const logoPath = resolvePath(`images/logos/${providerLogo}`);
      
      // Calculate total number of biomarkers
      const totalBiomarkers = test.biomarkers.length;
      
      return `
        <div class="product-card blood-test-card" data-test-id="${test.test_name}">
          <div class="test-rank">${index + 1}</div>
          <div class="test-header">
            <div class="provider-info">
              <img src="${logoPath}" alt="${test.provider} logo" class="provider-logo">
              <span class="provider-name">${test.provider}</span>
            </div>
            <h3 class="test-name">${test.test_name}</h3>
          </div>
          <p>${test.description}</p>
          <div class="test-details">
            <div class="test-price">£${test.price}</div>
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
                      ${group} (${tests.length} tests) ▶
                    </h5>
                    <ul class="biomarker-items hidden" style="padding-left: 20px;">
                      ${tests.map(test => `<li>${test}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="test-locations">
              <h4>Sample Type:</h4>
              <p>${test['blood test location'].join(', ')}</p>
            </div>
            <div class="test-results">
              <p>Results in ${test['Days till results returned']} days</p>
            </div>
            <button class="toggle-details" aria-expanded="false">Details</button>
            <div class="additional-details hidden">
              <div class="detail-section">
                <h4>Doctor's Report</h4>
                <p>${test['doctors report']}</p>
              </div>
              <div class="detail-section">
                <h4>Lab Accreditations</h4>
                <p>${test['lab accreditations'].join(', ')}</p>
              </div>
              <div class="detail-section">
                <h4>Learn More</h4>
                <a href="${test.link}" target="_blank" class="provider-link">Visit ${test.provider} website</a>
              </div>
            </div>
          </div>
          <button class="add-to-basket" data-test-id="${test.test_name}">Add to Basket</button>
        </div>
      `;
    } catch (error) {
      console.error('Error creating card:', error);
      return '';
    }
  }

  async getGroupedBiomarkers(biomarkers) {
    try {
      // Ensure biomarkers is an array
      const biomarkerArray = Array.isArray(biomarkers) ? biomarkers : [];
      
      const response = await fetch('/data/biomarker-groupings.json');
      const groupings = await response.json();
      
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
      console.error('Error loading biomarker groupings:', error);
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
        this.createCard(test, index)
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