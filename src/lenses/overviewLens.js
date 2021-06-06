import * as d3 from 'd3'

const overviewLens = (n_x, n_z, t_x, t_z, barWidth) => {
    if(documents[0].journal != undefined && focusedDoc == ""){
        var docsContainer = d3.select(".docsContainer")
        // title section
        var titleForeignObject = docsContainer.selectAll(".titleForeignObject").data(documents)
        titleForeignObject.exit().remove()
        titleForeignObject.enter()
            .append("foreignObject")
            .merge(titleForeignObject)
            .attr("class", "titleForeignObject")
            
        titleForeignObject.transition()
            .attr("width", (doc, index) => {
                return barWidth - barMargin
            })
            .attr("height", (doc, index) => {
                return (index >= n_z && index < n_z + n_x) ? t_x * t_z / 4 : 0
            })
            .attr("x", (item,) => docX(item, barWidth, barMargin, groups, clusters))
            .attr("y", (doc, index) => {
                return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) + 3 * t_x * t_z / 4 : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            })
        titleForeignObject.selectAll(".titleForeignObjectDiv").remove()
        titleForeignObject.append("xhtml:div")
            .attr("class","titleForeignObjectDiv")
            .attr("style", doc => "font-size:"+fontSizeCalculator(barWidth-barMargin, t_x*t_z/4, 64)+"px; border-color:"+doc.cluster.color)
            .text((doc,index) => (index >= n_z && index < n_z+n_x) ? doc.title.substring(0,60)+ "..." : null)

        // publish date section
        var publishDateForeignObject = docsContainer.selectAll(".publishDateForeignObject").data(documents)
        publishDateForeignObject.exit().remove()
        publishDateForeignObject.enter()
            .append("foreignObject")
            .merge(publishDateForeignObject)
            .attr("class","publishDateForeignObject")

        publishDateForeignObject.transition()
            .attr("width", (doc, index) => {
                return (barWidth - barMargin) / 4
            })
            .attr("height", (doc, index) => {
                return (index >= n_z && index < n_z + n_x) ? t_x * t_z * 3 / 4 : 0
            })
            .attr("x", (item,) => docX(item, barWidth, barMargin, groups, clusters) + (barWidth - barMargin) / 4)
            .attr("y", (doc, index) => {
                return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin): n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            })

        publishDateForeignObject.selectAll(".publishDateForeignObjectDiv").remove()
        publishDateForeignObject.append("xhtml:div")
            .attr("class", "publishDateForeignObjectDiv")
            .attr("style",doc => "font-size:"+fontSizeCalculator((barWidth - barMargin) / 4, t_x * t_z * 3 / 4, 4)+"px; color:"+doc.cluster.color)
            .text((doc,index) => (index >= n_z && index < n_z+n_x) ? doc.publishYear : null)

        // references section
        var referenceForeignObject = docsContainer.selectAll(".referenceForeignObject").data(documents)
        referenceForeignObject.exit().remove()
        referenceForeignObject.enter()
            .append("foreignObject")
            .merge(referenceForeignObject)
            .attr("class","referenceForeignObject")

        referenceForeignObject.transition()
            .attr("width", (doc, index) => {
                return (barWidth - barMargin) / 4
            })
            .attr("height", (doc, index) => {
                return (index >= n_z && index < n_z + n_x) ? t_x * t_z * 3 / 8 : 0
            })
            .attr("x", (item,) => docX(item, barWidth, barMargin, groups, clusters))
            .attr("y", (doc, index) => {
                return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin): n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            })
        referenceForeignObject.selectAll(".referenceForeignObjectDiv").remove()
        referenceForeignObject.append("xhtml:div")
            .attr("class", "referenceForeignObjectDiv")
            .attr("style",(doc)=>"background-color:"+doc.cluster.color+"; border-top-left-radius:"+(100-referenceScale(doc["citing"]))+"%; font-size:"+fontSizeCalculator((barWidth - barMargin) / 4, t_x * t_z * 2 / 8, doc.citing.length+2)+ "px") 
            .text((doc,index) => (index >= n_z && index < n_z+n_x) ? doc.citing + " R" : null)

        // citation section
        var citationForeignObject = docsContainer.selectAll(".citationForeignObject").data(documents)
        citationForeignObject.exit().remove()
        citationForeignObject.enter()
            .append("foreignObject")
            .merge(citationForeignObject)
            .attr("class", "citationForeignObject")

        citationForeignObject.transition()
            .attr("width", (doc, index) => {
                return (barWidth - barMargin) / 4
            })
            .attr("height", (doc, index) => {
                return (index >= n_z && index < n_z + n_x) ? t_x * t_z * 3 / 8 : 0
            })
            .attr("x", (item,) => docX(item, barWidth, barMargin, groups, clusters))
            .attr("y", (doc, index) => {
                return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) + t_x*t_z*3/8: n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            })

        citationForeignObject.selectAll(".citationForeignObjectDiv").remove()
        citationForeignObject.append("xhtml:div")
            .attr("class", "citationForeignObjectDiv")
            .attr("style",(doc)=>"background-color:"+doc.cluster.color+"; border-bottom-left-radius:"+(100-citationScale(doc["cited"]))+"%; font-size:"+fontSizeCalculator((barWidth - barMargin) / 4, t_x * t_z * 2 / 8, doc.citing.length+2)+ "px") // border top left radius and font - size
            .text((doc,index) => (index >= n_z && index < n_z+n_x) ? doc.cited + " C" : null)

        // bars section
        var barsGroup = docsContainer.selectAll(".barsGroup").data(documents)
        barsGroup.exit().remove()
        barsGroup.enter()
            .append("g")
            .merge(barsGroup)
            .attr("class","barsGroup")
            
        var barRect = barsGroup.selectAll(".barRect").data((doc,index) => {
            let baseX = docX(doc, barWidth, barMargin, groups, clusters)
            let baseY = index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            let shouldView = (index >= n_z && index < n_z+n_x) ? true : false
            doc.relevancies.map(item => {
                item.baseX = baseX
                item.baseY = baseY
                item.shouldView = shouldView
            })
            return doc.relevancies
        })
        barRect.exit().remove()
        var relevancyBarWidth = ((barWidth - barMargin) / 2) / clusters.length

        barRect.enter()
            .append("rect")
            .merge(barRect)
            .transition()
            .attr("class", "barRect")
            .attr("width", relevancyBarWidth)
            .attr("x", (item, index) => index*relevancyBarWidth + item.baseX + ((barWidth-barMargin) /2))
            .attr("y", (item,index) => ((100 - relevancyScaler(item.score))/100) * t_x * t_z * 3 / 4 + item.baseY)
            .attr("height" , (item, index) => item.shouldView ? relevancyScaler(item.score)/100 * t_x * t_z * 3 / 4 : 0)
            .attr("fill", item => item.cluster.color)

        // overlay section
        var overLay = docsContainer.selectAll(".overLayRect").data(documents)
        overLay.exit().remove()
        overLay.enter()
            .append("rect")
            .merge(overLay)
            .on("mouseover", (event,doc)=>{
                docOver(activeMainLens, doc, n_z, n_x, t_z, t_x)
            })
            .transition()
            .attr("width", barWidth - barMargin)
            .attr("height", (doc,index) => (index >= n_z && index < n_z+n_x) ? t_x*t_z : 0)
            .attr("x", doc => docX(doc, barWidth, barMargin, groups, clusters))
            .attr("y", (doc, index)=>{
                return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            })
            .attr("opacity", "0")
            .attr("class","overLayRect")
    }
}