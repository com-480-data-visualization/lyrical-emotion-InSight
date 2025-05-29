/**
 * moduleEpisodeS.js
 * Episode Signature Feature Visualization Module
 * 
 * This module visualizes feature signatures across different emotional episodes
 * using an interactive bar chart with animated transitions.
 */

function initModuleEpisodeS() {
    // Clear any existing content
    document.getElementById("episode-chart-container").innerHTML = "";
    
    // Create the UI elements
    const container = d3.select("#episode-chart-container");
    
    // Add feature selector with label
    const selectorContainer = container.append("div")
        .attr("class", "feature-selector-container");
        
    selectorContainer.append("label")
        .attr("for", "feature-select")
        .attr("class", "feature-select-label")
        .text("Select Feature Signature:");
        
    const featureSelect = selectorContainer.append("select")
        .attr("id", "feature-select")
        .attr("class", "feature-select");

    // Add loading indicator
    const loadingIndicator = container.append("div")
        .attr("class", "loading")
        .attr("id", "loading-episode")
        .text("Loading data...");
        
    // Create SVG container for the chart
    const svg = container.append("svg")
        .attr("id", "episode-chart")
        .attr("width", "100%")
        .attr("height", 440)
        .style("display", "none");
        
    // Add tooltip div
    const tooltip = container.append("div")
        .attr("class", "tooltip episode-tooltip")
        .style("opacity", 0);
    
    // Load and process data
    d3.csv("data/episode_signature.csv").then(function(data) {
        // Hide loading indicator and show chart
        loadingIndicator.style("display", "none");
        svg.style("display", "block");
        
        // 1. Get all feature columns except episode
        const features = data.columns.filter(d => d !== "episode");
        
        // Populate dropdown with formatted feature names
        featureSelect.selectAll("option")
            .data(features)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => formatFeatureName(d));

        // 2. Draw initial bar chart
        draw(features[0]);

        // 3. Set up event listener for feature selection change
        featureSelect.on("change", function() {
            draw(this.value);
        });
        
        // Function to format feature names for display
        function formatFeatureName(feature) {
            return feature
                .replaceAll("_", " ")
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        }

        // Main drawing function
        function draw(feature) {
            // Clear previous chart
            svg.selectAll("*").remove();

            // Setup dimensions with responsive sizing
            const containerWidth = container.node().getBoundingClientRect().width;
            const margin = {top: 50, right: 30, bottom: 70, left: 70};
            const width = containerWidth - margin.left - margin.right;
            const height = 440 - margin.top - margin.bottom;
            
            // Update SVG width to match container
            svg.attr("width", containerWidth);
            
            // Create chart group with margin convention
            const g = svg.append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Sort episodes by value (descending)
            const sortedData = data.slice().sort((a, b) => d3.descending(+a[feature], +b[feature]));
            const episodes = sortedData.map(d => d.episode);

            // Define color scheme based on episodes
            const episodeColors = {
                "EDR": "#3182BD", // Blue
                "CB": "#E6550D",  // Orange
                "PEP": "#31A354", // Green
                "Unclassified": "#756BB1", // Purple
                "AIA": "#636363", // Dark grey
                "FM": "#FFB81C"   // Gold/amber
            };

            // X and Y scales
            const x = d3.scaleBand()
                .domain(episodes)
                .range([0, width])
                .padding(0.25);
                
            const y = d3.scaleLinear()
                .domain([0, d3.max(sortedData, d => +d[feature]) * 1.15])
                .nice()
                .range([height, 0]);

            // Add gradient definitions for bars
            const defs = svg.append("defs");
            
            Object.keys(episodeColors).forEach(episode => {
                const gradient = defs.append("linearGradient")
                    .attr("id", `bar-gradient-${episode}`)
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", height);
                    
                gradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", d3.rgb(episodeColors[episode]).brighter(0.7));
                    
                gradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", episodeColors[episode]);
            });

            // Add subtle grid lines
            g.append("g")
                .attr("class", "grid-lines y-grid")
                .selectAll("line")
                .data(y.ticks())
                .enter()
                .append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", d => y(d))
                .attr("y2", d => y(d))
                .attr("stroke", "#e0e0e0")
                .attr("stroke-dasharray", "3,3");

            // Create and animate bars
            const bars = g.selectAll(".bar")
                .data(sortedData)
                .enter()
                .append("rect")
                .attr("class", "episode-bar")
                .attr("x", d => x(d.episode))
                .attr("width", x.bandwidth())
                .attr("y", height) // Start from bottom for animation
                .attr("height", 0)
                .attr("rx", 4) // Rounded corners
                .attr("fill", d => `url(#bar-gradient-${d.episode})`)
                .attr("stroke", d => d3.rgb(episodeColors[d.episode]).darker(0.2))
                .attr("stroke-width", 1)
                .on("mouseover", function(event, d) {
                    // Highlight bar
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 2)
                        .attr("opacity", 0.9);
                    
                    // Show tooltip
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                        
                    tooltip.html(`
                        <div class="tooltip-header">${d.episode}</div>
                        <div class="tooltip-content">
                            <strong>${formatFeatureName(feature)}:</strong> ${(+d[feature]).toFixed(4)}
                        </div>
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    // Reset bar
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 1)
                        .attr("opacity", 1);
                    
                    // Hide tooltip
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
                
            // Animate bars
            bars.transition()
                .duration(800)
                .delay((d, i) => i * 50)
                .attr("y", d => y(+d[feature]))
                .attr("height", d => height - y(+d[feature]));
                
            // Add value labels on top of bars
            g.selectAll(".bar-label")
                .data(sortedData)
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .attr("x", d => x(d.episode) + x.bandwidth() / 2)
                .attr("y", d => y(+d[feature]) - 8)
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .attr("font-weight", "500")
                .attr("opacity", 0) // Start invisible for animation
                .text(d => (+d[feature]).toFixed(3))
                .transition()
                .duration(800)
                .delay((d, i) => i * 50 + 300)
                .attr("opacity", 1);

            // X axis with styled labels
            const xAxis = g.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));
                
            xAxis.selectAll("text")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .attr("fill", d => episodeColors[d])
                .attr("transform", "translate(0,5)");
                
            xAxis.selectAll("line").attr("stroke", "#888");
            xAxis.select(".domain").attr("stroke", "#888");

            // Y axis
            const yAxis = g.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2f")));
                
            yAxis.selectAll("text")
                .attr("font-size", "11px")
                .attr("fill", "#555");
                
            yAxis.selectAll("line").attr("stroke", "#888");
            yAxis.select(".domain").attr("stroke", "#888");

            // Y axis label
            g.append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -48)
                .attr("text-anchor", "middle")
                .attr("fill", "#333")
                .attr("font-size", "13px")
                .attr("font-weight", "600")
                .text(formatFeatureName(feature));

            // Chart title with animation
            const title = svg.append("text")
                .attr("class", "chart-title")
                .attr("x", margin.left + width / 2)
                .attr("y", margin.top - 20)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("font-weight", "bold")
                .attr("fill", "#222")
                .attr("opacity", 0)
                .text(`${formatFeatureName(feature)} Distribution Across Emotional Episodes`);
                
            title.transition()
                .duration(800)
                .attr("opacity", 1);
                
            // Add subtle annotation
            g.append("text")
                .attr("class", "annotation")
                .attr("x", width)
                .attr("y", height + 40)
                .attr("text-anchor", "end")
                .attr("font-size", "11px")
                .attr("font-style", "italic")
                .attr("fill", "#777")
                .text("Higher values indicate stronger feature presence");
        }
    }).catch(error => {
        console.error("Error loading episode signature data:", error);
        
        if (window.vizUtils && window.vizUtils.handleDataError) {
            window.vizUtils.handleDataError('episode', error);
        } else {
            loadingIndicator.text("Error loading data. Please check console for details.");
        }
    });
}

/**
 * Handles window resize event for Episode Signature module
 * Redraws chart to fit new dimensions
 */
function handleModuleEpisodeSResize() {
    // Get the current selected feature
    const currentFeature = document.getElementById("feature-select")?.value;
    
    // Only redraw if we have a selected feature
    if (currentFeature) {
        // Reinitialize the module which will redraw with new dimensions
        initModuleEpisodeS();
        
        // Reselect the previously selected feature
        const selectElement = document.getElementById("feature-select");
        if (selectElement) {
            selectElement.value = currentFeature;
            // Manually trigger change event
            const event = new Event('change');
            selectElement.dispatchEvent(event);
        }
    } else {
        // Just reinitialize if no feature is selected yet
        initModuleEpisodeS();
    }
}

// Make the initialization function available globally
window.initModuleEpisodeS = initModuleEpisodeS;
window.handleModuleEpisodeSResize = handleModuleEpisodeSResize;