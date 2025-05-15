import { $, $all } from './dom.js';
import { categories } from './data.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
import { basket } from './basket.js';
import { CardService } from './services/cardService.js';

// Initialize card service
const cardService = new CardService();

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

// Function to update the tests grid
async function updateTestsGrid(tests) {
  const grid = document.querySelector('.tests-grid');
  if (!grid) return;

  // Create cards using the CardService
  const cards = cardService.createCards(tests);
  grid.innerHTML = cards;

  // Setup event handlers using the CardService
  cardService.setupCardEventHandlers(tests);
}

// Function to display products for a category
export async function displayCategoryProducts(categoryId) {
  const mainContent = $('.product-grid');
  const bloodTestsGrid = $('.blood-tests-grid');
  
  // Clear and hide the blood tests page content if it exists
  if (bloodTestsGrid) {
    bloodTestsGrid.innerHTML = '';
    bloodTestsGrid.style.display = 'none';
  }
  
  // Show the main content
  mainContent.style.display = 'block';
  
  if (categoryId === 'general-health') {
    try {
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

      // Create the tests grid container with empty grid first
      const testsGridContainer = `
        <div class="filter-panel">
          ${filterPanel}
        </div>
        <div class="main-content">
          ${categoryHeader}
          <div class="products-grid" id="tests-grid"></div>
        </div>
      `;

      // Update the main content with empty grid
      mainContent.innerHTML = testsGridContainer;

      // Wait for the next frame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Setup filter panel functionality after DOM is updated
        setupFilterPanel(tests, async (filteredTests) => {
          const testsGrid = $('#tests-grid');
          if (testsGrid) {
            testsGrid.innerHTML = (await updateTestsGrid(filteredTests)).trim();
          }
        });

        // Initial grid update
        updateTestsGrid(tests);
      });

    } catch (error) {
      console.error('Error loading blood tests:', error);
      mainContent.innerHTML = `
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