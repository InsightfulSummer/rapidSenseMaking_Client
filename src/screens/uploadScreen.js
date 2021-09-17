import axios from 'axios';
import { MDBBtn, MDBContainer, MDBProgress } from 'mdbreact';
import React, { useState } from 'react';
import MainScreenHeader from '../components/mainScreenHeader';
import {API_ADDRESS} from '../helper/generalInfo'
import {useDispatch} from 'react-redux'
import {SetRequestId} from '../redux/actions/actions'

const UploadScreen = ({history}) => {

    const dispatch = useDispatch()

    const [documents, setDocuments] = useState([])
    const [dragOver, toggleDragOver] = useState(false)
    const [uploading, toggleUploading] = useState(true)
    const [loading, toggleLoading] = useState(false)
    const [loadingPercentage, setLoadingPercentage] = useState(0)
    

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

    const processDocuments = async () => {
        // api calls
        if (documents.length > 0) {
            toggleLoading(true)
            // create a random request id here and store it in the redux store
            // generating random request id
            let reqID = new Date().getTime()+"__"+(Math.floor((Math.random() * 100000) + 1))
            dispatch(SetRequestId(reqID))
            // uploading documents
            await Promise.all(documents.map( async (document, index) => {
                let formData = new FormData()
                formData.append('reqID', reqID)
                formData.append('iterationNum', index+1)
                formData.append('pdfFile', document)
                await axios.post(API_ADDRESS + "/pdfUploading", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(data => {
                    console.log(data.data)
                })
                .catch(err => console.log(err))
                setLoadingPercentage(index+1)
            }))
            // clustering documents 

            // navigating to the main screen
            setTimeout(()=>{
                history.push("/main")
            } , 500)
        }
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
                            <p>{loadingPercentage < documents.length ? "Processing documents ..." : "clustering documents ..."}</p>
                            <p>Please wait.</p>
                            <MDBProgress value={(loadingPercentage/documents.length)*100} className="my-2" />
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