import React from 'react'
import { MDBAnimation, MDBIcon, MDBNavbar, MDBNavItem } from 'mdbreact'

import { useSelector, useDispatch } from 'react-redux'
import {toggleListView} from '../redux/actions/actions'

const MainScreenHeader = () => {

    const {listViewOpen} = useSelector(state => ({
        listViewOpen : state.componentReducer.listViewOpen
    }))

    const dispatch = useDispatch()

    return(
        <MDBNavbar dark color="indigo">
            <MDBNavItem tag="div" left>
                {
                    !listViewOpen ? (
                        <MDBAnimation type="bounceInLeft">
                            <MDBIcon icon="ellipsis-h" className="headerIcon" onClick={()=>{dispatch(toggleListView())}} />
                        </MDBAnimation>
                    ) : (
                        <MDBAnimation type="bounceIn">
                            <MDBIcon icon="times" className="headerIcon" onClick={()=>{dispatch(toggleListView())}} />
                        </MDBAnimation>
                    )
                }
            </MDBNavItem>
            <MDBNavItem tag="div" center>
                {/* <MDBIcon far icon="list-alt" /> */}
            </MDBNavItem>
            <MDBNavItem tag="div" right>
                {/* <MDBIcon far icon="list-alt" /> */}
            </MDBNavItem>
        </MDBNavbar>
    )
}

export default MainScreenHeader