import { MDBAnimation, MDBCol, MDBRow, MDBInput } from 'mdbreact'
import React from 'react'
import ListItem from '../components/listItem'

import {useSelector} from 'react-redux'

const ListView = () => {
    const {documents} = useSelector(state => ({
        documents : state.dataReducer.documents
    }))
    return(
        <MDBAnimation type="slideInLeft">
            <div className="listContainer" id="listContainer">
                <div className="actionCenter">
                    <MDBRow>
                        <MDBCol size="10">
                            <MDBInput label="Search thorough documents ..." />
                        </MDBCol>
                        <MDBCol size="2">
                            <i className="fas fa-history sortingIcon_"></i>
                        </MDBCol>
                    </MDBRow>
                </div>
                {
                    documents.map(doc => (
                        <ListItem 
                            title={doc.title}
                            authors={doc.authors}
                            publishingYear={doc.publishYear}
                            abstract={doc.abstract}
                            id={doc._id}
                        />
                    ))
                }
            </div>
        </MDBAnimation>
    )
}

export default ListView