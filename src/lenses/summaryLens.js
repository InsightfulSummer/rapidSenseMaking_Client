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

export const summaryLens = (canvasProperties, focusedDoc, documents, clusters, groups, activeMainLens, updateDocs) => {
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
                summaryLensOver(activeMainLens, canvasProperties, doc, documents, groups, clusters, doc.summary, updateDocs)
            })
            
    // }
}

/** 
 * The below function might be convolutionized with another lens, either it is going to be the underlying lens or the ultimate lens
 * This lens only shows a peice of text as a summary
 * It is either going to be an actualSummary of a document in the default state or --- summary of a piece of text which is the result of another lens ---
 * In the second state it is not an already processed text, therefore an API call seems necessary
 */

export const summaryLensOver = (activeLens, canvasProperties , doc, documents, groups, clusters , summary=doc.abstract, updateDocs) => {
    if (summary==doc.abstract) {
        // routine 
    } else {
        // make the api call - get the result - stop the spinner - put the result as the summary in the lens
    }
    // let barWidth = (width - 125 - (clusters.length * barMargin)) / clusters.length
    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties
    let lensFrameSize = 3
    let expanded=false
    var canvasSVG = d3.select(".canvasSVG")
    let docIndex = documents.findIndex(item => {
        return doc._id == item._id
    })
    let doc_x = docX(doc, barWidth, barMargin, groups, clusters)
    let doc_y = docIndex < n_z ? (docIndex) * (t_z + margin) : docIndex < n_z + n_x ? n_z * (t_z + margin) + (docIndex - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (docIndex - n_z - n_x) * (t_z + margin)
    let popUpWidth = width/lensFrameSize
    let popUpHeight = height/lensFrameSize
    let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
    
    d3.selectAll(".docElement")
        .filter(item => {
            return item._id != doc._id
        })
        .attr("opacity","0.3")
    
    canvasSVG.selectAll(".summaryBody").remove()

    let summaryBody = canvasSVG.append("foreignObject")
        .attr("class","summaryBody  to_be_closed to_be_resized")
    summaryBody
        .attr("x",popUpX + popUpWidth/2)
        .attr("y",popUpY + popUpHeight/2)
        .transition()
        .attr("width", popUpWidth)
        .attr("height", popUpHeight)
        .attr("x",popUpX)
        .attr("y",popUpY)

    SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs)

    
}

export const SummaryHTMLandEvents = (doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF) => {
    var canvasSVG = d3.select(".canvasSVG")
    let summaryBody = d3.select(".summaryBody")
    let sum_ = document.createElement('div')
    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties
    sum_.innerHTML = ReactDOMServer.renderToString(<SummaryComponent 
            doc_={doc} 
            expanded={expanded} 
            showAbstract={showAbstract}
            showPDF={showPDF}
            title={"A new approach for query expansion using Wikipedia and WordNet"}
            abstract={"Query expansion (QE) is a well-known technique used to enhance the effectiveness of information retrieval. QE reformulates the initial query by adding similar terms that help in retrieving more relevant results. Several approaches have been proposed in literature producing quite favorable results, but they are not evenly favorable for all types of queries (individual and phrase queries). One of the main reasons for this is the use of the same kind of data sources and weighting scheme while expanding both the individual and the phrase query terms. As a result, the holistic relationship among the query terms is not well captured or scored. To address this issue, we have presented a new approach for QE using Wikipedia and WordNet as data sources. Specifically, Wikipedia gives rich expansion terms for phrase terms, while WordNet does the same for individual terms. We have also proposed novel weighting schemes for expansion terms: in-link score (for terms extracted from Wikipedia) and a tf-idf based scheme (for terms extracted from WordNet). In the proposed Wikipedia-WordNet-based QE technique (WWQE), we weigh the expansion terms twice: first, they are scored by the weighting scheme individually, and then, the weighting scheme scores the selected expansion terms concerning the entire query using correlation score. The proposed approach gains improvements of 24% on the MAP score and 48% on the GMAP score over unexpanded queries on the FIRE dataset. Experimental results achieve a significant improvement over individual expansion and other related state-of-the-art approaches. We also analyzed the effect on retrieval effectiveness of the proposed technique by varying the number of expansion terms."}
    />)
    // console.log(sum_.innerHTML)
    summaryBody.html(sum_.innerHTML) 
    summaryBody.select("#summaryCloseIcon").on("click",()=>{
        canvasSVG.select(".to_be_closed").remove()
        updateDocs()
        // update the docs here ... 
        // maybe it is required to update the document once more here ...
    })
    summaryBody.select("#summaryExpandIcon").on("click",()=>{
        if(!expanded){
            lensFrameSize /= 2
            expanded = true
            let popUpHeight = height / lensFrameSize
            let popUpWidth = width / lensFrameSize
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            summaryBody.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
            SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF)
        }
    })
    summaryBody.select("#summaryCompressIcon").on("click",()=>{
        if(expanded){
            lensFrameSize *= 2
            expanded = false
            let popUpHeight = height / lensFrameSize
            let popUpWidth = width / lensFrameSize
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            summaryBody.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
            SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF)
        }
    })
    summaryBody.select("#toggleOriginalAbstractIcon").on("click",()=>{
        showAbstract = !showAbstract
        SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF)
    })
    summaryBody.select("#pdfToggler").on("click",()=>{
        showPDF = !showPDF
        SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF)
    })
}