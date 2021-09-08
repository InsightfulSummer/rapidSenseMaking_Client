import * as d3 from 'd3'
import {fontSizeCalculator, docX, calculatePopUpPosition} from '../helper/helper'
import SummaryComponent from './components/summary'
import ReactDOMServer from 'react-dom/server';
/** 
 * By summary, we are refering to the abstractive summary created by t5  pretrained model.
 * This model should beild two summary for each document : 1- previewSummary, 2- actualSummary
 * The previewSummary is the two sentence long summary to show for each document within the slider as the preview of the summary and more concie version of the summary of a document.
 * actual summary is the 1/10 of the size of the document summary which will be displayed when a summary is hovered.
 * 
 */

export const summaryLens = (canvasProperties, focusedDoc, documents, clusters, groups, activeMainLens, updateDocs) => {
    // if(focusedDoc == ""){

        var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties

        var docsContainer = d3.select(".docsContainer")
        let summaryRect = docsContainer.selectAll(".summaryRect").data(documents)
        summaryRect.exit().remove()
        summaryRect = summaryRect.enter()
            .append("foreignObject")
            .merge(summaryRect)
            .attr("class","summaryRect to_be_switched")
            
        summaryRect
            .transition()
            .attr("width", (doc,index) => {
                return barWidth - barMargin
            })
            .attr("height", (doc,index)=>{
                return (index >= n_z && index < n_z + n_x) ? t_x * t_z : 0
            })
            .attr("x" , item => docX(item , barWidth, barMargin, groups, clusters))
            .attr("y", (doc, index) => {
                return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            })
        

        summaryRect.selectAll(".summaryRectDiv").remove()
        summaryRect
            .append("xhtml:div")
            .attr("class","summaryRectDiv")
            .attr("style","font-size:"+fontSizeCalculator(barWidth-barMargin, t_x*t_z, 204)+"px")
            .text(doc => {
                return doc.abstract.substring(0,200) + " ..."
            })
            
        d3.selectAll(".summaryRectDiv")
            .on("mouseover", (event, doc)=>{
                summaryLensOver(activeMainLens, canvasProperties, doc, documents, groups, clusters, doc.summary, updateDocs)
            })
            
    // }
}

/** 
 * The below function might be convolutionized with another lens, either it is going to be the underlying lens or the ultimate lens
 * This lens only shows a peice of text as a summary
 * It is either going to be an actualSummary of a document in the default state or --- summary of a piece of text which is the result of another lens ---
 * In the second state it is not an already processed text, therefore an API call seems necessary
 */

export const summaryLensOver = (activeLens, canvasProperties , doc, documents, groups, clusters , summary=doc.abstract, updateDocs, showAbstract, showPDF , showSlider) => {
    if (summary==doc.abstract) {
        // routine 
    } else {
        // make the api call - get the result - stop the spinner - put the result as the summary in the lens
    }
    // let barWidth = (width - 125 - (clusters.length * barMargin)) / clusters.length
    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties
    let lensFrameSize = 3
    let expanded=false
    var canvasSVG = d3.select(".canvasSVG")
    let docIndex = documents.findIndex(item => {
        return doc._id == item._id
    })
    let doc_x = docX(doc, barWidth, barMargin, groups, clusters)
    let doc_y = docIndex < n_z ? (docIndex) * (t_z + margin) : docIndex < n_z + n_x ? n_z * (t_z + margin) + (docIndex - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (docIndex - n_z - n_x) * (t_z + margin)
    let popUpWidth = width/lensFrameSize
    let popUpHeight = height/lensFrameSize
    let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
    
    d3.selectAll(".docElement")
        .filter(item => {
            return item._id != doc._id
        })
        .attr("opacity","0.3")
    
    canvasSVG.selectAll(".summaryBody").remove()

    let summaryBody = canvasSVG.append("foreignObject")
        .attr("class","summaryBody  to_be_closed to_be_resized")
    summaryBody
        .attr("x",popUpX + popUpWidth/2)
        .attr("y",popUpY + popUpHeight/2)
        .transition()
        .attr("width", popUpWidth)
        .attr("height", popUpHeight)
        .attr("x",popUpX)
        .attr("y",popUpY)

    SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF , showSlider)

    
}

