import { $, $all } from './dom.js';
import { categories } from './data.js';
import { createFilterPanel, setupFilterPanel } from './filter-panel.js';
import { basket } from './basket.js';
import { CardService } from './services/cardService.js';
import { getUrl } from './config.js';

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
    const response = await fetch(getUrl('data/biomarker-groupings.json'));
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
    return new Map([['All Tests', biomarkers]]);
  }
}

// Function to update the tests grid
async function updateTestsGrid(tests) {
  const grid = document.querySelector('.tests-grid');
  if (!grid) return;

  // Create cards with selection state - first card is selected by default
  const cardsWithSelection = tests.map((test, index) => ({
    ...test,
    isSelected: index === 0 // First card is selected by default
  }));

  // Create cards using the CardService
  const cards = await cardService.createCards(cardsWithSelection);
  grid.innerHTML = cards;

  // Setup event handlers using the CardService
  cardService.setupCardEventHandlers(cardsWithSelection);
  
  // Add card selection event listeners
  $all('.blood-test-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger selection if clicking on buttons or interactive elements
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.toggle-biomarkers') || e.target.closest('.toggle-all-biomarkers')) {
        return;
      }
      
      // Remove selection from all cards
      $all('.blood-test-card').forEach(c => c.classList.remove('selected'));
      
      // Add selection to clicked card
      card.classList.add('selected');
    });
  });
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
      const response = await fetch(getUrl('data/providers.json'));
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
        <div class="filter-tags">
          <div class="filter-tags-container">
            <div class="filter-tags-list">
              <!-- Filter tags will be populated here -->
            </div>
            <div class="results-controls">
              <div class="results-count">
                <span>${tests.length} result${tests.length !== 1 ? 's' : ''}</span>
              </div>
              <button class="filters-btn" aria-label="Toggle filters panel">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
                </svg>
                Filters
              </button>
            </div>
          </div>
        </div>
        <div class="results-container">
          <div class="filter-panel">
            ${filterPanel}
          </div>
          <div class="main-content">
            ${categoryHeader}
            <div class="mobile-filter-buttons">
              <button class="filters-btn mobile-only" aria-label="Open filters">Filters</button>
              <button class="advanced-search-btn mobile-only" aria-label="Advanced search">Advanced search</button>
            </div>
            <div class="products-grid" id="tests-grid"></div>
          </div>
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
            await updateTestsGrid(filteredTests);
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

async function loadProducts() {
  try {
    const response = await fetch(getUrl('data/providers.json'));
    const products = await response.json();
    
    // ... existing code ...
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
} 