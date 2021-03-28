import types from "../actions/types";

const initialState = {
    activeDocumentId : null,
    sortMetric : "publishYear",
    cardinality : 5,
    activeAxisRange : null
}

const reducer = (state=initialState, actions) => {
    switch (actions.type) {
        case types.SetActiveDocument:
            return {
                ...state, activeDocumentId : actions.payload.documentId
            }

        case types.UnSetActiveDocument:
            return {
                ...state, activeDocumentId : null
            }

        case types.ChangeCardinality:
            return {
                ...state, cardinality : actions.payload.cardinality
            }

        case types.SetActiveAxisRange:
            return {
                ...state, activeAxisRange: actions.payload.activeAxisRange
            }

        case types.UnsetActiveAxisRange:
            return {
                ...state, activeAxisRange: null
            }
    
        default:
            return state;
    }
}

export default reducer