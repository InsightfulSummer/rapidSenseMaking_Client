import React from 'react'
import { MDBBtn } from 'mdbreact'
import * as d3 from 'd3'
import { hexToRgbA } from '../../helper/helper'
import { API_ADDRESS } from '../../helper/generalInfo'
import Store from '../../redux/store'
import { Element } from 'react-scroll'

const CompareMainComponent = ({ windows, loading, generalInfo, search, showPDF, similarEncoding, similarityScore, searchLoading }) => {

    const reqID = Store.getState().dataReducer.requestId

    const calculateEncodingRange = () => {
        let min = 0; let max = 5;
        if (!loading) {
            min = 10; max = 0;
            windows[0].parsedBody.map(div => {
                div.content.map(content => {
                    if (content.type == "paragraph") {
                        content.content.map(pContent => {
                            if (pContent.type == "sentenceInP") {
                                if (pContent.sentScore > max) {
                                    max = pContent.sentScore
                                }
                                if (pContent.sentScore < min) {
                                    min = pContent.sentScore
                                }
                            }
                        })
                    }
                })
            })
        }
        let fontWeightRange = [3, 6]
        let fontSizeRange = [12, 24]
        let fontWeightScale = d3.scaleLinear().domain([min, max]).range(fontWeightRange)
        let fontSizeScale = d3.scaleLinear().domain([min, max]).range(fontSizeRange)
        return { fontSizeScale, fontWeightScale }
    }

    var { fontSizeScale, fontWeightScale } = calculateEncodingRange()

    const identifyKeywords = (sent, keywords_, color_) => {
        let hasKeywords = false
        let str_arr = sent.content.split(" ")
        for (let i = 0; i < keywords_.length; i++) {
            if (str_arr.includes(keywords_[i])) {
                hasKeywords = true
                break;
            }
        }
        if (hasKeywords) {
            return (
                <Element name={"sentence_" + sent.sentenceId} style={{ display: "inline" }}>
                    <span style={{
                        fontWeight: Math.floor(fontWeightScale(sent.sentScore)) * 100,
                        fontSize: Math.floor(fontSizeScale(sent.sentScore)) + "px"
                    }}>{
                            str_arr.map(w => {
                                return keywords_.includes(w) ? <span style={{ color: color_ }}>{w + " "}</span> : w + " "
                            })
                        }</span>
                </Element>
            )
        } else {
            return (
                <Element name={"sentence_" + sent.sentenceId} style={{ display: "inline" }}>
                    <span style={{
                        fontWeight: Math.floor(fontWeightScale(sent.sentScore)) * 100,
                        fontSize: Math.floor(fontSizeScale(sent.sentScore)) + "px"
                    }}>{sent.content}</span>
                </Element>
            )
        }
    }

    const findHeader = (divId, parsedBody) => {
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
        <div className="compareMainComponent">
            {
                loading || searchLoading ? (
                    <div className="compareLoadingContainer">
                        <div className="spinner-border uploadingSpinner" role="status" >
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="compareMainComponent">
                        <div className="compareMainComponentActionCenter">
                            <div className="compareMainComponentActionBtn" title="close comparing window" id="closeCompareMainComponent">
                                <i class="fas fa-times"></i>
                            </div>
                            <div className="compareMainComponentActionBtn" id="infoContentToggle" title={generalInfo ? "Compare the content of documents" : "Show the general information of documents"}>
                                {!generalInfo ? (<i class="fas fa-info"></i>) : (<i class="fas fa-file-alt"></i>)}
                            </div>
                            <div className="compareMainComponentActionBtn" style={search ? { background: "#fff", color: "#441f74" } : {}} title="search and find semantically close sentences to a search query" id="comparisonSearch">
                                <i class="fas fa-search"></i>
                            </div>
                            <div className="compareMainComponentActionBtn" style={showPDF ? { background: "#fff", color: "#441f74" } : {}} title={showPDF ? "hide pdf files of the documents" : "show pdf files of the documents"} id="comparisonPDFToggle">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div className="compareMainComponentActionBtn" style={similarEncoding ? { background: "#fff", color: "#441f74" } : {}} title={similarEncoding ? "highlight similar sentences in both documents" : ""} id="comparisonSimilarEncodingToggle">
                                <i class="fas fa-equals"></i>
                            </div>
                            <div className="compareMainComponentActionBtn">
                                <p style={{ fontSize: "0.6em" }}>Similarity Score: <span style={{ fontSize: "1.6em", fontWeight: "bold" }}>{similarityScore.substring(0, 4)}</span></p>
                            </div>
                            {/* <div className="compareMainComponentActionBtn" title={"find similar sentences to a selected sentence"} id="compareSentenceSelectionMode">
                                <i class="fas fa-align-left"></i>
                            </div> */}
                        </div>
                        {
                            search ? (
                                <div className="comparisonSearchBox">
                                    <div style={{ flex: 20, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <div className="form-group" style={{ marginBottom: 0, width: "100%" }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="mainCompareSearchInput"
                                                placeholder="search and find relevant sentences ..."
                                                autoFocus={true}
                                            />
                                        </div>
                                    </div>
                                    <MDBBtn style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", width: "100%", backgroundColor: "#441f74" + " !important", cursor: "pointer", borderRadius: "5px" }} id="nonLinearSearchFuncIcon">
                                        <i class="fas fa-search"></i>
                                    </MDBBtn>
                                </div>
                            ) : null
                        }
                        <div className="compareMainComponentPaneContainer">
                            {
                                windows.map((window, index) => (
                                    <div className="compareMainComponentPane" style={index == windows.length - 1 ? { borderWidth: 0 } : { borderColor: window.document.cluster.color }}>
                                        {
                                            generalInfo ? (
                                                <div className="paneGeneralInfo">
                                                    <p style={{ fontSize: "1.2em", fontWeight: "bold", color: "#474747", width: "100%", textAlign: "center" }}>{window.document.title}</p>
                                                    <p style={{ marginTop: "1%", marginBottom: "1%", color: window.document.cluster.color, width: "100%", textAlign: "center", fontWeight: "bold", fontSize: "1.5em" }}>
                                                        <span style={{ padding: "1%", borderRight: "solid 2px #474747" }}>{window.document.publishYear}</span>
                                                        <span style={{ padding: "1%" }}>{window.document.publisher}</span>
                                                    </p>
                                                    <p style={{ width: "100%", textAlign: "center", marginTop: "2%", marginBottom: "2%" }}>{window.document.authors.map((author, index) => (<span style={index != window.document.authors.length - 1 ? { borderRight: "solid 2px " + window.document.cluster.color, padding: "1%" } : { border: 0, padding: "1%" }}>{author.name + " "}</span>))}</p>
                                                    <div className="paneWordCloudContainer" id={"pwcc" + index}></div>
                                                </div>
                                            ) : showPDF ? (
                                                <div style={{ width: "100%", height: "100%" }}>
                                                    <iframe
                                                        // src={`${require('../../data/2.pdf').default}#view=fitH`}
                                                        src={API_ADDRESS + "PDF?directory=" + reqID + "&pdfID=" + window.document.id + "#view=fitH"}
                                                        height="100%"
                                                        width="100%"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="paneContentContainer">
                                                    <div className="paneContentBody" id={"paneContentBody_"+index}>
                                                        {
                                                            window.parsedBody.map(div => (
                                                                <div>
                                                                    {
                                                                        div.content.map(divContent => divContent.type == "header" ? (
                                                                            <h3>{divContent.content}</h3>
                                                                        ) : divContent.type == "paragraph" ? (<p>
                                                                            {
                                                                                similarEncoding ? divContent.content.map(pContent =>
                                                                                    identifyKeywords(pContent, window.document.keywords, window.document.cluster.color)
                                                                                ) : divContent.content.map(pContent => (
                                                                                    <Element name={"sentence_" + pContent.sentenceId} style={{ display: "inline" }}>
                                                                                        <span>{pContent.content}</span>
                                                                                    </Element>
                                                                                ))
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
                                                                        )
                                                                        )
                                                                    }
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                    {
                                                        search ? (
                                                            <div className="paneSuggestion" style={{ background: hexToRgbA(window.document.cluster.color, .65) }}>
                                                                {
                                                                    window.suggestion == null ? (
                                                                        <p style={{ color: "#fff", textAlign: "center", fontWeight: "bold", padding: "1%" }}>search and find semantically close sentences to your search query</p>
                                                                    ) : (
                                                                        <div>
                                                                            {
                                                                                window.suggestion.map(sug => (
                                                                                    <div className="nonLinearSuggestionItem" style={{ borderColor: window.document.cluster.color }}>
                                                                                        <div style={{ flex: 1, position: "relative", borderLeft: "solid 3px " + window.document.cluster.color }}>
                                                                                            <div style={{ position: "absolute", top: parseInt(sug.position * 100) + "%", width: "100%", aspectRatio: "1/1", backgroundColor: window.document.cluster.color, display: "flex", alignItems: "center", fontSize: "70%", color: "#fff", fontWeight: "bold", justifyContent: "center" }}>
                                                                                                {parseInt(sug.position * 100) + "%"}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div style={{ flex: 9, padding: "1%" }}>
                                                                                            <h6 className="suggestionHeader">{findHeader(sug.divId, window.parsedBody)}</h6>
                                                                                            <p className="suggestionP">{"... " + sug.content + " ..."}</p>
                                                                                        </div>
                                                                                        <div className="suggestionItemClickable" doc={index} positionId={sug.sentenceId} style={{ position: "absolute", width: "100%", height: "100%", cursor: "pointer" }}></div>
                                                                                    </div>))
                                                                            }
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        ) : null
                                                    }
                                                </div>
                                            )
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default CompareMainComponent