import { $, $all } from './dom.js';

class Basket {
  constructor() {
    this.items = [];
    this.loadFromLocalStorage();
    this.total = 0;
    this.init();
  }

  init() {
    // Initialize basket UI
    this.updateBasketCount();
    this.setupBasketPanel();
  }

  loadFromLocalStorage() {
    const savedItems = localStorage.getItem('basket');
    if (savedItems) {
      this.items = JSON.parse(savedItems);
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('basket', JSON.stringify(this.items));
  }

  setupBasketPanel() {
    const basketBtn = $('.basket-btn');
    const basketPanel = $('#basket-panel');
    if (basketBtn) {
      basketBtn.addEventListener('click', () => {
        basketPanel.classList.toggle('hidden');
        this.updateBasketPanel();
      });
    }
    // Close basket when clicking outside
    document.addEventListener('click', (e) => {
      if (!basketPanel.contains(e.target) && !(basketBtn && basketBtn.contains(e.target))) {
        basketPanel.classList.add('hidden');
      }
    });
  }

  addItem(item) {
    this.items.push(item);
    this.saveToLocalStorage();
    this.updateBasketUI();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveToLocalStorage();
    this.updateBasketUI();
  }

  clear() {
    this.items = [];
    this.saveToLocalStorage();
    this.updateBasketUI();
  }

  getTotal() {
    return this.items.reduce((total, item) => total + item.price, 0);
  }

  updateBasketUI() {
    const basketCount = $('.basket-count');
    if (basketCount) {
      basketCount.textContent = this.items.length;
    }

    const basketPanel = $('#basket-panel');
    if (basketPanel) {
      if (this.items.length === 0) {
        basketPanel.innerHTML = `
          <div class="empty-basket">
            <p>Your basket is empty</p>
          </div>
        `;
      } else {
        basketPanel.innerHTML = `
          <div class="basket-items">
            ${this.items.map((item, index) => `
              <div class="basket-item">
                <div class="item-info">
                  <h4>${item.test_name}</h4>
                  <p>${item.provider}</p>
                </div>
                <div class="item-price">£${item.price}</div>
                <button class="remove-item" data-index="${index}">×</button>
              </div>
            `).join('')}
          </div>
          <div class="basket-total">
            <span>Total:</span>
            <span>£${this.getTotal()}</span>
          </div>
          <button class="checkout-btn">Proceed to Checkout</button>
        `;

        // Add event listeners to remove buttons
        basketPanel.querySelectorAll('.remove-item').forEach(button => {
          button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            this.removeItem(index);
          });
        });

        // Add event listener to checkout button
        const checkoutBtn = basketPanel.querySelector('.checkout-btn');
        if (checkoutBtn) {
          checkoutBtn.addEventListener('click', () => {
            // TODO: Implement checkout functionality
            console.log('Proceeding to checkout...');
          });
        }
      }
    }
  }

  updateBasketCount() {
    const basketBtn = $('.basket-btn');
    const itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
    if (basketBtn) {
      // Keep the SVG icon and add a count badge if needed
      if (itemCount > 0) {
        const countBadge = document.createElement('span');
        countBadge.className = 'basket-count';
        countBadge.textContent = itemCount;
        basketBtn.appendChild(countBadge);
      } else {
        // Remove any existing count badge
        const existingBadge = basketBtn.querySelector('.basket-count');
        if (existingBadge) {
          existingBadge.remove();
        }
      }
    }
  }

  updateBasketPanel() {
    const basketPanel = $('#basket-panel');
    const total = this.getTotal();

    if (this.items.length === 0) {
      basketPanel.innerHTML = `
        <div class="basket-empty">
          <p>Your basket is empty</p>
        </div>
      `;
      return;
    }

    basketPanel.innerHTML = `
      <div class="basket-header">
        <h3>Your Basket</h3>
        <button class="close-basket">×</button>
      </div>
      <div class="basket-items">
        ${this.items.map(item => `
          <div class="basket-item">
            <div class="item-details">
              <h4>${item.test_name}</h4>
              <p>${item.provider}</p>
            </div>
            <div class="item-price">£${item.price}</div>
            <button class="remove-item">×</button>
          </div>
        `).join('')}
      </div>
      <div class="basket-footer">
        <div class="basket-total">
          <span>Total:</span>
          <span>£${total.toFixed(2)}</span>
        </div>
        <button class="checkout-btn">Proceed to Checkout</button>
      </div>
    `;

    // Add event listeners for basket interactions
    this.setupBasketInteractions();
  }

  setupBasketInteractions() {
    const basketPanel = $('#basket-panel');
    
    // Close button
    basketPanel.querySelector('.close-basket')?.addEventListener('click', () => {
      basketPanel.classList.add('hidden');
    });

    // Remove buttons
    basketPanel.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.basket-item').dataset.index);
        this.removeItem(index);
      });
    });

    // Checkout button
    basketPanel.querySelector('.checkout-btn')?.addEventListener('click', () => {
      // TODO: Implement checkout functionality
      console.log('Proceeding to checkout...');
    });
  }
}

export const basket = new Basket(); 