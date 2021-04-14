import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import {useSelector, useDispatch} from 'react-redux'
import {SetDimensions, sortDocuments} from '../redux/actions/actions'

const MainSection = () => {

    const [z, setZ] = useState(0)
    const [slideHeightPorportion, setSliderHeightPorportion] = useState(1/2)
    const [margin, setMargin] = useState(5)
    const [steps, setSteps] = useState([])

    const {width, height, documents, sortMetric, ascending} = useSelector(state => ({
        width : state.canvasReducer.width,
        height : state.canvasReducer.height,
        documents : state.dataReducer.documents,
        sortMetric : state.interactionReducer.sortMetric,
        ascending : state.interactionReducer.ascending,
    }))

    //define your scales here ...
    let domain = ascending ? d3.extent(documents, doc=>{return parseFloat(doc[sortMetric])}).reverse() : d3.extent(documents, doc=>{return parseFloat(doc[sortMetric])})
    const widthScale = d3.scaleLinear().domain(domain).range([0.5,1])

    const sliderDragHandler = d3.drag()
            .on("drag", function(d){
                let barHeight = parseInt(d3.select(this).attr("height"))
                if(d.y > 0 && d.y + barHeight < height){
                    d3.select(this)
                        .attr("y", (d.y))

                    d3.select(".slideBody")
                        .attr("y", d.y)

                    setZ(d.y/height)
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
                .attr("offset" , "5%")
                .attr("stop-color" , "#fff")

            slideBodyGradient.append("stop")
                .attr("offset" , "95%")
                .attr("stop-color" , "#fff")

            slideBodyGradient.append("stop")
                .attr("offset" , "100%")
                .attr("stop-color" , "#e6e6e6")

        var slideController = defs.append("linearGradient")
            .attr("id", "slideControllerGradient")
            .attr("gradientTransform", "rotate(90)")

            slideController.append("stop")
            .attr("offset" , "0%")
            .attr("stop-color" , "#e6e6e6")

            slideController.append("stop")
                .attr("offset" , "35%")
                .attr("stop-color" , "#737373")

            slideController.append("stop")
                .attr("offset" , "65%")
                .attr("stop-color" , "#737373")

            slideController.append("stop")
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
        var slideControllerText = slider.selectAll(".slideControllerText")

        slideBody.remove()
        slideController.remove()
        slideControllerText.remove()

        slideBody = slider.append("rect")
                .attr("width", width)
                .attr("x", 0)
                .attr("fill", "url('#slideBodyGradient')")
                .attr("class" , "slideBody")
                .merge(slideBody)
                .attr("y", z*height)
                .attr("height" , height*slideHeightPorportion)

        slideController = slider.append("rect")
            .attr("width", 55)
            .attr("x", 0)
            .attr("fill", "url('#slideControllerGradient')")
            .attr("class", "slideController")
            .merge(slideController)
            .attr("y", z*height)
            .attr("height", height*slideHeightPorportion)
            
        slideControllerText = slider.append("text")
            .attr("class", "slideControllerText")
            .attr("x",55/2)
            .attr("y",(z*height)+(height*slideHeightPorportion/2))
            .text(Math.ceil(Math.pow(slideHeightPorportion, 2)*100)+"%")
        

        sliderDragHandler(slideController)

        slideController.on("wheel", (event) => { 
            if (event.deltaY < 0 && slideHeightPorportion*100 > 9) {
                // mouse wheel up
                setSliderHeightPorportion((slideHeightPorportion*100-1)/100)
            } else if (event.deltaY > 0 && slideHeightPorportion * 100 < 91) {
                // mouse wheel down
                setSliderHeightPorportion((slideHeightPorportion*100+1)/100)
            }
        })
    }

    const loadDocs = () => {
        dispatch(sortDocuments(sortMetric, ascending))
        d3.select(".mainContainer")
            .append("g")
            .attr("class", "docsContainer")

        updateDocs()
    }

    const updateDocs = () => {
        var n_x = Math.floor(Math.pow(slideHeightPorportion, 2)*documents.length) 
        var n_z = Math.floor((z/(1-slideHeightPorportion))*(documents.length - n_x))
        let t_x = Math.pow((1/slideHeightPorportion), 2) // thickness of each element within the sliding window
        let t_z = (height - documents.length*margin) / (t_x*n_x + (documents.length - n_x)) // thickness of each element outisde of the sliding window

        var docsContainer = d3.select(".docsContainer")

        var newElements = docsContainer.selectAll(".docElement") 
            .data(documents)  

        newElements.exit().remove()

        newElements
            .enter()
            .append("rect")
            .merge(newElements)
            .transition()
            .attr("x",125)
            .attr("y",(item, index)=>{
                return index < n_z ? (index)*(t_z+margin) : index < n_z+n_x ? n_z*(t_z + margin) + (index - n_z)*(t_x*t_z + margin) : n_z*(t_z + margin) + n_x*(t_x*t_z + margin) + (index - n_z - n_x)*(t_z+margin)
            })
            .attr("width" , doc => {
                return width/5 * widthScale(doc[sortMetric])
            })
            .attr("height" , (item , index ) => {
                return index < n_z ? t_z : index < n_z + n_x ? t_x * t_z : t_z
            })
            .attr("fill", "#3f51b5")
            .attr("class", "docElement")
            .attr("opacity", (item, index) => {
                return index < n_z ? 0.65 : index < n_z + n_x ? 0.95 : 0.65
            })

    }

    const loadAxis = (cardinality) => {
        // cardinality can be dynamic later
        d3.select(".mainContainer")
            .append("g")
            .attr("class", "axisContainer")

        let steps_ = []
        console.log(domain)
        let stepMagnitude = (domain[0]-domain[1])/(cardinality-1)
        for (let index = 0; index < cardinality; index++) {
            steps_.push({
                label : parseInt(domain[1] + stepMagnitude*index)
            })
        }
        steps_[0].n = 0
        steps_[0].label = steps_[0].label-1
        steps_.slice(1).map((step, index) => {
            step.n = documents.filter(item => {
                return ascending ? item[sortMetric] > steps_[index].label && item[sortMetric] <= step.label : item[sortMetric] < steps_[index].label && item[sortMetric] >= step.label
            }).length
            step.n += steps_[index].n
        })
        steps_ = steps_.filter((item , index) => {
            return steps_.findIndex(step => {
                return step.n == item.n
            }) == index
        })
        setSteps(steps_)
        updateAxis()
    }

    const updateAxis = () => {

        var n_x = Math.floor(Math.pow(slideHeightPorportion, 2)*documents.length) 
        var n_z = Math.floor((z/(1-slideHeightPorportion))*(documents.length - n_x))
        let t_x = Math.pow((1/slideHeightPorportion), 2) // thickness of each element within the sliding window
        let t_z = (height - documents.length*margin) / (t_x*n_x + (documents.length - n_x)) // thickness of each element outisde of the sliding window
        t_x = t_x*t_z

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
            .attr("x1",105)
            .attr("x2", width)
            .merge(axisLines)
            .transition()
            .attr("y1", step => {
                return step.n > n_z ? step.n > n_z + n_x ? n_z*(t_z+margin) + n_x*(t_x+margin) + (step.n-n_x-n_z) * (t_z+margin) :
                    n_z*(t_z+margin) + (step.n-n_z) * (t_x + margin) : 
                    step.n * (t_z + margin)
            })
            .attr("y2", step => {
                return step.n > n_z ? step.n > n_z + n_x ? n_z*(t_z+margin) + n_x*(t_x+margin) + (step.n-n_x-n_z) * (t_z+margin) :
                    n_z*(t_z+margin) + (step.n-n_z) * (t_x + margin) : 
                    step.n * (t_z + margin)
            })
            .attr("stroke" , "#b6b6b6")
            .attr("stroke-dasharray","5")
            .attr("class", "axisLines")

        axisText
            .enter()
            .append("text")
            .attr("x", 85)
            .attr("text-anchor", "middle")
            .text(step => step.label)
            .merge(axisText)
            .transition()
            .attr("y", step => {
                return step.n > n_z ? step.n > n_z + n_x ? n_z*(t_z+margin) + n_x*(t_x+margin) + (step.n-n_x-n_z) * (t_z+margin) :
                    n_z*(t_z+margin) + (step.n-n_z) * (t_x + margin) : 
                    step.n * (t_z + margin)
            })
            .attr("class", "axisText")
    }

    useEffect(()=>{
        getDimensions();
        setTimeout(()=>{
            loadSVG();
            loadSlider();
            loadAxis(10);
            loadDocs();
        } , 250)
    } , [width, height])

    useEffect(()=>{
        updateSlider();
        updateDocs();
        updateAxis();
    } , [slideHeightPorportion, z, steps])

    return (
        <div id="mainCanvas_2">

        </div>
    )
}

export default MainSection