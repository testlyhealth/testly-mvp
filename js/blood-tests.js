import { $ } from './dom.js';
import { displayCategoryProducts } from './products.js';

export function displayBloodTestsPage() {
  const mainContent = $('.blood-tests-grid');
  if (!mainContent) return;

  const categories = [
    { name: 'Advanced', id: 'advanced', icon: 'fa-microscope', description: 'Let me pick the tests myself', isAdvanced: true },
    { name: 'General Health', id: 'general-health', icon: 'fa-heartbeat', description: 'Comprehensive health screening and monitoring', color: '#ECEAF8', href: '#/category/general-health' },
    { name: 'Hormone Health', id: 'hormone-health', icon: 'fa-balance-scale', description: 'Comprehensive hormone health screening and monitoring', color: '#ECEAF8' },
    { name: 'Heart Health', id: 'heart-health', icon: 'fa-heart', description: 'Comprehensive heart health screening and monitoring', color: '#ECEAF8' },
    { name: 'Performance', id: 'performance', icon: 'fa-dumbbell', description: 'Comprehensive performance screening and monitoring', color: '#ECEAF8' },
    { name: 'Thyroid', id: 'thyroid', icon: 'fa-bolt', description: 'Comprehensive thyroid screening and monitoring', color: '#ECEAF8' },
    { name: 'Fertility', id: 'fertility', icon: 'fa-baby', description: 'Comprehensive fertility screening and monitoring', color: '#ECEAF8' },
    { name: 'Vitamins & Minerals', id: 'vitamins-minerals', icon: 'fa-pills', description: 'Comprehensive vitamin and mineral screening', color: '#ECEAF8' }
  ];

  mainContent.innerHTML = `
    <h1>Blood Tests</h1>
    <p class="subtitle">Compare blood tests across the whole market and find the best and cheapest test for you</p>
    <div class="tiles-container">
      ${categories.map(category => `
        <a href="${category.href || `#/category/${category.id}`}" class="test-tile ${category.isAdvanced ? 'advanced-tile' : ''}" style="${category.color ? `background-color: ${category.color}` : ''}">
          <i class="fas ${category.icon}"></i>
          <h3>${category.name}</h3>
          <p>${category.description}</p>
        </a>
      `).join('')}
    </div>
  `;

  // Add click handlers to the tiles
  mainContent.querySelectorAll('.test-tile').forEach(tile => {
    tile.addEventListener('click', (e) => {
      const href = tile.getAttribute('href');
      if (href.startsWith('#/category/')) {
        e.preventDefault();
        const categoryId = href.split('/')[2];
        // Clear the blood tests page content
        mainContent.innerHTML = '';
        mainContent.style.display = 'none';
        // Update the URL and display category products
        window.location.hash = `#/category/${categoryId}`;
        // Use setTimeout to ensure the DOM is updated before displaying category products
        setTimeout(() => {
          displayCategoryProducts(categoryId);
        }, 0);
      }
    });
  });
} 