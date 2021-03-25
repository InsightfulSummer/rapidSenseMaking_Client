import React, { useEffect } from 'react'
import * as d3 from 'd3'
import {useDispatch, useSelector} from 'react-redux'
import { scroller } from 'react-scroll'
import {SetDimensions, SetActiveDocument, UnSetActiveDocument} from '../redux/actions/actions'

const MainSection = () => {

    const dispatch = useDispatch()

    const {width, height, documents, sortMetric, activeDocumentId} = useSelector(state => ({
        width : state.canvasReducer.width,
        height : state.canvasReducer.height,
        documents : state.dataReducer.documents,
        sortMetric : state.interactionReducer.sortMetric,
        activeDocumentId: state.interactionReducer.activeDocumentId
    }))

    let domain = d3.extent(documents, doc=>{return parseFloat(doc[sortMetric])})
    const aScale = d3.scaleLinear().domain(domain).range([0, (parseFloat(width)/2)*0.9])
    const bScale = d3.scaleLinear().domain(domain).range([0, (parseFloat(height)/2)*0.9])
    const rScale = d3.scaleLinear().domain(domain).range([30,10])
    const angleScale = d3.scaleLinear().domain([1 , documents.length]).range([15, 345])

    const getX = (item, index) => {
        return (width/2)+(aScale(parseFloat(item[sortMetric]))*Math.cos(angleScale(index + 1)))
    }

    const getY = (item, index) => {
        return (height/2)+(bScale(parseFloat(item[sortMetric]))*Math.sin(angleScale(index + 1)))
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

    const addAxis = (cardinality) => {
        var g = d3.select(".canvasSVG")
            .append("g")

        let steps = []
        let stepMagnitude = (domain[1]-domain[0])/(cardinality-1)
        for (let index = 0; index < cardinality; index++) {
            steps.push(domain[0] + stepMagnitude*index)
        }

        steps = steps.reverse()

        let axisEllipses = g.selectAll("ellipse")
            .data(steps)
            .enter()
            .append("ellipse")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("rx", item=>{return aScale(item)})
            .attr("ry", item=>{return bScale(item)})
            .attr("class", "axisEllipse")

        axisEllipses.on("mouseover", function(event, data){
            d3.select(this)
                .attr("class", "axisEllipse activeEllipse")
        })

        axisEllipses.on("mouseout", function(event, data){
            d3.select(this)
                .attr("class", "axisEllipse")
        })

        let axisLine = g.append("line")
            .attr("x1",width/2)
            .attr("y1",height/2)
            .attr("x2",width)
            .attr("y2",height/2)
            .attr("class", "axisLine")

        

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

    useEffect(()=>{
        getDimensions();
        setTimeout(()=>{
            loadSVG();
            addAxis(6)
            loadNodes();
            addEvents();
        } , 250)
    } , [width,height,sortMetric])

    useEffect(()=>{
        updateNodes()
        addEvents()
    },[activeDocumentId])

    return (
        <div id="mainCanvas">

        </div>
    )
}

export default MainSection