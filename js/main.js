import { setupMenuToggle } from './menu.js';
import { displayCategoryProducts } from './products.js';
import { displayHomePage } from './home.js';
import { $, $all } from './dom.js';

document.addEventListener("DOMContentLoaded", () => {
  setupMenuToggle();
  
  // Display home page on load
  displayHomePage();
  
  // Make logo clickable to return to home
  $('.logo').addEventListener('click', () => {
    displayHomePage();
  });
  
  // Add click handlers to category links
  $all('.category-list a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const categoryId = e.target.textContent.toLowerCase().replace(/\s+/g, '-');
      displayCategoryProducts(categoryId);
    });
  });
});
