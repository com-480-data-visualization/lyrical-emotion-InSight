# Cross-Cultural Dynamics of Emotional Expression in Lyrics

## Project Overview

This interactive data visualization project explores how emotions are expressed in song lyrics across different languages, cultures, and time periods. Using computational analysis and data visualization techniques, we examine patterns in emotional expression, linguistic features, and structural elements of lyrics from around the world.

**Live Demo**: [Cross-Cultural Dynamics of Emotional Expression in Lyrics](https://com-480-data-visualization.github.io/lyrical-emotion-InSight/)
**Video backup address(included in github)**: [Video](https://drive.google.com/drive/folders/1ollYvoAg3SnQRqVNJkw5nvcQFt1jfpTn?usp=drive_link) 
## Project Structure

The project is organized into a modular structure to facilitate maintenance and expansion:

```
project/
├── index.html           # Main HTML file with page structure
├── css/
│   ├── styles.css       # Main stylesheet
│   └── tabs.css         # Tab navigation styles
├── js/
│   ├── common.js        # Shared utilities and functions
│   ├── main.js          # Main initialization script
│   ├── tabs.js          # Tab navigation functionality
│   └── modules/         # Visualization modules
│       ├── moduleA.js   # Historical Trends in Lyrical Tone
│       ├── moduleB.js   # Temporal Emotion Trends by Language
│       ├── moduleC.js   # Emotional Dimensions Across Languages
│       ├── moduleD.js   # Clustering Analysis (Sankey Diagram)
│       ├── moduleE.js   # Valence-Arousal Profiles
│       ├── moduleEpisodeSign.js    # Episode Signature Features
│       ├── moduleEpisodeSig.js     # Episode Signature Comparison
│       ├── moduleMatrix.js         # Confusion Matrix
│       ├── moduleSpearman.js       # Lyrical Feature Correlations
│       ├── moduleStruct.js         # Structural-Emotional Correlations
│       ├── moduleUmap.js           # UMAP Clustering Visualization
│       └── moduleVAD.js            # VAD Correlation Matrix
└── data/                # Dataset files
    ├── processed_data/  # Language-specific data
    ├── processed_data2/ # Emotion dimension data
    └── various CSV/JSON files
```

## Data

This project uses the WASABI dataset, which contains metadata for over 2 million commercially released songs, including:

- Lyrics with emotion annotations (valence, arousal, dominance)
- Language identification
- Genre classification
- Temporal information

The dataset was preprocessed and analyzed to extract:
1. Emotional dimensions across languages
2. Temporal trends in emotional expression
3. Linguistic features correlated with emotional states
4. Structural patterns in lyrical narratives

## Features

The project is divided into two main sections:

### 1. Emotion Across Culture

- **Historical Trends in Lyrical Tone (1950s-2010s)**: An animated visualization showing how the use of emotional and thematic word categories has changed over time.
- **Emotional Dimensions and Trends by Language**: Interactive bar charts displaying emotional attributes across languages and their evolution over time.
- **Valence-Arousal Profiles**: Scatter plot and companion bar chart showing the two-dimensional emotional space across languages.
- **Temporal Emotion Trends Within Languages**: Detailed view of how specific languages have expressed emotions through time.

### 2. Emotion & Linguistics

- **Clustering Analysis**: Sankey diagram mapping structural patterns to emotional episodes.
- **VAD Correlation Matrix**: Heatmap visualizing correlations between different emotional dimensions.
- **UMAP Clustering**: Visualization of high-dimensional lyrical data in 2D space.
- **Confusion Matrix**: Shows relationship between VAD values and emotional episode classifications.
- **Structural and Emotional Feature Correlations**: Heatmap revealing how lyrical structure relates to emotional content.
- **Episode Signature Features**: Bar charts displaying distinctive characteristics of emotional episodes.
- **Linguistic Signatures**: Comparison of language patterns across emotional states.

## Technology Stack

- **Visualization**: D3.js (v7)
- **Specialized Components**: d3-sankey for Sankey diagrams
- **Layout & Design**: Custom CSS
- **Typography**: Roboto (Google Fonts)
- **Data Processing**: Python (pandas, scikit-learn, UMAP)

## Key Research Questions

1. How do emotional expressions in lyrics differ across languages?
2. What temporal trends can be observed in emotional tone across decades?
3. How do linguistic structures correlate with emotional states?
4. Can we identify universal patterns in how emotions are expressed in lyrics?

## Visualization Approach

The project employs multiple visualization techniques:

- **Time Series**: Showing emotional trends across decades
- **Heatmaps**: Displaying correlations between features
- **Scatter Plots**: Visualizing relationships between emotional dimensions
- **Bar Charts**: Comparing measurements across categories
- **Network Diagrams**: Showing relationships between structural clusters
- **Interactive Elements**: Filters, tooltips, animations for exploration

## Installation and Usage

1. Clone the repository:
   ```
   git clone https://github.com/com-480-data-visualization/lyrical-emotion-InSight.git
   ```

2. Navigate to the project directory:
   ```
   cd lyrical-emotion-InSight
   ```

3. Open `index.html` in a web browser, or set up a local server:
   ```
   python -m http.server
   ```
   Then visit `http://localhost:8000` in your browser.

4. Alternatively, visit the [hosted version](https://com-480-data-visualization.github.io/lyrical-emotion-InSight/).

## Project Development

This project was developed in three milestone phases:

1. **Milestone 1**: Dataset selection, problem definition, and exploratory data analysis
2. **Milestone 2**: Design and implementation of visualization prototypes
3. **Final Milestone**: Integration of all visualizations into a cohesive interactive web experience

## Research Background

This research builds on work in affective computing, computational linguistics, and musicology. We apply natural language processing techniques to analyze lyrics from multiple languages, examining how different cultures encode emotions in their musical expressions.

The project employs the Episode Model which maps linguistic structures (e.g., repetition, metaphor, valence arcs) to functional emotion episodes, revealing both universal and culture-specific patterns of lyrical emotion.

## Contributors

Team InSight:
- Xu Weilun
- Huang Xin
- Wang Qi

## References

1. NRC Emotion Lexicon - A lexical resource for emotion analysis
2. The Episode Model - Framework for analyzing emotional states in narratives
3. WASABI Dataset - Large-scale collection of songs with metadata

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2025 Lyrical Emotion Analysis Project  
All visualizations created with D3.js | Data sources: WASABI Dataset
