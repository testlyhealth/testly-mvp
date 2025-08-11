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
                            <p>We're building a powerful tool that will allow you to:</p>
                            <ul class="feature-list">
                                <li>📊 Upload screenshots of your blood test results</li>
                                <li>🤖 Use AI to automatically extract and parse your data</li>
                                <li>📈 Create beautiful charts and track trends over time</li>
                                <li>🔒 Keep all your health data private and secure</li>
                                <li>📱 Access your results from any device</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="waiting-list-form-container">
                        <div class="form-header">
                            <h3>Get Early Access</h3>
                            <p>Be the first to know when this feature launches. We'll also send you exclusive early access and special pricing.</p>
                        </div>
                        
                        <form class="waiting-list-form" id="waitingListForm" action="https://formspree.io/f/mjkokabk" method="POST">
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
                        </form>
                        
                        <div id="waitingListMessage" class="message-display" style="display: none;"></div>
                    </div>
                </div>
                
                <div class="progress-section">
                    <h3>Development Progress</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 75%"></div>
                    </div>
                    <p class="progress-text">We're 75% of the way there! Expected launch: <strong>Q1 2024</strong></p>
                </div>
            </div>
        </section>
    `;
}

// Track Waiting List page initialization
export function initializeTrackWaitingListPage() {
    initializeWaitingListForm();
    console.log('Track Waiting List page initialized');
}

// Form handling for waiting list
function initializeWaitingListForm() {
    const form = document.getElementById('waitingListForm');
    const messageDiv = document.getElementById('waitingListMessage');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const featureSuggestions = formData.get('feature_suggestions');
            
            // Show loading state
            const submitBtn = form.querySelector('.submit-button');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Joining...';
            submitBtn.disabled = true;
            
            try {
                // Submit to Formspree
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Show success message
                    showMessage('Thank you! You\'ve been added to our waiting list. We\'ll notify you as soon as the feature is ready!', 'success');
                    form.reset();
                } else {
                    throw new Error('Failed to submit');
                }
                
            } catch (error) {
                console.error('Error submitting form:', error);
                showMessage('Sorry, there was an error. Please try again.', 'error');
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
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
