import React, {useState} from 'react'
import sample from '../data/2.pdf'

const RenderPDF = () => {

    return (
        <div className="pdfContainer">
            {/* <embed src={"http://www.africau.edu/images/default/sample.pdf"}
                type="application/pdf"
                frameBorder="0"
                scrolling="auto"
                className="pdfEmbedTag"
            >
            </embed> */}

            <iframe 

                src={`${require('../data/2.pdf').default}#view=fitH`} 
                
                height="100%" 
                width="100%"
                />
        </div>
    )
}

export default RenderPDF