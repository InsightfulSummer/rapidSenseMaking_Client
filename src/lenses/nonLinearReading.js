import * as d3 from 'd3'
import { docX, fontSizeCalculator, calculatePopUpPosition } from '../helper/helper'
import ReactDOMServer from 'react-dom/server';
import NonLinearComponent from './components/nonLinear'
import jRes from '../data/res.json'
import * as Scroll from 'react-scroll'

export const NonLinearReading = (canvasProperties, documents, clusters, groups, closeOpenLenses) => {
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
        .attr("class", "nonLinearIconContainer")
        .append("i")
        .attr("class", "nonLinearIcon fas fa-exchange-alt")

    nonLinearRectDiv.append("div")
        .attr("class", "nonLinearTitleContainer")
        .text(doc => {
            if (doc.title.length > 50) {
                return doc.title.substring(0, 50) + " ..."
            } else {
                return doc.title.substring(0, 50)
            }
        })
        .attr("style", "font-size:" + fontSizeCalculator((barWidth - barMargin) * 8 / 9, t_x * t_z, 54) + "px")

    nonLinearRectDiv.append("div")
        .attr("class", "nonLinearCover")


    d3.selectAll(".nonLinearCover")
        .on("mouseover", (event, doc) => {
            NonLinearReadingOver(doc, canvasProperties, documents, clusters, groups, closeOpenLenses)
        })
}

export const NonLinearReadingOver = (doc, canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    // api calls
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    let lensFrameSize = 2
    var canvasSVG = d3.select(".canvasSVG")
    let docIndex = documents.findIndex(item => {
        return doc._id == item._id
    })
    let doc_x = docX(doc, barWidth, barMargin, groups, clusters)
    let doc_y = docIndex < n_z ? (docIndex) * (t_z + margin) : docIndex < n_z + n_x ? n_z * (t_z + margin) + (docIndex - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (docIndex - n_z - n_x) * (t_z + margin)
    let popUpWidth = width / lensFrameSize
    let popUpHeight = height / lensFrameSize
    let { popUpX, popUpY } = calculatePopUpPosition(doc_x + barWidth / 2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)


    d3.selectAll(".docElement")
        .filter(item => {
            return item._id != doc._id
        })
        .attr("opacity", "0.3")

    canvasSVG.selectAll(".nonLinearPopUp").remove()

    let nonLinearPopUp = canvasSVG.append("foreignObject")
        .attr("class", "nonLinearPopUp to_be_closed")

    nonLinearPopUp
        .attr("x", popUpX + popUpWidth / 2)
        .attr("y", popUpY + popUpHeight / 2)
        .transition()
        .attr("width", popUpWidth)
        .attr("height", popUpHeight)
        .attr("x", popUpX)
        .attr("y", popUpY)

    nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties)
}

export const nonLinearHTMLandEvent = ( closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions = [], loading = false, expanded=false, showPDF=false) => {
    var canvasSVG = d3.select(".canvasSVG")
    let nonLinearPopUp = canvasSVG.select(".nonLinearPopUp")
    let tmpDiv = document.createElement("div")
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    tmpDiv.innerHTML = ReactDOMServer.renderToString(
        <NonLinearComponent
            doc_={doc}
            parsedBody={jRes}
            loading={loading}
            suggestions={suggestions}
            showPDF={showPDF}
        />
    )
    nonLinearPopUp.html(tmpDiv.innerHTML)
    // events
    nonLinearPopUp.selectAll(".nonLinearSpanOfSentence").on("click", (e) => {
        // let sentenceId = e.target.id
        // let sentenceContent = e.target.innerHTML
        
        suggestions = [{
            'type': 'sentenceInP',
            'tag': 'span',
            'content': "The Web is the largest information source available on the planet and it's growing day by day [32] .",
            'divId': 0,
            'sentenceId': 0,
            'position': 0.0
        },
        {
            'type': 'sentenceInP',
            'tag': 'span',
            'content': 'References [5,10] provide comprehensive surveys on data sources used for QE.',
            'divId': 0,
            'sentenceId': 13,
            'position': 0.037037037037037035
        },
        {
            'type': 'sentenceInP',
            'tag': 'span',
            'content': 'Wikipedia is freely available and is the largest multilingual online encyclopedia on the web, where articles are regularly updated and new articles are added by a large number of web users.',
            'divId': 5,
            'sentenceId': 114,
            'position': 0.3247863247863248
        },
        {
            'type': 'sentenceInP',
            'tag': 'span',
            'content': 'WordNet is a large lexicon database of words in the English language.',
            'divId': 0,
            'sentenceId': 31,
            'position': 0.08831908831908832
        },
        {
            'type': 'sentenceInP',
            'tag': 'span',
            'content': 'The usefulness of these terms is determined by considering multiple sources of information.',
            'divId': 4,
            'sentenceId': 103,
            'position': 0.2934472934472934
        },
        {
            'type': 'sentenceInP',
            'tag': 'span',
            'content': 'These two sources are described next.',
            'divId': 3,
            'sentenceId': 83,
            'position': 0.23646723646723647
        }]
        loading = false
        nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF)
    })

    nonLinearPopUp.selectAll(".suggestionItemClickable").on("click", (e) => {
        let id_ = e.target.attributes.positionid.value;
        var scroller = Scroll.scroller
        scroller.scrollTo("sentence_"+id_,{
            duration: 1500,
            smooth: true,
            containerId : "nonLinearBodyOfLens",
            offset : -50
        })
    })

    nonLinearPopUp.select("#nonLinearCloseIcon").on("click",()=>{
        canvasSVG.select(".to_be_closed").remove()
        closeOpenLenses()
    })

    nonLinearPopUp.select("#nonLinearExpandIcon").on("click",()=>{
        if(!expanded){
            expanded = true
            let popUpHeight = height / 1.5
            let popUpWidth = width / 1.5
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            nonLinearPopUp.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
            nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF)
        }
    })

    nonLinearPopUp.select("#nonLinearCompressIcon").on("click",()=>{
        if(expanded){
            expanded = false
            let popUpHeight = height / 2
            let popUpWidth = width / 2
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            nonLinearPopUp.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
            nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF)
        }
    })

    nonLinearPopUp.select("#pdfToggler").on("click",()=>{
        showPDF = !showPDF
        nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF)
    })
}