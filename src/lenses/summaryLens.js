import * as d3 from 'd3'
import {fontSizeCalculator, docX, calculatePopUpPosition} from '../helper/helper'
import SummaryComponent from './components/summary'
import ReactDOMServer from 'react-dom/server';
/** 
 * By summary, we are refering to the abstractive summary created by t5  pretrained model.
 * This model should beild two summary for each document : 1- previewSummary, 2- actualSummary
 * The previewSummary is the two sentence long summary to show for each document within the slider as the preview of the summary and more concie version of the summary of a document.
 * actual summary is the 1/10 of the size of the document summary which will be displayed when a summary is hovered.
 * 
 */

export const summaryLens = (canvasProperties, focusedDoc, documents, clusters, groups, activeMainLens ) => {
    // if(focusedDoc == ""){

        var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties

        var docsContainer = d3.select(".docsContainer")
        let summaryRect = docsContainer.selectAll(".summaryRect").data(documents)
        summaryRect.exit().remove()
        summaryRect = summaryRect.enter()
            .append("foreignObject")
            .merge(summaryRect)
            .attr("class","summaryRect")
            
        summaryRect
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
        

        summaryRect.selectAll(".summaryRectDiv").remove()
        summaryRect
            .append("xhtml:div")
            .attr("class","summaryRectDiv")
            .attr("style","font-size:"+fontSizeCalculator(barWidth-barMargin, t_x*t_z, 204)+"px")
            .text(doc => {
                return doc.abstract.substring(0,200) + " ..."
            })
            
        d3.selectAll(".summaryRectDiv")
            .on("mouseover", (event, doc)=>{
                summaryLensOver(activeMainLens, doc, n_z, n_x, t_z, t_x, documents, margin, barMargin, groups, clusters,  rightMargin, topMargin, width, height)
            })
            
    // }
}

/** 
 * The below function might be convolutionized with another lens, either it is going to be the underlying lens or the ultimate lens
 * This lens only shows a peice of text as a summary
 * It is either going to be an actualSummary of a document in the default state or --- summary of a piece of text which is the result of another lens ---
 * In the second state it is not an already processed text, therefore an API call seems necessary
 */

export const summaryLensOver = (activeLens , doc, n_z, n_x, t_z, t_x, documents, margin, barMargin, groups, clusters, rightMargin, topMargin, width, height , summary=doc.abstract) => {
    if (summary==doc.abstract) {
        // routine 
    } else {
        // make the api call - get the result - stop the spinner - put the result as the summary in the lens
    }
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

    let sum_ = document.createElement('div')
    sum_.innerHTML = ReactDOMServer.renderToStaticMarkup(<SummaryComponent label_={doc._id} />)
    // console.log(sum_.innerHTML)
    summaryBody.html(sum_.innerHTML) 
    // summaryBody.append()    
    // let summaryDiv = summaryBody.append("xhtml:div")
    //     .attr("class","summaryDiv")
    //     .attr("style","border-color:"+doc.cluster.color)

    // summaryDiv.append("h5")
    //     .attr("class","summaryLensTitle")
    //     .text(doc.title)

    // summaryDiv.append("p")
    //     .attr("class", "summaryP")
    //     .attr("style","font-size:"+fontSizeCalculator(popUpWidth, popUpHeight * 0.65, summary.length)+"px")
    //     .text(summary)
}