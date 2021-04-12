import React, { useEffect } from 'react'
import * as d3 from 'd3'
import {useSelector, useDispatch} from 'react-redux'
import {SetDimensions, setSliderHeightPorportion, SetZ, setZ} from '../redux/actions/actions'

const MainSection = () => {

    const {width, height, slideHeightPorportion, z} = useSelector(state => ({
        width : state.canvasReducer.width,
        height : state.canvasReducer.height,
        slideHeightPorportion : state.canvasReducer.slideHeightPorportion,
        z : state.canvasReducer.z
    }))
    
    const sliderDragHandler = d3.drag()
            .on("drag", function(d){
                let barHeight = parseInt(d3.select(this).attr("height"))
                if(d.y > 0 && d.y + barHeight < height){
                    d3.select(this)
                        .attr("y", (d.y))

                    d3.select(".slideBody")
                        .attr("y", d.y)

                    dispatch(SetZ(d.y/height))
                }
            })

    const dispatch = useDispatch()

    const getDimensions = () => {
        let mainCanvas = document.getElementById("mainCanvas_2")
        let {width, height} = getComputedStyle(mainCanvas)
        width = width.slice(0,-2)
        height = height.slice(0,-2)
        dispatch(SetDimensions(width, height))
    }

    const loadSVG = () => {
        d3.select("#mainCanvas_2")
            .select("svg")
            .remove()

        d3.select("#mainCanvas_2")
            .append("svg")
            .attr("width", width)
            .attr("height",height)
            .attr("class", "canvasSVG")
            .append("g")
                .attr("class", "mainContainer")
    }

    const loadSlider = () => {
        var slider = d3.select(".mainContainer")
            .append("g")
            .attr("class","slideContainer")

        updateSlider()
    }

    const updateSlider = () => {

        var slider = d3.select(".slideContainer")

        slider.selectAll(".slideController").remove()
        slider.selectAll(".slideBody").remove()

        var slideBody = slider.append("rect")
            .attr("width", width)
            .attr("height" , height*slideHeightPorportion)
            .attr("x", 0)
            .attr("y", z*height)
            .attr("fill", 'red')
            .attr("class" , "slideBody")

        var slideController = slider.append("rect")
            .attr("width", width/30)
            .attr("x", 0)
            .attr("fill", "green")
            .attr("class", "slideController")
            .attr("y", z*height)
            .attr("height", height*slideHeightPorportion)

        sliderDragHandler(slideController)

        slideController.on("wheel", (event) => { 
            if (event.deltaY < 0 && slideHeightPorportion*100 > 9) {
                // mouse wheel up
                dispatch(setSliderHeightPorportion((slideHeightPorportion*100-1)/100))
            } else if (event.deltaY > 0 && slideHeightPorportion * 100 < 91) {
                // mouse wheel down
                dispatch(setSliderHeightPorportion((slideHeightPorportion*100+1)/100))
            }
        })
    }

    useEffect(()=>{
        getDimensions();
        setTimeout(()=>{
            loadSVG();
            loadSlider();
        } , 250)
    } , [width, height])

    useEffect(()=>{
        updateSlider();
    } , [slideHeightPorportion])

    return (
        <div id="mainCanvas_2">

        </div>
    )
}

export default MainSection