import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import * as cloud from 'd3-cloud'
import { useSelector, useDispatch } from 'react-redux'
import { SetDimensions, sortDocuments, autoCluster, addOneCluster, fetchDocuments, ChangeSortMetric, CreateRandomLinks, dataCompeleting } from '../redux/actions/actions'
import { calculatePopUpPosition, docX, fontSizeCalculator, hexToRgbA, linkPathGenerator } from '../helper/helper'
import { summaryLens, summaryLensOver, NonLinearReading, NonLinearReadingOver } from '../lenses/index'


const MainSection = () => {

    const { width, height, documents, sortMetric, ascending, clusters, sortingMetrics, groups } = useSelector(state => ({
        width: state.canvasReducer.width,
        height: state.canvasReducer.height,
        documents: state.dataReducer.documents,
        sortMetric: state.interactionReducer.sortMetric,
        ascending: state.interactionReducer.ascending,
        clusters: state.dataReducer.clusters,
        sortingMetrics: state.interactionReducer.sortingMetrics,
        groups : state.dataReducer.groups
    }))

    const [z, setZ] = useState(0)
    const [slideHeightPorportion, setSliderHeightPorportion] = useState(1 / 2)
    const [margin, setMargin] = useState(5)
    const [steps, setSteps] = useState([])
    const [barMargin, setBarMargin] = useState(10)
    const [topMargin, setTopMargin] = useState(80)
    const [bottomMargin, setBottomMargin] = useState(20)
    const [rightMargin, setRightMargin] = useState(80)
    const [cardinality, setCardinality] = useState(10)
    const [sortingInCanvas, ToggleSortingInCanvas] = useState(false)
    const [slideBarMinimum, setSlideBarMinimum] = useState(9) // this maximum and minimum values can be changed based on the lense used in the application
    const [slideBarMaximum, setSlideBarMaximum] = useState(80)// this maximum and minimum values can be changed based on the lense used in the application
    const [isLensMenuOpen, ToggleLensMenuOpen] = useState(false)
    const [activeMainLens, setActiveMainLens] = useState("nonLinearReading")
    const [focusedDoc, SetFocusedDoc] = useState("")
    const [lensFrameSize, SetLensFrameSize] = useState(3)
    const [docOverParams, SetDocOverParams] = useState(null)
    //define your scales here ...
    let domain = ascending ? d3.extent(documents, doc => { return parseFloat(doc[sortMetric]) }).reverse() : d3.extent(documents, doc => { return parseFloat(doc[sortMetric]) })
    const widthScale = d3.scaleLinear().domain(domain).range([0.5, 1])
    const referenceScale = d3.scaleLinear().domain(d3.extent(documents, doc => (parseInt(doc["citing"])))).range([0,100])
    const citationScale = d3.scaleLinear().domain(d3.extent(documents, doc => (parseInt(doc["cited"])))).range([0,100])
    const relevancyScaler = d3.scaleLinear().domain([0,10]).range([20,100])

    const sliderDragHandler = d3.drag()
        .on("drag", function (d) {
            ToggleLensMenuOpen(false)
            SetFocusedDoc("")
            d3.selectAll(".to_be_closed").remove()
            let barHeight = parseInt(d3.select(this).attr("height"))
            if (d.y > 0 && d.y + barHeight < height) {
                d3.select(this)
                    .attr("y", (d.y))

                d3.select(".slideBody")
                    .attr("y", d.y)

                setZ(d.y / height)
            }
        })

    const dispatch = useDispatch()

    const getDimensions = () => {
        let mainCanvas = document.getElementById("mainCanvas_2")
        let { width, height } = getComputedStyle(mainCanvas)
        width = width.slice(0, -2)
        height = height.slice(0, -2)
        dispatch(SetDimensions(width - (rightMargin), height - (topMargin + bottomMargin)))
    }

    const closeOpenLenses = () => {
        var canvasSVG = d3.select(".canvasSVG")
        canvasSVG.selectAll(".to_be_closed").remove()
        updateDocs()
    }

    const changeLensFrameSize = (expand=true, docOverParams) => {
        if (expand) {
            if(lensFrameSize == 3){
                SetDocOverParams(docOverParams)
                SetLensFrameSize(2)
            } else {
                SetDocOverParams(docOverParams)
                SetLensFrameSize(1.5)
            }
        } else {
            if(lensFrameSize == 1.5){
                SetDocOverParams(docOverParams)
                SetLensFrameSize(2)
            } else {
                SetDocOverParams(docOverParams)
                SetLensFrameSize(3)
            }
        }
    }

    const resizeLens = () => {
        // we have to run doc over here some how having all the parameters of its function ...
        if (docOverParams != null) {
            let {doc, n_z, n_x, t_z, t_x} = docOverParams
            console.log(lensFrameSize)
            docOver(activeMainLens, doc, n_z, n_x, t_z, t_x)
        }
    }

    const loadSVG = () => {
        d3.select("#mainCanvas_2")
            .select("svg")
            .remove()


        let canvas = d3.select("#mainCanvas_2")
            .append("svg")
            .attr("width", width + (rightMargin))
            .attr("height", height + (topMargin + bottomMargin))
            .attr("class", "canvasSVG")


        canvas
            .append("g")
            .attr("class", "mainContainer")
            .attr("transform", "translate(0," + topMargin + ")")

        canvas.append("g")
            .attr("class", "actionsContainer")

        // define your linear gradient here ...
        var defs = d3.select(".mainContainer")
            .append("defs")
    }

    const loadData = () => {
        dispatch(sortDocuments(sortMetric, ascending))
        dispatch(CreateRandomLinks())
        dispatch(autoCluster(3))
        dispatch(dataCompeleting())
    }

    const loadSlider = () => {
        var slider = d3.select(".mainContainer")
            .append("g")
            .attr("class", "slideContainer")

        updateSlider()
    }

    const updateSlider = () => {
        var slider = d3.select(".slideContainer")
        var slideBody = slider.selectAll(".slideBody")
        var slideController = slider.selectAll(".slideController")
        var slideControllerText = slider.selectAll(".slideControllerText")


        d3.selectAll("#slideBodyGradient").remove()
        var slideBodyGradient = d3.select("defs")
            .append("linearGradient")
            .attr("id", "slideBodyGradient")   

        var stops = slideBodyGradient.selectAll("stop")
            .data(clusters)

        stops.exit().remove()

        slideBodyGradient.append("stop")
            .attr("offset","0%")
            .attr("stop-color","#e6e6e6")   

        stops.enter()
            .append("stop")
            .merge(stops)
            .transition()
            .attr("offset", (item, index) => {
                return ((index + 1) / clusters.length) * 100 - (1/clusters.length*50) + "%"
            })
            .attr("stop-color", item => {
                return hexToRgbA(item.color, 0.25)
            })

        slideBodyGradient.append("stop")
            .attr("offset","100%")
            .attr("stop-color","#e6e6e6")   

        slideBody.remove()
        slideController.remove()
        slideControllerText.remove()

        slideBody = slider.append("rect")
            .attr("width", width-(rightMargin))
            .attr("x", 105)
            .attr("fill", "url('#slideBodyGradient')")
            .attr("class", "slideBody")
            .merge(slideBody)
            .attr("y", z * height)
            .attr("height", height * slideHeightPorportion)

        slideController = slider.append("rect")
            .attr("width", 55)
            .attr("x", 0)
            .attr("fill", "#737373")
            .attr("class", "slideController")
            .merge(slideController)
            .attr("y", z * height)
            .attr("height", height * slideHeightPorportion)

        slideControllerText = slider.append("text")
            .attr("class", "slideControllerText")
            .attr("x", 55 / 2)
            .attr("y", (z * height) + (height * slideHeightPorportion / 2))
            .text(Math.ceil(Math.pow(slideHeightPorportion, 2) * 100) + "%")

        slider.append("text")
            .attr("class" , "fa slideControllerText")
            .attr("id", "lensMenuIcon_")
            .attr("x", 55 / 2)
            .attr("y", (z * height) + (height * slideHeightPorportion) - (height * slideHeightPorportion / 9))
            .attr("cursor", "pointer")
            .text("\uf0c9")
            .on("click", ()=>{
                ToggleLensMenuOpen(!isLensMenuOpen)            
            })
        sliderDragHandler(slideController)

        slideController.on("wheel", (event) => {
            if (event.deltaY < 0 && Math.pow(slideHeightPorportion, 2) * 100 > slideBarMinimum) {
                // mouse wheel up
                setSliderHeightPorportion((slideHeightPorportion * 100 - 1) / 100)
            } else if (event.deltaY > 0 && Math.pow(slideHeightPorportion, 2) * 100 < slideBarMaximum && slideHeightPorportion + z < 1.01) {
                // mouse wheel down
                setSliderHeightPorportion((slideHeightPorportion * 100 + 1) / 100)
            }
        })

        slideBody.on("wheel", (event) => {
            if (activeMainLens == "linkLens") {
                setActiveMainLens("summary")
            } else if(activeMainLens == "summary") {
                setActiveMainLens("overview")
            } else if(activeMainLens == "overview") {
                setActiveMainLens("default")
            } else {
                setActiveMainLens("linkLens")
            }
        })
    }

    const updateLensMenu = () => {
        var mainContainer = d3.select(".mainContainer")
        mainContainer.selectAll(".lensMenuContainer").remove()
        if (isLensMenuOpen) {
            d3.selectAll(".docElement")
                .attr("opacity", "0.1")
            mainContainer.append("rect")
                .attr("height", slideHeightPorportion*height)
                .attr("class", "lensMenuContainer")
                .attr("id", "lensMenuContainer_")
                .attr("x", 60)
                .attr("y", z * height)
                .transition()
                .attr("width", width + rightMargin - 60)
                .attr("fill", "rgba(230,230,230,0.85)")
        } else {
            updateDocs()
        }
    }

    const loadDocs = () => {
        d3.select(".mainContainer")
            .append("g")
            .attr("class", "docsContainer")
        updateDocs()
    }

    const updateDocs = () => {
        var n_x = Math.floor(Math.pow(slideHeightPorportion, 2) * documents.length)
        var n_z = Math.floor((z / (1 - slideHeightPorportion)) * (documents.length - n_x))
        let t_x = Math.pow((1 / slideHeightPorportion), 2) // thickness of each element within the sliding window
        let t_z = (height - documents.length * margin) / (t_x * n_x + (documents.length - n_x)) // thickness of each element outisde of the sliding window
        
        var docsContainer = d3.select(".docsContainer")

        var newElements = docsContainer.selectAll(".docElement")
            .data(documents)

        newElements.exit().remove()
        let barWidth = (width - 125 - (clusters.length * barMargin)) / clusters.length
        newElements
            .enter()
            .append("rect")
            .merge(newElements)
            // .on("mouseover",(event,doc)=>{
            //     if(focusedDoc == ""){
            //         docOver(activeMainLens, doc, n_z, n_x, t_z, t_x)
            //     }
            // })
            .on("click", (event, doc)=>{
                if (focusedDoc != "") {
                    if (focusedDoc == doc._id) {
                        SetFocusedDoc("");
                        updateDocs()
                    } else {
                        SetFocusedDoc(doc._id)
                        docOver(activeMainLens, doc, n_z, n_x, t_z, t_x)
                    }
                } else {
                    SetFocusedDoc(doc._id)
                    docOver(activeMainLens, doc, n_z, n_x, t_z, t_x)
                }
            })
            .on("mouseout", () => {
                if (focusedDoc == "" && activeMainLens == "linkLens") {
                    updateDocs()
                }
            })
            .transition()
            .attr("x", item => docX(item, barWidth, barMargin, groups, clusters))
            .attr("y", (item, index) => {
                return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            })
            .attr("width", doc => {
                return barWidth - barMargin /* widthScale(doc[sortMetric]) */
            })
            .attr("height", (item, index) => {
                return (index >= n_z && index < n_z+n_x && (activeMainLens == "overview")) ? 0 : index < n_z ? t_z : index < n_z + n_x ? t_x * t_z : t_z 
            })
            .attr("fill", item => {
                return item.cluster.color
            })
            .attr("class", "docElement")
            .attr("opacity", (item, index) => {
                return index < n_z ? 0.65 : index < n_z + n_x ? 0.95 : 0.65
            })

            let canvasProps = {
                barWidth,
                barMargin,
                t_x,
                t_z,
                n_x,
                n_z,
                margin,
                rightMargin,
                topMargin,
                width,
                height,
                lensFrameSize
            }
            // switch (activeMainLens) {
            //     case "linkLens":
            //         linkLense(n_x,n_z,t_x,t_z,barWidth)
            //         break;
            //     case "summary":
            //         summaryLens(n_x,n_z,t_x,t_z,barWidth)
            //         break;
            //     case "overview":
            //         overviewLens(n_x,n_z,t_x,t_z,barWidth)
            //         break;
            //     default:
            //         break;
            // }
            // summaryLens(canvasProps, focusedDoc, documents, clusters, groups, activeMainLens, closeOpenLenses, changeLensFrameSize)
            // linkLense(n_x,n_z,t_x,t_z,barWidth)
            // overviewLens(n_x,n_z,t_x,t_z,barWidth)
            NonLinearReading(canvasProps, documents, clusters, groups, closeOpenLenses)
    }

    const docOver = (activeLens , doc, n_z, n_x, t_z, t_x) => {
        let barWidth = (width - 125 - (clusters.length * barMargin)) / clusters.length
        var docsContainer = d3.select(".docsContainer")
        var canvasSVG = d3.select(".canvasSVG")
        let docIndex, doc_x, doc_y, popUpWidth, popUpHeight
        let canvasProps = {
            barWidth,
            barMargin,
            t_x,
            t_z,
            n_x,
            n_z,
            margin,
            rightMargin,
            topMargin,
            width,
            height,
            lensFrameSize
        }
        switch (activeLens) {
            case "linkLens":
                d3.selectAll(".linkPath")
                    .transition()
                    .attr("opacity", "0.05")
                    .attr("stroke-width", t_z/5)

                d3.selectAll(".docElement")
                    .attr("opacity", "0.3")
                d3.selectAll(".docElement")
                    .filter(item => {
                        return item._id == doc._id
                    })
                    .attr("opacity","1")

                let index = documents.findIndex(item => {
                    return doc._id == item._id
                })
                let y1 = index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
                doc.links.map(linkId => {
                    let index_ = documents.findIndex(item => {
                        return item._id == linkId
                    })
                    d3.selectAll(".docElement")
                        .filter(item => {
                            return item._id == documents[index_]._id
                        })
                        .attr("opacity","0.80")
                    let y2 = index_ < n_z ? (index_) * (t_z + margin) : index_ < n_z + n_x ? n_z * (t_z + margin) + (index_ - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index_ - n_z - n_x) * (t_z + margin)
                    docsContainer.append("path")
                        .attr("class", "linkPath")
                        .attr("stroke", doc.cluster.color)
                        .attr("fill", "none")
                        .attr("stroke-width", t_z/5)
                        .transition()
                        .attr("stroke-width", t_z/2)
                        .attr("d", linkPathGenerator(doc, documents[index_],barMargin, barWidth, y1+t_z/2, y2+t_z/2, height))
                })
                break;
        
            case "summary":
                summaryLensOver(activeLens, canvasProps, doc, documents, groups, clusters, doc.abstract, closeOpenLenses, changeLensFrameSize) // doc.abstract is going to be changed into doc.fullSummary in near future ...
                break;
            
            case "overview":
                docIndex = documents.findIndex(item => {
                    return doc._id == item._id
                })
                doc_x = docX(doc, barWidth, barMargin, groups, clusters)
                doc_y = docIndex < n_z ? (docIndex) * (t_z + margin) : docIndex < n_z + n_x ? n_z * (t_z + margin) + (docIndex - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (docIndex - n_z - n_x) * (t_z + margin)
                popUpWidth = width/2.5
                popUpHeight = popUpWidth/2
                let popUpPosition = calculatePopUpPosition(doc_x + barWidth/2, doc_y, popUpWidth, popUpHeight, width, rightMargin, topMargin, 105, height)
                d3.selectAll(".docElement")
                    .filter(item => {
                        return item._id != doc._id
                    })
                    .attr("opacity","0.3")
                // underlayer 
                canvasSVG.selectAll(".underlayerOverviewDrill").remove()
                let underlayerOverviewDrill = canvasSVG.append("rect")
                    .attr("class","underlayerOverviewDrill")
                    .transition()
                    .attr("x",popUpPosition.popUpX)
                    .attr("y",popUpPosition.popUpY)
                    .attr("width",popUpWidth)
                    .attr("height",popUpHeight)
                    .attr("fill","#fff")
                    .attr("opacity",0)
                // title
                canvasSVG.selectAll(".titleOverviewDrill").remove()
                let titleOverviewDrill = canvasSVG.append("foreignObject")
                    .attr("class", "titleOverviewDrill")
                titleOverviewDrill.transition()
                    .attr("x",popUpPosition.popUpX)
                    .attr("y",popUpPosition.popUpY + popUpHeight*0.55)
                    .attr("width", popUpWidth)
                    .attr("height", popUpHeight*0.15)
                    
                titleOverviewDrill.selectAll(".titleOverviewDrillDiv").remove()
                titleOverviewDrill.append("xhtml:div")
                        .attr("class", "titleOverviewDrillDiv")
                        .attr("style",  "font-size:"+fontSizeCalculator(popUpWidth*0.6, popUpHeight*0.15, doc.title.length)+"px; border-color:"+doc.cluster.color)
                        .text(doc.title)
                // authors
                canvasSVG.selectAll(".authorsOverviewDrill").remove()
                let authorsOverviewDrill = canvasSVG.append("foreignObject")
                    .attr("class", "authorsOverviewDrill")
                authorsOverviewDrill.transition()
                    .attr("x",popUpPosition.popUpX)
                    .attr("y",popUpPosition.popUpY + popUpHeight*0.70)
                    .attr("width", popUpWidth)
                    .attr("height", popUpHeight*0.15)
                    
                authorsOverviewDrill.selectAll(".authorsOverviewDrillDiv").remove()
                let authors = ""
                doc.authors.map((author, index) => {
                    authors += index+1 == doc.authors.length ? author.name : (author.name + " - ") 
                })
                authorsOverviewDrill.append("xhtml:div")
                        .attr("class", "authorsOverviewDrillDiv")
                        .attr("style",  "font-size:"+fontSizeCalculator(popUpWidth*0.5, popUpHeight*0.15, authors.length)+"px; border-color:"+doc.cluster.color)
                        .text(authors)
                // journal
                canvasSVG.selectAll(".journalOverviewDrill").remove()
                let journalOverviewDrill = canvasSVG.append("foreignObject")
                    .attr("class", "journalOverviewDrill")
                journalOverviewDrill.transition()
                    .attr("x",popUpPosition.popUpX)
                    .attr("y",popUpPosition.popUpY + popUpHeight*0.85)
                    .attr("width", popUpWidth)
                    .attr("height", popUpHeight*0.15)
                    
                journalOverviewDrill.selectAll(".journalOverviewDrillDiv").remove()
                journalOverviewDrill.append("xhtml:div")
                        .attr("class", "journalOverviewDrillDiv")
                        .attr("style",  "font-size:"+fontSizeCalculator(popUpWidth*0.5, popUpHeight*0.15, doc.journal.length)+"px; border-color:"+doc.cluster.color)
                        .text(doc.journal)
                // references
                canvasSVG.selectAll(".referenceOverviewDrill").remove()
                let referenceOverviewDrill = canvasSVG.append("foreignObject")
                    .attr("class", "referenceOverviewDrill")

                referenceOverviewDrill.transition()
                    .attr("x",popUpPosition.popUpX)
                    .attr("y",popUpPosition.popUpY)
                    .attr("width", popUpWidth / 5)
                    .attr("height", popUpHeight*0.55*0.5)
                referenceOverviewDrill.selectAll(".referenceOverviewDrillDiv").remove()
                referenceOverviewDrill.append("xhtml:div")
                    .attr("class", "referenceOverviewDrillDiv")
                    .attr("style","background-color:"+doc.cluster.color+"; border-top-left-radius:"+(100-referenceScale(doc["citing"]))+"%; font-size:"+fontSizeCalculator(popUpWidth / 8, popUpHeight*0.15, doc.citing.length+10)+ "px")
                    .text(doc.citing + " refernces")
                // citations
                canvasSVG.selectAll(".citationOverviewDrill").remove()
                let citationOverviewDrill = canvasSVG.append("foreignObject")
                    .attr("class", "citationOverviewDrill")
                    
                citationOverviewDrill.transition()
                    .attr("x",popUpPosition.popUpX)
                    .attr("y",popUpPosition.popUpY + popUpHeight*0.55*0.5)
                    .attr("width", popUpWidth / 5)
                    .attr("height", popUpHeight*0.25)
                citationOverviewDrill.selectAll(".citationOverviewDrillDiv").remove()
                citationOverviewDrill.append("xhtml:div")
                    .attr("class","citationOverviewDrillDiv")
                    .attr("style","background-color:"+doc.cluster.color+"; border-bottom-left-radius:"+(100-citationScale(doc["cited"]))+"%; font-size:"+fontSizeCalculator(popUpWidth / 8, popUpHeight*0.15, doc.citing.length+10)+ "px")
                    .text(doc.cited + " citations")

                // publishDate
                canvasSVG.selectAll(".publishDateOverviewDrill").remove()
                let publishDateOverviewDrill = canvasSVG.append("foreignObject")
                    .attr("class", "publishDateOverviewDrill")

                publishDateOverviewDrill.transition()
                    .attr("x",popUpPosition.popUpX + popUpWidth/5)
                    .attr("y",popUpPosition.popUpY)
                    .attr("width", popUpWidth / 5)
                    .attr("height", popUpHeight*.55)

                publishDateOverviewDrill.selectAll(".publishDateOverviewDrillDiv").remove()
                let publishDateOverviewDrillDiv = publishDateOverviewDrill.append("xhtml:div")
                    .attr("class", "publishDateOverviewDrillDiv")
                
                publishDateOverviewDrillDiv.selectAll(".publishDateOverviewP").remove()
                publishDateOverviewDrillDiv.append("xhtml:p")
                    .attr("class", "publishDateOverviewP")
                    .attr("style","font-size:"+fontSizeCalculator(popUpWidth/5, popUpHeight*.55*.2,9)+"px")
                    .text("1 January")
                publishDateOverviewDrillDiv.append("xhtml:p")
                    .attr("class", "publishDateOverviewP")
                    .attr("style","font-size:"+fontSizeCalculator(popUpWidth/5, popUpHeight*.55*.2,doc.publishYear.length)+"px; font-weight: bold")
                    .text(doc.publishYear)

                // relevancyBars
                let barOverviewDrill = canvasSVG.selectAll(".barOverviewDrill").data(doc.relevancies)
                barOverviewDrill.exit().remove()
                let barHeight = popUpHeight*15/100/(clusters.length)
                barOverviewDrill.enter()
                    .append("rect")
                    .merge(barOverviewDrill)
                    .transition()
                    .attr("class", "barOverviewDrill")
                    .attr("width", item => popUpWidth*3/5*relevancyScaler(item.score)/100)
                    .attr("x", popUpPosition.popUpX + popUpWidth*2/5)
                    .attr("y", (item,index) => index*barHeight + popUpPosition.popUpY)
                    .attr("height" , barHeight)
                    .attr("fill", item => item.cluster.color)

                // wordcloud of most frequent words

                // create a random array of 40 words with diffirent font sizes
                let fakeKeywords = []
                for(let i = 0; i<40;i++){ // it should be way more advanced in future
                    let key = {}
                    key.word = "keyWord_"+(i+1)
                    key.size = Math.floor(Math.random() * (10 - 6) + 6)
                    key.size = key.size * popUpWidth/20
                    fakeKeywords.push(key)
                }
                var cloudLayout = cloud()
                    .size([popUpWidth/2, popUpHeight*0.4])
                    .words([
                        "Hello", "world", "normally", "you", "want", "more", "words",
                        "than", "this"].map(function(d) {
                        return {text: d, size: 10 + Math.random() * 90, test: "haha"};
                      }))
                    .padding(5)
                    .rotate(function() { return (Math.random() * 2) * 90; })
                    .fontSize(function(d) { return d.size; })
                    .on("end",draw)

                cloudLayout.start()
                
                function draw(words){
                    canvasSVG.selectAll(".keywordsGroup").remove()
                    let keywordsGroup = canvasSVG.append("g")
                        .attr("class","keywordsGroup")
                    keywordsGroup.attr("transform", "translate(" + (popUpPosition.popUpX + popUpWidth*0.7) + "," + (popUpPosition.popUpY + popUpHeight*0.35) + ")")
                    let wordcloudKeywords = keywordsGroup.selectAll(".wordcloudKeywords").data(words)
                    wordcloudKeywords.exit().remove()
                    wordcloudKeywords.enter()
                        .append("text")
                        .merge(wordcloudKeywords)
                        .attr("class","wordcloudKeywords")
                        .style("font-size", function(d) { return d.size; })
                        .style("fill", doc.cluster.color)
                        .attr("text-anchor", "middle")
                        .style("font-family", "Impact")
                        .attr("transform", function(d) {
                          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                        })
                        .text(function(d) { return d.text; });
                }
                break;
            
                default:
                break;
        }
    }

    const loadAxis = (cardinality) => {
        // cardinality can be dynamic later
        d3.select(".mainContainer")
            .append("g")
            .attr("class", "axisContainer")

        d3.select(".actionsContainer")
            .append("g")
            .attr("class", "sortingContainer")

        updateSortingCenter()
        updateSteps(cardinality)
        updateAxis()
    }

    const updateSortingCenter = () => {
        var sortingContainer = d3
            .select(".sortingContainer")
            .raise()
        sortingContainer.selectAll(".sortingIcon_").remove()
        sortingContainer
            .append("text")
            .attr("x", 85)
            .attr("y", 25)
            .attr("class", "fa sortingIcon_")
            .attr("id", "sortingIconInCanvas")
            .attr("alignment-baseline", "middle")
            .on("click", () => {
                // pop up a new window and show the sorting menu
                if (sortingInCanvas) {
                    updateDocs();
                    sortingContainer.selectAll(".sortingMenu_")
                        .remove()
                    sortingContainer.selectAll(".sortingText").remove()
                    ToggleSortingInCanvas(!sortingInCanvas)
                } else {
                    d3.selectAll(".docElement")
                        .attr("opacity", 0.1)
                    // update sortingMenu
                    ToggleSortingInCanvas(!sortingInCanvas)
                    updateSortingMenu(true)
                }
                
            })
            .transition()
            .attr("fill", () => {
                return sortingInCanvas ? "black" : "#737373"
            })
            .attr("text-anchor", "middle")
            .attr("cursor", "pointer")
            .text("\uf885")
    }

    const updateSortingMenu = (active) => {

        if (active) {
            var sortingContainer = d3
            .select(".sortingContainer")
            .raise()
            sortingContainer.selectAll(".sortingMenu_")
                        .remove()
            sortingContainer.append("rect")
                .attr("x", 110)
                .attr("y", 40)
                .transition()
                .attr("width", 350)
                .attr("height", 25 * sortingMetrics.length + 15)
                .attr("fill", "#737373")
                .attr("class", "sortingMenu_")
                .attr("id", "sortingMenuInCanvas")

            var sortingText = sortingContainer.selectAll(".sortingText")
                .data(sortingMetrics)

            sortingText.exit().remove()

            sortingText.enter()
                .append("text")
                .attr("class", "sortingText")
                .text(item => {
                    return item.label
                })
                .merge(sortingText)
                .on("click", (event, metric)=>{
                    dispatch(ChangeSortMetric(metric.metric, metric.ascending));
                    dispatch(sortDocuments(metric.metric, metric.ascending));
                })
                .attr("font-weight", item => {
                    return (ascending == item.ascending && sortMetric == item.metric) ? "bold" : "normal"
                })
                .attr("x", item => {
                    return (ascending == item.ascending && sortMetric == item.metric) ? 135 : 120
                })
                .transition()
                .attr("fill", "#fff")
                .attr("alignment-baseline", "middle")
                .attr("y", (item, index) => {
                    return 60 + index * 25
                })

            d3.selectAll(".sortingText").raise()
        }
    }

    const updateSteps = (cardinality) => {
        let steps_ = []
        let stepMagnitude = (domain[0] - domain[1]) / (cardinality - 1)
        for (let index = 0; index < cardinality; index++) {
            steps_.push({
                label: parseInt(domain[1] + stepMagnitude * index)
            })
        }
        steps_[0].n = 0
        steps_[0].label = ascending ? steps_[0].label - 1 : steps_[0].label + 1
        steps_.slice(1).map((step, index) => {
            step.n = documents.filter(item => {
                return ascending ? item[sortMetric] > steps_[index].label && item[sortMetric] <= step.label : item[sortMetric] < steps_[index].label && item[sortMetric] >= step.label
            }).length
            step.n += steps_[index].n
        })
        steps_ = steps_.filter((item, index) => {
            return steps_.findIndex(step => {
                return step.n == item.n
            }) == index
        })
        steps_[0].label = ascending ? steps_[0].label + 1 : steps_[0].label - 1
        setSteps(steps_)
    }

    const updateAxis = () => {

        var n_x = Math.floor(Math.pow(slideHeightPorportion, 2) * documents.length)
        var n_z = Math.floor((z / (1 - slideHeightPorportion)) * (documents.length - n_x))
        let t_x = Math.pow((1 / slideHeightPorportion), 2) // thickness of each element within the sliding window
        let t_z = (height - documents.length * margin) / (t_x * n_x + (documents.length - n_x)) // thickness of each element outisde of the sliding window
        t_x = t_x * t_z

        let axisContainer = d3.select(".axisContainer")
        var axisLines = axisContainer.selectAll(".axisLines")
            .data(steps)
        var axisText = axisContainer.selectAll(".axisText")
            .data(steps)
        // there can also be a rectangle for each axis step and hovering it the docs of that range should appear brighter or so ...
        axisLines.exit().remove()
        axisText.exit().remove()


        axisLines
            .enter()
            .append("line")
            .attr("x1", 105)
            .attr("x2", width)
            .merge(axisLines)
            .attr("class", "axisLines")
            .transition()
            .attr("y1", step => {
                return step.n > n_z ? step.n > n_z + n_x ? n_z * (t_z + margin) + n_x * (t_x + margin) + (step.n - n_x - n_z) * (t_z + margin) :
                    n_z * (t_z + margin) + (step.n - n_z) * (t_x + margin) :
                    step.n * (t_z + margin)
            })
            .attr("y2", step => {
                return step.n > n_z ? step.n > n_z + n_x ? n_z * (t_z + margin) + n_x * (t_x + margin) + (step.n - n_x - n_z) * (t_z + margin) :
                    n_z * (t_z + margin) + (step.n - n_z) * (t_x + margin) :
                    step.n * (t_z + margin)
            })
            .attr("stroke", "#b6b6b6")
            .attr("stroke-dasharray", "5")


        axisText
            .enter()
            .append("text")
            .attr("x", 85)
            .attr("text-anchor", "middle")
            .merge(axisText)
            .text(step => step.label)
            .attr("class", "axisText")
            .transition()
            .attr("y", step => {
                return step.n > n_z ? step.n > n_z + n_x ? n_z * (t_z + margin) + n_x * (t_x + margin) + (step.n - n_x - n_z) * (t_z + margin) :
                    n_z * (t_z + margin) + (step.n - n_z) * (t_x + margin) :
                    step.n * (t_z + margin)
            })

    }

    const loadClusterController = () => {
        var clusterContainer = d3.select(".actionsContainer")
            .append("g")
            .attr("class", "clustersContainer")

        updateClusterController()
    }

    const updateClusterController = () => {
        d3.selectAll("#clustersGradient").remove()
        var clustersGradient = d3.select("defs")
            .append("linearGradient")
            .attr("id", "clustersGradient")

        var stops = clustersGradient.selectAll("stop")
            .data(clusters)

        clustersGradient.append("stop")
            .attr("offset","0%")
            .attr("stop-color","#e6e6e6")

        stops.exit().remove()

        var clusterController = d3.select(".clustersContainer")
        clusterController.selectAll(".clusterContainerRect").remove()

        var clusterElements = clusterController.selectAll(".clusterElement")
            .data(clusters)

        clusterElements.exit().remove()

        stops.enter()
            .append("stop")
            .merge(stops)
            .transition()
            .attr("offset", (item, index) => {
                return (((index + 1) / clusters.length) * 100) - (1/clusters.length*50) + "%"
            })
            .attr("stop-color", item => {
                return hexToRgbA(item.color, 0.45)
            })

        clustersGradient.append("stop")
            .attr("offset","100%")
            .attr("stop-color","#e6e6e6")

        let barWidth = (width - 125 - (clusters.length * barMargin)) / clusters.length

        clusterController.append("rect")
            .attr("fill", "url('#clustersGradient')")
            .attr("x", 105)
            .attr("y", 0)
            .attr("width", width - rightMargin)
            .attr("height", topMargin * 2 / 3)
            .attr("class", "clusterContainerRect")



        clusterElements.enter()
            .append("text")
            .attr("y", topMargin / 3)
            .attr("alignment-baseline", "middle")
            .on("mouseover", function (event, data) {
                d3.selectAll(".docElement")
                    .transition()
                    .attr("opacity", (item) => {
                        return item.cluster.id == data.id ? "0.9" : "0.3"
                    })
            })
            .on("mouseout", function () {
                updateDocs()
            })
            .merge(clusterElements)
            .transition()
            .attr("text-anchor", "middle")
            .attr("x", item => {
                return ((item.id - 1)*barWidth + (item.id)*barMargin + 126) + (barWidth - barMargin) / 2 
            })
            .attr("class", "clusterElement")
            .attr("fill", "#3a3a3a")
            .text(item => {
                return item.name
            })

        clusterController.selectAll(".addClusterIcon").remove()

        clusterController.append("text")
            .attr("class", "fa addClusterIcon")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("x", width + rightMargin - 25)
            .attr("y", 25)
            .attr("fill", "#3a3a3a")
            .text("\uf067")
            .on("click", function () {
                dispatch(addOneCluster())
            })

        // clusterController.append("text")
        //     .attr("class", "fa addClusterIcon")
        //     .attr("alignment-baseline", "middle")
        //     .attr("x", width + rightMargin - 60)
        //     .attr("y", 25)
        //     .attr("fill", "#3a3a3a")
        //     .text("\uf58e")
        //     .on("click", function () {
        //         dispatch(autoCluster(3))
        //     })
    }

    const loadGeneralEvents = () => {
        d3.select(document)
            .on("click", (event)=>{
                if (event.target.id != "lensMenuContainer_" && event.target.id != "lensMenuIcon_" && isLensMenuOpen) {
                    ToggleLensMenuOpen(false)
                }
            })
    }

    const configBarMargin = (activeLens) => {
        let total = (width - 165) / clusters.length
        if(total > 0) {
            switch (activeLens) {
                case "linkLens":
                    setBarMargin(Math.abs(total*0.7 / 2))
                    break;
            
                default:
                    setBarMargin(Math.abs(total*0.2 / 2))
                    break;
            }
            setTimeout(()=>{
                updateDocs();
            }, 300)
        }
    }

    useEffect(() => {
        configBarMargin(activeMainLens);
        updateDocs();
        updateSlider();
        updateClusterController();
    }, [JSON.stringify(documents), JSON.stringify(clusters)])

    useEffect(() => {
        getDimensions();
        loadData();
        setTimeout(() => {
            loadSVG();
            loadSlider();
            loadDocs();
            loadClusterController();
            loadAxis(cardinality);
            loadGeneralEvents();
        }, 250)
    }, [width, height])

    useEffect(() => {
        updateSlider();
        updateDocs();
        updateAxis();
    }, [slideHeightPorportion, z])

    useEffect(() => {
        updateSteps(cardinality);
        updateSortingMenu(sortingInCanvas);
    }, [sortMetric, ascending])

    useEffect(() => {
        updateAxis();
    }, [JSON.stringify(steps)])

    useEffect(() => {
        updateSortingCenter()
    }, [sortingInCanvas])

    useEffect(()=>{
        loadGeneralEvents()
        updateSlider() // important
        updateLensMenu()
    }, [isLensMenuOpen])

    useEffect(()=>{
        updateDocs()
    },[focusedDoc])

    useEffect(()=>{
        configBarMargin(activeMainLens);
    },[activeMainLens,width])

    useEffect(()=>{
        resizeLens()
    } , [lensFrameSize])


    return (
        <div id="mainCanvas_2">

        </div>
    )
}

export default MainSection