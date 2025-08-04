import { supabase } from '../api/supabase.js';

const AUTHORIZED_EMAILS = ['charles.djannor.hand@gmail.com', 'adamhopkinsonhill@gmail.com'];

let referenceData = {
    biomarkers: [],
    productCategories: [],
    bloodTestCategories: [],
    labAccreditations: [],
    bloodTakingMethods: [],
    providers: []
};

async function fetchReferenceData() {
    // Fetch all reference data from Supabase
    const [biomarkersRes, categoriesRes, bloodTestCategoriesRes, accreditationsRes, methodsRes, providersRes] = await Promise.all([
        supabase.from('biomarkers').select('name'),
        supabase.from('product_categories').select('name'),
        supabase.from('blood_test_categories').select('name'),
        supabase.from('lab_accreditations').select('name'),
        supabase.from('blood_taking_methods').select('name'),
        supabase.from('providers').select('name')
    ]);
    referenceData.biomarkers = (biomarkersRes.data || []).map(x => x.name);
    referenceData.productCategories = (categoriesRes.data || []).map(x => x.name);
    referenceData.bloodTestCategories = (bloodTestCategoriesRes.data || []).map(x => x.name);
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

                        // --- Enhanced Validation ---
                        const validationDiv = document.getElementById('csvValidation') || document.createElement('div');
                        validationDiv.id = 'csvValidation';
                        validationDiv.style.marginTop = '1rem';
                        let errors = [];
                        let warnings = [];
                        let missingBiomarkers = new Set();
                        let missingCategories = new Set();
                        let missingAccreditations = new Set();
                        let missingMethods = new Set();
                        let missingProviders = new Set();
                        let invalidRows = [];
                        let warningRows = [];
                        let requiredFieldErrors = [];
                        
                        data.forEach((row, idx) => {
                            let rowErrors = [];
                            let rowWarnings = [];
                            
                            // Check required fields
                            if (!row.name || row.name.trim() === '') {
                                rowErrors.push('name is required');
                            }
                            if (!row.provider_name || row.provider_name.trim() === '') {
                                rowErrors.push('provider_name is required');
                            }
                            
                            // Providers
                            if (row.provider_name && !referenceData.providers.includes(row.provider_name)) {
                                missingProviders.add(row.provider_name);
                                rowErrors.push(`Provider "${row.provider_name}" does not exist in database`);
                            }
                            
                            // Biomarkers
                            if (row.biomarkers) {
                                row.biomarkers.split(',').map(x => x.trim()).forEach(bio => {
                                    if (bio && !referenceData.biomarkers.includes(bio)) {
                                        missingBiomarkers.add(bio);
                                        rowErrors.push(`Biomarker "${bio}" does not exist in database`);
                                    }
                                });
                            }
                            
                            // Product Categories
                            if (row.product_categories) {
                                row.product_categories.split(',').map(x => x.trim()).forEach(cat => {
                                    if (cat && !referenceData.productCategories.includes(cat)) {
                                        missingCategories.add(cat);
                                        rowErrors.push(`Product category "${cat}" does not exist in database`);
                                    }
                                });
                            }
                            
                            // Blood Test Categories
                            if (row.blood_test_categories) {
                                row.blood_test_categories.split(',').map(x => x.trim()).forEach(cat => {
                                    if (cat && !referenceData.bloodTestCategories.includes(cat)) {
                                        missingCategories.add(cat);
                                        rowErrors.push(`Blood test category "${cat}" does not exist in database`);
                                    }
                                });
                            }
                            
                            // Accreditations
                            if (row.lab_accreditations) {
                                row.lab_accreditations.split(',').map(x => x.trim()).forEach(acc => {
                                    if (acc && !referenceData.labAccreditations.includes(acc)) {
                                        missingAccreditations.add(acc);
                                        rowErrors.push(`Lab accreditation "${acc}" does not exist in database`);
                                    }
                                });
                            }
                            
                            // Blood taking methods
                            if (row.blood_taking_methods) {
                                row.blood_taking_methods.split(',').map(x => x.trim()).forEach(method => {
                                    if (method && !referenceData.bloodTakingMethods.includes(method)) {
                                        missingMethods.add(method);
                                        rowErrors.push(`Blood taking method "${method}" does not exist in database`);
                                    }
                                });
                            }
                            
                            // Results returned time logic
                            const min = row.results_returned_time_min;
                            const max = row.results_returned_time_max;
                            const days = row.results_returned_time_days;
                            const hasDays = days !== undefined && days !== "";
                            const hasMin = min !== undefined && min !== "";
                            const hasMax = max !== undefined && max !== "";
                            const daysNum = Number(days);
                            const minNum = Number(min);
                            const maxNum = Number(max);
                            
                            // Check for valid combinations
                            if (!hasDays && !hasMin && !hasMax) {
                                rowErrors.push('Must provide either results_returned_time_days or both results_returned_time_min and results_returned_time_max');
                            } else if (hasDays && (!hasMin && !hasMax)) {
                                if (isNaN(daysNum)) {
                                    rowErrors.push('results_returned_time_days is not a number');
                                }
                            } else if (!hasDays && (hasMin || hasMax)) {
                                if (!hasMin || !hasMax) {
                                    rowErrors.push('Both results_returned_time_min and results_returned_time_max must be provided together');
                                } else {
                                    if (isNaN(minNum)) {
                                        rowErrors.push('results_returned_time_min is not a number');
                                    }
                                    if (isNaN(maxNum)) {
                                        rowErrors.push('results_returned_time_max is not a number');
                                    }
                                    if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
                                        rowErrors.push('results_returned_time_min is greater than results_returned_time_max');
                                    }
                                }
                            } else if (hasDays && hasMin && hasMax) {
                                // Both systems filled: warn but allow
                                if (isNaN(daysNum)) {
                                    rowErrors.push('results_returned_time_days is not a number');
                                }
                                if (isNaN(minNum)) {
                                    rowErrors.push('results_returned_time_min is not a number');
                                }
                                if (isNaN(maxNum)) {
                                    rowErrors.push('results_returned_time_max is not a number');
                                }
                                if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
                                    rowErrors.push('results_returned_time_min is greater than results_returned_time_max');
                                }
                                if (rowErrors.length === 0) {
                                    rowWarnings.push('Both results_returned_time_days and min/max are filled; only one system is usually needed');
                                }
                            }
                            
                            // URL validation
                            if (row.url && row.url.trim() !== '') {
                                try {
                                    new URL(row.url);
                                } catch (e) {
                                    rowErrors.push('Invalid URL format');
                                }
                            }
                            
                            // Price validation
                            if (row.price && row.price.trim() !== '') {
                                const priceNum = Number(row.price);
                                if (isNaN(priceNum) || priceNum < 0) {
                                    rowErrors.push('Price must be a valid positive number');
                                }
                            }
                            
                            // Trustpilot score validation
                            if (row.trustpilot_score && row.trustpilot_score.trim() !== '') {
                                const scoreNum = Number(row.trustpilot_score);
                                if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 5) {
                                    rowErrors.push('Trustpilot score must be between 0 and 5');
                                }
                            }
                            
                            if (rowErrors.length > 0) {
                                invalidRows.push({ row: idx + 2, errors: rowErrors, testName: row.name || 'UNNAMED' }); // +2 for header and 0-index
                            }
                            if (rowWarnings.length > 0) {
                                warningRows.push({ row: idx + 2, warnings: rowWarnings, testName: row.name || 'UNNAMED' }); // +2 for header and 0-index
                            }
                        });
                        
                        let report = '';
                        let validationPassed = false;
                        
                        if (invalidRows.length > 0) {
                            report += `<div style='color:#b00;'><strong>Rows with errors (upload will be blocked):</strong><ul style='margin:0.5rem 0 0 1.5rem;'>`;
                            invalidRows.forEach(r => {
                                report += `<li>Row ${r.row} (${r.testName}): ${r.errors.join('; ')}</li>`;
                            });
                            report += `</ul></div>`;
                        }
                        
                        if (warningRows.length > 0) {
                            report += `<div style='color:#f90;'><strong>Rows with warnings (will be uploaded):</strong><ul style='margin:0.5rem 0 0 1.5rem;'>`;
                            warningRows.forEach(r => {
                                report += `<li>Row ${r.row} (${r.testName}): ${r.warnings.join('; ')}</li>`;
                            });
                            report += `</ul></div>`;
                        }
                        
                        if (!report) {
                            report = `<div style='color:#080;'><strong>No errors found. Ready to upload!</strong></div>`;
                            validationPassed = true;
                        } else if (invalidRows.length === 0) {
                            validationPassed = true;
                        }
                        
                        validationDiv.innerHTML = `<h4>Validation Report</h4>${report}`;
                        fileNameDiv.parentNode.appendChild(validationDiv);

                        // Insert CSV preview after validation report
                        fileNameDiv.parentNode.appendChild(previewDiv);

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
                            // Add click handler for confirmation popup and upload logic
                            uploadBtn.onclick = async function() {
                                if (confirm('Are you sure you want to upload to Supabase?')) {
                                    uploadBtn.disabled = true;
                                    uploadBtn.textContent = 'Uploading...';
                                    try {
                                        // Use the last parsed CSV data
                                        const parsedData = window._lastParsedCsvData;
                                        const { data, error } = await supabase.rpc('bulk_insert_blood_tests_safe', { tests: parsedData });
                                        if (error) {
                                            alert('Upload failed: ' + error.message);
                                            uploadBtn.disabled = false;
                                            uploadBtn.textContent = 'Upload to Supabase';
                                        } else {
                                            if (data.errors && data.errors.length > 0) {
                                                const errorMsg = 'Upload completed with errors:\n\n' + data.errors.join('\n');
                                                alert(errorMsg);
                                            } else {
                                                alert(`Upload complete! ${data.inserted} tests added successfully.`);
                                            }
                                            uploadBtn.textContent = 'Upload to Supabase';
                                        }
                                    } catch (err) {
                                        alert('Unexpected error: ' + err.message);
                                        uploadBtn.disabled = false;
                                        uploadBtn.textContent = 'Upload to Supabase';
                                    }
                                }
                            };
                        } else {
                            uploadBtn.disabled = true;
                            uploadBtn.style.background = '#888';
                            uploadBtn.style.cursor = 'not-allowed';
                            uploadBtn.onclick = null;
                        }
                        // --- End Upload Button ---

                        // Store the last parsed CSV data globally for upload
                        window._lastParsedCsvData = data;
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