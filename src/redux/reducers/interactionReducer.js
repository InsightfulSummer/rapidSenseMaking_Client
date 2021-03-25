import types from "../actions/types";

const initialState = {
    activeDocumentId : null,
    sortMetric : "publishYear"
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
    
        default:
            return state;
    }
}

export default reducer