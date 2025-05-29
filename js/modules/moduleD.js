/**
 * moduleD.js - KMeans Cluster to Episode - Sankey Diagram
 * 
 * Visualization showing the mapping between structural patterns and emotional episodes
 * using a Sankey diagram.
 */

// MODIFIED: Changed from self-executing function to named function for module pattern
function initModuleD() {
    console.log("Initializing Module D: KMeans Cluster to Episode - Sankey Diagram");
    
    // UNCHANGED: Data structure from original code
    // Data
    const data = {
        "nodes": [
            { "name": "Cluster 0" }, { "name": "Cluster 1" },
            { "name": "Cluster 2" }, { "name": "Cluster 3" },
            { "name": "Cluster 4" }, { "name": "Cluster 5" },
            { "name": "Cluster 6" }, { "name": "Cluster 7" },
            { "name": "Cluster 8" }, { "name": "Cluster 9" },
            { "name": "EDR" }, { "name": "CB" },
            { "name": "PEP" }, { "name": "Unclassified" }
        ],
        "links": [
            { "source": 0, "target": 10, "value": 0.1819 },
            { "source": 1, "target": 11, "value": 0.1434 },
            { "source": 1, "target": 10, "value": 0.0137 },
            { "source": 2, "target": 10, "value": 0.1496 },
            { "source": 3, "target": 12, "value": 0.0135 },
            { "source": 4, "target": 11, "value": 0.0411 },
            { "source": 5, "target": 10, "value": 0.0681 },
            { "source": 5, "target": 13, "value": 0.0232 },
            { "source": 6, "target": 11, "value": 0.0362 },
            { "source": 7, "target": 10, "value": 0.0244 },
            { "source": 8, "target": 11, "value": 0.1229 },
            { "source": 8, "target": 10, "value": 0.0196 },
            { "source": 8, "target": 13, "value": 0.0212 },
            { "source": 9, "target": 11, "value": 0.0293 },
            { "source": 9, "target": 10, "value": 0.0686 }
        ]
    };

    // UNCHANGED: Enhanced color palette
    const leftNodeColors = [
        "#5D69B1", "#52BCA3", "#99C945", "#CC61B0", 
        "#24796C", "#DAA51B", "#2F8AC4", "#764E9F", 
        "#ED645A", "#CC3A8E"
    ];
    
    const rightNodeColors = {
        "EDR": "#3182BD",
        "CB": "#E6550D", 
        "PEP": "#31A354",
        "Unclassified": "#756BB1"
    };

    // MODIFIED: Using utility function from common.js for number formatting
    // Replaced with reference to window.vizUtils if available
    const formatNumber = window.vizUtils ? window.vizUtils.formatNumber : d3.format(",.4f");
    const formatPercent = window.vizUtils ? window.vizUtils.formatPercent : d3.format(".1%");

    // UNCHANGED: Get SVG dimensions
    const svg = d3.select("#sankey");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // UNCHANGED: Create sankey generator
    const sankey = d3.sankey()
        .nodeWidth(25)
        .nodePadding(15)
        .extent([[margin.left, margin.top], [innerWidth, innerHeight]]);

    // UNCHANGED: Compute the sankey layout
    const { nodes, links } = sankey(data);

    // UNCHANGED: Create the sankey diagram container
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // MODIFIED: Using the module-specific tooltip instead of shared tooltip
    // Create tooltip
    const tooltip = d3.select("#tooltip-d");

    // UNCHANGED: Generate gradient IDs for each link
    links.forEach((link, i) => {
        link.id = `link-${i}`;
        // Calculate the percentage of the total for each link
        link.percent = link.value / d3.sum(links, d => d.value);
    });

    // UNCHANGED: Add the gradients definitions
    const defs = svg.append("defs");
    
    links.forEach(link => {
        const gradient = defs.append("linearGradient")
            .attr("id", link.id)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", link.source.x1)
            .attr("x2", link.target.x0);
            
        const sourceColor = link.source.index < 10 ? 
            leftNodeColors[link.source.index] : 
            rightNodeColors[link.source.name];
            
        const targetColor = link.target.index >= 10 ? 
            rightNodeColors[link.target.name] : 
            leftNodeColors[link.target.index];
        
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", sourceColor);
            
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", targetColor);
    });

    // UNCHANGED: Add links
    chart.append("g")
        .selectAll(".link")
        .data(links)
        .join("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => `url(#${d.id})`)
        .attr("stroke-width", d => Math.max(1, d.width))
        .style("stroke-opacity", 0.4)
        .on("mouseover", function(event, d) {
            // Highlight the path
            d3.select(this)
                .style("stroke-opacity", 0.8)
                .style("cursor", "pointer");
                
            // Show tooltip
            tooltip
                .style("opacity", 1)
                .html(`
                    <div class="tooltip-title">${d.source.name} → ${d.target.name}</div>
                    <div class="tooltip-value">Value: ${formatNumber(d.value)}</div>
                    <div class="tooltip-value">Percentage: ${formatPercent(d.percent)}</div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("stroke-opacity", 0.4);
            tooltip.style("opacity", 0);
        });

    // UNCHANGED: Add nodes
    const node = chart.append("g")
        .selectAll(".node")
        .data(nodes)
        .join("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // UNCHANGED: Add rectangle for nodes
    node.append("rect")
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => {
            if (d.index < 10) {
                return leftNodeColors[d.index];
            } else {
                return rightNodeColors[d.name];
            }
        })
        .on("mouseover", function(event, d) {
            // Get all connected links
            const linkedByIndex = {};
            links.forEach(link => {
                linkedByIndex[`${link.source.index},${link.target.index}`] = true;
            });
            
            // Highlight the current node
            d3.select(this)
                .style("stroke", "#000")
                .style("stroke-width", "2px");
                
            // Highlight connected links
            chart.selectAll(".link")
                .style("stroke-opacity", link => {
                    return link.source.index === d.index || link.target.index === d.index ? 0.8 : 0.1;
                })
                .style("stroke-width", link => {
                    return link.source.index === d.index || link.target.index === d.index ? 
                        Math.max(3, link.width) : Math.max(1, link.width);
                });
                
            // Calculate total incoming and outgoing values
            const incoming = links.filter(l => l.target.index === d.index)
                .reduce((sum, l) => sum + l.value, 0);
                
            const outgoing = links.filter(l => l.source.index === d.index)
                .reduce((sum, l) => sum + l.value, 0);
            
            // Show tooltip with node details
            tooltip
                .style("opacity", 1)
                .html(`
                    <div class="tooltip-title">${d.name}</div>
                    <div class="tooltip-value">Incoming: ${formatNumber(incoming)}</div>
                    <div class="tooltip-value">Outgoing: ${formatNumber(outgoing)}</div>
                    <div class="tooltip-value">Total: ${formatNumber(d.value)}</div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Reset highlights
            d3.select(this)
                .style("stroke", "#fff")
                .style("stroke-width", "1px");
                
            chart.selectAll(".link")
                .style("stroke-opacity", 0.4)
                .style("stroke-width", d => Math.max(1, d.width));
                
            tooltip.style("opacity", 0);
        });

    // UNCHANGED: Add node labels
    node.append("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 - d.x0 + 6 : -6)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name)
        .each(function(d) {
            // Check if this is an "episode" node (right side)
            const isEpisode = d.index >= 10;
            
            // Make episode node labels bold
            if (isEpisode) {
                d3.select(this)
                    .style("font-weight", "bold")
                    .style("font-size", "14px");
            }
        });
        
    // UNCHANGED: Add value labels to node rectangles
    node.filter(d => (d.y1 - d.y0) > 30) // Only add to nodes with enough height
        .append("text")
        .attr("x", d => (d.x1 - d.x0) / 2)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .style("pointer-events", "none")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .text(d => formatNumber(d.value))
        .filter(d => ((d.x1 - d.x0) < 50) || ((d.y1 - d.y0) < 40))
        .remove(); // Remove if too small
}

// ADDED: New function to handle resize for this module
function handleModuleDResize() {
    console.log("Handling resize for Module D");
    // Clear the existing visualization
    d3.select("#sankey").html("");
    
    // Reinitialize the visualization with new dimensions
    initModuleD();
}

// MODIFIED: Export the module functions to make them available to main.js
// This wasn't in the original code
if (typeof window !== 'undefined') {
    window.initModuleD = initModuleD;
    window.handleModuleDResize = handleModuleDResize;
}