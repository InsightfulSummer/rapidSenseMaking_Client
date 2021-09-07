// import { MDBContainer, MDBBtn } from 'mdbreact'
// import React, { useState, useRef, useEffect } from 'react'
// import jRes from '../data/res.json'


// const Slider = () => {

//     const [topSliderPosition, changeTopSliderPosition] = useState(0)
//     const [bottomSliderPostion, changeBottomSliderPosition] = useState(100)
//     const [topHeader,setTopHeader] = useState("")
//     const [topContent, setTopContent] = useState(null)
//     const [bottomHeader, setBottomHeader] = useState("")
//     const [bottomContent, setBottomContent] = useState(null)
//     const [range1, setRange1] = useState(null)
//     const [range2, setRange2] = useState(null)
//     const [range3, setRange3] = useState(null)
//     const sliderContainerRef = useRef()
    

//     const dragTopSlider = (event) => {
//         // console.log(event.clientY)
//         // event.preventDefault()
//         const {offsetTop, offsetHeight} = sliderContainerRef.current
//         const {clientY} = event
//         if(clientY > offsetTop && clientY < offsetHeight) {
//             let percentage = (clientY - offsetTop) / (offsetHeight - offsetTop) * 100
//             if (percentage < bottomSliderPostion - 30) {
//                 changeTopSliderPosition(percentage)
//                 const {header, element} = fetchContentByPercentage(percentage)
//                 setTopHeader(header)
//                 setTopContent(element)
//                 setRange1(fetchContentByRange(0,topSliderPosition))
//                 setRange2(fetchContentByRange(topSliderPosition+1,bottomSliderPostion-1))
//             }
//         }
//     }

//     const dragBottomSlider = (event) => {
//         event.preventDefault()
//         const {offsetTop, offsetHeight} = sliderContainerRef.current
//         const {clientY} = event
//         if(clientY > offsetTop && clientY < offsetHeight) {
//             let percentage = (clientY - offsetTop) / (offsetHeight - offsetTop) * 100
//             if (percentage > topSliderPosition + 30) {
//                 changeBottomSliderPosition(percentage)
//                 const {header,element} = fetchContentByPercentage(percentage)
//                 setBottomHeader(header)
//                 setBottomContent(element)
//                 setRange2(fetchContentByRange(topSliderPosition + 1, bottomSliderPostion - 1))
//                 setRange3(fetchContentByRange(bottomSliderPostion + 1 , 100))
//             }
//         }
//     }

//     const fetchContentByPercentage = (percentage) => {
//         let charStart = Math.floor(jRes[jRes.length - 1].charCount * percentage / 100)
//         // find the index of the div which its charCount is bigger than the start character of the percentage
//         let index = jRes.findIndex(item => {
//             return item.charCount > charStart
//         })
//         // fint the right element for the character
//         if (index > 0) {
//             charStart = charStart - jRes[index - 1].charCount
//         }
//         let header = ""
//         let headerObject = jRes[index].content.find(item => {
//             return item.type == "header"
//         })
//         if (headerObject != undefined) {
//             header = headerObject.content
//         }
//         let elementIndex = jRes[index].content.findIndex(item => {
//             return item.charCount > charStart
//         })
//         // output the element and a possible header ...
//         return {
//             header : header,
//             element : jRes[index].content[elementIndex]
//         }
//     }

//     const fetchContentByRange = (r1, r2) => {
//         let ch1,ch2;
//         if(r2==0 || r1==100){
//             return null
//         }
//         if(r1 == 0){
//             ch1=0
//         } else {
//             ch1 = Math.floor(jRes[jRes.length - 1].charCount * r1 / 100)
//         }

//         if(r2 == 100){
//             ch2 = jRes[jRes.length - 1].charCount
//         } else {
//             ch2 = Math.floor(jRes[jRes.length - 1].charCount * r2 / 100)
//         }

//         let filteredResults = jRes.filter(item => {
//             return item.charCount > ch1 && item.charCount < ch2 
//         })

//         return filteredResults
//     }

//     const generateOutput = () => {
//         let divs = fetchContentByRange(topSliderPosition, bottomSliderPostion + 5)
//         let content = ""
//         divs.map(d => {
//             d.content.map(dc => {
//                if (dc.type == "paragraph") {
//                     dc.content.map(dcp => {
//                         content += dcp.content
//                     }) 
//                }
                    
//             })
//         })
//         return content
//     }

//     useEffect(()=>{
//         console.log(jRes)
//       let topRes = fetchContentByPercentage(0)
//       let bottomRes = fetchContentByPercentage(99)
//       setTopHeader(topRes.header)
//       setTopContent(topRes.element)
//       setBottomHeader(bottomRes.header)
//       setBottomContent(bottomRes.element)  
//       setRange2(fetchContentByRange(5,95))
//     },[])

//     return (
//         <MDBContainer>
//             <div className="sliderFrame">
//                 <div 
//                     className="sliderContainer" 
//                     ref={sliderContainerRef} 
//                     onDrop={e=>{e.preventDefault()}} 
//                     onDragOver={e=>{e.preventDefault()}} 
//                     onDragEnter={e=>{e.preventDefault()}}
//                     // style={{background: "linear-gradient(blue, #fff "+topSliderPosition+"%, #fff "+bottomSliderPostion+"% , blue)" }}    
//                 >


