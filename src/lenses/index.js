export * from './summaryLens'
export * from './nonLinearReading'
export * from './skimmingLens'
export * from './biblioLens'
export * from './overviewLens'
export * from './comparisonLens'
export const lenses = [
    {
        "name" : "Summarization",
        "icon" : "fas fa-list-alt",
        "img" : "Summary.png"
    },
    {
        "name" : "Semantic Jump",
        "icon" : "fas fa-exchange-alt",
        "img" : "HyperSimilarity.png"
    },
    {
        "name" : "Skim",
        "icon" : "fas fa-book-open",
        "img" : "Skimming.png"
    },
    {
        "name" : "Bibliographic Connection",
        "icon" : "fab fa-connectdevelop",
        "img":"BibliographicInformation.png"
    },
    {
        "name" : "Map",
        "icon" : "fas fa-info",
        "img" : "Map.png"
    },
    {
        "name" : "Comparison",
        "icon" : "fas fa-columns",
        "img" : "Comparison.png"
    }
]