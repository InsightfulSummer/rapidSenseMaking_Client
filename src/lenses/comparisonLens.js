import * as d3 from 'd3'
import ReactDOMServer from 'react-dom/server'
import CompareInitialComponent from './components/compareInitialComponent'
import CompareMainComponent from './components/compareMainComponent'
import {
    docX, fontSizeCalculator, hexToRgbA
} from '../helper/helper'
import WordCloud from 'wordcloud'
import jRes from '../data/res.json'


export const compareLens = (visualProps, canvasProperties, documents, clusters, groups, compareLensOpen, windows, setWindows) => {
    var canvasSVG = d3.select(".canvasSVG")
    canvasSVG.selectAll(".compareLensRect").remove();
    d3.select(".to_be_closed").remove()
    if (compareLensOpen) {
        let {lensWidth, lensHeight, lensX, lensY} = visualProps
        canvasSVG.append("foreignObject")
            .attr("width",lensWidth)
            .attr("x", lensX)
            .attr("y", lensY)
            .attr("class", "compareLensRect to_be_switched")
            // .transition()
            .attr("height", lensHeight)
        // modifying document elements ...
        var { barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height } = canvasProperties
        var docsContainer = d3.select(".docsContainer")
        let compareRect = docsContainer.selectAll(".compareRect").data(documents)
        compareRect.exit().remove()
        compareRect = compareRect.enter()
            .append("foreignObject")
            .merge(compareRect)
            .attr("class", "compareRect to_be_switched")
    
        compareRect
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
    
        compareRect.selectAll(".compareRectDiv").remove()
        let compareRectDiv = compareRect
            .append("xhtml:div")
            .attr("class", "compareRectDiv")

        compareRectDiv.append("div")
            .attr("class", "compareRectIconContainer")
            .append("i")
            .attr("class", "compareRectIcon fas fa-columns")
    
        compareRectDiv.append("div")
            .attr("class", "compareRectTitleContainer")
            .text(doc => {
                if (doc.title.length > 50) {
                    return doc.title.substring(0, 50) + " ..."
                } else {
                    return doc.title.substring(0, 50)
                }
            })
            .attr("style", "font-size:" + fontSizeCalculator((barWidth - barMargin) * 8 / 9, t_x * t_z, 54) + "px")
    
        compareRectDiv.append("div")
            .attr("class", "compareRectCover")
            .attr("title", doc => doc.title)

        compareLensHTMLandEvent(visualProps, windows, setWindows)
    }
}

export const compareLensHTMLandEvent = (visualProps, windows, setWindows) => {
    let compareLensRect = d3.select(".compareLensRect")
    let tmpDiv = document.createElement("div")
    tmpDiv.innerHTML = ReactDOMServer.renderToString(
        <CompareInitialComponent
            windows={windows}
        />
    )
    compareLensRect.html(tmpDiv.innerHTML)

    d3.selectAll(".compareRectCover").on("click", (event, doc)=>{
        let nullIndex_ = windows.findIndex(window => {
            return window.document == null
        })
        if (nullIndex_ != -1) {
            let tmpWindows = windows;
            tmpWindows[nullIndex_].document = doc
            setWindows(tmpWindows)
            compareLensHTMLandEvent(visualProps, tmpWindows, setWindows)
        }
    })

    compareLensRect.selectAll(".closeCompareWindowDocument").on("click", (event)=>{
        let classes = event.target.attributes.class.value.split(" ")
        let index_ = classes[classes.length-1]
        let tmpWindows = windows
        tmpWindows = tmpWindows.filter((item , index) => {
            return index != index_
        })
        tmpWindows.push({document:null})
        setWindows(tmpWindows)
        compareLensHTMLandEvent(visualProps, tmpWindows, setWindows)
    })

    compareLensRect.selectAll(".readyToCompare").on("click", ()=>{
        mainCompareHTMLandEvents(windows)
    })
}

export const mainCompareHTMLandEvents = (windows, loading=true, generalInfo=false, search=false, showPDF=false) => {
    var canvasSVG = d3.select(".canvasSVG")
    canvasSVG.selectAll(".mainCompare").remove();
    let mainCompare = canvasSVG.append("foreignObject")
        .attr("class", "mainCompare")
        .attr("width", canvasSVG.attr("width"))
        .attr("height", canvasSVG.attr("height"))

    // html
    let tmpDiv = document.createElement("div")
    tmpDiv.innerHTML = ReactDOMServer.renderToString(
        <CompareMainComponent 
            windows={windows} 
            loading={loading}
            generalInfo={generalInfo} 
            search={search}
            showPDF={showPDF}
        />
    )
    mainCompare.html(tmpDiv.innerHTML)

    // api calls here
    if (loading) {
        windows.map(window => {
            // some extra works should be done here later ...
            // but for now ...
            window.pdf = "2";
            window.parsedBody = jRes
        })
        mainCompareHTMLandEvents(windows, false)
    }

    // load wordclouds if needed
    if (generalInfo) {
        windows.map((window, index) => {
            let doc = window.document
            let keywordsList = []
            let length_ = doc.keywords.length
            let maxFont = 30; let minFont = 15;
            doc.keywords.map((kw,index) => {
                keywordsList.push([kw, Math.ceil(((length_-index)/length_)*(maxFont - minFont) + minFont)])
            })
            setTimeout(()=>{
                WordCloud(document.getElementById("pwcc"+index), {
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
    }

    // events
    mainCompare.selectAll("#closeCompareMainComponent").on("click", () => {
        canvasSVG.selectAll(".mainCompare").remove();
    })

    mainCompare.selectAll("#infoContentToggle").on("click", ()=>{
        mainCompareHTMLandEvents(windows, loading, !generalInfo)
    })

    mainCompare.selectAll("#comparisonSearch").on("click", ()=>{
        mainCompareHTMLandEvents(windows, loading, false, !search)
    })

    mainCompare.selectAll("#comparisonPDFToggle").on("click", () => {
        mainCompareHTMLandEvents(windows, loading, false, false, !showPDF)
    })
}