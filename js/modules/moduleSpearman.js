/**
 * moduleSpearman.js
 * Spearman Correlation Matrix Visualization Module
 * 
 * This module creates an interactive heatmap showing Spearman correlations
 * between different lyrical features.
 */

function initModuleSpearman() {
    // Clear previous content if exists
    document.querySelector("#spearman-viz").innerHTML = "";
    
    // ========== 1. DATA & CONFIGURATION ==========
    
    // Spearman correlation matrix values
    const data = [
        [1.00, -0.13, -0.06, 0.14, -0.19, -0.07, -0.03, 0.03],
        [-0.13, 1.00, -0.11, 0.13, 0.02, 0.18, -0.13, 0.12],
        [-0.06, -0.11, 1.00, 0.09, 0.06, 0.03, 0.04, 0.02],
        [0.14, 0.13, 0.09, 1.00, 0.05, 0.14, -0.10, 0.14],
        [-0.19, 0.02, 0.06, 0.05, 1.00, 0.09, -0.05, 0.07],
        [-0.07, 0.18, 0.03, 0.14, 0.09, 1.00, -0.30, 0.62],
        [-0.03, -0.13, 0.04, -0.10, -0.05, -0.30, 1.00, 0.13],
        [0.03, 0.12, 0.02, 0.14, 0.07, 0.62, 0.13, 1.00]
    ];

    // Feature names (axes) with more descriptive labels
    const features = [
        "Type-Token Ratio",
        "Refrain Repetition",
        "Metaphor Density",
        "Avg. Line Length",
        "Readability Grade",
        "Valence (Positivity)",
        "Arousal (Energy)",
        "Dominance (Control)"
    ];
    
    // Original feature names for data mapping
    const featureKeys = [
        "type_token_ratio",
        "refrain_repetition_score",
        "metaphor_density",
        "avg_line_length",
        "flesch_kincaid_grade",
        "valence_lexicon",
        "arousal_lexicon",
        "dominance_lexicon"
    ];
    
    // Try to load data from CSV if available
    d3.csv("data/spearman_correlation.csv").then(csvData => {
        if (csvData && csvData.length > 0) {
            // Process CSV data into matrix format
            processData(csvData);
        } else {
            // Use default data and create visualization
            createVisualization(data, features);
        }
    }).catch(error => {
        console.log("Using default data as CSV not found:", error);
        createVisualization(data, features);
    });
    
    // Function to process CSV data into matrix format
    function processData(csvData) {
        try {
            // Extract the matrix from CSV
            const processedData = [];
            featureKeys.forEach(rowKey => {
                const row = [];
                featureKeys.forEach(colKey => {
                    // Find the value in CSV data
                    const entry = csvData.find(d => d.row === rowKey && d.column === colKey);
                    if (entry) {
                        row.push(parseFloat(entry.value));
                    } else {
                        // If no value found, use 0
                        row.push(0);
                    }
                });
                processedData.push(row);
            });
            
            // Create visualization with processed data
            createVisualization(processedData, features);
        } catch (error) {
            console.error("Error processing CSV data:", error);
            // Fall back to default data
            createVisualization(data, features);
        }
    }
    
    // Function to create the correlation matrix visualization
    function createVisualization(correlationData, featureLabels) {
        const n = featureLabels.length;
        
        // Get container width for responsive sizing
        const containerWidth = document.querySelector(".visualization-container.module-spearman").clientWidth;
        const isMobile = containerWidth < 768;
        
        // Adjust cell size based on available width
        const cellSize = isMobile ? 
            Math.min(50, (containerWidth - 280) / n) : 
            Math.min(65, (containerWidth - 400) / n);
        
        // Margins (top, left, right, bottom) - INCREASED RIGHT MARGIN
        const margin = { 
            top: 60, 
            left: isMobile ? 160 : 180, 
            right: 220,  // Increased from 120 to 180
            bottom: 180 
        };
        
        // Color bar size
        const colorbarW = 24, colorbarH = cellSize * n * 0.92;
        
        // SVG dimensions (computed)
        const width = margin.left + n * cellSize + margin.right;
        const height = margin.top + n * cellSize + margin.bottom;
        
        // Create SVG container
        const svg = d3.select("#spearman-viz")
            .append("svg")
            .attr("width", "100%")  // Make SVG responsive
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
        
        // Add a subtle background pattern
        const defs = svg.append("defs");
        
        // Create pattern for background
        const pattern = defs.append("pattern")
            .attr("id", "grid-pattern")
            .attr("width", 10)
            .attr("height", 10)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("patternTransform", "rotate(45)");
            
        pattern.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "#f9f9f9");
            
        pattern.append("path")
            .attr("d", "M 0,0 L 0,10 10,10 10,0 Z")
            .attr("stroke", "#f0f0f0")
            .attr("stroke-width", 1)
            .attr("fill", "none");
        
        // Add background rectangle
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "url(#grid-pattern)")
            .attr("opacity", 0.6);
        
        // Add title with styling consistent with other modules
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2)
            .attr("y", 25)  // Moved up slightly
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "600")
            .attr("fill", "#333")
            .text("Feature Correlation Matrix");
            
        // Add subtitle
        svg.append("text")
            .attr("class", "chart-subtitle")
            .attr("x", width / 2)
            .attr("y", 45)  // Adjusted position
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#666")
            .text("Spearman correlation between lyrical features");
        
        // Create tooltip for additional information
        const tooltip = d3.select(".module-spearman")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "rgba(255, 255, 255, 0.95)")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "10px")
            .style("box-shadow", "0px 2px 10px rgba(0,0,0,0.1)")
            .style("pointer-events", "none");
        
        // Color scale with enhanced aesthetics
        // Diverging color: blue (negative), white (0), red (positive)
        const color = d3.scaleLinear()
            .domain([-1, -0.5, 0, 0.5, 1])
            .range(["#2c7bb6", "#abd9e9", "#f7f7f7", "#fdae61", "#d7191c"]);
        
        // Create gradient for cell backgrounds
        const cellGradient = defs.append("linearGradient")
            .attr("id", "cell-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%");
            
        cellGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 0.1);
            
        cellGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 0.3);
        
        // Function to get description of correlation strength
        function getCorrelationDescription(value) {
            const absValue = Math.abs(value);
            if (absValue >= 0.9) return "Very strong";
            if (absValue >= 0.7) return "Strong";
            if (absValue >= 0.5) return "Moderate";
            if (absValue >= 0.3) return "Weak";
            return "Very weak";
        }
        
        // Create cells with animation and interactivity
        const cells = svg.selectAll("rect.cell")
            .data(d3.cross(d3.range(n), d3.range(n)))
            .join("rect")
            .attr("class", "cell")
            .attr("x", ([i, j]) => margin.left + j * cellSize)
            .attr("y", ([i, j]) => margin.top + i * cellSize)
            .attr("width", cellSize - 2)
            .attr("height", cellSize - 2)
            .attr("rx", 4) // rounded corners
            .attr("ry", 4)
            .attr("fill", ([i, j]) => color(correlationData[i][j]))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("opacity", 0) // Start with 0 opacity for animation
            .on("mouseover", function(event, [i, j]) {
                // Highlight this cell
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 2)
                    .attr("opacity", 1);
                
                // Highlight row and column
                cells.filter(([r, c]) => r === i || c === j)
                    .transition()
                    .duration(150)
                    .attr("opacity", 1);
                
                // Show tooltip with detailed information
                const value = correlationData[i][j];
                const strength = getCorrelationDescription(value);
                const direction = value > 0 ? "positive" : value < 0 ? "negative" : "no";
                
                tooltip.transition().duration(200).style("opacity", 0.95);
                tooltip.html(`
                    <div style="font-weight:600; margin-bottom:5px;">
                        ${featureLabels[i]} × ${featureLabels[j]}
                    </div>
                    <div>Correlation: <strong>${value.toFixed(2)}</strong></div>
                    <div>${strength} ${direction} correlation</div>
                    <div style="font-size:0.8em; margin-top:5px; color:#666;">
                        ${direction === "positive" ? "As one increases, the other tends to increase" : 
                          direction === "negative" ? "As one increases, the other tends to decrease" : 
                          "No clear relationship"}
                    </div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, [i, j]) {
                // Restore cell style
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.85);
                
                // Restore other cells
                cells.filter(([r, c]) => r !== i || c !== j)
                    .transition()
                    .duration(150)
                    .attr("opacity", 0.85);
                
                // Hide tooltip
                tooltip.transition().duration(500).style("opacity", 0);
            });
        
        // Animate cells appearing
        cells.transition()
            .duration(800)
            .delay(([i, j]) => 100 + i * 50 + j * 50)
            .attr("opacity", 0.85);
        
        // Add correlation text with enhanced styling - ADJUSTED FONT SIZE
        svg.selectAll("text.cell-value")
            .data(d3.cross(d3.range(n), d3.range(n)))
            .join("text")
            .attr("class", "cell-text")
            .attr("x", ([i, j]) => margin.left + j * cellSize + (cellSize - 2) / 2)
            .attr("y", ([i, j]) => margin.top + i * cellSize + (cellSize - 2) / 2 + 1)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .attr("font-size", d => {
                const value = Math.abs(correlationData[d[0]][d[1]]);
                // Smaller font sizes for better fitting
                return value >= 0.98 ? "11px" : 
                       value >= 0.7 ? "10px" : "9px";
            })
            .attr("font-weight", d => {
                const value = Math.abs(correlationData[d[0]][d[1]]);
                return value >= 0.7 ? 700 : 600;
            })
            .attr("fill", ([i, j]) => {
                const value = correlationData[i][j];
                return Math.abs(value) > 0.6 ? "#fff" : 
                       value < 0 ? "#2c7bb6" : 
                       value > 0 ? "#d7191c" : "#333";
            })
            .text(([i, j]) => correlationData[i][j].toFixed(2))
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .delay(([i, j]) => 150 + i * 50 + j * 50)
            .attr("opacity", 1);
        
        // Add row labels with improved styling
        svg.selectAll("text.row-label")
            .data(featureLabels)
            .join("text")
            .attr("class", "axis-label")
            .attr("x", margin.left - 10)
            .attr("y", (d, i) => margin.top + i * cellSize + cellSize / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .attr("fill", "#333")
            .attr("font-size", "11px")
            .attr("font-weight", 600)
            .text(d => d)
            .attr("opacity", 0)
            .transition()
            .duration(800)
            .delay((d, i) => 200 + i * 100)
            .attr("opacity", 1);
        
        // FIXED: Improved column labels positioning and rotation
        svg.selectAll("text.col-label")
            .data(featureLabels)
            .join("text")
            .attr("class", "axis-label")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", (d, i) => {
                // Position at the top of each column
                const x = margin.left + i * cellSize + cellSize / 2;
                const y = margin.bottom + 415;
                // Rotate 45 degrees counterclockwise around the anchor point
                return `translate(${x}, ${y}) rotate(-45)`;
            })
            .attr("text-anchor", "end")
            .attr("fill", "#333")
            .attr("font-size", "11px")
            .attr("font-weight", 600)
            .text(d => d)
            .attr("opacity", 0)
            .transition()
            .duration(800)
            .delay((d, i) => 200 + i * 100)
            .attr("opacity", 1);
        
        // Create gradient for color bar
        const colorbarGradient = defs.append("linearGradient")
            .attr("id", "colorbar-gradient")
            .attr("x1", "0%").attr("y1", "100%")
            .attr("x2", "0%").attr("y2", "0%");
            
        // Add color stops with smoother transitions
        for (let i = 0; i <= 100; i++) {
            colorbarGradient.append("stop")
                .attr("offset", `${i}%`)
                .attr("stop-color", color(-1 + 2 * i / 100));
        }
        
        // MOVED: Color bar position adjusted to the right
        const colorbarX = margin.left + n * cellSize + 50;
        
        // Add color bar with enhanced styling
        svg.append("rect")
            .attr("x", colorbarX)
            .attr("y", margin.top + cellSize * 0.18)
            .attr("width", colorbarW)
            .attr("height", colorbarH)
            .attr("rx", 3)
            .attr("ry", 3)
            .style("fill", "url(#colorbar-gradient)")
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1)
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1);
        
        // Add color bar scale and axis
        const cbScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([margin.top + cellSize * 0.18 + colorbarH, margin.top + cellSize * 0.18]);
            
        const cbAxis = d3.axisRight(cbScale)
            .ticks(5)
            .tickFormat(d3.format(".1f"));
            
        const colorbarAxis = svg.append("g")
            .attr("transform", `translate(${colorbarX + colorbarW}, 0)`)
            .attr("opacity", 0)
            .call(cbAxis);
            
        colorbarAxis.selectAll("text")
            .attr("class", "colorbar-label")
            .attr("font-size", "10px")
            .attr("font-weight", 500)
            .attr("fill", "#555");
            
        colorbarAxis.transition()
            .duration(1000)
            .attr("opacity", 1);
        
        // REPOSITIONED: Color bar labels
        svg.append("text")
            .attr("x", colorbarX + colorbarW + 15)
            .attr("y", margin.top + cellSize * 0.18 - 5)
            .attr("text-anchor", "start")
            .attr("font-size", "11px")
            .attr("font-weight", 600)
            .attr("fill", "#d7191c")
            .text("Strong Positive")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1);
            
        svg.append("text")
            .attr("x", colorbarX + colorbarW + 15)
            .attr("y", margin.top + cellSize * 0.18 + colorbarH + 15)
            .attr("text-anchor", "start")
            .attr("font-size", "11px")
            .attr("font-weight", 600)
            .attr("fill", "#2c7bb6")
            .text("Strong Negative")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1);
            
        svg.append("text")
            .attr("x", colorbarX + colorbarW + 15)
            .attr("y", margin.top + cellSize * 0.18 + colorbarH/2)
            .attr("text-anchor", "start")
            .attr("font-size", "11px")
            .attr("font-weight", 600)
            .attr("fill", "#777")
            .text("No Correlation")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1);
        
        // Add explanatory text
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("fill", "#666")
            .text("Spearman's rank correlation coefficient between lyrical features");
            
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#888")
            .text("Values range from -1 (perfect negative correlation) to 1 (perfect positive correlation)");
    }
}

/**
 * Handles window resize event for Module Spearman
 * Redraws visualization to fit new screen dimensions
 */
function handleModuleSpearmanResize() {
    initModuleSpearman();
}

// Make the initialization function available globally
window.initModuleSpearman = initModuleSpearman;