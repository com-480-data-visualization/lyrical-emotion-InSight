/**
 * common.js
 * Common utilities and shared resources for the lyrical emotion visualization project
 */

// Create a shared tooltip that can be used across all visualizations
const sharedTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

/**
 * Handles global window resize event for all visualizations
 * Uses debouncing to prevent excessive redraws
 */
function handleGlobalResize() {
    // Debounce the resize event to prevent excessive redraws
    clearTimeout(window.globalResizeTimer);
    window.globalResizeTimer = setTimeout(() => {
        // Only initialize modules for the active tab
        const activeTab = document.querySelector('.tab-pane.active');
        if (!activeTab) return;
        
        const tabId = activeTab.id;
        
        // Initialize modules based on active tab
        if (tabId === 'emotion-across-culture') {
            if (typeof handleModuleAResize === 'function') handleModuleAResize();
            if (typeof handleModuleBResize === 'function') handleModuleBResize();
            if (typeof handleModuleCResize === 'function') handleModuleCResize();
            if (typeof handleModuleDResize === 'function') handleModuleDResize();
            if (typeof handleModuleEResize === 'function') handleModuleEResize();
        } 
        else if (tabId === 'emotion-linguistics') {
            if (typeof handleModuleVADResize === 'function') handleModuleVADResize();
            if (typeof handleModuleUmapResize === 'function') handleModuleUmapResize();
            if (typeof handleModuleCMatrixResize === 'function') handleModuleCMatrixResize();
            if (typeof handleModuleStructEResize === 'function') handleModuleStructEResize();
            if (typeof handleModuleEpisodeSResize === 'function') handleModuleEpisodeSResize();
            if (typeof handleModuleEpisodeSigFResize === 'function') handleModuleEpisodeSigFResize();
            if (typeof handleModuleEpisodeSigMResize === 'function') handleModuleEpisodeSigMResize();
            if (typeof handleModuleSpearmanResize === 'function') handleModuleSpearmanResize();
        }
    }, 300);
}

/**
 * Format numbers for display
 */
const formatNumber = d3.format(".4f");
const formatPercent = d3.format(".1%");

/**
 * Error handler for data loading
 * @param {string} moduleId - The ID of the module with error
 * @param {Error} error - The error object
 */
function handleDataError(moduleId, error) {
    console.error(`Error loading data for module ${moduleId}:`, error);
    const loadingElement = document.getElementById(`loading-${moduleId}`);
    if (loadingElement) {
        loadingElement.innerHTML = `
            <div class="error-message">
                <strong>Error loading data</strong>
                <p>Please check console for details.</p>
            </div>
        `;
    }
}

/**
 * Path helpers for data files
 */
const dataPathHelpers = {
    getPath: function(folder, filename) {
        return `data/${folder}/${filename}`;
    },
    processedData: function(filename) {
        return this.getPath('processed_data', filename);
    },
    processedData2: function(filename) {
        return this.getPath('processed_data2', filename);
    }
};

/**
 * Check if an element is in the viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - Whether the element is in the viewport
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Export the utilities so they're available to other modules
window.vizUtils = {
    tooltip: sharedTooltip,
    formatNumber: formatNumber,
    formatPercent: formatPercent,
    handleDataError: handleDataError,
    dataPath: dataPathHelpers,
    isElementInViewport: isElementInViewport
};