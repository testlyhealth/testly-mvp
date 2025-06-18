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

                        // --- Validation ---
                        const validationDiv = document.getElementById('csvValidation') || document.createElement('div');
                        validationDiv.id = 'csvValidation';
                        validationDiv.style.marginTop = '2rem';
                        let errors = [];
                        let missingBiomarkers = new Set();
                        let missingCategories = new Set();
                        let missingAccreditations = new Set();
                        let missingMethods = new Set();
                        let missingProviders = new Set();
                        let invalidRows = [];
                        data.forEach((row, idx) => {
                            // Providers
                            if (row.provider_name && !referenceData.providers.includes(row.provider_name)) {
                                missingProviders.add(row.provider_name);
                            }
                            // Biomarkers
                            if (row.biomarkers) {
                                row.biomarkers.split(',').map(x => x.trim()).forEach(bio => {
                                    if (bio && !referenceData.biomarkers.includes(bio)) {
                                        missingBiomarkers.add(bio);
                                    }
                                });
                            }
                            // Categories
                            if (row.product_categories) {
                                row.product_categories.split(',').map(x => x.trim()).forEach(cat => {
                                    if (cat && !referenceData.productCategories.includes(cat)) {
                                        missingCategories.add(cat);
                                    }
                                });
                            }
                            // Accreditations
                            if (row.lab_accreditations) {
                                row.lab_accreditations.split(',').map(x => x.trim()).forEach(acc => {
                                    if (acc && !referenceData.labAccreditations.includes(acc)) {
                                        missingAccreditations.add(acc);
                                    }
                                });
                            }
                            // Blood taking methods
                            if (row.blood_taking_methods) {
                                row.blood_taking_methods.split(',').map(x => x.trim()).forEach(method => {
                                    if (method && !referenceData.bloodTakingMethods.includes(method)) {
                                        missingMethods.add(method);
                                    }
                                });
                            }
                            // New fields validation
                            const min = row.results_returned_time_min;
                            const max = row.results_returned_time_max;
                            const days = row.results_returned_time_days;
                            let rowErrors = [];
                            if (min === undefined || min === "" || isNaN(Number(min))) {
                                rowErrors.push('results_returned_time_min is missing or not a number');
                            }
                            if (max === undefined || max === "" || isNaN(Number(max))) {
                                rowErrors.push('results_returned_time_max is missing or not a number');
                            }
                            if (days === undefined || days === "" || isNaN(Number(days))) {
                                rowErrors.push('results_returned_time_days is missing or not a number');
                            }
                            if (!isNaN(Number(min)) && !isNaN(Number(max)) && Number(min) > Number(max)) {
                                rowErrors.push('results_returned_time_min is greater than results_returned_time_max');
                            }
                            if (rowErrors.length > 0) {
                                invalidRows.push({ row: idx + 2, errors: rowErrors }); // +2 for header and 0-index
                            }
                        });
                        let report = '';
                        let validationPassed = false;
                        if (missingProviders.size > 0) {
                            report += `<div style='color:#b00;'><strong>Unknown providers:</strong> ${Array.from(missingProviders).join(', ')}</div>`;
                        }
                        if (missingBiomarkers.size > 0) {
                            report += `<div style='color:#b00;'><strong>Missing biomarkers:</strong> ${Array.from(missingBiomarkers).join(', ')}</div>`;
                        }
                        if (missingCategories.size > 0) {
                            report += `<div style='color:#b00;'><strong>Missing product categories:</strong> ${Array.from(missingCategories).join(', ')}</div>`;
                        }
                        if (missingAccreditations.size > 0) {
                            report += `<div style='color:#b00;'><strong>Missing lab accreditations:</strong> ${Array.from(missingAccreditations).join(', ')}</div>`;
                        }
                        if (missingMethods.size > 0) {
                            report += `<div style='color:#b00;'><strong>Missing blood taking methods:</strong> ${Array.from(missingMethods).join(', ')}</div>`;
                        }
                        if (invalidRows.length > 0) {
                            report += `<div style='color:#b00;'><strong>Rows with invalid results_returned_time fields:</strong><ul style='margin:0.5rem 0 0 1.5rem;'>`;
                            invalidRows.forEach(r => {
                                report += `<li>Row ${r.row}: ${r.errors.join('; ')}</li>`;
                            });
                            report += `</ul></div>`;
                        }
                        if (!report) {
                            report = `<div style='color:#080;'><strong>No errors found. Ready to upload!</strong></div>`;
                            validationPassed = true;
                        }
                        validationDiv.innerHTML = `<h4>Validation Report</h4>${report}`;
                        fileNameDiv.parentNode.appendChild(validationDiv);

                        // --- Upload Button ---
                        let uploadBtn = document.getElementById('uploadToSupabaseBtn');
                        if (!uploadBtn) {
                            uploadBtn = document.createElement('button');
                            uploadBtn.id = 'uploadToSupabaseBtn';
                            uploadBtn.textContent = 'Upload to Supabase';
                            uploadBtn.style.marginTop = '1.5rem';
                            uploadBtn.style.padding = '0.75rem 1.5rem';
                            uploadBtn.style.fontSize = '1rem';
                            uploadBtn.style.borderRadius = '4px';
                            uploadBtn.style.border = 'none';
                            uploadBtn.style.background = '#888';
                            uploadBtn.style.color = '#fff';
                            uploadBtn.style.cursor = 'not-allowed';
                            uploadBtn.disabled = true;
                            validationDiv.parentNode.appendChild(uploadBtn);
                        }
                        if (validationPassed) {
                            uploadBtn.disabled = false;
                            uploadBtn.style.background = '#007bff';
                            uploadBtn.style.cursor = 'pointer';
                        } else {
                            uploadBtn.disabled = true;
                            uploadBtn.style.background = '#888';
                            uploadBtn.style.cursor = 'not-allowed';
                        }
                        // --- End Upload Button ---
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
                const validationDiv = document.getElementById('csvValidation');
                if (validationDiv) validationDiv.remove();
            }
        });
    }
    fetchReferenceData();
} 