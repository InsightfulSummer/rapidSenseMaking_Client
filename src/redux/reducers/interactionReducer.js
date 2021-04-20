import SampleData from '../../data/sampleListOfDocuments.json';
import types from "../actions/types"; 

const initialState = {
    activeDocumentId: null,
    sortMetric: "publishYear",
    ascending: true,
    cardinality: 5,
    activeAxisRange: null,
    sortingInList: false,
    sortingInCanvas: false,
}



const reducer = (state = initialState, actions) => {
    switch (actions.type) {
        case types.SetActiveDocument:
            return {
                ...state, activeDocumentId: actions.payload.documentId
            }

        case types.UnSetActiveDocument:
            return {
                ...state, activeDocumentId: null
            }

        case types.ChangeCardinality:
            return {
                ...state, cardinality: actions.payload.cardinality
            }

        case types.SetActiveAxisRange:
            return {
                ...state, activeAxisRange: actions.payload.activeAxisRange
            }

        case types.UnsetActiveAxisRange:
            return {
                ...state, activeAxisRange: null
            }

        case types.ToggleSortingInList:
            return {
                ...state, sortingInList: !state.sortingInList
            }

        case types.ToggleSortingInCanvas:
            return {
                ...state, sortingInCanvas: !state.sortingInCanvas
            }

        case types.ChangeSortMetric:
            return {
                ...state, sortMetric: actions.payload.sortMetric, ascending: actions.payload.ascending
            }

        default:
            return state;
    }
}

export default reducer