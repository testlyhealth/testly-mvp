import { signInWithGoogle, signInWithEmail, signUpWithEmail } from './auth.js';
import store from './store.js';

// Create login modal HTML
function createLoginModal() {
  return `
    <div class="login-modal hidden">
      <div class="login-modal-content">
        <button class="close-modal">&times;</button>
        <h2>Welcome to Testly</h2>
        
        <div class="login-options">
          <button class="google-login-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo">
            Continue with Google
          </button>
          
          <div class="divider">
            <span>or</span>
          </div>
          
          <form class="email-login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required>
            </div>
            
            <button type="submit" class="email-login-btn">Sign In</button>
          </form>
          
          <p class="signup-link">
            Don't have an account? <a href="#" class="toggle-signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

// Login Modal Component
export function initLoginModal() {
    const loginBtn = document.querySelector('.login-btn');
    const headerActions = document.querySelector('.header-actions');
    
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
    
    // Create login modal
    const loginModal = document.createElement('div');
    loginModal.className = 'login-modal hidden';
    loginModal.innerHTML = `
        <div class="login-modal-content">
            <button class="close-modal">&times;</button>
            <div class="login-options">
                <button class="google-login-btn">
                    <i class="fab fa-google"></i>
                    Continue with Google
                </button>
                <div class="divider">
                    <span>or</span>
                </div>
                <form class="email-login-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="email-login-btn">Login</button>
                </form>
                <p class="signup-link">
                    Don't have an account? <a href="#/signup">Sign up</a>
                </p>
            </div>
        </div>
    `;

    // Add elements to DOM
    headerActions.appendChild(userDropdown);
    document.body.appendChild(loginModal);

    // Function to close modal
    const closeModal = () => {
        loginModal.classList.add('hidden');
    };

    // Toggle dropdown
    loginBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.firebaseAuth.currentUser) {
            userDropdown.classList.toggle('hidden');
        } else {
            loginModal.classList.remove('hidden');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-dropdown') && !e.target.closest('.login-btn')) {
            userDropdown.classList.add('hidden');
        }
    });

    // Close modal
    const closeModalBtn = loginModal.querySelector('.close-modal');
    closeModalBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeModal();
        }
    });

    // Handle Google login
    const googleLoginBtn = loginModal.querySelector('.google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                const result = await window.firebaseSignInWithPopup(window.firebaseAuth, window.firebaseGoogleProvider);
                store.setUser(result.user);
                closeModal();
            } catch (error) {
                console.error('Google login error:', error);
                store.setError('Failed to sign in with Google. Please try again.');
            }
        });
    }

    // Handle form submission
    const emailForm = loginModal.querySelector('.email-login-form');
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailForm.querySelector('#email').value;
        const password = emailForm.querySelector('#password').value;

        try {
            const result = await window.firebaseSignInWithEmailAndPassword(window.firebaseAuth, email, password);
            store.setUser(result.user);
            closeModal();
        } catch (error) {
            console.error('Login error:', error);
            store.setError('Failed to sign in. Please check your credentials.');
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