export const SummaryHTMLandEvents = (doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF, showSlider) => {
    var canvasSVG = d3.select(".canvasSVG")
    let summaryBody = d3.select(".summaryBody")
    let sum_ = document.createElement('div')
    var {barWidth, barMargin, t_x, t_z, n_x, n_z, margin, rightMargin, topMargin, width, height} = canvasProperties
    sum_.innerHTML = ReactDOMServer.renderToString(<SummaryComponent 
            doc_={doc} 
            expanded={expanded} 
            showAbstract={showAbstract}
            showPDF={showPDF}
            showSlider={showSlider}
            title={"A new approach for query expansion using Wikipedia and WordNet"}
            summaryBody={`This makes information processing a big challenge and creates a vocabulary gap between user queries and indexed documents. The source of expansion terms plays a significant role in QE. However, corpus-based sources fail to establish a relationship between a word in the corpus and related words used in different communities, e.g., "senior citizen" and "elderly".Hand-built knowledge-resources-based QE extracts knowledge from textual hand-built data sources such as dictionaries, thesauruses, ontologies, and the LOD cloud (e.g., [35,44,47] ). Each such web article describes only one entity. WordNet also provides a precise and attentively assembled hierarchy of useful concepts. These features make WordNet an ideal knowledge resource for QE.Many of the articles [2,27,35,44] have used Wikipedia and WordNet separately with promising results. However, they don't produce consistent results for different types of queries (individual and phrase queries).This article proposes a novel technique named Wikipedia-WordNet based QE technique (WWQE) for query expansion that combines Wikipedia and WordNet data sources to improve retrieval effectiveness. A novel technique for query expansion named Wikipedia-WordNet-based QE technique (WWQE) is proposed that combines Wikipedia and WordNet as data sources. â€¢ Phrase Selection. We also analyzed the effect on retrieval effectiveness of the proposed technique by varying the number of expansion terms.The remainder of the article is organized as follows. In the 1960s, Moron and Kuhns [31] were the first researchers who applied QE for literature indexing and searching in a mechanized library system. Carpineto and Romano [10] reviewed major QE techniques, data sources and features in an information retrieval system. also be looked at? Reference [42] used synonyms of the initial query and assigns half the weight. The usefulness of these terms is determined by considering multiple sources of information. During experimental evaluation, their approach showed improvements in precision and recall values of 5% and 8% respectively.In almost all the aforementioned studies, CETs were taken from WordNet as synsets of initial queries. We then assigned weights to the synonyms level-wise.Wikipedia is freely available and is the largest multilingual online encyclopedia on the web, where articles are regularly updated and new articles are added by a large number of web users. Reference [25] performed an investigation using Wikipedia and retrieved all articles corresponding to the original query as a source of expansion terms for pseudo relevance feedback. It observed that for a particular query where the usual pseudo relevance feedback fails to improve the query, Wikipedia-based pseudo relevance feedback improves it significantly. Reference [46] utilized Wikipedia to categorize the original query into three types: (1) ambiguous queries (queries with terms having more than one potential meaning), (2) entity queries (queries having a specific meaning that covers a narrow topic), and (3) broader queries (queries having neither an ambiguous nor specific meaning).`}
            abstract={"Query expansion (QE) is a well-known technique used to enhance the effectiveness of information retrieval. QE reformulates the initial query by adding similar terms that help in retrieving more relevant results. Several approaches have been proposed in literature producing quite favorable results, but they are not evenly favorable for all types of queries (individual and phrase queries). One of the main reasons for this is the use of the same kind of data sources and weighting scheme while expanding both the individual and the phrase query terms. As a result, the holistic relationship among the query terms is not well captured or scored. To address this issue, we have presented a new approach for QE using Wikipedia and WordNet as data sources. Specifically, Wikipedia gives rich expansion terms for phrase terms, while WordNet does the same for individual terms. We have also proposed novel weighting schemes for expansion terms: in-link score (for terms extracted from Wikipedia) and a tf-idf based scheme (for terms extracted from WordNet). In the proposed Wikipedia-WordNet-based QE technique (WWQE), we weigh the expansion terms twice: first, they are scored by the weighting scheme individually, and then, the weighting scheme scores the selected expansion terms concerning the entire query using correlation score. The proposed approach gains improvements of 24% on the MAP score and 48% on the GMAP score over unexpanded queries on the FIRE dataset. Experimental results achieve a significant improvement over individual expansion and other related state-of-the-art approaches. We also analyzed the effect on retrieval effectiveness of the proposed technique by varying the number of expansion terms."}
    />)
    // console.log(sum_.innerHTML)
    summaryBody.html(sum_.innerHTML) 
    summaryBody.select("#summaryCloseIcon").on("click",()=>{
        canvasSVG.select(".to_be_closed").remove()
        updateDocs()
        // update the docs here ... 
        // maybe it is required to update the document once more here ...
    })
    summaryBody.select("#summaryExpandIcon").on("click",()=>{
        if(!expanded){
            lensFrameSize /= 2
            expanded = true
            let popUpHeight = height / lensFrameSize
            let popUpWidth = width / lensFrameSize
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            summaryBody.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
            SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF , showSlider)
        }
    })
    summaryBody.select("#summaryCompressIcon").on("click",()=>{
        if(expanded){
            lensFrameSize *= 2
            expanded = false
            let popUpHeight = height / lensFrameSize
            let popUpWidth = width / lensFrameSize
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            summaryBody.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
            SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF , showSlider)
        }
    })
    summaryBody.select("#toggleOriginalAbstractIcon").on("click",()=>{
        showAbstract = !showAbstract
        showPDF = false;
        SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF , showSlider)
    })
    summaryBody.select("#pdfToggler").on("click",()=>{
        showPDF = !showPDF
        SummaryHTMLandEvents(doc, expanded, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF , showSlider)
    })
    summaryBody.select("#toggleSummarySlider").on("click",() => {
        showSlider = !showSlider
        showPDF = false;
        if(!expanded){
            lensFrameSize /= 2
            expanded = true
            let popUpHeight = height / lensFrameSize
            let popUpWidth = width / lensFrameSize
            let {popUpX, popUpY} = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
            summaryBody.transition()
                .attr("width", popUpWidth)
                .attr("height", popUpHeight)
                .attr("x",popUpX)
                .attr("y",popUpY)
        }
        SummaryHTMLandEvents(doc, true, lensFrameSize, canvasProperties, doc_x, doc_y, updateDocs, showAbstract, showPDF, showSlider)
    })
}