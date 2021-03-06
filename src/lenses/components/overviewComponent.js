import React from 'react'
import { useEffect } from 'react'
import WordCloud from 'wordcloud'


const OverviewComponent = ({doc, publishYearRange, refR, publishYearMargin, authorsExpanded}) => {
    let color_ = doc.cluster.color
    return (
        <div className="overviewComponent">
            <div className="overviewComponent_publisherContainer" style={{background: "linear-gradient(to top,"+color_+" , #fff)", borderColor: color_}}>
                <div className="overviewComponent_closeIconContainer" title="close overview lens">
                    <i class="fas fa-times"></i>
                </div>
                <div className="overviewComponent_publisher" title="publisher of this article" ><i class="fas fa-book" style={{margin: "2%"}}></i>{doc.publisher}</div>
            </div>
            <div className="overviewComponent_mainBody">
                <div className="overviewComponent_firstRow">
                    <div className="overviewComponent_titleContainer" style={{borderColor: color_}}>{doc.title}</div>
                    <div className="overviewComponent_refContainer" >
                        <div className="overviewComponent_refFix" style={{borderColor: color_}}></div>
                        <div className="overviewComponent_refBack" style={{background: "radial-gradient(#fff, "+color_+");"}}>
                            <div className="overviewComponent_refIndicator" style={{borderColor: color_, width:refR+"%"}}>
                                {doc.outlinks.length} <span style={{fontSize: ".5em", fontWeight:"100"}}>Refs.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overviewComponent_publishDate" style={{background: "linear-gradient(to right, #fff, "+color_+");"}} title="publishing date">
                    <div className="overviewComponent_publishDateBegin">{publishYearRange[0]}</div>
                    <div className="overviewComponent_publishDateIndicator">
                        <div id="publishDateBaseShape" style={{marginLeft: publishYearMargin+"%"}}>
                            <div id="publishDateBaseShape1" style={{background: publishYearMargin > 60 ? "#fff" : color_, color: publishYearMargin > 60 ? color_ : "#fff"}}>{doc.publishingDate.substring(0,4)}</div>
                            <div id="publishDateBaseShape2" style={{background: publishYearMargin > 60 ? "#fff" : color_}}></div>
                        </div>
                    </div>
                    <div className="overviewComponent_publishDateEnd">{publishYearRange[1]}</div>
                </div>
                {
                    authorsExpanded ? (
                        <div className="overviewComponent_expandedAuthorsContainer" title="list of authors">
                            <div className="overviewComponent_expandedAuthors" style={{borderColor: color_}}><i class="fas fa-pen-nib"></i> | <i class="fas fa-chevron-up" style={{fontWeight: "bold", cursor: "pointer"}} id="expandAuthors"></i></div>
                            {
                                doc.authors.map(author => (
                                    <div className="overviewComponent_expandedAuthors" style={{borderColor: color_}}>{author.name}</div>
                                ))
                            }
                        </div>
                    ) : (
                        <div className="overviewComponent_authorsContainer" title="list of authors">
                            <i class="fas fa-pen-nib"></i>
                            {
                                doc.authors.length > 1 ? (
                                    doc.authors.slice(0,2).map((author, index) => (
                                        <div className="overviewComponent_authors" style={index == doc.authors.length - 1 ? {} : { borderRight: "solid 1px " + color_ }}>{author.name}</div>
                                    ))
                                ) : (
                                    <div className="overviewComponent_authors">{doc.authors[0].name}</div>
                                )
                            }
                            {
                                doc.authors.length > 2 ? (
                                    <i class="fas fa-chevron-down" style={{fontWeight: "bold", cursor: "pointer", marginRight: "2%", marginLeft: "2%"}} title="show all authors" id="expandAuthors"></i>
                                ) : null
                            }
                        </div>
                    )
                }
                {
                    authorsExpanded ? null : (
                        <div className="overviewComponent_wordCloudContainer" style={{borderColor: color_}} id="overviewComponent_wordCloudContainer"></div>
                    )
                }
            </div>
        </div>
    )
}

export default OverviewComponent