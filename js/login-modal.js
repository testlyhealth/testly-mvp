import { signInWithGoogle, signInWithEmail, signUpWithEmail } from './auth.js';

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

// Initialize login modal
export function initLoginModal() {
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', createLoginModal());
  
  const modal = document.querySelector('.login-modal');
  const closeBtn = modal.querySelector('.close-modal');
  const loginBtn = document.querySelector('.login-btn');
  const googleLoginBtn = modal.querySelector('.google-login-btn');
  const emailLoginForm = modal.querySelector('.email-login-form');
  const toggleSignupLink = modal.querySelector('.toggle-signup');
  
  // Show modal when login button is clicked
  loginBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });
  
  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
  
  // Handle Google login
  googleLoginBtn.addEventListener('click', async () => {
    try {
      await signInWithGoogle();
      modal.classList.add('hidden');
    } catch (error) {
      console.error('Google login failed:', error);
      // Show error message to user
    }
  });
  
  // Handle email login
  emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailLoginForm.querySelector('#email').value;
    const password = emailLoginForm.querySelector('#password').value;
    
    try {
      await signInWithEmail(email, password);
      modal.classList.add('hidden');
    } catch (error) {
      console.error('Email login failed:', error);
      // Show error message to user
    }
  });
  
  // Toggle between sign in and sign up
  toggleSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    const isSignUp = emailLoginForm.classList.toggle('signup-mode');
    const submitBtn = emailLoginForm.querySelector('button[type="submit"]');
    const toggleText = toggleSignupLink.textContent;
    
    if (isSignUp) {
      submitBtn.textContent = 'Sign Up';
      toggleSignupLink.textContent = 'Sign in';
    } else {
      submitBtn.textContent = 'Sign In';
      toggleSignupLink.textContent = 'Sign up';
    }
  });
} 