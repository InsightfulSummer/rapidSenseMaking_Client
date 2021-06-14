import React from 'react'
import {

} from 'mdbreact'

const NonLinearComponent = ({doc_}) => {
    let color_ = doc_.cluster.color
    return(
        <div className="NonLinearComponent" style={{borderColor: color_}}>
            <div className="NonLinearComponent_Settings_Convolution" style={{background: 'linear-gradient(90deg, ' + color_ + ', #ffffff)'}}>

            </div>
            <div className="NonLinearComponent_PaperContainer">

            </div>
            <div className="NonLinearComponent_AlternativeSentences">
                 
            </div>
        </div>
    )
}

export default NonLinearComponent