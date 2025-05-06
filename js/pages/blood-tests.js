import { $ } from '../dom.js';
import { displayCategoryProducts } from '../products.js';

export async function displayBloodTestsPage() {
  const categories = [
    { name: 'Advanced', id: 'advanced', icon: 'fa-microscope', description: 'Let me manually pick the tests myself', isAdvanced: true },
    { name: 'General Health', id: 'general-health', icon: 'fa-heartbeat', description: 'Comprehensive health screening and monitoring', color: '#ECEAF8', noCategory: true },
    { name: 'Hormone Health', id: 'hormone-health', icon: 'fa-balance-scale', description: 'Comprehensive hormone health screening and monitoring', color: '#ECEAF8' },
    { name: 'Heart Health', id: 'heart-health', icon: 'fa-heart', description: 'Comprehensive heart health screening and monitoring', color: '#ECEAF8' },
    { name: 'Performance', id: 'performance', icon: 'fa-dumbbell', description: 'Comprehensive performance screening and monitoring', color: '#ECEAF8' },
    { name: 'Thyroid', id: 'thyroid', icon: 'fa-bolt', description: 'Comprehensive thyroid screening and monitoring', color: '#ECEAF8' },
    { name: 'Fertility', id: 'fertility', icon: 'fa-baby', description: 'Comprehensive fertility screening and monitoring', color: '#ECEAF8' },
    { name: 'Vitamins & Minerals', id: 'vitamins-minerals', icon: 'fa-pills', description: 'Comprehensive vitamin and mineral screening', color: '#ECEAF8' }
  ];

  return `
    <section class="categories-section">
      <h1>Find the right blood test for you</h1>
      <div class="category-grid">
        ${categories.map(category => `
          <div class="category-box ${category.isAdvanced ? 'advanced-search' : ''}"${category.id === 'general-health' ? '' : ` data-category="${category.id}"`}>
            <div class="box-content">
              <h3>${category.name}</h3>
              ${
                category.id === 'advanced'
                  ? `<p>${category.description}</p>
                     <button class="cta-button">
                      <span class='arrow'>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </button>`
                  : category.id === 'general-health'
                  ? `<p>${category.description}</p>
                     <button class="cta-button" onclick=\"window.location.hash='#/general-health'\">
                      <span class='arrow'>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </button>`
                  : `<div class="coming-soon" style="margin-top:0.5rem;color:#888;font-size:0.95rem;">Coming soon</div>`
              }
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
} 