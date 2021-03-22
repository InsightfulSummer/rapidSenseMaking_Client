import React from 'react'
import { MDBCol, MDBContainer, MDBRow } from 'mdbreact'
import MainScreenHeader from '../components/mainScreenHeader'
import ListView from '../sections/listView'
import MainSection from '../sections/mainSection'

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
                            <MainSection />
                        </MDBCol>
                    </MDBRow>
                ) : (
                    <MDBContainer>
                        <MainSection />
                    </MDBContainer>
                )
            }
        </div>
    )
}

export default MainScreen