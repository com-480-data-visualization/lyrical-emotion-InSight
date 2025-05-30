/**
 * moduleE.js
 * Valence & Arousal Relationship Across Languages Module
 * 
 * This module creates a scatter plot showing the relationship between
 * valence and arousal across different languages, along with a companion bar chart.
 */

// Global variables to store data and dimensions (accessible within the module scope)
let moduleEData = null;
let moduleESampleData = null;
let scatterSvg = null;
let barSvg = null;
let colorScale = null;

// --- Main initialization function ---
function initModuleE() {
    console.log("Initializing Module E (Valence-Arousal Profiles)");
    
    // First, clean up any existing visualizations
    cleanupModuleE();
    
    // Initialize sample data (fallback if data loading fails)
    moduleESampleData = [
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
    
    // Create color scale with consistent colors
    colorScale = d3.scaleOrdinal().range([
        "#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f",
        "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
        "#6b9ac4", "#d67553", "#87c293", "#b279a2", "#808080",
        "#9d7660", "#d3a294", "#a2d6a2", "#e98d6b", "#b57aa3",
        "#85a9c7", "#e49757", "#7abfb5", "#f1a2a5", "#b9b07d"
    ]);
    
    // Initialize the dimension select dropdown event listener
    setupDimensionSelectListener();
    
    // Load data and create visualizations
    loadModuleEData();
}

/**
 * Cleans up Module E visualizations
 */
function cleanupModuleE() {
    // Clear SVG containers
    document.querySelector("#scatter-plot").innerHTML = "";
    document.querySelector("#bar-chart").innerHTML = "";
    
    // Reset the title to default
    const barChartTitle = document.getElementById("bar-chart-title");
    if (barChartTitle) {
        barChartTitle.textContent = "Average Valence Across Languages";
    }
    
    // Reset dropdown to default value
    const dimensionSelect = document.getElementById("dimension-select");
    if (dimensionSelect) {
        dimensionSelect.value = "valence_mean";
    }
    
    console.log("Module E cleanup completed");
}

/**
 * Sets up the dimension select dropdown event listener
 */
function setupDimensionSelectListener() {
    const dimensionSelect = document.getElementById("dimension-select");
    if (dimensionSelect) {
        // Remove any existing event listeners by cloning the element
        const newSelect = dimensionSelect.cloneNode(true);
        dimensionSelect.parentNode.replaceChild(newSelect, dimensionSelect);
        
        // Add the event listener to the new element
        newSelect.addEventListener("change", function() {
            const dimension = this.value;
            updateModuleEBarChart(dimension);
        });
        
        console.log("Module E dimension select listener set up");
    }
}

/**
 * Loads data for Module E
 */
function loadModuleEData() {
    // Get data path
    const dataPath = window.vizUtils && window.vizUtils.dataPath ? 
        window.vizUtils.dataPath.getPath('', 'lang_emotion.json') : 
        'data/lang_emotion.json';
    
    console.log("Loading Module E data from:", dataPath);
    
    // Load data
    d3.json(dataPath)
        .then(data => {
            console.log("Module E data loaded successfully");
            moduleEData = data;
            
            // Create visualizations
            createScatterPlot(data);
            createBarChart(data, "valence_mean");
        })
        .catch(error => {
            console.error("Error loading Module E data:", error);
            
            // Use sample data as fallback
            console.log("Using sample data for Module E");
            moduleEData = moduleESampleData;
            
            // Create visualizations with sample data
            createScatterPlot(moduleESampleData);
            createBarChart(moduleESampleData, "valence_mean");
        });
}

/**
 * Creates the scatter plot visualization
 * @param {Array} data - The data to visualize
 */
function createScatterPlot(data) {
    // Scatter plot dimensions
    const margin = {top: 40, right: 100, bottom: 60, left: 60};
    const container = document.querySelector("#scatter-plot");
    const width = container.clientWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    
    console.log("Creating scatter plot with dimensions:", width, height);
    
    // Create SVG
    scatterSvg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0.08, d3.max(data, d => d.valence_mean) * 1.05])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.arousal_mean) * 1.1])
        .range([height, 0]);
    
    // Add background grid
    scatterSvg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickSize(-height)
            .tickFormat("")
        );
    
    scatterSvg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat("")
        );
    
    // Add axes
    scatterSvg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(6))
        .call(g => g.select(".domain").remove());
    
    scatterSvg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScale).ticks(5))
        .call(g => g.select(".domain").remove());
    
    // Add axis labels
    scatterSvg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Valence Mean (Positivity)");
    
    scatterSvg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("Arousal Mean (Intensity)");
    
    // Get tooltip from utilities or create a new one
    const tooltip = window.vizUtils ? window.vizUtils.tooltip : d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    // Add dots
    const dots = scatterSvg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.valence_mean))
        .attr("cy", d => yScale(d.arousal_mean))
        .attr("r", 6)
        .attr("fill", d => colorScale(d.language))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8);
            
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            
            tooltip.html(`
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
            
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add language labels for selected points
    const labelThreshold = 0.20;
    scatterSvg.selectAll(".dot-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "dot-label")
        .attr("x", d => xScale(d.valence_mean) + 8)
        .attr("y", d => yScale(d.arousal_mean) + 4)
        .text(d => (d.arousal_mean > labelThreshold || d.valence_mean > 0.28) ? d.language : "")
        .style("font-size", "10px")
        .style("fill", "#444");
    
    // Add legend
    const legend = scatterSvg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 20}, 0)`);
    
    // Get top languages for legend
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
        .attr("fill", d => colorScale(d.language));
    
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
    
    // Add legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Top Languages");
    
    console.log("Scatter plot created successfully");
}

