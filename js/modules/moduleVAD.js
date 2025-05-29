/**
 * moduleVAD.js
 * Lexicon-Based VAD Correlation Matrix Heatmap
 * 
 * This module visualizes the correlation between different VAD (Valence, Arousal, Dominance)
 * lexicons across languages using an interactive heatmap.
 */

function initModuleVAD() {
    // Clear any existing SVG
    document.querySelector("#vad-heatmap").innerHTML = "";
    
    // Create layout dimensions with responsive sizing
    const containerWidth = document.querySelector(".module-vad .chart-area").clientWidth;
    const margin = {top: 80, right: 120, bottom: 70, left: 200};
    
    // Dynamically calculate cell size based on container width
    const baseSize = Math.min(Math.max(containerWidth / 6, 80), 140);
    const cellSize = baseSize;
    
    // Load data
    const dataPath = window.vizUtils && window.vizUtils.dataPath ? 
        window.vizUtils.dataPath.getPath('', 'vad_correlation.json') : 
        'data\vad_correlation.json';
    
    // Show loading indicator
    document.getElementById("loading-vad").style.display = "block";
    
    d3.json(dataPath).then(function(data) {
        // Hide loading indicator
        document.getElementById("loading-vad").style.display = "none";
      
        // Extract unique row and column names
        const rows = Array.from(new Set(data.map(d => d.row)));
        const cols = Array.from(new Set(data.map(d => d.column)));
      
        // Calculate dimensions based on data
        const width = margin.left + margin.right + cols.length * cellSize;
        const height = margin.top + margin.bottom + rows.length * cellSize;
      
        // Create SVG with appropriate dimensions
        const svg = d3.select("#vad-heatmap")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
      
        // Create color scale with improved color palette
        // Using a more sophisticated diverging color scheme that fits our design
        // const color = d3.scaleLinear()
        //     .domain([-1, -0.5, 0, 0.5, 1])
        //     .range(["#053061", "#4393c3", "#f7f7f7", "#d6604d", "#67001f"]);
        const color = d3.scaleLinear()
            .domain([-1, 0, 1])
            .range(["#3298cb", "#f7f7f7", "#d9534f"]);
            
        // Add subtle grid pattern for background
        const defs = svg.append("defs");
        
        // Create pattern for background texture
        defs.append("pattern")
            .attr("id", "grid-pattern")
            .attr("width", 10)
            .attr("height", 10)
            .attr("patternUnits", "userSpaceOnUse")
            .append("path")
            .attr("d", "M 10 0 L 0 0 0 10")
            .attr("fill", "none")
            .attr("stroke", "#f0f0f0")
            .attr("stroke-width", 1);
        
        // Create background for entire chart
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#ffffff")
            .attr("fill-opacity", 0.8);
            
        // Create a group for the heatmap cells
        const heatmapGroup = svg.append("g")
            .attr("class", "heatmap-group");
      
        // Draw heatmap cells with enhanced styling
        const cells = heatmapGroup.selectAll("rect.cell")
            .data(data)
            .join("rect")
            .attr("class", "cell")
            .attr("x", d => margin.left + cols.indexOf(d.column) * cellSize)
            .attr("y", d => margin.top + rows.indexOf(d.row) * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("rx", 12)
            .attr("fill", d => color(d.value))
            .attr("opacity", 0) // Start with opacity 0 for animation
            .on("mouseover", function(event, d) {
                // Highlight this cell
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 2);
                    
                // Show tooltip with detailed information
                const tooltipVAD = window.vizUtils ? window.vizUtils.tooltip : d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
                    
                tooltipVAD.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    
                tooltipVAD.html(`
                    <div class="tooltip-title">Correlation: ${d.value.toFixed(3)}</div>
                    <div class="tooltip-value">Row: ${formatLexiconName(d.row)}</div>
                    <div class="tooltip-value">Column: ${formatLexiconName(d.column)}</div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
                
                // Highlight related row and column labels
                highlightAxis(d.row, d.column);
            })
            .on("mouseout", function(event, d) {
                // Reset cell styling
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2.5);
                    
                // Hide tooltip
                const tooltipVAD = window.vizUtils ? window.vizUtils.tooltip : d3.select("body").select(".tooltip");
                tooltipVAD.transition()
                    .duration(500)
                    .style("opacity", 0);
                    
                // Reset highlight
                resetHighlights();
            });
            
        // Animate cells appearing sequentially
        cells.transition()
            .duration(500)
            .delay((d, i) => i * 20)
            .attr("opacity", 1);
      
        // Cell value text with better typography and contrast
        heatmapGroup.selectAll("text.cell-value")
            .data(data)
            .join("text")
            .attr("class", "cell-value")
            .attr("x", d => margin.left + cols.indexOf(d.column) * cellSize + cellSize / 2)
            .attr("y", d => margin.top + rows.indexOf(d.row) * cellSize + cellSize / 2 + 6)
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("opacity", 0) // Start with opacity 0 for animation
            .style("fill", d => getContrastColor(d.value))
            .text(d => d.value.toFixed(2))
            .transition()
            .duration(500)
            .delay((d, i) => 500 + i * 20)
            .attr("opacity", 1);
            
        // Function to determine text color based on background
        function getContrastColor(value) {
            // Determine text color based on background brightness
            const bgColor = d3.rgb(color(value));
            const brightness = (bgColor.r * 299 + bgColor.g * 587 + bgColor.b * 114) / 1000;
            return brightness > 125 ? "#000" : "#fff";
        }
      
        // Draw row labels with improved styling
        const rowLabels = svg.selectAll("text.row-label")
            .data(rows)
            .join("text")
            .attr("class", "cell-label row-label")
            .attr("x", margin.left - 22)
            .attr("y", (d, i) => margin.top + i * cellSize + cellSize / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("opacity", 0) // Start with opacity 0 for animation
            .text(d => formatLexiconName(d));
            
        rowLabels.transition()
            .duration(500)
            .delay((d, i) => i * 50)
            .attr("opacity", 1);
      
        // Draw column labels with improved styling
        const colLabels = svg.selectAll("text.col-label")
            .data(cols)
            .join("text")
            .attr("class", "cell-label col-label")
            .attr("x", (d, i) => margin.left + i * cellSize + cellSize / 2)
            .attr("y", margin.top - 28)
            .attr("text-anchor", "middle")
            .attr("opacity", 0) // Start with opacity 0 for animation
            .text(d => formatLexiconName(d))
            .attr("transform", (d, i) => {
                const x = margin.left + i * cellSize + cellSize / 2;
                const y = margin.top - 28;
                return `rotate(-30, ${x}, ${y})`;
            });
            
        colLabels.transition()
            .duration(500)
            .delay((d, i) => i * 50)
            .attr("opacity", 1);
      
        // Format lexicon names for better readability
        function formatLexiconName(name) {
            return name
                .replace("_lexicon", "")
                .replace(/^./, c => c.toUpperCase())
                .replace(/_/g, " ");
        }
        
        // Functions to highlight related rows and columns
        function highlightAxis(row, column) {
            // Dim all labels
            rowLabels.attr("opacity", 0.3);
            colLabels.attr("opacity", 0.3);
            
            // Highlight matching labels
            rowLabels.filter(d => d === row)
                .attr("opacity", 1)
                .attr("font-weight", "bold");
                
            colLabels.filter(d => d === column)
                .attr("opacity", 1)
                .attr("font-weight", "bold");
        }
        
        function resetHighlights() {
            rowLabels.attr("opacity", 1).attr("font-weight", "normal");
            colLabels.attr("opacity", 1).attr("font-weight", "normal");
        }
      
        // Create color legend with gradient
        const legendDefs = svg.append("defs");
        const linearGradient = legendDefs.append("linearGradient")
            .attr("id", "vad-heatmap-gradient")
            .attr("x1", "0%").attr("y1", "100%")
            .attr("x2", "0%").attr("y2", "0%");
      
        // Add color stops to gradient with our enhanced color palette
        linearGradient.selectAll("stop")
            // .data([
            //     {offset: "0%", color: "#053061"},
            //     {offset: "25%", color: "#4393c3"},
            //     {offset: "50%", color: "#f7f7f7"},
            //     {offset: "75%", color: "#d6604d"},
            //     {offset: "100%", color: "#67001f"}
            // ])
            .data([
                {offset: "0%", color: "#3298cb"},
                {offset: "50%", color: "#f7f7f7"},
                {offset: "100%", color: "#d9534f"}
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);
      
        // Color bar with improved design
        const cb_x = width - margin.right + 44,
              cb_y = margin.top,
              cb_w = 22,
              cb_h = cellSize * rows.length;
      
        svg.append("rect")
            .attr("x", cb_x)
            .attr("y", cb_y)
            .attr("width", cb_w)
            .attr("height", cb_h)
            .style("fill", "url(#vad-heatmap-gradient)")
            .attr("rx", 9)
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1)
            .attr("opacity", 0) // Start with opacity 0 for animation
            .transition()
            .duration(800)
            .attr("opacity", 1);
      
        // Color bar axis with improved typography
        const cbScale = d3.scaleLinear().domain([-1, 1]).range([cb_h + cb_y, cb_y]);
        const cbAxis = d3.axisRight(cbScale)
            .ticks(5)
            .tickFormat(d3.format(".2f"));
      
        const colorbarAxis = svg.append("g")
            .attr("class", "colorbar-label")
            .attr("transform", `translate(${cb_x + cb_w},0)`)
            .attr("opacity", 0); // Start with opacity 0 for animation
            
        colorbarAxis.call(cbAxis)
            .call(g => g.selectAll(".domain").attr("stroke", "#bbb"))
            .call(g => g.selectAll(".tick line").attr("stroke", "#bbb"))
            .call(g => g.selectAll("text").attr("font-weight", 500));
            
        colorbarAxis.transition()
            .duration(800)
            .attr("opacity", 1);
            
        // Add title for color legend
        svg.append("text")
            .attr("x", cb_x + cb_w / 2)
            .attr("y", cb_y - 15)
            .attr("text-anchor", "middle")
            .attr("class", "colorbar-title")
            .text("Correlation")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .style("fill", "#444")
            .attr("opacity", 0) // Start with opacity 0 for animation
            .transition()
            .duration(800)
            .attr("opacity", 1);
            
        // Add informative caption
        svg.append("text")
            .attr("x", margin.left)
            .attr("y", height - 24)
            .attr("class", "heatmap-caption")
            .text("Correlation values range from -1 (negative correlation) to 1 (positive correlation)")
            .style("font-size", "13px")
            .style("font-style", "italic")
            .style("fill", "#666")
            .attr("opacity", 0) // Start with opacity 0 for animation
            .transition()
            .duration(800)
            .delay(1000)
            .attr("opacity", 0.8);
    }).catch(error => {
        console.error("Error loading VAD correlation data:", error);
        // Handle error with common error handler
        if (window.vizUtils && window.vizUtils.handleDataError) {
            window.vizUtils.handleDataError('vad', error);
        } else {
            document.getElementById("loading-vad").textContent = "Error loading data. Please check console for details.";
        }
    });
}

/**
 * Handles window resize event for VAD Heatmap Module
 * Redraws visualization to fit new screen dimensions
 */
function handleModuleVADResize() {
    // Re-initialize to redraw with new dimensions
    initModuleVAD();
}

// Make the initialization function available globally
window.initModuleVAD = initModuleVAD;