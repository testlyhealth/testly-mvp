export class LoadingOverlay {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay hidden';
    this.overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
    document.body.appendChild(this.overlay);
  }

  show() {
    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }
}

// Create and export a singleton instance
export const loadingOverlay = new LoadingOverlay(); 