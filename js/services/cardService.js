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
    // Use the already processed grouped biomarkers from the database
    // The data is already processed in fetchAndEnrichTests function
    // No need to reprocess here since test.grouped_biomarkers is already set
    // Defensive: ensure these are arrays
    const bloodTestLocations = Array.isArray(test["blood test location"]) ? test["blood test location"] : [];
    const labAccreditations = Array.isArray(test["lab accreditations"]) ? test["lab accreditations"] : [];

    // Debug log for grouped_biomarkers (only if there are issues)
    if (!test.grouped_biomarkers || Object.keys(test.grouped_biomarkers).length === 0) {
      console.log('WARNING: No grouped biomarkers for', test.name);
    }
    
    // Calculate biomarker count from grouped_biomarkers if not already set
    let biomarkerCount = test.biomarker_count || 0;
    if (biomarkerCount === 0 && test.grouped_biomarkers) {
      biomarkerCount = Object.values(test.grouped_biomarkers).reduce((total, group) => total + group.length, 0);
    }

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
        ${test.best_options ? `<div class="best-option-badge">${test.best_options}</div>` : ''}
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
                              <div style="margin-bottom: 0.7em;"><span class="blood-method-label" style="color: #333;">• Results returned in ${(() => {
            if (test.results_returned_time_days) {
              return test.results_returned_time_days + ' days';
            } else if (test.results_returned_time_min && test.results_returned_time_max) {
              return test.results_returned_time_min + ' - ' + test.results_returned_time_max + ' days';
            } else {
              return 'N/A days';
            }
          })()}</span>
          </div>
                              <div style="margin-bottom: 0.7em;"><span class="blood-method-label" style="color: #333;">• Doctors report</span> ${test.doctors_report ? '✅' : '❌'}</div>
        </div>
        ${showBiomarkers ? `
          <div style="background-color: #E8F4FD; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; margin-bottom: 0.5rem;">
            <div style="text-align: left; color: #2d3748; font-size: 0.8rem; line-height: 1.4;">
              <div style="font-weight: 600;">${biomarkerCount} biomarkers tested</div>
              <div style="font-size: 0.75rem; color: #666; font-style: italic; margin-top: 0.2rem;">
                (covering ${Object.keys(test.grouped_biomarkers || {}).join(', ')})
              </div>
            </div>
          </div>
          ${showDetails ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem; margin-bottom: 0.5rem; padding-right: 1rem;">
              <div class="add-to-compare-container" style="margin: 0;">
                <input type="checkbox" class="add-to-compare-checkbox" id="add-to-compare-${encodeURIComponent(test.name)}" />
                <label for="add-to-compare-${encodeURIComponent(test.name)}" class="add-to-compare-label" style="margin-left: 0.5rem; font-size: 0.95rem; color: #222; cursor: pointer;">Add to compare</label>
              </div>
              <div style="color: #1E88E5; font-size: 0.9rem; font-weight: 500; cursor: pointer; white-space: nowrap;">Learn more>></div>
            </div>
          ` : ''}
        ` : '<div style="margin-bottom: 0.5rem;"></div>'}
        ${showDetails ? `
          <a class="book-test-btn" href="${test.url || '#'}" target="_blank" rel="noopener noreferrer" data-test-id="${test.name}" style="position: absolute; top: 6rem; right: 1rem; background-color: white; color: #1E88E5; border: 2px solid #1E88E5; padding: 0.5rem 1rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; font-weight: 600; text-align: center; transition: background-color 0.2s; z-index: 10;">Book test</a>
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
    console.log('Tests passed to setupCardEventHandlers:', tests.length);
    
    // Log what elements we find
    const biomarkerGroups = $all('.biomarker-group');
    const toggleAllButtons = $all('.toggle-all-biomarkers');
    const groupHeaders = $all('.biomarker-group .group-header');
    
    console.log('Found elements:', {
      biomarkerGroups: biomarkerGroups.length,
      toggleAllButtons: toggleAllButtons.length,
      groupHeaders: groupHeaders.length
    });
    
    // Remove any existing event listeners first
    biomarkerGroups.forEach((group, index) => {
      const toggleButton = group.querySelector('.toggle-biomarkers');
      console.log(`Group ${index} cleanup:`, {
        group: group,
        hasToggleButton: !!toggleButton,
        toggleButtonText: toggleButton?.textContent
      });
      
      if (toggleButton) {
        const newButton = toggleButton.cloneNode(true);
        toggleButton.parentNode.replaceChild(newButton, toggleButton);
        console.log(`Group ${index} - replaced toggle button`);
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
          checked: e.target.checked,
          allTestNames: tests.map(t => t.name)
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
          console.error('Available tests:', tests.map(t => t.name));
        }
      });
    });

    // Add event listeners to individual group toggle buttons
    $all('.biomarker-group').forEach(group => {
      const toggleButton = group.querySelector('.toggle-biomarkers');
      const biomarkerItems = group.querySelector('.biomarker-items');
      
      console.log('Setting up biomarker group toggle:', {
        group: group,
        hasToggleButton: !!toggleButton,
        hasBiomarkerItems: !!biomarkerItems,
        toggleButtonText: toggleButton?.textContent,
        biomarkerItemsClasses: biomarkerItems?.className
      });
      
      if (!toggleButton || !biomarkerItems) {
        console.error('Missing elements in group:', {
          hasToggleButton: !!toggleButton,
          hasBiomarkerItems: !!biomarkerItems
        });
        return;
      }
      
      toggleButton.addEventListener('click', (e) => {
        console.log('Biomarker toggle button clicked:', {
          button: e.target,
          buttonText: e.target.textContent,
          isExpanded: toggleButton.getAttribute('aria-expanded') === 'true',
          biomarkerItemsClasses: biomarkerItems.className
        });
        
        e.preventDefault();
        e.stopPropagation();
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        biomarkerItems.classList.toggle('hidden');
        toggleButton.setAttribute('aria-expanded', !isExpanded);
        
        console.log('After toggle:', {
          isExpanded: toggleButton.getAttribute('aria-expanded'),
          biomarkerItemsClasses: biomarkerItems.className,
          biomarkerItemsHidden: biomarkerItems.classList.contains('hidden')
        });
        
        // Do NOT swap the arrow character; let CSS handle rotation
      });
    });

    // Add event listeners to group headers so clicking the header also toggles the group and arrow
    console.log('=== SETTING UP BIOMARKER GROUP HEADERS ===');
    const headers = $all('.biomarker-group .group-header');
    console.log('Found headers:', headers.length);
    
    headers.forEach((header, index) => {
      console.log(`Header ${index}:`, {
        header: header,
        headerText: header.textContent,
        headerHTML: header.outerHTML.substring(0, 200) + '...'
      });
      
      header.addEventListener('click', (e) => {
        console.log('=== HEADER CLICK EVENT ===');
        console.log('Event target:', e.target);
        console.log('Event currentTarget:', e.currentTarget);
        console.log('Event type:', e.type);
        console.log('Event bubbles:', e.bubbles);
        
        console.log('Group header clicked:', {
          header: e.target,
          headerText: e.target.textContent,
          clickedElement: e.target,
          isToggleButton: e.target.closest('.toggle-biomarkers'),
          toggleButtonFound: !!e.target.closest('.toggle-biomarkers')
        });
        
        // Prevent double toggling if the button itself was clicked
        if (e.target.closest('.toggle-biomarkers')) {
          console.log('Skipping header click - toggle button was clicked');
          return;
        }
        
        const group = header.closest('.biomarker-group');
        const biomarkerItems = group.querySelector('.biomarker-items');
        const toggleButton = group.querySelector('.toggle-biomarkers');
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        
        console.log('Elements found:', {
          group: group,
          groupHTML: group?.outerHTML.substring(0, 200) + '...',
          hasBiomarkerItems: !!biomarkerItems,
          biomarkerItems: biomarkerItems,
          biomarkerItemsHTML: biomarkerItems?.outerHTML.substring(0, 200) + '...',
          hasToggleButton: !!toggleButton,
          toggleButton: toggleButton,
          toggleButtonHTML: toggleButton?.outerHTML.substring(0, 200) + '...',
          isExpanded: isExpanded,
          biomarkerItemsClasses: biomarkerItems?.className,
          toggleButtonAriaExpanded: toggleButton?.getAttribute('aria-expanded')
        });
        
        console.log('Before toggle - biomarker items state:', {
          classList: biomarkerItems?.classList.toString(),
          hasHiddenClass: biomarkerItems?.classList.contains('hidden'),
          display: biomarkerItems ? window.getComputedStyle(biomarkerItems).display : 'N/A',
          visibility: biomarkerItems ? window.getComputedStyle(biomarkerItems).visibility : 'N/A',
          opacity: biomarkerItems ? window.getComputedStyle(biomarkerItems).opacity : 'N/A'
        });
        
        biomarkerItems.classList.toggle('hidden');
        toggleButton.setAttribute('aria-expanded', (!isExpanded).toString());
        
        console.log('After toggle - biomarker items state:', {
          classList: biomarkerItems?.classList.toString(),
          hasHiddenClass: biomarkerItems?.classList.contains('hidden'),
          display: biomarkerItems ? window.getComputedStyle(biomarkerItems).display : 'N/A',
          visibility: biomarkerItems ? window.getComputedStyle(biomarkerItems).visibility : 'N/A',
          opacity: biomarkerItems ? window.getComputedStyle(biomarkerItems).opacity : 'N/A'
        });
        
        console.log('After toggle - toggle button state:', {
          ariaExpanded: toggleButton?.getAttribute('aria-expanded'),
          ariaExpandedType: typeof toggleButton?.getAttribute('aria-expanded'),
          toggleIcon: toggleButton?.querySelector('.toggle-icon'),
          toggleIconHTML: toggleButton?.querySelector('.toggle-icon')?.outerHTML,
          toggleIconTransform: toggleButton?.querySelector('.toggle-icon') ? window.getComputedStyle(toggleButton.querySelector('.toggle-icon')).transform : 'N/A'
        });
        
        console.log('Header click - after toggle:', {
          isExpanded: toggleButton.getAttribute('aria-expanded'),
          biomarkerItemsClasses: biomarkerItems.className,
          biomarkerItemsHidden: biomarkerItems.classList.contains('hidden'),
          biomarkerItemsElement: biomarkerItems,
          biomarkerItemsHTML: biomarkerItems.outerHTML.substring(0, 300) + '...'
        });
        
        // Do NOT swap the arrow character; let CSS handle rotation
      });
    });

    // Add event listeners to the "Show all/Hide all" buttons
    $all('.toggle-all-biomarkers').forEach(button => {
      console.log('Setting up toggle-all-biomarkers button:', {
        button: button,
        buttonText: button.textContent
      });
      
      button.addEventListener('click', (e) => {
        console.log('Toggle all biomarkers button clicked:', {
          button: e.target,
          buttonText: e.target.textContent,
          isExpanded: button.getAttribute('aria-expanded') === 'true'
        });
        
        e.preventDefault();
        e.stopPropagation();
        
        const biomarkersSection = e.target.closest('.biomarkers-section');
        const biomarkersList = biomarkersSection.querySelector('.biomarkers-list');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        console.log('Before toggle all:', {
          biomarkersSection: biomarkersSection,
          biomarkersList: biomarkersList,
          biomarkersListClasses: biomarkersList?.className,
          isExpanded: isExpanded
        });
        
        // Toggle all biomarker items and their toggle buttons (don't hide the list container)
        const groups = biomarkersSection.querySelectorAll('.biomarker-group');
        console.log('Found biomarker groups:', groups.length);
        
        groups.forEach((group, index) => {
          const items = group.querySelector('.biomarker-items');
          const toggle = group.querySelector('.toggle-biomarkers');
          
          console.log(`Group ${index}:`, {
            group: group,
            hasItems: !!items,
            hasToggle: !!toggle,
            itemsClasses: items?.className,
            toggleText: toggle?.textContent,
            itemsElement: items,
            itemsHTML: items?.outerHTML?.substring(0, 200) + '...'
          });
          
          if (items && toggle) {
            // Toggle the individual biomarker items based on current state
            const shouldShowItems = !isExpanded; // If currently collapsed, show items; if expanded, hide items
            items.classList.toggle('hidden', !shouldShowItems);
            toggle.setAttribute('aria-expanded', shouldShowItems);
            
            console.log(`Group ${index} after toggle:`, {
              itemsClasses: items.className,
              itemsHidden: items.classList.contains('hidden'),
              toggleExpanded: toggle.getAttribute('aria-expanded'),
              shouldShowItems: shouldShowItems
            });
            // Do NOT swap the arrow character; let CSS handle rotation
          }
        });
        
        // Update the "Show all" button
        button.setAttribute('aria-expanded', !isExpanded);
        console.log('Toggle all button updated:', {
          newExpanded: button.getAttribute('aria-expanded'),
          biomarkersListHidden: biomarkersList.classList.contains('hidden'),
          newExpandedState: !isExpanded
        });
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
    console.log('=== FIRST updateComparisonGrid method called ===');
    let comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
    console.log('Comparison tests from localStorage:', comparisonTests);
    
    // Refresh biomarker counts and lab accreditations from the current test data
    if (window._allGeneralHealthTests) {
      comparisonTests = comparisonTests.map(storedTest => {
        const currentTest = window._allGeneralHealthTests.find(t => t.name === storedTest.name);
        if (currentTest) {
          return {
            ...storedTest,
            biomarker_count: currentTest.biomarker_count,
            "lab accreditations": currentTest["lab accreditations"] || storedTest["lab accreditations"]
          };
        }
        return storedTest;
      });
      
      // Update localStorage with refreshed data
      localStorage.setItem('comparisonTests', JSON.stringify(comparisonTests));
    }
    
    for (let i = 1; i <= 3; i++) {
      const test = comparisonTests[i - 1];
      
      if (test) {
        // Update test name
        const testNameCell = document.getElementById(`test-name-${i}`);
        if (testNameCell) {
          testNameCell.textContent = test.name;
        }
        
        // Update biomarker count from database
        const biomarkerCountCell = document.getElementById(`biomarker-count-${i}`);
        if (biomarkerCountCell) {
          console.log(`Setting biomarker count for column ${i}: ${test.biomarker_count || 0} for test ${test.name}`);
          biomarkerCountCell.textContent = test.biomarker_count || 0;
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
          
          // Get lab accreditations
          const labAccreditations = Array.isArray(test["lab accreditations"]) ? test["lab accreditations"] : [];
          
          // Create lab accreditations HTML with tooltips
          const labAccreditationsHTML = labAccreditations.length > 0 
            ? labAccreditations.map(acc => {
                if (acc === 'ISO 15189') {
                  return `<span class="lab-accreditation" title="ISO 15189: Medical laboratories - Requirements for quality and competence. This international standard specifies requirements for quality and competence in medical laboratories.">${acc}</span>`;
                } else {
                  return `<span class="lab-accreditation">${acc}</span>`;
                }
              }).join(', ')
            : 'Not specified';
          
          practicalCell.innerHTML = `
            <div class="practical-details">
              <div class="detail-item">Results returned in ${resultsText}</div>
              <div class="detail-item">Doctors report: ${test.doctors_report ? '✅' : '❌'}</div>
              <div class="detail-item">Lab accreditations: ${labAccreditationsHTML}</div>
            </div>
          `;
        }
        
        // Update blood method
        const bloodMethodCell = document.getElementById(`blood-method-${i}`);
        if (bloodMethodCell) {
          const allMethods = ['Home test', 'Clinic visit', 'Phlebotomist to home', 'Self arrange'];
          const availableMethods = Array.isArray(test.blood_taking_methods) ? test.blood_taking_methods : [];
          
          const bloodMethod = allMethods.map(method => {
            const isAvailable = availableMethods.includes(method);
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
            
            const icon = isAvailable ? (emojiMap[method] || '❓') : '✗';
            const text = displayTextMap[method] || method;
            const className = isAvailable ? '' : 'unavailable-method';
            
            return `<span class="${className}">${icon} ${text}</span>`;
          }).join('<br>');
          
          bloodMethodCell.innerHTML = `<div class="blood-method">${bloodMethod}</div>`;
        }
        
        // Update biomarkers
        const biomarkersCell = document.getElementById(`biomarkers-${i}`);
        if (biomarkersCell) {
          const biomarkerContent = biomarkersCell.querySelector('.biomarker-content');
          if (biomarkerContent) {
            biomarkerContent.innerHTML = await CardService.generateBiomarkerHTML(test);
          }
        }
        
        // Update book test button
        const bookTestCell = document.getElementById(`book-test-${i}`);
        console.log(`Looking for book-test-${i} cell:`, bookTestCell);
        if (bookTestCell) {
          const bookTestBtn = bookTestCell.querySelector('.book-test-btn');
          console.log(`Found book test button for column ${i}:`, bookTestBtn);
          if (bookTestBtn) {
            console.log(`Setting up click handler for test: ${test.name}, URL: ${test.url}`);
            bookTestBtn.onclick = () => {
              console.log(`Book test button clicked for test: ${test.name}, URL: ${test.url}`);
              if (test.url) {
                window.open(test.url, '_blank');
              } else {
                console.warn(`No URL found for test: ${test.name}`);
              }
            };
          } else {
            console.error(`No book test button found in cell ${i}`);
          }
        } else {
          console.error(`No book-test-${i} cell found`);
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
          <div class="grouping-header shared-header">${groupName}</div>
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
    console.log('=== SECOND updateComparisonGrid method called ===');
    let comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
    console.log('Comparison tests from localStorage (second method):', comparisonTests);
    
    // Sort tests by number of biomarkers (lowest biomarkers first)
    comparisonTests.sort((a, b) => {
      const biomarkersA = a.biomarker_count || 0;
      const biomarkersB = b.biomarker_count || 0;
      return biomarkersA - biomarkersB; // Ascending order (lowest first)
    });
    
    // First, collect all unique biomarker groups from all tests
    const allGroups = new Set();
    comparisonTests.forEach(test => {
      if (test && test.grouped_biomarkers) {
        Object.keys(test.grouped_biomarkers).forEach(group => allGroups.add(group));
      }
    });
    const sortedGroups = Array.from(allGroups).sort();

    // Create master biomarker lists for each group, showing all biomarkers from all tests
    const masterBiomarkerLists = {};
    for (const groupName of sortedGroups) {
      const allBiomarkers = new Set();
      
      // Collect all biomarkers from all tests
      for (let i = 0; i < comparisonTests.length; i++) {
        const testBiomarkers = comparisonTests[i]?.grouped_biomarkers?.[groupName] || [];
        testBiomarkers.forEach(biomarker => allBiomarkers.add(biomarker));
      }
      
      // Sort all biomarkers alphabetically
      masterBiomarkerLists[groupName] = Array.from(allBiomarkers).sort();
    }

    // Sort groups by their first appearance across all tests (maintain natural order)
    const sortedGroupsByLowestBiomarkers = sortedGroups.sort((a, b) => {
      // Find the first test that has each group
      let aFirstTestIndex = -1;
      let bFirstTestIndex = -1;
      
      for (let i = 0; i < comparisonTests.length; i++) {
        if (aFirstTestIndex === -1 && comparisonTests[i]?.grouped_biomarkers?.[a]?.length > 0) {
          aFirstTestIndex = i;
        }
        if (bFirstTestIndex === -1 && comparisonTests[i]?.grouped_biomarkers?.[b]?.length > 0) {
          bFirstTestIndex = i;
        }
      }
      
      // If both groups appear in the same test, sort alphabetically
      if (aFirstTestIndex === bFirstTestIndex) {
        return a.localeCompare(b);
      }
      
      // Sort by first appearance (groups that appear in earlier tests come first)
      return aFirstTestIndex - bFirstTestIndex;
    });
    
    for (let i = 1; i <= 3; i++) {
      const test = comparisonTests[i - 1];
      
      if (test) {
        // Update test name
        const testNameCell = document.getElementById(`test-name-${i}`);
        if (testNameCell) {
          testNameCell.textContent = test.name;
        }
        
        // Update biomarker count
        const biomarkerCountCell = document.getElementById(`biomarker-count-${i}`);
        if (biomarkerCountCell) {
          biomarkerCountCell.textContent = test.biomarker_count || 0;
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
          
          // Get lab accreditations
          const labAccreditations = Array.isArray(test["lab accreditations"]) ? test["lab accreditations"] : [];
          
          // Create lab accreditations HTML with tooltips
          const labAccreditationsHTML = labAccreditations.length > 0 
            ? labAccreditations.map(acc => {
                if (acc === 'ISO 15189') {
                  return `<span class="lab-accreditation" title="ISO 15189: Medical laboratories - Requirements for quality and competence. This international standard specifies requirements for quality and competence in medical laboratories.">${acc}</span>`;
                } else {
                  return `<span class="lab-accreditation">${acc}</span>`;
                }
              }).join(', ')
            : 'Not specified';
          
          practicalCell.innerHTML = `
            <div class="practical-details">
              <div class="detail-item">Results returned in ${resultsText}</div>
              <div class="detail-item">Doctors report: ${test.doctors_report ? '✅' : '❌'}</div>
              <div class="detail-item">Lab accreditations: ${labAccreditationsHTML}</div>
            </div>
          `;
        }
        
        // Update blood method
        const bloodMethodCell = document.getElementById(`blood-method-${i}`);
        if (bloodMethodCell) {
          const allMethods = ['Home test', 'Clinic visit', 'Phlebotomist to home', 'Self arrange'];
          const availableMethods = Array.isArray(test.blood_taking_methods) ? test.blood_taking_methods : [];
          
          const bloodMethod = allMethods.map(method => {
            const isAvailable = availableMethods.includes(method);
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
            
            const icon = isAvailable ? (emojiMap[method] || '❓') : '✗';
            const text = displayTextMap[method] || method;
            const className = isAvailable ? '' : 'unavailable-method';
            
            return `<span class="${className}">${icon} ${text}</span>`;
          }).join('<br>');
          
          bloodMethodCell.innerHTML = `<div class="blood-method">${bloodMethod}</div>`;
        }
        
        // Update biomarkers with aligned structure
        const biomarkersCell = document.getElementById(`biomarkers-${i}`);
        if (biomarkersCell) {
          const biomarkerContent = biomarkersCell.querySelector('.biomarker-content');
          if (biomarkerContent) {
            biomarkerContent.innerHTML = await CardService.generateAlignedBiomarkerHTML(test, sortedGroupsByLowestBiomarkers, masterBiomarkerLists);
          }
        }
        
        // Update book test button
        const bookTestCell = document.getElementById(`book-test-${i}`);
        console.log(`Looking for book-test-${i} cell:`, bookTestCell);
        if (bookTestCell) {
          const bookTestBtn = bookTestCell.querySelector('.book-test-btn');
          console.log(`Found book test button for column ${i}:`, bookTestBtn);
          if (bookTestBtn) {
            console.log(`Setting up click handler for test: ${test.name}, URL: ${test.url}`);
            bookTestBtn.onclick = () => {
              console.log(`Book test button clicked for test: ${test.name}, URL: ${test.url}`);
              if (test.url) {
                window.open(test.url, '_blank');
              } else {
                console.warn(`No URL found for test: ${test.name}`);
              }
            };
          } else {
            console.error(`No book test button found in cell ${i}`);
          }
        } else {
          console.error(`No book-test-${i} cell found`);
        }
      } else {
        // Reset to placeholder
        CardService.resetGridCell(i);
      }
    }
  }

  static async generateAlignedBiomarkerHTML(test, allGroups, masterBiomarkerLists) {
    if (!test || !test.grouped_biomarkers) {
      return '<div class="no-biomarkers">No biomarkers available</div>';
    }

    let html = '';

    for (const groupName of allGroups) {
      const testBiomarkers = test.grouped_biomarkers[groupName] || [];
      const masterBiomarkers = masterBiomarkerLists[groupName] || [];
      
      html += `<div class="biomarker-grouping">
        <div class="grouping-header shared-header">${groupName}</div>
        <div class="grouping-biomarkers">`;
      
      if (masterBiomarkers.length > 0) {
        // Use the master list order (first test biomarkers first, then others)
        for (const biomarker of masterBiomarkers) {
          const hasBiomarker = testBiomarkers.some(b => 
            b.toLowerCase() === biomarker.toLowerCase()
          );
          
          if (hasBiomarker) {
            html += `<div class="biomarker-item">
              <span class="biomarker-status">✓</span>
              <span class="biomarker-name">${biomarker}</span>
            </div>`;
          } else {
            html += `<div class="biomarker-item empty">
              <span class="biomarker-status dash">✗</span>
              <span class="biomarker-name">${biomarker}</span>
            </div>`;
          }
        }
      } else {
        // If no biomarkers in this group across all tests, show one dash
        html += `<div class="biomarker-item empty">
          <span class="biomarker-name">-</span>
        </div>`;
      }
      
      html += `</div></div>`;
    }

    return html || '<div class="no-biomarkers">No biomarkers available</div>';
  }



  static resetGridCell(index) {
    // Reset biomarker count
    const biomarkerCountCell = document.getElementById(`biomarker-count-${index}`);
    if (biomarkerCountCell) {
      biomarkerCountCell.textContent = '-';
    }
    
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
          <div class="detail-item">Lab accreditations</div>
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
  console.log('=== Global updateComparisonGrid called ===');
  try {
    await CardService.updateComparisonGrid();
    console.log('=== updateComparisonGrid completed ===');
  } catch (error) {
    console.error('Error in updateComparisonGrid:', error);
  }
}; 