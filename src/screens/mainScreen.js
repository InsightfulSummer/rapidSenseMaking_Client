import React from 'react'
import { MDBCol, MDBContainer, MDBRow } from 'mdbreact'
import MainScreenHeader from '../components/mainScreenHeader'
import ListView from '../sections/listView'
// import MainSection from '../sections/mainSection'
import MainSection_ from '../sections/mainSection2'

import { useSelector } from 'react-redux'

const MainScreen = () => {

    return (
        <div>
            <MainScreenHeader />
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ flex: 1 }}></div>
                <div style={{ flex: 25 }}>
                    <MainSection_ />
                </div>
                <div style={{ flex: 1 }}></div>
            </div>
        </div>
    )
}

export default MainScreen