/**
 * Creates the bar chart visualization
 * @param {Array} data - The data to visualize
 * @param {string} dimension - The dimension to display (valence_mean or arousal_mean)
 */
function createBarChart(data, dimension) {
    // Clear previous bar chart
    d3.select("#bar-chart").html("");
    
    // Bar chart dimensions
    const margin = {top: 20, right: 30, bottom: 100, left: 60};
    const container = document.querySelector("#bar-chart");
    const width = container.clientWidth - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    
    console.log("Creating bar chart with dimensions:", width, height, "for dimension:", dimension);
    
    // Update chart title
    const dimensionName = dimension === "valence_mean" ? "Valence" : "Arousal";
    document.getElementById("bar-chart-title").textContent = `Average ${dimensionName} Across Languages`;
    
    // Create SVG
    barSvg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Sort data by selected dimension
    const sortedData = data.slice()
        .sort((a, b) => d3.descending(a[dimension], b[dimension]));
    
    // Create scales
    const xScale = d3.scaleBand()
        .domain(sortedData.map(d => d.language))
        .range([0, width])
        .padding(0.2);
    
    const maxValue = d3.max(sortedData, d => d[dimension]);
    const yScale = d3.scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([height, 0])
        .nice();
    
    // Add grid lines
    barSvg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat("")
        );
    
    // Add X axis
    barSvg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");
    
    // Add Y axis
    barSvg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScale).ticks(5))
        .call(g => g.select(".domain").remove());
    
    // Add Y axis label
    const dimensionLabel = dimension === "valence_mean" ? "Valence (Positivity)" : "Arousal (Intensity)";
    
    barSvg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text(dimensionLabel);
    
    // Get tooltip from utilities or create a new one
    const tooltip = window.vizUtils ? window.vizUtils.tooltip : d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    // Create bar groups
    const barGroups = barSvg.selectAll(".bar-group")
        .data(sortedData)
        .enter()
        .append("g")
        .attr("class", "bar-group");
    
    // Add bars with enter animation
    barGroups.append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.language))
        .attr("width", xScale.bandwidth())
        .attr("y", height) // Start from bottom
        .attr("height", 0) // Start with height 0
        .attr("fill", d => colorScale(d.language))
        .attr("rx", 2) // Rounded corners
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.8);
            
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            
            tooltip.html(`
                <h4>${d.language}</h4>
                <p>${dimensionName}: <b>${d[dimension].toFixed(3)}</b></p>
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 1);
            
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition() // Animation
        .duration(750)
        .delay((d, i) => i * 10)
        .attr("y", d => yScale(d[dimension]))
        .attr("height", d => height - yScale(d[dimension]));
    
    // Add value labels with animation
    barGroups.append("text")
        .attr("class", "bar-label")
        .attr("x", d => xScale(d.language) + xScale.bandwidth() / 2)
        .attr("y", height) // Start from bottom
        .attr("text-anchor", "middle")
        .text(d => d[dimension].toFixed(2))
        .style("opacity", 0) // Start invisible
        .transition() // Animation
        .duration(750)
        .delay((d, i) => i * 10 + 250) // Slight delay after bars
        .attr("y", d => yScale(d[dimension]) - 5)
        .style("opacity", 1);
    
    console.log("Bar chart created successfully for dimension:", dimension);
}

/**
 * Updates the bar chart based on the selected dimension
 * @param {string} dimension - The dimension to display (valence_mean or arousal_mean)
 */
function updateModuleEBarChart(dimension) {
    console.log("Updating Module E bar chart for dimension:", dimension);
    
    // Use stored data or sample data if not available
    const data = moduleEData || moduleESampleData;
    
    // Create a new bar chart with the selected dimension
    createBarChart(data, dimension);
}

/**
 * Handles window resize event for Module E
 */
function handleModuleEResize() {
    console.log("Handling Module E resize");
    
    // Simply re-initialize the module which will recalculate all dimensions
    initModuleE();
}

// Make functions available globally
window.initModuleE = initModuleE;
window.updateModuleEBarChart = updateModuleEBarChart;
window.handleModuleEResize = handleModuleEResize;
window.cleanupModuleE = cleanupModuleE;