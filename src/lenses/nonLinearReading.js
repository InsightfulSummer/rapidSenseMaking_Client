import * as d3 from 'd3'
import { docX, fontSizeCalculator, calculatePopUpPosition } from '../helper/helper'
import ReactDOMServer from 'react-dom/server';
import NonLinearComponent from './components/nonLinear'
import jRes from '../data/res.json'
import * as Scroll from 'react-scroll'
import axios from 'axios'
import { API_ADDRESS } from '../helper/generalInfo'
import Store from '../redux/store'

export const NonLinearReading = (canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    var docsContainer = d3.select(".docsContainer")
    let nonLinearRect = docsContainer.selectAll(".nonLinearRect").data(documents)
    nonLinearRect.exit().remove()
    nonLinearRect = nonLinearRect.enter()
        .append("foreignObject")
        .merge(nonLinearRect)
        .attr("class", "nonLinearRect to_be_switched")

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
    nonLinearRectDiv.append("div")
        .attr("class", "nonLinearIconContainer")
        .append("div")
        .attr("class", "nonLinearIcon")
        .attr("style","background-image :"+ `url(${require("../images/lensIcons/HyperSimilarity.png").default})`)

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
        .on("click", (event, doc) => {
            NonLinearReadingOver(doc, canvasProperties, documents, clusters, groups, closeOpenLenses)
        })
}

