import { bloodTestService } from '../services/bloodTestService.js';

export async function displayBloodTestsPage() {
  try {
    // Fetch categories
    const categories = await bloodTestService.getCategories();
    
    // Create the page content
    const content = `
      <div class="blood-tests-page">
        <section class="categories-section">
          <h1>Find the right blood test for you</h1>
          <div class="categories-grid">
            ${categories.map(category => `
              <div class="category-card" data-category="${category.id}">
                <i class="fas fa-${category.icon}"></i>
                <h3>${category.name}</h3>
                <p>${category.description}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="general-health-section">
          <h2>General Health Tests</h2>
          <div class="tests-grid">
            ${(await bloodTestService.getBloodTests({ category: 'general' })).map(test => `
              <div class="test-card">
                <div class="test-header">
                  <h3>${test.name}</h3>
                  <span class="provider">${test.provider}</span>
                </div>
                <p class="description">${test.description}</p>
                <div class="test-details">
                  <div class="price">£${test.price}</div>
                  <div class="turnaround">${test.turnaroundTime}</div>
                  <div class="sample-type">${test.sampleType}</div>
                </div>
                <div class="tests-included">
                  <h4>Tests Included:</h4>
                  <ul>
                    ${test.testsIncluded.map(t => `<li>${t}</li>`).join('')}
                  </ul>
                </div>
                <a href="${test.url}" target="_blank" class="cta-button">View Test</a>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    return content;
  } catch (error) {
    console.error('Error displaying blood tests page:', error);
    return `
      <div class="error-container">
        <h2>Error Loading Blood Tests</h2>
        <p>Please try again later</p>
      </div>
    `;
  }
} 