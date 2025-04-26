import { $ } from './dom.js';
import { categories } from './data.js';
import { blogPosts } from './blog-data.js';

export function displayHomePage() {
  const mainContent = $('.product-grid');
  
  // Create the hero section with 5 boxes
  const heroSection = `
    <section class="hero-grid">
      <div class="hero-box large">
        <div class="box-content">
          <h2>Lose weight with GLP-1s</h2>
          <p>Get started with our comprehensive weight loss program</p>
          <button class="cta-button">Get started</button>
        </div>
      </div>
      <div class="hero-box large">
        <div class="box-content">
          <h2>Get hard faster with Sparks</h2>
          <p>Best seller for enhanced performance</p>
          <button class="cta-button">Get started</button>
        </div>
      </div>
      <div class="hero-box small">
        <div class="box-content">
          <h3>Access Zepbound® in a vial</h3>
          <button class="cta-button">Get started</button>
        </div>
      </div>
      <div class="hero-box small">
        <div class="box-content">
          <h3>Have better sex with Daily Rise</h3>
          <button class="cta-button">Get started</button>
        </div>
      </div>
      <div class="hero-box small">
        <div class="box-content">
          <h3>Regrow your hair</h3>
          <button class="cta-button">Get started</button>
        </div>
      </div>
    </section>
  `;

  // Create the category tiles
  const categoryTiles = `
    <div class="categories-section">
      <h2>Health Categories</h2>
      <p>Explore our range of health tests and find the right one for you</p>
      <div class="category-tiles">
        ${Object.entries(categories).map(([id, category]) => `
          <div class="category-tile" data-category="${id}">
            <div class="category-image">
              <i class="fas ${getCategoryIcon(id)}"></i>
            </div>
            <div class="category-content">
              <h3>${category.title}</h3>
              <p>${category.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Create the trust indicators section
  const trustIndicators = `
    <section class="trust-indicators">
      <div class="trust-item">
        <i class="fas fa-truck"></i>
        <h3>Free Delivery</h3>
        <p>On all test kits</p>
      </div>
      <div class="trust-item">
        <i class="fas fa-certificate"></i>
        <h3>Certified Labs</h3>
        <p>UKAS accredited</p>
      </div>
      <div class="trust-item">
        <i class="fas fa-clock"></i>
        <h3>Quick Results</h3>
        <p>Within 48 hours</p>
      </div>
      <div class="trust-item">
        <i class="fas fa-shield-alt"></i>
        <h3>Secure & Private</h3>
        <p>Data protection</p>
      </div>
    </section>
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
  mainContent.innerHTML = heroSection + categoryTiles + trustIndicators + blogSection;

  // Add click handlers to category tiles
  $('.category-tiles').addEventListener('click', (e) => {
    const tile = e.target.closest('.category-tile');
    if (tile) {
      const categoryId = tile.dataset.category;
      window.location.hash = `#/category/${categoryId}`;
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

  // Add click handler to CTA buttons
  $all('.cta-button').forEach(button => {
    button.addEventListener('click', () => {
      window.location.hash = '#/category/general-health';
    });
  });
}

function getCategoryIcon(categoryId) {
  const icons = {
    'general-health': 'fa-heartbeat',
    'weight-loss': 'fa-weight',
    'sleep': 'fa-moon',
    'hormones': 'fa-flask',
    'womens-health': 'fa-venus',
    'mens-health': 'fa-mars',
    'heart-health': 'fa-heart',
    'gut-health': 'fa-microscope',
    'supplements': 'fa-pills'
  };
  return icons[categoryId] || 'fa-heartbeat';
} 