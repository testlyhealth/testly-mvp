import { $ } from './dom.js';
import store from './store.js';

export function initUserDropdown() {
    const loginBtn = $('.login-btn');
    const headerActions = $('.header-actions');
    
    // Create user dropdown
    const userDropdown = document.createElement('div');
    userDropdown.className = 'user-dropdown hidden';
    userDropdown.innerHTML = `
        <div class="dropdown-content">
            <a href="#/account" class="dropdown-item">
                <i class="fas fa-user"></i>
                Account
            </a>
            <a href="#/orders" class="dropdown-item">
                <i class="fas fa-box"></i>
                Orders
            </a>
            <a href="#/cart" class="dropdown-item">
                <i class="fas fa-shopping-cart"></i>
                Cart
            </a>
            <button class="dropdown-item logout">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        </div>
    `;
    
    // Add dropdown to the header
    headerActions.appendChild(userDropdown);
    
    // Toggle dropdown
    loginBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.firebaseAuth?.currentUser) {
            userDropdown.classList.toggle('hidden');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-dropdown') && !e.target.closest('.login-btn')) {
            userDropdown.classList.add('hidden');
        }
    });
    
    // Handle logout
    const logoutBtn = userDropdown.querySelector('.logout');
    logoutBtn.addEventListener('click', async () => {
        try {
            await window.firebaseSignOut(window.firebaseAuth);
            store.setUser(null);
            userDropdown.classList.add('hidden');
        } catch (error) {
            console.error('Logout error:', error);
            store.setError('Failed to log out. Please try again.');
        }
    });
} 