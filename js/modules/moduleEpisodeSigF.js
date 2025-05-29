/**
 * moduleEpisodeSigF.js
 * Episode Signature Feature Comparison Module
 * 
 * This module creates an interactive bar chart visualizing various
 * linguistic features across different episode categories.
 */

function initModuleEpisodeSigF() {
    console.log("Initializing Episode Signature Feature module"); // 调试日志
    
    // 清除之前的图表和控件
    document.querySelector("#episode-signature-chart").innerHTML = "";
    document.querySelector("#episode-signature-controls").innerHTML = "";
    
    // Config
    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    
    // Features for selection with more descriptive names
    const features = [
        { key: "type_token_ratio", name: "Type-Token Ratio", description: "Lexical diversity measure" },
        { key: "metaphor_density", name: "Metaphor Density", description: "Figurative language frequency" },
        { key: "first_person_pronouns", name: "First Person Pronouns", description: "Self-reference frequency" },
        { key: "negation_count", name: "Negation Usage", description: "Negative expressions frequency" },
        { key: "question_count", name: "Interrogative Patterns", description: "Question frequency" },
        { key: "exclamation_count", name: "Exclamation Usage", description: "Emotional emphasis markers" }
    ];
    
    let currentFeature = features[0].key;
    
    // Create color palette that matches project theme
    const colors = {
        bars: ["#5D69B1", "#52BCA3", "#99C945", "#CC61B0", "#24796C", "#DAA51B"],
        accent: "#3182BD",
        highlight: "#e74c3c",
        text: "#333333",
        grid: "#e0e0e0"
    };
    
    // Create SVG
    const svg = d3.select("#episode-signature-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add background rectangle for better aesthetics
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f9f9f9")
        .attr("rx", 8)
        .attr("opacity", 0.5);
    
    // Create tooltip
    const tooltip = d3.select("#episode-signature-container")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "6px")
        .style("padding", "10px")
        .style("box-shadow", "0 4px 8px rgba(0,0,0,0.15)")
        .style("pointer-events", "none")
        .style("font-size", "14px")
        .style("transition", "opacity 0.3s");
    
    // Create feature selector with better styling
    const selector = d3.select("#episode-signature-controls")
        .append("div")
        .attr("class", "feature-select");
    
    // Create radio buttons with styled labels
    features.forEach((feature, i) => {
        const label = selector.append("label")
            .attr("class", "feature-radio")
            .style("display", "inline-block")
            .style("margin-right", "16px")
            .style("margin-bottom", "12px")
            .style("cursor", "pointer")
            .style("user-select", "none");
        
        // 创建单选按钮元素
        label.append("input")
            .attr("type", "radio")
            .attr("name", "signature-feature")
            .attr("value", feature.key)
            .property("checked", i === 0);
        
        // 添加标签文本
        label.append("span")
            .style("margin-left", "5px")
            .style("font-weight", i === 0 ? "bold" : "normal")
            .attr("class", "radio-label")
            .text(feature.name);
    });
    
    // 添加描述区域
    const featureDescription = d3.select("#episode-signature-controls")
        .append("div")
        .attr("class", "feature-description")
        .style("margin-top", "4px")
        .style("margin-bottom", "20px")
        .style("color", "#555")
        .style("font-style", "italic")
        .text(features[0].description);
    
    // 创建一个用于存储数据的变量，使其在模块内可访问
    let chartData = [];
    
    // 用于更新图表的函数，将其定义在数据加载之前，以便后续引用
    function updateChart(featureKey) {
        console.log("Updating chart with feature:", featureKey); // 调试日志
        
        // 确保有数据可用
        if (chartData.length === 0) {
            console.error("No data available for chart update");
            return;
        }
        
        // 更新当前特征
        currentFeature = featureKey;
        
        // 更新描述
        const featureObj = features.find(f => f.key === featureKey);
        featureDescription.text(featureObj.description);
        
        // 更新单选按钮样式
        selector.selectAll(".radio-label")
            .style("font-weight", function() {
                return d3.select(this.parentNode).select("input").property("value") === featureKey ? "bold" : "normal";
            });
        
        // 提取当前特征的值
        const values = chartData.map(d => d[featureKey]);
        const yMax = d3.max(values) * 1.15;
        
        // 提取分类
        const episodes = chartData.map(d => d.episode);
        
        // 创建比例尺
        const x = d3.scaleBand()
            .domain(episodes)
            .range([0, width])
            .padding(0.25);
        
        const y = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0])
            .nice();
        
        // 移除之前的元素
        svg.selectAll(".bar, .x.axis, .y.axis, .axis-label, .grid-line, .value-label").remove();
        
        // 添加网格线
        svg.append("g")
            .attr("class", "grid-line")
            .selectAll("line")
            .data(y.ticks(6))
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d))
            .attr("stroke", colors.grid)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");
        
        // 绘制条形图
        const bars = svg.selectAll(".bar")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.episode))
            .attr("width", x.bandwidth())
            .attr("y", height) // 从底部开始动画
            .attr("height", 0) // 初始高度为0
            .attr("fill", (d, i) => colors.bars[i % colors.bars.length])
            .attr("rx", 4) // 圆角
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                // 高亮条形
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.8)
                    .attr("stroke-width", 2);
                
                // 显示提示框
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                
                tooltip.html(`
                    <div style="font-weight:bold">${d.episode}</div>
                    <div>${featureObj.name}: ${d[featureKey].toFixed(3)}</div>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // 恢复条形
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("stroke-width", 1);
                
                // 隐藏提示框
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        // 动画效果
        bars.transition()
            .duration(800)
            .delay((d, i) => i * 100)
            .attr("y", d => y(d[featureKey]))
            .attr("height", d => height - y(d[featureKey]))
            .ease(d3.easeCubicOut);
        
        // 在条形上添加数值标签
        svg.selectAll(".value-label")
            .data(chartData)
            .enter()
            .append("text")
            .attr("class", "value-label")
            .attr("x", d => x(d.episode) + x.bandwidth() / 2)
            .attr("y", d => y(d[featureKey]) - 8)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#555")
            .style("opacity", 0) // 初始为不可见
            .text(d => d[featureKey].toFixed(2))
            .transition()
            .duration(800)
            .delay((d, i) => i * 100 + 400) // 在条形动画之后
            .style("opacity", 1);
        
        // 添加X轴
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-20)")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .style("font-weight", "600");
        
        // 添加Y轴
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(6).tickFormat(d => d.toFixed(1)));
        
        // 添加Y轴标签
        svg.append("text")
            .attr("class", "axis-label y-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .style("font-weight", "600")
            .text(featureObj.name);
        
        // 添加X轴标签
        svg.append("text")
            .attr("class", "axis-label x-label")
            .attr("x", width / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")
            .style("font-weight", "600")
            .text("Episode Category");
    }
    
    // 加载和处理数据
    d3.csv("data/episode_signature_features.csv").then(data => {
        console.log("Data loaded successfully:", data.length, "rows"); // 调试日志
        
        // 处理数据
        data.forEach(d => {
            features.forEach(f => d[f.key] = +d[f.key]);
        });
        
        // 存储数据以便在模块中使用
        chartData = data;
        
        // 初始化图表
        updateChart(currentFeature);
        
        // 绑定事件处理器到单选按钮
        // 使用原生JavaScript方法确保事件绑定
        document.querySelectorAll('input[name="signature-feature"]').forEach(input => {
            input.addEventListener('change', function() {
                console.log("Radio button changed:", this.value); // 调试日志
                updateChart(this.value);
            });
        });
        
    }).catch(error => {
        console.error("Error loading data:", error);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("fill", "red")
            .text("Error loading data. Please check console for details.");
    });
}

/**
 * Handles window resize event for the Episode Signature module
 */
function handleModuleEpisodeSigFResize() {
    initModuleEpisodeSigF();
}

// Export the module's functions
window.initModuleEpisodeSigF = initModuleEpisodeSigF;