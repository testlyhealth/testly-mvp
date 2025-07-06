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

  html += `</div></section>`;

  // After rendering, create and append the floating button to the end of <body>
  setTimeout(() => {
    // Remove any existing floating button
    const oldFab = document.getElementById('advanced-search-btn');
    if (oldFab && oldFab.parentNode) oldFab.parentNode.removeChild(oldFab);

    // Create the floating button
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

    document.body.appendChild(fab);
  }, 0);

  // Remove the floating button when navigating away from advanced search
  function removeAdvancedSearchFab() {
    const fab = document.getElementById('advanced-search-btn');
    if (fab && fab.parentNode) fab.parentNode.removeChild(fab);
  }
  window.addEventListener('hashchange', () => {
    if (!window.location.hash.startsWith('#/advanced-search')) {
      removeAdvancedSearchFab();
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