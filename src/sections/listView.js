import { MDBAnimation, MDBCol, MDBRow, MDBInput } from 'mdbreact'
import React from 'react'
import ListItem from '../components/listItem'
import ActionCenter from '../components/actionCenter'

import { useSelector } from 'react-redux'

const ListView = () => {
    const { documents } = useSelector(state => ({
        documents: state.dataReducer.documents
    }))
    return (
        <MDBAnimation type="slideInLeft">
            <div className="listContainer" id="listContainer">
                <ActionCenter />
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