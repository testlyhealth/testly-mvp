import { $, $all } from './dom.js';
import { supabase } from './api/supabase.js';
import { loadingOverlay } from './components/loading-overlay.js';

// Add this helper function at the top of the file, after the imports
function generateSafeId(text) {
  return text.toLowerCase()
    .replace(/[&]/g, 'and')  // Replace & with 'and'
    .replace(/[^a-z0-9-]/g, '-')  // Replace other special chars with hyphens
    .replace(/-+/g, '-')  // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
}

// Helper: Fetch biomarkers for a grouping from Supabase
async function fetchBiomarkersForGrouping(groupingName) {
  // 1. Get grouping id
  const { data: groupRows, error: groupError } = await supabase
    .from('biomarker_groupings')
    .select('id')
    .eq('name', groupingName)
    .limit(1);
  if (groupError || !groupRows || groupRows.length === 0) return [];
  const groupingId = groupRows[0].id;

  // 2. Get biomarker ids for this grouping
  const { data: linkRows, error: linkError } = await supabase
    .from('biomarker_groupings_link_table')
    .select('biomarker_id')
    .eq('biomarker_grouping_id', groupingId);
  if (linkError || !linkRows || linkRows.length === 0) return [];
  const biomarkerIds = linkRows.map(row => row.biomarker_id);

  // 3. Get biomarker names
  const { data: biomarkerRows, error: biomarkerError } = await supabase
    .from('biomarkers')
    .select('id, name')
    .in('id', biomarkerIds)
    .order('name');
  if (biomarkerError || !biomarkerRows) return [];
  return biomarkerRows;
}

