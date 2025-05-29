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
        // Initialize Module A: Historical Trends in Lyrical Tone
        if (typeof initModuleA === 'function') {
            initModuleA();
            console.log('Module A (Historical Trends) initialized');
        }
        
        // Initialize Module B: Temporal Emotion Trends Within Languages
        if (typeof initModuleB === 'function') {
            initModuleB();
            console.log('Module B (Emotion Trends by Language) initialized');
        }
        
        // Initialize Module C: Emotional Dimensions Across Languages
        if (typeof initModuleC === 'function') {
            initModuleC();
            console.log('Module C (Emotion Dimensions) initialized');
        }
        
        // Initialize Module D: KMeans Clustering Sankey Diagram
        if (typeof initModuleD === 'function') {
            initModuleD();
            console.log('Module D (Clustering Analysis) initialized');
        }
        
        // Initialize Module E: Valence-Arousal Relationship
        if (typeof initModuleE === 'function') {
            initModuleE();
            console.log('Module E (Valence-Arousal Profiles) initialized');
        }

        // Initialize Module VAD: VAD Correlation Heatmap
        if (typeof initModuleVAD === 'function') {
            initModuleVAD();
            console.log('Module VAD (Correlation Heatmap) initialized');
        }

        // Initialize Module F: UMAP Clustering Comparison
        if (typeof initModuleUmap === 'function') {
            initModuleUmap();
            console.log('Module UMAP (UMAP Clustering) initialized');
        }

        // Initialize Module CMatrix: Confusion Matrix
        if (typeof initModuleCMatrix === 'function') {
            initModuleCMatrix();
            console.log('Module CMatrix (Confusion Matrix) initialized');
        }

        // Initialize Module Struct-E: Structural-Emotional Correlation
        if (typeof initModuleStructE === 'function') {
            initModuleStructE();
            console.log('Module Struct-E (Structural-Emotional Correlation) initialized');
        }

        // Initialize Module Episode-S: Episode Signature Features
        if (typeof initModuleEpisodeS === 'function') {
            initModuleEpisodeS();
            console.log('Module Episode-S (Episode Signature) initialized');
        }

        // Initialize Module Episode Signature
        if (typeof initModuleEpisodeSigF === 'function') {
            initModuleEpisodeSigF();
            console.log('Module Episode Signature (Linguistic Features) initialized');
        }

        // Initialize Module Episode Signature
        if (typeof initModuleEpisodeSigM === 'function') {
            initModuleEpisodeSigM();
            console.log('Module Episode Signature initialized');
        }

        // Initialize Module Spearman: Feature Correlation Matrix
        if (typeof initModuleSpearman === 'function') {
            initModuleSpearman();
            console.log('Module Spearman (Feature Correlation) initialized');
        }
                                        
        // Register global event listeners
        registerGlobalEventListeners();
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

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
        { name: 'Module CMatrix', init: typeof initModuleCMatrix === 'function' }
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
    
    // Clean up existing visualizations if needed
    cleanupVisualizations();
    
    // Reinitialize all modules
    if (typeof initModuleA === 'function') initModuleA();
    if (typeof initModuleB === 'function') initModuleB();
    if (typeof initModuleC === 'function') initModuleC();
    if (typeof initModuleD === 'function') initModuleD();
    if (typeof initModuleE === 'function') initModuleE();
    
    console.log('Reinitialization complete');
};

/**
 * Cleanup function to remove elements before reinitializing
 * Prevents memory leaks and duplicate elements
 */
function cleanupVisualizations() {
    // Remove SVG elements from each module
    d3.select('#chart-a').html('');
    d3.select('#chart-b').html('');
    d3.select('#chart-c').html('');
    d3.select('#sankey').html('');
    d3.select('#scatter-plot').html('');
    d3.select('#bar-chart').html('');
    d3.select('#confusion-matrix-container').html('');
    
    // Reset loading indicators
    document.querySelectorAll('.loading').forEach(el => {
        el.style.display = 'block';
    });
    
    console.log('Cleaned up existing visualizations');
}