/**
 * moduleA.js
 * Historical Trends in Lyrical Tone (1950s-2010s) Visualization
 * Shows how lyrical tone has shifted across decades using line charts
 * 
 * MODIFICATIONS FROM ORIGINAL:
 * 1. Changed self-executing function to named functions that can be called from main.js
 * 2. Added export of functions through the window object
 * 3. Added resize handler function
 * 4. Modified data loading paths to use relative paths
 * 5. Added cleanup code to prevent duplicate elements
 * 6. Refactored event listeners to be managed by main.js
 * 7. Added error handling for better debugging
 */

// Define main functionality as a module
// MODIFIED: Changed from self-executing function to regular function
function initModuleA() {
    cleanupModuleA();
    // Define the dataset with sample data
    const dataset = {
        loveWords: [
            {decade: '1950s', value: 85.0},
            {decade: '1960s', value: 82.0},
            {decade: '1970s', value: 79.0},
            {decade: '1980s', value: 76.0},
            {decade: '1990s', value: 75.0},
            {decade: '2000s', value: 74.5},
            {decade: '2010s', value: 74.0}
        ],
        positiveSentiment: [
            {decade: '1950s', value: 68.0},
            {decade: '1960s', value: 65.0},
            {decade: '1970s', value: 62.0},
            {decade: '1980s', value: 60.0},
            {decade: '1990s', value: 58.0},
            {decade: '2000s', value: 57.0},
            {decade: '2010s', value: 56.0}
        ],
        negativeSentiment: [
            {decade: '1950s', value: 30.0},
            {decade: '1960s', value: 33.0},
            {decade: '1970s', value: 31.0},
            {decade: '1980s', value: 34.0},
            {decade: '1990s', value: 38.0},
            {decade: '2000s', value: 40.0},
            {decade: '2010s', value: 42.0}
        ],
        moneyWords: [
            {decade: '1950s', value: 8.0},
            {decade: '1960s', value: 11.0},
            {decade: '1970s', value: 16.0},
            {decade: '1980s', value: 13.0},
            {decade: '1990s', value: 16.0},
            {decade: '2000s', value: 18.0},
            {decade: '2010s', value: 20.0}
        ],
        swearWords: [
            {decade: '1950s', value: 5.0},
            {decade: '1960s', value: 8.0},
            {decade: '1970s', value: 12.0},
            {decade: '1980s', value: 17.0},
            {decade: '1990s', value: 21.0},
            {decade: '2000s', value: 24.0},
            {decade: '2010s', value: 26.0}
        ],
        sexWords: [
            {decade: '1950s', value: 1.0},
            {decade: '1960s', value: 2.0},
            {decade: '1970s', value: 3.0},
            {decade: '1980s', value: 5.0},
            {decade: '1990s', value: 7.0},
            {decade: '2000s', value: 8.0},
            {decade: '2010s', value: 9.0}
        ],
        neutralPercentage: [
            {decade: '1950s', value: 1.0},
            {decade: '1960s', value: 1.2},
            {decade: '1970s', value: 1.5},
            {decade: '1980s', value: 1.7},
            {decade: '1990s', value: 1.8},
            {decade: '2000s', value: 1.9},
            {decade: '2010s', value: 2.0}
        ]
    };

    // Main visualization function that takes dataset as parameter
    function createVisualization(dataset) {
        // Hide loading indicator
        document.getElementById("loading-a").style.display = "none";
        
        // Clear previous chart if any
        // MODIFIED: Added more thorough cleanup
        d3.select("#chart-a").html("");
        
        // Setup dimensions
        const margin = {top: 30, right: 170, bottom: 50, left: 50};
        const svgWidth = document.getElementById('chart-a').clientWidth;
        const svgHeight = 400;
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;
        
        // Create SVG
        const svg = d3.select("#chart-a")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
            
        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // X scale - decades
        // Extract decade labels from data and format them
        const decadeMap = {
            '1950s': '50s',
            '1960s': '60s',
            '1970s': '70s',
            '1980s': '80s',
            '1990s': '90s',
            '2000s': '00s',
            '2010s': '10s'
        };
        
        // Update data to use shortened decade format
        Object.keys(dataset).forEach(key => {
            dataset[key].forEach(d => {
                d.displayDecade = decadeMap[d.decade] || d.decade;
            });
        });
        
        const decades = dataset.loveWords.map(d => d.displayDecade);
        
        const xScale = d3.scaleBand()
            .domain(decades)
            .range([0, width])
            .padding(0.1);
        
        // Create a continuous x scale for animation
        const xScaleContinuous = d3.scaleLinear()
            .domain([0, decades.length - 1])
            .range([xScale(decades[0]) + xScale.bandwidth()/2, xScale(decades[decades.length-1]) + xScale.bandwidth()/2]);
        
        // Find max value across all datasets to set y scale
        let maxValue = 0;
        Object.keys(dataset).forEach(key => {
            const categoryMax = d3.max(dataset[key], d => d.value);
            maxValue = Math.max(maxValue, categoryMax);
        });
        
        // Add 10% buffer to the max value
        maxValue = Math.ceil(maxValue * 1.1);
        
        // Y scale
        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([height, 0]);
        
        // X axis
        chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickSize(0));

        // Add Decade label
        chartGroup.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .style("font-size", "16px")
        .text("Decade");
        
        // Define categories with colors
        const categories = [
            {name: "love words", data: dataset.loveWords, color: "#FF69B4"},
            {name: "positive sentiment", data: dataset.positiveSentiment, color: "#483D8B"},
            {name: "negative sentiment", data: dataset.negativeSentiment, color: "#2E8B57"},
            {name: "swear words", data: dataset.swearWords, color: "#FFA07A"},
            {name: "money words", data: dataset.moneyWords, color: "#9932CC"},
            {name: "sex words", data: dataset.sexWords, color: "#4169E1"},
            {name: "neutral percentage", data: dataset.neutralPercentage, color: "#FF4500"}
        ];
        
        // Setup line generator with linear interpolation (no smoothing)
        const line = d3.line()
            .x(d => xScale(d.displayDecade) + xScale.bandwidth() / 2)
            .y(d => yScale(d.value))
            .curve(d3.curveLinear); // Use linear curve for straight lines
        
        // Create a line path for each category (initially empty)
        const linePaths = {};
        categories.forEach(category => {
            linePaths[category.name] = chartGroup.append("path")
                .attr("class", "line")
                .attr("stroke", category.color)
                .attr("d", "")
                .attr("stroke-width", 3);
        });
        
        // Function to interpolate values based on progress
        function interpolateValues(data, progress) {
            const maxIdx = data.length - 1;
            const idx = Math.min(maxIdx, Math.max(0, progress * maxIdx));
            const idxLow = Math.floor(idx);
            const idxHigh = Math.ceil(idx);
            
            if (idxLow === idxHigh) return data[idxLow].value;
            
            const t = idx - idxLow;
            return data[idxLow].value * (1 - t) + data[idxHigh].value * t;
        }
        
        // Create dots for each category that will move along the lines
        const dots = chartGroup.selectAll(".dot-group")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "dot-group");
            
        dots.append("circle")
            .attr("class", "dot")
            .attr("r", 8)
            .attr("fill", d => d.color)
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("cx", xScaleContinuous(0)) // Start at first decade
            .attr("cy", d => yScale(d.data[0].value));
            
        // Add labels
        const labels = chartGroup.selectAll(".label-group")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "label-group");
            
        labels.append("text")
            .attr("class", "line-label")
            .attr("x", xScaleContinuous(0) + 15)
            .attr("dy", ".35em")
            .attr("fill", d => d.color)
            .text(d => `- ${d.name} - ${Math.round(d.data[0].value)}%`);
        
        // Animation function
        function animateChart() {
            const duration = 5000; // 5 seconds for full animation
            const startTime = Date.now();
            
            function update() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(1, elapsed / duration);
                
                // Calculate current decade index for line drawing
                const maxIdx = decades.length - 1;
                const decadeIdx = Math.min(maxIdx, progress * maxIdx);
                const currentDecade = Math.floor(decadeIdx);
                
                // Update each category
                categories.forEach(category => {
                    // Get visible data up to current progress
                    const pointsToDraw = [];
                    for (let i = 0; i <= currentDecade; i++) {
                        pointsToDraw.push(category.data[i]);
                    }
                    
                    // If we're between decades, add interpolated point
                    if (currentDecade < maxIdx && decadeIdx > currentDecade) {
                        const fraction = decadeIdx - currentDecade;
                        const startValue = category.data[currentDecade].value;
                        const endValue = category.data[currentDecade + 1].value;
                        const interpolatedValue = startValue * (1 - fraction) + endValue * fraction;
                        
                        const interpolatedX = xScaleContinuous(decadeIdx);
                        
                        // Add final interpolated point
                        pointsToDraw.push({
                            displayDecade: null, // Not used in line drawing
                            x: interpolatedX,
                            value: interpolatedValue
                        });
                    }
                    
                    // Draw the line up to the current position
                    const customLine = d3.line()
                        .x((d, i) => {
                            if (i === pointsToDraw.length - 1 && d.x !== undefined) {
                                return d.x;
                            }
                            return xScale(d.displayDecade) + xScale.bandwidth() / 2;
                        })
                        .y(d => yScale(d.value))
                        .curve(d3.curveLinear);
                        
                    linePaths[category.name]
                        .datum(pointsToDraw)
                        .attr("d", customLine);
                });
                
                // Update dots positions
                dots.select("circle")
                    .attr("cx", xScaleContinuous(decadeIdx))
                    .attr("cy", d => {
                        const value = interpolateValues(d.data, progress);
                        return yScale(value);
                    });
                
                // Update labels
                labels.select("text")
                    .attr("x", xScaleContinuous(decadeIdx) + 15)
                    .attr("y", d => {
                        const value = interpolateValues(d.data, progress);
                        return yScale(value);
                    })
                    .text(d => {
                        const value = interpolateValues(d.data, progress);
                        return `- ${d.name} - ${Math.round(value)}%`;
                    });
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            
            update();
        }
        
        // Add music notes to the header
        const musicNotesGroup = d3.select(".music-notes");
        musicNotesGroup.html("");
        
        const notes = [
            {x: 20, y: 30, type: "treble"},
            {x: 45, y: 15, type: "quarter"},
            {x: 60, y: 25, type: "eighth"},
            {x: 75, y: 10, type: "quarter"},
            {x: 90, y: 20, type: "eighth"}
        ];
        
        // Add music notes
        notes.forEach(note => {
            if (note.type === "treble") {
                musicNotesGroup.append("text")
                    .attr("x", note.x)
                    .attr("y", note.y)
                    .attr("font-size", "28px")
                    .text("𝄞")
                    .attr("fill", "#333");
            } else if (note.type === "quarter") {
                musicNotesGroup.append("text")
                    .attr("x", note.x)
                    .attr("y", note.y)
                    .attr("font-size", "20px")
                    .text("♩")
                    .attr("fill", "#333");
            } else if (note.type === "eighth") {
                musicNotesGroup.append("text")
                    .attr("x", note.x)
                    .attr("y", note.y)
                    .attr("font-size", "20px")
                    .text("♪")
                    .attr("fill", "#333");
            }
        });
        
        // Add curved line for music staff
        const staffLine = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveBasis);
            
        const staffPoints = [
            {x: 10, y: 40},
            {x: 30, y: 35},
            {x: 50, y: 38},
            {x: 70, y: 30},
            {x: 90, y: 35},
            {x: 110, y: 32}
        ];
        
        musicNotesGroup.append("path")
            .datum(staffPoints)
            .attr("d", staffLine)
            .attr("fill", "none")
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);
            
        // Start animation
        setTimeout(animateChart, 300);
    }
    
    // Load and process the CSV data
    // MODIFIED: Changed file path and added better error handling
    function loadData() {
        // Show loading indicator
        document.getElementById("loading-a").style.display = "block";
        
        // Try to load the CSV file
        // MODIFIED: Changed file path to be relative to data folder
        d3.csv("data/lyrics_aggregated_data.csv").then(data => {
            // Process the data
            const dataset = {
                loveWords: [],
                positiveSentiment: [],
                negativeSentiment: [],
                swearWords: [],
                moneyWords: [],
                sexWords: [],
                neutralPercentage: []
            };
            
            // For each row in the CSV
            data.forEach(d => {
                // Extract data for each category
                dataset.loveWords.push({
                    decade: d.decade,
                    value: parseFloat(d.love_words)
                });
                
                dataset.positiveSentiment.push({
                    decade: d.decade,
                    value: parseFloat(d.positive_sentiment)
                });
                
                dataset.negativeSentiment.push({
                    decade: d.decade,
                    value: parseFloat(d.negative_sentiment)
                });
                
                dataset.swearWords.push({
                    decade: d.decade,
                    value: parseFloat(d.swear_words)
                });
                
                dataset.moneyWords.push({
                    decade: d.decade,
                    value: parseFloat(d.money_words)
                });
                
                dataset.sexWords.push({
                    decade: d.decade,
                    value: parseFloat(d.sex_words)
                });
                
                dataset.neutralPercentage.push({
                    decade: d.decade,
                    value: parseFloat(d.neutral_percentage)
                });
            });
            
            // Sort data by decade to ensure proper order
            const decadeOrder = {
                '1950s': 0, '1960s': 1, '1970s': 2, '1980s': 3, 
                '1990s': 4, '2000s': 5, '2010s': 6
            };
            
            const sortByDecade = (a, b) => {
                return decadeOrder[a.decade] - decadeOrder[b.decade];
            };
            
            Object.keys(dataset).forEach(key => {
                dataset[key].sort(sortByDecade);
            });
            
            // Create visualization with processed data
            createVisualization(dataset);
        }).catch(error => {
            console.error("Error loading data:", error);
            // MODIFIED: Added better error handling
            document.getElementById("loading-a").innerHTML = "Error loading data. Using sample data instead.";
            
            // If error, use the predefined dataset
            setTimeout(() => createVisualization(dataset), 1000);
        });
    }
    
    // // Call loadData to initialize the visualization
    // // MODIFIED: Moved from DOMContentLoaded to init function
    // loadData();

    // // Add replay button functionality
    // document.getElementById("replay").addEventListener("click", () => {
    //     loadData();
    // });
    // 重要：确保 replay 按钮的事件监听器只添加一次
    const replayButton = document.getElementById("replay");
    if (replayButton) {
        // 移除所有现有事件监听器
        const newButton = replayButton.cloneNode(true);
        replayButton.parentNode.replaceChild(newButton, replayButton);
        
        // 添加新的事件监听器
        newButton.addEventListener("click", () => {
            loadData();
        });
    }
    
    // 立即加载数据并启动动画
    loadData();
}

/**
 * Function to handle resize events for Module A
 * MODIFIED: Added new function for resize handling
 */
function handleModuleAResize() {
    // Simply reload the visualization
    initModuleA();
}

/**
 * Function to replay the animation
 * MODIFIED: Extracted from event listener to allow calling from main.js
 */
function replayModuleA() {
    initModuleA();
}

/**
 * Clean up Module A before reinitializing
 * MODIFIED: Added new function for cleanup
 */
function cleanupModuleA() {
    // Clear SVG content
    d3.select("#chart-a").html("");
    
    // Reset loading indicator
    const loadingElement = document.getElementById("loading-a");
    if (loadingElement) {
        loadingElement.style.display = "block";
        loadingElement.textContent = "Loading data...";
    }
    
    // Clear music notes
    d3.select(".music-notes").html("");
}

// MODIFIED: Export functions for use in main.js
// This allows main.js to call these functions
window.initModuleA = initModuleA;
window.replayModuleA = replayModuleA;
window.handleModuleAResize = handleModuleAResize;
window.cleanupModuleA = cleanupModuleA;