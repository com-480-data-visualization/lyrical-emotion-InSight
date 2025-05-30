/**
 * moduleUmap.js
 * UMAP Clustering Comparison Visualization with performance optimizations
 * 
 * This module creates an interactive visualization comparing UMAP projections
 * colored by KMeans clusters and dominant emotional episodes.
 */

function initModuleUmap() {
    // Clear any existing content
    document.querySelector("#umap-kmeans").innerHTML = "";
    document.querySelector("#umap-episode").innerHTML = "";
    document.querySelector("#legend-kmeans").innerHTML = "";
    document.querySelector("#legend-episode").innerHTML = "";
    
    // Colors and legend configurations
    const clusterColors = [
        "#60C1B6", "#F5B166", "#C87FC5", "#7DB0E6", "#EC6E62", 
        "#8CB79A", "#F0D96B", "#EB99C0", "#7D8CA7", "#B3B4B8"
    ];
    
    const episodeColorDict = {
        "EDR": "#3182BD", // Using colors consistent with other modules
        "CB": "#E6550D",
        "PEP": "#31A354",
        "FM": "#EC6E62",
        "AIA": "#C87FC5",
        "Unclassified": "#756BB1"
    };
    
    // Episode display names for more descriptive legends
    const episodeDisplayNames = {
        "EDR": "Enjoyment–Distraction–Relaxation",
        "CB": "Connection–Belonging",
        "PEP": "Personal Emotional Processing",
        "FM": "Focus–Motivation",
        "AIA": "Aesthetic–Interest–Awe",
        "Unclassified": "Unclassified"
    };
    
    // Use the shared tooltip from common.js if available
    const tooltip = window.vizUtils ? window.vizUtils.tooltip : d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    // --- Shared visualization parameters ---
    const margin = {top: 40, right: 30, bottom: 50, left: 50};
    const width = 520 - margin.left - margin.right;
    const height = 480 - margin.top - margin.bottom;
    
    // --- Set to false initially for reliability, can be enabled later ---
    const useCanvas = false;
    const pointRadius = 5;
    const highlightRadius = 8;
    const defaultOpacity = 0.75;
    
    // Animation parameters - reduced for performance
    const pointTransitionDuration = 500;
    
    // --- Helper functions ---
    
    /**
     * Samples data points to reduce rendering load
     * @param {Array} data - Original data array
     * @param {number} maxPoints - Maximum number of points to include
     * @returns {Array} - Sampled data array
     */
    function sampleData(data, maxPoints) {
        if (data.length <= maxPoints) return data;
        
        // Determine sampling interval
        const interval = Math.ceil(data.length / maxPoints);
        
        // Take evenly spaced samples
        return data.filter((_, i) => i % interval === 0);
    }
    
    /**
     * Creates a UMAP visualization using either Canvas (for performance) or SVG
     */
    function createUmapVisualization(containerId, legendId, data, colorAccessor, categories, colorMap, displayNames = null) {
        // --- OPTIMIZATION: Sample data if there are too many points ---
        const MAX_POINTS = 800; // Adjust based on performance testing
        let sampledData = data;
        let originalDataSize = data.length;
        
        if (data.length > MAX_POINTS) {
            console.log(`Sampling UMAP data from ${data.length} to ~${MAX_POINTS} points for performance`);
            sampledData = sampleData(data, MAX_POINTS);
            
            // Add a note to the visualization
            const noteElement = document.getElementById(`note-${containerId}`);
            if (noteElement) {
                noteElement.textContent = `Note: Visualization shows a sample of ${sampledData.length} points from ${originalDataSize} total points`;
            }
        }
        
        // Create scales
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.umap_x))
            .range([0, width])
            .nice();
            
        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.umap_y))
            .range([height, 0])
            .nice();
        
        // --- Try Canvas first, fall back to SVG if needed ---
        try {
            if (useCanvas && window.CanvasRenderingContext2D) {
                createCanvasVisualization(
                    containerId, 
                    sampledData, 
                    x, y, 
                    colorAccessor, 
                    width, height, 
                    margin
                );
            } else {
                // Use SVG rendering
                createSvgVisualization(
                    containerId, 
                    sampledData, 
                    x, y, 
                    colorAccessor, 
                    width, height, 
                    margin
                );
            }
        } catch (e) {
            console.warn("Visualization error, falling back to SVG", e);
            // Clear container and try SVG as fallback
            document.getElementById(containerId).innerHTML = "";
            
            createSvgVisualization(
                containerId, 
                sampledData, 
                x, y, 
                colorAccessor, 
                width, height, 
                margin
            );
        }
        
        // Create legend (always SVG-based)
        createLegend(legendId, categories, colorMap, displayNames, containerId);
    }
    
    /**
     * Creates a Canvas-based visualization (much better performance for large datasets)
     */
    function createCanvasVisualization(containerId, data, x, y, colorAccessor, width, height, margin) {
        // Get the container and clear it
        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
            throw new Error(`Container #${containerId} not found`);
        }
        
        containerElement.innerHTML = "";
        
        // Create a div to hold both canvas and SVG
        const visContainer = document.createElement("div");
        visContainer.style.position = "relative";
        visContainer.style.width = `${width + margin.left + margin.right}px`;
        visContainer.style.height = `${height + margin.top + margin.bottom}px`;
        containerElement.appendChild(visContainer);
        
        // Create canvas element manually
        const canvasElement = document.createElement("canvas");
        canvasElement.width = width + margin.left + margin.right;
        canvasElement.height = height + margin.top + margin.bottom;
        canvasElement.style.position = "absolute";
        canvasElement.style.top = "0";
        canvasElement.style.left = "0";
        canvasElement.style.borderRadius = "8px";
        visContainer.appendChild(canvasElement);
        
        // Get the 2D context
        const context = canvasElement.getContext("2d");
        if (!context) {
            throw new Error("Could not get 2D context from canvas");
        }
        
        context.translate(margin.left, margin.top);
        
        // Create SVG overlay for axes and interactive elements
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("width", width + margin.left + margin.right);
        svgElement.setAttribute("height", height + margin.top + margin.bottom);
        svgElement.style.position = "absolute";
        svgElement.style.top = "0";
        svgElement.style.left = "0";
        svgElement.style.pointerEvents = "none"; // Let events pass through to canvas
        visContainer.appendChild(svgElement);
        
        // Use D3 to work with the SVG element
        const svg = d3.select(svgElement);
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Add gridlines and axes to SVG
        addGridsAndAxes(g, x, y, width, height);
        
        // Draw points on canvas
        drawPointsOnCanvas(context, data, x, y, colorAccessor);
        
        // Setup canvas interaction
        setupCanvasInteraction(
            d3.select(visContainer), canvasElement, context, data, x, y, 
            colorAccessor, width, height, margin
        );
    }
    
    /**
     * Creates an SVG-based visualization (better for smaller datasets)
     */
    function createSvgVisualization(containerId, data, x, y, colorAccessor, width, height, margin) {
        // Select the SVG and create a group with margins
        const container = d3.select(`#${containerId}`);
        container.html("");
        
        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
            
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Add a subtle gradient background
        g.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "url(#umap-gradient)")
            .attr("rx", 8)
            .attr("ry", 8)
            .attr("opacity", 0.15);
        
        // Add gridlines and axes
        addGridsAndAxes(g, x, y, width, height);
        
        // Add points with staggered animation
        const points = g.selectAll(".point")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("cx", d => x(d.umap_x))
            .attr("cy", d => y(d.umap_y))
            .attr("r", 0) // Start with radius 0 for animation
            .attr("fill", d => colorAccessor(d))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("opacity", defaultOpacity);
            
        // Add interactivity
        points.on("mouseover", function(event, d) {
            handlePointHover(this, d, tooltip, event);
        })
        .on("mouseout", function() {
            handlePointUnhover(this, tooltip);
        });
        
        // Animate points entrance - simple animation for performance
        points.transition()
            .duration(pointTransitionDuration)
            .attr("r", pointRadius);
    }
    
    /**
     * Draws points directly on canvas for better performance
     */
    function drawPointsOnCanvas(context, data, x, y, colorAccessor) {
        context.clearRect(-margin.left, -margin.top, 
            width + margin.left + margin.right, 
            height + margin.top + margin.bottom);
        
        // Draw each point
        data.forEach(d => {
            const cx = x(d.umap_x);
            const cy = y(d.umap_y);
            
            context.beginPath();
            context.arc(cx, cy, pointRadius, 0, 2 * Math.PI);
            context.fillStyle = colorAccessor(d);
            context.globalAlpha = defaultOpacity;
            context.fill();
            
            // Add white stroke
            context.strokeStyle = "#fff";
            context.lineWidth = 1;
            context.stroke();
        });
    }
    
    /**
     * Sets up interactions for canvas-based visualization using quadtree for efficiency
     */
    function setupCanvasInteraction(container, canvas, context, data, x, y, colorAccessor, width, height, margin) {
        // Use quadtree for efficient point finding
        const quadtree = d3.quadtree()
            .x(d => x(d.umap_x))
            .y(d => y(d.umap_y))
            .addAll(data);
            
        // Invisible overlay for mouse events
        const overlay = container.append("div")
            .style("position", "absolute")
            .style("width", `${width + margin.left + margin.right}px`)
            .style("height", `${height + margin.top + margin.bottom}px`)
            .style("top", "0")
            .style("left", "0")
            .style("cursor", "pointer");
            
        // Variables to track hover state
        let hoveredPoint = null;
        
        // Mouse move handler
        overlay.on("mousemove", function(event) {
            const rect = this.getBoundingClientRect();
            const mx = event.clientX - rect.left - margin.left;
            const my = event.clientY - rect.top - margin.top;
            
            // Find closest point within a radius
            const radius = 10;
            const closest = quadtree.find(mx, my, radius);
            
            // If point found and different from current hovered point
            if (closest && closest !== hoveredPoint) {
                // Clear previous state
                if (hoveredPoint) {
                    redrawCanvas();
                    tooltip.style("opacity", 0);
                }
                
                // Set new hovered point
                hoveredPoint = closest;
                
                // Draw highlight
                context.beginPath();
                context.arc(x(closest.umap_x), y(closest.umap_y), highlightRadius, 0, 2 * Math.PI);
                context.fillStyle = colorAccessor(closest);
                context.globalAlpha = 1;
                context.fill();
                context.strokeStyle = "#fff";
                context.lineWidth = 2;
                context.stroke();
                
                // Show tooltip
                showTooltip(closest, event, tooltip);
            } 
            // If no point found or moved away from points
            else if (!closest && hoveredPoint) {
                hoveredPoint = null;
                redrawCanvas();
                tooltip.style("opacity", 0);
            }
        });
        
        // Mouse leave handler
        overlay.on("mouseleave", function() {
            hoveredPoint = null;
            redrawCanvas();
            tooltip.style("opacity", 0);
        });
        
        // Function to redraw the canvas
        function redrawCanvas() {
            drawPointsOnCanvas(context, data, x, y, colorAccessor);
        }
    }
    
    /**
     * Adds grids and axes to the visualization
     */
    function addGridsAndAxes(g, x, y, width, height) {
        // Reduced number of gridlines for better performance
        const xGrid = d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat("")
            .ticks(6);
            
        const yGrid = d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
            .ticks(6);
            
        g.append("g")
            .attr("class", "grid x-grid")
            .attr("transform", `translate(0,${height})`)
            .call(xGrid);
            
        g.append("g")
            .attr("class", "grid y-grid")
            .call(yGrid);
        
        // Add axes
        g.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(6));
            
        g.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(y).ticks(6));
        
        // Add axis labels
        g.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 40)
            
        g.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -40)
    }
    
    /**
     * Creates a legend for the visualization
     */
    function createLegend(legendId, categories, colorMap, displayNames, containerId) {
        const legend = d3.select(`#${legendId}`);
        legend.html(""); // Clear existing legend
        
        // Create legend items with enhanced styling
        const legendItems = legend.selectAll(".legend-item")
            .data(categories)
            .enter()
            .append("div")
            .attr("class", "legend-item")
            .style("display", "inline-flex")
            .style("align-items", "center")
            .style("margin", "0 10px")
            .style("cursor", "pointer")
            .on("mouseover", function(event, category) {
                // Highlight this legend item
                d3.select(this).style("font-weight", "700");
                
                // If using canvas, we need to redraw with highlighted points
                if (useCanvas) {
                    highlightCategoryOnCanvas(containerId, category);
                } else {
                    // For SVG, use D3 selections
                    const points = d3.select(`#${containerId}`).selectAll(".point");
                    
                    // Highlight related points
                    points.filter(d => {
                        if (d.kmeans_cluster) return d.kmeans_cluster === category;
                        if (d.dominant_episode) return d.dominant_episode === category;
                        return false;
                    })
                    .transition()
                    .duration(200)
                    .attr("r", highlightRadius)
                    .attr("opacity", 1)
                    .attr("stroke-width", 2);
                    
                    // Dim other points
                    points.filter(d => {
                        if (d.kmeans_cluster) return d.kmeans_cluster !== category;
                        if (d.dominant_episode) return d.dominant_episode !== category;
                        return true;
                    })
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.2);
                }
            })
            .on("mouseout", function() {
                // Restore legend item
                d3.select(this).style("font-weight", "600");
                
                // Restore visualization
                if (useCanvas) {
                    resetCanvasHighlight(containerId);
                } else {
                    // For SVG, use D3 transitions
                    d3.select(`#${containerId}`).selectAll(".point")
                        .transition()
                        .duration(200)
                        .attr("r", pointRadius)
                        .attr("opacity", defaultOpacity)
                        .attr("stroke-width", 1);
                }
            });
        
        // Add colored circle for legend
        legendItems.append("span")
            .attr("class", "legend-color")
            .style("display", "inline-block")
            .style("width", "20px")
            .style("height", "20px")
            .style("border-radius", "50%")
            .style("margin-right", "8px")
            .style("background", category => colorMap[category] || "#B3B4B8")
            .style("border", "2px solid rgba(255,255,255,0.8)")
            .style("box-shadow", "0 0 4px rgba(0,0,0,0.1)");
        
        // Add text label for legend
        legendItems.append("span")
            .text(category => {
                if (displayNames && displayNames[category]) {
                    return displayNames[category];
                }
                return category;
            });
    }
    
    /**
     * Highlights points of a specific category on canvas
     * Note: This is a placeholder, actual implementation depends on tracking canvas contexts
     */
    function highlightCategoryOnCanvas(containerId, category) {
        console.log(`Highlight category ${category} on ${containerId}`);
        // In actual implementation, we would:
        // 1. Retrieve the canvas context and data
        // 2. Redraw all points with low opacity
        // 3. Redraw points in the selected category with high opacity
    }
    
    /**
     * Resets highlighting on canvas
     * Note: This is a placeholder, actual implementation depends on tracking canvas contexts
     */
    function resetCanvasHighlight(containerId) {
        console.log(`Reset highlights on ${containerId}`);
        // Would redraw all points with normal opacity
    }
    
    /**
     * Handles hover interaction for a point
     */
    function handlePointHover(element, d, tooltip, event) {
        // Highlight the point
        d3.select(element)
            .transition()
            .duration(200)
            .attr("r", highlightRadius)
            .attr("stroke-width", 2)
            .attr("opacity", 1);
        
        showTooltip(d, event, tooltip);
    }
    
    /**
     * Handles mouseout for a point
     */
    function handlePointUnhover(element, tooltip) {
        // Restore point appearance
        d3.select(element)
            .transition()
            .duration(200)
            .attr("r", pointRadius)
            .attr("stroke-width", 1)
            .attr("opacity", defaultOpacity);
        
        // Hide tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }
    
    /**
     * Shows tooltip with point information
     */
    function showTooltip(d, event, tooltip) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        
        // Format tooltip content based on data type
        let tooltipContent = "";
        if (d.kmeans_cluster) {
            tooltipContent = `
                <div class="tooltip-title">Cluster ${d.kmeans_cluster}</div>
                <div class="tooltip-value">Position: (${d.umap_x.toFixed(2)}, ${d.umap_y.toFixed(2)})</div>
            `;
        } else if (d.dominant_episode) {
            const episodeName = episodeDisplayNames[d.dominant_episode] || d.dominant_episode;
            tooltipContent = `
                <div class="tooltip-title">${episodeName}</div>
                <div class="tooltip-value">Position: (${d.umap_x.toFixed(2)}, ${d.umap_y.toFixed(2)})</div>
            `;
        }
        
        tooltip.html(tooltipContent)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }
    
    // --- Create gradient definitions ---
    const svgElement = document.querySelector("svg");
    if (svgElement) {
        const defs = d3.select(svgElement).append("defs");
        
        // Add subtle gradient background
        const gradient = defs.append("linearGradient")
            .attr("id", "umap-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%");
            
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#f8f9fa");
            
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#e9ecef");
    }
    
    // --- Load and process KMeans clustering data ---
    d3.csv("data/umap_kmeans.csv").then(function(data) {
        console.time("KMeans UMAP Processing");
        
        // Process data
        data.forEach(d => {
            d.umap_x = +d.umap_x;
            d.umap_y = +d.umap_y;
        });
        
        // Extract unique clusters and sort them
        const clusters = Array.from(new Set(data.map(d => d.kmeans_cluster)))
            .sort((a, b) => +a - +b);
        
        // Create color accessor function
        const colorAccessor = d => clusterColors[clusters.indexOf(d.kmeans_cluster) % clusterColors.length];
        
        // Create a map for cluster colors
        const clusterColorMap = {};
        clusters.forEach((cluster, i) => {
            clusterColorMap[cluster] = clusterColors[i % clusterColors.length];
        });
        
        // Create the visualization
        createUmapVisualization(
            "umap-kmeans", 
            "legend-kmeans", 
            data, 
            colorAccessor, 
            clusters, 
            clusterColorMap,
            null // No display name mapping for clusters
        );
        
        console.timeEnd("KMeans UMAP Processing");
    }).catch(error => {
        console.error("Error loading KMeans UMAP data:", error);
        if (window.vizUtils && window.vizUtils.handleDataError) {
            window.vizUtils.handleDataError('umap-kmeans', error);
        } else {
            const element = document.querySelector("#umap-kmeans");
            if (element) {
                element.innerHTML = `
                    <div style="display:flex;justify-content:center;align-items:center;height:480px;color:#666;">
                        <div>Error loading data: ${error.message}</div>
                    </div>
                `;
            }
        }
    });
    
    // --- Load and process Episode clustering data ---
    d3.csv("data/umap_dominant_episode.csv").then(function(data) {
        console.time("Episode UMAP Processing");
        
        // Process data
        data.forEach(d => {
            d.umap_x = +d.umap_x;
            d.umap_y = +d.umap_y;
        });
        
        // Extract unique episodes and sort them in a meaningful order
        const episodes = Array.from(new Set(data.map(d => d.dominant_episode)))
            .sort((a, b) => {
                const order = ["EDR", "CB", "PEP", "FM", "AIA", "Unclassified"];
                return order.indexOf(a) - order.indexOf(b);
            });
        
        // Create color accessor function
        const colorAccessor = d => episodeColorDict[d.dominant_episode] || "#B3B4B8";
        
        // Create the visualization
        createUmapVisualization(
            "umap-episode", 
            "legend-episode", 
            data, 
            colorAccessor, 
            episodes, 
            episodeColorDict,
            episodeDisplayNames
        );
        
        console.timeEnd("Episode UMAP Processing");
    }).catch(error => {
        console.error("Error loading Episode UMAP data:", error);
        if (window.vizUtils && window.vizUtils.handleDataError) {
            window.vizUtils.handleDataError('umap-episode', error);
        } else {
            const element = document.querySelector("#umap-episode");
            if (element) {
                element.innerHTML = `
                    <div style="display:flex;justify-content:center;align-items:center;height:480px;color:#666;">
                        <div>Error loading data: ${error.message}</div>
                    </div>
                `;
            }
        }
    });
}

// --- Add resize handler for this module ---
function handleModuleUmapResize() {
    // Debounce resize handler
    clearTimeout(window._umapResizeTimer);
    window._umapResizeTimer = setTimeout(() => {
        initModuleUmap();
    }, 300);
}

// Make the functions available globally
window.initModuleUmap = initModuleUmap;
window.handleModuleUmapResize = handleModuleUmapResize;