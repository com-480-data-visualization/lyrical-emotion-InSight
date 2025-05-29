/**
 * moduleStructE.js
 * Correlation Between Structural and Emotional Features
 * 
 * This module visualizes the correlation matrix between structural features of lyrics
 * and emotional dimensions, showing how form relates to emotional expression.
 */

function initModuleStructE() {
    // Clear previous SVG if it exists
    document.querySelector("#heatmap-container").innerHTML = "";
    
    // Create SVG container
    const svg = d3.select("#heatmap-container")
        .append("svg")
        .attr("id", "heatmap")
        .attr("width", "100%")
        .attr("height", "800px");
        
    // Show loading indicator
    const loading = d3.select("#heatmap-container")
        .append("div")
        .attr("id", "loading-structe")
        .attr("class", "loading")
        .text("Loading correlation data...");
    
    // Enhanced RdBu diverging colormap with better visual contrast
    function enhancedRdBu(t) {
        // Adjusts the standard RdBu colormap for better readability
        return d3.interpolateRdBu(1 - t * 0.94 - 0.03);
    }
    
    // Add subtle animations for cells
    function animateCells() {
        svg.selectAll("rect.cell-rect")
            .transition()
            .duration(700)
            .delay((d, i) => i * 5) // Staggered animation
            .attr("opacity", 1);
            
        svg.selectAll("text.cell-text")
            .transition()
            .duration(700)
            .delay((d, i) => i * 5 + 400) // Text appears after cells
            .attr("opacity", 1);
    }
    
    // Generate matrix visualization from data
    function createMatrix(data) {
        // Hide loading indicator
        loading.remove();
        
        // 1. Extract unique row/column labels and sort them in a meaningful order
        const rows = Array.from(new Set(data.map(d => d.row)));
        const cols = Array.from(new Set(data.map(d => d.column)));
        
        // 2. Set up responsive layout parameters
        const containerWidth = document.getElementById("heatmap-container").clientWidth;
        const cellSize = Math.min(68, Math.max(45, containerWidth / (cols.length + 5))); // Responsive cell size
        const margin = {
            top: 90, 
            left: 235,
            right: 120,
            bottom: 120
        };
        
        const width = margin.left + cols.length * cellSize + margin.right;
        const height = margin.top + rows.length * cellSize + margin.bottom;
        
        // Update SVG dimensions
        svg.attr("viewBox", `0 0 ${width} ${height}`)
           .attr("preserveAspectRatio", "xMidYMid meet");
        
        // 3. Color scale: -1 (blue) -> 0 (white) -> 1 (red)
        const color = d3.scaleDiverging([-1, 0, 1], enhancedRdBu);
        
        // Add drop shadow filter for depth
        const defs = svg.append("defs");
        const filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");
            
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2)
            .attr("result", "blur");
            
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 1)
            .attr("dy", 1)
            .attr("result", "offsetBlur");
            
        const feComponentTransfer = filter.append("feComponentTransfer")
            .attr("in", "offsetBlur")
            .attr("result", "offsetBlur");
            
        feComponentTransfer.append("feFuncA")
            .attr("type", "linear")
            .attr("slope", 0.2);
            
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
            
        // Add background for matrix area
        svg.append("rect")
            .attr("x", margin.left - cellSize/2)
            .attr("y", margin.top - cellSize/2)
            .attr("width", cols.length * cellSize + cellSize)
            .attr("height", rows.length * cellSize + cellSize)
            .attr("fill", "#f8fafd")
            .attr("rx", 12)
            .attr("ry", 12)
            .attr("filter", "url(#drop-shadow)");
            
        // Add main title with enhanced styling
        svg.append("text")
            .attr("class", "matrix-title")
            .attr("x", margin.left)
            .attr("y", margin.top - 50)
            .text("Correlation Between Structural and Emotional Features")
            .attr("font-size", "1.44rem")
            .attr("font-weight", "800")
            .attr("fill", "#1A222C");
            
        // Add subtitle with explanation
        svg.append("text")
            .attr("class", "matrix-subtitle")
            .attr("x", margin.left)
            .attr("y", margin.top - 25)
            .text("Values show Pearson's r correlation coefficient between structural aspects of lyrics and emotional dimensions")
            .attr("font-size", "0.95rem")
            .attr("font-weight", "400")
            .attr("fill", "#4c5a6c");
            
        // Create group for the matrix cells
        const matrixGroup = svg.append("g")
            .attr("class", "matrix-group");
        
        // 4. Draw matrix cells with enhanced styling and initially transparent
        matrixGroup.selectAll("rect.cell")
            .data(data)
            .join("rect")
            .attr("class", "cell-rect")
            .attr("x", d => margin.left + cols.indexOf(d.column) * cellSize)
            .attr("y", d => margin.top + rows.indexOf(d.row) * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("rx", 8)
            .attr("ry", 8)
            .attr("fill", d => color(+d.value))
            .attr("stroke", "#f1f3f7")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0) // Start invisible for animation
            .on("mouseover", function(event, d) {
                // Highlight effect on hover
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("stroke", "#2a3f5a")
                    .attr("stroke-width", 2.5);
                    
                // Show tooltip with detailed information
                const tooltip = d3.select("#tooltip-structe");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.95);
                    
                tooltip.html(`
                    <div class="tooltip-title">${d.row} × ${d.column}</div>
                    <div class="tooltip-value">Correlation: ${(+d.value).toFixed(3)}</div>
                    <div class="tooltip-hint">${getCorrelationDescription(+d.value)}</div>
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // Reset highlight on mouseout
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke", "#f1f3f7")
                    .attr("stroke-width", 1.5);
                    
                // Hide tooltip
                d3.select("#tooltip-structe").transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        // 5. Draw matrix numbers with better contrast and initially transparent
        matrixGroup.selectAll("text.cell-value")
            .data(data)
            .join("text")
            .attr("class", "cell-text")
            .attr("x", d => margin.left + cols.indexOf(d.column) * cellSize + cellSize / 2)
            .attr("y", d => margin.top + rows.indexOf(d.row) * cellSize + cellSize / 2 + 7)
            .attr("text-anchor", "middle")
            .attr("fill", d => Math.abs(+d.value) > 0.65 ? "#fff" : "#21293A")
            .attr("font-weight", "700")
            .attr("opacity", 0) // Start invisible for animation
            .text(d => (+d.value).toFixed(2).replace(/^-0\.00$/, "0.00"));
        
        // 6. Draw Y axis labels (rows, left side) with category grouping
        const rowLabels = svg.append("g")
            .attr("class", "row-labels");
            
        rowLabels.selectAll("text.row-label")
            .data(rows)
            .join("text")
            .attr("class", "axis-label")
            .attr("x", margin.left - 18)
            .attr("y", (d, i) => margin.top + i * cellSize + cellSize / 2 + 10)
            .attr("text-anchor", "end")
            .attr("font-weight", 700)
            .attr("fill", "#283449")
            .text(d => d);
            
        // Add decorative category marks for row groups
        const rowCategories = groupFeaturesByCategory(rows);
        Object.entries(rowCategories).forEach(([category, indices]) => {
            if (indices.length > 1) {
                const startY = margin.top + Math.min(...indices) * cellSize - cellSize/4;
                const endY = margin.top + Math.max(...indices) * cellSize + cellSize * 3/4;
                
                rowLabels.append("rect")
                    .attr("x", margin.left - 210)
                    .attr("y", startY)
                    .attr("width", 4)
                    .attr("height", endY - startY)
                    .attr("fill", getCategoryColor(category))
                    .attr("rx", 2);
                    
                rowLabels.append("text")
                    .attr("x", margin.left - 212)
                    .attr("y", startY + (endY - startY)/2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "end")
                    .attr("fill", getCategoryColor(category))
                    .attr("font-weight", "600")
                    .attr("font-size", "0.8rem")
                    .text(formatCategoryName(category));
            }
        });
        
        // 7. Draw X axis labels (columns, slanted) with improved readability
        svg.append("g")
            .attr("class", "column-labels")
            .selectAll("text.col-label")
            .data(cols)
            .join("text")
            .attr("class", "axis-label col-label")
            .attr("x", (d, i) => margin.left + i * cellSize + cellSize / 2)
            .attr("y", margin.top + rows.length * cellSize + 20)
            .attr("text-anchor", "end")
            .attr("font-size", "1.02rem")
            .attr("fill", "#283449")
            .attr("transform", (d, i) => 
                `rotate(-40, ${margin.left + i * cellSize + cellSize / 2}, ${margin.top + rows.length * cellSize + 20})`)
            .text(d => d);
        
        // 8. Draw enhanced colorbar (vertical, right side)
        const colorbarHeight = 326;
        const colorbarWidth = 16;
        const colorbarX = width - 80;
        const colorbarY = margin.top + 10;
        
        const colorbarDefs = svg.append("defs");
        const gradient = colorbarDefs.append("linearGradient")
            .attr("id", "colorbar-gradient")
            .attr("x1", "0%").attr("y1", "100%")
            .attr("x2", "0%").attr("y2", "0%");
            
        // Create smooth gradient with many color stops
        for (let i = 0; i <= 100; i++) {
            gradient.append("stop")
                .attr("offset", `${i}%`)
                .attr("stop-color", enhancedRdBu(i/100));
        }
        
        // Draw colorbar background with rounded corners
        svg.append("rect")
            .attr("x", colorbarX)
            .attr("y", colorbarY)
            .attr("width", colorbarWidth)
            .attr("height", colorbarHeight)
            .attr("rx", 4)
            .attr("ry", 4)
            .style("fill", "url(#colorbar-gradient)")
            .style("stroke", "#cdd8e8")
            .style("stroke-width", "1px");
        
        // 9. Draw colorbar axis with improved styling
        const cbScale = d3.scaleLinear().domain([-1, 1]).range([colorbarY + colorbarHeight, colorbarY]);
        const cbAxis = d3.axisRight(cbScale)
            .ticks(8)
            .tickFormat(d3.format(".2f"));
            
        svg.append("g")
            .attr("transform", `translate(${colorbarX + colorbarWidth + 32},0)`)
            .call(cbAxis)
            .selectAll("text")
            .attr("class", "colorbar-label")
            .attr("font-size", "0.97rem")
            .attr("fill", "#384458")
            .attr("font-weight", "600");
        
            
        // Style the colorbar ticks
        svg.selectAll(".tick").classed("colorbar-tick", true);
        svg.selectAll(".colorbar-tick line")
            .attr("stroke", "#cdd8e8")
            .attr("stroke-width", 1);
            
        // Add colorbar title
        svg.append("text")
            .attr("x", colorbarX + colorbarWidth/2)
            .attr("y", colorbarY - 12)
            .attr("text-anchor", "middle")
            .attr("font-size", "0.9rem")
            .attr("font-weight", "700")
            .attr("fill", "#384458")
            .text("Correlation");
            
        // Add colorbar annotations
        svg.append("text")
            .attr("x", colorbarX + colorbarWidth + 45)
            .attr("y", colorbarY + 10)
            .attr("text-anchor", "start")
            .attr("font-size", "0.8rem")
            .attr("fill", "#b6463e")
            .attr("font-weight", "600")
            .text("Strong positive");
            
        svg.append("text")
            .attr("x", colorbarX + colorbarWidth + 45)
            .attr("y", colorbarY + colorbarHeight - 10)
            .attr("text-anchor", "start")
            .attr("font-size", "0.8rem")
            .attr("fill", "#2f6d9c")
            .attr("font-weight", "600")
            .text("Strong negative");
            
        // Start animations after a short delay
        setTimeout(animateCells, 200);
    }
    
    // Helper function to group features by category
    function groupFeaturesByCategory(features) {
        const categories = {
            'rhythm': [],
            'structure': [],
            'rhyme': [],
            'phonetics': [],
            'emotion': [],
            'other': []
        };
        
        features.forEach((feature, index) => {
            const lowerFeature = feature.toLowerCase();
            if (lowerFeature.includes('rhythm') || lowerFeature.includes('tempo') || lowerFeature.includes('beat')) {
                categories.rhythm.push(index);
            } else if (lowerFeature.includes('structure') || lowerFeature.includes('verse') || lowerFeature.includes('chorus')) {
                categories.structure.push(index);
            } else if (lowerFeature.includes('rhyme') || lowerFeature.includes('assonance')) {
                categories.rhyme.push(index);
            } else if (lowerFeature.includes('phonetic') || lowerFeature.includes('consonant') || lowerFeature.includes('vowel')) {
                categories.phonetics.push(index);
            } else if (lowerFeature.includes('valence') || lowerFeature.includes('arousal') || lowerFeature.includes('dominance')) {
                categories.emotion.push(index);
            } else {
                categories.other.push(index);
            }
        });
        
        // Remove empty categories
        return Object.fromEntries(
            Object.entries(categories).filter(([_, indices]) => indices.length > 0)
        );
    }
    
    // Helper function to get color for category
    function getCategoryColor(category) {
        const colors = {
            'rhythm': '#e77c5f',
            'structure': '#5c97d8',
            'rhyme': '#6ebf9b',
            'phonetics': '#b46cbd',
            'emotion': '#e8b341',
            'other': '#7f8c9c'
        };
        return colors[category] || '#7f8c9c';
    }
    
    // Helper function to format category names
    function formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1) + ' Features';
    }
    
    // Helper function to describe correlation strength
    function getCorrelationDescription(value) {
        const absValue = Math.abs(value);
        const direction = value > 0 ? "positive" : "negative";
        
        if (absValue > 0.8) return `Very strong ${direction} correlation`;
        if (absValue > 0.6) return `Strong ${direction} correlation`;
        if (absValue > 0.4) return `Moderate ${direction} correlation`;
        if (absValue > 0.2) return `Weak ${direction} correlation`;
        return `Very weak ${direction} correlation`;
    }
    
    // Load JSON data with error handling
    d3.json("data/structural_emotional_correlation.json")
        .then(createMatrix)
        .catch(error => {
            console.error("Error loading correlation data:", error);
            
            // Use the shared error handler if available
            if (window.vizUtils && window.vizUtils.handleDataError) {
                window.vizUtils.handleDataError('structe', error);
            } else {
                // Fallback error handling
                document.querySelector("#loading-structe").innerHTML = `
                    <div class="error-message">
                        <strong>Error loading data</strong>
                        <p>Could not load correlation matrix data.</p>
                    </div>
                `;
            }
            
            // Load sample data instead
            createSampleMatrix();
        });
}

// Function to create sample matrix if data loading fails
function createSampleMatrix() {
    // Sample correlation data for demonstration
    const sampleData = [];
    const rows = [
        "Verse Length", "Chorus Length", "Bridge Presence", 
        "Rhyme Density", "Repetition Rate", "Syllable Count",
        "Line Count", "Word Count", "Unique Words"
    ];
    
    const cols = [
        "Valence", "Arousal", "Dominance", 
        "Joy", "Sadness", "Anger", "Fear"
    ];
    
    // Generate random correlation values
    rows.forEach(row => {
        cols.forEach(col => {
            // Create realistic correlations with some strong relationships
            let value;
            if (row === "Verse Length" && col === "Sadness") value = 0.62;
            else if (row === "Chorus Length" && col === "Joy") value = 0.71;
            else if (row === "Repetition Rate" && col === "Valence") value = 0.58;
            else if (row === "Unique Words" && col === "Dominance") value = 0.67;
            else if (row === "Bridge Presence" && col === "Arousal") value = -0.55;
            else value = (Math.random() * 2 - 1) * 0.7; // Random between -0.7 and 0.7
            
            sampleData.push({
                row: row,
                column: col,
                value: value
            });
        });
    });
    
    return sampleData;
}

// Resize handler for this module
function handleModuleStructEResize() {
    // Re-initialize to adapt to new dimensions
    initModuleStructE();
}

// Make functions available globally
window.initModuleStructE = initModuleStructE;
window.handleModuleStructEResize = handleModuleStructEResize;