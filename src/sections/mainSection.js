import React, { useEffect } from 'react'
import * as d3 from 'd3'
import {useDispatch, useSelector} from 'react-redux'
import {SetDimensions} from '../redux/actions/actions'

const MainSection = () => {

    const dispatch = useDispatch()

    const {width, height, documents} = useSelector(state => ({
        width : state.canvasReducer.width,
        height : state.canvasReducer.height,
        documents : state.dataReducer.documents
    }))

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
        var simulation = d3.forceSimulation(documents)
            .force("charge" , d3.forceManyBody())
            .force("center", d3.forceCenter(width/2, height/2))

        const drag = simulation => {

            function dragstarted(d) {
                // if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                // d.fx = d.x;
                // d.fy = d.y;
            }
        
            function dragged(d) {
                // d.fx = d3.event.x;
                // d.fy = d3.event.y;
            }
        
            function dragended(d) {
                // if (!d3.event.active) simulation.alphaTarget(0);
                // d.fx = null;
                // d.fy = null;
            }
        
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        var node = d3.select(".canvasSVG")
            .append("g")
            .selectAll("g")
            .data(documents)
            .join("g")
            .call(drag(simulation))

        node.append("circle")
            .attr("r", 5)

        simulation.on("tick", () => {
            node.select("circle")
                .attr("transform", data => {
                    return "translate("+data.x+","+data.y+")"
                })
        })
    }

    useEffect(()=>{
        getDimensions();
        setTimeout(()=>{
            loadSVG();
            loadNodes();
        } , 500)
    } , [width,height])

    return (
        <div id="mainCanvas">

        </div>
    )
}

export default MainSection