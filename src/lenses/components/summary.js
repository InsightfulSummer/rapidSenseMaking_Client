import React from 'react'
import { MDBIcon, MDBRow } from 'mdbreact'
import * as d3 from 'd3'

const SummaryComponent = ({ doc_, title, summaryBody, showAbstract, showPDF, abstract }) => {

    // possible api calls here ...
    let color_ = doc_.cluster.color
    return (
        <div className="summaryDiv" style={{ borderColor: color_ }}>
            <div className="summaryConvolutionMenu" style={{ backgroundImage: 'linear-gradient(45deg, ' + color_ + ', #ffffff)' }}>
                <i className="summaryConvolutionIcon fas fa-stopwatch" title="View the Summary by Skimming Lense"></i>
                <i className="summaryConvolutionIcon fas fa-exchange-alt" title="View the Summary by Non-linear Reading Lense"></i>
            </div>
            <div className="summaryBody">
                {
                    showPDF ? (
                        <iframe

                            src={`${require('../../data/2.pdf').default}#view=fitH`}
                            height="100%"
                            width="100%"
                        />
                    ) : (
                        <div>
                            <h5>{title}</h5>
                            <p>{
                                showAbstract ? abstract : abstract
                            }</p>
                        </div>
                    )
                }
            </div>
            <div className="summarySettings" style={{ backgroundImage: 'linear-gradient(275deg, ' + color_ + ', #ffffff)' }}>
                <i
                    className="summarySettingsIcon fas fa-times"
                    title="close the lense"
                    id="summaryCloseIcon"
                ></i>
                <i
                    className="summarySettingsIcon fas fa-expand"
                    title="expand the lense"
                    id="summaryExpandIcon"
                ></i>
                <i
                    className="summarySettingsIcon fas fa-compress"
                    title="compress the lense"
                    id="summaryCompressIcon"
                ></i>
                <i className="summarySettingsIcon fas fa-sliders-h" title="summarize a specific range of this document"></i>
                <i className="summarySettingsIcon fas fa-quote-right" title="show the original abstract of the doucment" id="toggleOriginalAbstractIcon"></i>
                <i class="summarySettingsIcon fas fa-file-pdf" title="show the original pdf file of the document" id="pdfToggler"></i>
            </div>
            {/* <p>{doc_.title}</p> */}
        </div>
    )
}

export default SummaryComponent