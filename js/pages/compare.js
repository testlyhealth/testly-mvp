export class ComparePage {
  static async render() {
    return `
      <div class="compare-hero">
        <div class="compare-hero-content">
          <div class="back-button-container bottom-left">
            <button class="back-button" onclick="history.back()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 10H5M5 10L10 15M5 10L10 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Back
            </button>
          </div>
          <h1>Compare Blood Tests</h1>
          <p class="compare-subtitle">Compare your selected blood tests side by side</p>
        </div>
      </div>
      
      <div class="compare-content-section">
        <div class="compare-content">
          <div class="comparison-section">
            <div class="comparison-container">
              <div class="comparison-grid">
                <!-- Test Name Row -->
                <div class="row-title">Test name</div>
                <div class="grid-row">
                  <div class="grid-cell" id="test-name-1">Select a test to compare</div>
                  <div class="grid-cell" id="test-name-2">Select a test to compare</div>
                  <div class="grid-cell" id="test-name-3">Select a test to compare</div>
                </div>
                
                <!-- Provider Info Row -->
                <div class="row-title">Provider</div>
                <div class="grid-row">
                  <div class="grid-cell" id="provider-info-1">
                    <div class="provider-logo-placeholder">Logo</div>
                    <div class="provider-name">Provider</div>
                    <div class="trustpilot-score">Trustpilot Score</div>
                  </div>
                  <div class="grid-cell" id="provider-info-2">
                    <div class="provider-logo-placeholder">Logo</div>
                    <div class="provider-name">Provider</div>
                    <div class="trustpilot-score">Trustpilot Score</div>
                  </div>
                  <div class="grid-cell" id="provider-info-3">
                    <div class="provider-logo-placeholder">Logo</div>
                    <div class="provider-name">Provider</div>
                    <div class="trustpilot-score">Trustpilot Score</div>
                  </div>
                </div>
                
                <!-- Price Row -->
                <div class="row-title">Price</div>
                <div class="grid-row">
                  <div class="grid-cell" id="price-1">Price</div>
                  <div class="grid-cell" id="price-2">Price</div>
                  <div class="grid-cell" id="price-3">Price</div>
                </div>
                
                <!-- Description Row -->
                <div class="row-title">Description</div>
                <div class="grid-row">
                  <div class="grid-cell" id="description-1">Description</div>
                  <div class="grid-cell" id="description-2">Description</div>
                  <div class="grid-cell" id="description-3">Description</div>
                </div>
                
                <!-- Practical Details Row -->
                <div class="row-title">Practical details</div>
                <div class="grid-row">
                  <div class="grid-cell" id="practical-1">
                    <div class="detail-item">Results returned</div>
                    <div class="detail-item">Doctors report</div>
                  </div>
                  <div class="grid-cell" id="practical-2">
                    <div class="detail-item">Results returned</div>
                    <div class="detail-item">Doctors report</div>
                  </div>
                  <div class="grid-cell" id="practical-3">
                    <div class="detail-item">Results returned</div>
                    <div class="detail-item">Doctors report</div>
                  </div>
                </div>
                
                <!-- Blood Method Row -->
                <div class="row-title">Blood taking method</div>
                <div class="grid-row">
                  <div class="grid-cell" id="blood-method-1">Method</div>
                  <div class="grid-cell" id="blood-method-2">Method</div>
                  <div class="grid-cell" id="blood-method-3">Method</div>
                </div>
                
                <!-- Biomarkers Section -->
                <div class="row-title">Biomarkers tested</div>
                <div class="grid-row">
                  <div class="grid-cell" id="biomarker-count-1">-</div>
                  <div class="grid-cell" id="biomarker-count-2">-</div>
                  <div class="grid-cell" id="biomarker-count-3">-</div>
                </div>
                <div class="grid-row biomarkers-section">
                  <div class="grid-cell" id="biomarkers-1">
                    <div class="biomarker-content">Count</div>
                  </div>
                  <div class="grid-cell" id="biomarkers-2">
                    <div class="biomarker-content">Count</div>
                  </div>
                  <div class="grid-cell" id="biomarkers-3">
                    <div class="biomarker-content">Count</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
} 