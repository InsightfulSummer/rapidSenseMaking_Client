import * as d3 from 'd3'
import {fontSizeCalculator, docX, calculatePopUpPosition} from '../helper/helper'
import SummaryComponent from './components/summary'
import ReactDOMServer from 'react-dom/server';
import axios from 'axios'
import { API_ADDRESS } from '../helper/generalInfo'
import Store from '../redux/store'

export const summaryLens = (canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    var docsContainer = d3.select(".docsContainer")
    let summaryRect = docsContainer.selectAll(".summaryRect").data(documents)
    summaryRect.exit().remove()
    summaryRect = summaryRect.enter()
        .append("foreignObject")
        .merge(summaryRect)
        .attr("class", "summaryRect to_be_switched")

    summaryRect
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

    summaryRect.selectAll(".summaryRectDiv").remove()
    let summaryRectDiv = summaryRect
        .append("xhtml:div")
        .attr("class", "summaryRectDiv")

    summaryRectDiv.append("div")
        .attr("class", "summaryIconContainer")
        .append("div")
        .attr("class", "summaryIcon")
        .attr("style", "background-image :" + `url(${require("../images/lensIcons/Summary.png").default})`)

    summaryRectDiv.append("div")
        .attr("class", "summaryTitleContainer")
        .text(doc => {
            // top 3 keywords of each document instead of the title
            if (doc.title.length > 50) {
                return doc.title.substring(0, 50) + " ..."
            } else {
                return doc.title.substring(0, 50)
            }
        })
        .attr("style", "font-size:" + fontSizeCalculator((barWidth - barMargin) * 8 / 9, t_x * t_z, 54) + "px")

    summaryRectDiv.append("div")
        .attr("class", "summaryCover")
    
    d3.selectAll(".summaryRectDiv")
        .on("click", (event, doc) => {
            summaryLensOver(doc, canvasProperties, documents, clusters, groups, closeOpenLenses)
        })
}

export const summaryLensOver = (doc, canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties
    let lensFrameSize = 2
    var canvasSVG = d3.select(".canvasSVG")
    let docIndex = documents.findIndex(item => {
        return doc.id == item.id
    })
    let doc_x = docX(doc, barWidth, barMargin, groups, clusters)
    let doc_y = docIndex < n_z ? (docIndex) * (t_z + margin) : docIndex < n_z + n_x ? n_z * (t_z + margin) + (docIndex - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (docIndex - n_z - n_x) * (t_z + margin)
    let popUpWidth = width/lensFrameSize
    let popUpHeight = height/lensFrameSize
    let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
    
    d3.selectAll(".docElement")
        .filter(item => {
            return item.id != doc.id
        })
        .attr("opacity","0.31")
    
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

    SummaryHTMLandEvents(doc, doc_x, doc_y, canvasProperties, closeOpenLenses)

    
}

export const SummaryHTMLandEvents = (doc, doc_x, doc_y, canvasProperties, closeOpenLenses, loading=true, expanded=false, showAbstract=false, showPDF=false, summaryContent="", size=0.5 ) => {
    var canvasSVG = d3.select(".canvasSVG")
    let summaryBody = d3.select(".summaryBody")
    let sum_ = document.createElement('div')
    var {barWidth, rightMargin, topMargin, width, height} = canvasProperties
    sum_.innerHTML = ReactDOMServer.renderToString(
    <SummaryComponent 
        doc_={doc} 
        expanded={expanded} 
        showAbstract={showAbstract}
        showPDF={showPDF}
        loading={loading}
        summaryContent={summaryContent}
        size={size}
    />)
    // console.log(sum_.innerHTML)
    summaryBody.html(sum_.innerHTML) 

    // events
    // 1 - api call
    if (loading) {
        var formData = new FormData()
        const reqID = Store.getState().dataReducer.requestId
        formData.append('reqID', reqID)
        formData.append('docID', doc.id)
        formData.append('size', size)
        axios.post(API_ADDRESS+"summarizeDocument", formData)
        .then(data => {
            SummaryHTMLandEvents(doc, doc_x, doc_y, canvasProperties, closeOpenLenses, false, expanded, showAbstract, showPDF, data.data.summary, size)
        })
        .catch(err => {
            console.log(err);
            alert("some error happended! please try again later.")
        })
    }

    // 2 - close lens
    summaryBody.select("#summaryCloseIcon").on("click",()=>{
        canvasSVG.select(".to_be_closed").remove()
        closeOpenLenses()
    })
    // 3 - expand lens
    summaryBody.select("#summaryExpandIcon").on("click",()=>{
        if(!expanded){
            expanded = true
            let popUpHeight = height / 1.50
            let popUpWidth = width / 1.5
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            summaryBody.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
            SummaryHTMLandEvents(doc, doc_x, doc_y, canvasProperties, closeOpenLenses, loading, true, showAbstract, showPDF, summaryContent, size)
        }
    })
    // 4 - compress lens
    summaryBody.selectAll("#summaryCompressIcon").on("click",()=>{
        if(expanded){
            expanded = false
            let popUpHeight = height / 2
            let popUpWidth = width / 2
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            summaryBody.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
            SummaryHTMLandEvents(doc, doc_x, doc_y, canvasProperties, closeOpenLenses, loading, false, showAbstract, showPDF, summaryContent, size)
        }
    })
    // 5 - show abstract lens
    summaryBody.select("#toggleOriginalAbstractIcon").on("click",()=>{
        SummaryHTMLandEvents(doc, doc_x, doc_y, canvasProperties, closeOpenLenses, loading, expanded, !showAbstract, false, summaryContent, size)
    })
    // 6 - show pdf of the document
    summaryBody.select("#pdfToggler").on("click",()=>{
        SummaryHTMLandEvents(doc, doc_x, doc_y, canvasProperties, closeOpenLenses, loading, expanded, false, !showPDF, summaryContent, size)
    })

    // 7 - change the size of summarization
    summaryBody.selectAll(".summaryLensSizeIcon").on("click", (event)=>{
        let newSize = parseFloat(event.target.innerHTML);
        if (newSize != size) {
            SummaryHTMLandEvents(doc, doc_x, doc_y, canvasProperties, closeOpenLenses, true, expanded, false, showPDF, summaryContent, newSize)
        }
    })
}