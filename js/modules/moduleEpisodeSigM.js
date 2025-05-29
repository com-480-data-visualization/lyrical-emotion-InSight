/**
 * moduleEpisodeSigM.js
 * Episode Signature Comparison Module
 * 
 * This module creates a grouped bar chart comparing different feature signatures
 * across emotional episodes in lyrics.
 */

function initModuleEpisodeSigM() {
    // Clear any existing chart
    document.querySelector("#episode-signature-chartM").innerHTML = "";
    
    // Config with enhanced spacing for better aesthetics
    const margin = { top: 45, right: 180, bottom: 80, left: 70 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Enhanced color palette with better contrast and harmony with other modules
    const featureDefs = [
        { key: "type_token_ratio", name: "Type-Token Ratio", color: "#4e79a7" },
        { key: "metaphor_density", name: "Metaphor Density", color: "#f28e2c" },
        { key: "first_person_pronouns", name: "First Person Pronouns", color: "#59a14f" },
        { key: "negation_count", name: "Negation Count", color: "#e15759" },
        { key: "question_count", name: "Question Count", color: "#af7aa1" },
        { key: "exclamation_count", name: "Exclamation Count", color: "#9c755f" }
    ];

    // Prepare SVG with responsive attributes
    const svg = d3.select("#episode-signature-chartM")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    // Add title and subtitle using SVG instead of HTML for better integration
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", margin.left)
        .attr("y", 18)
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Episode Signature Comparison");
        
    svg.append("text")
        .attr("class", "chart-subtitle")
        .attr("x", margin.left)
        .attr("y", 38)
        .attr("font-size", "14px")
        .attr("fill", "#52607A")
        .text("Feature group comparison across emotional episodes in lyrics");

    // Add loading indicator
    const loadingText = g.append("text")
        .attr("class", "loading-text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("Loading data...");

    // Use the dataPath utility if available
    const dataPath = window.vizUtils && window.vizUtils.dataPath ? 
        window.vizUtils.dataPath.getPath('', 'episode_signature_features.csv') : 
        'episode_signature_features.csv';

    // Get tooltip from common utilities or create one
    const tooltip = window.vizUtils ? window.vizUtils.tooltip : d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Read data
    d3.csv(dataPath).then(data => {
        // Remove loading indicator
        loadingText.remove();
        
        // Parse numbers
        data.forEach(d => featureDefs.forEach(f => d[f.key] = +d[f.key]));
        const episodes = data.map(d => d.episode);

        // X scales with improved padding
        const x0 = d3.scaleBand()
            .domain(episodes)
            .range([0, width])
            .padding(0.22);

        const x1 = d3.scaleBand()
            .domain(featureDefs.map(f => f.key))
            .range([0, x0.bandwidth()])
            .padding(0.15);

        // Y scale (auto max) with slightly more headroom
        const yMax = d3.max(data, d => d3.max(featureDefs, f => d[f.key])) * 1.15;
        const y = d3.scaleLinear()
            .domain([0, yMax])
            .nice()
            .range([height, 0]);

        // Add grid lines for better readability
        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat("")
            )
            .selectAll("line")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-dasharray", "3,3");

        // X axis with styled labels
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0))
            .selectAll("text")
            .attr("font-size", "13px")
            .attr("font-weight", "600")
            .attr("transform", "rotate(-30)")
            .attr("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em");

        // Y axis with improved styling
        g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(8))
            .selectAll("text")
            .attr("font-size", "12px");

        // Y label with better positioning
        g.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "600")
            .text("Average Feature Value");

        // X label with better positioning
        g.append("text")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("font-weight", "600")
            .text("Episode Category");

        // Enhanced bars with animations and interactions
        g.selectAll("g.episode-group")
            .data(data)
            .join("g")
            .attr("class", "episode-group")
            .attr("transform", d => `translate(${x0(d.episode)},0)`)
            .selectAll("rect")
            .data(d => featureDefs.map(f => ({ 
                key: f.key, 
                name: f.name,
                value: d[f.key], 
                color: f.color,
                episode: d.episode 
            })))
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x1(d.key))
            .attr("y", height) // Start from bottom for animation
            .attr("width", x1.bandwidth())
            .attr("height", 0) // Start with height 0 for animation
            .attr("fill", d => d.color)
            .attr("rx", 2) // Rounded corners
            .attr("ry", 2)
            .attr("stroke", d => d3.color(d.color).darker(0.3)) // Add subtle border
            .attr("stroke-width", 0.5)
            // Add animations for initial render
            .transition()
            .duration(800)
            .delay((d, i) => i * 20)
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value));

        // Add interactions after animation completes
        setTimeout(() => {
            g.selectAll("rect.bar")
                .on("mouseover", function(event, d) {
                    // Highlight bar
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 0.8)
                        .attr("stroke-width", 2);
                    
                    // Show tooltip
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                        
                    tooltip.html(`
                        <div style="font-weight:bold;margin-bottom:4px;">${d.episode}</div>
                        <div>${d.name}: <b>${d.value.toFixed(3)}</b></div>
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    // Restore bar
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 1)
                        .attr("stroke-width", 0.5);
                        
                    // Hide tooltip
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }, 850);

        // Enhanced legend with interactions
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + margin.left + 20}, ${margin.top + 20})`);
            
        // Add legend title
        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text("Features");

        const legendItems = legend.selectAll(".legend-item")
            .data(featureDefs)
            .join("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 28})`)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                // Highlight this feature's bars
                g.selectAll("rect.bar")
                    .transition()
                    .duration(200)
                    .attr("opacity", item => item.key === d.key ? 1 : 0.3);
                
                // Highlight legend item
                d3.select(this).select("text")
                    .transition()
                    .duration(200)
                    .attr("font-weight", "bold");
            })
            .on("mouseout", function() {
                // Restore all bars
                g.selectAll("rect.bar")
                    .transition()
                    .duration(200)
                    .attr("opacity", 1);
                
                // Restore legend text
                d3.select(this).select("text")
                    .transition()
                    .duration(200)
                    .attr("font-weight", "normal");
            });

        // Add colored rectangles
        legendItems.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("rx", 4)
            .attr("fill", d => d.color)
            .attr("stroke", d => d3.color(d.color).darker(0.3))
            .attr("stroke-width", 1);

        // Add text labels
        legendItems.append("text")
            .attr("x", 28)
            .attr("y", 13)
            .attr("fill", "#283449")
            .attr("font-size", "13px")
            .text(d => d.name);

    }).catch(error => {
        console.error("Error loading episode signature data:", error);
        // Use error handler from utilities if available
        if (window.vizUtils && window.vizUtils.handleDataError) {
            window.vizUtils.handleDataError('episodeSigM', error);
        } else {
            // Fallback error display
            loadingText.text("Error loading data. Please check console for details.");
        }
    });
}

/**
 * Handles window resize event for Episode Signature Module
 */
function handleModuleEpisodeSigMResize() {
    // Simply reinitialize the module to recalculate dimensions
    initModuleEpisodeSigM();
}

// Export the module initialization function
window.initModuleEpisodeSigM = initModuleEpisodeSigM;