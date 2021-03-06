import * as d3 from 'd3'
import {
    docX,
    fontSizeCalculator,
    calculatePopUpPosition
} from '../helper/helper'
import ReactDOMServer from 'react-dom/server'
import jRes from '../data/res.json'
import SkimmingComponent from './components/skimming'
import * as Scroll from 'react-scroll'
import axios from 'axios'
import { API_ADDRESS } from '../helper/generalInfo'
import Store from '../redux/store'

export const skimmingLens = (canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    var docsContainer = d3.select(".docsContainer")
    let skimmingRect = docsContainer.selectAll(".skimmingRect").data(documents)
    skimmingRect.exit().remove()
    skimmingRect = skimmingRect.enter()
        .append("foreignObject")
        .merge(skimmingRect)
        .attr("class", "skimmingRect to_be_switched")

    skimmingRect
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

    skimmingRect.selectAll(".skimmingRectDiv").remove()
    let skimmingRectDiv = skimmingRect
        .append("xhtml:div")
        .attr("class", "skimmingRectDiv")

    skimmingRectDiv.append("div")
        .attr("class", "skimmingIconContainer")
        .append("div")
        .attr("class", "skimmingIcon")
        .attr("style","background-image :"+ `url(${require("../images/lensIcons/Skimming.png").default})`)

    skimmingRectDiv.append("div")
        .attr("class", "skimmingTitleContainer")
        .text(doc => {
            // top 3 keywords of each document instead of the title
            if (doc.title.length > 50) {
                return doc.title.substring(0, 50) + " ..." 
            } else {
                return doc.title.substring(0, 50)
            }
        })
        .attr("style", "font-size:" + fontSizeCalculator((barWidth - barMargin) * 8 / 9, t_x * t_z, 54) + "px")

    skimmingRectDiv.append("div")
        .attr("class", "skimmingCover")


    d3.selectAll(".skimmingCover")
        .on("click", (event, doc) => {
            skimmingLensOver(doc, canvasProperties, documents, clusters, groups, closeOpenLenses)
        })
}

export const skimmingLensOver = (doc, canvasProperties, documents, clusters, groups, closeOpenLenses) => {
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

    canvasSVG.selectAll(".skimmingPopUp").remove()

    let nonLinearPopUp = canvasSVG.append("foreignObject")
        .attr("class", "skimmingPopUp to_be_closed")

    nonLinearPopUp
        .attr("x", popUpX + popUpWidth / 2)
        .attr("y", popUpY + popUpHeight / 2)
        .transition()
        .attr("width", popUpWidth)
        .attr("height", popUpHeight)
        .attr("x", popUpX)
        .attr("y", popUpY)

    skimmingHTMLandEvent(closeOpenLenses, doc,  doc_x, doc_y, canvasProperties)
}

