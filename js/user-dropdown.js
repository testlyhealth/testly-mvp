import { $, $all } from './dom.js';
import { signOut } from './auth.js';

export function initUserDropdown() {
    const loginBtn = $('.login-btn');
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown hidden';
    dropdown.innerHTML = `
        <div class="dropdown-content">
            <a href="#" class="dropdown-item account-settings">
                <i class="fas fa-cog"></i>
                Account Settings
            </a>
            <a href="#" class="dropdown-item logout">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </a>
        </div>
    `;
    
    // Add dropdown to the header
    loginBtn.parentElement.appendChild(dropdown);
    
    // Show dropdown when login button is clicked
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginBtn.classList.contains('signed-in')) {
            dropdown.classList.toggle('hidden');
        }
    });
    
    // Handle logout
    const logoutBtn = dropdown.querySelector('.logout');
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut();
            dropdown.classList.add('hidden');
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Logout failed: ' + error.message);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!loginBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
} 