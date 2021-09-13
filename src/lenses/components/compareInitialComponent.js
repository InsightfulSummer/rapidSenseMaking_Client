import React from 'react'

const CompareInitialComponent = ({windows}) => {
    const checkReady = () => {
        let ready = true
        windows.map(window => {
            if (window.document != null) {
                ready =true
            } else {
                ready = false
            }
        })
        return ready
    }

    return (
        <div className="compareBody_1">
            <div className="compareActionCenter_1">
                {/* <div className={windows.length == 2 ? "compareActionButton_1 activeCompareBtn" : "compareActionButton_1"} title={windows.length == 2 ? "" : "compare only two documents"} id="compareTwoDocs">II</div>
                <div className={windows.length == 3 ? "compareActionButton_1 activeCompareBtn" : "compareActionButton_1"} title={windows.length == 3 ? "" : "compare only three documents"} id="compareThreeDocs">III</div> */}
                <div className={checkReady() ? "compareActionButton_1 readyToCompare" : "compareActionButton_1"} style={checkReady() ? {cursor: "pointer", background: "#441f74", borderBottomRightRadius: "10px", color: "#FFF"} : {cursor:"default", color: "#848484"}} title={checkReady() ? "start comparing selected documents" : "select documents to start comparing"}>
                    <i class="fas fa-greater-than"></i>
                </div>
            </div>
            <div className="compareWindowsContainer_1">
                {
                    windows.map ((window, index) => (
                        <div className="compareWindow_1">
                            {window.document == null ? (
                                <p className="noDocP">select your {index == 0 ? "first" : index == 1 ? "second" : "third"} document for comparison.</p>
                            ) : (
                                <div className="compareWindowDocumentContainer_1" style={{background : "linear-gradient(to top, "+window.document.cluster.color+", #fff)"}}>
                                    <div className={"closeCompareWindowDocument "+index} title="remove this document">
                                        <i class={"fas fa-trash-alt "+index }></i>
                                    </div>
                                    <p>{window.document.title}</p>
                                    <p style={{marginTop: "2%"}}>{window.document.publishYear}</p>
                                    <p>{
                                        window.document.authors.length > 1 ? window.document.authors[0].name + " et al." : window.document.authors[0].name 
                                    }</p>
                                </div>
                            )}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default CompareInitialComponent