export const skimmingHTMLandEvent = (closeOpenLenses, doc, doc_x, doc_y, canvasProperties, scrollingDuration = 60000 , compressDocumentRate=2, showKeywords = true, showHeaders = false, expanded = false, showPDF = false, loading=true, parsedBody=null) => {
    var canvasSVG = d3.select(".canvasSVG")
    let skimmingPopUp = canvasSVG.select(".skimmingPopUp")
    let tmpDiv = document.createElement("div")
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    tmpDiv.innerHTML = ReactDOMServer.renderToString(
        <SkimmingComponent
            doc_={doc}
            parsedBody={parsedBody}
            scrollingDuration={scrollingDuration/1000}
            compressDocumentRate={compressDocumentRate}
            showKeywords={showKeywords}
            showHeaders={showHeaders}
            showPDF={showPDF}
            loading={loading}
        />
    )
    skimmingPopUp.html(tmpDiv.innerHTML)
    
    // events
    if (loading) {
        var formData = new FormData()
        const reqID = Store.getState().dataReducer.requestId
        formData.append('reqID', reqID)
        formData.append('docID', doc.id)
        axios.post(API_ADDRESS+"skimmingDocument", formData)
        .then(data => {
            skimmingHTMLandEvent(closeOpenLenses, doc, doc_x, doc_y, canvasProperties, scrollingDuration, compressDocumentRate, showKeywords, showHeaders, expanded, showPDF, false, data.data.parsedBody)
        })
        .catch(err => {
            console.log(err);
            alert("some error happended! please try again later.")
        })
    }
    skimmingPopUp.select("#skimmingAutoScrollIcon").on("click",()=>{ // not all devices have scroll button to do this auto scrolling systematically (e.g., laptop track pads, tablets, ...)
        var scroller = Scroll.scroller
        scroller.scrollTo("autoScrollingTarget" , {
            duration: scrollingDuration,
            smooth: 'linear',
            containerId: "skimmingBody",
            offset: -51
        })
    })

    skimmingPopUp.select("#skimmingScrollingDuration").on("click", () => {
        let d = scrollingDuration
        if (d == 30000) {
            d = 60000
        } else if (d == 60000) {
            d = 120000
        } else if (d == 120000) {
            d = 180000
        } else if (d == 180000) {
            d= 30000
        }
        skimmingHTMLandEvent(closeOpenLenses, doc, doc_x, doc_y, canvasProperties, d , compressDocumentRate, showKeywords, showHeaders, expanded, showPDF, loading, parsedBody)
    })

    skimmingPopUp.select("#skimmingCompressDocumentIcon").on("click", () => {
        let c = compressDocumentRate
        console.log(c)
        if (c == 1.5) {
            c = 2
        } else if (c == 2) {
            c = 3
        } else if (c == 3) {
            c = 1.5
        }
        skimmingHTMLandEvent(closeOpenLenses, doc , doc_x, doc_y, canvasProperties, scrollingDuration, c, showKeywords, showHeaders, expanded, showPDF, loading, parsedBody)
    })

    skimmingPopUp.select("#skimmingHighlightIcon").on("click" , () => {
        let sk = !showKeywords
        skimmingHTMLandEvent(closeOpenLenses, doc , doc_x, doc_y, canvasProperties, scrollingDuration, compressDocumentRate , sk, showHeaders, expanded, showPDF, loading, parsedBody)
    })

    skimmingPopUp.select("#skimmingShowHeadersIcon").on("click", () => {
        let sh = !showHeaders
        skimmingHTMLandEvent(closeOpenLenses, doc, doc_x, doc_y, canvasProperties, scrollingDuration, compressDocumentRate, showKeywords, sh, expanded, showPDF, loading, parsedBody)
    })

    skimmingPopUp.select("#skimmingCloseIcon").on("click", () => {
        canvasSVG.select(".to_be_closed").remove()
        closeOpenLenses()
    })

    skimmingPopUp.select("#skimmingExpandIcon").on("click", () => {
        if (!expanded) {
            expanded = true
            let popUpHeight = height / 1.5
            let popUpWidth = width / 1.5
            let { popUpX, popUpY } = calculatePopUpPosition(doc_x + barWidth / 2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            skimmingPopUp.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x", popUpX)
                .attr("y", popUpY)
            skimmingHTMLandEvent(closeOpenLenses, doc, doc_x, doc_y, canvasProperties, scrollingDuration, compressDocumentRate, showKeywords, showHeaders, expanded, showPDF, loading, parsedBody)
        }
    })

    skimmingPopUp.select("#skimmingCompressIcon").on("click", () => {
        if (expanded) {
            expanded = false
            let popUpHeight = height / 2
            let popUpWidth = width / 2
            let { popUpX, popUpY } = calculatePopUpPosition(doc_x + barWidth / 2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            skimmingPopUp.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x", popUpX)
                .attr("y", popUpY)
            skimmingHTMLandEvent(closeOpenLenses, doc, doc_x, doc_y, canvasProperties, scrollingDuration, compressDocumentRate, showKeywords, showHeaders, expanded, showPDF, loading, parsedBody)
        }
    })

    skimmingPopUp.select("#pdfToggler").on("click", () => {
        showPDF = !showPDF
        skimmingHTMLandEvent(closeOpenLenses, doc, doc_x, doc_y, canvasProperties, scrollingDuration, compressDocumentRate, showKeywords, showHeaders, expanded, showPDF, loading, parsedBody)
    })
}