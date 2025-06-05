import { supabase } from '../api/supabase.js';

const AUTHORIZED_EMAILS = ['charles.djannor.hand@gmail.com']; // Add your co-founder's email here

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

    // User is authenticated and authorized, show admin dashboard
    return `
        <section class="admin-section">
            <div class="admin-content">
                <div class="admin-header">
                    <h1>Admin Dashboard</h1>
                    <div class="admin-user-info">
                        <span>Welcome, ${userEmail}</span>
                        <button id="logoutBtn" class="logout-btn">Sign Out</button>
                    </div>
                </div>
                <div class="admin-form-container">
                    <h2>Add New Blood Test</h2>
                    <form id="addBloodTestForm" class="admin-form">
                        <div class="form-group">
                            <label for="testName">Test Name</label>
                            <input type="text" id="testName" name="testName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="provider">Provider</label>
                            <select id="provider" name="provider" required>
                                <option value="">Select Provider</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="category">Category</label>
                            <select id="category" name="category" required>
                                <option value="">Select Category</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="price">Price (£)</label>
                            <input type="number" id="price" name="price" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" rows="4" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="biomarkers">Biomarkers (comma-separated)</label>
                            <input type="text" id="biomarkers" name="biomarkers" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="turnaroundTime">Turnaround Time (days)</label>
                            <input type="number" id="turnaroundTime" name="turnaroundTime" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="sampleType">Sample Type</label>
                            <select id="sampleType" name="sampleType" required>
                                <option value="blood">Blood</option>
                                <option value="saliva">Saliva</option>
                                <option value="urine">Urine</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="submit-btn">Add Blood Test</button>
                    </form>
                </div>
            </div>
        </section>
    `;
}

// Initialize the admin page
export function initializeAdminPage() {
    setupAuthHandlers();
    loadProviders();
    loadCategories();
    setupFormHandler();
}

// Setup authentication handlers
function setupAuthHandlers() {
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.href
                    }
                });
                if (error) throw error;
            } catch (error) {
                console.error('Error signing in with Google:', error);
                showError('Failed to sign in with Google');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                window.location.reload();
            } catch (error) {
                console.error('Error signing out:', error);
                showError('Failed to sign out');
            }
        });
    }
}

// Load providers from Supabase
async function loadProviders() {
    try {
        const { data: providers, error } = await supabase
            .from('providers')
            .select('id, name')
            .order('name');
            
        if (error) throw error;
        
        const providerSelect = document.getElementById('provider');
        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider.id;
            option.textContent = provider.name;
            providerSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading providers:', error);
        showError('Failed to load providers');
    }
}

// Load categories from Supabase
async function loadCategories() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('name');
            
        if (error) throw error;
        
        const categorySelect = document.getElementById('category');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories');
    }
}

// Handle form submission
function setupFormHandler() {
    const form = document.getElementById('addBloodTestForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const biomarkers = formData.get('biomarkers').split(',').map(b => b.trim());
            
            try {
                const { data, error } = await supabase
                    .from('products')
                    .insert([{
                        name: formData.get('testName'),
                        provider_id: formData.get('provider'),
                        category_id: formData.get('category'),
                        price: parseFloat(formData.get('price')),
                        description: formData.get('description'),
                        biomarkers: biomarkers,
                        turnaround_time: parseInt(formData.get('turnaroundTime')),
                        sample_type: formData.get('sampleType')
                    }]);
                    
                if (error) throw error;
                
                showSuccess('Blood test added successfully!');
                form.reset();
            } catch (error) {
                console.error('Error adding blood test:', error);
                showError('Failed to add blood test');
            }
        });
    }
}

// Show success message
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert success';
    alert.textContent = message;
    document.querySelector('.admin-content').prepend(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Show error message
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert error';
    alert.textContent = message;
    document.querySelector('.admin-content').prepend(alert);
    setTimeout(() => alert.remove(), 3000);
} 