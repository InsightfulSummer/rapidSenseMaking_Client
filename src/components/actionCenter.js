import { MDBAnimation } from 'mdbreact'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {ToggleSortingInList, sortDocuments, ChangeSortMetric} from '../redux/actions/actions'

const ActionCenter = () => {

    const {sortingInList, sortingMetrics} = useSelector(state => ({
        sortingInList: state.interactionReducer.sortingInList,
        sortingMetrics : state.interactionReducer.sortingMetrics
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
                            {
                                sortingMetrics.map(metric => (
                                    <p className="sortingMenuOption" onClick={()=>{dispatch(ChangeSortMetric(metric.metric, metric.ascending)); dispatch(sortDocuments(metric.metric, metric.ascending));}}>{metric.label} <i></i></p>
                                ))
                            }
                        </div>
                    </MDBAnimation>
                ) : null
            }
        </div>
    )
}

export default ActionCenter