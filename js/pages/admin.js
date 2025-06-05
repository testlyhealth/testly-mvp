import { supabase } from '../api/supabase.js';

const AUTHORIZED_EMAILS = ['charles.djannor.hand@gmail.com', 'adamhopkinsonhill@gmail.com'];

// Fetch table structure from Supabase
async function fetchTableStructure() {
    try {
        // Get all tables in the public schema using Supabase's built-in function
        const { data: tables, error } = await supabase
            .rpc('get_tables');

        if (error) throw error;

        // For each table, get its columns
        const tableStructures = {};
        for (const table of tables) {
            const { data: columns, error: columnError } = await supabase
                .rpc('get_table_columns', { tbl_name: table.table_name });

            if (columnError) throw columnError;
            tableStructures[table.table_name] = columns;
        }

        return tableStructures;
    } catch (error) {
        console.error('Error fetching table structure:', error);
        throw error;
    }
}

// Generate form HTML based on table structure
function generateFormHTML(tableName, columns) {
    const formGroups = columns
        .filter(col => col.column_name !== 'id' && col.column_name !== 'created_at' && col.column_name !== 'updated_at')
        .map(col => {
            const isRequired = col.is_nullable === 'NO' && !col.column_default;
            const inputType = getInputType(col.data_type);
            
            return `
                <div class="form-group">
                    <label for="${col.column_name}">${formatColumnName(col.column_name)}</label>
                    ${generateInputElement(col.column_name, inputType, isRequired)}
                </div>
            `;
        })
        .join('');

    return `
        <div class="admin-form-container">
            <h2>Add New ${formatTableName(tableName)}</h2>
            <form id="addItemForm" class="admin-form" data-table="${tableName}">
                ${formGroups}
                <button type="submit" class="submit-btn">Add ${formatTableName(tableName)}</button>
            </form>
        </div>
    `;
}

// Helper function to format table name
function formatTableName(name) {
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper function to format column name
function formatColumnName(name) {
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper function to determine input type based on data type
function getInputType(dataType) {
    switch (dataType) {
        case 'integer':
        case 'bigint':
        case 'smallint':
            return 'number';
        case 'numeric':
        case 'decimal':
        case 'real':
        case 'double precision':
            return 'number';
        case 'boolean':
            return 'checkbox';
        case 'date':
            return 'date';
        case 'timestamp':
        case 'timestamp with time zone':
            return 'datetime-local';
        case 'text':
        case 'character varying':
        default:
            return 'text';
    }
}

// Helper function to generate input element
function generateInputElement(name, type, required) {
    const requiredAttr = required ? 'required' : '';
    
    if (type === 'textarea') {
        return `<textarea id="${name}" name="${name}" rows="4" ${requiredAttr}></textarea>`;
    }
    
    return `<input type="${type}" id="${name}" name="${name}" ${requiredAttr}>`;
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

    try {
        // Fetch table structure
        const tableStructures = await fetchTableStructure();
        
        // Generate table selection dropdown
        const tableOptions = Object.keys(tableStructures)
            .map(tableName => `<option value="${tableName}">${formatTableName(tableName)}</option>`)
            .join('');

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
                    
                    <div class="table-selector">
                        <label for="tableSelect">Select Table:</label>
                        <select id="tableSelect" class="table-select">
                            <option value="">Select a table</option>
                            ${tableOptions}
                        </select>
                    </div>
                    
                    <div id="formContainer"></div>
                </div>
            </section>
        `;
    } catch (error) {
        console.error('Error setting up admin page:', error);
        return `
            <section class="admin-section">
                <div class="admin-content">
                    <h1>Error</h1>
                    <p>Failed to load admin dashboard. Please try again later.</p>
                </div>
            </section>
        `;
    }
}

// Initialize the admin page
export function initializeAdminPage() {
    console.log('Admin page initialization started');
    const checkForElements = () => {
        const tableSelect = document.getElementById('tableSelect');
        if (tableSelect) {
            console.log('Table select found, setting up handlers');
            setupAdminHandlers();
        } else {
            console.log('Table select not found, retrying...');
            setTimeout(checkForElements, 100);
        }
    };
    
    checkForElements();
}

// Setup admin handlers
function setupAdminHandlers() {
    const tableSelect = document.getElementById('tableSelect');
    const formContainer = document.getElementById('formContainer');
    const logoutBtn = document.getElementById('logoutBtn');

    if (tableSelect) {
        tableSelect.addEventListener('change', async (e) => {
            const tableName = e.target.value;
            if (tableName) {
                try {
                    const { data: columns, error } = await supabase
                        .rpc('get_table_columns', { tbl_name: tableName });

                    if (error) throw error;
                    
                    formContainer.innerHTML = generateFormHTML(tableName, columns);
                    setupFormHandler(tableName);
                } catch (error) {
                    console.error('Error loading table structure:', error);
                    showError('Failed to load table structure');
                }
            } else {
                formContainer.innerHTML = '';
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

// Setup form submission handler
function setupFormHandler(tableName) {
    const form = document.getElementById('addItemForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {};
            
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            try {
                const { error } = await supabase
                    .from(tableName)
                    .insert([data]);
                
                if (error) throw error;
                
                showSuccess(`Successfully added new ${formatTableName(tableName)}`);
                form.reset();
            } catch (error) {
                console.error('Error inserting data:', error);
                showError(`Failed to add ${formatTableName(tableName)}: ${error.message}`);
            }
        });
    }
}

// Show error message
function showError(message) {
    const adminContent = document.querySelector('.admin-content');
    if (!adminContent) {
        console.error('Error:', message);
        return;
    }
    
    const alert = document.createElement('div');
    alert.className = 'alert error';
    alert.textContent = message;
    adminContent.prepend(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Show success message
function showSuccess(message) {
    const adminContent = document.querySelector('.admin-content');
    if (!adminContent) {
        console.log('Success:', message);
        return;
    }
    
    const alert = document.createElement('div');
    alert.className = 'alert success';
    alert.textContent = message;
    adminContent.prepend(alert);
    setTimeout(() => alert.remove(), 3000);
} 