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
    const res = await fetch('data/biomarker-groupings.json');
    let biomarkerGroupings = await res.json();

    // Sort by custom order, then by original order for the rest
    biomarkerGroupings = [
      ...customOrder
        .map(name => biomarkerGroupings.find(g => g.group === name))
        .filter(Boolean),
      ...biomarkerGroupings.filter(g => !customOrder.includes(g.group))
    ];

    biomarkerGroupings.forEach((group, idx) => {
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
            <input type="checkbox" class="select-all-checkbox" data-group="${groupId}">
            <span>Select All</span>
          </label>
          ${(group.biomarkers || []).map(biomarker => `
            <label class="biomarker-checkbox">
              <input type="checkbox" name="biomarker" value="${biomarker}" data-group="${groupId}">
              <span>${biomarker}</span>
            </label>
          `).join('')}
          ${(group["advanced-biomarkers"] || []).length > 0 ? `<div class="biomarker-subheading">Advanced</div>` : ''}
          ${(group["advanced-biomarkers"] || []).map(biomarker => `
            <label class="biomarker-checkbox advanced">
              <input type="checkbox" class="advanced" name="biomarker" value="${biomarker}" data-group="${groupId}">
              <span>${biomarker}</span>
            </label>
          `).join('')}
        </div>
      </div>`;
    });
  } catch (e) {
    html += '<div class="error">Failed to load categories.</div>';
  }

  html += `</div>
    <button class="advanced-search-btn search-btn" type="button" id="advanced-search-btn">Search</button>
    </section>`;

  // Attach event listener after content is rendered
  document.addEventListener('contentRendered', function attachSearchBtnListener() {
    const searchBtn = document.getElementById('advanced-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        console.log('Search button clicked');
        // Collect all checked biomarker values
        const checked = Array.from(document.querySelectorAll('.biomarker-checkbox input[type="checkbox"]:checked'));
        const selected = checked.map(cb => cb.value).filter(Boolean);
        if (selected.length === 0) {
          alert('Please select at least one biomarker.');
          return;
        }
        // Encode and navigate
        const params = encodeURIComponent(selected.join(','));
        window.location.hash = `#/general-health?biomarkers=${params}`;
      });
      // Remove this event listener after attaching
      document.removeEventListener('contentRendered', attachSearchBtnListener);
    }
  });

  return html;
}