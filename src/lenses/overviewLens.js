import * as d3 from 'd3'
import ReactDOMServer from 'react-dom/server'
import {
    docX
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

    overviewRectDivMainContainer.append("div")
        .attr("class", "overviewRectJournalContainer")

    overviewRectDiv.append("div")
        .attr("class", "overviewRectDivDateContainer")
}