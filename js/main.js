/**
 * main.js
 * Main initialization and configuration file for the lyrical emotion visualization project
 * Responsible for initializing modules and coordinating cross-module functionality
 */

/**
 * Initialize all visualization modules when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Cross-Cultural Dynamics of Emotional Expression in Lyrics visualizations');
    
    try {
        // Register global event listeners
        registerGlobalEventListeners();
        
        // Make module initialization function available globally
        window.initializeModulesForTab = initializeModulesForTab;
        
        // Initialize modules for initial active tab (handled by tabs.js)
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

/**
 * Initialize modules for a specific tab
 * @param {string} tabId - The ID of the tab to initialize modules for
 * @returns {Promise} - A promise that resolves when all modules are initialized
 */
function initializeModulesForTab(tabId) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`Initializing modules for tab: ${tabId}`);
            
            // Clear any existing visualizations first
            cleanupVisualizationsForTab(tabId);
            
            if (tabId === 'main-page') {
                // Nothing to initialize for the main page
                resolve();
            } 
            else if (tabId === 'emotion-across-culture') {
                initializeEmotionAcrossCultureModules().then(resolve).catch(reject);
            } 
            else if (tabId === 'emotion-linguistics') {
                initializeEmotionLinguisticsModules().then(resolve).catch(reject);
            }
            else {
                resolve(); // Unknown tab, nothing to initialize
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Initialize modules for the Emotion Across Culture tab
 * @returns {Promise} - A promise that resolves when all modules are initialized
 */
function initializeEmotionAcrossCultureModules() {
    return new Promise(async (resolve, reject) => {
        try {
            // Create an array of initialization promises
            const initPromises = [];
            
            // Initialize Module A: Historical Trends in Lyrical Tone
            if (typeof initModuleA === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleA();
                        console.log('Module A (Historical Trends) initialized');
                        resolve();
                    })
                );
            }
            
            // Initialize Module B: Temporal Emotion Trends Within Languages
            if (typeof initModuleB === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleB();
                        console.log('Module B (Emotion Trends by Language) initialized');
                        resolve();
                    })
                );
            }
            
            // Initialize Module C: Emotional Dimensions Across Languages
            if (typeof initModuleC === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleC();
                        console.log('Module C (Emotion Dimensions) initialized');
                        resolve();
                    })
                );
            }
            
            // Initialize Module D: KMeans Clustering Sankey Diagram
            if (typeof initModuleD === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleD();
                        console.log('Module D (Clustering Analysis) initialized');
                        resolve();
                    })
                );
            }
            
            // Initialize Module E: Valence-Arousal Relationship
            if (typeof initModuleE === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleE();
                        console.log('Module E (Valence-Arousal Profiles) initialized');
                        resolve();
                    })
                );
            }
            
            // Wait for all modules to initialize
            await Promise.all(initPromises);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Initialize modules for the Emotion & Linguistics tab
 * @returns {Promise} - A promise that resolves when all modules are initialized
 */
function initializeEmotionLinguisticsModules() {
    return new Promise(async (resolve, reject) => {
        try {
            // Create an array of initialization promises
            const initPromises = [];
            
            // Initialize Module VAD: VAD Correlation Heatmap
            if (typeof initModuleVAD === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleVAD();
                        console.log('Module VAD (Correlation Heatmap) initialized');
                        resolve();
                    })
                );
            }

            // Initialize Module UMAP: UMAP Clustering Comparison
            if (typeof initModuleUmap === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleUmap();
                        console.log('Module UMAP (UMAP Clustering) initialized');
                        resolve();
                    })
                );
            }

            // Initialize Module CMatrix: Confusion Matrix
            if (typeof initModuleCMatrix === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleCMatrix();
                        console.log('Module CMatrix (Confusion Matrix) initialized');
                        resolve();
                    })
                );
            }

            // Initialize Module Struct-E: Structural-Emotional Correlation
            if (typeof initModuleStructE === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleStructE();
                        console.log('Module Struct-E (Structural-Emotional Correlation) initialized');
                        resolve();
                    })
                );
            }

            // Initialize Module Episode-S: Episode Signature Features
            if (typeof initModuleEpisodeS === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleEpisodeS();
                        console.log('Module Episode-S (Episode Signature) initialized');
                        resolve();
                    })
                );
            }

            // Initialize Module Episode Signature F
            if (typeof initModuleEpisodeSigF === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleEpisodeSigF();
                        console.log('Module Episode Signature (Linguistic Features) initialized');
                        resolve();
                    })
                );
            }

            // Initialize Module Episode Signature M
            if (typeof initModuleEpisodeSigM === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleEpisodeSigM();
                        console.log('Module Episode Signature initialized');
                        resolve();
                    })
                );
            }

            // Initialize Module Spearman: Feature Correlation Matrix
            if (typeof initModuleSpearman === 'function') {
                initPromises.push(
                    new Promise(resolve => {
                        initModuleSpearman();
                        console.log('Module Spearman (Feature Correlation) initialized');
                        resolve();
                    })
                );
            }
            
            // Wait for all modules to initialize
            await Promise.all(initPromises);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Register global event listeners, such as window resize
 */
