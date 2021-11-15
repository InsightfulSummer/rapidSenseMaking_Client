import * as d3 from 'd3'
import {
    linkPathGenerator,
    fontSizeCalculator,
    docX,
    outlinkCalculator,
    inlinkCalculator,
    hexToRgbA
} from '../helper/helper'


export const biblioLens = (canvasProperties, documents, clusters, groups) => {
    d3.selectAll(".to_be_closed").remove()
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    var docsContainer = d3.select(".docsContainer")
    
    let biblioRect = docsContainer.selectAll(".biblioRect").data(documents)
    biblioRect.exit().remove()
    biblioRect = biblioRect.enter()
        .append("foreignObject")
        .merge(biblioRect)
        .attr("class", "biblioRect to_be_switched")

    biblioRect
        .transition()
        .attr("width", (doc, index) => {
            return barWidth - barMargin
        })
        .attr("height", (doc, index) => {
            return (index >= n_z && index < n_z + n_x) ? t_x * t_z : 0
        })
        .attr("x", item => docX(item, barWidth, barMargin, groups, clusters))
        .attr("y", (doc, index) => {
            return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
        })

    biblioRect.selectAll(".biblioRectDiv").remove()
    let biblioRectDiv = biblioRect
        .append("xhtml:div")
        .attr("class", "biblioRectDiv")

    biblioRectDiv.append("div")
        .attr("class", "biblioIconContainer")
        .append("div")
        .attr("class", "biblioIcon")
        .attr("style","background-image :"+ `url(${require("../images/lensIcons/BibliographicInformation.png").default})`)

    biblioRectDiv.append("div")
        .attr("class", "biblioTitleContainer")
        .text(doc => {
            if (doc.authors.length > 1) {
                return doc.authors[0].name + " et al."
            } else {
                return doc.authors[0].name
            }
        })
        .attr("style", doc => {
            return "font-size:" + fontSizeCalculator((barWidth - barMargin) * 12 / 14, t_x * t_z, (doc.authors[0].name.length + 6)) + "px"
        })

    biblioRectDiv.append("div")
        .attr("class", "biblioCover")

    d3.selectAll(".linkPath").remove()
    documents.map((doc, index) => {
        if (index >= n_z && index < n_z + n_x) {
            let outlinks_ = outlinkCalculator(doc, documents)
            outlinks_.map(ol => {
                let index_ = documents.findIndex(item => {
                    return item.id == ol.id
                })
                // if (index_ >= n_z && index_ < n_z + n_x) {
                let y1 = index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
                let y2 = index_ < n_z ? (index_) * (t_z + margin) : index_ < n_z + n_x ? n_z * (t_z + margin) + (index_ - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index_ - n_z - n_x) * (t_z + margin)
                docsContainer.append("path")
                    .attr("class", "linkPath to_be_switched")
                    .attr("stroke", hexToRgbA(doc.cluster.color, 0.9))
                    .attr("fill", "none")
                    // .attr("opacity", 1 - slideHeightPorportion)
                    .attr("stroke-width", t_z / 40)
                    .transition()
                    .attr("stroke-width", t_z / 5)
                    .attr("d", linkPathGenerator(doc, documents[index_], barMargin, barWidth, y1 + t_z / 2, y2 + t_z / 2, height))
                // }
            })
        }
    })

    d3.selectAll(".biblioCover")
        .on("click", (event, doc) => {
            d3.selectAll(".to_be_closed").remove()
            biblioLens(canvasProperties, documents, clusters, groups)
            biblioLensEvents( canvasProperties,  doc, documents, clusters, groups)
        })

    
}

