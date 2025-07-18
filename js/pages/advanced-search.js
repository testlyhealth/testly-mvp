import { supabase } from '../api/supabase.js';

export async function displayAdvancedSearchPage() {
  // Desired order for the first two rows
  const customOrder = [
    'Full blood count',
    'Vitamins & Minerals',
    'Hormones',
    'Iron status',
    'Liver Function',
    'Thyroid hormones',
    'Cardiovascular Health'
  ];

  let html = `<section class="advanced-search-page">
    <h1>Advanced Search</h1>
    <div class="biomarker-groups-window">
  `;

  try {
    // Fetch biomarker groupings and their associated biomarkers from Supabase
    const { data: groupings, error: groupingsError } = await supabase
      .from('biomarker_groupings')
      .select(`
        id,
        name,
        biomarkers:biomarker_groupings_link_table(
          biomarker:biomarkers(
            id,
            name
          )
        )
      `)
      .order('name');

    if (groupingsError) {
      throw groupingsError;
    }

    // Merge advanced and regular groupings
    const merged = {};
    groupings.forEach(grouping => {
      // Normalize group name (remove ' (advanced)')
      const isAdvanced = grouping.name.toLowerCase().endsWith(' (advanced)');
      const baseName = isAdvanced ? grouping.name.replace(/ \(advanced\)$/i, '') : grouping.name;
      if (!merged[baseName]) {
        merged[baseName] = { group: baseName, id: grouping.id, biomarkers: [], advanced: [] };
      }
      const biomarkerNames = grouping.biomarkers.map(link => link.biomarker?.name).filter(Boolean);
      if (isAdvanced) {
        merged[baseName].advanced.push(...biomarkerNames);
      } else {
        merged[baseName].biomarkers.push(...biomarkerNames);
      }
    });

    // Convert merged object to array
    let biomarkerGroupings = Object.values(merged);

    // Sort by custom order, then by original order for the rest
    const sortedGroupings = [
      ...customOrder
        .map(name => biomarkerGroupings.find(g => g.group === name))
        .filter(Boolean),
      ...biomarkerGroupings.filter(g => !customOrder.includes(g.group))
    ];

    sortedGroupings.forEach((group, idx) => {
      const groupId = `group-${group.id || idx}`;
      const infoText = group.info || `More information about ${group.group}`;
      html += `<div class="biomarker-group-block" data-group="${groupId}">
        <div class="biomarker-group-header">
          <h2 class="biomarker-group-heading">
            ${group.group}
            <span class="info-icon" tabindex="0" aria-label="Info" data-tooltip="${infoText}">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" stroke="#888" stroke-width="1.5" fill="#f8f9fb"/><text x="10" y="15" text-anchor="middle" font-size="12" fill="#888" font-family="Arial" font-weight="bold">i</text></svg>
            </span>
          </h2>
        </div>
        <div class="biomarker-list">
          <label class="biomarker-checkbox select-all-inline">
            <input type="checkbox" class="select-all-checkbox" data-group="${groupId}" data-section="regular">
            <span>Select All</span>
          </label>
          ${(group.biomarkers || []).map(biomarker => `
            <label class="biomarker-checkbox">
              <input type="checkbox" name="biomarker" value="${biomarker}" data-group="${groupId}" data-section="regular">
              <span>${biomarker}</span>
            </label>
          `).join('')}
          ${(group.advanced || []).length > 0 ? `<div class="biomarker-subheading">Advanced</div>
            <label class=\"biomarker-checkbox select-all-inline\">
              <input type=\"checkbox\" class=\"select-all-checkbox\" data-group=\"${groupId}\" data-section=\"advanced\">
              <span>Select All</span>
            </label>` : ''}
          ${(group.advanced || []).map(biomarker => `
            <label class="biomarker-checkbox" style="margin-left:1.5rem;">
              <input type="checkbox" name="biomarker" value="${biomarker}" data-group="${groupId}" data-section="advanced">
              <span>${biomarker}</span>
            </label>
          `).join('')}
        </div>
      </div>`;
    });
  } catch (e) {
    console.error('Error loading biomarker groupings:', e);
    html += '<div class="error">Failed to load biomarker groupings.</div>';
  }

  html += `</div>
  </section>`;

  // After rendering, create and append the floating buttons to the end of <body>
  setTimeout(() => {
    // Remove any existing floating buttons
    const oldFab = document.getElementById('advanced-search-btn');
    if (oldFab && oldFab.parentNode) oldFab.parentNode.removeChild(oldFab);
    
    const oldBackBtn = document.getElementById('advanced-back-btn');
    if (oldBackBtn && oldBackBtn.parentNode) oldBackBtn.parentNode.removeChild(oldBackBtn);

    // Create the floating search button
    const fab = document.createElement('button');
    fab.className = 'advanced-search-btn advanced-search-fab';
    fab.type = 'button';
    fab.id = 'advanced-search-btn';
    fab.textContent = 'Search';

    // Add the click event
    fab.addEventListener('click', () => {
      const checked = Array.from(document.querySelectorAll('.biomarker-checkbox input[type="checkbox"]:checked'));
      const selected = checked.map(cb => cb.value).filter(Boolean);
      if (selected.length === 0) {
        alert('Please select at least one biomarker.');
        return;
      }
      const params = encodeURIComponent(selected.join(','));
      window.location.hash = `#/general-health?biomarkers=${params}`;
    });

    // Create the floating back button
    const backBtn = document.createElement('button');
    backBtn.className = 'back-button advanced-back-fab';
    backBtn.type = 'button';
    backBtn.id = 'advanced-back-btn';
    backBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Back
    `;

    // Add the click event
    backBtn.addEventListener('click', () => {
      window.history.back();
    });

    document.body.appendChild(fab);
    document.body.appendChild(backBtn);
  }, 0);

  // Remove the floating buttons when navigating away from advanced search
  function removeAdvancedSearchFab() {
    const fab = document.getElementById('advanced-search-btn');
    if (fab && fab.parentNode) fab.parentNode.removeChild(fab);
    
    const backBtn = document.getElementById('advanced-back-btn');
    if (backBtn && backBtn.parentNode) backBtn.parentNode.removeChild(backBtn);
  }
  window.addEventListener('hashchange', () => {
    if (!window.location.hash.startsWith('#/advanced')) {
      removeAdvancedSearchFab();
    }
  });

  // After rendering, create and append the floating search bar to the end of <body>
  setTimeout(() => {
    // Remove any existing floating search bar
    const oldBar = document.getElementById('biomarker-search-bar');
    if (oldBar && oldBar.parentNode) oldBar.parentNode.removeChild(oldBar);

    // Create the floating search bar
    const bar = document.createElement('div');
    bar.className = 'biomarker-search-bar';
    bar.id = 'biomarker-search-bar';
    bar.innerHTML = '<input type="text" id="biomarker-search-box" placeholder="Find a biomarker or group...">';
    document.body.appendChild(bar);

    // --- Biomarker search functionality ---
    const searchBox = document.getElementById('biomarker-search-box');
    if (searchBox) {
      searchBox.addEventListener('input', function() {
        document.querySelectorAll('.biomarker-group-block, .biomarker-checkbox, .biomarker-group-heading').forEach(el => {
          el.classList.remove('biomarker-search-highlight');
        });
        const value = searchBox.value.trim().toLowerCase();
        if (!value) return;
        let firstMatch = null;
        document.querySelectorAll('.biomarker-group-block').forEach(groupBlock => {
          const heading = groupBlock.querySelector('.biomarker-group-heading');
          if (heading && heading.textContent.toLowerCase().includes(value)) {
            heading.classList.add('biomarker-search-highlight');
            if (!firstMatch) firstMatch = heading;
          }
          groupBlock.querySelectorAll('.biomarker-checkbox').forEach(label => {
            if (label.textContent.toLowerCase().includes(value)) {
              label.classList.add('biomarker-search-highlight');
              if (!firstMatch) firstMatch = label;
            }
          });
        });
        if (firstMatch) {
          firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }, 0);

  // Remove the floating search bar when navigating away from advanced search
  function removeAdvancedSearchBar() {
    const bar = document.getElementById('biomarker-search-bar');
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
  }
  window.addEventListener('hashchange', () => {
    if (!window.location.hash.startsWith('#/advanced')) {
      removeAdvancedSearchBar();
    }
  });

  // Attach event listeners after content is rendered
  document.addEventListener('contentRendered', function attachEventListeners() {
    // Select All functionality for each section (regular/advanced) in each group
    const selectAllCheckboxes = document.querySelectorAll('.select-all-checkbox');
    selectAllCheckboxes.forEach(selectAllCheckbox => {
      selectAllCheckbox.addEventListener('change', (e) => {
        const groupId = e.target.dataset.group;
        const section = e.target.dataset.section;
        const isChecked = e.target.checked;
        // Find all biomarker checkboxes in this group and section
        const biomarkerCheckboxes = document.querySelectorAll(`[data-group="${groupId}"][data-section="${section}"]`);
        biomarkerCheckboxes.forEach(checkbox => {
          checkbox.checked = isChecked;
        });
      });
    });

    // Individual biomarker checkbox functionality
    const biomarkerCheckboxes = document.querySelectorAll('input[name="biomarker"]');
    biomarkerCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const groupId = e.target.dataset.group;
        const section = e.target.dataset.section;
        // Find all biomarker checkboxes in this group and section
        const groupCheckboxes = document.querySelectorAll(`[data-group="${groupId}"][data-section="${section}"]`);
        const selectAllCheckbox = document.querySelector(`.select-all-checkbox[data-group="${groupId}"][data-section="${section}"]`);
        // Check if all biomarkers in this section are selected
        const allChecked = Array.from(groupCheckboxes).every(cb => cb.checked);
        // Update the select all checkbox
        if (selectAllCheckbox) {
          selectAllCheckbox.checked = allChecked;
        }
      });
    });

    // Remove this event listener after attaching
    document.removeEventListener('contentRendered', attachEventListeners);
  });

  return html;
}