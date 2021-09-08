import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import * as cloud from 'd3-cloud'
import { useSelector, useDispatch } from 'react-redux'
import { SetDimensions, sortDocuments, autoCluster, addOneCluster, fetchDocuments, ChangeSortMetric, CreateRandomLinks, dataCompeleting } from '../redux/actions/actions'
import { calculatePopUpPosition, docX, fontSizeCalculator, hexToRgbA, linkPathGenerator } from '../helper/helper'
import { summaryLens, summaryLensOver, NonLinearReading, NonLinearReadingOver, skimmingLens, biblioLens, overviewLens, lenses } from '../lenses/index'


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
    const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight])
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
    const [activeMainLens, setActiveMainLens] = useState(lenses[lenses.length-1].name)
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

    const updateDimensions = () => {
        let mainCanvas = document.getElementById("mainCanvas_2")
        let { width, height } = getComputedStyle(mainCanvas)
        width = width.slice(0, -2)
        height = height.slice(0, -2)
        dispatch(SetDimensions(width - (rightMargin), height - (topMargin + bottomMargin)))
        window.addEventListener('resize',(event) => {
            setWindowSize([window.innerWidth, window.innerHeight])
        })
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
            // docOver(activeMainLens, doc, n_z, n_x, t_z, t_x)
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
            .attr("id", "slideBody_")
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
            let index_ = lenses.findIndex(item => {
                return item.name == activeMainLens
            })
            let newIndex;
            if (event.deltaY < 0) {
                newIndex = 0
                if (index_ == newIndex) {
                    newIndex = lenses.length - 1
                } else {
                    newIndex = index_ - 1
                } 
            } else if (event.deltaY > 0) {
                newIndex = lenses.length - 1
                if (index_ == newIndex) {
                    newIndex = 0
                } else {
                    newIndex = index_ + 1
                } 
            }
            d3.selectAll(".to_be_switched").remove()
            setActiveMainLens(lenses[newIndex].name)
        })
    }

    const updateLensMenu = () => {
        d3.selectAll(".to_be_closed").remove()
        var mainContainer = d3.select(".mainContainer")
        mainContainer.selectAll(".lensMenuContainer").remove()
        if (isLensMenuOpen) {
            d3.selectAll(".docElement")
                .attr("opacity", "0.1")
            let lensMenuContainer = mainContainer.append("g")
                .attr("class", "lensMenuContainer")
                .attr("id", "lensMenuContainer_")
            lensMenuContainer    
                .attr("x", 60)
                .attr("y", z * height)
                .attr("height", slideHeightPorportion*height)
                .transition()
                .attr("width", width - 60)
                .attr("fill", "rgba(230,230,230,0.85)")

            let lensMenuItem = lensMenuContainer.selectAll(".lensMenuItem").data(lenses)
            lensMenuItem.exit().remove()
            lensMenuItem = lensMenuItem.enter()
                .append("foreignObject")
                .merge(lensMenuItem)
                .attr("class", "lensMenuItem")

            lensMenuItem
                .attr("y", z * height)
                .attr("height" , slideHeightPorportion*height)
                .transition()
                .attr("x", (item , index) => {
                    return (width - 60)/lenses.length * index + 60
                })
                .attr("width", (width - 60)/lenses.length)

            lensMenuItem.selectAll(".lensMenuItemDiv").remove()
            let lensMenuItemDiv = lensMenuItem.append("xhtml:div")
                .attr("class",item => item.name == activeMainLens ? "activeLensMenuItemDiv" : "lensMenuItemDiv")
            
            lensMenuItemDiv.append("div")
                .attr("class", "lensMenuItemDivIcon")
                .append("i").attr("class", item => "lensMenuItemDiv_Icon "+ item.icon)

            lensMenuItemDiv.append("div")
                .attr("class", "lensMenuItemDivName")
                .text(item => item.name)

            lensMenuItemDiv.on("click", (e, item)=>{
                if (item.name != activeMainLens) {
                    d3.selectAll(".to_be_switched").remove()
                    setActiveMainLens(item.name)
                }
            })
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

            let canvasProps = {barWidth,barMargin,t_x,t_z,n_x,n_z,margin,rightMargin,topMargin,width,height,lensFrameSize}

            switch (activeMainLens) {
                case lenses[0].name:
                    summaryLens(canvasProps, focusedDoc, documents, clusters, groups, activeMainLens, updateDocs)
                    break;
                case lenses[1].name:
                    NonLinearReading(canvasProps, documents, clusters, groups, closeOpenLenses)
                    break;
                case lenses[2].name:
                    skimmingLens(canvasProps, documents, clusters, groups, closeOpenLenses)
                    break;
                case lenses[3].name:
                    biblioLens(canvasProps, documents, clusters, groups)
                    break;
                case lenses[4].name:
                    overviewLens(canvasProps, documents, clusters, groups, closeOpenLenses)
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
            // .on("mouseover", function (event, data) {
            //     d3.selectAll(".docElement")
            //         .transition()
            //         .attr("opacity", (item) => {
            //             return item.cluster.id == data.id ? "0.9" : "0.3"
            //         })
            // })
            // .on("mouseout", function () {
            //     updateDocs()
            // })
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
            // .on("click", function () {
            //     dispatch(addOneCluster())
            // })

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
                case "biblio":
                    setBarMargin(Math.abs(total*0.4 / 2))
                    break;
            
                default:
                    setBarMargin(Math.abs(total*0.2 / 2))
                    break;
            }
        }
    }

    useEffect(() => {
        configBarMargin(activeMainLens);
        updateDocs();
        updateSlider();
        updateClusterController();
    }, [JSON.stringify(documents), JSON.stringify(clusters)])

    useEffect(()=>{
        updateDimensions();
    } , [JSON.stringify(windowSize)])

    useEffect(() => {

        updateDimensions();
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
        updateSlider()
        updateLensMenu()
        configBarMargin(activeMainLens);
        setTimeout(() => {
            updateDocs()
        }, 300);
    },[activeMainLens,width, barMargin])

    useEffect(()=>{
        resizeLens()
    } , [lensFrameSize])


    return (
        <div id="mainCanvas_2">

        </div>
    )
}

export default MainSection