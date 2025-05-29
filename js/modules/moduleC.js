/**
 * moduleC.js
 * Valence Trends Across Languages Visualization
 * 
 * This module visualizes emotional dimensions and trends across different languages,
 * allowing users to compare valence, arousal, and dominance metrics.
 */

// ===========================
// MODULE C: Valence Trends Across Languages
// ===========================

// MODIFICATION: Wrapped the self-executing function in a named function for external access
function initModuleC() {
    // Global variables
    let data = {
        means: null,
        trends: null
    };
    
    let chart, tooltip;
    
    // Initialize chart dimensions
    const margin = {top: 40, right: 40, bottom: 100, left: 80};
    let width, height;
    
    // Color scales for different data types
    const trendColorScale = d3.scaleLinear()
        .domain([-0.01, 0, 0.01])
        .range(["#e74c3c", "#f39c12", "#2ecc71"]);
        
    const meanColorScales = {
        valence: d3.scaleLinear().domain([0, 0.5]).range(["#3498db", "#e74c3c"]),
        arousal: d3.scaleLinear().domain([0, 0.5]).range(["#9b59b6", "#f1c40f"]),
        dominance: d3.scaleLinear().domain([0.3, 0.7]).range(["#16a085", "#e67e22"])
    };
    
    // MODIFICATION: Removed duplicate formatNumber and formatPercent declarations
    // Now using shared utilities from common.js
    
    // Load data files
    // MODIFICATION: Updated file paths to use the dataPath helper from common.js
    Promise.all([
        d3.csv(window.vizUtils.dataPath.processedData2("language_emotion_means.csv")),
        d3.csv(window.vizUtils.dataPath.processedData2("language_emotion_trends.csv"))
    ]).then(([meansData, trendsData]) => {
        // Process means data
        data.means = {};
        ["valence", "arousal", "dominance"].forEach(emotion => {
            data.means[emotion] = meansData.map(d => ({
                language: d.language,
                value: +d[`${emotion}_mean`],
                sampleCount: +d.sample_count
            })).sort((a, b) => a.value - b.value);
        });
        
        // Process trends data
        data.trends = {};
        ["valence", "arousal", "dominance"].forEach(emotion => {
            data.trends[emotion] = trendsData.map(d => ({
                language: d.language,
                value: +d[`${emotion}_trend`],
                sampleCount: +d.sample_count
            })).sort((a, b) => a.value - b.value);
        });
        
        // Hide loading indicator
        document.getElementById("loading-c").style.display = "none";
        
        // Initialize chart
        initializeChart();
        
        // Draw initial chart
        updateChart();
    }).catch(error => {
        // MODIFICATION: Using shared error handler from common.js
        window.vizUtils.handleDataError("c", error);
    });
    
    function initializeChart() {
        // Get chart container dimensions
        const chartContainer = document.querySelector('.module-c .chart-area');
        width = chartContainer.clientWidth - margin.left - margin.right;
        height = 600 - margin.top - margin.bottom;
        
        // Create SVG and chart group
        chart = d3.select("#chart-c")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        // Add tooltip
        // MODIFICATION: Creating a module-specific tooltip instead of using shared
        // This is kept as-is because this module needs a tooltip attached to a specific container
        tooltip = d3.select(".module-c .chart-area")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
            
        // MODIFICATION: Removed event listeners that are now handled in main.js
        d3.select("#dataType").on("change", updateChart);
        d3.select("#emotionType").on("change", updateChart);
        
        // Add y-axis label
        chart.append("text")
            .attr("class", "axis-label y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .text("Change Over Time");
        
        // Add x-axis label
        chart.append("text")
            .attr("class", "axis-label x-axis-label")
            .attr("transform", `translate(${width / 2}, ${height + 70})`)
            .attr("text-anchor", "middle")
            .text("Language");
            
        // Add baseline for reference
        chart.append("line")
            .attr("class", "baseline")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", height / 2)
            .attr("y2", height / 2)
            .attr("opacity", 0);
    }
    
    // MODIFICATION: Exposed updateChart function so it can be called from main.js
    function updateChart() {
        // Get current selection
        const dataType = d3.select("#dataType").property("value");
        const emotionType = d3.select("#emotionType").property("value");
        
        // Get appropriate data
        const chartData = (dataType === "trend") 
            ? data.trends[emotionType] 
            : data.means[emotionType];
        
        // Update chart title
        const emotionNames = {
            valence: "Valence (Positivity)",
            arousal: "Arousal (Energy)",
            dominance: "Dominance (Control)"
        };
        
        const titleElement = document.querySelector('.module-c h1');
        if (dataType === "trend") {
            titleElement.textContent = `${emotionNames[emotionType]} Trends Across Languages`;
            d3.select(".y-axis-label").text("Regression Coefficient (Change Per Year)");
        } else {
            titleElement.textContent = `Average ${emotionNames[emotionType]} Across Languages`;
            d3.select(".y-axis-label").text("Average Value");
        }
        
        // Setup scales
        const xScale = d3.scaleBand()
            .domain(chartData.map(d => d.language))
            .range([0, width])
            .padding(0.2);
            
        let yScale;
        if (dataType === "trend") {
            // For trends, center at 0
            const maxAbsValue = Math.max(
                Math.abs(d3.min(chartData, d => d.value)),
                Math.abs(d3.max(chartData, d => d.value))
            ) * 1.1;
            yScale = d3.scaleLinear()
                .domain([-maxAbsValue, maxAbsValue])
                .range([height, 0]);
        } else {
            // For means, use appropriate range with buffer
            const minValue = d3.min(chartData, d => d.value) * 0.9;
            const maxValue = d3.max(chartData, d => d.value) * 1.1;
            yScale = d3.scaleLinear()
                .domain([minValue, maxValue])
                .range([height, 0]);
        }
        
        // Create axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        
        // Update or create x-axis
        if (chart.select(".x-axis").empty()) {
            chart.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em");
        } else {
            chart.select(".x-axis")
                .transition()
                .duration(1000)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em");
        }
        
        // Update or create y-axis
        if (chart.select(".y-axis").empty()) {
            chart.append("g")
                .attr("class", "y-axis")
                .call(yAxis);
        } else {
            chart.select(".y-axis")
                .transition()
                .duration(1000)
                .call(yAxis);
        }
        
        // Add grid lines for y-axis
        const yGrid = chart.selectAll(".y-grid-line")
            .data(yScale.ticks());
            
        yGrid.exit().remove();
        
        const yGridEnter = yGrid.enter()
            .append("line")
            .attr("class", "y-grid-line y-line");
            
        yGrid.merge(yGridEnter)
            .transition()
            .duration(1000)
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d));
        
        // Update baseline position
        const zeroPosition = (dataType === "trend") 
            ? yScale(0) 
            : height;
            
        chart.select(".baseline")
            .transition()
            .duration(1000)
            .attr("y1", zeroPosition)
            .attr("y2", zeroPosition)
            .attr("opacity", 1);
        
        // Update/create bars
        const bars = chart.selectAll(".bar")
            .data(chartData, d => d.language);
            
        bars.exit()
            .transition()
            .duration(500)
            .attr("y", zeroPosition)
            .attr("height", 0)
            .remove();
            
        const barsEnter = bars.enter()
            .append("rect")
            .attr("class", "bar gradient-bar")
            .attr("x", d => xScale(d.language))
            .attr("width", xScale.bandwidth())
            .attr("y", zeroPosition)
            .attr("height", 0)
            .attr("rx", 2)
            .attr("ry", 2)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.8);
                    
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    
                let tooltipText = `<strong>${d.language}</strong><br>`;
                
                if (dataType === "trend") {
                    tooltipText += `${emotionNames[emotionType]} Trend: ${window.vizUtils.formatNumber(d.value)}<br>`; // MODIFICATION: Using shared format utility
                    tooltipText += `Sample Count: ${d.sampleCount}`;
                } else {
                    tooltipText += `${emotionNames[emotionType]}: ${window.vizUtils.formatNumber(d.value)}<br>`; // MODIFICATION: Using shared format utility
                    tooltipText += `Sample Count: ${d.sampleCount}`;
                }
                
                tooltip.html(tooltipText)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1);
                    
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        // Update all bars with transition
        barsEnter.merge(bars)
            .transition()
            .duration(1000)
            .attr("x", d => xScale(d.language))
            .attr("width", xScale.bandwidth())
            .attr("y", d => d.value >= 0 ? yScale(d.value) : zeroPosition)
            .attr("height", d => Math.abs(zeroPosition - yScale(d.value)))
            .attr("fill", d => {
                if (dataType === "trend") {
                    return trendColorScale(d.value);
                } else {
                    return meanColorScales[emotionType](d.value);
                }
            });
    }
    
    // MODIFICATION: Exposed resize handler function so it can be called from main.js
    // Named to follow convention for all modules
    window.handleModuleCResize = function handleModuleCResize() {
        // Get new chart dimensions
        const chartContainer = document.querySelector('.module-c .chart-area');
        width = chartContainer.clientWidth - margin.left - margin.right;
        
        // Update SVG size
        d3.select("#chart-c")
            .attr("width", width + margin.left + margin.right);
        
        // Remove existing chart elements
        chart.selectAll("*").remove();
        
        // Reinitialize chart with new dimensions
        initializeChart();
        
        // Redraw chart
        updateChart();
    };
    
    // MODIFICATION: Removed direct window resize event listener
    // This is now handled centrally in main.js
    // window.addEventListener("resize", () => {
    //     clearTimeout(window.resizeTimerC);
    //     window.resizeTimerC = setTimeout(handleModuleCResize, 250);
    // });

    // MODIFICATION: Expose the update function to be called from main.js
    window.updateModuleC = updateChart;
}

// MODIFICATION: Automatically initialize the module when script is loaded
// This ensures backward compatibility even if main.js doesn't call it
document.addEventListener('DOMContentLoaded', function() {
    if (typeof initModuleC === 'function') {
        // Export the initialization function to global scope
        window.initModuleC = initModuleC;
    }
});