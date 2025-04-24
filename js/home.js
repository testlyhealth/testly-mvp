import { $ } from './dom.js';
import { categories } from './data.js';
import { blogPosts } from './blog-data.js';

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
          <div class="category-image">
            <img src="images/${id}.svg" alt="${category.title}" />
          </div>
          <div class="category-content">
            <h3>${category.title}</h3>
            <p>${category.description}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Create the blog section
  const blogSection = `
    <div class="blog-section">
      <h2>Latest health insights</h2>
      <div class="blog-grid">
        ${blogPosts.map(post => `
          <article class="blog-card" data-article-id="${post.id}">
            <div class="blog-card-header">
              <span class="blog-category">${post.category}</span>
              <span class="blog-read-time">${post.readTime}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <div class="blog-card-footer">
              <span class="blog-date">${new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <a href="#/blog/${post.id}" class="read-more">Read more →</a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  // Update the main content
  mainContent.innerHTML = welcomeSection + categoryTiles + blogSection;

  // Add click handlers to category tiles
  $('.category-tiles').addEventListener('click', (e) => {
    const tile = e.target.closest('.category-tile');
    if (tile) {
      const categoryId = tile.dataset.category;
      import('./products.js').then(module => {
        module.displayCategoryProducts(categoryId);
      });
    }
  });

  // Add click handlers to blog cards
  $('.blog-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.blog-card');
    if (card) {
      const articleId = card.dataset.articleId;
      window.location.hash = `#/blog/${articleId}`;
    }
  });
} 