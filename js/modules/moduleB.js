/**
 * moduleB.js
 * Temporal Emotion Trends Within Languages Visualization
 * Shows how emotional expression has evolved over time within specific languages
 * 
 * MODIFIED FROM ORIGINAL: This code was extracted from the self-executing function
 * at lines 1371-1627 in the original HTML file and converted to a module format
 */

// ===========================
// MODULE B: Lyrical Emotion Trends by Language
// ===========================

/**
 * MODIFIED FROM ORIGINAL: Changed from self-executing function to named function
 * that can be called from main.js
 */
function initModuleB() {
    // Emotion metric display names
    const emotionDisplayNames = {
        'valence_mean': 'Valence (Positivity)',
        'arousal_mean': 'Arousal (Energy/Intensity)',
        'dominance_mean': 'Dominance (Control/Power)'
    };
    
    // Emotion short names for file loading
    const emotionShortNames = {
        'valence_mean': 'valence',
        'arousal_mean': 'arousal',
        'dominance_mean': 'dominance'
    };
    
    // References to DOM elements
    const languageSelect = document.getElementById('language-select');
    const emotionSelect = document.getElementById('emotion-select');
    const chartArea = document.getElementById('chart-area');
    
    /**
     * MODIFIED FROM ORIGINAL: Updated the file path to use the data directory structure
     * Using the dataPath helper from common.js if available
     */
    const dataPath = window.vizUtils && window.vizUtils.dataPath ? 
        window.vizUtils.dataPath.processedData("language_summary.json") : 
        "./processed_data/language_summary.json";
    
    // Load language summary data
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Populate language dropdown
            const languageOptions = [];
            
            Object.entries(data).forEach(([language, info]) => {
                languageOptions.push({
                    name: language.charAt(0).toUpperCase() + language.slice(1),
                    value: language,
                    songCount: info.song_count
                });
            });
            
            // Sort by language name
            languageOptions.sort((a, b) => a.name.localeCompare(b.name));
            
            // Add options to select
            languageOptions.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.value;
                option.textContent = `${lang.name} (${lang.songCount} songs)`;
                languageSelect.appendChild(option);
            });
            
            // Store the summary data for later use
            window.languageSummary = data;
            
            // Enable language select
            languageSelect.disabled = false;
        })
        .catch(error => {
            console.error('Error loading language summary:', error);
            
            /**
             * MODIFIED FROM ORIGINAL: Using the error handler from common.js if available
             */
            if (window.vizUtils && window.vizUtils.handleDataError) {
                window.vizUtils.handleDataError('b', error);
            } else {
                chartArea.innerHTML = `
                    <div class="no-data">
                        <div class="no-data-icon">⚠️</div>
                        <h3>Error loading data</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        });
    
    /**
     * MODIFIED FROM ORIGINAL: Event listeners are now attached within the initModuleB function
     * instead of at the global level
     */
    // Handle language selection change
    languageSelect.addEventListener('change', function() {
        const selectedLanguage = this.value;
        
        // Clear emotion select and chart
        emotionSelect.innerHTML = '<option value="">Select an emotion metric</option>';
        showNoDataMessage();
        
        if (!selectedLanguage) {
            emotionSelect.disabled = true;
            return;
        }
        
        // Get emotions available for this language
        const languageInfo = window.languageSummary[selectedLanguage];
        if (!languageInfo || !languageInfo.emotions || languageInfo.emotions.length === 0) {
            emotionSelect.disabled = true;
            return;
        }
        
        // Populate emotion dropdown
        languageInfo.emotions.forEach(emotion => {
            const option = document.createElement('option');
            option.value = emotion;
            option.textContent = emotionDisplayNames[emotion] || emotion;
            emotionSelect.appendChild(option);
        });
        
        // Enable emotion select
        emotionSelect.disabled = false;
    });
    
    // Handle emotion selection change
    emotionSelect.addEventListener('change', function() {
        const selectedEmotion = this.value;
        const selectedLanguage = languageSelect.value;
        
        if (!selectedLanguage || !selectedEmotion) {
            showNoDataMessage();
            return;
        }
        
        // Load and visualize data
        loadVisualizationData(selectedLanguage, selectedEmotion);
    });
    
    // Function to load and visualize data
    function loadVisualizationData(language, emotion) {
        // Show loading state
        showLoadingMessage();
        
        // Get the short name for the emotion
        const emotionShort = emotionShortNames[emotion] || emotion.split('_')[0];
        
        /**
         * MODIFIED FROM ORIGINAL: Updated file path construction to use the data directory structure
         * Using the dataPath helper from common.js if available
         */
        const filePath = window.vizUtils && window.vizUtils.dataPath ? 
            window.vizUtils.dataPath.processedData(`${language}_${emotionShort}.csv`) : 
            `./processed_data/${language}_${emotionShort}.csv`;
        
        // Load the data
        d3.csv(filePath)
            .then(data => {
                // Convert string data to numbers
                data.forEach(d => {
                    d.year = +d.year;
                    d.value = +d.value;
                    d.count = +d.count;
                    d.std = +d.std;
                    d.predicted = +d.predicted;
                });
                
                // Create visualization
                createVisualization(data, language, emotion);
            })
            .catch(error => {
                console.error(`Error loading data for ${language}/${emotion}:`, error);
                
                /**
                 * MODIFIED FROM ORIGINAL: Using the error handler from common.js if available
                 */
                if (window.vizUtils && window.vizUtils.handleDataError) {
                    window.vizUtils.handleDataError('b', error);
                } else {
                    chartArea.innerHTML = `
                        <div class="no-data">
                            <div class="no-data-icon">⚠️</div>
                            <h3>Error loading visualization data</h3>
                            <p>Could not load data for ${language} ${emotionDisplayNames[emotion]}</p>
                        </div>
                    `;
                }
            });
    }
    
    // Function to show loading message
    function showLoadingMessage() {
        chartArea.innerHTML = `
            <div class="loading">
                <span>Loading visualization</span>
                <div class="loading-spinner"></div>
            </div>
        `;
    }
    
    // Function to show no data message
    function showNoDataMessage() {
        chartArea.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">📊</div>
                <h3>Select a language and emotion metric to get started</h3>
                <p>You'll see how that emotional attribute in lyrics has changed over time.</p>
            </div>
        `;
    }
    
    // Function to create the visualization
    function createVisualization(data, language, emotion) {
        // Clear chart area
        chartArea.innerHTML = '<svg id="chart-b"></svg>';
        
        // Get the display name of the emotion
        const emotionDisplay = emotionDisplayNames[emotion] || emotion;
        
        // Calculate slope from data (get from first datapoint since it's the same for all)
        const slope = (data[data.length-1].predicted - data[0].predicted) / (data[data.length-1].year - data[0].year);
        
        // Setup dimensions
        const margin = {top: 40, right: 30, bottom: 60, left: 60};
        const width = chartArea.clientWidth - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        
        // Create SVG
        const svg = d3.select('#chart-b')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Create scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width])
            .nice();
            
        const yScale = d3.scaleLinear()
            .domain([-1, 1])  // Standard range for emotion metrics
            .range([height, 0])
            .nice();
        
        // Create axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(Math.min(10, data.length))
            .tickFormat(d3.format("d"));  // Format as integers (years)
            
        const yAxis = d3.axisLeft(yScale);
        
        // Add X axis
        svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);
            
        // Add X axis label
        svg.append('text')
            .attr('class', 'axis-title')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 45)
            .text('Publication Year');
        
        // Add Y axis
        svg.append('g')
            .attr('class', 'axis y-axis')
            .call(yAxis);
            
        // Add Y axis label
        svg.append('text')
            .attr('class', 'axis-title')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .text(emotionDisplay);
        
        // Add title
        svg.append('text')
            .attr('class', 'chart-title')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', -15)
            .style('font-size', '16px')
            .style('font-weight', '500')
            .text(`${language.charAt(0).toUpperCase() + language.slice(1)}: ${emotionDisplay} (slope: ${slope.toFixed(5)})`);
        
        // Create line generator for regression line
        const regressionLine = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.predicted));
        
        /**
         * MODIFIED FROM ORIGINAL: Using the shared tooltip from common.js if available,
         * otherwise creating a local tooltip
         */
        // Create tooltip for this visualization
        const tooltipB = window.vizUtils && window.vizUtils.tooltip ? 
            window.vizUtils.tooltip : 
            d3.select('.module-b')
                .append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);
        
        // Prepare animation - Create a clip path rectangle that will animate
        svg.append('defs')
            .append('clipPath')
            .attr('id', 'clip-b')
            .append('rect')
            .attr('width', 0)
            .attr('height', height);
            
        // Create a container for all animated elements with the clip path
        const animatedGroup = svg.append('g')
            .attr('clip-path', 'url(#clip-b)');
        
        // Add regression line path to animated group
        const path = animatedGroup.append('path')
            .datum(data)
            .attr('class', 'regression-line')
            .attr('d', regressionLine);
        
        // Add dots to animated group
        const dots = animatedGroup.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.year))
            .attr('cy', d => yScale(d.value))
            .attr('r', d => Math.max(3, Math.min(8, Math.sqrt(d.count)))) // Size based on count
            .attr('fill', 'steelblue')
            .attr('opacity', 0.7)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('stroke-width', 2);
                    
                tooltipB.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                    
                /**
                 * MODIFIED FROM ORIGINAL: Using formatNumber from common.js if available
                 */
                const formatValue = window.vizUtils && window.vizUtils.formatNumber ? 
                    window.vizUtils.formatNumber : 
                    d3.format(".3f");
                
                tooltipB.html(`
                    <div class="tooltip-title">${d.year}</div>
                    <div class="tooltip-value">Value: ${formatValue(d.value)}</div>
                    <div class="tooltip-value">Songs: ${d.count}</div>
                    <div class="tooltip-value">Trend: ${formatValue(d.predicted)}</div>
                `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 0.7)
                    .attr('stroke-width', 1);
                    
                tooltipB.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
        
        // Animate the clip path to reveal the chart from left to right
        d3.select('#clip-b rect')
            .transition()
            .duration(1500)
            .attr('width', width);
            
        // Draw reference line at y=0
        svg.append('line')
            .attr('x1', 0)
            .attr('y1', yScale(0))
            .attr('x2', width)
            .attr('y2', yScale(0))
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');
    }
}

/**
 * ADDED TO ORIGINAL: Resize handler for Module B
 * This function is called from main.js when the window is resized
 */
function handleModuleBResize() {
    // Get the selected values
    const languageSelect = document.getElementById('language-select');
    const emotionSelect = document.getElementById('emotion-select');
    
    if (languageSelect && emotionSelect && 
        languageSelect.value && emotionSelect.value) {
        // If a language and emotion are selected, reload the visualization
        loadVisualizationData(languageSelect.value, emotionSelect.value);
    }
}

/**
 * ADDED TO ORIGINAL: Function to reload the visualization data
 * This is exposed to allow main.js to trigger a reload if needed
 */
function reloadModuleB() {
    const languageSelect = document.getElementById('language-select');
    const emotionSelect = document.getElementById('emotion-select');
    
    if (languageSelect && emotionSelect && 
        languageSelect.value && emotionSelect.value) {
        loadVisualizationData(languageSelect.value, emotionSelect.value);
    }
}

/**
 * MODIFIED FROM ORIGINAL: Export functions for use in main.js
 * In the original, these were all contained in a self-executing function
 */
// Make functions available to main.js
window.initModuleB = initModuleB;
window.handleModuleBResize = handleModuleBResize;
window.reloadModuleB = reloadModuleB;