import { supabase } from '../api/supabase.js';

const AUTHORIZED_EMAILS = ['charles.djannor.hand@gmail.com', 'adamhopkinsonhill@gmail.com'];

export async function displayAdminPage() {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        return `
            <section class="admin-section">
                <div class="admin-content">
                    <h1>Admin Access</h1>
                    <div class="admin-login-container">
                        <p>Please sign in with your Google account to access the admin dashboard.</p>
                        <button id="googleLoginBtn" class="google-login-btn">
                            <img src="https://www.google.com/favicon.ico" alt="Google" class="google-icon">
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </section>
        `;
    }

    // Check if user's email is authorized
    const userEmail = session.user.email;
    if (!AUTHORIZED_EMAILS.includes(userEmail)) {
        return `
            <section class="admin-section">
                <div class="admin-content">
                    <h1>Access Denied</h1>
                    <div class="admin-login-container">
                        <p>You do not have permission to access the admin dashboard.</p>
                        <button id="logoutBtn" class="logout-btn">Sign Out</button>
                    </div>
                </div>
            </section>
        `;
    }

    // If logged in and authorized, show upload UI
    return `
        <section class="admin-section">
            <div class="admin-content">
                <h1>Upload Blood Test CSV</h1>
                <input type="file" id="csvUpload" accept=".csv" />
                <div id="csvFileName" style="margin-top:1rem;color:#007bff;"></div>
            </div>
        </section>
    `;
}

export function initializeAdminPage() {
    // Attach Google login handler if button exists
    const loginBtn = document.getElementById('googleLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            await supabase.auth.signInWithOAuth({ provider: 'google' });
        });
    }
    // Attach logout handler if button exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });
    }
    // Attach CSV upload handler
    const csvInput = document.getElementById('csvUpload');
    const fileNameDiv = document.getElementById('csvFileName');
    if (csvInput && fileNameDiv) {
        csvInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameDiv.textContent = `Loaded file: ${file.name}`;
            } else {
                fileNameDiv.textContent = '';
            }
        });
    }
} 