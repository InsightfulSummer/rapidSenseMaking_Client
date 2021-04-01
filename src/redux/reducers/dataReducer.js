import SampleData from '../../data/sampleListOfDocuments.json'
import types from '../actions/types';
const initialState = {
    documents : SampleData
}

const reducer = (state = initialState, actions) => {
    switch (actions.type) {
        case types.FetchDocuments:
            return {
                ...state, documents : SampleData
            }

        case types.SortDocuments : 
            let tmpDocuments = state.documents;
            let ascending = actions.payload.ascending;
            let sortMetric = actions.payload.sortMetric
            tmpDocuments = tmpDocuments.sort((a,b)=>{
                if (ascending) {
                    return parseInt(a[sortMetric]) - parseInt(b[sortMetric])
                } else {
                    return parseInt(b[sortMetric]) - parseInt(a[sortMetric])
                }
            })
            return {...state, documents : tmpDocuments}
        default:
            return state;
    }
}

export default reducer 