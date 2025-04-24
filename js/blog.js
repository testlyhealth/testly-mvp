import { $ } from './dom.js';
import { blogPosts } from './blog-data.js';

export function displayBlogPage() {
  const mainContent = $('.product-grid');
  
  // Create the blog header
  const blogHeader = `
    <div class="blog-header">
      <h1>Health insights</h1>
      <p>Expert articles and guides to help you understand your health better</p>
    </div>
  `;

  // Create the blog grid
  const blogGrid = `
    <div class="blog-grid">
      ${blogPosts.map(post => `
        <article class="blog-card">
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
  `;

  // Update the main content
  mainContent.innerHTML = blogHeader + blogGrid;
} 