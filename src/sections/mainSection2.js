import React, { useEffect } from 'react'
import * as d3 from 'd3'
import {useSelector, useDispatch} from 'react-redux'
import {SetDimensions, setSliderHeightPorportion, SetZ, setZ} from '../redux/actions/actions'

const MainSection = () => {

    const {width, height, slideHeightPorportion, z, documents} = useSelector(state => ({
        width : state.canvasReducer.width,
        height : state.canvasReducer.height,
        slideHeightPorportion : state.canvasReducer.slideHeightPorportion,
        z : state.canvasReducer.z,
        documents : state.dataReducer.documents,
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

        // define your linear gradient here ...
        var defs = d3.select(".mainContainer")
            .append("defs")
                
        var slideBodyGradient = defs.append("linearGradient")
            .attr("id", "slideBodyGradient")
            .attr("gradientTransform", "rotate(90)")

        slideBodyGradient.append("stop")
            .attr("offset" , "0%")
            .attr("stop-color" , "#e6e6e6")

        slideBodyGradient.append("stop")
            .attr("offset" , "20%")
            .attr("stop-color" , "#fff")

        slideBodyGradient.append("stop")
            .attr("offset" , "80%")
            .attr("stop-color" , "#fff")

        slideBodyGradient.append("stop")
            .attr("offset" , "100%")
            .attr("stop-color" , "#e6e6e6")
    }

    const loadSlider = () => {
        var slider = d3.select(".mainContainer")
            .append("g")
            .attr("class","slideContainer")

        updateSlider()
    }

    const updateSlider = () => {

        var slider = d3.select(".slideContainer")
        var slideBody = slider.selectAll(".slideBody")
        var slideController = slider.selectAll(".slideController")

        slideBody.remove()
        slideController.remove()

        slideBody = slider.append("rect")
                .attr("width", width)
                .attr("x", 0)
                .attr("fill", "url('#slideBodyGradient')")
                .attr("class" , "slideBody")
                .merge(slideBody)
                .attr("y", z*height)
                .attr("height" , height*slideHeightPorportion)

        slideController = slider.append("rect")
            .attr("width", width/30)
            .attr("x", 0)
            .attr("fill", "green")
            .attr("class", "slideController")
            .merge(slideController)
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

    const loadDocs = () => {
        d3.select(".mainContainer")
            .append("g")
            .attr("class", "docsContainer")

        updateDocs()
    }

    const updateDocs = () => {
        // console.log("in update Docs")
        var y = 1 - (z + slideHeightPorportion)
        var n_x = Math.floor(Math.pow(slideHeightPorportion, 2)*documents.length) 
        var n_z = Math.floor((z/(1-slideHeightPorportion))*(documents.length - n_x))
        let t_x = Math.pow((1/slideHeightPorportion), 2) // thickness of each element within the sliding window
        let t_z = (height - documents.length*10) / (t_x*n_x + (documents.length - n_x)) // thickness of each element outisde of the sliding window

        var docsContainer = d3.select(".docsContainer")

        var newElements = docsContainer.selectAll(".docElement") 
            .data(documents)  

        newElements.exit().remove()

        newElements
            .enter()
            .append("rect")
            .merge(newElements)
            .transition()
            .attr("x",width/22)
            .attr("y",(item, index)=>{
                return index < n_z ? (index)*(t_z+10) : index < n_z+n_x ? n_z*(t_z + 10) + (index - n_z)*(t_x*t_z + 10) : n_z*(t_z + 10) + n_x*(t_x*t_z + 10) + (index - n_z - n_x)*(t_z+10)
            })
            .attr("width" , width/5)
            .attr("height" , (item , index ) => {
                return index < n_z ? t_z : index < n_z + n_x ? t_x * t_z : t_z
            })
            .attr("fill", "blue")
            .attr("class", "docElement")
            
    }

    useEffect(()=>{
        getDimensions();
        setTimeout(()=>{
            loadSVG();
            loadSlider();
            loadDocs();
        } , 250)
    } , [width, height])

    useEffect(()=>{
        updateSlider();
        // console.log("in use effect")
        updateDocs();
    } , [slideHeightPorportion, z])

    return (
        <div id="mainCanvas_2">

        </div>
    )
}

export default MainSection