export const biblioLensEvents = (canvasProperties, doc, documents , clusters , groups , outlinks = true, fixed = false) => {
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    d3.selectAll(".to_be_closed").remove()
    // 1- all links should be faded ...
    d3.selectAll(".linkPath")
        .transition()
        .attr("opacity", "0.05")
        .attr("stroke-width", t_z / 5)

    // 2- all documents but the hovered one should be faded ...
    d3.selectAll(".docElement")
        .attr("opacity", "0.3")
    d3.selectAll(".docElement")
        .filter(item => {
            return item.id == doc.id
        })
        .attr("opacity", "1")

    let index = documents.findIndex(item => {
        return doc.id == item.id
    })
    var docsContainer = d3.select(".docsContainer")
    // 3- visualize hovered document links
    let links;
    if (outlinks) {
        links = outlinkCalculator(doc, documents)
    } else {
        links = inlinkCalculator(doc, documents)
    }
    links.map(ol => {
        let index_ = documents.findIndex(item => {
            return item.id == ol.id
        })
        let y1 = index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
        let y2 = index_ < n_z ? (index_) * (t_z + margin) : index_ < n_z + n_x ? n_z * (t_z + margin) + (index_ - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index_ - n_z - n_x) * (t_z + margin)
        docsContainer.append("path")
            .attr("class", "linkPath")
            .attr("stroke", outlinks ? hexToRgbA(doc.cluster.color, 0.9) : hexToRgbA(ol.clusterColor, 0.9))
            .attr("fill", "none")
            // .attr("opacity", 1 - slideHeightPorportion)
            .attr("stroke-width", t_z / 40)
            .transition()
            .attr("stroke-width", t_z / 3)
            .attr("d", outlinks ? linkPathGenerator(doc, documents[index_], barMargin, barWidth, y1 + t_z / 2, y2 + t_z / 2, height) : linkPathGenerator(documents[index_], doc , barMargin, barWidth, y2 + t_z / 2, y1 + t_z / 2, height))
    
        // for identifying linked documents
        if (fixed && (index_ < n_z || index_ >= n_z + n_x)) {
            docsContainer.selectAll(".docElement")
                .filter(item => {
                    return item.id == ol.id
                }).attr("opacity", "1")

            docsContainer.append("text")
                .attr("width", barWidth - barMargin)
                .attr("height" , t_x * t_z)
                .attr("x", docX(documents[index_], barWidth, barMargin, groups, clusters))
                .attr("y", y2)
                .attr("font-size", fontSizeCalculator((barWidth - barMargin)/2.5, t_x*t_z, (documents[index_].authors[0].name.length + 6)))
                .attr("font-weight", "bold")
                .attr("class", "to_be_closed identifyingLinkedDocs")
                .text((documents[index_].authors.length > 1) ? documents[index_].authors[0].name + " et al." : documents[index_].authors[0].name)
        }

    })

    // 4- visualize the controlling buttons of hovered document ...
    d3.selectAll(".biblioRect")
        .filter(item => {
            return item.id == doc.id
        })
        .remove()

    docsContainer.selectAll(".biblioHoveredRect").remove()
    let biblioHoveredRect = docsContainer
        .append("foreignObject")
        .attr("class", "biblioHoveredRect to_be_closed")
        
    biblioHoveredRect
        .attr("width", (doc, index) => {
            return barWidth - barMargin
        })
        .attr("height", (index >= n_z && index < n_z + n_x) ? t_x * t_z : 0)
        .attr("x", docX(doc, barWidth, barMargin, groups, clusters))
        .attr("y", index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin))
    
    biblioHoveredRect.selectAll(".biblioHoveredRectDiv").remove()
    let biblioHoveredRectDiv = biblioHoveredRect.append("xhtml:div")
        .attr("class", "biblioHoveredRectDiv")
    
    biblioHoveredRectDiv.selectAll(".biblioHoveredRectDiv_authors").remove();
    biblioHoveredRectDiv.selectAll(".biblioHoveredRectDiv_actions").remove();
    biblioHoveredRectDiv.append("div")
        .attr("class", "biblioHoveredRectDiv_authors")
        .text((doc.authors.length > 1) ? doc.authors[0].name + " et al." : doc.authors[0].name)
        .attr("style", "font-size:" + fontSizeCalculator((barWidth - barMargin) * 3 / 10, t_x * t_z, (doc.authors[0].name.length + 6)) + "px")

    let biblioHoveredRectDiv_actions = biblioHoveredRectDiv.append("div")
        .attr("class", "biblioHoveredRectDiv_actions")

    biblioHoveredRectDiv_actions.selectAll(".biblioLensActionBtn").remove();
    biblioHoveredRectDiv_actions.append("div").attr("class", fixed ? "activeBiblioLensActionBtn biblioLensActionBtn" : "biblioLensActionBtn")
        .attr("id", "fixBiblioLens").attr("title", "identify linked documents")
        .append("i")
        .attr("class", "fas fa-search")

    biblioHoveredRectDiv_actions.append("div").attr("class", outlinks ? "biblioLensActionBtn" : "activeBiblioLensActionBtn biblioLensActionBtn")
        .attr("id", "inlinkBiblioLens").attr("title", "show the inlinks of this document")
        .append("i")
        .attr("class", "fas fa-compress-arrows-alt")

    biblioHoveredRectDiv_actions.append("div").attr("class", outlinks ? "activeBiblioLensActionBtn biblioLensActionBtn" : "biblioLensActionBtn")
        .attr("id", "outlinkBiblioLens").attr("title", "show the outlinks of this document")
        .append("i")
        .attr("class", "fas fa-expand-arrows-alt") 

    // events and actions
    biblioHoveredRectDiv_actions.select("#fixBiblioLens").on("click", ()=>{
        biblioLensEvents(canvasProperties, doc, documents, clusters, groups, outlinks, !fixed)
    })

    biblioHoveredRectDiv_actions.select("#inlinkBiblioLens").on("click", ()=>{
        if (outlinks) {
            biblioLensEvents(canvasProperties, doc, documents, clusters, groups, !outlinks, fixed)
        }
    })

    biblioHoveredRectDiv_actions.select("#outlinkBiblioLens").on("click", ()=>{
        if (!outlinks) {
            biblioLensEvents(canvasProperties, doc, documents, clusters, groups, !outlinks, fixed)
        }
    })
} 