export const NonLinearReadingOver = (doc, canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    // api calls
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    let lensFrameSize = 2
    var canvasSVG = d3.select(".canvasSVG")
    let docIndex = documents.findIndex(item => {
        return doc.id == item.id
    })
    let doc_x = docX(doc, barWidth, barMargin, groups, clusters)
    let doc_y = docIndex < n_z ? (docIndex) * (t_z + margin) : docIndex < n_z + n_x ? n_z * (t_z + margin) + (docIndex - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (docIndex - n_z - n_x) * (t_z + margin)
    let popUpWidth = width / lensFrameSize
    let popUpHeight = height / lensFrameSize
    let { popUpX, popUpY } = calculatePopUpPosition(doc_x + barWidth / 2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)


    d3.selectAll(".docElement")
        .filter(item => {
            return item.id != doc.id
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

export const nonLinearHTMLandEvent = (closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions = [], loading = false, expanded = false, showPDF=false, showSearch=false, mainLoading=true, parsedBody=null, activeSentence=null, showSimilarDocs = false, similarDocs=[]) => {
    var canvasSVG = d3.select(".canvasSVG")
    let nonLinearPopUp = canvasSVG.select(".nonLinearPopUp")
    let tmpDiv = document.createElement("div")
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    tmpDiv.innerHTML = ReactDOMServer.renderToString(
        <NonLinearComponent
            doc_={doc}
            parsedBody={parsedBody}
            loading={loading}
            suggestions={suggestions}
            showPDF={showPDF}
            showSearch={showSearch}
            mainLoading={mainLoading}
            showSimilarDocs={showSimilarDocs}
            similarDocs={similarDocs}
            activeSentence={activeSentence}
        />
    )
    nonLinearPopUp.html(tmpDiv.innerHTML)
    // events

    // 1 - get parsed body of the document
    if (mainLoading) {
        var formData = new FormData()
        const reqID = Store.getState().dataReducer.requestId
        formData.append('reqID', reqID)
        formData.append('docID', doc.id)
        axios.post(API_ADDRESS+"skimmingDocument", formData)
        .then(data => {
            nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF, showSearch, false, data.data.parsedBody, activeSentence, showSimilarDocs, similarDocs)
        })
        .catch(err => {
            console.log(err);
            alert("some error happended! please try again later.")
        })
    }
    // 2 - find similar sentences or similar documents
    if (loading){
        // make api request here and 
        let sentence = activeSentence.sentence;
        var formData = new FormData()
        const reqID = Store.getState().dataReducer.requestId
        let topN = showSimilarDocs ? 5 : 10
        formData.append('reqID', reqID)
        formData.append('docID', doc.id)
        formData.append('sentence', sentence)
        formData.append('topN', topN)
        if (showSimilarDocs) {
            axios.post(API_ADDRESS+"hyperSimilarity/findDocs", formData)
            .then(data => {
                console.log(data.data)
                nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, false, expanded, showPDF, showSearch, mainLoading, parsedBody, activeSentence, showSimilarDocs, data.data.similarDocuments)
            })
            .catch(err => {
                console.log(err);
                alert("some error happended! please try again later.")
            })
        } else {
            axios.post(API_ADDRESS+"hyperSimilarity/findSents", formData)
            .then(data => {
                nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, data.data.similarSentences, false, expanded, showPDF, showSearch, mainLoading, parsedBody, activeSentence, showSimilarDocs, similarDocs)
            })
            .catch(err => {
                console.log(err);
                alert("some error happended! please try again later.")
            })
        }
    }

    if(activeSentence != null && activeSentence.type == "sentence clicked"){
        var scroller = Scroll.scroller
        scroller.scrollTo("sentence_" + activeSentence.sentenceId, {
            duration: 500,
            smooth: true,
            containerId: "nonLinearBodyOfLens",
            offset: -21
        })
    }
    nonLinearPopUp.selectAll(".nonLinearSpanOfSentence").on("click", (e) => {
        let activeSentenceId = e.target.attributes.id.value;
        let activeSentence_ = {
            "type" : "sentence clicked",
            "sentenceId" : activeSentenceId,
            "sentence" : e.target.innerHTML
        }
        nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, true, expanded, showPDF, showSearch, mainLoading, parsedBody, activeSentence_, showSimilarDocs, similarDocs)
    })

    nonLinearPopUp.selectAll(".suggestionItemClickable").on("click", (e) => {
        let id_ = e.target.attributes.positionid.value;
        var scroller = Scroll.scroller
        scroller.scrollTo("sentence_" + id_, {
            duration: 1500,
            smooth: true,
            containerId: "nonLinearBodyOfLens",
            offset: -50
        })
    })

    nonLinearPopUp.select("#nonLinearCloseIcon").on("click", () => {
        canvasSVG.select(".to_be_closed").remove()
        closeOpenLenses()
    })

    nonLinearPopUp.select("#nonLinearExpandIcon").on("click", () => {
        if (!expanded) {
            expanded = true
            let popUpHeight = height / 1.5
            let popUpWidth = width / 1.5
            let { popUpX, popUpY } = calculatePopUpPosition(doc_x + barWidth / 2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            nonLinearPopUp.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x", popUpX)
                .attr("y", popUpY)
            nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF, showSearch, mainLoading, parsedBody, activeSentence, showSimilarDocs, similarDocs)
        }
    })

    nonLinearPopUp.select("#nonLinearCompressIcon").on("click", () => {
        if (expanded) {
            expanded = false
            let popUpHeight = height / 2
            let popUpWidth = width / 2
            let { popUpX, popUpY } = calculatePopUpPosition(doc_x + barWidth / 2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            nonLinearPopUp.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x", popUpX)
                .attr("y", popUpY)
            nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF, showSearch, mainLoading, parsedBody, activeSentence, showSimilarDocs, similarDocs)
        }
    })

    nonLinearPopUp.select("#pdfToggler").on("click", () => {
        showPDF = !showPDF
        nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF, showSearch, mainLoading, parsedBody, activeSentence, showSimilarDocs, similarDocs)
    })

    nonLinearPopUp.select("#nonLinearSearchFuncIcon").on("click", (e) => {
        // get the value of the search input
        let inputValue = document.getElementById("nonLinearSearchInput").value
        // valide the input : 1- if it is not empty  2- if it is more than a word ...
        if (inputValue != "") {
            let activeSentence_ = {
                "type" : "term searched",
                "sentence" : inputValue
            }
            nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, true, expanded, showPDF, showSearch, mainLoading, parsedBody, activeSentence_, showSimilarDocs, similarDocs)
        }
    })

    nonLinearPopUp.select("#nonLinearSearchIcon").on("click",(e)=>{
        showSearch = !showSearch
        nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF, showSearch, mainLoading, parsedBody, null, showSimilarDocs, similarDocs)
    })

    nonLinearPopUp.select("#nonLinearFindDocsIcon").on("click", ()=>{
        nonLinearHTMLandEvent(closeOpenLenses, doc_x, doc_y, doc, canvasProperties, suggestions, loading, expanded, showPDF, showSearch, mainLoading, parsedBody, activeSentence, !showSimilarDocs, similarDocs)
    })

    nonLinearPopUp.selectAll(".similarDocItem").on("click", (e)=>{
        let docID = e.target.attributes.id.value;
        var documents = Store.getState().dataReducer.documents
        var clusters = Store.getState().dataReducer.clusters
        var groups = Store.getState().dataReducer.groups
        var doc = documents.find(doc => {
            return doc.id == docID
        })
        NonLinearReadingOver(doc, canvasProperties, documents, clusters, groups, closeOpenLenses)
    })
}