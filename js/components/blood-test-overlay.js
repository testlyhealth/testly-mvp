export class BloodTestOverlay {
  constructor() {
    this.overlay = null;
    this.isOpen = false;
  }

  create() {
    if (this.overlay) {
      return this.overlay;
    }

    this.overlay = document.createElement('div');
    this.overlay.className = 'blood-test-overlay';
    this.overlay.innerHTML = `
      <div class="overlay-backdrop"></div>
      <div class="overlay-content">
                          <div class="overlay-header">
            <div class="overlay-title-container">
              <h2 class="overlay-title"></h2>
              <p class="overlay-subtitle"></p>
            </div>
            <div class="header-right">
              <div class="provider-logo-container">
                <img src="" alt="Provider logo" class="provider-logo">
              </div>
            </div>
          </div>
          <button class="overlay-close" aria-label="Close overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
                           <div class="overlay-body">
            <div class="test-info">
             <div class="test-price"></div>
             <div class="test-description"></div>
                                                       <div class="test-details">
                               <div class="detail-item">
                   <p class="sample-type"></p>
                 </div>
                <div class="detail-item">
                  <p class="results-time"></p>
                </div>
                <div class="detail-item">
                  <p class="doctors-report"></p>
                </div>
              </div>
                         <div class="biomarkers-section">
               <h4 class="biomarkers-header">Biomarkers Included</h4>
               <div class="biomarkers-list"></div>
             </div>
                         <div class="overlay-actions">
               <a href="" class="book-test-overlay" target="_blank" rel="noopener noreferrer">Book test</a>
             </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    this.setupEventListeners();
    
    // Add styles
    this.addStyles();
    
    return this.overlay;
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.overlay.querySelector('.overlay-close');
    closeBtn.addEventListener('click', () => this.close());

    // Backdrop click
    const backdrop = this.overlay.querySelector('.overlay-backdrop');
    backdrop.addEventListener('click', () => this.close());

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

         // Book test link - URL will be set in populateOverlay
     const bookTestLink = this.overlay.querySelector('.book-test-overlay');
     bookTestLink.addEventListener('click', () => {
       // Close overlay after clicking the link
       setTimeout(() => this.close(), 100);
     });
  }

  addStyles() {
    if (document.getElementById('blood-test-overlay-styles')) {
      return;
    }

    const styles = document.createElement('style');
    styles.id = 'blood-test-overlay-styles';
    styles.textContent = `
      .blood-test-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
      }

      .blood-test-overlay.open {
        display: flex;
      }

      .overlay-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
      }

                           .overlay-content {
          position: relative;
          background: white;
          border-radius: 12px;
          max-width: 90vw;
          max-height: 90vh;
          width: 600px;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: overlaySlideIn 0.3s ease-out;
        }

      @keyframes overlaySlideIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

                                                                                                                             .overlay-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 40px 40px 0 40px;
          margin-bottom: 8px;
        }

         .header-right {
           display: flex;
           align-items: center;
           gap: 16px;
         }

             .overlay-title-container {
         display: flex;
         flex-direction: column;
         gap: 4px;
       }

       .overlay-title {
         margin: 0;
         font-size: 28px;
         font-weight: 600;
         color: #2563eb;
       }

               .overlay-subtitle {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #6b7280;
        }

        .trustpilot-stars {
          cursor: help;
          color: #f59e0b;
        }

             .overlay-close {
         position: absolute;
         top: 0;
         right: 0;
         background: none;
         border: none;
         cursor: pointer;
         padding: 8px;
         border-radius: 6px;
         color: #6b7280;
         transition: all 0.2s;
         z-index: 10;
       }

      .overlay-close:hover {
        background-color: #f3f4f6;
        color: #374151;
      }

                                  .overlay-body {
         padding: 0 40px 40px 40px;
       }

             .test-info {
         display: flex;
         flex-direction: column;
         gap: 12px;
         position: relative;
       }

               .provider-logo-container {
          display: flex;
          align-items: center;
        }

      .test-header {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .provider-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

             .provider-logo {
         width: 80px;
         height: 80px;
         object-fit: contain;
         border-radius: 6px;
       }

      .provider-name {
        font-weight: 500;
        color: #6b7280;
      }

      .test-name {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        line-height: 1.3;
      }

                     .test-description {
          color: #4b5563;
          line-height: 1.6;
          font-size: 14px;
          font-style: normal;
        }

             .test-price {
         font-size: 32px;
         font-weight: 700;
         color: #059669;
         display: flex;
         align-items: baseline;
         gap: 12px;
       }

       .pricing-info {
         font-size: 12px;
         font-weight: 400;
         font-style: italic;
         color: #6b7280;
         margin-left: 8px;
       }

                           .test-details {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 16px;
        }

             .detail-item {
         display: flex;
         flex-direction: column;
         gap: 4px;
         margin-left: 0;
         padding-left: 0;
       }

             .detail-item h4 {
         margin: 0;
         font-size: 14px;
         font-weight: 600;
         color: #6b7280;
         letter-spacing: 0.5px;
       }

             .detail-item p {
         margin: 0;
         color: #374151;
         font-size: 14px;
       }

             .biomarkers-section {
         display: flex;
         flex-direction: column;
         gap: 3px;
       }

             .biomarkers-section h4 {
         margin: 0;
         font-size: 14px;
         font-weight: 600;
         color: #1f2937;
         text-transform: lowercase;
       }

      .biomarkers-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 200px;
        overflow-y: auto;
        padding: 12px;
        background-color: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }

             .biomarker-item {
         display: flex;
         align-items: center;
         padding: 0.25rem 0;
         font-size: 0.8rem;
         color: #374151;
       }

       .biomarker-status {
         color: #059669;
         font-weight: 600;
         margin-right: 0.5rem;
       }

       .biomarker-name {
         color: #4b5563;
         flex: 1;
       }

       .biomarker-grouping {
         margin-bottom: 1rem;
       }

       .grouping-header {
         font-weight: 600;
         color: #374151;
         font-size: 0.9rem;
         margin-bottom: 0.5rem;
         padding-bottom: 0.25rem;
         border-bottom: 1px solid #e5e7eb;
       }

       .grouping-biomarkers {
         margin-left: 1.5rem;
       }

             .overlay-actions {
         display: flex;
         gap: 12px;
         margin-top: 6px;
         padding-top: 6px;
       }

             .book-test-overlay {
         flex: 1;
         padding: 12px 24px;
         background-color: #059669;
         color: white;
         border: none;
         border-radius: 8px;
         font-size: 16px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.2s;
         text-decoration: none;
         text-align: center;
         display: block;
       }

       .book-test-overlay:hover {
         background-color: #047857;
         transform: translateY(-1px);
         color: white;
         text-decoration: none;
       }

       .book-test-overlay:active {
         transform: translateY(0);
       }

      @media (max-width: 768px) {
        .overlay-content {
          width: 95vw;
          max-height: 95vh;
        }

        .overlay-header {
          padding: 16px 16px 0 16px;
        }

        .overlay-body {
          padding: 0 16px 16px 16px;
        }

        .overlay-title {
          font-size: 20px;
        }

        .test-name {
          font-size: 18px;
        }

        .test-price {
          font-size: 20px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  open(test) {
    console.log('BloodTestOverlay.open called with test:', test);
    
    // Remove any existing overlays first
    const existingOverlays = document.querySelectorAll('.blood-test-overlay');
    existingOverlays.forEach(existing => document.body.removeChild(existing));
    
    // Create a completely new overlay element every time
    const overlay = document.createElement('div');
    overlay.className = 'blood-test-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    overlay.innerHTML = `
      <div class="overlay-content" style="
        position: relative;
        background: white;
        border-radius: 12px;
        max-width: 90vw;
        max-height: 95vh;
        width: 600px;
        height: auto;
        overflow-y: visible;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div class="overlay-header" style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 40px 40px 0 40px;
          margin-bottom: 8px;
        ">
          <div class="overlay-title-container" style="
            display: flex;
            flex-direction: column;
            gap: 4px;
          ">
            <h2 class="overlay-title" style="
              margin: 0;
              font-size: 28px;
              font-weight: 600;
              color: #000000;
            ">${test.name}</h2>
            <p class="overlay-subtitle" style="
              margin: 0;
              font-size: 16px;
              font-weight: 500;
              color: #2563eb;
            ">${test.provider?.name || 'Provider'}</p>
          </div>
          <div class="header-right" style="
            display: flex;
            align-items: center;
            gap: 16px;
          ">
            <div class="provider-logo-container" style="
              display: flex;
              align-items: center;
            ">
              <img src="images/logos/${test.provider?.name?.toLowerCase().replace(/ /g, '') || 'provider'}.png" alt="Provider logo" class="provider-logo" style="
                width: 80px;
                height: 80px;
                object-fit: contain;
                border-radius: 6px;
              " onerror="this.style.display='none'">
            </div>
          </div>
        </div>
        
        <div class="overlay-body" style="padding: 0 40px 20px 40px;">
          <div class="test-info" style="
            display: flex;
            flex-direction: column;
            gap: 12px;
            position: relative;
          ">
            <div class="test-price" style="
              font-size: 32px;
              font-weight: 700;
              color: #059669;
              display: flex;
              align-items: baseline;
              gap: 12px;
              margin-bottom: 8px;
            ">£${test.price}</div>
            
            <div class="test-description" style="
              color: #4b5563;
              line-height: 1.6;
              font-size: 14px;
              font-style: normal;
            ">${test.description || 'No description available'}</div>
            
            <div class="test-details" style="
              display: grid;
              grid-template-columns: 1.5fr 1fr 1fr;
              gap: 16px;
            ">
              <div class="detail-item" style="
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-left: 0;
                padding-left: 0;
              ">
                <h4 style="
                  margin: 0;
                  font-size: 14px;
                  font-weight: 600;
                  color: #6b7280;
                  letter-spacing: 0.5px;
                ">Sample Type</h4>
                <p style="
                  margin: 0;
                  color: #4b5563;
                  font-size: 14px;
                                                  ">${(() => {
                    const allMethods = ['Finger prick', 'Venous at clinic', 'Phlebotomist to home', 'Self arrange'];
                    const availableMethods = Array.isArray(test.blood_taking_methods) ? test.blood_taking_methods : [];
                    
                    const emojiMap = {
                      'Finger prick': '👆',
                      'Venous at clinic': '🏥',
                      'Phlebotomist to home': '👩🏼‍⚕️',
                      'Self arrange': '🙋🏼'
                    };
                    
                    const bloodMethods = allMethods.map(method => {
                      const isAvailable = availableMethods.includes(method);
                      const icon = isAvailable ? (emojiMap[method] || '❓') : '✗';
                      return isAvailable ? `<span title="${method}" style="cursor: help;">${icon}</span>` : null;
                    }).filter(Boolean).join(' ');
                    
                    return bloodMethods || 'Not specified';
                  })()}</p>
              </div>
              <div class="detail-item" style="
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-left: 0;
                padding-left: 0;
              ">
                <h4 style="
                  margin: 0;
                  font-size: 14px;
                  font-weight: 600;
                  color: #6b7280;
                  letter-spacing: 0.5px;
                ">Results Time</h4>
                <p style="
                  margin: 0;
                  color: #4b5563;
                  font-size: 14px;
                ">${test.results_returned_time_min && test.results_returned_time_max ? `${test.results_returned_time_min}-${test.results_returned_time_max} days` : test.results_returned_time_days ? `${test.results_returned_time_days} days` : 'Not specified'}</p>
              </div>
              <div class="detail-item" style="
                display: flex;
                flex-direction: column;
                gap: 4px;
                margin-left: 0;
                padding-left: 0;
              ">
                <h4 style="
                  margin: 0;
                  font-size: 14px;
                  font-weight: 600;
                  color: #6b7280;
                  letter-spacing: 0.5px;
                ">Doctors Report</h4>
                <p style="
                  margin: 0;
                  color: #4b5563;
                  font-size: 14px;
                ">${test.doctors_report ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div class="biomarkers-section" style="margin-bottom: 12px;">
              <h4 style="
                margin: 0 0 4px 0;
                color: #1f2937;
                font-size: 12px;
                font-weight: 600;
              ">${test.biomarker_names && test.biomarker_names.length > 0 ? test.biomarker_names.length : 0} biomarkers included</h4>
              <div class="biomarkers-list" style="
                display: flex;
                flex-direction: column;
                gap: 8px;
              ">${test.grouped_biomarkers && Object.keys(test.grouped_biomarkers).length > 0 ? 
                Object.entries(test.grouped_biomarkers).map(([groupName, biomarkers]) => `
                                    <div class="biomarker-group" style="margin-bottom: 8px; border: none; outline: none;">
                    <h5 style="
                      margin: 0 0 4px 0;
                      color: #374151;
                      font-size: 13px;
                      font-weight: 600;
                      text-transform: capitalize;
                      text-decoration: underline;
                    ">${groupName}</h5>
                    <div class="biomarker-items" style="
                      display: flex;
                      flex-direction: row;
                      flex-wrap: wrap;
                      gap: 8px;
                      margin: 0;
                      padding: 0;
                      border: none;
                      outline: none;
                    ">${biomarkers.map(biomarker => 
                      `<span style="
                        color: #4b5563;
                        font-size: 14px;
                        font-weight: 500;
                      ">${biomarker}</span>`
                    ).join(', ')}</div>
                  </div>
                `).join('') : 
                (test.biomarker_names && test.biomarker_names.length > 0 ? test.biomarker_names.map(biomarker => 
                  `<span style="
                    color: #4b5563;
                    font-size: 14px;
                    font-weight: 500;
                  ">${biomarker}</span>`
                ).join('') : '<span style="color: #6b7280;">No biomarkers specified</span>')
              }</div>
            </div>
            
            <div class="overlay-actions" style="text-align: center; margin-bottom: 0;">
              <a href="${test.url}" class="book-test-overlay" target="_blank" rel="noopener noreferrer" style="
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: background-color 0.2s;
              ">Book Test</a>
            </div>
          </div>
        </div>
        
        <button class="overlay-close" style="
          position: absolute;
          top: 0;
          right: 0;
          background: none;
          border: none;
          cursor: pointer;
          padding: 16px;
          border-radius: 6px;
          color: #6b7280;
          transition: all 0.2s;
          z-index: 10;
          font-size: 28px;
          font-weight: bold;
          min-width: 48px;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">&times;</button>
      </div>
    `;
    
    // Add close functionality
    const closeBtn = overlay.querySelector('.overlay-close');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    });
    
    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
      }
    });
    
    // Add to DOM
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    console.log('Simple overlay created and added to DOM');
  }

  close() {
    if (!this.overlay) return;

    this.overlay.classList.remove('open');
    this.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Remove overlay from DOM after animation
    setTimeout(() => {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
        this.overlay = null;
      }
    }, 300);
  }

  populateOverlay(test) {
    const overlay = this.overlay;
    
    // Set test ID for add to basket functionality
    overlay.dataset.testId = test.id;

         // Provider info for header title
     const logoMap = {
       'Numan': 'numan.png',
       'Nuffield Health': 'nuffield.png',
       'London Health Company': 'london health company.png',
       'Lloyds Pharmacy': 'lloyds pharmacy.png',
       'London Medical Laboratory': 'london medical laboratory.png',
       'Selph': 'selph.png',
       'Bluecrest': 'bluecrest.png',
       'Lola': 'lola.png',
       'Superdrug': 'superdrug.png',
       'Thriva': 'thriva.png',
       'Forth': 'forth.png',
       'Medichecks': 'medichecks.png',
       'Blue horizon blood tests': 'blue horizon blood tests.png',
       'Blood Tests London': 'bloodtestslondon.png',
       'Goodbody Clinic': 'goodbodyclinic.png',
       'One day tests': 'one day tests.png'
     };

     // Handle provider - it's a nested object from the database
     const providerName = test.provider?.name || 'Unknown Provider';
     
     // Set the header title and subtitle separately
     const testName = test.test_name || test.name || 'Unknown Test';
     overlay.querySelector('.overlay-title').textContent = testName;
     
           // Generate Trustpilot stars
      const score = Number(test.trustpilot_score);
      let stars = '';
      if (!isNaN(score)) {
        const fullStars = Math.floor(score);
        const halfStar = score - fullStars >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        for (let i = 0; i < fullStars; i++) stars += '★';
        if (halfStar) stars += '⯨';
        for (let i = 0; i < emptyStars; i++) stars += '☆';
      }
      
      overlay.querySelector('.overlay-subtitle').innerHTML = `${providerName}: <span class="trustpilot-stars" title="Trustpilot score: ${score}">${stars}</span>`;
     
     // Set provider logo
     const providerLogo = overlay.querySelector('.provider-logo');
     const logoFile = logoMap[providerName] || `${String(providerName).toLowerCase().replace(/ /g, '')}.png`;
     providerLogo.src = `images/logos/${logoFile}`;
     providerLogo.alt = `${providerName} logo`;
    overlay.querySelector('.test-description').textContent = test.description || 'No description available';
    
         // Handle price and pricing information
     const priceElement = overlay.querySelector('.test-price');
     const pricingInfo = test.pricing_information || '';
     if (pricingInfo) {
       priceElement.innerHTML = `£${test.price} <span class="pricing-info">Pricing info: ${pricingInfo}</span>`;
     } else {
       priceElement.textContent = `£${test.price}`;
     }
    
         // Handle blood taking methods with emojis
     const allMethods = ['Finger prick', 'Venous at clinic', 'Phlebotomist to home', 'Self arrange'];
     const availableMethods = Array.isArray(test.blood_taking_methods) ? test.blood_taking_methods : [];
     
     const emojiMap = {
       'Finger prick': '👆',
       'Venous at clinic': '🏥',
       'Phlebotomist to home': '👩🏼‍⚕️',
       'Self arrange': '🙋🏼'
     };
     
     const displayTextMap = {
       'Finger prick': 'Finger prick',
       'Venous at clinic': 'Venous at clinic',
       'Phlebotomist to home': 'Phlebotomist to home',
       'Self arrange': 'Self arrange'
     };
     
                                               const bloodMethods = allMethods.map(method => {
          const isAvailable = availableMethods.includes(method);
          const icon = isAvailable ? (emojiMap[method] || '❓') : '✗';
          const text = displayTextMap[method] || method;
          return isAvailable ? `<span title="${text}" style="cursor: help;">${icon}</span>` : null;
        }).filter(Boolean).join(' ');
       
       overlay.querySelector('.sample-type').innerHTML = `Sample type: ${bloodMethods}` || 'Sample type: N/A';
    
               // Handle results time - check for range or single value (using same logic as cardService)
        const resultsTimeText = (() => {
       if (test.results_returned_time_days) {
         return `Results in: ${test.results_returned_time_days} days`;
       } else if (test.results_returned_time_min && test.results_returned_time_max) {
         return `Results in: ${test.results_returned_time_min} - ${test.results_returned_time_max} days`;
       } else {
         return 'Results in: N/A days';
       }
     })();
           overlay.querySelector('.results-time').textContent = resultsTimeText;
      
      // Handle doctors report
      const doctorsReportElement = overlay.querySelector('.doctors-report');
      if (test.doctors_report) {
        doctorsReportElement.innerHTML = `Doctors report: <span style="color: #059669; font-weight: 600;">✓</span>`;
      } else {
        doctorsReportElement.innerHTML = `Doctors report: <span style="color: #dc2626; font-weight: 600;">✗</span>`;
      }

                   // Biomarkers - use grouped style like compare page
      const biomarkersList = overlay.querySelector('.biomarkers-list');
      const biomarkersHeader = overlay.querySelector('.biomarkers-header');
      
      if (test.grouped_biomarkers && Object.keys(test.grouped_biomarkers).length > 0) {
        let html = '';
        let totalBiomarkers = 0;
        
        // Sort groups alphabetically
        const sortedGroups = Object.keys(test.grouped_biomarkers).sort();
        
        for (const groupName of sortedGroups) {
          const biomarkers = test.grouped_biomarkers[groupName] || [];
          totalBiomarkers += biomarkers.length;
          
          if (biomarkers.length > 0) {
            html += `<div class="biomarker-grouping">
              <div class="grouping-header">${groupName}</div>
              <div class="grouping-biomarkers">`;
            
            // Sort biomarkers alphabetically within each group
            const sortedBiomarkers = biomarkers.sort();
            
            for (const biomarker of sortedBiomarkers) {
              html += `<div class="biomarker-item">
                <span class="biomarker-status">✓</span>
                <span class="biomarker-name">${biomarker}</span>
              </div>`;
            }
            
            html += `</div></div>`;
          }
        }
        
                 biomarkersHeader.textContent = `${totalBiomarkers} biomarkers tested`;
         biomarkersList.innerHTML = html;
       } else {
                  biomarkersHeader.textContent = '0 biomarkers tested';
          biomarkersList.innerHTML = '<div class="biomarker-item">No biomarker information available</div>';
        }
       
       // Set the book test URL
       const bookTestLink = overlay.querySelector('.book-test-overlay');
       if (test.url) {
         bookTestLink.href = test.url;
       } else {
         bookTestLink.href = '#';
         bookTestLink.style.opacity = '0.5';
         bookTestLink.style.cursor = 'not-allowed';
         bookTestLink.onclick = (e) => e.preventDefault();
       }
  }
}

// Export singleton instance
export const bloodTestOverlay = new BloodTestOverlay(); 