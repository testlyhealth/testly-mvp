import { $, $all } from './dom.js';

class Basket {
  constructor() {
    this.items = [];
    this.total = 0;
    this.init();
  }

  init() {
    // Initialize basket UI
    this.updateBasketCount();
    this.setupBasketPanel();
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

  addItem(test) {
    const existingItem = this.items.find(item => item.test_name === test.test_name);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        test_name: test.test_name,
        provider: test.provider,
        price: test.price,
        quantity: 1
      });
    }

    this.updateBasket();
  }

  removeItem(testName) {
    const index = this.items.findIndex(item => item.test_name === testName);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.updateBasket();
    }
  }

  updateQuantity(testName, quantity) {
    const item = this.items.find(item => item.test_name === testName);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeItem(testName);
      } else {
        this.updateBasket();
      }
    }
  }

  calculateTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
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
    const total = this.calculateTotal();

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
            <div class="item-quantity">
              <button class="quantity-btn minus">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn plus">+</button>
            </div>
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

    // Quantity buttons
    basketPanel.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.basket-item');
        const testName = item.querySelector('h4').textContent;
        const currentQuantity = parseInt(item.querySelector('.item-quantity span').textContent);
        
        if (e.target.classList.contains('plus')) {
          this.updateQuantity(testName, currentQuantity + 1);
        } else if (e.target.classList.contains('minus')) {
          this.updateQuantity(testName, currentQuantity - 1);
        }
      });
    });

    // Remove buttons
    basketPanel.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const testName = e.target.closest('.basket-item').querySelector('h4').textContent;
        this.removeItem(testName);
      });
    });

    // Checkout button
    basketPanel.querySelector('.checkout-btn')?.addEventListener('click', () => {
      // TODO: Implement checkout functionality
      console.log('Proceeding to checkout...');
    });
  }

  updateBasket() {
    this.updateBasketCount();
    this.updateBasketPanel();
  }
}

export const basket = new Basket(); 