import { MDBAnimation } from 'mdbreact'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {ToggleSortingInList, sortDocuments, ChangeSortMetric} from '../redux/actions/actions'

const ActionCenter = () => {

    const {sortingInList} = useSelector(state => ({
        sortingInList: state.interactionReducer.sortingInList
    }))

    const dispatch = useDispatch()

    return (
        <div className="actionCenter">
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div className="searchInListContainer">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon">
                                <i class="fas fa-search"></i>
                            </span>
                        </div>
                        <input type="text" className="form-control" placeholder="Search thorough documents ..." aria-label="Username" aria-describedby="basic-addon" />
                    </div>
                </div>
                <div className="sortingIconContainer_">
                    <i className="fas fa-sort-amount-up-alt sortingIcon_" onClick={()=>{dispatch(ToggleSortingInList())}} />
                </div>
            </div>
            {
                sortingInList ? (
                    <MDBAnimation type="slideInDown">
                        <div className="sortingMenuContainer">
                            <p className="sortingTitle">Sort By ...</p>
                            <p className="sortingMenuOption" onClick={()=>{dispatch(ChangeSortMetric("publishYear")); dispatch(sortDocuments("publishYear"));}}>Publishing Date (Ascending) <i></i></p>
                            <p className="sortingMenuOption" onClick={()=>{dispatch(ChangeSortMetric("publishYear", false)); dispatch(sortDocuments("publishYear", false));}}>Publishing Date (Descending) <i></i></p>
                            <p className="sortingMenuOption" onClick={()=>{dispatch(ChangeSortMetric("relevancy", false)); dispatch(sortDocuments("relevancy", false));}}>Relativity <i></i></p>
                            <p className="sortingMenuOption" onClick={()=>{}}>Relativity to a custom document <i></i></p>
                            <p className="sortingMenuOption" onClick={()=>{dispatch(ChangeSortMetric("citing", false)); dispatch(sortDocuments("citing", false));}}>Most Cited Documents <i></i></p>
                            <p className="sortingMenuOption" onClick={()=>{dispatch(ChangeSortMetric("cited", false)); dispatch(sortDocuments("cited", false));}}>Most Citing Documents <i></i></p>
                        </div>
                    </MDBAnimation>
                ) : null
            }
        </div>
    )
}

export default ActionCenter