function registerGlobalEventListeners() {
    // Global window resize handler
    window.addEventListener('resize', handleGlobalResize);
    
    // Add event listener for the replay button in Module A
    const replayButton = document.getElementById('replay');
    if (replayButton) {
        replayButton.addEventListener('click', function() {
            if (typeof replayModuleA === 'function') {
                replayModuleA();
            }
        });
    }
    
    // Add event listeners for other interactive elements
    addInteractiveElementListeners();
}

/**
 * Add event listeners to interactive elements across different modules
 * Helps with coordinating cross-module interactions
 */
function addInteractiveElementListeners() {
    // Module C control listeners
    const dataTypeSelect = document.getElementById('dataType');
    const emotionTypeSelect = document.getElementById('emotionType');
    
    if (dataTypeSelect && typeof updateModuleC === 'function') {
        dataTypeSelect.addEventListener('change', updateModuleC);
    }
    
    if (emotionTypeSelect && typeof updateModuleC === 'function') {
        emotionTypeSelect.addEventListener('change', updateModuleC);
    }
    
    // Module E dimension select listener
    const dimensionSelect = document.getElementById('dimension-select');
    if (dimensionSelect && typeof updateModuleEBarChart === 'function') {
        dimensionSelect.addEventListener('change', function() {
            const dimension = this.value;
            updateModuleEBarChart(dimension);
        });
    }
}

/**
 * Checks if all modules have been loaded successfully
 * Used for debugging and ensuring all components are ready
 */
function checkAllModulesLoaded() {
    const modules = [
        { name: 'Module A', init: typeof initModuleA === 'function' },
        { name: 'Module B', init: typeof initModuleB === 'function' },
        { name: 'Module C', init: typeof initModuleC === 'function' },
        { name: 'Module D', init: typeof initModuleD === 'function' },
        { name: 'Module E', init: typeof initModuleE === 'function' },
        { name: 'Module VAD', init: typeof initModuleVAD === 'function' },
        { name: 'Module UMAP', init: typeof initModuleUmap === 'function' },
        { name: 'Module CMatrix', init: typeof initModuleCMatrix === 'function' },
        { name: 'Module StructE', init: typeof initModuleStructE === 'function' },
        { name: 'Module EpisodeS', init: typeof initModuleEpisodeS === 'function' },
        { name: 'Module EpisodeSigF', init: typeof initModuleEpisodeSigF === 'function' },
        { name: 'Module EpisodeSigM', init: typeof initModuleEpisodeSigM === 'function' },
        { name: 'Module Spearman', init: typeof initModuleSpearman === 'function' }
    ];
    
    const notLoaded = modules.filter(m => !m.init).map(m => m.name);
    
    if (notLoaded.length === 0) {
        console.log('All modules loaded successfully');
        return true;
    } else {
        console.warn('The following modules failed to load:', notLoaded);
        return false;
    }
}

// Add a function to reinitialize visualizations on demand
// Useful for development or when data sources change
window.reinitializeVisualizations = function() {
    console.log('Reinitializing all visualizations...');
    
    // Reset module initialization status
    window.moduleInitStatus = {
        'main-page': false,
        'emotion-across-culture': false,
        'emotion-linguistics': false
    };
    
    // Get active tab
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
        const tabId = activeTab.id;
        // Initialize modules for active tab
        initializeModulesForTab(tabId).then(() => {
            window.moduleInitStatus[tabId] = true;
            console.log('Reinitialization complete');
        });
    }
};

/**
 * Cleanup function to remove elements before reinitializing for a specific tab
 * Prevents memory leaks and duplicate elements
 * @param {string} tabId - The ID of the tab to clean up
 */
function cleanupVisualizationsForTab(tabId) {
    if (tabId === 'emotion-across-culture') {
        // Remove SVG elements from emotion across culture modules
        d3.select('#chart-a').html('');
        d3.select('#chart-b').html('');
        d3.select('#chart-c').html('');
        d3.select('#sankey').html('');
        d3.select('#scatter-plot').html('');
        d3.select('#bar-chart').html('');
        
        // Reset loading indicators
        document.querySelectorAll('#emotion-across-culture .loading').forEach(el => {
            el.style.display = 'block';
        });
    } 
    else if (tabId === 'emotion-linguistics') {
        // Remove SVG elements from emotion linguistics modules
        d3.select('#vad-heatmap').html('');
        d3.select('#umap-kmeans').html('');
        d3.select('#umap-episode').html('');
        d3.select('#confusion-matrix-container').html('');
        d3.select('#heatmap-container').html('');
        d3.select('#episode-chart-container').html('');
        d3.select('#episode-signature-chart').html('');
        d3.select('#episode-signature-chartM').html('');
        d3.select('#spearman-viz').html('');
        
        // Reset loading indicators
        document.querySelectorAll('#emotion-linguistics .loading').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    console.log(`Cleaned up visualizations for ${tabId} tab`);
}