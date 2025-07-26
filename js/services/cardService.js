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
      <div class="product-card blood-test-card ${options.isSelected ? 'selected' : ''}" data-test-id="${test.name}">
        ${showRank ? `<div class="test-rank">${options.rank}</div>` : ''}
        <div class="test-header">
          <div class="provider-info">
            <img src="images/logos/${providerLogo}" alt="${providerName} logo" class="provider-logo">
          </div>
          <h3 class="test-name">${test.name}</h3>
        </div>
        <div class="provider-mini-title">${providerName}:</div>
        <div class="trustpilot-score">
          ${(() => {
            const score = Number(test.trustpilot_score);
            if (isNaN(score)) return '<span>Not available</span>';
            const fullStars = Math.floor(score);
            const halfStar = score - fullStars >= 0.5 ? 1 : 0;
            const emptyStars = 5 - fullStars - halfStar;
            let stars = '';
            for (let i = 0; i < fullStars; i++) stars += '★';
            if (halfStar) stars += '⯨';
            for (let i = 0; i < emptyStars; i++) stars += '☆';
            return `<span title="Trustpilot score: ${score.toFixed(2)}">${stars}</span>`;
          })()}
        </div>
        <div class="test-price">£${test.price}</div>
        <p>"${test.description}"</p>
        <div class="test-locations">
          <div style="margin-bottom: 0.7em;"><span style="color: #333; font-size: 0.9rem;">• Results returned in ${(() => {
            if (test.results_returned_time_days) {
              return test.results_returned_time_days + ' days';
            } else if (test.results_returned_time_min && test.results_returned_time_max) {
              return test.results_returned_time_min + ' - ' + test.results_returned_time_max + ' days';
            } else {
              return 'N/A days';
            }
          })()}</span>
          </div>
          <div style="margin-bottom: 0.7em;"><span style="color: #333; font-size: 0.9rem;">• Doctors report</span> ${test.doctors_report ? '✅' : '❌'}</div>
          <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.5em;">
            <span style="margin: 0; color: #333; font-size: 0.9rem;">• Blood taking method:</span>
            <div style="display: flex; align-items: center; gap: 0.3em; margin-left: 1.5em;">
              ${Array.isArray(test.blood_taking_methods) && test.blood_taking_methods.length > 0
                ? test.blood_taking_methods.map(method => {
                    const emojiMap = {
                      'Home test': '🏠',
                      'Clinic visit': '🏥',
                      'Phlebotomist to home': '👩🏼‍⚕️',
                      'Self arrange': '🙋🏼'
                    };
                    const hoverText = method === 'Home test' ? 'Home test/finger prick blood test' : 
                                     method === 'Clinic visit' ? 'Clinic visit/full venous blood test' : 
                                     method;
                    return `<span style=\"font-size:1.3em;\" title=\"${hoverText}\">${emojiMap[method] || method}</span>`;
                  }).join('')
                : '<span>Not specified</span>'}
            </div>
          </div>
        </div>
        ${showBiomarkers ? `
          <div style="background-color: #E8F4FD; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 4rem;">
            <div class="biomarkers-section">
              <div class="biomarkers-header" style="text-align: center;">
                <div class="biomarker-info" style="text-align: center; display: flex; justify-content: center;">
                  <h4 class="toggle-all-biomarkers" aria-expanded="false" style="color: #2d3748; margin: 0; text-decoration: underline; cursor: pointer; user-select: none; outline: none; border: none; background: none; padding: 0;">${biomarkerCount} biomarkers tested</h4>
                </div>
              </div>
              <div class="biomarkers-list">
                ${Object.entries(test.grouped_biomarkers || {}).map(([group, biomarkers]) => `
                  <div class="biomarker-group">
                    <div class="group-header" style="background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <h4 style="color: #333; margin: 0;">${group}</h4>
                      <button class="toggle-biomarkers" aria-expanded="false" style="color: #333; background: transparent; border: none; font-size: 1rem;">
                        <span class="toggle-icon">▼</span>
                      </button>
                    </div>
                    <ul class="biomarker-items hidden" style="color: #333;">
                      ${biomarkers.map(biomarker => `
                        <li style="color: #333; padding-left: 1.5rem;">${biomarker}</li>
                      `).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : '<div style="margin-bottom: 4rem;"></div>'}
        <div class="add-to-compare-container">
          <input type="checkbox" class="add-to-compare-checkbox" id="add-to-compare-${encodeURIComponent(test.name)}" />
          <label for="add-to-compare-${encodeURIComponent(test.name)}" class="add-to-compare-label" style="margin-left: 0.5rem; font-size: 0.95rem; color: #222; cursor: pointer;">Add to\ncompare</label>
        </div>
        ${showDetails ? `
          <a class="book-test-btn" href="${test.url || '#'}" target="_blank" rel="noopener noreferrer" data-test-id="${test.name}" style="position: absolute; bottom: 1rem; right: 1rem; background-color: #1E88E5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; font-weight: 600; text-align: center; transition: background-color 0.2s; z-index: 10;">Book test</a>
        ` : ''}
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

    // Add event listeners to "Add to compare" checkboxes
    const checkboxes = $all('.add-to-compare-checkbox');
    console.log('Found checkboxes:', checkboxes.length);
    
    // Get current comparison tests from localStorage
    let comparisonTests = [];
    try {
      comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
    } catch (e) { comparisonTests = []; }

    checkboxes.forEach(checkbox => {
      // Set checked state if this test is in comparisonTests
      const testId = checkbox.id.replace('add-to-compare-', '');
      const decodedTestName = decodeURIComponent(testId);
      if (comparisonTests.find(t => t.name === decodedTestName)) {
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
      }
      // Attach event listener
      checkbox.addEventListener('change', (e) => {
        const testId = e.target.id.replace('add-to-compare-', '');
        const decodedTestName = decodeURIComponent(testId);
        const test = tests.find(t => t.name === decodedTestName);
        
        console.log('Checkbox changed:', {
          testId,
          decodedTestName,
          foundTest: test,
          checked: e.target.checked
        });
        
        if (test) {
          if (e.target.checked) {
            // Add to comparison
            CardService.addTestToComparison(test);
          } else {
            // Remove from comparison
            CardService.removeTestFromComparison(test);
          }
        } else {
          console.error('Test not found for:', decodedTestName);
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

  // Static comparison methods
  static async addTestToComparison(test) {
    console.log('addTestToComparison called with:', test);
    let comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
    
    // Check if test is already in comparison
    if (!comparisonTests.find(t => t.name === test.name)) {
      comparisonTests.push(test);
      
      // Keep only the first 3 tests
      if (comparisonTests.length > 3) {
        comparisonTests = comparisonTests.slice(-3);
      }
      
      localStorage.setItem('comparisonTests', JSON.stringify(comparisonTests));
      console.log('Added test to comparison:', test.name);
      console.log('Current comparison tests:', comparisonTests);
      
      // Update comparison page if we're on it
      if (window.location.hash === '#/compare') {
        await CardService.updateComparisonGrid();
      }
      // Dispatch event for UI update
      window.dispatchEvent(new Event('comparisonTestsUpdated'));
    } else {
      console.log('Test already in comparison:', test.name);
    }
  }

  static async removeTestFromComparison(test) {
    let comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
    comparisonTests = comparisonTests.filter(t => t.name !== test.name);
    localStorage.setItem('comparisonTests', JSON.stringify(comparisonTests));
    console.log('Removed test from comparison:', test.name);
    
    // Update comparison page if we're on it
    if (window.location.hash === '#/compare') {
      await CardService.updateComparisonGrid();
    }
    // Dispatch event for UI update
    window.dispatchEvent(new Event('comparisonTestsUpdated'));
  }

  static async updateComparisonGrid() {
    const comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
    
    for (let i = 1; i <= 3; i++) {
      const test = comparisonTests[i - 1];
      
      if (test) {
        // Update test name
        const testNameCell = document.getElementById(`test-name-${i}`);
        if (testNameCell) {
          testNameCell.textContent = test.name;
        }
        
        // Update provider info
        const providerCell = document.getElementById(`provider-info-${i}`);
        if (providerCell) {
          const providerName = (test.provider?.name || test.provider || '').trim();
          let providerLogo = 'medichecks.png'; // Default logo
          if (providerName) {
            const normalized = providerName.toLowerCase().replace(/ |-/g, '');
            providerLogo = `${normalized}.png`;
          }
          
          const trustpilotData = (() => {
            const score = Number(test.trustpilot_score);
            if (isNaN(score)) return { stars: 'Not available', rating: 'N/A' };
            const fullStars = Math.floor(score);
            const halfStar = score - fullStars >= 0.5 ? 1 : 0;
            const emptyStars = 5 - fullStars - halfStar;
            let stars = '';
            for (let j = 0; j < fullStars; j++) stars += '★';
            if (halfStar) stars += '⯨';
            for (let j = 0; j < emptyStars; j++) stars += '☆';
            return { stars: stars, rating: score.toFixed(1) };
          })();
          
          providerCell.innerHTML = `
            <div class="provider-info">
              <div class="provider-header">
                <img src="images/logos/${providerLogo}" alt="${providerName} logo" class="provider-logo">
                <div class="provider-name">${providerName}</div>
              </div>
              <div class="trustpilot-row">
                <span class="trustpilot-label">Trustpilot score:</span>
                <span class="trustpilot-stars">${trustpilotData.stars}</span>
                <span class="trustpilot-rating">(${trustpilotData.rating})</span>
              </div>
            </div>
          `;
        }
        
        // Update price
        const priceCell = document.getElementById(`price-${i}`);
        if (priceCell) {
          priceCell.textContent = `£${test.price}`;
        }
        
        // Update description
        const descriptionCell = document.getElementById(`description-${i}`);
        if (descriptionCell) {
          descriptionCell.textContent = `"${test.description}"`;
        }
        
        // Update practical details
        const practicalCell = document.getElementById(`practical-${i}`);
        if (practicalCell) {
          const resultsText = (() => {
            if (test.results_returned_time_days) {
              return test.results_returned_time_days + ' days';
            } else if (test.results_returned_time_min && test.results_returned_time_max) {
              return test.results_returned_time_min + ' - ' + test.results_returned_time_max + ' days';
            } else {
              return 'N/A days';
            }
          })();
          
          practicalCell.innerHTML = `
            <div class="practical-details">
              <div class="detail-item">Results returned in ${resultsText}</div>
              <div class="detail-item">Doctors report: ${test.doctors_report ? '✅' : '❌'}</div>
            </div>
          `;
        }
        
        // Update blood method
        const bloodMethodCell = document.getElementById(`blood-method-${i}`);
        if (bloodMethodCell) {
          const bloodMethod = Array.isArray(test.blood_taking_methods) && test.blood_taking_methods.length > 0
            ? test.blood_taking_methods.map(method => {
                const emojiMap = {
                  'Home test': '🏠',
                  'Clinic visit': '🏥',
                  'Phlebotomist to home': '👩🏼‍⚕️',
                  'Self arrange': '🙋🏼'
                };
                
                const displayTextMap = {
                  'Home test': 'Home test/ finger prick',
                  'Clinic visit': 'Clinic visit full venous test',
                  'Phlebotomist to home': 'Phlebotomist to home',
                  'Self arrange': 'Self arrange'
                };
                return `${emojiMap[method] || '❓'} ${displayTextMap[method] || method}`;
              }).join('<br>')
            : 'Not specified';
          bloodMethodCell.innerHTML = bloodMethod;
        }
        
        // Update biomarkers
        const biomarkersCell = document.getElementById(`biomarkers-${i}`);
        if (biomarkersCell) {
          const biomarkerContent = biomarkersCell.querySelector('.biomarker-content');
          if (biomarkerContent) {
            biomarkerContent.innerHTML = await CardService.generateBiomarkerHTML(test);
          }
        }
      } else {
        // Reset to placeholder
        CardService.resetGridCell(i);
      }
    }
  }

  static async generateBiomarkerHTML(test) {
    if (!test || !test.grouped_biomarkers) {
      return '<div class="no-biomarkers">No biomarkers available</div>';
    }

    let html = '';

    // Get all unique biomarker names from all tests to create a complete list
    const allBiomarkers = new Set();
    const allGroups = new Set();
    
    // Collect all biomarkers and groups from the current test
    Object.entries(test.grouped_biomarkers).forEach(([group, biomarkers]) => {
      allGroups.add(group);
      biomarkers.forEach(biomarker => allBiomarkers.add(biomarker));
    });

    // Sort groups alphabetically
    const sortedGroups = Array.from(allGroups).sort();

    for (const groupName of sortedGroups) {
      const testBiomarkers = test.grouped_biomarkers[groupName] || [];
      
      if (testBiomarkers.length > 0) {
        html += `<div class="biomarker-grouping">
          <div class="grouping-header">${groupName}</div>
          <div class="grouping-biomarkers">`;
        
        // Sort biomarkers alphabetically within each group
        const sortedBiomarkers = testBiomarkers.sort();
        
        for (const biomarker of sortedBiomarkers) {
          html += `<div class="biomarker-item">
            <span class="biomarker-name">${biomarker}</span>
            <span class="biomarker-status">✓</span>
          </div>`;
        }
        
        html += `</div></div>`;
      }
    }

    return html || '<div class="no-biomarkers">No biomarkers available</div>';
  }

  static async updateComparisonGrid() {
    let comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
    
    // Sort tests by price (cheapest first)
    comparisonTests.sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      return priceA - priceB;
    });
    
    // First, collect all unique biomarker groups from all tests
    const allGroups = new Set();
    comparisonTests.forEach(test => {
      if (test && test.grouped_biomarkers) {
        Object.keys(test.grouped_biomarkers).forEach(group => allGroups.add(group));
      }
    });
    const sortedGroups = Array.from(allGroups).sort();
    
    for (let i = 1; i <= 3; i++) {
      const test = comparisonTests[i - 1];
      
      if (test) {
        // Update test name
        const testNameCell = document.getElementById(`test-name-${i}`);
        if (testNameCell) {
          testNameCell.textContent = test.name;
        }
        
        // Update provider info
        const providerCell = document.getElementById(`provider-info-${i}`);
        if (providerCell) {
          const providerName = (test.provider?.name || test.provider || '').trim();
          let providerLogo = 'medichecks.png'; // Default logo
          if (providerName) {
            const normalized = providerName.toLowerCase().replace(/ |-/g, '');
            providerLogo = `${normalized}.png`;
          }
          
          const trustpilotData = (() => {
            const score = Number(test.trustpilot_score);
            if (isNaN(score)) return { stars: 'Not available', rating: 'N/A' };
            const fullStars = Math.floor(score);
            const halfStar = score - fullStars >= 0.5 ? 1 : 0;
            const emptyStars = 5 - fullStars - halfStar;
            let stars = '';
            for (let j = 0; j < fullStars; j++) stars += '★';
            if (halfStar) stars += '⯨';
            for (let j = 0; j < emptyStars; j++) stars += '☆';
            return { stars: stars, rating: score.toFixed(1) };
          })();
          
          providerCell.innerHTML = `
            <div class="provider-info">
              <div class="provider-header">
                <img src="images/logos/${providerLogo}" alt="${providerName} logo" class="provider-logo">
                <div class="provider-name">${providerName}</div>
              </div>
              <div class="trustpilot-row">
                <span class="trustpilot-label">Trustpilot score:</span>
                <span class="trustpilot-stars">${trustpilotData.stars}</span>
                <span class="trustpilot-rating">(${trustpilotData.rating})</span>
              </div>
            </div>
          `;
        }
        
        // Update price
        const priceCell = document.getElementById(`price-${i}`);
        if (priceCell) {
          priceCell.textContent = `£${test.price}`;
        }
        
        // Update description
        const descriptionCell = document.getElementById(`description-${i}`);
        if (descriptionCell) {
          descriptionCell.textContent = `"${test.description}"`;
        }
        
        // Update practical details
        const practicalCell = document.getElementById(`practical-${i}`);
        if (practicalCell) {
          const resultsText = (() => {
            if (test.results_returned_time_days) {
              return test.results_returned_time_days + ' days';
            } else if (test.results_returned_time_min && test.results_returned_time_max) {
              return test.results_returned_time_min + ' - ' + test.results_returned_time_max + ' days';
            } else {
              return 'N/A days';
            }
          })();
          
          practicalCell.innerHTML = `
            <div class="practical-details">
              <div class="detail-item">Results returned in ${resultsText}</div>
              <div class="detail-item">Doctors report: ${test.doctors_report ? '✅' : '❌'}</div>
            </div>
          `;
        }
        
        // Update blood method
        const bloodMethodCell = document.getElementById(`blood-method-${i}`);
        if (bloodMethodCell) {
          const bloodMethod = Array.isArray(test.blood_taking_methods) && test.blood_taking_methods.length > 0
            ? test.blood_taking_methods.map(method => {
                const emojiMap = {
                  'Home test': '🏠',
                  'Clinic visit': '🏥',
                  'Phlebotomist to home': '👩🏼‍⚕️',
                  'Self arrange': '🙋🏼'
                };
                
                const displayTextMap = {
                  'Home test': 'Home test/ finger prick',
                  'Clinic visit': 'Clinic visit full venous test',
                  'Phlebotomist to home': 'Phlebotomist to home',
                  'Self arrange': 'Self arrange'
                };
                return `${emojiMap[method] || '❓'} ${displayTextMap[method] || method}`;
              }).join('<br>')
            : 'Not specified';
          bloodMethodCell.innerHTML = bloodMethod;
        }
        
        // Update biomarkers with aligned structure
        const biomarkersCell = document.getElementById(`biomarkers-${i}`);
        if (biomarkersCell) {
          const biomarkerContent = biomarkersCell.querySelector('.biomarker-content');
          if (biomarkerContent) {
            biomarkerContent.innerHTML = await CardService.generateAlignedBiomarkerHTML(test, sortedGroups);
          }
        }
      } else {
        // Reset to placeholder
        CardService.resetGridCell(i);
      }
    }
  }

  static async generateAlignedBiomarkerHTML(test, allGroups) {
    if (!test || !test.grouped_biomarkers) {
      return '<div class="no-biomarkers">No biomarkers available</div>';
    }

    let html = '';

    for (const groupName of allGroups) {
      const testBiomarkers = test.grouped_biomarkers[groupName] || [];
      
      html += `<div class="biomarker-grouping">
        <div class="grouping-header">${groupName}</div>
        <div class="grouping-biomarkers">`;
      
      if (testBiomarkers.length > 0) {
        // Sort biomarkers alphabetically within each group
        const sortedBiomarkers = testBiomarkers.sort();
        
        for (const biomarker of sortedBiomarkers) {
          html += `<div class="biomarker-item">
            <span class="biomarker-name">${biomarker}</span>
            <span class="biomarker-status">✓</span>
          </div>`;
        }
      } else {
        // Show individual dashes for each missing biomarker position
        // We need to get the total count of biomarkers in this group from all tests
        const totalBiomarkersInGroup = await CardService.getTotalBiomarkersInGroup(groupName);
        
        for (let i = 0; i < totalBiomarkersInGroup; i++) {
          html += `<div class="biomarker-item empty">
            <span class="biomarker-name">-</span>
          </div>`;
        }
      }
      
      html += `</div></div>`;
    }

    return html || '<div class="no-biomarkers">No biomarkers available</div>';
  }

  static async getTotalBiomarkersInGroup(groupName) {
    // Get all comparison tests to count total biomarkers in this group
    const comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
    const allBiomarkersInGroup = new Set();
    
    comparisonTests.forEach(test => {
      if (test && test.grouped_biomarkers && test.grouped_biomarkers[groupName]) {
        test.grouped_biomarkers[groupName].forEach(biomarker => {
          allBiomarkersInGroup.add(biomarker);
        });
      }
    });
    
    return allBiomarkersInGroup.size;
  }

  static resetGridCell(index) {
    // Reset test name
    const testNameCell = document.getElementById(`test-name-${index}`);
    if (testNameCell) {
      testNameCell.textContent = 'Select a test to compare';
    }
    
    // Reset provider info
    const providerCell = document.getElementById(`provider-info-${index}`);
    if (providerCell) {
      providerCell.innerHTML = `
        <div class="provider-info">
          <div class="provider-header">
            <div class="provider-logo-placeholder">Logo</div>
            <div class="provider-name">Provider</div>
          </div>
          <div class="trustpilot-row">
            <span class="trustpilot-label">Trustpilot score:</span>
            <span class="trustpilot-stars">★★★★☆</span>
            <span class="trustpilot-rating">(4.0)</span>
          </div>
        </div>
      `;
    }
    
    // Reset price
    const priceCell = document.getElementById(`price-${index}`);
    if (priceCell) {
      priceCell.textContent = 'Price';
    }
    
    // Reset description
    const descriptionCell = document.getElementById(`description-${index}`);
    if (descriptionCell) {
      descriptionCell.textContent = 'Description';
    }
    
    // Reset practical details
    const practicalCell = document.getElementById(`practical-${index}`);
    if (practicalCell) {
      practicalCell.innerHTML = `
        <div class="practical-details">
          <div class="detail-item">Results returned</div>
          <div class="detail-item">Doctors report</div>
        </div>
      `;
    }
    
    // Reset blood method
    const bloodMethodCell = document.getElementById(`blood-method-${index}`);
    if (bloodMethodCell) {
      bloodMethodCell.textContent = 'Method';
    }
    
    // Reset biomarkers
    const biomarkersCell = document.getElementById(`biomarkers-${index}`);
    if (biomarkersCell) {
      const biomarkerContent = biomarkersCell.querySelector('.biomarker-content');
      if (biomarkerContent) {
        biomarkerContent.innerHTML = 'Count';
      }
    }
  }
}

// Make updateComparisonGrid available globally
window.updateComparisonGrid = async () => {
  await CardService.updateComparisonGrid();
}; 