// Function to create the filter panel HTML
export async function createFilterPanel(tests, options = {}) {
  console.log('Number of tests passed:', tests.length);
  
  // Get price range
  const prices = tests.map(test => test.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Fetch categories from Supabase
  let categories = [];
  try {
    const { data, error } = await supabase.from('blood_test_categories').select('*').order('name');
    if (error) throw error;
    categories = data.map(cat => cat.name);
  } catch (e) {
    // Fallback to hardcoded if fetch fails
    categories = [
      'General Health',
      'Hormone Health',
      'Heart Health',
      'Performance',
      'Thyroid',
      'Fertility',
      'Vitamins & Minerals'
    ];
  }
  
  // Fetch providers from male health and hormones category (same as homepage form)
  let providers = [];
  try {
    const { data, error } = await supabase
      .from('blood_test_category_link_table')
      .select(`
        provider_blood_test_id,
        provider_blood_tests!inner (
          provider_id,
          providers!inner (
            name
          )
        )
      `)
      .eq('blood_test_category_id', 3); // Male health and hormones category
    
    if (error) {
      console.error('Error fetching providers:', error);
      // Fallback to unique providers from tests if fetch fails
      const fallbackProviders = [...new Set(tests.map(test => test.provider))];
      providers = fallbackProviders.map(name => ({ name, count: 1 }));
      console.log('Fallback providers:', providers);
    } else {
      // Count tests per provider
      const providerCounts = {};
      data.forEach(item => {
        const providerName = item.provider_blood_tests.providers.name;
        providerCounts[providerName] = (providerCounts[providerName] || 0) + 1;
      });
      
      // Convert to array and sort by provider name
      providers = Object.entries(providerCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      console.log('Male health category providers:', providers);
    }
      } catch (e) {
      console.error('Error getting providers:', e);
      // Fallback to unique providers from tests if fetch fails
      const fallbackProviders = [...new Set(tests.map(test => test.provider))];
      providers = fallbackProviders.map(name => ({ name, count: 1 }));
      console.log('Fallback providers:', providers);
    }
  
  // Fetch biomarker groupings from Supabase
  let biomarkerGroupings = [];
  try {
    console.log('Fetching biomarker groupings from database...');
    const { data, error } = await supabase.from('biomarker_groupings').select('name').order('name');
    console.log('Raw biomarker groupings data:', data);
    console.log('Biomarker groupings error:', error);
    
    if (error) throw error;
    biomarkerGroupings = data.map(group => group.name);
    console.log('Processed biomarker groupings:', biomarkerGroupings);
    console.log('Number of groupings found:', biomarkerGroupings.length);
    console.log('Rendering', biomarkerGroupings.length, 'biomarker groupings in HTML');
  } catch (e) {
    console.error('Error fetching biomarker groupings:', e);
    // Fallback to empty array if fetch fails
    biomarkerGroupings = [];
  }
  
  // If no groupings found in database, use fallback list
  if (biomarkerGroupings.length === 0) {
    console.log('No groupings found in database, using fallback list');
    biomarkerGroupings = [
      'Allergy testing',
      'Autoimmune disease',
      'Blood group, disorders and clotting',
      'Cardiovascular health',
      'Diabetes and glucose metabolism',
      'Digestive health',
      'Energy and metabolism',
      'Fertility and reproductive health',
      'General health',
      'Hormone health',
      'Immune system',
      'Kidney and liver function',
      'Mental health and stress',
      'Muscle and bone health',
      'Nutrition and vitamins',
      'Sexual health',
      'Sleep and recovery',
      'Thyroid function',
      'Weight management'
    ];
  }
  
  // Fetch problems from Supabase
  let problems = [];
  try {
    const { data, error } = await supabase.from('problem_list').select('name').order('name');
    console.log('Raw problems data:', data);
    console.log('Problems error:', error);
    
    if (error) throw error;
    problems = data.map(problem => problem.name);
    console.log('Processed problems:', problems);
    console.log('Number of problems found:', problems.length);
    console.log('Looking for diabetes-related problems:', problems.filter(p => p.toLowerCase().includes('diabetes')));
    console.log('All problem names:', problems);
  } catch (e) {
    console.error('Error fetching problems:', e);
    // Fallback to hardcoded problems if fetch fails
    problems = [
      'Diabetes risk check',
      'Female hormone check',
      'General health check',
      'Heart health monitoring',
      'HRT monitoring',
      'Kidney health check',
      'Liver health check',
      'Low fertility (female)',
      'Low fertility (male)',
      'Male hormone check',
      'Prostate check',
      'Thyroid health check',
      'Tired all the time',
      'TRT monitoring'
    ];
    console.log('Using fallback problems list:', problems);
  }
  
  // Check for a filter query parameter in the URL
  let selectedCategory = null;
  let allCategoriesSelected = false;
  try {
    const urlHash = window.location.hash;
    const filterMatch = urlHash.match(/[?&]filter=([^&]+)/);
    if (filterMatch) {
      selectedCategory = decodeURIComponent(filterMatch[1]);
      // Fix the category name - replace + with space
      selectedCategory = selectedCategory.replace(/\+/g, ' ');
      // If filter=all, treat as all categories selected
      if (selectedCategory === 'all') {
        allCategoriesSelected = true;
        selectedCategory = null;
      } else if (selectedCategory.includes(',')) {
        const selectedCategories = selectedCategory.split(',').map(cat => cat.trim());
        // If the number of selected categories matches the total number of categories, treat as "all"
        if (selectedCategories.length >= 15) { // We have 15 categories in the database
          allCategoriesSelected = true;
        }
      }
    }
  } catch (e) {}

  return `
    <div class="filter-panel-content">
      
      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Sort</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="sort-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="sort-options" style="display: none;">
          <div class="sort-options">
            <div class="radio-option">
              <input type="radio" id="sort-relevance" name="sort" value="relevance" checked>
              <label for="sort-relevance">Sort by relevance</label>
            </div>
            <div class="radio-option">
              <input type="radio" id="sort-price-asc" name="sort" value="price-asc">
              <label for="sort-price-asc">Sort by price: Low to high</label>
            </div>
            <div class="radio-option">
              <input type="radio" id="sort-price-desc" name="sort" value="price-desc">
              <label for="sort-price-desc">Sort by price: High to low</label>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Price</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="price-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="price-options" style="display: none;">
          <div class="price-range">
            <span id="price-min-value">£${minPrice.toFixed(2)}</span> - <span id="price-max-value">£${maxPrice.toFixed(2)}</span>
          </div>
          <div class="price-slider">
            <input type="range" id="price-min" min="${minPrice}" max="${maxPrice}" value="${minPrice}" step="1">
            <input type="range" id="price-max" min="${minPrice}" max="${maxPrice}" value="${maxPrice}" step="1">
          </div>
        </div>
      </div>

      ${options.hideCategories ? '' : `
      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Categories</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="category-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="category-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="category-all" ${allCategoriesSelected || !selectedCategory ? 'checked' : ''}>
              <label for="category-all">All Categories</label>
            </div>
            ${categories.map(category => `
              <div class="checkbox-option">
                <input type="checkbox" id="category-${generateSafeId(category)}" class="category-checkbox" value="${category}" ${(selectedCategory && !allCategoriesSelected ? (selectedCategory === category ? 'checked' : '') : (!selectedCategory ? (category === 'General health' ? 'checked' : '') : ''))}>
                <label for="category-${generateSafeId(category)}">${category}</label>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      `}

      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Biomarkers</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="biomarker-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="biomarker-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="biomarker-all" checked>
              <label for="biomarker-all">All Biomarkers</label>
            </div>
            ${biomarkerGroupings.map(grouping => `
              <div class="biomarker-grouping">
                <div class="grouping-header">
                  <div class="grouping-checkbox-container">
                    <input type="checkbox" id="grouping-${generateSafeId(grouping)}-checkbox" class="grouping-checkbox" value="${grouping}">
                    <button class="grouping-toggle-btn" aria-expanded="false" aria-controls="grouping-${generateSafeId(grouping)}">
                      <span class="grouping-name">${grouping}</span>
                      <span class="grouping-toggle-icon">▼</span>
                    </button>
                  </div>
                </div>
                <div class="grouping-content" id="grouping-${generateSafeId(grouping)}" style="display: none;">
                  <div class="grouping-checkboxes">
                    <!-- Individual biomarkers will be loaded dynamically when grouping is expanded -->
                    <div class="loading-indicator">Loading biomarkers...</div>
                  </div>
                </div>
              </div>
            `).join('')}
            ${biomarkerGroupings.length === 0 ? '<div style="color: #6b7280; font-style: italic; padding: 0.5rem;">No biomarker groupings found</div>' : ''}
          </div>
        </div>
      </div>

      ${options.hideProblems ? '' : `
      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Problems/Symptoms</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="problems-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="problems-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="problems-all" checked>
              <label for="problems-all">All Problems/Symptoms</label>
            </div>
            ${problems.map(problem => `
              <div class="checkbox-option">
                <input type="checkbox" id="problems-${problem.toLowerCase().replace(/\s+/g, '-')}" class="problems-checkbox" value="${problem}">
                <label for="problems-${problem.toLowerCase().replace(/\s+/g, '-')}">${problem}</label>
              </div>
            `).join('')}
            ${problems.length === 0 ? '<div style="color: #6b7280; font-style: italic; padding: 0.5rem;">No problems found</div>' : ''}
          </div>
        </div>
      </div>
      `}

      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Providers</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="provider-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="provider-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="provider-all" checked>
              <label for="provider-all">All Providers</label>
            </div>
            ${providers.map(provider => `
              <div class="checkbox-option">
                <input type="checkbox" id="provider-${provider.name.toLowerCase().replace(/\s+/g, '-')}" class="provider-checkbox" value="${provider.name}">
                <label for="provider-${provider.name.toLowerCase().replace(/\s+/g, '-')}" >${provider.name} (${provider.count})</label>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Blood taking method</h4>
          <button class="filter-toggle-btn" aria-expanded="false" aria-controls="blood-method-options">
            <span class="toggle-icon">▼</span>
          </button>
        </div>
        <div class="filter-section-content" id="blood-method-options" style="display: none;">
          <div class="provider-checkboxes">
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-all" checked>
              <label for="blood-method-all">All Methods</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-home" class="blood-method-checkbox" value="Home test">
              <label for="blood-method-home">Home test/finger prick</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-clinic" class="blood-method-checkbox" value="Clinic visit">
              <label for="blood-method-clinic">Clinic visit venous test</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-phlebotomist" class="blood-method-checkbox" value="Phlebotomist to home">
              <label for="blood-method-phlebotomist">Phlebotomist to house</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="blood-method-self" class="blood-method-checkbox" value="Self arrange">
              <label for="blood-method-self">Self arrange test</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Biomarker search section -->
      <div class="filter-section">
        <div class="filter-section-header">
          <h4>Biomarker Search</h4>
        </div>
                  <div class="biomarker-search-container">
            <input type="text" class="biomarker-search-input" placeholder="e.g. testosterone, vitamin D" style="width: 100%; box-sizing: border-box;">
          <div class="biomarker-dropdown" style="display: none; position: absolute; z-index: 1000;">
            <!-- Results will be populated here -->
          </div>
        </div>
      </div>

      <!-- Compare button section -->
      <div class="filter-section">
        <div class="filter-section-header" style="display: flex; align-items: center; gap: 0.5rem;">
          <h4 style="margin: 0;">Compare Tests</h4>
        </div>
        <div class="filter-section-content">
        </div>
      </div>


    </div>
  `;
}

// Track last min/max price for robust slider reset
let lastMinPrice = null;
let lastMaxPrice = null;

// Function to setup filter panel functionality
export function setupFilterPanel(tests, updateCallback, rootPanel = null) {
  console.log('Number of tests passed:', tests.length);
  console.log('Update callback type:', typeof updateCallback);
  console.log('Root panel:', !!rootPanel);
  
  // Always re-query the latest filter panel content from the DOM
  let filterPanel = rootPanel || document.querySelector('.filter-panel-content');
  if (!filterPanel) {
    const filterPanelContainer = document.querySelector('.filter-panel');
    if (filterPanelContainer) {
      filterPanel = filterPanelContainer.querySelector('.filter-panel-content');
    }
  }
  if (!filterPanel) {
    console.error('Filter panel not found. Available elements:', {
      filterPanelContent: document.querySelector('.filter-panel-content'),
      filterPanel: document.querySelector('.filter-panel'),
      mainContent: document.querySelector('.main-content')
    });
    console.error('Current URL hash:', window.location.hash);
    console.error('Document body:', document.body.innerHTML.substring(0, 500));
    return;
  }
  
  console.log('Filter panel found:', filterPanel);

  // Always re-query the latest DOM elements for controls
  const priceMin = filterPanel.querySelector('#price-min');
  const priceMax = filterPanel.querySelector('#price-max');
  const priceMinValue = filterPanel.querySelector('#price-min-value');
  const priceMaxValue = filterPanel.querySelector('#price-max-value');
  const providerAll = filterPanel.querySelector('#provider-all');
  const providerCheckboxes = filterPanel.querySelectorAll('.provider-checkbox');
  const categoryAll = filterPanel.querySelector('#category-all');
  const categoryCheckboxes = filterPanel.querySelectorAll('.category-checkbox');
  const bloodMethodAll = filterPanel.querySelector('#blood-method-all');
  const bloodMethodCheckboxes = filterPanel.querySelectorAll('.blood-method-checkbox');
  const problemsAll = filterPanel.querySelector('#problems-all');
  const problemsCheckboxes = filterPanel.querySelectorAll('.problems-checkbox');
  
  
  console.log('problemsAll found:', !!problemsAll);
  console.log('Number of problem checkboxes found:', problemsCheckboxes.length);
  console.log('Problem checkbox values:', Array.from(problemsCheckboxes).map(cb => cb.value));
  const doctorsReport = filterPanel.querySelector('#doctors-report');
  const resetFiltersBtn = filterPanel.querySelector('#reset-filters');

  // Setup toggle functionality for collapsible sections
  const toggleButtons = filterPanel.querySelectorAll('.filter-toggle-btn');
  const filterHeaders = filterPanel.querySelectorAll('.filter-section-header');
  
  // Function to toggle section
  function toggleSection(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const targetId = button.getAttribute('aria-controls');
    const targetContent = filterPanel.querySelector(`#${targetId}`);
    const toggleIcon = button.querySelector('.toggle-icon');
    
    if (targetContent) {
      if (isExpanded) {
        // Collapse
        targetContent.style.display = 'none';
        button.setAttribute('aria-expanded', 'false');
        toggleIcon.textContent = '▼';
        
        // Remove biomarker-expanded class if this was the biomarker section
        if (targetId === 'biomarker-options') {
          filterPanel.classList.remove('biomarker-expanded');
        }
      } else {
        // Expand
        targetContent.style.display = 'block';
        button.setAttribute('aria-expanded', 'true');
        toggleIcon.textContent = '▲';
        
        // Add biomarker-expanded class if this is the biomarker section
        if (targetId === 'biomarker-options') {
          filterPanel.classList.add('biomarker-expanded');
        }
      }
    }
  }
  
  // Add click handlers to toggle buttons
  toggleButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSection(button);
    });
  });
  
  // Add click handlers to filter headers
  filterHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      // Don't trigger if clicking on the toggle button itself
      if (e.target.closest('.filter-toggle-btn')) {
        return;
      }
      e.preventDefault();
      const button = header.querySelector('.filter-toggle-btn');
      if (button) {
        toggleSection(button);
      }
    });
  });

  // Add click handlers to biomarker grouping toggle buttons
  const groupingToggleButtons = filterPanel.querySelectorAll('.grouping-toggle-btn');
  groupingToggleButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const targetId = button.getAttribute('aria-controls');
      const targetContent = filterPanel.querySelector(`#${targetId}`);
      const toggleIcon = button.querySelector('.grouping-toggle-icon');
      if (targetContent) {
        if (isExpanded) {
          // Collapse
          targetContent.style.display = 'none';
          button.setAttribute('aria-expanded', 'false');
          toggleIcon.textContent = '▼';
        } else {
          // Expand
          targetContent.style.display = 'block';
          button.setAttribute('aria-expanded', 'true');
          toggleIcon.textContent = '▲';
          // Lazy load biomarkers if not already loaded
          const checkboxesContainer = targetContent.querySelector('.grouping-checkboxes');
          if (checkboxesContainer && !checkboxesContainer.dataset.loaded) {
            const groupName = button.querySelector('.grouping-name').textContent;
            checkboxesContainer.innerHTML = '';
            const biomarkers = await fetchBiomarkersForGrouping(groupName);
            if (biomarkers.length > 0) {
              // Get selected biomarkers from URL hash
              let selectedBiomarkers = [];
              const hash = window.location.hash;
              const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
              if (biomarkerMatch) {
                selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim());
              }
              checkboxesContainer.innerHTML = biomarkers.map(b => `
                <div class="checkbox-option">
                  <input type="checkbox" class="biomarker-checkbox" id="biomarker-${b.id}" value="${b.name}"${selectedBiomarkers.includes(b.name) ? ' checked' : ''}>
                  <label for="biomarker-${b.id}">${b.name}</label>
                </div>
              `).join('');
            } else {
              checkboxesContainer.innerHTML = '<div class="loading-indicator">No biomarkers found</div>';
            }
            checkboxesContainer.dataset.loaded = 'true';
            // Add event listeners to biomarker checkboxes
            checkboxesContainer.querySelectorAll('.biomarker-checkbox').forEach(cb => {
              cb.addEventListener('change', (e) => {
                // Use URL hash as source of truth for selected biomarkers
                let selectedBiomarkers = [];
                const hash = window.location.hash;
                const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
                if (biomarkerMatch) {
                  selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
                }
                const biomarkerName = cb.value;
                if (cb.checked) {
                  if (!selectedBiomarkers.includes(biomarkerName)) {
                    selectedBiomarkers.push(biomarkerName);
                  }
                } else {
                  selectedBiomarkers = selectedBiomarkers.filter(b => b !== biomarkerName);
                }
                // --- Preserve all other params in the hash ---
                // Parse hash into base and params
                let [base, paramStr] = window.location.hash.split('?');
                base = base || '#/search-results';
                let params = new URLSearchParams(paramStr || '');
                // Update biomarkers param
                if (selectedBiomarkers.length > 0) {
                  params.set('biomarkers', selectedBiomarkers.join(','));
                } else {
                  params.delete('biomarkers');
                }
                // Remove empty params
                for (const [key, value] of params.entries()) {
                  if (!value) params.delete(key);
                }
                // Rebuild hash
                const newHash = params.toString() ? `${base}?${params.toString()}` : base;
                window.location.hash = newHash;
              });
            });
          }
        }
      }
    });
  });

  // Create filter tags container in the appropriate location
  let filterTagsContainer = document.querySelector('.filter-tags');
  if (!filterTagsContainer) {
    filterTagsContainer = document.createElement('div');
    filterTagsContainer.className = 'filter-tags';
    
    // Insert into page-container before the results-container
    const pageContainer = document.querySelector('.page-container');
    if (pageContainer) {
      const resultsContainer = pageContainer.querySelector('.results-container');
      if (resultsContainer) {
        pageContainer.insertBefore(filterTagsContainer, resultsContainer);
      } else {
        // If no results container, append to page container
        pageContainer.appendChild(filterTagsContainer);
      }
    }
  }

  // Get selected category from URL
  let selectedCategory = null;
  let allCategoriesSelected = false;
  let selectedProblem = null;
  try {
    const urlHash = window.location.hash;

    console.log('Full URL hash:', urlHash);
    
    const filterMatch = urlHash.match(/[?&]filter=([^&]+)/);
    const problemMatch = urlHash.match(/[?&]problem=([^&]+)/);
    
    console.log('Filter match:', filterMatch);
    console.log('Problem match:', problemMatch);
    
    if (filterMatch) {
      selectedCategory = decodeURIComponent(filterMatch[1]);
      // Fix the category name - replace + with space
      selectedCategory = selectedCategory.replace(/\+/g, ' ');
      // If filter=all, treat as all categories selected
      if (selectedCategory === 'all') {
        allCategoriesSelected = true;
        selectedCategory = null;
      } else if (selectedCategory.includes(',')) {
        const selectedCategories = selectedCategory.split(',').map(cat => cat.trim());
        // If the number of selected categories matches the total number of categories, treat as "all"
        if (selectedCategories.length >= 15) { // We have 15 categories in the database
          allCategoriesSelected = true;
        }
      }
    }
    if (problemMatch) {
      selectedProblem = decodeURIComponent(problemMatch[1]);
      console.log('Selected problem from URL:', selectedProblem);
    }
  } catch (e) {
    console.error('Error parsing URL hash:', e);
  }

  
  console.log('URL hash:', window.location.hash);
  console.log('Selected category from URL:', selectedCategory);
  console.log('Number of tests passed to filter panel:', tests.length);

  let currentFilters = {
    priceRange: {
      min: Math.min(...tests.map(test => test.price)),
      max: Math.max(...tests.map(test => test.price))
    },
    providers: [],
    locations: [],
    categories: allCategoriesSelected ? [] : (selectedCategory ? [selectedCategory] : []),
    bloodTakingMethods: [],
    problems: [],
    doctorsReport: false
  };
  
  console.log('Initial currentFilters:', currentFilters);

  // Initialize filter tags with current filters
  if (filterTagsContainer) {
    // Use the initial tests count for the results display
    const initialResultsCount = tests.length;
    console.log('Initial results count:', initialResultsCount);
    updateFilterTags(currentFilters, initialResultsCount);
  } else {
    console.error('Failed to create filter tags container');
  }

  // Function to create filter tags HTML
  function createFilterTags(filters, resultsCount = null) {

    console.log('Filters object:', filters);
    console.log('Categories in filters:', filters.categories);
    console.log('Results count passed to createFilterTags:', resultsCount);
    console.log('Results count type:', typeof resultsCount);
    
    const tags = [];
    // Provider tags
    if (filters.providers.length > 0) {
      filters.providers.forEach(provider => {
        tags.push(`
          <div class="filter-tag" data-type="provider" data-value="${provider}">
            <span>Provider: ${provider}</span>
            <button class="remove-tag" aria-label="Remove provider filter">×</button>
          </div>
        `);
      });
    }
    // Category tags
    if (filters.categories.length > 0) {
      console.log('Creating category tags for:', filters.categories);
      filters.categories.forEach(category => {
        tags.push(`
          <div class="filter-tag" data-type="category" data-value="${category}">
            <span>Category: ${category}</span>
            <button class="remove-tag" aria-label="Remove category filter">×</button>
          </div>
        `);
      });
    } else {
      // Show "All Categories" tag if allCategoriesSelected is true
      if (allCategoriesSelected) {
        console.log('Creating "All Categories" tag');
        tags.push(`
          <div class="filter-tag" data-type="category-all">
            <span>Category: All</span>
            <button class="remove-tag" aria-label="Remove all categories filter">×</button>
          </div>
        `);
      } else {
        console.log('No categories to create tags for');
      }
    }
    // Blood taking method tags
    if (filters.bloodTakingMethods.length > 0) {
      console.log('Creating blood taking method tags for:', filters.bloodTakingMethods);
      filters.bloodTakingMethods.forEach(method => {
        tags.push(`
          <div class="filter-tag" data-type="bloodMethod" data-value="${method}">
            <span>Method: ${method}</span>
            <button class="remove-tag" aria-label="Remove blood taking method filter">×</button>
          </div>
        `);
      });
    }
    // Problems/Symptoms tags
    if (filters.problems && filters.problems.length > 0) {
      console.log('Creating problems/symptoms tags for:', filters.problems);
      filters.problems.forEach(problem => {
        tags.push(`
          <div class="filter-tag" data-type="problem" data-value="${problem}">
            <span>Problem: ${problem}</span>
            <button class="remove-tag" aria-label="Remove problem/symptom filter">×</button>
          </div>
        `);
      });
    }
    // Doctor's report tag
    if (filters.doctorsReport) {
      tags.push(`
        <div class="filter-tag" data-type="doctorsReport">
          <span>Doctor's Report</span>
          <button class="remove-tag" aria-label="Remove doctor's report filter">×</button>
        </div>
      `);
    }
    // --- Homepage form filters from URL ---
    const hash = window.location.hash;
    
    // Check for homepage form filters
    const minPriceMatch = hash.match(/[?&]minPrice=([^&]+)/);
    if (minPriceMatch) {
      tags.push(`
        <div class="filter-tag" data-type="minPrice" data-value="${decodeURIComponent(minPriceMatch[1])}">
          <span>Min price: ${decodeURIComponent(minPriceMatch[1])}</span>
          <button class="remove-tag" aria-label="Remove min price filter">×</button>
        </div>
      `);
    }
    
    const maxPriceMatch = hash.match(/[?&]maxPrice=([^&]+)/);
    if (maxPriceMatch) {
      tags.push(`
        <div class="filter-tag" data-type="maxPrice" data-value="${decodeURIComponent(maxPriceMatch[1])}">
          <span>Max price: ${decodeURIComponent(maxPriceMatch[1])}</span>
          <button class="remove-tag" aria-label="Remove max price filter">×</button>
        </div>
      `);
    }
    
    const providerMatch = hash.match(/[?&]provider=([^&]+)/);
    if (providerMatch) {
      const providerValue = decodeURIComponent(providerMatch[1]).replace(/\+/g, ' ');
      tags.push(`
        <div class="filter-tag" data-type="provider" data-value="${providerValue}">
          <span>Provider: ${providerValue}</span>
          <button class="remove-tag" aria-label="Remove provider filter">×</button>
        </div>
      `);
    }
    
    const methodMatch = hash.match(/[?&]method=([^&]+)/);
    if (methodMatch) {
      tags.push(`
        <div class="filter-tag" data-type="method" data-value="${decodeURIComponent(methodMatch[1])}">
          <span>Method: ${decodeURIComponent(methodMatch[1])}</span>
          <button class="remove-tag" aria-label="Remove method filter">×</button>
        </div>
      `);
    }
    
    // --- Biomarker tags from URL ---
    const biomarkerMatch = hash.match(/[?&]biomarkers=([^&]+)/);
    if (biomarkerMatch) {
      const selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
      
      // Check if this is a testosterone-only search
      const testosteroneOnlyMatch = hash.match(/[?&]testosteroneOnly=([^&]+)/);
      const isTestosteroneOnly = testosteroneOnlyMatch && decodeURIComponent(testosteroneOnlyMatch[1]) === 'true';
      
      // Check if this is a testosterone full hormone profile search
      const testosteroneFullHormoneMatch = hash.match(/[?&]testosteroneFullHormone=([^&]+)/);
      const isTestosteroneFullHormone = testosteroneFullHormoneMatch && decodeURIComponent(testosteroneFullHormoneMatch[1]) === 'true';
      
      // Check if this is a male hormone check only search
      const testosteroneFullHormoneOnlyMatch = hash.match(/[?&]testosteroneFullHormoneOnly=([^&]+)/);
      const isTestosteroneFullHormoneOnly = testosteroneFullHormoneOnlyMatch && decodeURIComponent(testosteroneFullHormoneOnlyMatch[1]) === 'true';
      
      // Check if this is a male hormone check + general health check search
      const testosteroneFullHormoneGeneralHealthMatch = hash.match(/[?&]testosteroneFullHormoneGeneralHealth=([^&]+)/);
      const isTestosteroneFullHormoneGeneralHealth = testosteroneFullHormoneGeneralHealthMatch && decodeURIComponent(testosteroneFullHormoneGeneralHealthMatch[1]) === 'true';
      
      if (isTestosteroneOnly && selectedBiomarkers.includes('Testosterone')) {
        // Create special "Testosterone only" filter tag
        tags.push(`
          <div class="filter-tag" data-type="biomarker" data-value="Testosterone">
            <span>Testosterone only</span>
            <button class="remove-tag" aria-label="Remove biomarker">×</button>
          </div>
        `);
      } else if (isTestosteroneFullHormone) {
        // Create special "Male hormone check + general health check" filter tag
        tags.push(`
          <div class="filter-tag" data-type="male-hormone-check" data-value="male-hormone-check">
            <span>Male hormone check + general health check</span>
            <button class="remove-tag" aria-label="Remove biomarker">×</button>
          </div>
        `);
      } else if (isTestosteroneFullHormoneOnly) {
        // Create special "Male hormone check" filter tag
        tags.push(`
          <div class="filter-tag" data-type="male-hormone-check" data-value="male-hormone-check">
            <span>Male hormone check</span>
            <button class="remove-tag" aria-label="Remove biomarker">×</button>
          </div>
        `);
      } else {
        // Regular biomarker filter tags
        selectedBiomarkers.forEach(biomarker => {
          // Normalize biomarker name for display (replace + with space)
          const displayName = biomarker.replace(/\+/g, ' ');
          tags.push(`
            <div class="filter-tag" data-type="biomarker" data-value="${biomarker}">
              <span>${displayName}</span>
              <button class="remove-tag" aria-label="Remove biomarker">×</button>
            </div>
          `);
        });
      }
    }
    
    // Check for TRT monitoring outside of biomarker block (since it might not set biomarkers)
    const trtMonitoringMatch = hash.match(/[?&]trtMonitoring=([^&]+)/);
    const isTRTMonitoring = trtMonitoringMatch && decodeURIComponent(trtMonitoringMatch[1]) === 'true';
    
    if (isTRTMonitoring) {
      // Create special "TRT monitoring" filter tag
      tags.push(`
        <div class="filter-tag" data-type="male-hormone-check" data-value="male-hormone-check">
          <span>TRT monitoring</span>
          <button class="remove-tag" aria-label="Remove biomarker">×</button>
        </div>
      `);
    }
    
    // Create the filter tags container with results count and sort button
    const filterTagsHTML = tags.join('');
    console.log('Creating results count HTML with count:', resultsCount);
    const resultsCountHTML = resultsCount !== null ? `
      <div class="results-controls">
        <button class="clear-compare-btn" style="border: 1px solid #bbb; background: #fff; color: #444; font-size: 0.85rem; padding: 0.15em 0.7em; border-radius: 0.4em; cursor: pointer;">Clear</button>
        <button class="compare-btn" aria-label="Compare selected tests">
          Compare
        </button>
        <button class="filters-btn" aria-label="Toggle filters panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
          </svg>
          Filters
        </button>
        <div class="results-count">
          <span>${resultsCount} result${resultsCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    ` : '';
    
    return `
      <div class="filter-tags-container">
        <div class="filter-tags-list">
          ${filterTagsHTML}
        </div>
        ${resultsCountHTML}
      </div>
    `;
  }

  // Function to show filters overlay
  function showFiltersOverlay() {

    
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.filters-overlay');
    if (!overlay) {
      console.log('Creating new overlay');
      overlay = document.createElement('div');
      overlay.className = 'filters-overlay';
      overlay.innerHTML = `
        <div class="filters-overlay-content">
          <button class="filters-close-btn" aria-label="Close filters">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="filters-overlay-body">
            <h3>Filters</h3>
            <div class="filters-overlay-panel"></div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      // Add event listeners
      const closeBtn = overlay.querySelector('.filters-close-btn');
      closeBtn.addEventListener('click', hideFiltersOverlay);
      
      // Close when clicking outside
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          hideFiltersOverlay();
        }
      });
    } else {
      console.log('Using existing overlay');
    }
    
    // Copy the filter panel content (excluding compare section)
    const originalFilterPanel = document.querySelector('.filter-panel');
    const overlayPanel = overlay.querySelector('.filters-overlay-panel');
    
    console.log('Original filter panel found:', !!originalFilterPanel);
    console.log('Overlay panel found:', !!overlayPanel);
    
    if (originalFilterPanel && overlayPanel) {
      console.log('Cloning filter panel content');
      // Clone the filter panel content
      const filterContent = originalFilterPanel.cloneNode(true);
      
      console.log('Filter content cloned, length:', filterContent.innerHTML.length);
      
      // Remove the compare section if it exists
      const compareSection = filterContent.querySelector('.comparison-section');
      if (compareSection) {
        console.log('Removing comparison section');
        compareSection.remove();
      }
      
      // Remove the compare tests button if it exists
      const compareButton = filterContent.querySelector('.compare-tests-btn');
      if (compareButton) {
        console.log('Removing compare tests button');
        compareButton.remove();
      }
      
      // Remove the entire "Compare Tests" filter section
      const filterSections = filterContent.querySelectorAll('.filter-section');
      console.log('Found filter sections:', filterSections.length);
      filterSections.forEach((section, index) => {
        const compareHeader = section.querySelector('h4');
        if (compareHeader && compareHeader.textContent.trim() === 'Compare Tests') {
          console.log('Removing Compare Tests section at index:', index);
          section.remove();
        }
      });
      
      // Remove any other compare-related elements
      const compareElements = filterContent.querySelectorAll('[class*="compare"]');
      console.log('Found compare elements:', compareElements.length);
      compareElements.forEach(element => {
        if (element.classList.contains('compare-tests-btn') || 
            element.classList.contains('comparison-section') ||
            element.classList.contains('compare-tests-container') ||
            element.classList.contains('clear-compare-btn') ||
            element.classList.contains('compare-btn')) {
          console.log('Removing compare element:', element.className);
          element.remove();
        }
      });
      
      // Clear and append the filtered content
      overlayPanel.innerHTML = '';
      overlayPanel.appendChild(filterContent);
      console.log('Filter content appended to overlay');
      
      // Re-initialize any necessary event listeners for the copied content
      console.log('Initializing overlay filter events');
      initializeOverlayFilterEvents(filterContent, updateCallback);
    } else {
      console.error('Missing required elements:', {
        originalFilterPanel: !!originalFilterPanel,
        overlayPanel: !!overlayPanel
      });
    }
    
    overlay.classList.add('visible');
    console.log('Overlay made visible');
  }
  
  // Function to hide filters overlay
  function hideFiltersOverlay() {
    const overlay = document.querySelector('.filters-overlay');
    if (overlay) {
      overlay.classList.remove('visible');
    }
  }
  
  // Function to initialize filter events in the overlay
  function initializeOverlayFilterEvents(filterContent, callback) {

    console.log('Filter content element:', filterContent);
    console.log('Filter content HTML length:', filterContent.innerHTML.length);
    
    // Re-initialize toggle buttons for filter sections
    const toggleButtons = filterContent.querySelectorAll('.filter-toggle-btn');
    console.log('Found toggle buttons:', toggleButtons.length);
    
    // Debug: Log all filter sections to see what we have
    const allFilterSections = filterContent.querySelectorAll('.filter-section');
    console.log('All filter sections found:', allFilterSections.length);
    allFilterSections.forEach((section, index) => {
      const header = section.querySelector('.filter-section-header');
      const h4 = section.querySelector('h4');
      console.log(`Filter section ${index}:`, {
        hasHeader: !!header,
        h4Text: h4 ? h4.textContent.trim() : 'no h4',
        hasToggleBtn: !!section.querySelector('.filter-toggle-btn')
      });
    });
    
    toggleButtons.forEach((button, index) => {
      console.log(`Adding click listener to toggle button ${index}:`, button);
      console.log(`Button HTML:`, button.outerHTML);
      
      // Test if button is clickable
      button.style.cursor = 'pointer';
      button.style.pointerEvents = 'auto';
      
      button.addEventListener('click', (e) => {
        console.log(`Toggle button ${index} clicked`);
        e.preventDefault();
        e.stopPropagation();
        
        // Find the content div - it should be the next sibling with class filter-section-content
        const content = button.closest('.filter-section-header').nextElementSibling;
        const icon = button.querySelector('.toggle-icon');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        console.log('Toggle state:', { 
          isExpanded, 
          content: !!content, 
          contentClass: content ? content.className : 'none',
          icon: !!icon 
        });
        
        button.setAttribute('aria-expanded', !isExpanded);
        if (content && content.classList.contains('filter-section-content')) {
          content.style.display = isExpanded ? 'none' : 'block';
          console.log('Content display set to:', isExpanded ? 'none' : 'block');
        } else {
          console.error('Content not found or wrong class:', content);
        }
        if (icon) {
          icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
          console.log('Icon transform set to:', isExpanded ? 'rotate(0deg)' : 'rotate(180deg)');
        }
      });
      
      // Also add a test click handler to the entire header
      const header = button.closest('.filter-section-header');
      if (header) {
        console.log(`Adding click listener to header ${index}`);
        header.addEventListener('click', (e) => {
          console.log(`Header ${index} clicked`);
          e.preventDefault();
          e.stopPropagation();
          
          // Trigger the toggle button click
          button.click();
        });
      }
    });
    
    // Re-initialize biomarker grouping toggles
    const groupingToggles = filterContent.querySelectorAll('.grouping-toggle-btn');
    groupingToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;
        const icon = toggle.querySelector('.grouping-toggle-icon');
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        toggle.setAttribute('aria-expanded', !isExpanded);
        content.style.display = isExpanded ? 'none' : 'block';
        if (icon) {
          icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      });
    });
    
    // Re-initialize checkboxes with proper logic
    const checkboxes = filterContent.querySelectorAll('input[type="checkbox"]');
    console.log('Found checkboxes:', checkboxes.length);
    checkboxes.forEach((checkbox, index) => {
      console.log(`Adding change listener to checkbox ${index}:`, checkbox.id || checkbox.className);
      checkbox.addEventListener('change', (e) => {
        console.log(`Checkbox ${index} changed:`, checkbox.id || checkbox.className, 'checked:', checkbox.checked);
        e.preventDefault();
        e.stopPropagation();
        // Handle "All" checkboxes logic
        if (checkbox.id === 'provider-all') {
          const providerCheckboxes = filterContent.querySelectorAll('.provider-checkbox');
          providerCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
          });
        } else if (checkbox.id === 'category-all') {
          const categoryCheckboxes = filterContent.querySelectorAll('.category-checkbox');
          categoryCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
          });
        } else if (checkbox.id === 'blood-method-all') {
          const bloodMethodCheckboxes = filterContent.querySelectorAll('.blood-method-checkbox');
          bloodMethodCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
          });
        } else if (checkbox.id === 'problems-all') {
          const problemsCheckboxes = filterContent.querySelectorAll('.problems-checkbox');
          problemsCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
          });
        } else if (checkbox.id === 'biomarker-all') {
          const biomarkerCheckboxes = filterContent.querySelectorAll('.biomarker-checkbox');
          biomarkerCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
          });
        } else if (checkbox.classList.contains('provider-checkbox')) {
          // Update "All providers" checkbox
          const providerAll = filterContent.querySelector('#provider-all');
          const providerCheckboxes = filterContent.querySelectorAll('.provider-checkbox');
          const checkedProviders = Array.from(providerCheckboxes).filter(cb => cb.checked);
          if (providerAll) {
            providerAll.checked = checkedProviders.length === providerCheckboxes.length;
          }
        } else if (checkbox.classList.contains('category-checkbox')) {
          // Update "All categories" checkbox
          const categoryAll = filterContent.querySelector('#category-all');
          const categoryCheckboxes = filterContent.querySelectorAll('.category-checkbox');
          const checkedCategories = Array.from(categoryCheckboxes).filter(cb => cb.checked);
          if (categoryAll) {
            categoryAll.checked = checkedCategories.length === categoryCheckboxes.length;
          }
        } else if (checkbox.classList.contains('blood-method-checkbox')) {
          // Update "All methods" checkbox
          const bloodMethodAll = filterContent.querySelector('#blood-method-all');
          const bloodMethodCheckboxes = filterContent.querySelectorAll('.blood-method-checkbox');
          const checkedMethods = Array.from(bloodMethodCheckboxes).filter(cb => cb.checked);
          if (bloodMethodAll) {
            bloodMethodAll.checked = checkedMethods.length === bloodMethodCheckboxes.length;
          }
        } else if (checkbox.classList.contains('problems-checkbox')) {
          // Update "All problems" checkbox
          const problemsAll = filterContent.querySelector('#problems-all');
          const problemsCheckboxes = filterContent.querySelectorAll('.problems-checkbox');
          const checkedProblems = Array.from(problemsCheckboxes).filter(cb => cb.checked);
          if (problemsAll) {
            problemsAll.checked = checkedProblems.length === problemsCheckboxes.length;
          }
        } else if (checkbox.classList.contains('biomarker-checkbox')) {
          // Update "All biomarkers" checkbox
          const biomarkerAll = filterContent.querySelector('#biomarker-all');
          const biomarkerCheckboxes = filterContent.querySelectorAll('.biomarker-checkbox');
          const checkedBiomarkers = Array.from(biomarkerCheckboxes).filter(cb => cb.checked);
          if (biomarkerAll) {
            biomarkerAll.checked = checkedBiomarkers.length === biomarkerCheckboxes.length;
          }
        }
        
        // Trigger the same filter logic as the original panel
        if (callback) {
          // Get current tests and apply filters
          const currentTests = window._allGeneralHealthTests || [];
          let filteredTests = currentTests;
          
          // Apply category filter
          const selectedCategories = Array.from(filterContent.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value);
          if (selectedCategories.length > 0) {
            filteredTests = filteredTests.filter(test => {
              // This would need to be implemented based on how categories are stored in the test data
              // For now, we'll use the original logic
              return true;
            });
          }
          
          // Apply provider filter
          const selectedProviders = Array.from(filterContent.querySelectorAll('.provider-checkbox:checked')).map(cb => cb.value);
          if (selectedProviders.length > 0) {
            filteredTests = filteredTests.filter(test => 
              selectedProviders.includes(test.provider?.name || test.provider)
            );
          }
          
          // Apply price filter
          const priceMin = filterContent.querySelector('#price-min');
          const priceMax = filterContent.querySelector('#price-max');
          if (priceMin && priceMax) {
            const minPrice = parseFloat(priceMin.value);
            const maxPrice = parseFloat(priceMax.value);
            filteredTests = filteredTests.filter(test => {
              const price = test.price;
              return price >= minPrice && price <= maxPrice;
            });
          }
          
          // Update filter tags with the correct results count
          if (window.currentFilters) {
            window.currentFilters.categories = selectedCategories;
            window.currentFilters.providers = selectedProviders;
            window.updateFilterTags(window.currentFilters, filteredTests.length);
          }
          
          // Create a filter state object with current checkbox selections
          const filterState = {
            categories: selectedCategories,
            providers: selectedProviders,
            priceRange: window.currentFilters?.priceRange || { min: 0, max: 1000 },
            bloodTakingMethods: Array.from(filterContent.querySelectorAll('.blood-method-checkbox:checked')).map(cb => cb.value),
            doctorsReport: filterContent.querySelector('#doctors-report')?.checked || false,
            filteredTests: filteredTests // Provide the actual filtered tests
          };
          callback(filterState);
        }
      });
    });
    
    // Re-initialize price sliders
    const priceMin = filterContent.querySelector('#price-min');
    const priceMax = filterContent.querySelector('#price-max');
    const priceMinValue = filterContent.querySelector('#price-min-value');
    const priceMaxValue = filterContent.querySelector('#price-max-value');
    
    console.log('Price slider elements found:', {
      priceMin: !!priceMin,
      priceMax: !!priceMax,
      priceMinValue: !!priceMinValue,
      priceMaxValue: !!priceMaxValue
    });
    
    if (priceMin && priceMax && priceMinValue && priceMaxValue) {
      console.log('Adding price slider event listeners');
      priceMin.addEventListener('input', (e) => {
        const value = e.target.value;
        priceMinValue.textContent = `£${parseFloat(value).toFixed(2)}`;
        
        // Ensure min doesn't exceed max
        if (parseFloat(value) > parseFloat(priceMax.value)) {
          priceMax.value = value;
          priceMaxValue.textContent = `£${parseFloat(value).toFixed(2)}`;
        }
        
        // Update current filters and apply them
        if (window.currentFilters) {
          window.currentFilters.priceRange.min = parseFloat(value);
          // Calculate the number of filtered tests for the results count
          const currentTests = window._allGeneralHealthTests || [];
          const filteredTests = currentTests.filter(test => {
            const price = test.price;
            const minPrice = parseFloat(value);
            const maxPrice = parseFloat(priceMax.value);
            return price >= minPrice && price <= maxPrice;
          });
          window.updateFilterTags(window.currentFilters, filteredTests.length);
        }
        
        // Call the filter callback directly to update results
        if (callback) {
          // Filter the current tests based on the new price range
          const currentTests = window._allGeneralHealthTests || [];
          const filteredTests = currentTests.filter(test => {
            const price = test.price;
            const minPrice = parseFloat(value);
            const maxPrice = parseFloat(priceMax.value);
            return price >= minPrice && price <= maxPrice;
          });
          
          // Create a filter state object with the current price range and filtered tests
          const filterState = {
            categories: window.currentFilters?.categories || [],
            providers: window.currentFilters?.providers || [],
            priceRange: {
              min: parseFloat(value),
              max: parseFloat(priceMax.value)
            },
            bloodTakingMethods: window.currentFilters?.bloodTakingMethods || [],
            doctorsReport: window.currentFilters?.doctorsReport || false,
            filteredTests: filteredTests // Provide the actual filtered tests
          };
          callback(filterState);
        }
      });
      
      priceMax.addEventListener('input', (e) => {
        const value = e.target.value;
        priceMaxValue.textContent = `£${parseFloat(value).toFixed(2)}`;
        
        // Ensure max doesn't go below min
        if (parseFloat(value) < parseFloat(priceMin.value)) {
          priceMin.value = value;
          priceMinValue.textContent = `£${parseFloat(value).toFixed(2)}`;
        }
        
        // Update current filters and apply them
        if (window.currentFilters) {
          window.currentFilters.priceRange.max = parseFloat(value);
          // Calculate the number of filtered tests for the results count
          const currentTests = window._allGeneralHealthTests || [];
          const filteredTests = currentTests.filter(test => {
            const price = test.price;
            const minPrice = parseFloat(priceMin.value);
            const maxPrice = parseFloat(value);
            return price >= minPrice && price <= maxPrice;
          });
          window.updateFilterTags(window.currentFilters, filteredTests.length);
        }
        
        // Call the filter callback directly to update results
        if (callback) {
          // Filter the current tests based on the new price range
          const currentTests = window._allGeneralHealthTests || [];
          const filteredTests = currentTests.filter(test => {
            const price = test.price;
            const minPrice = parseFloat(priceMin.value);
            const maxPrice = parseFloat(value);
            return price >= minPrice && price <= maxPrice;
          });
          
          // Create a filter state object with the current price range and filtered tests
          const filterState = {
            categories: window.currentFilters?.categories || [],
            providers: window.currentFilters?.providers || [],
            priceRange: {
              min: parseFloat(priceMin.value),
              max: parseFloat(value)
            },
            bloodTakingMethods: window.currentFilters?.bloodTakingMethods || [],
            doctorsReport: window.currentFilters?.doctorsReport || false,
            filteredTests: filteredTests // Provide the actual filtered tests
          };
          callback(filterState);
        }
      });
    }
    
    // Re-initialize sort radio buttons
    const sortRadioButtons = filterContent.querySelectorAll('input[name="sort"]');

    console.log('Overlay sort radio buttons found:', sortRadioButtons.length);
    console.log('Overlay filter content HTML:', filterContent.innerHTML.substring(0, 500));
    console.log('All input elements in overlay:', filterContent.querySelectorAll('input').length);
    console.log('All radio elements in overlay:', filterContent.querySelectorAll('input[type="radio"]').length);
    console.log('All elements with "sort" in name in overlay:', filterContent.querySelectorAll('[name*="sort"]').length);
    console.log('All elements with "sort" in id in overlay:', filterContent.querySelectorAll('[id*="sort"]').length);
    
    // Log all radio buttons in overlay
    const allOverlayRadioButtons = filterContent.querySelectorAll('input[type="radio"]');
    console.log('All radio buttons found in overlay:', allOverlayRadioButtons.length);
    allOverlayRadioButtons.forEach((radio, index) => {
      console.log(`Overlay radio button ${index}:`, {
        id: radio.id,
        name: radio.name,
        value: radio.value,
        checked: radio.checked
      });
    });
    
    sortRadioButtons.forEach((radio, index) => {
      console.log(`Setting up overlay sort radio button ${index}:`, {
        id: radio.id,
        name: radio.name,
        value: radio.value,
        checked: radio.checked
      });
      radio.addEventListener('change', (e) => {
        const sortType = e.target.value;
    
        console.log('Sort type:', sortType);
        
        // Set global sort type (same as existing dropdown)
        window.sortType = sortType;
        
        // Trigger sort callback if available (same as existing dropdown)
        if (window.sortCallback) {
          window.sortCallback(sortType);
        }
      });
    });
    
    // Re-initialize biomarker search
    const biomarkerSearchInput = filterContent.querySelector('.biomarker-search-input');
    const biomarkerDropdown = filterContent.querySelector('.biomarker-dropdown');
    console.log('Biomarker search input found:', !!biomarkerSearchInput);
    console.log('Biomarker dropdown found:', !!biomarkerDropdown);
    
    if (biomarkerSearchInput && biomarkerDropdown) {
      console.log('Setting up biomarker search for overlay');
      
      let searchTimeout;
      let selectedIndex = -1;
      
      // Update selection for overlay
      function updateOverlaySelection(options) {
        options.forEach((option, index) => {
          if (index === selectedIndex) {
            option.classList.add('selected');
          } else {
            option.classList.remove('selected');
          }
        });
      }
      
      biomarkerSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
          biomarkerDropdown.style.display = 'none';
          return;
        }
        
        // Debounce the search
        searchTimeout = setTimeout(() => {
          searchFilterPanelBiomarkers(query, biomarkerDropdown);
        }, 300);
      });
      
      biomarkerSearchInput.addEventListener('keydown', (e) => {
        const options = biomarkerDropdown.querySelectorAll('.biomarker-option');
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
            updateOverlaySelection(options);
            break;
          case 'ArrowUp':
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateOverlaySelection(options);
            break;
          case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && options[selectedIndex]) {
              selectFilterPanelBiomarker(options[selectedIndex], biomarkerSearchInput, biomarkerDropdown);
            }
            break;
          case 'Escape':
            biomarkerDropdown.style.display = 'none';
            selectedIndex = -1;
            break;
        }
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!biomarkerSearchInput.contains(e.target) && !biomarkerDropdown.contains(e.target)) {
          biomarkerDropdown.style.display = 'none';
          selectedIndex = -1;
        }
      });
    }
  }

  // Function to update filter tags
  function updateFilterTags(filters, resultsCount = null) {

    console.log('Filters:', filters);
    console.log('Results count:', resultsCount);
    console.log('Results count type:', typeof resultsCount);
    
    const filterTagsContainer = document.querySelector('.filter-tags');
    if (!filterTagsContainer) {
      console.warn('Filter tags container not found');
      return;
    }
    console.log('Filter tags container found, updating HTML');
    const tagsHTML = createFilterTags(filters, resultsCount);
    filterTagsContainer.innerHTML = tagsHTML;
    console.log('Filter tags HTML updated');
    
    // Debug: Check if remove buttons are found
    const removeButtons = filterTagsContainer.querySelectorAll('.remove-tag');
    console.log('Found', removeButtons.length, 'remove buttons');
    
    // Add event listener to filters button
    const filtersBtn = filterTagsContainer.querySelector('.filters-btn');
    if (filtersBtn) {
      filtersBtn.addEventListener('click', () => {
        showFiltersOverlay();
      });
    }


    
    // Add event listeners to remove buttons (event delegation)
    const filterTagsList = filterTagsContainer.querySelector('.filter-tags-list');
    if (filterTagsList) {
      console.log('Setting up filter tags event delegation');
      filterTagsList.addEventListener('click', (e) => {
        console.log('Filter tag clicked:', e.target);
        const button = e.target.closest('.remove-tag');
        if (!button) {
          console.log('No remove button found');
          return;
        }
        console.log('Remove button clicked');
        e.preventDefault();
        e.stopPropagation();
        const tag = button.closest('.filter-tag');
        if (!tag) {
          console.log('No filter tag found');
          return;
        }
        const type = tag.dataset.type;
        const value = tag.dataset.value;
        console.log('Removing filter tag:', type, value);
        // Parse hash into base and params
        let [base, paramStr] = window.location.hash.split('?');
        base = base || '#/search-results';
        let params = new URLSearchParams(paramStr || '');
        if (type === 'category') {
          // Remove this category from filter param
          let filterVal = params.get('filter') || '';
          let cats = filterVal.split(',').map(c => c.trim()).filter(Boolean);
          cats = cats.filter(c => c !== value);
          if (cats.length > 0) {
            params.set('filter', cats.join(','));
          } else {
            params.set('filter', 'all');
          }
        } else if (type === 'category-all') {
          // Remove all categories, fallback to default (e.g., general-health)
          params.set('filter', 'general-health');
        } else if (type === 'biomarker') {
          // Remove this biomarker from biomarkers param
          let biomarkerVal = params.get('biomarkers') || '';
          let biomarkers = biomarkerVal.split(',').map(b => b.trim()).filter(Boolean);
          biomarkers = biomarkers.filter(b => b !== value);
          if (biomarkers.length > 0) {
            params.set('biomarkers', biomarkers.join(','));
          } else {
            params.delete('biomarkers');
          }
        } else if (type === 'provider') {
          // Remove this provider from providers param
          let providerVal = params.get('providers') || '';
          let providers = providerVal.split(',').map(p => p.trim()).filter(Boolean);
          providers = providers.filter(p => p !== value);
          if (providers.length > 0) {
            params.set('providers', providers.join(','));
          } else {
            params.delete('providers');
          }
        } else if (type === 'bloodMethod') {
          // Remove this blood taking method by unchecking the corresponding checkbox
          const checkbox = filterPanel.querySelector(`#blood-method-${value.toLowerCase().replace(/\s+/g, '-')}`);
          if (checkbox) {
            checkbox.checked = false;
            // Update "All Methods" checkbox if needed
            const allChecked = Array.from(bloodMethodCheckboxes).every(cb => cb.checked);
            if (bloodMethodAll) {
              bloodMethodAll.checked = allChecked;
            }
            // Reapply filters
            applyFilters().catch(console.error);
          }
        } else if (type === 'problem') {
          // Remove this problem/symptom by unchecking the corresponding checkbox
          const checkbox = filterPanel.querySelector(`#problems-${value.toLowerCase().replace(/\s+/g, '-')}`);
          if (checkbox) {
            checkbox.checked = false;
            // Update "All Problems" checkbox if needed
            const allChecked = Array.from(problemsCheckboxes).every(cb => cb.checked);
            if (problemsAll) {
              problemsAll.checked = allChecked;
            }
            // Reapply filters
            applyFilters().catch(console.error);
          }
        } else if (type === 'minPrice') {
          params.delete('minPrice');
        } else if (type === 'maxPrice') {
          params.delete('maxPrice');
        } else if (type === 'method') {
          params.delete('method');
        } else if (type === 'male-hormone-check') {
          // Special handling for "Male hormone check" - remove ALL biomarkers and special parameters
          console.log('🎯 FILTER PANEL - MALE HORMONE CHECK TAG REMOVAL TRIGGERED');
          params.delete('biomarkers');
          params.delete('testosteroneFullHormoneOnly');
          params.delete('testosteroneFullHormone');
          params.delete('testosteroneOnly');
          params.delete('trtMonitoring');
          console.log('🎯 FILTER PANEL - Parameters after removal:', params.toString());
        }
        // Remove empty params
        for (const [key, val] of params.entries()) {
          if (!val) params.delete(key);
        }
        // Rebuild hash
        const newHash = params.toString() ? `${base}?${params.toString()}` : base;
        console.log('🎯 FILTER PANEL - Final hash:', newHash);
        window.location.hash = newHash;
      });
    }
  }

  // Function to apply filters
  async function applyFilters() {

    console.log('Timestamp:', new Date().toISOString());
    console.log('Call stack:', new Error().stack);
    console.log('Current filters:', currentFilters);
    // Update current filters
    currentFilters = {
      priceRange: {
        min: parseFloat(priceMin.value),
        max: parseFloat(priceMax.value)
      },
      providers: Array.from(providerCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      locations: [],
      categories: categoryAll && categoryAll.checked ? [] : Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      bloodTakingMethods: bloodMethodAll && bloodMethodAll.checked ? [] : Array.from(bloodMethodCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      problems: problemsAll && problemsAll.checked ? [] : Array.from(problemsCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value),
      doctorsReport: doctorsReport ? doctorsReport.checked : false
    };
    

    console.log('bloodMethodAll checked:', bloodMethodAll?.checked);
    console.log('bloodMethodCheckboxes:', Array.from(bloodMethodCheckboxes).map(cb => ({ value: cb.value, checked: cb.checked })));
    console.log('Selected blood taking methods:', currentFilters.bloodTakingMethods);

    let filteredTests = tests;
    let availableTests = tests;


    
    // If categories are selected, fetch matching tests from Supabase
    if (currentFilters.categories.length > 0) {
      // 1. Get all category IDs
      const { data: catRows, error: catError } = await supabase
        .from('blood_test_categories')
        .select('id, name')
        .in('name', currentFilters.categories);
      if (!catError && catRows && catRows.length > 0) {
        const categoryIds = catRows.map(row => row.id);
        // 2. Get all test IDs for these categories
        const { data: linkRows, error: linkError } = await supabase
          .from('blood_test_category_link_table')
          .select('provider_blood_test_id')
          .in('blood_test_category_id', categoryIds);
        if (!linkError && linkRows && linkRows.length > 0) {
          const testIds = [...new Set(linkRows.map(row => row.provider_blood_test_id))];
          
          // 3. Get all blood tests with those IDs
          const { data: supaTests, error: testError } = await supabase
            .from('provider_blood_tests')
            .select('*, provider:providers(name)')
            .in('id', testIds);
          if (!testError && supaTests) {
            availableTests = supaTests;
            filteredTests = supaTests;
            console.log(`Fetched ${availableTests.length} tests from database`);
          } else {
            availableTests = [];
            filteredTests = [];
          }
        } else {
          availableTests = [];
          filteredTests = [];
        }
      } else {
        availableTests = [];
        filteredTests = [];
      }
    } else {
      // No category filter - always use the initial filtered tests
  
      console.log('Using initial filtered tests for price/provider filtering:', tests.length);
      console.log('Initial tests price range:', Math.min(...tests.map(t => t.price)), 'to', Math.max(...tests.map(t => t.price)));
      console.log('Current price filter:', currentFilters.priceRange.min, 'to', currentFilters.priceRange.max);
      
      // Always use the initial filtered tests when no categories are selected
      availableTests = tests;
      filteredTests = []; // Start with empty array, will be populated by filtering logic
      

      
      console.log('Final availableTests length:', availableTests.length);
    }

    // --- Update price slider range and values based on availableTests (not filtered) ---
    if (availableTests.length > 0) {
      const newMin = Math.min(...availableTests.map(t => t.price));
      const newMax = Math.max(...availableTests.map(t => t.price));
      priceMin.min = newMin;
      priceMin.max = newMax;
      priceMax.min = newMin;
      priceMax.max = newMax;

      // Only reset slider values if the available min/max has changed
      if (lastMinPrice !== newMin || lastMaxPrice !== newMax) {
        priceMin.value = newMin;
        priceMax.value = newMax;
        currentFilters.priceRange.min = newMin;
        currentFilters.priceRange.max = newMax;
      }
      lastMinPrice = newMin;
      lastMaxPrice = newMax;

      priceMinValue.textContent = `£${parseFloat(priceMin.value).toFixed(2)}`;
      priceMaxValue.textContent = `£${parseFloat(priceMax.value).toFixed(2)}`;

      // --- DEBUG LOGGING ---
      console.log('[applyFilters] newMin:', newMin, 'newMax:', newMax);
      console.log('[applyFilters] priceMin.value:', priceMin.value, 'priceMax.value:', priceMax.value);
      console.log('[applyFilters] priceMin DOM:', priceMin, 'priceMax DOM:', priceMax);
      console.log('[applyFilters] priceMin attributes:', priceMin.getAttribute('min'), priceMin.getAttribute('max'), priceMin.getAttribute('value'));
      console.log('[applyFilters] priceMax attributes:', priceMax.getAttribute('min'), priceMax.getAttribute('max'), priceMax.getAttribute('value'));
      // --- END DEBUG LOGGING ---
    }
    // --- End price slider update ---

    // Now apply price, provider, and blood taking method filters to availableTests

    console.log('Number of available tests:', availableTests.length);
    console.log('Sample tests with blood taking methods:', availableTests.slice(0, 3).map(t => ({
      name: t.name,
      blood_taking_methods: t.blood_taking_methods,
      hasBloodTakingMethods: !!t.blood_taking_methods,
      bloodTakingMethodsType: typeof t.blood_taking_methods,
      bloodTakingMethodsLength: Array.isArray(t.blood_taking_methods) ? t.blood_taking_methods.length : 'not array'
    })));
    

    console.log('Available tests before filtering:', availableTests.length);
    console.log('Price filter range:', currentFilters.priceRange.min, 'to', currentFilters.priceRange.max);
    
    filteredTests = availableTests.filter(test => {
      // Price range filter
      const priceInRange = test.price >= currentFilters.priceRange.min && test.price <= currentFilters.priceRange.max;
      if (!priceInRange) {
        console.log(`Filtering out test "${test.name}" - price £${test.price} not in range £${currentFilters.priceRange.min}-£${currentFilters.priceRange.max}`);
        return false;
      }
      
      // Provider filter
      if (currentFilters.providers.length > 0 && !currentFilters.providers.includes(test.provider?.name || test.provider)) {
        console.log(`Filtering out test "${test.name}" - provider not in selected list`);
        return false;
      }
      
      // Blood taking method filter - moved to filter callback
      // This filtering will be handled in the general-health.js filter callback
      // where we have access to enriched tests with blood_taking_methods
      
      // Doctor's report filter
      if (currentFilters.doctorsReport && test["doctors report"] !== "Yes") {
        console.log(`Filtering out test "${test.name}" - no doctor's report`);
        return false;
      }
      
      console.log(`Keeping test "${test.name}" - price £${test.price} in range`);
      return true;
    });
    
    console.log('Tests after filtering:', filteredTests.length);

    // Sort based on selected sort type
    const sortType = window.sortType || 'relevance';
    console.log('Applying sort type:', sortType);
    
    switch (sortType) {
      case 'price-asc':
        filteredTests.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredTests.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filteredTests.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filteredTests.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'relevance':
      default:
        // Keep original order for relevance
        break;
    }

    // Update filter tags with results count

    console.log('Filtered tests length:', filteredTests.length);
    console.log('Current filters:', currentFilters);
    updateFilterTags(currentFilters, filteredTests.length);

    // Always call callback with filter state object to handle all filtering (biomarkers, blood taking methods, etc.)

    console.log('Passing filtered tests to callback:', filteredTests.length);
    console.log('Sample filtered test names:', filteredTests.slice(0, 3).map(t => t.name));
    console.log('About to call updateCallback...');
    try {
      updateCallback({
        categories: currentFilters.categories,
        providers: currentFilters.providers,
        priceRange: currentFilters.priceRange,
        bloodTakingMethods: currentFilters.bloodTakingMethods,
        doctorsReport: currentFilters.doctorsReport,
        sortType: sortType,
        filteredTests: filteredTests // Pass the actual filtered tests
      });
      console.log('updateCallback called successfully');
    } catch (error) {
      console.error('Error calling updateCallback:', error);
    }
  }

  // Handle "All Providers" checkbox
  if (providerAll) {
    providerAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      providerCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        checkbox.disabled = isChecked;
      });
      applyFilters().catch(console.error);
    });
  }

  // Handle "All Categories" checkbox
  if (categoryAll) {
    categoryAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
        // When "All Categories" is selected, deselect all individual categories
        categoryCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
      }
      // --- Update filter param in hash ---
      let [base, paramStr] = window.location.hash.split('?');
      base = base || '#/search-results';
      let params = new URLSearchParams(paramStr || '');
      if (isChecked) {
        params.set('filter', 'all');
      } else {
        // When "All Categories" is unchecked, keep the current individual selections
        const selectedCategories = Array.from(categoryCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        if (selectedCategories.length > 0) {
          params.set('filter', selectedCategories.join(','));
        } else {
          params.delete('filter');
        }
      }
      // Remove empty params
      for (const [key, value] of params.entries()) {
        if (!value) params.delete(key);
      }
      const newHash = params.toString() ? `${base}?${params.toString()}` : base;
      window.location.hash = newHash;
    });
  }

  // Handle individual category checkboxes
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      
      // Update "All Categories" checkbox based on selection
      const allChecked = selectedCategories.length === categoryCheckboxes.length;
      categoryAll.checked = allChecked;
      
      // --- Update filter param in hash ---
      let [base, paramStr] = window.location.hash.split('?');
      base = base || '#/search-results';
      let params = new URLSearchParams(paramStr || '');
      
      if (allChecked) {
        // If all categories are selected, use 'all'
        params.set('filter', 'all');
      } else if (selectedCategories.length > 0) {
        // If specific categories are selected, join them
        params.set('filter', selectedCategories.join(','));
      } else {
        // If no categories are selected, remove the filter param
        params.delete('filter');
      }
      
      // Remove empty params
      for (const [key, value] of params.entries()) {
        if (!value) params.delete(key);
      }
      const newHash = params.toString() ? `${base}?${params.toString()}` : base;
      window.location.hash = newHash;
    });
  });

  // Handle individual provider checkboxes
  providerCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(providerCheckboxes).every(cb => cb.checked);
      providerAll.checked = allChecked;
      // On provider change, call applyFilters to ensure price filter updates properly
      applyFilters().catch(console.error);
    });
  });

  // Handle "All Blood Methods" checkbox
  if (bloodMethodAll) {
    bloodMethodAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      bloodMethodCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        checkbox.disabled = isChecked;
      });
      applyFilters().catch(console.error);
    });
  }

  // Handle individual blood taking method checkboxes
  bloodMethodCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const allChecked = Array.from(bloodMethodCheckboxes).every(cb => cb.checked);
      bloodMethodAll.checked = allChecked;
      applyFilters().catch(console.error);
    });
  });

  // Handle "All Problems/Symptoms" checkbox
  if (problemsAll) {
    problemsAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      problemsCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        checkbox.disabled = isChecked;
      });
      if (isChecked) {
        // If "All Problems" is checked, revert to normal filtering
        applyFilters().catch(console.error);
      }
    });
  }

  
  console.log('Number of problem checkboxes found:', problemsCheckboxes.length);
  console.log('Problem checkbox values:', Array.from(problemsCheckboxes).map(cb => cb.value));
  console.log('Problem checkbox elements:', Array.from(problemsCheckboxes).map(cb => ({ value: cb.value, id: cb.id, checked: cb.checked })));
  
  // Handle individual problems/symptoms checkboxes
  problemsCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
  
      console.log('Checkbox value:', checkbox.value);
      console.log('Checkbox checked:', checkbox.checked);
      console.log('Event type:', e.type);
      console.log('Is synthetic event:', e.isTrusted === false);
      
      // If this problem is checked, uncheck all others and disable them
      if (checkbox.checked) {
        // Uncheck all other problem checkboxes
        problemsCheckboxes.forEach(cb => {
          if (cb !== checkbox) {
            cb.checked = false;
            cb.disabled = true;
          }
        });
        
        // Uncheck and disable "All Problems" checkbox
        if (problemsAll) {
          problemsAll.checked = false;
          problemsAll.disabled = true;
        }
        
        const problemName = checkbox.value;
        await fetchAndDisplayLinkedTests(problemName);
      } else {
        // If unchecked, re-enable all checkboxes and revert to normal filtering
        problemsCheckboxes.forEach(cb => {
          cb.disabled = false;
        });
        if (problemsAll) {
          problemsAll.disabled = false;
          problemsAll.checked = true;
        }
        applyFilters().catch(console.error);
      }
    });
  });

  // Auto-check problem checkbox if problem parameter is in URL or localStorage
  let problemToCheck = selectedProblem;
  if (!problemToCheck) {
    // Check localStorage for selected problem
    problemToCheck = localStorage.getItem('selectedProblem');
    if (problemToCheck) {
  
      console.log('Selected problem from localStorage:', problemToCheck);
      // Clear localStorage after reading
      localStorage.removeItem('selectedProblem');
    }
  }
  
  if (problemToCheck) {

    console.log('Selected problem to check:', problemToCheck);
    console.log('Selected problem type:', typeof problemToCheck);
    console.log('Number of problem checkboxes found:', problemsCheckboxes.length);
    console.log('Available problem checkbox values:', Array.from(problemsCheckboxes).map(cb => ({ value: cb.value, id: cb.id, checked: cb.checked })));
    console.log('Available problem checkbox value types:', Array.from(problemsCheckboxes).map(cb => ({ value: cb.value, valueType: typeof cb.value })));
    
    // Add a small delay to ensure checkboxes are fully loaded
    setTimeout(() => {
      const matchingCheckbox = Array.from(problemsCheckboxes).find(cb => cb.value === selectedProblem);
      if (matchingCheckbox) {
        console.log('Found matching checkbox, checking it');
        matchingCheckbox.checked = true;
        
        // Manually perform the actions that would happen in the change event
        // Uncheck all other problem checkboxes
        problemsCheckboxes.forEach(cb => {
          if (cb !== matchingCheckbox) {
            cb.checked = false;
            cb.disabled = true;
          }
        });
        
        // Uncheck and disable "All Problems" checkbox
        if (problemsAll) {
          problemsAll.checked = false;
          problemsAll.disabled = true;
        }
        
        // Fetch and display linked tests
        fetchAndDisplayLinkedTests(problemToCheck);
      } else {
        console.log('No matching checkbox found for problem:', problemToCheck);
        console.log('Available problem values:', Array.from(problemsCheckboxes).map(cb => cb.value));
        
        // Try case-insensitive matching
        const caseInsensitiveMatch = Array.from(problemsCheckboxes).find(cb => 
          cb.value.toLowerCase() === problemToCheck.toLowerCase()
        );
        if (caseInsensitiveMatch) {
          console.log('Found case-insensitive match, checking it');
          caseInsensitiveMatch.checked = true;
          
          // Manually perform the actions that would happen in the change event
          problemsCheckboxes.forEach(cb => {
            if (cb !== caseInsensitiveMatch) {
              cb.checked = false;
              cb.disabled = true;
            }
          });
          
          if (problemsAll) {
            problemsAll.checked = false;
            problemsAll.disabled = true;
          }
          
          fetchAndDisplayLinkedTests(problemToCheck);
        } else {
          console.log('No case-insensitive match found either');
        }
      }
    }, 100); // Small delay to ensure DOM is ready
  }

  // Setup biomarker search in filter panel
  setupFilterPanelBiomarkerSearch();

  // Handle doctor's report checkbox
  if (doctorsReport) {
    doctorsReport.addEventListener('change', () => applyFilters().catch(console.error));
  }

  // Handle sort radio buttons
  const sortRadioButtons = filterPanel.querySelectorAll('input[name="sort"]');
  
  console.log('Main filter panel sort radio buttons found:', sortRadioButtons.length);
  console.log('All input elements in filter panel:', filterPanel.querySelectorAll('input').length);
  console.log('All radio elements in filter panel:', filterPanel.querySelectorAll('input[type="radio"]').length);
  console.log('All elements with "sort" in name:', filterPanel.querySelectorAll('[name*="sort"]').length);
  console.log('All elements with "sort" in id:', filterPanel.querySelectorAll('[id*="sort"]').length);
  
  // Check if sort section exists
  const sortSection = filterPanel.querySelector('.filter-section');
  console.log('First filter section found:', !!sortSection);
  if (sortSection) {
    const sortHeader = sortSection.querySelector('h4');
    console.log('First filter section header text:', sortHeader ? sortHeader.textContent : 'no header');
  }
  
  // Check all filter sections
  const allFilterSections = filterPanel.querySelectorAll('.filter-section');
  console.log('All filter sections found:', allFilterSections.length);
  allFilterSections.forEach((section, index) => {
    const header = section.querySelector('h4');
    console.log(`Filter section ${index} header:`, header ? header.textContent : 'no header');
  });
  
  // Log all radio buttons
  const allRadioButtons = filterPanel.querySelectorAll('input[type="radio"]');
  console.log('All radio buttons found:', allRadioButtons.length);
  allRadioButtons.forEach((radio, index) => {
    console.log(`Radio button ${index}:`, {
      id: radio.id,
      name: radio.name,
      value: radio.value,
      checked: radio.checked
    });
  });
  
  sortRadioButtons.forEach((radio, index) => {
    console.log(`Setting up sort radio button ${index}:`, {
      id: radio.id,
      name: radio.name,
      value: radio.value,
      checked: radio.checked
    });
    
    // Add a simple click test
    radio.addEventListener('click', (e) => {
  
      console.log('Clicked radio button:', e.target.id, e.target.value);
    });
    
    radio.addEventListener('change', (e) => {
      const sortType = e.target.value;
  
      console.log('Sort type:', sortType);
      
      // Set global sort type (same as existing dropdown)
      window.sortType = sortType;
      
      // Trigger sort callback if available (same as existing dropdown)
      if (window.sortCallback) {
        window.sortCallback(sortType);
      }
    });
  });

  // Handle reset filters button
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      // Reset price range
      priceMin.value = currentFilters.priceRange.min;
      priceMax.value = currentFilters.priceRange.max;
      priceMinValue.textContent = `£${currentFilters.priceRange.min.toFixed(2)}`;
      priceMaxValue.textContent = `£${currentFilters.priceRange.max.toFixed(2)}`;

      // Reset provider checkboxes
      providerAll.checked = true;
      providerCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        checkbox.disabled = true;
      });

      // Reset category checkboxes
      categoryAll.checked = true;
      categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        // Don't check individual checkboxes when "All Categories" is selected
      });

      // Reset blood taking method checkboxes
      bloodMethodAll.checked = true;
      bloodMethodCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        checkbox.disabled = true;
      });

      // Reset problems/symptoms checkboxes
      problemsAll.checked = true;
      problemsCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        checkbox.disabled = true;
      });

      // Reset doctor's report checkbox
      doctorsReport.checked = false;

      applyFilters().catch(console.error);
    });
  }

  // Add event listeners to update price display and prevent overlap
  priceMin.addEventListener('input', () => {
    let min = parseFloat(priceMin.value);
    let max = parseFloat(priceMax.value);
    if (min > max) {
      min = max;
      priceMin.value = min;
    }
    priceMinValue.textContent = `£${min.toFixed(2)}`;
    currentFilters.priceRange.min = min;
    updateFilterTags(currentFilters, null); // Count will be updated when applyFilters runs
    applyFilters().catch(console.error);
  });
  priceMax.addEventListener('input', () => {
    let min = parseFloat(priceMin.value);
    let max = parseFloat(priceMax.value);
    if (max < min) {
      max = min;
      priceMax.value = max;
    }
    priceMaxValue.textContent = `£${max.toFixed(2)}`;
    currentFilters.priceRange.max = max;
    updateFilterTags(currentFilters, null); // Count will be updated when applyFilters runs
    applyFilters().catch(console.error);
  });

  // Make applyFilters and currentFilters available globally for overlay access
  window.applyFilters = applyFilters;
  window.currentFilters = currentFilters;
  window.updateFilterTags = updateFilterTags;
  
  // Initial filter application
  applyFilters().catch(console.error);
  
  // Setup biomarker search functionality
  setupFilterPanelBiomarkerSearch();

  // Setup floating filter container behavior




  // Add click handler to Compare button
  const compareBtn = document.querySelector('.compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      window.location.hash = '#/compare';
    });
  }

  // Clear Compare button logic
  const clearCompareBtn = document.querySelector('.clear-compare-btn');
  if (clearCompareBtn) {
    clearCompareBtn.addEventListener('click', () => {
      localStorage.removeItem('comparisonTests');
      window.dispatchEvent(new Event('comparisonTestsUpdated'));
      // Also uncheck all add-to-compare checkboxes on the page
      document.querySelectorAll('.add-to-compare-checkbox').forEach(cb => { cb.checked = false; });
      // Optionally, update the comparison grid if on compare page
      if (window.location.hash === '#/compare' && window.updateComparisonGrid) {
        window.updateComparisonGrid();
      }
    });
  }

  // Function to enrich tests with biomarker and blood taking method data
  async function enrichTestsWithBiomarkersAndMethods(tests) {
    try {
      // 1. Get test IDs
      const testIds = tests.map(t => t.id);
      
      // 2. Fetch biomarker links and biomarkers for these tests
      let biomarkerLinks = [];
      let biomarkerIds = [];
      let biomarkers = [];
      let methodLinks = [];
      let allMethods = [];
      let labAccreditationLinks = [];
      let allLabAccreditations = [];
      
      if (testIds.length > 0) {
        const { data: links, error: linkError } = await supabase
          .from('biomarker_link_table')
          .select('provider_blood_test_id, biomarker_id')
          .in('provider_blood_test_id', testIds);
        if (linkError) throw linkError;
        biomarkerLinks = links;
        biomarkerIds = [...new Set(links.map(l => l.biomarker_id))];

        // Fetch blood taking method links
        const { data: methodLinkRows, error: methodLinkError } = await supabase
          .from('blood_taking_method_link_table')
          .select('provider_blood_test_id, blood_taking_method_id')
          .in('provider_blood_test_id', testIds);
        if (methodLinkError) throw methodLinkError;
        methodLinks = methodLinkRows;

        // Fetch all blood taking methods
        const { data: methodRows, error: methodError } = await supabase
          .from('blood_taking_methods')
          .select('id, name');
        if (methodError) throw methodError;
        allMethods = methodRows;

        // Fetch lab accreditation links
        const { data: labAccreditationLinkRows, error: labAccreditationLinkError } = await supabase
          .from('lab_accreditation_link_table')
          .select('provider_blood_test_id, lab_accreditation_id')
          .in('provider_blood_test_id', testIds);
        if (labAccreditationLinkError) throw labAccreditationLinkError;
        labAccreditationLinks = labAccreditationLinkRows;

        // Fetch all lab accreditations
        const { data: labAccreditationRows, error: labAccreditationError } = await supabase
          .from('lab_accreditations')
          .select('id, name');
        if (labAccreditationError) throw labAccreditationError;
        allLabAccreditations = labAccreditationRows;
      }
      
      if (biomarkerIds.length > 0) {
        const { data: biomarkerRows, error: biomarkerError } = await supabase
          .from('biomarkers')
          .select('id, name, group_links:biomarker_groupings_link_table(grouping:biomarker_groupings(name))')
          .in('id', biomarkerIds);
        if (biomarkerError) throw biomarkerError;
        biomarkers = biomarkerRows;
      }
      
      // 3. Attach grouped biomarkers, flat biomarker names, and blood taking methods to each test
      tests.forEach(test => {
        // Convert both IDs to numbers for comparison to handle type mismatches
        const testId = parseInt(test.id);
        const links = biomarkerLinks.filter(link => parseInt(link.provider_blood_test_id) === testId);
        const grouped = {};
        const biomarkerNames = [];
        links.forEach(link => {
          const biomarker = biomarkers.find(b => b.id === link.biomarker_id);
          if (!biomarker) return;
          biomarkerNames.push(biomarker.name);
          if (Array.isArray(biomarker.group_links) && biomarker.group_links.length > 0) {
            biomarker.group_links.forEach(gl => {
              const groupName = gl.grouping?.name || 'Other';
              if (!grouped[groupName]) grouped[groupName] = [];
              grouped[groupName].push(biomarker.name);
            });
          } else {
            if (!grouped['Other']) grouped['Other'] = [];
            grouped['Other'].push(biomarker.name);
          }
        });
        test.grouped_biomarkers = grouped;
        test.biomarker_count = test.biomarker_column || links.length;
        test.biomarker_names = biomarkerNames;
        // Attach blood taking methods
        const methodIds = methodLinks.filter(l => parseInt(l.provider_blood_test_id) === testId).map(l => l.blood_taking_method_id);
        test.blood_taking_methods = allMethods.filter(m => methodIds.includes(m.id)).map(m => m.name);
        
        // Attach lab accreditations
        const labAccreditationIds = labAccreditationLinks.filter(l => parseInt(l.provider_blood_test_id) === testId).map(l => l.lab_accreditation_id);
        test["lab accreditations"] = allLabAccreditations.filter(la => labAccreditationIds.includes(la.id)).map(la => la.name);
        
        // Check if lab_accreditations field exists directly in the test data
        if (test.lab_accreditations) {
          // If it's a string, split it into an array
          if (typeof test.lab_accreditations === 'string') {
            test["lab accreditations"] = test.lab_accreditations.split(',').map(acc => acc.trim()).filter(acc => acc);
          }
        }
      });
      
      // Summary of biomarker enrichment results
      const testsWithBiomarkers = tests.filter(test => test.biomarker_names && test.biomarker_names.length > 0);
      const testsWithoutBiomarkers = tests.filter(test => !test.biomarker_names || test.biomarker_names.length === 0);
      
      console.log(`DEBUG: Filter panel biomarker enrichment summary:`);
      console.log(`- Total tests processed: ${tests.length}`);
      console.log(`- Tests with biomarkers: ${testsWithBiomarkers.length}`);
      console.log(`- Tests without biomarkers: ${testsWithoutBiomarkers.length}`);
      
      if (testsWithoutBiomarkers.length > 0) {
        console.log(`DEBUG: Tests without biomarkers:`, testsWithoutBiomarkers.map(t => ({
          id: t.id,
          name: t.name,
          provider: t.provider?.name
        })));
      }
      
      return tests;
    } catch (error) {
      console.error('Error enriching tests:', error);
      return tests; // Return original tests if enrichment fails
    }
  }

  // Function to fetch and display linked tests for a selected problem
  async function fetchAndDisplayLinkedTests(problemName) {
    try {
      // 1. Get the problem ID from problem_list table
      const { data: problemRows, error: problemError } = await supabase
        .from('problem_list')
        .select('id')
        .eq('name', problemName)
        .limit(1);
      
      if (problemError || !problemRows || problemRows.length === 0) {
        console.error('Error fetching problem ID:', problemError);
        return Promise.resolve();
      }
      
      const problemId = problemRows[0].id;
      
      // 2. Get linked tests from problem_list_link_table
      const { data: linkRows, error: linkError } = await supabase
        .from('problem_list_link_table')
        .select('*, provider_blood_test:provider_blood_tests(*, provider:providers(name))')
        .eq('problem_list_id', problemId);
      
              if (linkError || !linkRows || linkRows.length === 0) {
          console.error('Error fetching linked tests:', linkError);
          
          // Show a message to the user that no linked tests are available
          const testsGrid = document.querySelector('.products-grid');
          if (testsGrid) {
            testsGrid.innerHTML = `
              <div class="no-results-message" style="text-align: center; padding: 2rem; color: #6b7280;">
                <h3>No linked tests available</h3>
                <p>No specific tests have been linked to "${problemName}" yet. Please check back later or browse all available tests.</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                  Browse All Tests
                </button>
              </div>
            `;
            // Show the products grid with the no results message
            testsGrid.style.display = 'grid';
            
            // Hide the loading overlay when no linked tests are available
            loadingOverlay.hide();
          }
          
          return Promise.resolve();
        }
      
      // 3. Extract the linked tests with their best_options
      const linkedTests = linkRows.map(link => ({
        ...link.provider_blood_test,
        best_options: link.best_options
      }));
      
      // 4. Enrich the linked tests with biomarker and blood taking method data
      const enrichedLinkedTests = await enrichTestsWithBiomarkersAndMethods(linkedTests);
      
      // 5. For diabetes problem, also fetch heart health category tests
      let heartHealthTests = [];
      let totalResults = enrichedLinkedTests.length;
      
      if (problemName.toLowerCase().includes('diabetes')) {
    
        console.log('Problem name:', problemName);
        try {
          // Get heart health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
      
          console.log('All categories:', allCategories?.map(cat => cat.name));
          
          // Look for the exact heart health category
          const heartCategory = allCategories?.find(cat => 
            cat.name === 'Heart and metabolic health'
          );
          console.log('Found heart category:', heartCategory);
          
          if (heartCategory) {
            const categoryId = heartCategory.id;
            
            // Get tests for heart health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich heart health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching heart health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('female hormone')) {
        try {
          // Get female health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact female health category
          const femaleCategory = allCategories?.find(cat => 
            cat.name === 'Female health and hormones'
          );
          
          if (femaleCategory) {
            const categoryId = femaleCategory.id;
            
            // Get tests for female health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich female health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching female health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('general health check')) {
        try {
          // Get general health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact general health category
          const generalCategory = allCategories?.find(cat => 
            cat.name === 'General health'
          );
          
          if (generalCategory) {
            const categoryId = generalCategory.id;
            
            // Get tests for general health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich general health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching general health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('heart health monitoring')) {
        try {
          // Get heart health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact heart health category
          const heartCategory = allCategories?.find(cat => 
            cat.name === 'Heart and metabolic health'
          );
          
          if (heartCategory) {
            const categoryId = heartCategory.id;
            
            // Get tests for heart health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich heart health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching heart health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('hrt monitoring')) {
        try {
          // Get female health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact female health category
          const femaleCategory = allCategories?.find(cat => 
            cat.name === 'Female health and hormones'
          );
          
          if (femaleCategory) {
            const categoryId = femaleCategory.id;
            
            // Get tests for female health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich female health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching female health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('kidney health check')) {
        try {
          // Get general health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact general health category
          const generalCategory = allCategories?.find(cat => 
            cat.name === 'General health'
          );
          
          if (generalCategory) {
            const categoryId = generalCategory.id;
            
            // Get tests for general health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich general health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching general health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('liver health check')) {
        try {
          // Get general health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact general health category
          const generalCategory = allCategories?.find(cat => 
            cat.name === 'General health'
          );
          
          if (generalCategory) {
            const categoryId = generalCategory.id;
            
            // Get tests for general health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich general health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching general health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('low fertility (female)')) {
        try {
          // Get fertility category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact fertility category
          const fertilityCategory = allCategories?.find(cat => 
            cat.name === 'Fertility'
          );
          
          if (fertilityCategory) {
            const categoryId = fertilityCategory.id;
            
            // Get tests for fertility category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich fertility tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching fertility tests:', error);
        }
      } else if (problemName.toLowerCase().includes('low fertility (male)')) {
        try {
          // Get fertility category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact fertility category
          const fertilityCategory = allCategories?.find(cat => 
            cat.name === 'Fertility'
          );
          
          if (fertilityCategory) {
            const categoryId = fertilityCategory.id;
            
            // Get tests for fertility category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich fertility tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching fertility tests:', error);
        }
      } else if (problemName.toLowerCase().includes('male hormone check')) {
        try {
          // Get male health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact male health category
          const maleCategory = allCategories?.find(cat => 
            cat.name === 'Male health and hormones'
          );
          
          if (maleCategory) {
            const categoryId = maleCategory.id;
            
            // Get tests for male health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich male health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching male health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('prostate check')) {
        try {
          // Get male health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact male health category
          const maleCategory = allCategories?.find(cat => 
            cat.name === 'Male health and hormones'
          );
          
          if (maleCategory) {
            const categoryId = maleCategory.id;
            
            // Get tests for male health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich male health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching male health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('thyroid health check')) {
        try {
          // Get thyroid health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact thyroid health category
          const thyroidCategory = allCategories?.find(cat => 
            cat.name === 'Thyroid health'
          );
          
          if (thyroidCategory) {
            const categoryId = thyroidCategory.id;
            
            // Get tests for thyroid health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich thyroid health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching thyroid health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('tired all the time')) {
        try {
          // Get general health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact general health category
          const generalCategory = allCategories?.find(cat => 
            cat.name === 'General health'
          );
          
          if (generalCategory) {
            const categoryId = generalCategory.id;
            
            // Get tests for general health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich general health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching general health tests:', error);
        }
      } else if (problemName.toLowerCase().includes('trt monitoring')) {
        try {
          // Get male health category ID
          const { data: allCategories, error: allCategoriesError } = await supabase
            .from('blood_test_categories')
            .select('id, name')
            .order('name');
          
          // Look for the exact male health category
          const maleCategory = allCategories?.find(cat => 
            cat.name === 'Male health and hormones'
          );
          
          if (maleCategory) {
            const categoryId = maleCategory.id;
            
            // Get tests for male health category
            const { data: linkRows, error: linkError } = await supabase
              .from('blood_test_category_link_table')
              .select('provider_blood_test_id')
              .eq('blood_test_category_id', categoryId);
            
            if (!linkError && linkRows && linkRows.length > 0) {
              const testIds = linkRows.map(row => row.provider_blood_test_id);
              
              // Fetch the actual test data
              const { data: testRows, error: testError } = await supabase
                .from('provider_blood_tests')
                .select('*, provider:providers(name)')
                .in('id', testIds);
              
              if (!testError && testRows) {
                // Enrich male health tests
                heartHealthTests = await enrichTestsWithBiomarkersAndMethods(testRows);
                totalResults += heartHealthTests.length;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching male health tests:', error);
        }
      }
      
      // 6. Clear all other filter tags and show problem and category tags
      const filterTagsContainer = document.querySelector('.filter-tags');
      if (filterTagsContainer) {
        let filterTagsHTML = `
          <div class="filter-tags-container">
            <div class="filter-tags-list">
              <div class="filter-tag" data-type="problem" data-value="${problemName}">
                <span>Problem: ${problemName}</span>
                <button class="remove-tag" aria-label="Remove problem filter">×</button>
              </div>`;
        
        // Add category tags for specific problems
        if (problemName.toLowerCase().includes('diabetes') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Heart and metabolic health">
                <span>Category: Heart and metabolic health</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('female hormone') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Female health and hormones">
                <span>Category: Female health and hormones</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('general health check') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="General health">
                <span>Category: General health</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('heart health monitoring') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Heart and metabolic health">
                <span>Category: Heart and metabolic health</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('hrt monitoring') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Female health and hormones">
                <span>Category: Female health and hormones</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('kidney health check') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="General health">
                <span>Category: General health</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('liver health check') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="General health">
                <span>Category: General health</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('low fertility (female)') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Fertility">
                <span>Category: Fertility</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('low fertility (male)') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Fertility">
                <span>Category: Fertility</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('male hormone check') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Male health and hormones">
                <span>Category: Male health and hormones</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('prostate check') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Male health and hormones">
                <span>Category: Male health and hormones</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('thyroid health check') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Thyroid health">
                <span>Category: Thyroid health</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('tired all the time') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="General health">
                <span>Category: General health</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        } else if (problemName.toLowerCase().includes('trt monitoring') && heartHealthTests.length > 0) {
          filterTagsHTML += `
              <div class="filter-tag" data-type="category" data-value="Male health and hormones">
                <span>Category: Male health and hormones</span>
                <button class="remove-tag" aria-label="Remove category filter">×</button>
              </div>`;
        }
        
        filterTagsHTML += `
            </div>
            <div class="results-count">
              <span>${totalResults} results</span>
            </div>
          </div>
        `;
        
        filterTagsContainer.innerHTML = filterTagsHTML;
        
        // Add event listener to remove tag
        const removeBtn = filterTagsContainer.querySelector('.remove-tag');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            // Uncheck the problem checkbox
            const problemCheckbox = filterPanel.querySelector(`#problems-${problemName.toLowerCase().replace(/\s+/g, '-')}`);
            if (problemCheckbox) {
              problemCheckbox.checked = false;
              // Update "All Problems" checkbox
              const allChecked = Array.from(problemsCheckboxes).every(cb => cb.checked);
              if (problemsAll) {
                problemsAll.checked = allChecked;
              }
              // Revert to normal filtering
              applyFilters().catch(console.error);
            }
          });
        }
      }
      
      // 7. Display the enriched linked tests and heart health tests
      const testsGrid = document.querySelector('.products-grid');
      
      if (testsGrid && (enrichedLinkedTests.length > 0 || heartHealthTests.length > 0)) {
        const cardService = new (await import('./services/cardService.js')).CardService();
        
        let allCardsHTML = '';
        
        // Display top 3 linked tests first (if any)
        if (enrichedLinkedTests.length > 0) {
          const topCards = await cardService.createCards(enrichedLinkedTests);
          allCardsHTML += topCards;
        }
        
        // Display additional category tests below (if any)
        if (heartHealthTests.length > 0) {
          let sectionTitle = '';
          let sectionDescription = '';
          
          if (problemName.toLowerCase().includes('diabetes')) {
            sectionTitle = 'Heart Health Tests';
            sectionDescription = 'Additional tests that may be relevant for diabetes management';
          } else if (problemName.toLowerCase().includes('female hormone')) {
            sectionTitle = 'Female Health Tests';
            sectionDescription = 'Additional tests that may be relevant for female hormone health';
          } else if (problemName.toLowerCase().includes('general health check')) {
            sectionTitle = 'General Health Tests';
            sectionDescription = 'Additional tests that may be relevant for general health monitoring';
          } else if (problemName.toLowerCase().includes('heart health monitoring')) {
            sectionTitle = 'Heart Health Tests';
            sectionDescription = 'Additional tests that may be relevant for heart health monitoring';
          } else if (problemName.toLowerCase().includes('hrt monitoring')) {
            sectionTitle = 'Female Health Tests';
            sectionDescription = 'Additional tests that may be relevant for HRT monitoring';
          } else if (problemName.toLowerCase().includes('kidney health check')) {
            sectionTitle = 'General Health Tests';
            sectionDescription = 'Additional tests that may be relevant for kidney health monitoring';
          } else if (problemName.toLowerCase().includes('liver health check')) {
            sectionTitle = 'General Health Tests';
            sectionDescription = 'Additional tests that may be relevant for liver health monitoring';
          } else if (problemName.toLowerCase().includes('low fertility (female)')) {
            sectionTitle = 'Fertility Tests';
            sectionDescription = 'Additional tests that may be relevant for fertility monitoring';
          } else if (problemName.toLowerCase().includes('low fertility (male)')) {
            sectionTitle = 'Fertility Tests';
            sectionDescription = 'Additional tests that may be relevant for fertility monitoring';
          } else if (problemName.toLowerCase().includes('male hormone check')) {
            sectionTitle = 'Male Health Tests';
            sectionDescription = 'Additional tests that may be relevant for male hormone monitoring';
          } else if (problemName.toLowerCase().includes('prostate check')) {
            sectionTitle = 'Male Health Tests';
            sectionDescription = 'Additional tests that may be relevant for prostate health monitoring';
          } else if (problemName.toLowerCase().includes('thyroid health check')) {
            sectionTitle = 'Thyroid Health Tests';
            sectionDescription = 'Additional tests that may be relevant for thyroid health monitoring';
          } else if (problemName.toLowerCase().includes('tired all the time')) {
            sectionTitle = 'General Health Tests';
            sectionDescription = 'Additional tests that may be relevant for fatigue and energy monitoring';
          } else if (problemName.toLowerCase().includes('trt monitoring')) {
            sectionTitle = 'Male Health Tests';
            sectionDescription = 'Additional tests that may be relevant for TRT monitoring';
          }
          
          // Add a section header for additional tests
          allCardsHTML += `
            <div style="grid-column: 1 / -1; margin: 2rem 0 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; border-left: 4px solid #dc3545;">
              <h3 style="margin: 0; color: #333; font-size: 1.2rem;">${sectionTitle}</h3>
              <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">${sectionDescription}</p>
            </div>
          `;
          
          const additionalCards = await cardService.createCards(heartHealthTests);
          allCardsHTML += additionalCards;
        }
        
        testsGrid.innerHTML = allCardsHTML;
        
        // Set up card event handlers for all tests
        const allTests = [...enrichedLinkedTests, ...heartHealthTests];
        cardService.setupCardEventHandlers(allTests);
        
        // Show the products grid now that problem-specific results are loaded
        testsGrid.style.display = 'grid';
    
        
        // Hide the loading overlay now that problem-specific results are ready
        loadingOverlay.hide();
      } else {
        console.error('Tests grid not found or no linked tests');
        // Show the products grid even if there are no linked tests
        const testsGrid = document.querySelector('.products-grid');
        if (testsGrid) {
          testsGrid.style.display = 'grid';
        }
        
        // Hide the loading overlay even if there are no linked tests
        loadingOverlay.hide();
      }
      
    } catch (error) {
      console.error('Error in fetchAndDisplayLinkedTests:', error);
    }
    
    return Promise.resolve();
  }

  // --- Dynamic Compare Button Counter ---
  function updateCompareBtnCount() {
    const compareBtn = document.querySelector('.compare-btn');
    if (!compareBtn) return;
    let count = 0;
    try {
      const comparisonTests = JSON.parse(localStorage.getItem('comparisonTests') || '[]');
      count = Array.isArray(comparisonTests) ? comparisonTests.length : 0;
    } catch (e) { count = 0; }
    if (count > 0) {
      compareBtn.textContent = `Compare (${count})`;
    } else {
      compareBtn.textContent = 'Compare';
    }
  }
  updateCompareBtnCount();

  // Listen for changes to comparisonTests in localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'comparisonTests') updateCompareBtnCount();
  });

  // Listen for custom event in case comparison is updated in this tab
  window.addEventListener('comparisonTestsUpdated', updateCompareBtnCount);

  // Patch CardService.addTestToComparison and removeTestFromComparison to dispatch event
  if (window.CardService) {
    const origAdd = window.CardService.addTestToComparison;
    window.CardService.addTestToComparison = function(test) {
      const result = origAdd.call(this, test);
      window.dispatchEvent(new Event('comparisonTestsUpdated'));
      return result;
    };
    const origRemove = window.CardService.removeTestFromComparison;
    window.CardService.removeTestFromComparison = function(test) {
      const result = origRemove.call(this, test);
      window.dispatchEvent(new Event('comparisonTestsUpdated'));
      return result;
    };
  }

  // Setup biomarker search functionality
  setupFilterPanelBiomarkerSearch();
}

// Setup biomarker search functionality for filter panel
function setupFilterPanelBiomarkerSearch() {
  const biomarkerInput = document.querySelector('.biomarker-search-input');
  const biomarkerDropdown = document.querySelector('.biomarker-dropdown');
  
  if (!biomarkerInput || !biomarkerDropdown) return;
  
  let searchTimeout;
  let selectedIndex = -1;
  
  // Update selection for filter panel
  function updateFilterPanelSelection(options) {
    options.forEach((option, index) => {
      if (index === selectedIndex) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });
  }
  
  biomarkerInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      biomarkerDropdown.style.display = 'none';
      return;
    }
    
    // Debounce the search
    searchTimeout = setTimeout(() => {
      searchFilterPanelBiomarkers(query, biomarkerDropdown);
    }, 300);
  });
  
  biomarkerInput.addEventListener('keydown', (e) => {
    const options = biomarkerDropdown.querySelectorAll('.biomarker-option');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
        updateFilterPanelSelection(options);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateFilterPanelSelection(options);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && options[selectedIndex]) {
          selectFilterPanelBiomarker(options[selectedIndex], biomarkerInput, biomarkerDropdown);
        }
        break;
      case 'Escape':
        biomarkerDropdown.style.display = 'none';
        selectedIndex = -1;
        break;
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!biomarkerInput.contains(e.target) && !biomarkerDropdown.contains(e.target)) {
      biomarkerDropdown.style.display = 'none';
      selectedIndex = -1;
    }
  });
}

// Search biomarkers function for filter panel
async function searchFilterPanelBiomarkers(query, dropdownElement) {
  try {
    const { data, error } = await supabase
      .from('biomarkers')
      .select('name')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20);
    
    if (error) {
      console.error('Error fetching biomarkers:', error);
      return;
    }
    
    const biomarkerNames = data.map(item => item.name);
    displayFilterPanelBiomarkerResults(biomarkerNames, dropdownElement);
  } catch (error) {
    console.error('Error searching biomarkers:', error);
  }
}

// Display biomarker search results for filter panel
function displayFilterPanelBiomarkerResults(biomarkers, dropdownElement) {
  if (biomarkers.length === 0) {
    dropdownElement.innerHTML = '<div class="biomarker-option">No biomarkers found</div>';
  } else {
    dropdownElement.innerHTML = biomarkers
      .map(biomarker => `<div class="biomarker-option" data-value="${biomarker}">${biomarker}</div>`)
      .join('');
    
    // Add click event listeners
    dropdownElement.querySelectorAll('.biomarker-option').forEach(option => {
      option.addEventListener('click', () => selectFilterPanelBiomarker(option, null, dropdownElement));
    });
  }
  
  dropdownElement.style.display = 'block';
}

// Select a biomarker in filter panel
function selectFilterPanelBiomarker(option, inputElement, dropdownElement) {
  const biomarkerInput = inputElement || document.querySelector('.biomarker-search-input');
  const biomarkerDropdown = dropdownElement || document.querySelector('.biomarker-dropdown');
  
  biomarkerInput.value = option.dataset.value;
  biomarkerDropdown.style.display = 'none';
  biomarkerInput.focus();
  
  // Add the selected biomarker to the URL hash (similar to how biomarker checkboxes work)
  const biomarkerName = option.dataset.value;
  let [base, paramStr] = window.location.hash.split('?');
  base = base || '#/search-results';
  let params = new URLSearchParams(paramStr || '');
  
  // Get current biomarkers
  let selectedBiomarkers = [];
  const biomarkerMatch = window.location.hash.match(/[?&]biomarkers=([^&]+)/);
  if (biomarkerMatch) {
    selectedBiomarkers = decodeURIComponent(biomarkerMatch[1]).split(',').map(b => b.trim()).filter(Boolean);
  }
  
  // Add the new biomarker if not already present
  if (!selectedBiomarkers.includes(biomarkerName)) {
    selectedBiomarkers.push(biomarkerName);
  }
  
  // Update biomarkers param
  if (selectedBiomarkers.length > 0) {
    params.set('biomarkers', selectedBiomarkers.join(','));
  }
  
  // Remove empty params
  for (const [key, value] of params.entries()) {
    if (!value) params.delete(key);
  }
  
  // Rebuild hash
  const newHash = params.toString() ? `${base}?${params.toString()}` : base;
  window.location.hash = newHash;
}

 
