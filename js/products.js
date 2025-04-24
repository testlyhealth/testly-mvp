import { $, $all } from './dom.js';
import { categories } from './data.js';

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

// Function to display products for a category
export function displayCategoryProducts(categoryId) {
  const mainContent = $('.product-grid');
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
    <div class="products-grid">
      ${category.products.map(product => createProductCard(product)).join('')}
    </div>
  `;

  // Update the main content
  mainContent.innerHTML = categoryHeader + productsGrid;

  // Add event listeners to the "Add to Basket" buttons
  $all('.add-to-basket').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      // We'll implement basket functionality later
      console.log('Added to basket:', productId);
    });
  });
} 