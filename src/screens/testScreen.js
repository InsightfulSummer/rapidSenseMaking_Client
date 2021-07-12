import React from 'react'
import Data from '../data/res.json'

const TestScreen = () => {
    console.log(Data)
    return (
        <div>
            {
                Data.map(div => (
                    <div>
                        {
                            div.content.map(divContent => divContent.type == "header" ? (
                                <h3>{divContent.content}</h3>
                            ) : divContent.type == "paragraph" ? ( <p>
                                {
                                    divContent.content.map(pContent => pContent.type == "textualContentInP" ? (pContent.content) : 
                                    pContent.type == "refContentInP" ? (<sapn className="refSpan">
                                        {pContent.content}
                                    </sapn>) : 
                                    (<span></span>))
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
    )
}

export default TestScreen