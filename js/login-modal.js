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
      console.log('Attempting Google sign in...');
      const user = await signInWithGoogle();
      console.log('Google sign in successful:', user);
      modal.classList.add('hidden');
    } catch (error) {
      console.error('Google login failed:', error);
      // Show error message to user
      alert('Google sign in failed: ' + error.message);
    }
  });
  
  // Handle email login
  emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailLoginForm.querySelector('#email').value;
    const password = emailLoginForm.querySelector('#password').value;
    const isSignUp = emailLoginForm.classList.contains('signup-mode');
    
    try {
      console.log(`Attempting ${isSignUp ? 'sign up' : 'sign in'} with email...`);
      const user = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      console.log(`${isSignUp ? 'Sign up' : 'Sign in'} successful:`, user);
      modal.classList.add('hidden');
    } catch (error) {
      console.error(`${isSignUp ? 'Sign up' : 'Sign in'} failed:`, error);
      // Show error message to user
      alert(`${isSignUp ? 'Sign up' : 'Sign in'} failed: ` + error.message);
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