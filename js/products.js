import { $, $all } from './dom.js';
import { categories } from './data.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';

// Function to create a product card
function createProductCard(product) {
  return `
    <div class="product-card" data-product-id="${product.id}">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="product-price">£${product.price}</div>
      <button class="add-to-basket" data-product-id="${product.id}">Add to Basket</button>
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

// Function to create a blood test card
async function createBloodTestCard(test) {
  // Get the provider logo filename
  const providerLogo = test.provider.toLowerCase() + '.png';
  
  // Get grouped biomarkers
  const groupedBiomarkers = await getGroupedBiomarkers(test.biomarkers);
  
  return `
    <div class="product-card blood-test-card" data-test-id="${test.test_name}">
      <div class="test-header">
        <div class="provider-info">
          <img src="/images/logos/${providerLogo}" alt="${test.provider} logo" class="provider-logo">
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

// Function to update the tests grid
async function updateTestsGrid(tests) {
  const testsGrid = $('#tests-grid');
  if (testsGrid) {
    const cards = await Promise.all(tests.map(test => createBloodTestCard(test)));
    testsGrid.innerHTML = cards.join('');
    
    // Add event listeners to the "Add to Basket" buttons
    $all('.add-to-basket').forEach(button => {
      button.addEventListener('click', (e) => {
        const testId = e.target.dataset.testId;
        // We'll implement basket functionality later
        console.log('Added to basket:', testId);
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

// Function to display products for a category
export async function displayCategoryProducts(categoryId) {
  const mainContent = $('.product-grid');
  
  if (categoryId === 'general-health') {
    try {
      // Show loading state
      mainContent.innerHTML = `
        <div class="tests-container">
          <div class="filter-panel">
            <div class="loading">Loading filters...</div>
          </div>
          <div class="main-content">
            <div class="category-header">
              <h2>General Health Blood Tests</h2>
              <p>Comprehensive blood tests to assess your overall health and wellbeing</p>
            </div>
            <div class="loading">Loading tests...</div>
          </div>
        </div>
      `;

      // Fetch the tests data
      const response = await fetch('/data/providers.json');
      const tests = await response.json();
      
      // Create the category header
      const categoryHeader = `
        <div class="category-header">
          <h2>General Health Blood Tests</h2>
          <p>Comprehensive blood tests to assess your overall health and wellbeing</p>
        </div>
      `;

      // Create the filter panel
      const filterPanel = createFilterPanel(tests);

      // Create the tests grid container
      const testsGridContainer = `
        <div class="tests-container">
          ${filterPanel}
          <div class="main-content">
            ${categoryHeader}
            <div class="products-grid" id="tests-grid">
              ${tests.map(test => createBloodTestCard(test)).join('')}
            </div>
          </div>
        </div>
      `;

      // Update the main content
      mainContent.innerHTML = testsGridContainer;

      // Setup filter panel functionality
      setupFilterPanel(tests, updateTestsGrid);

      // Add event listeners to the initial "Add to Basket" buttons
      $all('.add-to-basket').forEach(button => {
        button.addEventListener('click', (e) => {
          const testId = e.target.dataset.testId;
          // We'll implement basket functionality later
          console.log('Added to basket:', testId);
        });
      });
    } catch (error) {
      console.error('Error loading blood tests:', error);
      mainContent.innerHTML = `
        <div class="tests-container">
          <div class="filter-panel">
            <div class="error-message">
              <p>Error loading filters</p>
            </div>
          </div>
          <div class="main-content">
            <div class="category-header">
              <h2>General Health Blood Tests</h2>
              <p>Comprehensive blood tests to assess your overall health and wellbeing</p>
            </div>
            <div class="error-message">
              <p>Error loading blood tests. Please try again later.</p>
              <button onclick="window.location.reload()">Retry</button>
            </div>
          </div>
        </div>
      `;
    }
  } else {
    // Handle other categories
    const category = categories[categoryId];
    
    if (!category) {
      mainContent.innerHTML = '<p>Category not found</p>';
      return;
    }

    // Create the category header
    const categoryHeader = `
      <div class="category-header">
        <h2>${category.title}</h2>
        <p>${category.description}</p>
      </div>
    `;

    // Create the products grid
    const productsGrid = `
      <div class="main-content">
        ${categoryHeader}
        <div class="products-grid">
          ${category.products.map(product => createProductCard(product)).join('')}
        </div>
      </div>
    `;

    // Update the main content
    mainContent.innerHTML = productsGrid;

    // Add event listeners to the "Add to Basket" buttons
    $all('.add-to-basket').forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        // We'll implement basket functionality later
        console.log('Added to basket:', productId);
      });
    });
  }
} 