import React from 'react'
import { hexToRgbA } from '../../helper/helper'
import {
    Element
} from 'react-scroll'
import { MDBBtn } from 'mdbreact'
import { API_ADDRESS } from '../../helper/generalInfo'
import Store from '../../redux/store'

const NonLinearComponent = ({ doc_, parsedBody, loading, suggestions, showPDF, showSearch, mainLoading, showSimilarDocs, similarDocs, activeSentence }) => {

    let color_ = doc_.cluster.color
    const reqID = Store.getState().dataReducer.requestId

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

    // add a search input
    // global similar sentence findings ...
    return (mainLoading || loading) ? (
        <div className="NonLinearComponent" style={{ borderColor: color_, justifyContent: "center", alignItems: "center" }}>
            <div className="spinner-border" style={{ color: color_ }} role="status" >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    ) : (
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
                <i
                    class={showSearch ? "summarySettingsIcon fas fa-search activeSummarySettingsIcon" : "summarySettingsIcon fas fa-search"}
                    title="search and find relevant sentences ..."
                    id="nonLinearSearchIcon"
                />
                <i class={showPDF ? "summarySettingsIcon fas fa-file-pdf activeSummarySettingsIcon" : "summarySettingsIcon fas fa-file-pdf"} title="show the original pdf file of the document" id="pdfToggler"></i>
                <i
                    class={showSimilarDocs ? "summarySettingsIcon fas fa-project-diagram activeSummarySettingsIcon" : "summarySettingsIcon fas fa-project-diagram"}
                    title="find similar documents to a search term or a sentence"
                    id="nonLinearFindDocsIcon"
                />
            </div>
            {
                showPDF ? (
                    <div style={{ flex: 10 }}>
                        <iframe
                            // src={`${require('../../data/2.pdf').default}#view=fitH`}
                            src={API_ADDRESS + "PDF?directory=" + reqID + "&pdfID=" + doc_.id + "#view=fitH"}
                            height="100%"
                            width="100%"
                        />
                    </div>
                ) : (
                    <div style={{ flex: 10, display: "flex", flexDirection: "row" }}>
                        <div className="nonLinearBodyOfLens" id="nonLinearBodyOfLens">
                            {
                                showSearch ? (
                                    <div className="nonLinearSearchContainer">
                                        <div style={{ flex: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <div className="form-group" style={{ marginBottom: 0, width: "100%" }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="nonLinearSearchInput"
                                                    placeholder="search and find relevant sentences ..."
                                                />
                                            </div>
                                        </div>
                                        <MDBBtn style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", width: "100%", padding: "2%", backgroundColor: color_ + " !important", cursor: "pointer", borderRadius: "5px" }} id="nonLinearSearchFuncIcon">
                                            <i class="fas fa-search"></i>
                                        </MDBBtn>
                                    </div>
                                ) : null
                            }
                            {
                                parsedBody.map(div => (
                                    <div>
                                        {
                                            div.content.map(divContent => divContent.type == "header" ? (
                                                <h3>{divContent.content}</h3>
                                            ) : divContent.type == "paragraph" ? (<p>
                                                {
                                                    divContent.content.map(pContent => <Element name={"sentence_" + pContent.sentenceId} style={{ display: "inline" }}>
                                                        <span id={pContent.sentenceId} className="nonLinearSpanOfSentence" style={(activeSentence != null && activeSentence.type == "sentence clicked" && activeSentence.sentenceId == pContent.sentenceId) ? {textDecoration: "underline", color: color_, fontSize: "1.1em"} : {}}>{" " + pContent.content}</span>
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
                        {
                            showSimilarDocs ? (
                                <div className="nonLinearSuggestionContainer" style={{ backgroundColor: hexToRgbA(color_, 0.4) }}>
                                    {
                                        loading ? (
                                            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <div className="spinner-border" role="status" style={{ color: color_ }}>
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        ) : similarDocs.length == 0 ? (
                                            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "5%", textAlign: "center" }}>
                                                <p>Please select a sentence to find semantically similar documents ...</p>
                                            </div>
                                        ) : (
                                            <div>
                                                {
                                                    similarDocs.map(doc => (
                                                        <div className="similarDocItem" id={doc.id} style={{background: color_}}>
                                                            {doc.title}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                            ) : (
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
                            )
                        }
                    </div>
                )
            }
        </div>
    )
}

export default NonLinearComponent