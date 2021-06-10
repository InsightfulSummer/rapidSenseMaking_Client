import * as d3 from 'd3'
import {fontSizeCalculator, docX, calculatePopUpPosition} from '../helper/helper'


export const skimPriview = (documents, canvasProperties , clusters, groups) => {
    /**
     * In this finction, top three keywords of a document is shown inside the rectangle encoding that document.
     * The order of keywords is according to the order of their first appearence in the document.
     */

    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties

    var docsContainer = d3.select(".docsContainer")
    var skimRects = d3.selectAll(".skimRects").data(documents)
    skimRects.exit().remove()
    skimRects = skimRects.enter()
        .append("foreignObject")
        .merge(skimRects)
        .attr("class","skimRects")

    skimRects
        .transition()
        .attr("width", (doc,index) => {
            return barWidth - barMargin
        })
        .attr("height", (doc,index)=>{
            return (index >= n_z && index < n_z + n_x) ? t_x * t_z : 0
        })
        .attr("x" , item => docX(item , barWidth, barMargin, groups, clusters))
        .attr("y", (doc, index) => {
            return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
        })
    

    summaryRect.selectAll(".skimRectDiv").remove()
    summaryRect
        .append("xhtml:div")
        .attr("class","skimRectDiv")
        .attr("style","font-size:"+fontSizeCalculator(barWidth-barMargin, t_x*t_z, 204)+"px")
        .text(doc => {
            return doc.abstract.substring(0,200) + " ..." /** doc.skimPreview */
        })
        
    d3.selectAll(".skimRectDiv")
        .on("mouseover", (event, doc)=>{
            skimLens()
        })
}

/**
 * This function gets an array of sentence with their score as the input, this input can be equal to doc.skimContent or sth else
 * if sth else, then an api call seems necassary, otherwise, we can just show the pre-calculated array as the content
 */
export const skimLens = (doc, content=doc.skimContent, canvasProperties, clusters, groups, ) => {
    if (content == doc.skimContent) {
        /** routine */
    } else {
        /** make your api call here */
    }
    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties
    
    let barWidth = (width - 125 - (clusters.length * barMargin)) / clusters.length
    var docsContainer = d3.select(".docsContainer")
    var canvasSVG = d3.select(".canvasSVG")
    let docIndex = documents.findIndex(item => {
        return doc._id == item._id
    })
    let doc_x = docX(doc, barWidth, barMargin, groups, clusters)
    let doc_y = docIndex < n_z ? (docIndex) * (t_z + margin) : docIndex < n_z + n_x ? n_z * (t_z + margin) + (docIndex - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (docIndex - n_z - n_x) * (t_z + margin)
    let popUpWidth = width/3
    let popUpHeight = height/3
    let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
    
    d3.selectAll(".docElement")
        .filter(item => {
            return item._id != doc._id
        })
        .attr("opacity","0.3")
    
    canvasSVG.selectAll(".summaryBody").remove()

    let summaryBody = canvasSVG.append("foreignObject")
        .attr("class","summaryBody")
    summaryBody
        .attr("x",popUpX + popUpWidth/2)
        .attr("y",popUpY + popUpHeight/2)
        .transition()
        .attr("width", width/3)
        .attr("height", height/3)
        .attr("x",popUpX)
        .attr("y",popUpY)
        
    let summaryDiv = summaryBody.append("xhtml:div")
        .attr("class","summaryDiv")
        .attr("style","border-color:"+doc.cluster.color)

    summaryDiv.append("h5")
        .attr("class","summaryLensTitle")
        .text(doc.title)

    summaryDiv.append("p")
        .attr("class", "summaryP")
        .attr("style","font-size:"+fontSizeCalculator(popUpWidth, popUpHeight * 0.65, summary.length)+"px")
        .text(summary)
}