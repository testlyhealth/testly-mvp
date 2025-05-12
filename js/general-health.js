import { $, $all } from './dom.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
import { basket } from './basket.js';

// Function to get grouped biomarkers
async function getGroupedBiomarkers(biomarkers) {
  try {
    const response = await fetch('/data/biomarker-groupings.json');
    const groupings = await response.json();
    
    const grouped = new Map();
    biomarkers.forEach(biomarker => {
      let found = false;
      for (const [group, items] of Object.entries(groupings)) {
        if (items.includes(biomarker)) {
          if (!grouped.has(group)) {
            grouped.set(group, []);
          }
          grouped.get(group).push(biomarker);
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
    return new Map([['All Biomarkers', biomarkers]]);
  }
}

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

// Function to filter tests based on criteria
function filterTests(tests, filters) {
  return tests.filter(test => {
    // Filter by price range
    if (filters.priceRange) {
      if (test.price < filters.priceRange.min || test.price > filters.priceRange.max) {
        return false;
      }
    }

    // Filter by provider
    if (filters.provider && filters.provider !== 'all') {
      if (test.provider !== filters.provider) {
        return false;
      }
    }

    // Filter by location
    if (filters.location && filters.location !== 'all') {
      if (!test["blood test location"].includes(filters.location)) {
        return false;
      }
    }

    // Filter by biomarker count
    if (filters.biomarkerCount) {
      if (test["biomarker number"] < filters.biomarkerCount) {
        return false;
      }
    }

    // Filter by doctor's report
    if (filters.doctorsReport) {
      if (test["doctors report"] !== "Yes") {
        return false;
      }
    }

    return true;
  });
}

// Function to update the tests grid
async function updateTestsGrid(tests) {
  // Sort tests by price
  const sortedTests = [...tests].sort((a, b) => a.price - b.price);
  
  // Create cards with ranking
  const cards = await Promise.all(sortedTests.map((test, index) => createBloodTestCard(test, index + 1)));
  
  return `
    <div class="tests-grid">
      ${cards.join('')}
    </div>
  `;
}

// Initialize the page
export async function displayGeneralHealthPage() {
  try {
    // Fetch the tests data
    const response = await fetch('/data/providers.json');
    const tests = await response.json();
    
    // Create the filter panel
    const filterPanel = createFilterPanel(tests);
    
    // Create the main content
    const content = `
      <div class="general-health-page">
        <div class="filter-panel">
          ${filterPanel}
        </div>
        <div class="main-content">
          <div class="category-header">
            <h2>General Health Blood Tests</h2>
            <p>Comprehensive blood tests to assess your overall health and wellbeing</p>
          </div>
          ${await updateTestsGrid(tests)}
        </div>
      </div>
    `;

    // Setup filter panel functionality after rendering
    setTimeout(() => {
      setupFilterPanel(tests, async (filteredTests) => {
        const testsGrid = $('.tests-grid');
        if (testsGrid) {
          testsGrid.innerHTML = (await updateTestsGrid(filteredTests)).trim();
        }
      });
    }, 0);

    return content;
  } catch (error) {
    console.error('Error loading blood tests:', error);
    return `
      <div class="error-message">
        <p>Error loading blood tests. Please try again later.</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }
} 