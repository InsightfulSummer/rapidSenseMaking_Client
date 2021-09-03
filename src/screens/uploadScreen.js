import { MDBBtn, MDBContainer } from 'mdbreact';
import React, { useState } from 'react';
import MainScreenHeader from '../components/mainScreenHeader';

const UploadScreen = ({history}) => {
    const [documents, setDocuments] = useState([])
    const [dragOver, toggleDragOver] = useState(false)
    const [uploading, toggleUploading] = useState(true)
    const [loading, toggleLoading] = useState(false)
    

    const dropHandler = (event) => {
        event.preventDefault();
        toggleLoading(true)
        let files = event.dataTransfer.files
        let files_ = []
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                let file = files[i]
                if (file.type == "application/pdf" && !files_.includes(file.name.substring(0, file.name.length - 4)) && !documents.includes(file.name.substring(0, file.name.length - 4))) {
                    files_.push(file)
                }
            }
        }
        toggleLoading(false)
        if (files_.length > 0) {
            setDocuments(documents.concat(files_))
            toggleUploading(false)
        } else {
            alert("No pdf file was uploaded!")
        }
    }

    const fileInputHandler = (event) => {
        event.preventDefault();
        toggleLoading(true)
        let files = event.target.files
        let files_ = []
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                let file = files[i]
                if (file.type == "application/pdf" && !files_.includes(file.name.substring(0, file.name.length - 4)) && !documents.includes(file.name.substring(0, file.name.length - 4))) {
                    files_.push(file)
                }
            }
        }
        toggleLoading(false)
        if (files_.length > 0) {
            setDocuments(documents.concat(files_))
            toggleUploading(false)
        } else {
            alert("No pdf file was uploaded!")
        }
    }

    const dragOverHandler = (event) => {
        event.preventDefault();
        toggleDragOver(true)
    }

    const dragLeaveHandler = (event) => {
        event.preventDefault();
        toggleDragOver(false)
    }

    const removeDoc = (doc_) => {
        let tmpDocs = documents.filter(doc => {
            return doc != doc_
        })
        setDocuments(tmpDocs)
    }

    const processDocuments = () => {
        toggleLoading(true)
        setTimeout(()=>{
            history.push("/main")
        } , 500)
    }

    return (
        <div className="uploadScreen">
            <MDBContainer>
                {
                    loading ? (
                        <div className="uploadForm">
                            <div className="spinner-border uploadingSpinner" role="status" >
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p>Processing documents ...</p>
                            <p>Please wait.</p>
                        </div>
                    ) : uploading ? (
                        <form encType="multipart/form-data" className="uploadForm">
                            <div className="dragNDropupload" onDrop={dropHandler} onDragOver={dragOverHandler} onDragLeave={dragLeaveHandler} style={dragOver ? { background: "#d6d6d6" } : { background: "#fff" }}>
                                <i className="fas fa-chevron-down" style={{ fontSize: "2em", fontWeight: "bold" }}></i>
                                <p style={{ fontSize: "1.2em" }}>Drag and Drop your documents here ...</p>
                            </div>
                            <div className="uploadingBtnContainer">
                                <input className="uploadBTN" type="file" multiple={true} onChange={fileInputHandler} />
                                {
                                    documents.length ? (<MDBBtn className="uploadBTN uploadBTN_" onClick={() => { toggleUploading(false); console.log(documents) }}>Review current documents ({documents.length})</MDBBtn>) : null
                                }
                            </div>
                        </form>
                    ) : (
                        <div className="fileList uploadForm">
                            <div className="currentDocumentsContainer">
                                {
                                    documents.map(doc => (
                                        <div className="uploadDocumentItem">
                                            <div style={{ flex: 1, textAlign: "center", cursor: "pointer" }} title="open this document" onClick={()=>{window.open(window.URL.createObjectURL(doc))}}><i class="fas fa-file-pdf"></i></div>
                                            <div style={{ flex: 10, textAlign: "center", fontSize: "1em" }}>{
                                                doc.name.substring(0, 50) + (doc.name.length > 51 ? "..." : "")
                                            }</div>
                                            <div style={{ flex: 1, textAlign: "center", cursor: "pointer" }} title="remove this document" onClick={() => { removeDoc(doc) }}><i class="fas fa-times"></i></div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="uploadingBtnContainer">
                                <MDBBtn onClick={() => { toggleUploading(true) }} className="uploadBTN uploadBTN_">Add more documents</MDBBtn>
                                <MDBBtn onClick={processDocuments} className="uploadBTN">Process documents ({documents.length})</MDBBtn>
                            </div>
                        </div>
                    )
                }
            </MDBContainer>
        </div>
    )
}

export default UploadScreen;