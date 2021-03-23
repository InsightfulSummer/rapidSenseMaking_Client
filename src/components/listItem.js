import React from 'react'
import { MDBAnimation } from 'mdbreact'
import { Element, scroller } from 'react-scroll'

import { useDispatch, useSelector } from 'react-redux'
import { SetActiveDocument, UnSetActiveDocument } from '../redux/actions/actions'

const ListItem = ({ title, authors, publishingYear, abstract, id }) => {

    let subAbstract = abstract.substr(0, 100)
    subAbstract = subAbstract.substr(0, subAbstract.lastIndexOf(" "))

    const dispatch = useDispatch()

    const { activeDocumentId } = useSelector(state => ({
        activeDocumentId: state.interactionReducer.activeDocumentId
    }))

    const ItemClick = () => {
        if (activeDocumentId == id) {
            dispatch(UnSetActiveDocument())
        } else {
            // set active document 
            dispatch(SetActiveDocument(id))
            // scroll to this item
            setTimeout(()=>{
                scroller.scrollTo("document_"+id, {
                    duration : 1500,
                    smooth: true,
                    containerId : "listContainer",
                    offset: -15
                })
            } , 150)
        }
    }

    return (
        <Element name={"document_" + id}>
            <MDBAnimation>
                <div className={activeDocumentId == id ? "listItem activeListItem" : "listItem"} onClick={ItemClick}>
                    <div style={{ padding: "2%" }}>
                        <p className="itemTitle">{title}</p>
                        <p className="authors">
                            {authors.map(author => (author.name + " - "))}
                            <span className="publishingYear"><br />{publishingYear}</span>
                        </p>
                        <p className="itemAbstract">{activeDocumentId == id ? abstract : subAbstract + " ..."}</p>
                    </div>
                    {/* <div className="clusterIndicator " /> */}
                </div>
            </MDBAnimation>
        </Element>
    )
}

export default ListItem