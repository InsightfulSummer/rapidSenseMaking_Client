import * as d3 from 'd3'
import ReactDOMServer from 'react-dom/server'
import CompareInitialComponent from './components/compareInitialComponent'
import {
    docX, fontSizeCalculator
} from '../helper/helper'

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

    // events
    compareLensRect.selectAll("#compareTwoDocs").on("click", ()=>{
        if (windows.length != 2) {
            let tmpWindows = windows.slice(0,-1)
            setWindows(tmpWindows)
            compareLensHTMLandEvent(visualProps, tmpWindows, setWindows)
        }
    })

    compareLensRect.selectAll("#compareThreeDocs").on("click", ()=>{
        if (windows.length != 3) {
            let tmpWindows = windows; tmpWindows.push({document: null})
            setWindows(tmpWindows)
            compareLensHTMLandEvent(visualProps, tmpWindows, setWindows)
        }
    })

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
}