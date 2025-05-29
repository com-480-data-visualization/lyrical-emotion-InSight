/**
 * moduleCMatrix.js
 * Confusion Matrix visualization showing the relationship between VAD (Valence, Arousal, Dominance)
 * and Episode classifications.
 * 
 * This module creates an interactive, visually enhanced confusion matrix with
 * hover effects, animations, and responsive design.
 */

function initModuleCMatrix() {
    // Clear existing visualization if present
    document.querySelector("#confusion-matrix-container").innerHTML = 
        '<svg id="matrix" width="100%" height="485"></svg>';
    
    // Create a tooltip if shared one isn't available
    let tooltip;
    if (window.vizUtils && window.vizUtils.tooltip) {
        tooltip = window.vizUtils.tooltip;
    } else {
        // Remove any existing tooltips with the same ID to avoid duplicates
        d3.selectAll(".tooltip-cmatrix").remove();
        
        tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip tooltip-cmatrix")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "6px")
            .style("padding", "10px")
            .style("box-shadow", "0 3px 14px rgba(0,0,0,0.15)")
            .style("pointer-events", "none")
            .style("font-size", "14px")
            .style("line-height", "1.4")
            .style("z-index", "1000");
    }
    
    // Path helper for data files
    const dataPath = window.vizUtils && window.vizUtils.dataPath ? 
        window.vizUtils.dataPath.getPath('', 'confusion_matrix.csv') : 
        'confusion_matrix.csv';
        
    // Show loading state
    const matrixSvg = d3.select("#matrix");
    const containerWidth = document.querySelector("#confusion-matrix-container").clientWidth;
    
    // Display loading indicator
    matrixSvg.append("text")
        .attr("class", "loading-text")
        .attr("x", containerWidth / 2)
        .attr("y", 200)
        .attr("text-anchor", "middle")
        .text("Loading visualization...");
    
    // Load and process data
    d3.csv(dataPath).then(function(raw) {
        // Remove loading indicator
        matrixSvg.select(".loading-text").remove();
        
        // Extract class labels and prepare data in matrix format
        const labels = Object.keys(raw[0]).filter(k=>k!=="True");
        const n = labels.length;
        const data = [];
        
        // Process data
        raw.forEach((row,i)=>{
            // Calculate row sum for percentage calculation
            const rowSum = labels.reduce((sum, label) => sum + (+row[label]), 0);
            
            labels.forEach((pred,j)=>{
                data.push({
                    row: i, 
                    col: j,
                    true_label: row["True"],
                    pred_label: pred,
                    value: +row[pred],
                    percentage: rowSum > 0 ? (+row[pred] / rowSum * 100) : 0
                });
            });
        });
        
        // Responsive design calculations
        const containerWidth = document.querySelector("#confusion-matrix-container").clientWidth;
        const cellWidth = Math.min(100, (containerWidth - 250) / n);
        const cellHeight = 56;
        const margin = {top: 65, left: 135, right: 150, bottom: 40};
        

        // Calculate the width and height of the entire visualization
        const width = margin.left + n * cellWidth + margin.right;
        const height = margin.top + n * cellHeight + margin.bottom;
        
        // Get the maximum value for color scaling
        const maxValue = d3.max(data, d => d.value);
        
        // Create a logarithmic color scale for better visualization of highly skewed data
        // Add a small constant (1) to handle zero values
        const logScale = d3.scaleLog()
            .domain([1, maxValue])
            .range([0, 1]);
            
        // Create a custom color scale using the log scale
        const color = d3.scaleSequential()
            .domain([0, 1])
            .interpolator(d3.interpolateBlues);
            
        // Function to map data values to colors, handling zeros specially
        const getColor = (value) => {
            if (value === 0) return "#f8f9fa"; // Very light color for zeros
            return color(logScale(Math.max(1, value))); // Ensure at least 1 to handle log(0)
        };
        
        // Prepare the SVG
        const svg = d3.select("#matrix")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
        
        // Create a container group for matrix elements
        const matrixGroup = svg.append("g")
            .attr("class", "matrix-group");
        
        // Add subtle grid pattern for background
        const defs = svg.append("defs");
        const pattern = defs.append("pattern")
            .attr("id", "grid-pattern")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 10)
            .attr("height", 10)
            .attr("patternTransform", "rotate(45)");
            
        pattern.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "#f9fafc");
            
        pattern.append("path")
            .attr("d", "M 0,0 L 0,10 10,10 10,0 z")
            .attr("stroke", "#f1f3f7")
            .attr("stroke-width", 0.5)
            .attr("fill", "none");
            
        // Add a background rectangle with the pattern
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "url(#grid-pattern)")
            .attr("opacity", 0.4);
        
        // Draw matrix rectangles (cells) with enhanced styling and animation
        const cells = matrixGroup.selectAll(".cell-rect")
            .data(data)
            .join("rect")
            .attr("class", "cell-rect")
            .attr("x", d => margin.left + d.col * cellWidth)
            .attr("y", d => margin.top + d.row * cellHeight)
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", "#ffffff")
            .attr("stroke", "#e5e8ed")
            .attr("stroke-width", 1.2)
            .on("mouseover", function(event, d) {
                // Highlight cell
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("stroke", "#2979ff")
                    .attr("stroke-width", 2);
                
                // Highlight row and column labels
                matrixGroup.selectAll(".row-label")
                    .filter((_, i) => i === d.row)
                    .transition()
                    .duration(150)
                    .attr("fill", "#2979ff")
                    .attr("font-weight", 800);
                    
                matrixGroup.selectAll(".col-label")
                    .filter((_, i) => i === d.col)
                    .transition()
                    .duration(150)
                    .attr("fill", "#2979ff")
                    .attr("font-weight", 800);
                
                // Show tooltip with detailed information
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    
                tooltip.html(`
                    <div style="font-weight: bold; margin-bottom: 5px; color: #2979ff;">
                        ${d.true_label} → ${d.pred_label}
                    </div>
                    <div>Count: ${d3.format(",")(d.value)}</div>
                    <div>Percentage: ${d.percentage.toFixed(1)}%</div>
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                // Restore cell appearance
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("stroke", "#e5e8ed")
                    .attr("stroke-width", 1.2);
                
                // Restore label appearance
                matrixGroup.selectAll(".row-label, .col-label")
                    .transition()
                    .duration(150)
                    .attr("fill", "#19233D")
                    .attr("font-weight", 700);
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        // Animate cell fill with a staggered delay for visual appeal
        cells.transition()
            .delay((d, i) => i * 10)
            .duration(800)
            .attr("fill", d => getColor(d.value));
        
        // Cell text values with conditional formatting
        matrixGroup.selectAll("text.cell-value")
            .data(data)
            .join("text")
            .attr("class", "cell-text")
            .attr("x", d => margin.left + d.col * cellWidth + cellWidth / 2)
            .attr("y", d => margin.top + d.row * cellHeight + cellHeight / 2 + 6)
            .attr("text-anchor", "middle")
            .attr("fill", d => {
                // Only for non-zero values
                if (d.value === 0) return "#a0a8b8";
                
                // Calculate perceptual luminance to determine text color
                // Use the actual color for this calculation
                const colorRgb = d3.rgb(getColor(d.value));
                const luminance = 0.299 * colorRgb.r + 0.587 * colorRgb.g + 0.114 * colorRgb.b;
                return luminance > 160 ? "#19233D" : "#ffffff";
            })
            .attr("opacity", 0)
            .text(d => {
                // Format large numbers in a more readable way
                if (d.value === 0) return "0";
                if (d.value < 1000) return d.value;
                return d3.format(".2s")(d.value).replace("G", "B");
            })
            .transition()
            .delay((d, i) => i * 10 + 300)
            .duration(500)
            .attr("opacity", 1);
        
        // Row labels (True class)
        matrixGroup.selectAll("text.row-label")
            .data(labels)
            .join("text")
            .attr("class", "axis-label row-label")
            .attr("x", margin.left - 14)
            .attr("y", (d, i) => margin.top + i * cellHeight + cellHeight / 2 + 8)
            .attr("text-anchor", "end")
            .text(d => d);
        
        // Column labels (Predicted class)
        matrixGroup.selectAll("text.col-label")
            .data(labels)
            .join("text")
            .attr("class", "axis-label col-label")
            .attr("x", (d, i) => margin.left + i * cellWidth + cellWidth / 2)
            .attr("y", margin.top - 20)
            .attr("text-anchor", "middle")
            .attr("transform", (d, i) => `rotate(-25, ${margin.left + i * cellWidth + cellWidth / 2}, ${margin.top - 20})`)
            .text(d => d);
        
        // Axis titles with enhanced styling
        matrixGroup.append("text")
            .attr("class", "axis-title")
            .attr("x", margin.left + n * cellWidth / 2)
            .attr("y", margin.top - 47)
            .attr("text-anchor", "middle")
            .attr("font-size", "1.17rem")
            .attr("font-weight", 800)
            .attr("fill", "#18203A")
            .text("Predicted");
        
        matrixGroup.append("text")
            .attr("class", "axis-title")
            .attr("x", margin.left - 90)
            .attr("y", margin.top + n * cellHeight / 2 + 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "1.17rem")
            .attr("font-weight", 800)
            .attr("fill", "#18203A")
            .attr("transform", `rotate(-90,${margin.left - 90},${margin.top + n * cellHeight / 2 + 2})`)
            .text("True");
        
        // --- COMPLETELY REWRITTEN COLOR BAR SECTION ---
        // Color bar dimensions and position
        const colorbarHeight = 208;
        const colorbarWidth = 14;
        const colorbarX = width - 100;
        const colorbarY = margin.top + 4;
        
        // Create a dedicated group for the color bar
        const legendGroup = svg.append("g")
            .attr("class", "legend-group");
            
        // Add title for the legend
        legendGroup.append("text")
            .attr("x", colorbarX + colorbarWidth / 2)
            .attr("y", colorbarY - 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.85rem")
            .attr("font-weight", 700)
            .attr("fill", "#404958")
            .text("Count (Log Scale)");
        
        // Create logarithmic scale for the color bar
        const logColorScale = d3.scaleLog()
            .domain([1, maxValue])
            .range([colorbarHeight, 0]);
            
        // Generate distinct points along the scale for the gradient
        const numSteps = 20;
        const colorStops = Array.from({length: numSteps + 1}, (_, i) => i / numSteps);
        
        // Draw individual gradient rectangles instead of using a linear gradient
        // This gives us more control over the appearance
        const stepHeight = colorbarHeight / numSteps;
        
        colorStops.forEach((stop, i) => {
            if (i < numSteps) { // Don't draw for the last stop (used only for color calculation)
                const value = Math.pow(maxValue, 1 - stop); // Reverse the scale (bottom=1, top=maxValue)
                const rectY = colorbarY + stop * colorbarHeight;
                
                legendGroup.append("rect")
                    .attr("x", colorbarX)
                    .attr("y", rectY)
                    .attr("width", colorbarWidth)
                    .attr("height", stepHeight + 0.5) // Slight overlap to avoid gaps
                    .attr("fill", getColor(value));
            }
        });
        
        // Add border to the color bar
        legendGroup.append("rect")
            .attr("x", colorbarX)
            .attr("y", colorbarY)
            .attr("width", colorbarWidth)
            .attr("height", colorbarHeight)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("fill", "none")
            .attr("stroke", "#ccd3dd")
            .attr("stroke-width", 1);
        
        // Create axis for the color bar with fixed tick values
        const tickValues = [1, 10, 100, 1000, 10000, 100000, 1000000].filter(v => v <= maxValue);
        
        // Transform the log scale to match our colorbar position
        const axisScale = d3.scaleLog()
            .domain([1, maxValue])
            .range([colorbarY + colorbarHeight, colorbarY]);
            
        const legendAxis = d3.axisRight(axisScale)
            .tickValues(tickValues)
            .tickFormat(d3.format(","));
        
        // Add the axis to the legend group
        legendGroup.append("g")
            .attr("class", "legend-axis")
            .attr("transform", `translate(${colorbarX + colorbarWidth}, 0)`)
            .call(legendAxis)
            .call(g => {
                g.select(".domain").attr("stroke", "#ccd3dd");
                g.selectAll(".tick line").attr("stroke", "#ccd3dd");
                g.selectAll(".tick text")
                    .attr("font-size", "0.82rem")
                    .attr("fill", "#404958")
                    .attr("dx", "6px");  // 从3px增加到6px
            });
        
        // Add a caption or explanatory text
        svg.append("text")
            .attr("x", margin.left)
            .attr("y", height - 10)
            .attr("text-anchor", "start")
            .attr("font-size", "0.85rem")
            .attr("fill", "#6b7280")
            .text("Using logarithmic scale to show data range");
    }).catch(error => {
        console.error("Error loading confusion matrix data:", error);
        
        // Display error message
        matrixSvg.select(".loading-text")
            .text("Error loading data. Please check console for details.");
            
        // Use error handler from utils if available
        if (window.vizUtils && window.vizUtils.handleDataError) {
            window.vizUtils.handleDataError('cmatrix', error);
        }
    });
}

/**
 * Handles window resize event for Confusion Matrix Module
 */
function handleModuleCMatrixResize() {
    // Simply reinitialize the module which will recalculate all dimensions
    initModuleCMatrix();
}

// Make the initialization function available globally
window.initModuleCMatrix = initModuleCMatrix;
window.handleModuleCMatrixResize = handleModuleCMatrixResize;