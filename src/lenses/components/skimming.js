import React from 'react'
import { hexToRgbA } from '../../helper/helper'
import {
    Element
} from 'react-scroll'
import { MDBBtn } from 'mdbreact'
import * as Scroll from 'react-scroll'
import * as d3 from 'd3'

const Skimming = ({ doc_, parsedBody, keywords, showPDF, scrollingDuration, compressDocumentRate, showKeywords, showHeaders }) => {
    let color_ = doc_.cluster.color
    
    const calculateEncodingRange = () => {
        let min = 10; let max = 0;
        parsedBody.map(div => {
            div.content.map(content => {
                if(content.type == "paragraph"){
                    content.content.map(pContent => {
                        if(pContent.type == "sentenceInP"){
                            if(pContent.sentScore > max){
                                max = pContent.sentScore
                            }
                            if(pContent.sentScore < min) {
                                min = pContent.sentScore
                            }
                        }
                    })
                }
            })
        })
        let fontWeightRange = compressDocumentRate == 1.5 ? [2,3] : compressDocumentRate == 2 ? [3,6] : [3,9]
        let fontSizeRange = compressDocumentRate == 1.5 ? [12,18] : compressDocumentRate == 2 ? [12,24] : [12,36]
        let fontWeightScale = d3.scaleLinear().domain([min,max]).range(fontWeightRange)
        let fontSizeScale = d3.scaleLinear().domain([min, max]).range(fontSizeRange)
        return {fontSizeScale, fontWeightScale}
    }

    var {fontSizeScale, fontWeightScale} = calculateEncodingRange()

    const identifyKeywords = (sent, keywords_) => {
        let hasKeywords = false
        let str_arr = sent.content.split(" ")
        for(let i=0; i<keywords_.length; i++){
            if(str_arr.includes(keywords_[i])){
                hasKeywords = true
                break;
            }
        }
        if(hasKeywords && showKeywords){
            return(
                <span style={{
                    fontWeight : Math.floor(fontWeightScale(sent.sentScore))*100,
                    fontSize : Math.floor(fontSizeScale(sent.sentScore)) + "px"
                }}>{
                    str_arr.map(w => {
                        return keywords_.includes(w) ? <span style={{color : color_}}>{w+ " "}</span> : w + " "
                    })
                }</span>
            )  
        } else {
            return (
                <span style={{
                    fontWeight : Math.floor(fontWeightScale(sent.sentScore))*100,
                    fontSize : Math.floor(fontSizeScale(sent.sentScore)) + "px"
                }}>{sent.content}</span>
            )
        }
    }

    return (
        <div className="skimmingComponent" style={{ borderColor: color_ }}>
            <div className="skimmingActionCenter" style={{ backgroundImage: 'linear-gradient(45deg, ' + color_ + ', #ffffff)' }}>
                <i
                    className="summarySettingsIcon fas fa-times"
                    title="close the lense"
                    id="skimmingCloseIcon"
                />
                <i
                    className="summarySettingsIcon fas fa-expand"
                    title="expand the lense"
                    id="skimmingExpandIcon"
                />
                <i
                    className="summarySettingsIcon fas fa-compress"
                    title="compress the lense"
                    id="skimmingCompressIcon"
                />
                <i
                    className={showHeaders ? "summarySettingsIcon fas fa-align-justify" : "summarySettingsIcon fas fa-heading"}
                    title={showHeaders ? "show all the body of article" : "show only headers of the article"}
                    id="skimmingShowHeadersIcon"
                />
                <i
                    className="summarySettingsIcon fas fa-highlighter"
                    title={showKeywords ? "hide keywords" : "show keywords"}
                    id="skimmingHighlightIcon"
                    style={{fontSize: showKeywords ? "1.2em" : "1em", color : showKeywords ? "black" : "#444"}}
                />
                <i
                    className="summarySettingsIcon fas fa-compress-alt"
                    title={"set the compression rate of document content to "+ (compressDocumentRate == 1.5 ? "1.5" : compressDocumentRate == 2 ? "2" : "3")}
                    id="skimmingCompressDocumentIcon"
                ><span style={{fontWeight : "bold", fontSize : "0.8em"}}>{compressDocumentRate}</span></i>
                <i
                    className="summarySettingsIcon fas fa-tachometer-alt"
                    title={"set the duration of auto scrolling to "+ (scrollingDuration == 30 ? "60" : scrollingDuration == 60 ? "120" : scrollingDuration == 120 ? "180" : "30") + " seconds"}
                    id="skimmingScrollingDuration"
                ><span style={{fontWeight: "bold", fontSize: "0.8em"}}>{scrollingDuration} <span style={{fontWeight : "100" , fontSize: "0.95em"}}>s</span></span></i>
                <i
                    className="summarySettingsIcon fas fa-play"
                    title="start auto-scrolling"
                    id="skimmingAutoScrollIcon"
                />
                <i class={showPDF ? "summarySettingsIcon fas fa-file-pdf activeSummarySettingsIcon" : "summarySettingsIcon fas fa-file-pdf"} title="show the original pdf file of the document" id="pdfToggler"></i>
            </div>
            {
                showPDF ? (
                    <div style={{ flex: 10 }}>
                        <iframe

                            src={`${require('../../data/2.pdf').default}#view=fitH`}
                            height="100%"
                            width="100%"
                        />
                    </div>
                ) : (
                    <div className="skimmingContent" id="skimmingBody">
                        {
                            parsedBody.map(div => (
                                <div>
                                    {
                                        div.content.map(divContent => divContent.type == "header" ? (
                                            <h3>{divContent.content}</h3>
                                        ) : divContent.type == "paragraph" && !showHeaders ? (<p>
                                            {
                                                divContent.content.map(pContent => 
                                                    identifyKeywords(pContent, keywords)
                                                )
                                            }
                                        </p>
                                        ) : divContent.type == "formula" && !showHeaders ? (
                                            <p>{divContent.content}</p>
                                        ) : !showHeaders ? (
                                            <ul>
                                                {
                                                    divContent.content.map(listItem => (
                                                        <li className="listItem">{listItem.content}</li>
                                                    ))
                                                }
                                            </ul>
                                        ) : null
                                        )
                                    }
                                </div>
                            ))
                        }
                        <Element name="autoScrollingTarget" />
                    </div>
                )
            }

        
        </div>
    )
}

export default Skimming