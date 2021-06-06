import * as d3 from 'd3'

export const linkLense = (n_x, n_z, t_x, t_z, barWidth) => {
    if (documents[0].links != undefined && focusedDoc == "") {
        var docsContainer = d3.select(".docsContainer")
        d3.selectAll(".linkPath").remove()
        documents.map((doc, index) => {
            if (index >= n_z && index < n_z + n_x) {
                doc.links.map(linkId => {
                    let index_ = documents.findIndex(item => {
                        return item._id == linkId
                    })
                    if (index_ >= n_z && index_ < n_z + n_x) {
                        let y1 = index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
                        let y2 = index_ < n_z ? (index_) * (t_z + margin) : index_ < n_z + n_x ? n_z * (t_z + margin) + (index_ - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index_ - n_z - n_x) * (t_z + margin)
                        docsContainer.append("path")
                            .attr("class", "linkPath")
                            .attr("stroke", doc.cluster.color)
                            .attr("fill", "none")
                            .attr("opacity", 1 - slideHeightPorportion)
                            .attr("stroke-width", t_z / 8)
                            .transition()
                            .attr("stroke-width", t_z / 3)
                            .attr("d", linkPathGenerator(doc, documents[index_], barMargin, barWidth, y1 + t_z / 2, y2 + t_z / 2, height))
                    }
                })
            }
        })
    }
}