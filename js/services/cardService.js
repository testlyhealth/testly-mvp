import { getGroupedBiomarkers } from '../utils/biomarkerUtils.js';
import { $all } from '../dom.js';
import { getUrl } from '../config.js';

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
      'Forth': 'forth.png',
      'Nuffield Health': 'nuffield.png',
      'Lloyds Pharmacy': 'lloyds pharmacy.png',
      'Selph': 'selph.png',
      'Lola': 'lola.png',
      'Randox': 'randox.png'
    };
  }

  async createCard(test, options = {}) {
    const {
      showRank = false,
      showBiomarkers = true,
      showDetails = true
    } = options;

    // Get the provider name (handle both string and object)
    const providerName = (test.provider?.name || test.provider || '').trim();
    let providerLogo = this.providerLogoMap[providerName];
    if (!providerLogo) {
      const normalized = providerName.toLowerCase().replace(/ |-/g, '');
      providerLogo = `${normalized}.png`;
    }
    // Group biomarkers by group name from Supabase structure
    const groupMap = new Map();
    if (Array.isArray(test.test_biomarkers)) {
      test.test_biomarkers.forEach(link => {
        const biomarker = link.biomarker;
        if (!biomarker) return;
        // Each biomarker may have multiple group_links
        if (Array.isArray(biomarker.group_links) && biomarker.group_links.length > 0) {
          biomarker.group_links.forEach(gl => {
            const groupName = gl.grouping?.name || 'Other';
            if (!groupMap.has(groupName)) groupMap.set(groupName, []);
            groupMap.get(groupName).push(biomarker.name);
          });
        } else {
          // No group, put in 'Other'
          if (!groupMap.has('Other')) groupMap.set('Other', []);
          groupMap.get('Other').push(biomarker.name);
        }
      });
    }
    // Defensive: ensure these are arrays
    const bloodTestLocations = Array.isArray(test["blood test location"]) ? test["blood test location"] : [];
    const labAccreditations = Array.isArray(test["lab accreditations"]) ? test["lab accreditations"] : [];

    // Debug log for grouped_biomarkers (only if there are issues)
    if (!test.grouped_biomarkers || Object.keys(test.grouped_biomarkers).length === 0) {
      console.log('WARNING: No grouped biomarkers for', test.name);
    }
    const biomarkerCount = test.biomarker_count || 0;

    // Remove duplicate biomarkers across groups (show in first group only)
    if (test.grouped_biomarkers && typeof test.grouped_biomarkers === 'object') {
      const seen = new Set();
      for (const group of Object.keys(test.grouped_biomarkers)) {
        test.grouped_biomarkers[group] = test.grouped_biomarkers[group].filter(b => {
          if (seen.has(b)) return false;
          seen.add(b);
          return true;
        });
      }
      // Remove groups with zero biomarkers
      for (const group of Object.keys(test.grouped_biomarkers)) {
        if (test.grouped_biomarkers[group].length === 0) {
          delete test.grouped_biomarkers[group];
        }
      }
    }

    return `
      <div class="product-card blood-test-card" data-test-id="${test.name}">
        ${showRank ? `<div class="test-rank">${options.rank}</div>` : ''}
        <div class="test-header">
          <div class="provider-info">
            <img src="images/logos/${providerLogo}" alt="${providerName} logo" class="provider-logo">
          </div>
          <h3 class="test-name"><span class="provider-name">${providerName}</span> - ${test.name}</h3>
        </div>
        <p>${test.description}</p>
        <div class="test-details">
          <div class="test-price">£${test.price}</div>
          ${showBiomarkers ? `
            <div class="biomarkers-section">
              <div class="biomarkers-header">
                <div class="biomarker-info">
                  <h4>Biomarkers tested: <span class="keycap-number">${(() => {
                    const toKeyCap = n => String(n).split('').map(d => {
                      const map = {'0':'0️⃣','1':'1️⃣','2':'2️⃣','3':'3️⃣','4':'4️⃣','5':'5️⃣','6':'6️⃣','7':'7️⃣','8':'8️⃣','9':'9️⃣'};
                      return map[d] || d;
                    }).join('');
                    return toKeyCap(biomarkerCount);
                  })()}</span></h4>
                  <button class="toggle-all-biomarkers" aria-expanded="false">Show all</button>
                </div>
              </div>
              <div class="biomarkers-list">
                ${Object.entries(test.grouped_biomarkers || {}).map(([group, biomarkers]) => `
                  <div class="biomarker-group">
                    <div class="group-header">
                      <h4>${group} (${biomarkers.length} tests)</h4>
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
              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.5em;">
                <h4 style="margin: 0; font-weight: bold;">Blood taking method:</h4>
                <div style="display: flex; align-items: center; gap: 0.3em; margin-left: 0.5em;">
                  ${Array.isArray(test.blood_taking_methods) && test.blood_taking_methods.length > 0
                    ? test.blood_taking_methods.map(method => {
                        const emojiMap = {
                          'Home test': '🏠',
                          'Clinic visit': '🏥',
                          'Phlebotomist to home': '🧑🏼‍⚕️',
                          'Self arrange': '🙋🏼'
                        };
                        return `<span style=\"font-size:1.3em;\" title=\"${method}\">${emojiMap[method] || method}</span>`;
                      }).join('')
                    : '<span>Not specified</span>'}
                </div>
              </div>
              <div style="margin-top: 0.7em;"><span style="font-weight:bold;">Results returned in:</span> ${(() => {
                const toKeyCap = n => String(n).split('').map(d => {
                  const map = {'0':'0️⃣','1':'1️⃣','2':'2️⃣','3':'3️⃣','4':'4️⃣','5':'5️⃣','6':'6️⃣','7':'7️⃣','8':'8️⃣','9':'9️⃣'};
                  return map[d] || d;
                }).join('');
                if (test.results_returned_time_days) {
                  return toKeyCap(test.results_returned_time_days) + ' days';
                } else if (test.results_returned_time_min && test.results_returned_time_max) {
                  return toKeyCap(test.results_returned_time_min) + ' - ' + toKeyCap(test.results_returned_time_max) + ' days';
                } else {
                  return 'N/A days';
                }
              })()}
              </div>
              <div style="margin-top: 1em;"><span style="font-weight:bold;">Doctors report:</span> ${test.doctors_report ? '✅' : '❌'}</div>
              <div style="margin-top: 1em;"><span style="font-weight:bold;">Trust pilot score:</span> ${(() => {
                const score = Number(test.trustpilot_score);
                if (isNaN(score)) return '<span>Not available</span>';
                const fullStars = Math.floor(score);
                const halfStar = score - fullStars >= 0.5 ? 1 : 0;
                const emptyStars = 5 - fullStars - halfStar;
                let stars = '';
                for (let i = 0; i < fullStars; i++) stars += '★';
                if (halfStar) stars += '⯨';
                for (let i = 0; i < emptyStars; i++) stars += '☆';
                return `<span title="${score.toFixed(2)}">${stars}</span>`;
              })()}
              </div>
            </div>
            <div class="card-actions">
              <a class="book-test-btn" href="${test.url || '#'}" target="_blank" rel="noopener noreferrer" data-test-id="${test.name}">Book test</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  async getGroupedBiomarkers(biomarkers) {
    try {
      // Ensure biomarkers is an array
      const biomarkerArray = Array.isArray(biomarkers) ? biomarkers : [];
      
      const response = await fetch(getUrl('data/biomarker-groupings.json'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      // Ensure we return a Map with an array of biomarkers
      const biomarkerArray = Array.isArray(biomarkers) ? biomarkers : [];
      return new Map([['All Tests', biomarkerArray]]);
    }
  }

  async createCards(tests, options = {}) {
    console.log('Creating cards...');
    // Use the order as passed in
    const cards = await Promise.all(
      tests.map((test, index) => 
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
        const test = tests.find(t => t.name === testId);
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
        // Do NOT swap the arrow character; let CSS handle rotation
      });
    });

    // Add event listeners to group headers so clicking the header also toggles the group and arrow
    $all('.biomarker-group .group-header').forEach(header => {
      header.addEventListener('click', (e) => {
        // Prevent double toggling if the button itself was clicked
        if (e.target.closest('.toggle-biomarkers')) return;
        const group = header.closest('.biomarker-group');
        const biomarkerItems = group.querySelector('.biomarker-items');
        const toggleButton = group.querySelector('.toggle-biomarkers');
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        biomarkerItems.classList.toggle('hidden');
        toggleButton.setAttribute('aria-expanded', !isExpanded);
        // Do NOT swap the arrow character; let CSS handle rotation
      });
    });

    // Add event listeners to the "Show all/Hide all" buttons
    $all('.toggle-all-biomarkers').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const biomarkersSection = e.target.closest('.biomarkers-section');
        const biomarkersList = biomarkersSection.querySelector('.biomarkers-list');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        // Toggle the biomarkers list visibility
        biomarkersList.classList.toggle('hidden');
        
        // Toggle all biomarker items and their toggle buttons
        biomarkersSection.querySelectorAll('.biomarker-group').forEach(group => {
          const items = group.querySelector('.biomarker-items');
          const toggle = group.querySelector('.toggle-biomarkers');
          
          if (items && toggle) {
            items.classList.toggle('hidden', isExpanded);
            toggle.setAttribute('aria-expanded', !isExpanded);
            // Do NOT swap the arrow character; let CSS handle rotation
          }
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