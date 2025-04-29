import { $, $all } from './dom.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
import { basket } from './basket.js';

// Function to create a blood test card
async function createBloodTestCard(test, rank) {
  // Get the provider logo filename
  const providerLogo = test.provider + '.png';
  
  // Get grouped biomarkers
  const groupedBiomarkers = await getGroupedBiomarkers(test.biomarkers);
  
  return `
    <div class="product-card blood-test-card" data-test-id="${test.test_name}">
      <div class="test-rank">${rank}</div>
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
        <div class="biomarkers-section">
          <div class="biomarkers-header">
            <div class="biomarker-info">
              <h4>Biomarker number: ${test["biomarker number"]}</h4>
              <button class="toggle-biomarkers" aria-expanded="false">Show all</button>
            </div>
          </div>
          <div class="biomarkers-list hidden">
            ${Array.from(groupedBiomarkers.entries()).map(([group, biomarkers]) => `
              <div class="biomarker-group">
                <h5 class="group-header">${group}</h5>
                <ul>
                  ${biomarkers.map(biomarker => `<li>${biomarker}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="test-locations">
          <h4>Available at:</h4>
          <ul>
            ${test["blood test location"].map(location => `<li>${location}</li>`).join('')}
          </ul>
        </div>
        <div class="test-results">
          <p>Results in ${test["Days till results returned"]} days</p>
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
      </div>
      <button class="add-to-basket" data-test-id="${test.test_name}">Add to Basket</button>
    </div>
  `;
}

// Function to group biomarkers
async function getGroupedBiomarkers(biomarkers) {
  try {
    const response = await fetch('/data/biomarker-groupings.json');
    const groupings = await response.json();
    
    // Create a map of biomarkers to their groups
    const biomarkerToGroup = new Map();
    groupings.forEach(group => {
      group.biomarkers.forEach(biomarker => {
        biomarkerToGroup.set(biomarker, group.group);
      });
    });

    // Group the biomarkers
    const groupedBiomarkers = new Map();
    biomarkers.forEach(biomarker => {
      const group = biomarkerToGroup.get(biomarker) || 'Other';
      if (!groupedBiomarkers.has(group)) {
        groupedBiomarkers.set(group, []);
      }
      groupedBiomarkers.get(group).push(biomarker);
    });

    return groupedBiomarkers;
  } catch (error) {
    console.error('Error loading biomarker groupings:', error);
    return new Map([['All biomarkers', biomarkers]]);
  }
}

// Function to update the tests grid
async function updateTestsGrid(tests) {
  const testsGrid = $('#tests-grid');
  if (testsGrid) {
    // Sort tests by price
    const sortedTests = [...tests].sort((a, b) => a.price - b.price);
    
    // Create cards with ranking
    const cards = await Promise.all(sortedTests.map((test, index) => createBloodTestCard(test, index + 1)));
    testsGrid.innerHTML = cards.join('');
    
    // Add event listeners to the "Add to Basket" buttons
    $all('.add-to-basket').forEach(button => {
      button.addEventListener('click', (e) => {
        const testId = e.target.dataset.testId;
        const test = tests.find(t => t.test_name === testId);
        if (test) {
          basket.addItem(test);
        }
      });
    });

    // Add event listeners to the biomarker toggle buttons
    $all('.toggle-biomarkers').forEach(button => {
      button.addEventListener('click', (e) => {
        const biomarkersList = e.target.closest('.biomarkers-section').querySelector('.biomarkers-list');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        biomarkersList.classList.toggle('hidden');
        button.setAttribute('aria-expanded', !isExpanded);
        button.textContent = isExpanded ? 'Show all' : 'Hide';
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

// Initialize the page
async function initPage() {
  try {
    // Fetch the tests data
    const response = await fetch('/data/providers.json');
    const tests = await response.json();
    
    // Create the filter panel
    const filterPanel = createFilterPanel(tests);
    $('.filter-panel').innerHTML = filterPanel;

    // Setup filter panel functionality
    setupFilterPanel(tests, updateTestsGrid);

    // Update the grid with the actual content
    await updateTestsGrid(tests);

  } catch (error) {
    console.error('Error loading blood tests:', error);
    $('.filter-panel').innerHTML = `
      <div class="error-message">
        <p>Error loading filters</p>
      </div>
    `;
    $('#tests-grid').innerHTML = `
      <div class="error-message">
        <p>Error loading blood tests. Please try again later.</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPage); 