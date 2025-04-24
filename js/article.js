import { $ } from './dom.js';
import { blogPosts } from './blog-data.js';

export function displayArticle(articleId) {
  const mainContent = $('.product-grid');
  const article = blogPosts.find(post => post.id === articleId);
  
  if (!article) {
    mainContent.innerHTML = '<p>Article not found</p>';
    return;
  }

  const articleContent = `
    <article class="article-content">
      <header class="article-header">
        <div class="article-meta">
          <span class="article-category">${article.category}</span>
          <span class="article-date">${new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span class="article-read-time">${article.readTime}</span>
        </div>
        <h1>${article.title}</h1>
      </header>
      
      <div class="article-body">
        <p>${article.excerpt}</p>
        
        <h2>Understanding your results</h2>
        <p>When you receive your blood test results, it's important to understand what each marker means for your health. Here's a comprehensive guide to help you interpret your results:</p>
        
        <h3>Key markers to look for</h3>
        <ul>
          <li>Complete Blood Count (CBC)</li>
          <li>Metabolic Panel</li>
          <li>Lipid Panel</li>
          <li>Thyroid Function</li>
        </ul>
        
        <h2>What do the numbers mean?</h2>
        <p>Each marker in your blood test has a reference range that indicates what's considered normal. However, it's important to remember that these ranges can vary slightly between different laboratories.</p>
        
        <h2>When to consult a healthcare provider</h2>
        <p>If your results fall outside the normal range, it's important to discuss them with your healthcare provider. They can help you understand what the results mean for your specific situation.</p>
      </div>
      
      <footer class="article-footer">
        <a href="#/blog" class="back-to-blog">← Back to articles</a>
      </footer>
    </article>
  `;

  mainContent.innerHTML = articleContent;
} 