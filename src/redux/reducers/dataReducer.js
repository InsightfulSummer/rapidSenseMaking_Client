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
    
        default:
            return state;
    }
}

export default reducer 