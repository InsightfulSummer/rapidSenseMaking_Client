import React from 'react'
import { MDBIcon, MDBRow } from 'mdbreact'
import * as d3 from 'd3'

const SummaryComponent = ({doc_}) => {

    // possible api calls here ...
    let color_ = doc_.cluster.color
    return (
        <div className="summaryDiv" style={{borderColor:color_}}>
            <div className="summaryConvolutionMenu" style={{backgroundImage: 'linear-gradient(45deg, '+color_+', #ffffff)'}}>
                <i className="summaryConvolutionIcon fas fa-stopwatch" title="View the Summary by Skimming Lense"></i>
                <i className="summaryConvolutionIcon fas fa-exchange-alt" title="View the Summary by Non-linear Reading Lense"></i>
            </div>
            <div className="summaryBody"></div>
            <div className="summarySettings" style={{backgroundImage: 'linear-gradient(275deg, '+color_+', #ffffff)'}}>
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
            </div>
            {/* <p>{doc_.title}</p> */}
        </div>
    )
}

export default SummaryComponent