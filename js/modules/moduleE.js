/**
 * moduleE.js
 * Valence & Arousal Relationship Across Languages Module
 * 
 * This module creates a scatter plot showing the relationship between
 * valence and arousal across different languages, along with a companion bar chart.
 */

// --- MODIFIED: Wrapped original self-executing function as a named function ---
function initModuleE() {
    // Scatter plot dimensions
    const scatterMargin = {top: 40, right: 100, bottom: 60, left: 60};
    const scatterWidth = 850 - scatterMargin.left - scatterMargin.right;
    const scatterHeight = 450 - scatterMargin.top - scatterMargin.bottom;
    
    // Bar chart dimensions
    const barMargin = {top: 20, right: 30, bottom: 100, left: 60};
    const barWidth = 850 - barMargin.left - barMargin.right;
    const barHeight = 350 - barMargin.top - barMargin.bottom;
    
    // --- MODIFIED: Using querySelector to ensure we're working with empty containers ---
    // Clear previous SVGs if they exist
    // document.querySelector("#scatter-plot").innerHTML = "";
    // document.querySelector("#bar-chart").innerHTML = "";
    
    // Create SVG for scatter plot
    const scatterSvg = d3.select("#scatter-plot")
      .append("svg")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
      .append("g")
        .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`);
    
    // Create SVG for bar chart
    const barSvg = d3.select("#bar-chart")
      .append("svg")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom)
      .append("g")
        .attr("transform", `translate(${barMargin.left},${barMargin.top})`);
    
    // Custom color scheme with softer, more harmonious colors
    const colorScheme = [
      "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f",
      "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
      "#6b9ac4", "#d67553", "#87c293", "#b279a2", "#808080",
      "#9d7660", "#d3a294", "#a2d6a2", "#e98d6b", "#b57aa3",
      "#85a9c7", "#e49757", "#7abfb5", "#f1a2a5", "#b9b07d"
    ];
    
    // Create scales
    const scatterX = d3.scaleLinear().range([0, scatterWidth]);
    const scatterY = d3.scaleLinear().range([scatterHeight, 0]);
    const barX = d3.scaleBand().range([0, barWidth]).padding(0.2);
    const barY = d3.scaleLinear().range([barHeight, 0]);
    const color = d3.scaleOrdinal().range(colorScheme);
    
    // --- MODIFIED: Use the shared tooltip from common.js instead of creating a new one ---
    const tooltipE = window.vizUtils ? window.vizUtils.tooltip : d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    
    // Sample data for development (will be replaced with actual data)
    const sampleData = [
        { language: "english", valence_mean: 0.17, arousal_mean: 0.21 },
        { language: "spanish", valence_mean: 0.19, arousal_mean: 0.17 },
        { language: "french", valence_mean: 0.22, arousal_mean: 0.15 },
        { language: "german", valence_mean: 0.16, arousal_mean: 0.12 },
        { language: "italian", valence_mean: 0.25, arousal_mean: 0.14 },
        { language: "portuguese", valence_mean: 0.21, arousal_mean: 0.19 },
        { language: "russian", valence_mean: 0.14, arousal_mean: 0.11 },
        { language: "japanese", valence_mean: 0.18, arousal_mean: 0.13 },
        { language: "korean", valence_mean: 0.20, arousal_mean: 0.18 },
        { language: "chinese", valence_mean: 0.15, arousal_mean: 0.10 },
        { language: "arabic", valence_mean: 0.23, arousal_mean: 0.16 },
        { language: "hindi", valence_mean: 0.26, arousal_mean: 0.22 },
        { language: "bengali", valence_mean: 0.24, arousal_mean: 0.20 },
        { language: "swahili", valence_mean: 0.30, arousal_mean: 0.19 },
        { language: "tagalog", valence_mean: 0.22, arousal_mean: 0.13 },
        { language: "thai", valence_mean: 0.17, arousal_mean: 0.09 },
        { language: "turkish", valence_mean: 0.19, arousal_mean: 0.15 },
        { language: "polish", valence_mean: 0.21, arousal_mean: 0.14 },
        { language: "dutch", valence_mean: 0.18, arousal_mean: 0.11 },
        { language: "greek", valence_mean: 0.15, arousal_mean: 0.13 },
        { language: "hebrew", valence_mean: 0.22, arousal_mean: 0.17 },
        { language: "swedish", valence_mean: 0.20, arousal_mean: 0.12 },
        { language: "norwegian", valence_mean: 0.19, arousal_mean: 0.11 },
        { language: "danish", valence_mean: 0.17, arousal_mean: 0.10 },
        { language: "finnish", valence_mean: 0.16, arousal_mean: 0.09 },
        { language: "czech", valence_mean: 0.18, arousal_mean: 0.13 },
        { language: "slovak", valence_mean: 0.17, arousal_mean: 0.12 },
        { language: "hungarian", valence_mean: 0.19, arousal_mean: 0.14 },
        { language: "romanian", valence_mean: 0.21, arousal_mean: 0.15 },
        { language: "ukrainian", valence_mean: 0.18, arousal_mean: 0.11 },
        { language: "albanian", valence_mean: 0.24, arousal_mean: 0.20 },
        { language: "somali", valence_mean: 0.34, arousal_mean: 0.21 },
        { language: "hawaiian", valence_mean: 0.33, arousal_mean: 0.20 },
        { language: "azeri", valence_mean: 0.20, arousal_mean: 0.19 },
        { language: "cebuano", valence_mean: 0.29, arousal_mean: 0.18 },
        { language: "hausa", valence_mean: 0.16, arousal_mean: 0.10 }
    ];
    
    // --- MODIFIED: Updated the file path to use the dataPath utility ---
    // Load data and create visualizations
    const dataPath = window.vizUtils && window.vizUtils.dataPath ? 
        window.vizUtils.dataPath.getPath('', 'lang_emotion.json') : 
        'lang_emotion.json';
        
    d3.json(dataPath).then(data => {
        // Set domains for scales
        scatterX.domain([0.08, d3.max(data, d => d.valence_mean) * 1.05]);
        scatterY.domain([0, d3.max(data, d => d.arousal_mean) * 1.1]);
        
        // Add background grid for scatter plot
        scatterSvg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${scatterHeight})`)
            .call(d3.axisBottom(scatterX)
              .tickSize(-scatterHeight)
              .tickFormat("")
            );
        
        scatterSvg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(scatterY)
              .tickSize(-scatterWidth)
              .tickFormat("")
            );
        
        // Add X axis for scatter plot
        scatterSvg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${scatterHeight})`)
            .call(d3.axisBottom(scatterX).ticks(6))
            .call(g => g.select(".domain").remove());
        
        // Add Y axis for scatter plot
        scatterSvg.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(scatterY).ticks(5))
            .call(g => g.select(".domain").remove());
        
        // Add axis labels
        scatterSvg.append("text")
            .attr("class", "axis-label")
            .attr("x", scatterWidth / 2)
            .attr("y", scatterHeight + 40)
            .attr("text-anchor", "middle")
            .text("Valence Mean (Positivity)");
        
        scatterSvg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -scatterHeight / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .text("Arousal Mean (Intensity)");
        
        // Add dots for scatter plot
        const dots = scatterSvg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => scatterX(d.valence_mean))
            .attr("cy", d => scatterY(d.arousal_mean))
            .attr("r", 6)
            .attr("fill", d => color(d.language))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8);
              
              tooltipE.transition()
                .duration(200)
                .style("opacity", 0.9);
              
              tooltipE.html(`
                <h4>${d.language}</h4>
                <p>Valence: <b>${d.valence_mean.toFixed(3)}</b></p>
                <p>Arousal: <b>${d.arousal_mean.toFixed(3)}</b></p>
              `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 6);
              
              tooltipE.transition()
                .duration(500)
                .style("opacity", 0);
            });
        
        // Add language labels only for selected points
        const labelThreshold = 0.20; // Only label languages with higher values
        scatterSvg.selectAll(".dot-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "dot-label")
            .attr("x", d => scatterX(d.valence_mean) + 8)
            .attr("y", d => scatterY(d.arousal_mean) + 4)
            .text(d => (d.arousal_mean > labelThreshold || d.valence_mean > 0.28) ? d.language : "")
            .style("font-size", "10px")
            .style("fill", "#444");
        
        // Add legend for scatter plot
        const legend = scatterSvg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${scatterWidth + 20}, 0)`);
        
        // Get top languages by combined value for legend
        const topLanguages = data.slice()
            .sort((a, b) => (b.valence_mean + b.arousal_mean) - (a.valence_mean + a.arousal_mean))
            .slice(0, 10);
        
        legend.selectAll(".legend-dot")
            .data(topLanguages)
            .enter()
            .append("circle")
            .attr("class", "legend-dot")
            .attr("cx", 0)
            .attr("cy", (d, i) => 20 + i * 20)
            .attr("r", 5)
            .attr("fill", d => color(d.language));
        
        legend.selectAll(".legend-label")
            .data(topLanguages)
            .enter()
            .append("text")
            .attr("class", "legend-item")
            .attr("x", 10)
            .attr("y", (d, i) => 20 + i * 20)
            .attr("dy", "0.32em")
            .text(d => d.language)
            .style("font-size", "11px")
            .on("mouseover", function(event, d) {
              // Highlight corresponding dot
              dots.filter(dot => dot.language === d.language)
                .transition()
                .duration(200)
                .attr("r", 9)
                .attr("stroke-width", 2);
              
              d3.select(this).style("font-weight", "bold");
            })
            .on("mouseout", function(event, d) {
              // Restore dot size
              dots.filter(dot => dot.language === d.language)
                .transition()
                .duration(200)
                .attr("r", 6)
                .attr("stroke-width", 1);
              
              d3.select(this).style("font-weight", "normal");
            });
        
        // Add title for legend
        legend.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Top Languages");
        
        // --- MODIFIED: Event listener for dimension selection moved to main.js ---
        // Initial bar chart
        updateBarChart(data, "valence_mean");
    }).catch(error => {
        console.error("Error loading the data:", error);
        // --- MODIFIED: Added better error handling ---
        if (window.vizUtils && window.vizUtils.handleDataError) {
            window.vizUtils.handleDataError('e', error);
        }
        // Use sample data if actual data loading fails
        updateBarChart(sampleData, "valence_mean");
    });
    
    // --- MODIFIED: Function exposed to window object so it can be called from main.js ---
    // Function to update bar chart based on selected dimension
    window.updateModuleEBarChart = function(dimension) {
        const dimensionName = dimension === "valence_mean" ? "Valence" : "Arousal";
        document.getElementById("bar-chart-title").textContent = `Average ${dimensionName} Across Languages`;
        
        // Try to load data again if not already available
        d3.json(dataPath).then(data => {
            updateBarChart(data, dimension);
        }).catch(error => {
            console.error("Error loading the data for bar chart update:", error);
            updateBarChart(sampleData, dimension);
        });
    };
    
    /**
     * Updates the bar chart based on the selected dimension
     * @param {Array} data - The data to visualize
     * @param {string} dimension - The dimension to display (valence_mean or arousal_mean)
     */
    function updateBarChart(data, dimension) {
        // Sort data by selected dimension
        const sortedData = data.slice()
            .sort((a, b) => d3.descending(a[dimension], b[dimension]));
        
        // Update scales
        barX.domain(sortedData.map(d => d.language));
        
        // Adjust y scale domain with 10% padding
        const maxValue = d3.max(sortedData, d => d[dimension]);
        barY.domain([0, maxValue * 1.1]).nice();
        
        // Clear previous chart
        barSvg.selectAll(".axis").remove();
        
        // Add grid lines
        barSvg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(barY)
              .tickSize(-barWidth)
              .tickFormat("")
            );
        
        // Add X axis
        barSvg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${barHeight})`)
            .call(d3.axisBottom(barX))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");
        
        // Add Y axis
        barSvg.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(barY).ticks(5))
            .call(g => g.select(".domain").remove());
        
        // Add Y axis label
        const dimensionLabel = dimension === "valence_mean" ? "Valence (Positivity)" : "Arousal (Intensity)";
        
        barSvg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -barHeight / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .text(dimensionLabel);
        
        // Transition for updating bars
        const barGroups = barSvg.selectAll(".bar-group")
            .data(sortedData, d => d.language);
        
        // Remove old bars
        barGroups.exit().remove();
        
        // Add new bar groups
        const enterGroups = barGroups.enter()
            .append("g")
            .attr("class", "bar-group");
        
        // Add bars
        enterGroups.append("rect")
            .attr("class", "bar")
            .attr("x", d => barX(d.language))
            .attr("y", d => barY(d[dimension]))
            .attr("width", barX.bandwidth())
            .attr("height", d => barHeight - barY(d[dimension]))
            .attr("fill", d => color(d.language))
            .attr("rx", 2) // Rounded corners
            .on("mouseover", function(event, d) {
              d3.select(this).attr("opacity", 0.8);
              
              tooltipE.transition()
                .duration(200)
                .style("opacity", 0.9);
              
              const dimensionName = dimension === "valence_mean" ? "Valence" : "Arousal";
              tooltipE.html(`
                <h4>${d.language}</h4>
                <p>${dimensionName}: <b>${d[dimension].toFixed(3)}</b></p>
              `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
              d3.select(this).attr("opacity", 1);
              
              tooltipE.transition()
                .duration(500)
                .style("opacity", 0);
            });
        
        // Add labels on top of bars
        enterGroups.append("text")
            .attr("class", "bar-label")
            .attr("x", d => barX(d.language) + barX.bandwidth() / 2)
            .attr("y", d => barY(d[dimension]) - 5)
            .attr("text-anchor", "middle")
            .text(d => d[dimension].toFixed(2));
        
        // Update existing bars with transition
        barGroups.select(".bar")
            .transition()
            .duration(750)
            .attr("x", d => barX(d.language))
            .attr("y", d => barY(d[dimension]))
            .attr("width", barX.bandwidth())
            .attr("height", d => barHeight - barY(d[dimension]));
        
        // Update labels with transition
        barGroups.select(".bar-label")
            .transition()
            .duration(750)
            .attr("x", d => barX(d.language) + barX.bandwidth() / 2)
            .attr("y", d => barY(d[dimension]) - 5)
            .text(d => d[dimension].toFixed(2));
        
        // Combine enter and update selections
        barGroups.merge(enterGroups);
    }
}

// --- MODIFIED: Added resize handler function for this module ---
/**
 * Handles window resize event for Module E
 * Redraws visualizations to fit new screen dimensions
 */
function handleModuleEResize() {
    // Simply re-initialize the module which will recalculate all dimensions
    initModuleE();
}

// --- MODIFIED: Export the module initialization function ---
// Make the initialization function available globally
window.initModuleE = initModuleE;