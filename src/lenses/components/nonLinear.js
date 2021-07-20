import React from 'react'
import {

} from 'mdbreact'
import {hexToRgbA} from '../../helper/helper'

const NonLinearComponent = ({doc_, parsedBody, loading, suggestions}) => {
    let color_ = doc_.cluster.color
    return(
        <div className="NonLinearComponent" style={{borderColor: color_}}>
            <div className="nonLinearLensActionsCenter" style={{ backgroundImage: 'linear-gradient(45deg, ' + color_ + ', #ffffff)' }}>

            </div>
            <div className="nonLinearBodyOfLens">
                {
                    parsedBody.map(div => (
                        <div>
                            {
                                div.content.map(divContent => divContent.type == "header" ? (
                                    <h3>{divContent.content}</h3>
                                ) : divContent.type == "paragraph" ? ( <p>
                                    {
                                        divContent.content.map(pContent => <span className="nonLinearSpanOfSentence">{" "+pContent.content}</span>)
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
            <div className="nonLinearSuggestionContainer" style={{backgroundColor : hexToRgbA(color_, 0.4)}}>
                {
                    !loading ? (
                        <div style={{width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <div className="spinner-border" role="status" style={{color: color_}}>
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : suggestions.length == 0 ? (
                        <div style={{width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "5%", textAlign: "center"}}>
                            <p>Please select a sentence to find its relevant sentences in other sections of the document ...</p>
                        </div>
                    ) : (
                        <div></div>
                    )
                }
            </div>
        </div>
    )
}

export default NonLinearComponent