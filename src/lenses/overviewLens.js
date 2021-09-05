import * as d3 from 'd3'
import ReactDOMServer from 'react-dom/server'
import {
    docX, fontSizeCalculator
} from '../helper/helper'

export const overviewLens = (canvasProperties, documents, clusters, groups) => {
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
}