import * as d3 from 'd3'
import {docX, fontSizeCalculator, calculatePopUpPosition} from '../helper/helper'
import ReactDOMServer from 'react-dom/server';
import NonLinearComponent from './components/nonLinear'
import jRes from '../data/res.json'

export const NonLinearReading = (canvasProperties, documents, clusters, groups) => {
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    var docsContainer = d3.select(".docsContainer")
    let nonLinearRect = docsContainer.selectAll(".nonLinearRect").data(documents)
    nonLinearRect.exit().remove()
    nonLinearRect = nonLinearRect.enter()
        .append("foreignObject")
        .merge(nonLinearRect)
        .attr("class", "nonLinearRect")

    nonLinearRect
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

    nonLinearRect.selectAll(".nonLinearRectDiv").remove()
    let nonLinearRectDiv = nonLinearRect
        .append("xhtml:div")
        .attr("class", "nonLinearRectDiv")
        // .attr("style", doc => {
        //     return "font-size:" + fontSizeCalculator(barWidth - barMargin, t_x * t_z, 54) + "px"
        // })
        // .text(doc => {
        //     return doc.title.substring(0,50)+" ..."
        // })
    nonLinearRectDiv.append("div")
        .attr("class","nonLinearIconContainer")
            .append("i")
            .attr("class","nonLinearIcon fas fa-exchange-alt")

    nonLinearRectDiv.append("div")
        .attr("class" , "nonLinearTitleContainer")
        .text(doc=>{
            if (doc.title.length > 50) {
                return doc.title.substring(0,50) + " ..."
            } else {
                return doc.title.substring(0,50)
            }
        })
        .attr("style","font-size:"+fontSizeCalculator((barWidth-barMargin)*8/9, t_x*t_z, 54)+"px")

    nonLinearRectDiv.append("div")
        .attr("class","nonLinearCover")
        

    d3.selectAll(".nonLinearCover")
        .on("mouseover", (event, doc) => {
            NonLinearReadingOver(doc, canvasProperties, documents, clusters, groups)
        })
}

export const NonLinearReadingOver = (doc, canvasProperties, documents, clusters, groups) => {
    // api calls
    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties
    let lensFrameSize = 2
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

    canvasSVG.selectAll(".nonLinearPopUp").remove()

    let nonLinearPopUp = canvasSVG.append("foreignObject")
        .attr("class", "nonLinearPopUp to_be_closed")

    nonLinearPopUp
        .attr("x",popUpX + popUpWidth/2)
        .attr("y",popUpY + popUpHeight/2)
        .transition()
        .attr("width", popUpWidth)
        .attr("height", popUpHeight)
        .attr("x",popUpX)
        .attr("y",popUpY)

    nonLinearHTMLandEvent(doc, canvasProperties)
}

export const nonLinearHTMLandEvent = (doc, canvasProperties, suggestions=[], loading=false) => {
    var canvasSVG = d3.select(".canvasSVG")
    let nonLinearPopUp = canvasSVG.select(".nonLinearPopUp")
    let tmpDiv = document.createElement("div")
    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties
    tmpDiv.innerHTML = ReactDOMServer.renderToString(
        <NonLinearComponent 
            doc_={doc} 
            parsedBody={jRes} 
            loading={loading}
            suggestions={suggestions} 
        />
    )
    nonLinearPopUp.html(tmpDiv.innerHTML)

    // events
    nonLinearPopUp.selectAll(".nonLinearSpanOfSentence").on("mouseover",(e)=>{
        console.log(e.target.innerHTML)
    })
}