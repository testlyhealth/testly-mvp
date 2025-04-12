// 1. Dynamically load biomarker groupings from JSON and generate form inputs
fetch("biomarker-groupings.json")
  .then(res => res.json())
  .then(groups => {
    const container = document.getElementById("biomarker-container");

    groups.forEach(group => {
      const fieldset = document.createElement("fieldset");
      fieldset.innerHTML = `
        <legend>${group.group}</legend>
        <label><input type="checkbox" class="select-all"> Select All</label>
        <div class="checkbox-group">
          ${group.biomarkers.map(b =>
            `<label><input type="checkbox" name="biomarker" value="${b}"> ${b}</label>`
          ).join("")}
        </div>
      `;
      container.appendChild(fieldset);

      // Attach simplified group toggle logic
      const selectAll = fieldset.querySelector(".select-all");
      const checkboxes = fieldset.querySelectorAll('input[name="biomarker"]');
      selectAll.addEventListener("change", function () {
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
      });
    });
  });

// 2. Form submission logic
document.getElementById("biomarker-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const selected = Array.from(document.querySelectorAll('input[name="biomarker"]:checked'))
    .map(cb => cb.value.toLowerCase());

  fetch("providers.json")
    .then(res => res.json())
    .then(data => {
      const scored = data.map(test => {
        const testBiomarkers = test.biomarkers.map(b => b.toLowerCase());
        const matches = selected.filter(b => testBiomarkers.includes(b));
        const missing = selected.filter(b => !testBiomarkers.includes(b));

        return {
          ...test,
          matchCount: matches.length,
          missing: missing
        };
      });

      const rankedAll = scored.sort((a, b) => {
        if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
        return a.price - b.price;
      });

      const ranked = rankedAll.slice(0, 3);
      displayResults(ranked, selected, scored.length);
    })
    .catch(err => {
      console.error("Error loading or processing JSON:", err);
    });
});

// 3. Results display
function displayResults(tests, selected, totalCount) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<h2>Top Matches:</h2><p>${totalCount} tests searched</p>`;

  tests.forEach(test => {
    const el = document.createElement("div");
    el.className = "result-card";
    el.innerHTML = `
      <strong>${test.provider}</strong> – ${test.test_name}<br>
      <strong>£${test.price}</strong><br>
      <em>${test.description}</em><br><br>
      <strong>Matched:</strong> ${test.matchCount} of ${selected.length} tests<br>
      <strong>Missing:</strong> ${test.missing.join(", ") || "None"}<br><br>
      <strong>Biomarkers Tested:</strong> ${test.biomarker_number}<br>
      <strong>Doctors Report:</strong> ${test["doctors report"]}<br>
      <strong>Trustpilot Score:</strong> ${test["trust pilot score"]}<br>
      <strong>Blood Test Locations:</strong> ${test["blood test location"].join(", ")}<br>
      <strong>Days Till Results:</strong> ${test["Days till results returned"]}<br>
      <strong>Lab Accreditations:</strong> ${test["lab accreditations"].join(", ")}<br>
      <strong>Pricing Info:</strong> ${test["pricing information"]}<br><br>
      <a href="${test.link}" target="_blank">Book or Learn More</a>
    `;
    resultsDiv.appendChild(el);
  });
}

// 4. Category toggle buttons
function toggleSelection(buttonId, selector) {
  const btn = document.getElementById(buttonId);
  btn.classList.toggle("active");
  const checkboxes = document.querySelectorAll(selector);
  const shouldCheck = btn.classList.contains("active");
  checkboxes.forEach(cb => cb.checked = shouldCheck);
}

document.getElementById("category-general").addEventListener("click", function () {
  toggleSelection("category-general", 'input[name="biomarker"]');
});

document.getElementById("category-tired").addEventListener("click", function () {
  toggleSelection("category-tired", ".vitamins-marker");
});
