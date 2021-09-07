import * as d3 from 'd3'
import ReactDOMServer from 'react-dom/server'
import WordCloud from 'wordcloud'
import {
    docX, fontSizeCalculator, calculatePopUpPosition, hexToRgbA
} from '../helper/helper'
import OverviewComponent from './components/overviewComponent'

export const overviewLens = (canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    var docsContainer = d3.select(".docsContainer")

    let overviewRect = docsContainer.selectAll(".overviewRect").data(documents)
    overviewRect.exit().remove()
    overviewRect = overviewRect.enter()
        .append("foreignObject")
        .merge(overviewRect)
        .attr("class", "overviewRect")

    overviewRect
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

    overviewRect.selectAll(".overviewRectDiv").remove()
    let overviewRectDiv = overviewRect
        .append("xhtml:div")
        .attr("class", "overviewRectDiv")

    overviewRectDiv.append("div")
        .attr("class", "overviewRectDivIconContainer")
        .append("i")
        .attr("class", "overviewIcon fas fa-info")

    let overviewRectDivMainContainer = overviewRectDiv.append("div")
        .attr("class", "overviewRectDivMainContainer")

    overviewRectDivMainContainer.append("div")
        .attr("class", "overviewRectTitleContainer")
        .text(doc => {
            if (doc.title.length > 40) {
                return doc.title.substring(0, 40) + " ..." 
            } else {
                return doc.title.substring(0, 40)
            }
        })
        .attr("style", "font-size:" + fontSizeCalculator((barWidth-barMargin)*2/3, t_x*t_z*3/5,44 )+"px")

    overviewRectDivMainContainer.append("div")
        .attr("class", "overviewRectJournalContainer")
        .text(doc => doc.publisher)
        .attr("style", doc => "font-size:" + fontSizeCalculator((barWidth-barMargin)*1.2/3, t_x*t_z*2/5,doc.publisher.length )+"px")

    let overviewRectDivDateContainer = overviewRectDiv.append("div")
        .attr("class", "overviewRectDivDateContainer")
    // publication date needs more attention ... it should more systematic and uniformed ...    
    overviewRectDivDateContainer.append("span")
        .text(doc => doc.publishYear.substring(0,2))
        .attr("class","overviewRectDivDateFirstSpan")
        .attr("style", "font-size:" + fontSizeCalculator((barWidth-barMargin)*1.5/8, t_x*t_z, 2 )/2+"px")

    overviewRectDivDateContainer.append("span")
        .text(doc => doc.publishYear.substring(2,4))
        .attr("style", "font-size:" + fontSizeCalculator((barWidth-barMargin)*1.5/8, t_x*t_z, 2 )+"px")

    overviewRectDiv.append("div").attr("class","overviewCover")

    d3.selectAll(".overviewCover").on("mouseover", (event, doc)=>{
        overviewOver(doc, canvasProperties, documents, clusters, groups, closeOpenLenses)
    })
}

export const overviewOver = (doc, canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
    var canvasSVG = d3.select(".canvasSVG")
    let docIndex = documents.findIndex(item => {
        return doc._id == item._id
    })
    let lensFrameSize = 2.5
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

    canvasSVG.selectAll(".overviewPopup").remove()

    let overviewPopup = canvasSVG.append("foreignObject")
        .attr("class", "overviewPopup to_be_closed")
    
    overviewPopup
        .attr("x", popUpX + popUpWidth / 2)
        .attr("y", popUpY + popUpHeight / 2)
        .transition()
        .attr("width", popUpWidth)
        .attr("height", popUpHeight)
        .attr("x", popUpX)
        .attr("y", popUpY)

    overviewHTMLandEvent(doc, canvasProperties, documents, clusters, groups, closeOpenLenses)
}

export const overviewHTMLandEvent = (doc, canvasProperties, documents, clusters, groups, closeOpenLenses) => {
    var canvasSVG = d3.select(".canvasSVG")
    let overviewPopup = canvasSVG.select(".overviewPopup")
    let tmpDiv = document.createElement("div")
    var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties

    // scales 
    const referenceScale = d3.scaleLinear().domain(d3.extent(documents, doc => doc.references.length)).range([60,100])
    const publishYearScale = d3.scaleLinear().domain(d3.extent(documents, doc => (parseInt(doc["publishYear"])))).range([0,92])

    tmpDiv.innerHTML = ReactDOMServer.renderToString(
        <OverviewComponent 
            doc={doc}
            publishYearRange={d3.extent(documents, doc => (parseInt(doc["publishYear"])))}
            refR={referenceScale(doc.references.length)}
            publishYearMargin={publishYearScale(doc.publishYear)}
        />
    )
    overviewPopup.html(tmpDiv.innerHTML)
    // events
    overviewPopup.on("mouseenter", ()=>{
        // prepare keywords
        let keywordsList = []
        let length_ = doc.keywords.length
        let maxFont = 30; let minFont = 15;
        doc.keywords.map((kw,index) => {
            keywordsList.push([kw, Math.ceil(((length_-index)/length_)*(maxFont - minFont) + minFont)])
        })
        setTimeout(()=>{
            WordCloud(document.getElementById("overviewComponent_wordCloudContainer"), {
                list : keywordsList,
                minRotation: -45,
                maxRotation : 45,
                rotationSteps: 2,
                color: (w,i)=>{
                    switch (i%3) {
                        case 0:
                            return doc.cluster.color;
                        case 1:
                            return "#252525"
                        case 2:
                            return "#441f74"
                        default:
                            return doc.cluster.color;
                    }
                },
                shrinkToFit : true,
                gridSize:(maxFont+minFont)/2,
                backgroundColor: hexToRgbA("#fff", 0.85)
            })
        } , 350)
    })

    overviewPopup.selectAll(".overviewComponent_closeIconContainer").on("click", () => {
        canvasSVG.select(".to_be_closed").remove()
        closeOpenLenses();
    })
}