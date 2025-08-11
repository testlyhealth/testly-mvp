// Track Waiting List page module
import { $, $all } from '../dom.js';

// Track Waiting List page content
export function getTrackWaitingListPageContent() {
    return `
        <!-- Track Waiting List Page Content -->
        <section class="track-waiting-list-section">
            <div class="container">
                <div class="waiting-list-hero">
                    <h1 class="page-title">Join the Waiting List</h1>
                    <p class="page-subtitle">Track your blood test results from multiple providers in one place</p>
                </div>
                
                <div class="waiting-list-content">
                    <div class="feature-preview">
                        <div class="feature-image">
                            <img src="images/laptop-data.jpg" alt="Laptop showing data visualization" />
                        </div>
                        <div class="feature-description">
                            <h2>What's Coming Soon</h2>
                            <ul class="feature-list">
                                <li>📄 Upload an anonymised screenshot or PDF of your blood test results</li>
                                <li>📊 The system will convert these into tables</li>
                                <li>🔄 Track data from multiple providers over time</li>
                                <li>📈 Get key data charts and insights</li>
                                <li>🔒 Keep all data private and secure</li>
                                <li>📱 Access your results from any device, any time</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="waiting-list-form-container">
                        <div class="form-header">
                            <h3>Get Early Access</h3>
                            <p>Be the first to know when this feature launches. We'll also send you exclusive early access and special pricing.</p>
                        </div>
                        
                        <form class="waiting-list-form" id="trackWaitingListForm" action="https://formspree.io/f/mjkokabk" method="POST">
                            <input type="hidden" name="subject" value="Track Results Waiting List Signup">
                            <input type="hidden" name="message" value="User joined track results waiting list">
                            
                            <div class="form-group">
                                <label for="waiting-list-email">Email Address *</label>
                                <input type="email" id="waiting-list-email" name="email" placeholder="Enter your email address" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="feature-suggestions">Feature Suggestions</label>
                                <textarea id="feature-suggestions" name="feature_suggestions" rows="4" placeholder="What features would you like to see? Any specific biomarkers you want to track? Any other ideas?"></textarea>
                                <small>Optional: Help us build the perfect tool for you</small>
                            </div>
                            
                            <button type="submit" class="submit-button">
                                Join Waiting List
                            </button>
                            
                            <!-- Fallback for when JavaScript is disabled -->
                            <noscript>
                                <p style="color: #666; font-size: 0.9rem; margin-top: 1rem;">
                                    JavaScript is disabled. The form will submit normally to Formspree.
                                </p>
                            </noscript>
                        </form>
                        
                        <div id="waitingListMessage" class="message-display" style="display: none;"></div>
                    </div>
                </div>
                
                <div class="progress-section">
                    <h3>Development Progress</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 78%"></div>
                    </div>
                    <p class="progress-text">We're 78% of the way there! Expected launch: <strong>September 2025</strong></p>
                </div>
            </div>
        </section>
    `;
}

// Track Waiting List page initialization
export function initializeTrackWaitingListPage() {
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        initializeWaitingListForm();
    }, 100);
    console.log('Track Waiting List page initialized');
}

// Form handling for waiting list
function initializeWaitingListForm() {
    const form = document.getElementById('trackWaitingListForm');
    const messageDiv = document.getElementById('waitingListMessage');
    
    console.log('Initializing waiting list form, form element:', form);
    
    if (form) {
        console.log('Form found, adding submit listener');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted, preventing default');
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const featureSuggestions = formData.get('feature_suggestions');
            
            console.log('Form data:', { email, featureSuggestions });
            console.log('Form action URL:', form.action);
            
            // Show loading state
            const submitBtn = form.querySelector('.submit-button');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Joining...';
            submitBtn.disabled = true;
            
            try {
                console.log('Submitting to Formspree...');
                // Submit to Formspree
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                console.log('Formspree response status:', response.status);
                console.log('Formspree response ok:', response.ok);
                
                if (response.ok) {
                    const responseData = await response.json();
                    console.log('Formspree response data:', responseData);
                    console.log('Full Formspree response:', response);
                    
                    // Show success message with more details
                    showMessage(`Thank you! You've been added to our waiting list. We'll notify you as soon as the feature is ready! (Formspree ID: ${responseData.next || 'N/A'})`, 'success');
                    form.reset();
                    
                    // Also log to console for debugging
                    console.log('✅ Form submitted successfully to Formspree');
                    console.log('📧 Email:', email);
                    console.log('💡 Suggestions:', featureSuggestions);
                } else {
                    const errorText = await response.text();
                    console.error('Formspree error response:', errorText);
                    throw new Error(`Failed to submit: ${response.status} ${response.statusText}`);
                }
                
            } catch (error) {
                console.error('Error submitting form:', error);
                showMessage(`Sorry, there was an error: ${error.message}. Please try again.`, 'error');
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    } else {
        console.error('Waiting list form not found!');
    }
    
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.style.display = 'block';
        messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
        messageDiv.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`;
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.padding = '1rem';
        messageDiv.style.marginTop = '1rem';
        
        // Hide message after 8 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 8000);
    }
}
