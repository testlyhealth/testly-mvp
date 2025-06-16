import { supabase } from '../api/supabase.js';

const AUTHORIZED_EMAILS = ['charles.djannor.hand@gmail.com', 'adamhopkinsonhill@gmail.com'];

let referenceData = {
    biomarkers: [],
    productCategories: [],
    labAccreditations: [],
    bloodTakingMethods: [],
    providers: []
};

async function fetchReferenceData() {
    // Fetch all reference data from Supabase
    const [biomarkersRes, categoriesRes, accreditationsRes, methodsRes, providersRes] = await Promise.all([
        supabase.from('biomarkers').select('name'),
        supabase.from('product_categories').select('name'),
        supabase.from('lab_accreditations').select('name'),
        supabase.from('blood_taking_methods').select('name'),
        supabase.from('providers').select('name')
    ]);
    referenceData.biomarkers = (biomarkersRes.data || []).map(x => x.name);
    referenceData.productCategories = (categoriesRes.data || []).map(x => x.name);
    referenceData.labAccreditations = (accreditationsRes.data || []).map(x => x.name);
    referenceData.bloodTakingMethods = (methodsRes.data || []).map(x => x.name);
    referenceData.providers = (providersRes.data || []).map(x => x.name);
    // Log for debugging
    console.log('Reference Data:', referenceData);
}

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
                <h1>Admin Page</h1>
                <div style="margin-bottom:0;font-size:1.1rem;">Welcome ${session.user.user_metadata.full_name || session.user.email}</div>
                <div style="margin-top:4rem;"><h3>Upload Blood Test CSV</h3>
                <input type="file" id="csvUpload" accept=".csv" />
                <div id="csvFileName" style="margin-top:1rem;color:#007bff;"></div></div>
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
                // Parse CSV using PapaParse
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        const data = results.data;
                        // Show preview of first 5 rows
                        const previewDiv = document.getElementById('csvPreview') || document.createElement('div');
                        previewDiv.id = 'csvPreview';
                        previewDiv.style.marginTop = '1rem';
                        if (data.length === 0) {
                            previewDiv.textContent = 'No data found in CSV.';
                        } else {
                            let html = '<strong>CSV Preview (first 5 rows):</strong><br><table style="border-collapse:collapse;margin-top:0.5rem;">';
                            html += '<tr>' + Object.keys(data[0]).map(key => `<th style=\"border:1px solid #ccc;padding:2px 6px;\">${key}</th>`).join('') + '</tr>';
                            data.slice(0, 5).forEach(row => {
                                html += '<tr>' + Object.values(row).map(val => `<td style=\"border:1px solid #ccc;padding:2px 6px;\">${val}</td>`).join('') + '</tr>';
                            });
                            html += '</table>';
                            previewDiv.innerHTML = html;
                        }
                        fileNameDiv.parentNode.appendChild(previewDiv);
                    },
                    error: function(err) {
                        const previewDiv = document.getElementById('csvPreview') || document.createElement('div');
                        previewDiv.id = 'csvPreview';
                        previewDiv.style.marginTop = '1rem';
                        previewDiv.textContent = 'Error parsing CSV: ' + err.message;
                        fileNameDiv.parentNode.appendChild(previewDiv);
                    }
                });
            } else {
                fileNameDiv.textContent = '';
                const previewDiv = document.getElementById('csvPreview');
                if (previewDiv) previewDiv.remove();
            }
        });
    }
    fetchReferenceData();
} 