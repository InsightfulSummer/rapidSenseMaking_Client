import React, { useEffect } from 'react'
import * as d3 from 'd3'
import {useDispatch, useSelector} from 'react-redux'
import { scroller } from 'react-scroll'
import {SetDimensions, SetActiveDocument, UnSetActiveDocument, ChangeCardinality, SetActiveAxisRange, UnsetActiveAxisRange} from '../redux/actions/actions'
import {shuffleArray} from '../helper/helper'

const MainSection = () => {

    const dispatch = useDispatch()

    const {width, height, documents, sortMetric, activeDocumentId, cardinality, activeAxisRange} = useSelector(state => ({
        width : state.canvasReducer.width,
        height : state.canvasReducer.height,
        documents : state.dataReducer.documents,
        sortMetric : state.interactionReducer.sortMetric,
        activeDocumentId: state.interactionReducer.activeDocumentId,
        cardinality : state.interactionReducer.cardinality,
        activeAxisRange : state.interactionReducer.activeAxisRange
    }))

    let domain = d3.extent(documents, doc=>{return parseFloat(doc[sortMetric])})
    const aScale = d3.scaleLinear().domain(domain).range([0, (parseFloat(width)/2)-75])
    const bScale = d3.scaleLinear().domain(domain).range([0, (parseFloat(height)/2)*0.95])
    const rScale = d3.scaleLinear().domain(domain).range([width/35,width/160])
    const angleScale = d3.scaleLinear().domain([1 , documents.length]).range([30, 330])

    const getX = (item, index) => {
        return (width/2)+(aScale(parseFloat(item[sortMetric]))*Math.cos(angleScale(index + 1)*Math.PI/180))
    }

    const getY = (item, index) => {
        return (height/2)+(bScale(parseFloat(item[sortMetric]))*Math.sin(angleScale(index + 1)*Math.PI/180))
    }

    const getRadius = (item) => {
        return rScale(parseFloat(item[sortMetric]))
    }  

    const getDimensions = () => {
        let mainCanvas = document.getElementById("mainCanvas")
        let {width, height} = getComputedStyle(mainCanvas)
        width = width.slice(0,-2)
        height = height.slice(0,-2)
        dispatch(SetDimensions(width, height))
    }

    const loadSVG = () => {
        d3.select("#mainCanvas")
        .select("svg")
        .remove()
        d3.select("#mainCanvas")
        .append("svg")
        .attr("width", width)
        .attr("height",height)
        .attr("class", "canvasSVG")
    }

    const loadNodes = () => {

        var g = d3.select(".canvasSVG")
            .append("g")
            .selectAll("circle")
            .data(documents)
            .enter()
            .append("circle")
            .attr("class","docCircle")
            .attr("text", (item, index) => {return Math.cos(angleScale((index + 1)*Math.PI/180))})
            .attr("r", doc => {return getRadius(doc)})
            .attr("cx", ()=>{return width/2})
            .attr("cy", ()=>{return height/2})
            .attr("fill", "rgba(64, 81, 181, 0.8)")

        g.transition()
            .attr("cx", (doc, index)=>{return getX(doc, index)})
            .attr("cy", (doc, index)=>{return getY(doc, index)})
            .duration(1000)
            .delay((item, index) => {
                return index * 50
            })
    }

    const updateNodes = () => {
        d3.selectAll(".docCircle")
        .transition()
        .attr("class", doc => {
            return doc._id == activeDocumentId ? "docCircle activeDocCircle" : "docCircle"
        })
    }

    const loadAxis = (cardinality) => {
        var g = d3.select(".canvasSVG")
            .append("g")
            .attr("class", "axisContainer")

        updateAxis(cardinality)
    }

    const updateAxis = (cardinality) => {
        let steps = []
        let stepMagnitude = (domain[1]-domain[0])/(cardinality-1)
        for (let index = 0; index < cardinality; index++) {
            steps.push(domain[0] + stepMagnitude*index)
        }
        steps = steps.reverse()

        let g = d3.select(".axisContainer")

        var newEllipses = g.selectAll("axisEllipse")
            .data(steps)

        newEllipses.exit().remove()

        newEllipses.enter()
            .append("ellipse")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("rx", item=>{return aScale(item)})
            .attr("ry", item=>{return bScale(item)})
            .attr("class", "axisEllipse")
            .on("mouseover", function(event, data){
                d3.select(this)
                    .attr("class", "axisEllipse activeEllipse")

                dispatch(SetActiveAxisRange(Math.floor(data - stepMagnitude), Math.floor(data)))
            })
            .on("mouseout", function(event, data){
                d3.select(this)
                    .attr("class", "axisEllipse")
                console.log("mouseout")
                dispatch(UnsetActiveAxisRange())
            })
        steps = steps.slice(0, steps.length-1)
        var newLabels = g.selectAll("axisLabels")
            .data(steps)

        newLabels.exit().remove()

        newLabels.enter()
            .append("text")
            .attr("x", item => {return width/2 + aScale(item)})
            .attr("y", height / 2 + 30)
            .attr("text-anchor", "middle")
            .attr("class", "axisLabels")
            .attr("transform", item => {return "rotate(-45,"+(width/2 + aScale(item))+","+height / 2 + 30+")"})
            .text(item => {return Math.floor(item)})

        let upArrow = g.append("text")
            .attr("class", "fa axisIcon")
            .attr("x", width - 30)
            .attr("y", (height/2)-30)
            .text("\uf077")
        upArrow.on("click", () => {
            console.log("up arrow clicked")
            dispatch(ChangeCardinality(cardinality + 1))
        })

        let downArrow = g.append("text")
            .attr("class", "fa axisIcon")
            .attr("x", width - 30)
            .attr("y", (height/2)+45)
            .text("\uf078")
        downArrow.on("click", () => {
            dispatch(ChangeCardinality(cardinality - 1))
        })

        let axisLine = g.append("line")
            .attr("x1",width/2)
            .attr("y1",height/2)
            .attr("x2",width)
            .attr("y2",height/2)
            .attr("class", "axisLine")
    }

    const updateNodesOfAxisRange = (range) => {
        if (range) {
            d3.selectAll(".docCircle")
                .attr("fill", "rgba(64, 81, 181, 0.4)")
            d3.selectAll(".docCircle")
                .filter(item => {return parseInt(item.publishYear) >= range[0] && parseInt(item.publishYear) <= range[1]})
                .attr("fill", item => "rgba(64, 81, 181, 0.9)")
        } else {
            d3.selectAll(".docCircle")
                .attr("fill", "rgba(64, 81, 181, 0.8)")
        }
    }

    const updateAxisOfAxisRange = (range) => {
        if (range) {
            d3.selectAll(".axisLabels")
                .transition()
                .attr("font-weight" , "lighter")
            d3.selectAll(".axisLabels")
                .filter(item => {return parseInt(item) == range[0] || parseInt(item) == range[1]})
                .transition()
                .attr("font-weight", "bold")
        } else {
            d3.selectAll(".axisLabels")
                .transition()
                .attr("font-weight", "normal")
        }
    }

    const addEvents = () => {
        d3.selectAll(".docCircle")
            .on("click", function(event, document){
                if (activeDocumentId == document._id) {
                    dispatch(UnSetActiveDocument())
                } else {
                    // set active document 
                    dispatch(SetActiveDocument(document._id))
                    // scroll to this item
                    setTimeout(()=>{
                        scroller.scrollTo("document_"+document._id, {
                            duration : 1500,
                            smooth: true,
                            containerId : "listContainer",
                            offset: -15
                        })
                    } , 150)
                }
            })
    }

    const loadSortingMetric = () => {
        var g = d3.select(".canvasSVG")
            .append("g")
            .attr("class", "sortingContainer")

        var sortingIcon = g.append("text")
            .attr("class", "fa sortingIcon")
            .attr("x", width - 30)
            .attr("y", height/2 + 9)
            .text("\uf1da")
    }

    const updateSortingMetric = () => {

    }

    useEffect(()=>{
        getDimensions();
        setTimeout(()=>{
            loadSVG();
            loadAxis(cardinality)
            loadNodes();
            addEvents();
            loadSortingMetric();
        } , 250)
    } , [width,height,sortMetric])

    useEffect(()=>{
        updateNodes()
        addEvents()
    },[activeDocumentId])

    useEffect(()=>{
        updateAxis(cardinality)
    } , [cardinality])

    useEffect(()=> {
        updateNodesOfAxisRange(activeAxisRange)
        updateAxisOfAxisRange(activeAxisRange)
    }, [activeAxisRange])

    return (
        <div id="mainCanvas">

        </div>
    )
}

export default MainSection