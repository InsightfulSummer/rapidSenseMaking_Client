import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import { textwrap } from 'd3-textwrap';
import { useSelector, useDispatch } from 'react-redux'
import { SetDimensions, sortDocuments, autoCluster, addOneCluster, fetchDocuments, ChangeSortMetric, CreateRandomLinks, dataCompeleting } from '../redux/actions/actions'
import { hexToRgbA, linkPathGenerator } from '../helper/helper'

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
    const [activeMainLens, setActiveMainLens] = useState("summary")
    const [focusedDoc, SetFocusedDoc] = useState("")

    //define your scales here ...
    let domain = ascending ? d3.extent(documents, doc => { return parseFloat(doc[sortMetric]) }).reverse() : d3.extent(documents, doc => { return parseFloat(doc[sortMetric]) })
    const widthScale = d3.scaleLinear().domain(domain).range([0.5, 1])

    const sliderDragHandler = d3.drag()
        .on("drag", function (d) {
            ToggleLensMenuOpen(false)
            SetFocusedDoc("")
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
        console.log(documents)
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
            .on("mouseover",(event,doc)=>{
                if(focusedDoc == ""){
                    docOver(activeMainLens, doc, n_z, n_x, t_z, t_x)
                }
            })
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
                if (focusedDoc == "") {
                    updateDocs()
                }
            })
            .transition()
            .attr("x", item => {
                if (item.groups != undefined && item.groups != null) {
                    // it has a group
                    let group_index = groups.findIndex(group => {
                        return group.id == item.group.id
                    })
                    return clusters.length * (barWidth + barMargin) + (group_index) * barWidth + (group_index + 1) * barMargin + 126
                } else {
                    let clusterIndex = clusters.findIndex(cluster => {
                        return cluster.id == item.cluster.id
                    })
                    return (clusterIndex) * barWidth + (clusterIndex + 1) * barMargin + 126
                }
            })
            .attr("y", (item, index) => {
                return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            })
            .attr("width", doc => {
                return barWidth - barMargin /* widthScale(doc[sortMetric]) */
            })
            .attr("height", (item, index) => {
                return index < n_z ? t_z : index < n_z + n_x ? t_x * t_z : t_z
            })
            .attr("fill", item => {
                return item.cluster.color
            })
            .attr("class", "docElement")
            .attr("opacity", (item, index) => {
                return index < n_z ? 0.65 : index < n_z + n_x ? 0.95 : 0.65
            })
            

            //here the magic begins ...
            // if(documents[0].links != undefined && focusedDoc == ""){
            //     d3.selectAll(".linkPath").remove()
            //     documents.map((doc, index)=>{
            //         if (index >= n_z && index < n_z+n_x) {
            //             doc.links.map(linkId => {
            //                 let index_ = documents.findIndex(item => {
            //                     return item._id == linkId
            //                 })
            //                 if(index_ >= n_z && index_ < n_z+n_x){
            //                     let y1 = index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            //                     let y2 = index_ < n_z ? (index_) * (t_z + margin) : index_ < n_z + n_x ? n_z * (t_z + margin) + (index_ - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index_ - n_z - n_x) * (t_z + margin)
            //                     docsContainer.append("path")
            //                         .attr("class", "linkPath")
            //                         .attr("stroke", doc.cluster.color)
            //                         .attr("fill", "none")
            //                         .attr("opacity", 1-slideHeightPorportion)
            //                         .attr("stroke-width", t_z/8)
            //                         .transition()
            //                         .attr("stroke-width", t_z/3)
            //                         .attr("d", linkPathGenerator(doc, documents[index_],barMargin, barWidth, y1+t_z/2, y2+t_z/2, height))
            //                 }
            //             })
            //         }
            //     })
            // }

            // if(documents[0].journal != undefined && focusedDoc == ""){

            //     var overviewBottomRect = docsContainer.selectAll(".overviewBottomRect").data(documents)
            //     var overviewMainRect = docsContainer.selectAll(".overviewMainRect").data(documents)
            //     var overviewJournal = docsContainer.selectAll(".overviewJournal").data(documents)
            //     var overviewPublishYear = docsContainer.selectAll(".overviewPublishYear").data(documents)

            //     overviewBottomRect.exit().remove()
            //     overviewMainRect.exit().remove()
            //     overviewJournal.exit().remove()
            //     overviewPublishYear.exit().remove()
            //     overviewBottomRect.enter()
            //         .append("rect")
            //         .merge(overviewBottomRect)
            //         .transition()
            //         .attr("width",(doc,index) => {
            //             return barWidth - barMargin
            //         })
            //         .attr("height",(doc,index) => {
            //             return (index >= n_z && index < n_z+n_x) ? t_x*t_z / 5 : 0
            //         })
            //         .attr("x",(item,index)=>{
            //             if (item.groups != undefined && item.groups != null) {
            //                 // it has a group
            //                 let group_index = groups.findIndex(group => {
            //                     return group.id == item.group.id
            //                 })
            //                 return clusters.length * (barWidth + barMargin) + (group_index) * barWidth + (group_index + 1) * barMargin + 126
            //             } else {
            //                 let clusterIndex = clusters.findIndex(cluster => {
            //                     return cluster.id == item.cluster.id
            //                 })
            //                 console.log(clusterIndex)
            //                 return (clusterIndex) * barWidth + (clusterIndex + 1) * barMargin + 126
            //             }
            //         })
            //         .attr("y" , (doc,index) => {
            //             return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) + 4*t_x*t_z/5 : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            //         })
            //         .attr("stroke",(doc)=>{
            //             return doc.cluster.color
            //         })
            //         .attr("class", "overviewBottomRect")

            //     overviewMainRect.enter()
            //         .append("rect")
            //         .merge(overviewMainRect)
            //         .transition()
            //         .attr("width",(doc,index) => {
            //             return (barWidth - barMargin) / 2
            //         })
            //         .attr("height",(doc,index) => {
            //             return (index >= n_z && index < n_z+n_x) ? t_x*t_z * 4 / 5 : 0
            //         })
            //         .attr("x",(doc,index)=>{
            //             return (doc.cluster.id - 1) * barWidth + (doc.cluster.id) * barMargin + 126
            //         })
            //         .attr("y" , (doc,index) => {
            //             return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            //         })
            //         .attr("stroke",(doc)=>{
            //             return doc.cluster.color
            //         })
            //         .attr("class", "overviewMainRect")

            //     let titleWrap = textwrap()
            //         .bounds({width : barWidth-barMargin})
                
            //         overviewJournal.enter()
            //         .append("text")
            //         .merge(overviewJournal)
            //         .transition()
            //         .attr("class","overviewJournal wrap")
            //         .attr("x",(doc,index)=>{
            //             return (doc.cluster.id - 1) * barWidth + (doc.cluster.id) * barMargin + 126 + 5
            //         })
            //         .attr("y" , (doc,index) => {
            //             return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) + 9*t_x*t_z/10 : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            //         })
            //         .attr("width",barWidth-barMargin)
            //         .attr("alignment-baseline","middle")
            //         .attr("font-size",(t_x*t_z / 5 * 0.8))
            //         .attr("fill","white")
            //         .text((doc,index) => {
            //             return (index >= n_z && index < n_z+n_x) ? doc.title : ""
            //         })
                

            //     overviewPublishYear.enter()
            //         .append("text")
            //         .merge(overviewPublishYear)
            //         .transition()
            //         .attr("class","overviewPublishYear")
            //         .attr("text-anchor","end")
            //         .attr("x",(doc,index)=>{
            //             return (doc.cluster.id - 1) * barWidth + (doc.cluster.id) * barMargin + 121 + (barWidth - barMargin) / 2
            //         })
            //         .attr("y" , (doc,index) => {
            //             return index < n_z ? (index) * (t_z + margin) : index < n_z + n_x ? n_z * (t_z + margin) + (index - n_z) * (t_x * t_z + margin) + 4*t_x*t_z/10 : n_z * (t_z + margin) + n_x * (t_x * t_z + margin) + (index - n_z - n_x) * (t_z + margin)
            //         })
            //         .attr("font-size", (t_x*t_z*4 / 5 * 0.8))
            //         .attr("fill","white")
            //         .attr("alignment-baseline","middle")
            //         .text((doc,index) => {
            //             return (index >= n_z && index < n_z+n_x) ? doc.publishYear : ""
            //         })
            // }

            if(focusedDoc == "" && activeMainLens == "summary"){
                let summaryRect = docsContainer.selectAll(".summaryRect").data(documents)
                summaryRect.exit().remove()
                summaryRect.enter()
                    .append("rect")
                    .merge(summaryRect)
                    .transition()
                    .attr("class","summaryRect")
                    .attr("width", (doc,index) => {
                        return barWidth - barMargin
                    })
                    .attr("height", (doc,index)=>{
                        return (index >= n_z && index < n_z + n_x) ? t_x * t_z : 0
                    })
                    .attr("fill", "red")
                    .attr("x" , (item,index)=>{
                        if (index >= n_z && index < n_z + n_x) {
                            if (item.groups != undefined && item.groups != null) {
                                // it has a group
                                let group_index = groups.findIndex(group => {
                                    return group.id == item.group.id
                                })
                                return clusters.length * (barWidth + barMargin) + (group_index) * barWidth + (group_index + 1) * barMargin + 126
                            } else {
                                let clusterIndex = clusters.findIndex(cluster => {
                                    return cluster.id == item.cluster.id
                                })
                                return (clusterIndex) * barWidth + (clusterIndex + 1) * barMargin + 126
                            }
                        } else {
                            return 0
                        }
                    })
            }

    }

    const docOver = (activeLens , doc, n_z, n_x, t_z, t_x) => {
        let barWidth = (width - 125 - (clusters.length * barMargin)) / clusters.length
        var docsContainer = d3.select(".docsContainer")
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
        console.log("total: ", total)
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


    return (
        <div id="mainCanvas_2">

        </div>
    )
}

export default MainSection