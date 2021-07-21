import React from 'react'
import { hexToRgbA } from '../../helper/helper'
import {
    Element
} from 'react-scroll'

const NonLinearComponent = ({ doc_, parsedBody, loading, suggestions, showPDF }) => {


    let color_ = doc_.cluster.color

    const findHeader = (divId) => {
        let div = parsedBody.find(item => {
            return item.divId == divId
        })
        let header = ""
        div.content.map(content => {
            if (content.type == "header") {
                header = content.content
            }
        })
        return header
    }
    return (
        <div className="NonLinearComponent" style={{ borderColor: color_ }}>
            <div className="nonLinearLensActionsCenter" style={{ backgroundImage: 'linear-gradient(45deg, ' + color_ + ', #ffffff)' }}>
                <i
                    className="summarySettingsIcon fas fa-times"
                    title="close the lense"
                    id="nonLinearCloseIcon"
                />
                <i
                    className="summarySettingsIcon fas fa-expand"
                    title="expand the lense"
                    id="nonLinearExpandIcon"
                />
                <i
                    className="summarySettingsIcon fas fa-compress"
                    title="compress the lense"
                    id="nonLinearCompressIcon"
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
                    <div style={{ flex: 10, display: "flex", flexDirection: "row" }}>
                        <div className="nonLinearBodyOfLens" id="nonLinearBodyOfLens">
                            {
                                parsedBody.map(div => (
                                    <div>
                                        {
                                            div.content.map(divContent => divContent.type == "header" ? (
                                                <h3>{divContent.content}</h3>
                                            ) : divContent.type == "paragraph" ? (<p>
                                                {
                                                    divContent.content.map(pContent => <Element name={"sentence_" + pContent.sentenceId} style={{ display: "inline" }}>
                                                        <span id={pContent.sentenceId} className="nonLinearSpanOfSentence">{" " + pContent.content}</span>
                                                    </Element>)
                                                }
                                            </p>
                                            ) : divContent.type == "formula" ? (
                                                <p>{divContent.content}</p>
                                            ) : (
                                                <ul>
                                                    {
                                                        divContent.content.map(listItem => (
                                                            <li className="listItem">{listItem.content}</li>
                                                        ))
                                                    }
                                                </ul>
                                            ))
                                        }
                                    </div>
                                ))
                            }
                        </div>
                        <div className="nonLinearSuggestionContainer" style={{ backgroundColor: hexToRgbA(color_, 0.4) }}>
                            {
                                loading ? (
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <div className="spinner-border" role="status" style={{ color: color_ }}>
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                ) : suggestions.length == 0 ? (
                                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "5%", textAlign: "center" }}>
                                        <p>Please select a sentence to find its relevant sentences in other sections of the document ...</p>
                                    </div>
                                ) : (
                                    <div>
                                        {
                                            suggestions.map(sug => (
                                                <div className="nonLinearSuggestionItem" style={{ borderColor: color_ }}>
                                                    <div style={{ flex: 1, position: "relative", borderLeft: "solid 3px " + color_ }}>
                                                        <div style={{ position: "absolute", top: parseInt(sug.position * 100) + "%", width: "100%", aspectRatio: "1/1", backgroundColor: color_, display: "flex", alignItems: "center", fontSize: "70%", color: "#fff", fontWeight: "bold", justifyContent: "center" }}>
                                                            {parseInt(sug.position * 100) + "%"}
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 9, padding: "1%" }}>
                                                        <h6 className="suggestionHeader">{findHeader(sug.divId)}</h6>
                                                        <p className="suggestionP">{"... " + sug.content + " ..."}</p>
                                                    </div>
                                                    <div className="suggestionItemClickable" positionId={sug.sentenceId} style={{ position: "absolute", width: "100%", height: "100%", cursor: "pointer" }}></div>
                                                </div>))
                                        }
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default NonLinearComponent