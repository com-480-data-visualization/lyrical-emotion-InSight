/**
 * tabs.js
 * Handles tab navigation functionality with improved module initialization
 */

// Global state to track module initialization status
window.moduleInitStatus = {
    'main-page': false,
    'emotion-across-culture': false,
    'emotion-linguistics': false
};

// Global state to track if tab switching is in progress
window.isTabSwitching = false;

/**
 * Function to switch between tabs with proper loading states
 * @param {string} tabId - The ID of the tab to switch to
 */
function switchToTab(tabId) {
    // Prevent multiple simultaneous tab switches
    if (window.isTabSwitching) return;
    window.isTabSwitching = true;
    
    console.log(`Switching to tab: ${tabId}`);
    
    // Show loading overlay
    showGlobalLoadingOverlay();
    
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab pane
    const selectedPane = document.getElementById(tabId);
    if (selectedPane) {
        selectedPane.classList.add('active');
    }
    
    // Activate the corresponding tab button
    const selectedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Store the active tab in session storage to maintain state on page refresh
    sessionStorage.setItem('activeTab', tabId);
    
    // Use setTimeout to ensure DOM updates before initializing modules
    setTimeout(() => {
        // Initialize modules for the active tab if not already initialized
        if (!window.moduleInitStatus[tabId]) {
            if (typeof window.initializeModulesForTab === 'function') {
                window.initializeModulesForTab(tabId)
                    .then(() => {
                        console.log(`Modules for tab ${tabId} initialized successfully`);
                        window.moduleInitStatus[tabId] = true;
                        hideGlobalLoadingOverlay();
                        window.isTabSwitching = false;
                    })
                    .catch(error => {
                        console.error(`Error initializing modules for tab ${tabId}:`, error);
                        hideGlobalLoadingOverlay();
                        window.isTabSwitching = false;
                    });
            } else {
                console.warn('initializeModulesForTab function not found');
                hideGlobalLoadingOverlay();
                window.isTabSwitching = false;
            }
        } else {
            console.log(`Modules for tab ${tabId} already initialized`);
            // Even if already initialized, trigger resize to ensure proper rendering
            if (typeof handleGlobalResize === 'function') {
                handleGlobalResize();
            }
            hideGlobalLoadingOverlay();
            window.isTabSwitching = false;
        }
        
        // Scroll to top when switching tabs
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
}

/**
 * Shows a global loading overlay while tabs are switching
 */
function showGlobalLoadingOverlay() {
    // Check if overlay already exists
    let loadingOverlay = document.getElementById('global-loading-overlay');
    
    if (!loadingOverlay) {
        // Create overlay if it doesn't exist
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'global-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading visualizations...</div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    // Show the overlay
    loadingOverlay.style.display = 'flex';
    
    // Add a timeout to auto-hide in case of errors (5 seconds)
    window.loadingOverlayTimeout = setTimeout(() => {
        hideGlobalLoadingOverlay();
        window.isTabSwitching = false;
    }, 5000);
}

/**
 * Hides the global loading overlay
 */
function hideGlobalLoadingOverlay() {
    // Clear the auto-hide timeout
    if (window.loadingOverlayTimeout) {
        clearTimeout(window.loadingOverlayTimeout);
    }
    
    const loadingOverlay = document.getElementById('global-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Creates CSS for the loading overlay if it doesn't already exist
 */
function createLoadingOverlayStyles() {
    if (!document.getElementById('loading-overlay-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'loading-overlay-styles';
        styleSheet.textContent = `
            #global-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.85);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                display: none;
            }
            
            #global-loading-overlay .loading-spinner {
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }
            
            #global-loading-overlay .loading-text {
                font-family: 'Roboto', sans-serif;
                font-size: 18px;
                color: #333;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

// Initialize tab functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create loading overlay styles
    createLoadingOverlayStyles();
    
    // Add click event listeners to all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchToTab(tabId);
        });
    });
    
    // Add click event listeners to overview cards
    document.querySelectorAll('.tab-card').forEach(card => {
        card.addEventListener('click', function() {
            const tabId = this.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (tabId) {
                switchToTab(tabId);
            }
        });
    });
    
    // Check if there's a stored active tab
    const activeTab = sessionStorage.getItem('activeTab');
    if (activeTab) {
        switchToTab(activeTab);
    } else {
        // Mark main page as initialized since it's the default
        window.moduleInitStatus['main-page'] = true;
    }
});

// Make the function available globally
window.switchToTab = switchToTab;