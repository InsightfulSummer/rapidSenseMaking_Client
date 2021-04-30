import React from 'react'
import { MDBCol, MDBContainer, MDBRow } from 'mdbreact'
import MainScreenHeader from '../components/mainScreenHeader'
import ListView from '../sections/listView'
// import MainSection from '../sections/mainSection'
import MainSection_ from '../sections/mainSection2'

import {useSelector} from 'react-redux'

const MainScreen = () => {

    const {listViewOpen} = useSelector(state => ({
        listViewOpen : state.componentReducer.listViewOpen
    }))
    
    return(
        <div>
            <MainScreenHeader />
            {
                listViewOpen ? (
                    <MDBRow>
                        <MDBCol size="3">
                            <ListView />
                        </MDBCol>
                        <MDBCol size="9">
                            <MainSection_ />
                        </MDBCol>
                    </MDBRow>
                ) : (
                    <MDBRow>
                        <MDBCol size="1">
                        </MDBCol>
                        <MDBCol size="10">
                            <MainSection_ />
                        </MDBCol>
                        <MDBCol size="1">
                        </MDBCol>
                    </MDBRow>
                )
            }
        </div>
    )
}

export default MainScreen