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
        // Trigger resize handlers for each module
        if (typeof handleModuleAResize === 'function') handleModuleAResize();
        if (typeof handleModuleBResize === 'function') handleModuleBResize();
        if (typeof handleModuleCResize === 'function') handleModuleCResize();
        if (typeof handleModuleDResize === 'function') handleModuleDResize();
        if (typeof handleModuleEResize === 'function') handleModuleEResize();
        if (typeof handleModuleVADResize === 'function') handleModuleVADResize();
        if (typeof handleModuleUmapResize === 'function') handleModuleUmapResize();
        if (typeof handleModuleCMatrixResize === 'function') handleModuleCMatrixResize();
        if (typeof handleModuleStructEResize === 'function') handleModuleStructEResize();
        if (typeof handleModuleEpisodeSResize === 'function') handleModuleEpisodeSResize();
        if (typeof handleModuleEpisodeSigFResize === 'function') handleModuleEpisodeSigFResize();
        if (typeof handleModuleEpisodeSigMResize === 'function') handleModuleEpisodeSigMResize();
        if (typeof handleModuleSpearmanResize === 'function') handleModuleSpearmanResize();

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
    document.getElementById(`loading-${moduleId}`).innerHTML = `
        <div class="error-message">
            <strong>Error loading data</strong>
            <p>Please check console for details.</p>
        </div>
    `;
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

// Export the utilities so they're available to other modules
window.vizUtils = {
    tooltip: sharedTooltip,
    formatNumber: formatNumber,
    formatPercent: formatPercent,
    handleDataError: handleDataError,
    dataPath: dataPathHelpers
};