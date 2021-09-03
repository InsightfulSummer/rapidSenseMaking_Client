import React from 'react'
import { MDBAnimation, MDBIcon, MDBNavbar, MDBNavItem } from 'mdbreact'
import logo from '../images/logo.png'
import { useSelector, useDispatch } from 'react-redux'
import {toggleListView} from '../redux/actions/actions'

const MainScreenHeader = () => {


    const dispatch = useDispatch()

    return(
        <MDBNavbar dark color="indigo">
            <div style={{flex: 1}}>
                <img style={{width: "100%"}} src={logo} />
            </div>
            <div style={{flex: 25}}></div>
        </MDBNavbar>
    )
}

export default MainScreenHeader