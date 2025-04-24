import { $ } from './dom.js';
import { categories } from './data.js';

export function displayHomePage() {
  const mainContent = $('.product-grid');
  
  // Create the welcome section
  const welcomeSection = `
    <div class="welcome-section">
      <h1>Welcome to Testly</h1>
      <p>Your one-stop shop for health testing and wellness solutions</p>
    </div>
  `;

  // Create the category tiles
  const categoryTiles = `
    <div class="category-tiles">
      ${Object.entries(categories).map(([id, category]) => `
        <div class="category-tile" data-category="${id}">
          <h3>${category.title}</h3>
          <p>${category.description}</p>
        </div>
      `).join('')}
    </div>
  `;

  // Add scroll hint
  const scrollHint = `
    <div class="scroll-hint">
      Discover more health insights below
    </div>
  `;

  // Placeholder for blog articles (to be implemented)
  const blogSection = `
    <div class="blog-section">
      <h2>Latest Health Insights</h2>
      <div class="blog-grid">
        <div class="blog-card">
          <h3>Understanding Your Blood Test Results</h3>
          <p>Learn how to interpret your health markers...</p>
        </div>
        <div class="blog-card">
          <h3>The Importance of Regular Health Screening</h3>
          <p>Why preventive health checks are crucial...</p>
        </div>
      </div>
    </div>
  `;

  // Update the main content
  mainContent.innerHTML = welcomeSection + categoryTiles + scrollHint + blogSection;

  // Add click handlers to category tiles
  $('.category-tiles').addEventListener('click', (e) => {
    const tile = e.target.closest('.category-tile');
    if (tile) {
      const categoryId = tile.dataset.category;
      // We'll import and use the displayCategoryProducts function here
      import('./products.js').then(module => {
        module.displayCategoryProducts(categoryId);
      });
    }
  });
} 