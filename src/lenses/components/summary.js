import React from 'react'
import { MDBIcon, MDBRow } from 'mdbreact'
import * as d3 from 'd3'
import Slider from '../../screens/slider'
import {API_ADDRESS} from '../../helper/generalInfo'
import Store from '../../redux/store'

const SummaryComponent = ({ doc_, showAbstract, showPDF, expanded, loading, summaryContent, size }) => {

    // possible api calls here ...
    let color_ = doc_.cluster.color
    const reqID = Store.getState().dataReducer.requestId
    return loading ? (
        <div className="summaryDiv" style={{ borderColor: color_, justifyContent: "center", alignItems: "center" }}>
            <div className="spinner-border" style={{ color: color_ }} role="status" >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    ) : (
        <div className="summaryDiv" style={{ borderColor: color_ }}>
            <div className="summarySettings" style={{ backgroundImage: 'linear-gradient(45deg, ' + color_ + ', #ffffff)' }}>
                <i
                    className="summarySettingsIcon fas fa-times"
                    title="close the lense"
                    id="summaryCloseIcon"
                ></i>
                <i
                    className={expanded ? "summarySettingsIcon fas fa-expand activeSummarySettingsIcon": "summarySettingsIcon fas fa-expand"}
                    title="expand the lense"
                    id="summaryExpandIcon"
                ></i>
                <i
                    className={expanded ? "summarySettingsIcon fas fa-compress" : "summarySettingsIcon fas fa-compress activeSummarySettingsIcon"}
                    title="compress the lense"
                    id="summaryCompressIcon"
                ></i>
                <i className={showAbstract ? "summarySettingsIcon fas fa-quote-right activeSummarySettingsIcon" : "summarySettingsIcon fas fa-quote-right"} title="show the original abstract of the doucment" id="toggleOriginalAbstractIcon"></i>
                <i class={showPDF ? "summarySettingsIcon fas fa-file-pdf activeSummarySettingsIcon" : "summarySettingsIcon fas fa-file-pdf"} title="show the original pdf file of the document" id="pdfToggler"></i>
                <span className="summaryLensDevider"></span>
                <span className={size == 0.1 ? "summaryLensSizeIcon summaryLensSizeIconActive" : "summaryLensSizeIcon"} title="summarize the document to 10% of it's original length">.1</span>
                <span className={size == 0.5 ? "summaryLensSizeIcon summaryLensSizeIconActive" : "summaryLensSizeIcon"} title="summarize the document to 50% of it's original length">.5</span>
                <span className={size == 0.7 ? "summaryLensSizeIcon summaryLensSizeIconActive" : "summaryLensSizeIcon"} title="summarize the document to 70% of it's original length">.7</span>
            </div>
            <div className="summaryBody__">
                {
                    showPDF ? (
                        <iframe
                            // src={`${require('../../data/2.pdf').default}#view=fitH`}
                            src={API_ADDRESS+"PDF?directory="+reqID+"&pdfID="+doc_.id+"#view=fitH"}
                            height="100%"
                            width="100%"
                        />
                    ) : (
                        <div>
                            <h5 style={{width: "100%", textAlign: "center", fontWeight: "bold"}}>{doc_.title}</h5>
                            <p style={{fontSize: "1.1em", fontWeight: "400"}}>{
                                showAbstract ? doc_.abstract : summaryContent
                            }</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default SummaryComponent