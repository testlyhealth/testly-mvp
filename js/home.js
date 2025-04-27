import { $ } from './dom.js';
import { $all } from './dom.js';
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

  // Create the tracking banner section
  const trackingBanner = `
    <section class="tracking-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h2>Track all your results across multiple providers</h2>
          <p>Get a complete view of your health journey with our unified dashboard</p>
          <button class="cta-button">View Dashboard</button>
        </div>
        <div class="banner-graph">
          <img src="images/graph.jpeg" alt="Upward trending graph" class="graph-image" style="width:100%;max-width:400px;display:block;margin:0 auto;" />
        </div>
      </div>
    </section>
  `;

  // Remove the trust indicators section
  // Add the 4 cheapest products section
  const cheapestProducts = [
    {
      provider: "London Health Company",
      test_name: "General health blood test",
      price: 33,
      biomarkers: 15,
      link: "https://londonhealthcompany.co.uk/products/general-health-blood-test-15"
    },
    {
      provider: "Numan",
      test_name: "Core blood test",
      price: 78.40,
      biomarkers: 16,
      link: "https://www.numan.com/lps/gbr/blood-test/core-health-check"
    },
    {
      provider: "Medichecks",
      test_name: "Health and lifestyle blood test",
      price: 89,
      biomarkers: 19,
      link: "https://www.medichecks.com/products/health-and-lifestyle-check-blood-test"
    },
    {
      provider: "London Medical Laboratory",
      test_name: "General health profile",
      price: 89,
      biomarkers: 19,
      link: "https://www.londonmedicallaboratory.com/product/general-health"
    }
  ];

  const cheapestSection = `
    <section class="cheapest-products-section">
      <div class="cheapest-products-grid">
        ${cheapestProducts.map(product => `
          <div class="cheapest-product-card">
            <div class="cheapest-product-content">
              <div class="cheapest-product-provider">${product.provider}</div>
              <h3>${product.test_name}</h3>
              <img src="${product.logo}" alt="${product.provider} logo" class="cheapest-product-logo" />
              <div class="cheapest-product-biomarkers">${product.biomarkers} biomarkers</div>
              <div class="cheapest-product-price">£${product.price.toFixed(2)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="cheapest-products-actions-row">
        ${cheapestProducts.map(product => `
          <div class="cheapest-product-actions">
            <a href="${product.link}" class="cheapest-btn get-started" target="_blank">Get started</a>
            <a href="${product.link}" class="cheapest-btn learn-more" target="_blank">Learn more</a>
          </div>
        `).join('')}
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
  mainContent.innerHTML = heroSection + trackingBanner + cheapestSection + blogSection;

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