// GDPR Consent Management
class GDPRConsent {
  constructor() {
    this.banner = document.getElementById('gdpr-banner');
    this.modal = document.getElementById('gdpr-manage-modal');
    this.analyticsToggle = document.getElementById('analytics-toggle');
    this.consentKey = 'gdpr-consent';
    this.init();
  }

  init() {
    // Apply stored consent immediately to prevent tracking before consent
    const existingConsent = this.getStoredConsent();
    if (existingConsent) {
      this.applyConsent(existingConsent);
    }
    
    // Ensure default consent is set (should already be set in HTML head)
    this.ensureDefaultConsent();
    
    // Show banner if no stored consent
    if (!existingConsent) {
      this.showBanner();
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Banner buttons
    if (this.banner) {
      this.banner.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action) {
          this.handleBannerAction(action);
        }
      });
    }

    // Modal close button
    const closeBtn = document.querySelector('.gdpr-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideModal());
    }

    // Save preferences button
    const saveBtn = document.querySelector('.gdpr-btn-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.savePreferences());
    }

    // Close modal when clicking outside
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.hideModal();
        }
      });
    }

    // Cookie Settings link in footer
    const cookieSettingsLink = document.getElementById('cookie-settings-link');
    if (cookieSettingsLink) {
      cookieSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.reopenBanner();
      });
    }
  }

  handleBannerAction(action) {
    switch (action) {
      case 'accept':
        this.acceptAll();
        break;
      case 'reject':
        this.rejectAll();
        break;
      case 'manage':
        this.showModal();
        break;
    }
  }

  acceptAll() {
    const consent = {
      analytics: true,
      timestamp: Date.now()
    };
    this.applyConsent(consent);
    this.hideBanner();
  }

  rejectAll() {
    const consent = {
      analytics: false,
      timestamp: Date.now()
    };
    this.applyConsent(consent);
    this.hideBanner();
  }

  showModal() {
    this.hideBanner();
    this.modal.classList.remove('hidden');
    
    // Set toggle to current consent state
    const currentConsent = this.getStoredConsent();
    if (currentConsent) {
      this.analyticsToggle.checked = currentConsent.analytics;
    } else {
      this.analyticsToggle.checked = false;
    }
  }

  hideModal() {
    this.modal.classList.add('hidden');
  }

  savePreferences() {
    const consent = {
      analytics: this.analyticsToggle.checked,
      timestamp: Date.now()
    };
    
    this.applyConsent(consent);
    this.hideModal();
  }

  showBanner() {
    this.banner.classList.remove('hidden');
  }

  hideBanner() {
    this.banner.classList.add('hidden');
  }

  saveConsent(consent) {
    localStorage.setItem(this.consentKey, JSON.stringify(consent));
  }

  getStoredConsent() {
    const stored = localStorage.getItem(this.consentKey);
    return stored ? JSON.parse(stored) : null;
  }

  applyConsent(consent) {
    // consent = { analytics: true/false, ... }
    var analyticsState = consent.analytics ? 'granted' : 'denied';

    // Save it
    localStorage.setItem(this.consentKey, JSON.stringify(consent));

    // Update Consent Mode
    gtag('consent', 'update', { analytics_storage: analyticsState });

    // Tell GTM (single, consistent event)
    window.dataLayer.push({
      event: 'gdpr_consent_update',
      analytics_storage: analyticsState
    });

    // Optional: your own app hooks
    if (consent.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
  }

  disableAnalytics() {
    // Disable GA4 tracking
    if (window.gtag) {
      window.gtag('config', 'G-L7N7DD13RV', {
        'send_page_view': false
      });
    }
  }

  enableAnalytics() {
    // Re-enable GA4 tracking
    if (window.gtag) {
      window.gtag('config', 'G-L7N7DD13RV', {
        'send_page_view': true
      });
    }
  }

  // Method to check if analytics is allowed
  isAnalyticsAllowed() {
    const consent = this.getStoredConsent();
    return consent ? consent.analytics : false;
  }

  // Method to reset consent (for testing)
  resetConsent() {
    localStorage.removeItem(this.consentKey);
    this.showBanner();
  }

  // Method to reopen banner for cookie settings
  reopenBanner() {
    this.showBanner();
  }

  // Ensure default consent is set (fallback)
  ensureDefaultConsent() {
    if (window.gtag && !window.gtag.hasOwnProperty('consent')) {
      // Fallback: set default consent if not already set
      window.gtag('consent', 'default', {
        'analytics_storage': 'denied'
      });
    }
  }
}

// Initialize GDPR consent immediately to prevent tracking before consent
window.gdprConsent = new GDPRConsent();

export default GDPRConsent;
