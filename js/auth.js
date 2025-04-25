import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Get auth instance from window
const auth = window.firebaseAuth;

// Google provider
const googleProvider = new GoogleAuthProvider();

// Function to initialize auth state observer
function initializeAuth() {
  if (!auth) {
    console.error('Firebase Auth not initialized');
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      updateUIForSignedInUser(user);
    } else {
      // User is signed out
      updateUIForSignedOutUser();
    }
  });
}

// Initialize auth when the script loads
initializeAuth();

// Function to handle Google sign in
export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Function to handle email/password sign in
export async function signInWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
}

// Function to handle email/password sign up
export async function signUpWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
}

// Function to handle sign out
export async function signOut() {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Function to update UI for signed in user
function updateUIForSignedInUser(user) {
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.textContent = user.displayName || 'My Account';
    loginBtn.classList.add('signed-in');
  }
}

// Function to update UI for signed out user
function updateUIForSignedOutUser() {
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.textContent = 'Login';
    loginBtn.classList.remove('signed-in');
  }
}

// Function to get current user
export function getCurrentUser() {
  return auth?.currentUser;
}

// Function to check if user is signed in
export function isUserSignedIn() {
  return !!auth?.currentUser;
} 