//                     <div style={{ height: topSliderPosition + "%", top : "0%" }} className="sliderThumbnailView">
//                         {range1 != null ? range1.map(div =>
//                             div.content.map(item =>
//                                 item.type == "paragraph" ? (<p>
//                                     {
//                                         item.content.map(pContent => pContent.type == "textualContentInP" ? (pContent.content) :
//                                             pContent.type == "refContentInP" ? (<span className="refSpan">
//                                                 {pContent.content}
//                                             </span>) :
//                                                 (<span></span>))
//                                     }
//                                 </p>) : null
//                             )
//                         ) : null}
//                     </div>


//                     <div 
//                         className="topSlider summarySlider" 
//                         style={{top : topSliderPosition + "%", borderLeft: 'solid 10px blue'}} 
//                         onDragStart={e=>{e.dataTransfer.setDragImage(new Image(0,0), 0 , 0); e.dataTransfer.dropEffect = "copy"}}
//                         onDrag={dragTopSlider} 
//                         draggable={true}
//                     >
//                         <h6 className="sliderHeader">{topHeader}</h6>
//                         {
//                             topContent != null ? (
//                                 topContent.type == "header"  ? (
//                                     <p>{topContent.content}</p>
//                                 ) : topContent.type == "paragraph" ? ( <p>
//                                     {
//                                         topContent.content.map(pContent => pContent.type == "textualContentInP" ? (pContent.content) : 
//                                         pContent.type == "refContentInP" ? (<span className="refSpan">
//                                             {pContent.content}
//                                         </span>) : 
//                                         (<span></span>))
//                                     }
//                                 </p>
//                                 ) : topContent.type == "formula" ? (
//                                     <p>{topContent.content}</p>
//                                 ) : (
//                                     <ul>
//                                         {
//                                             topContent.content.map(listItem => (
//                                                 <li className="listItem">{listItem.content}</li>
//                                             ))
//                                         }
//                                     </ul>
//                                 )
//                             ) : (null)
//                         }
//                     </div>


//                     <div style={{height : (bottomSliderPostion - topSliderPosition - 30) + "%", top : topSliderPosition + 15 + "%"}} className="sliderThumbnailView">
//                         {range2 != null ? range2.map(div =>
//                             div.content.map(item =>
//                                 item.type == "paragraph" ? (<p>
//                                     {
//                                         item.content.map(pContent => pContent.type == "textualContentInP" ? (pContent.content) :
//                                             pContent.type == "refContentInP" ? (<span className="refSpan">
//                                                 {pContent.content}
//                                             </span>) :
//                                                 (<span></span>))
//                                     }
//                                 </p>) : null
//                             )
//                         ) : null}
//                     </div>

//                     <div 
//                         className="bottomSlider summarySlider" 
//                         style={{bottom : (100 - bottomSliderPostion) + "%", borderLeft: 'solid 10px blue'}} 
//                         onDragStart={e=>{e.dataTransfer.setDragImage(new Image(0,0), 0 , 0)}}
//                         onDrag={dragBottomSlider} 
//                         draggable={true}
//                     >
//                         <h6 className="sliderHeader">{bottomHeader}</h6>
//                         {
//                             bottomContent != null ? (
//                                 bottomContent.type == "header"  ? (
//                                     <h3>{bottomContent.content}</h3>
//                                 ) : bottomContent.type == "paragraph" ? ( <p>
//                                     {
//                                         bottomContent.content.map(pContent => pContent.type == "textualContentInP" ? (pContent.content) : 
//                                         pContent.type == "refContentInP" ? (<span className="refSpan">
//                                             {pContent.content}
//                                         </span>) : 
//                                         (<span></span>))
//                                     }
//                                 </p>
//                                 ) : bottomContent.type == "formula" ? (
//                                     <p>{bottomContent.content}</p>
//                                 ) : (
//                                     <ul>
//                                         {
//                                             bottomContent.content.map(listItem => (
//                                                 <li className="listItem">{listItem.content}</li>
//                                             ))
//                                         }
//                                     </ul>
//                                 )
//                             ) : (null)
//                         }
//                     </div>


//                     <div style={{height : (100-bottomSliderPostion) + "%", bottom : "0%"}} className="sliderThumbnailView">
//                         {range3 != null ? range3.map(div =>
//                             div.content.map(item =>
//                                 item.type == "paragraph" ? (<p>
//                                     {
//                                         item.content.map(pContent => pContent.type == "textualContentInP" ? (pContent.content) :
//                                             pContent.type == "refContentInP" ? (<span className="refSpan">
//                                                 {pContent.content}
//                                             </span>) :
//                                                 (<span></span>))
//                                     }
//                                 </p>) : null
//                             )
//                         ) : null}
//                     </div>

//                 </div>
//                 <div className="sliderButtonContainer">
//                     <MDBBtn className="sliderBTN" onClick={generateOutput}>
//                         Summarize
//                     </MDBBtn>
//                 </div>
//             </div>
//         </MDBContainer>
//     )
// }

// export default Slider


import React from 'react'
import { useEffect } from 'react'
import ReactWordcloud from 'react-wordcloud'
import WordCloud from 'wordcloud'

const Example = () => {

    useEffect(()=>{
        WordCloud(document.getElementById("exampleWordCloud"), {
            list : [
                ['foo', 12], ['bar', 6]
            ]
        })
    } , [])
    return (
        <div style={{width: "500px", height: "500px"}} id="exampleWordCloud">

        </div>
    )
} 

export default Example