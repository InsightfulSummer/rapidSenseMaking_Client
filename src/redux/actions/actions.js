import types from './types'

// component-related actions

export const toggleListView = () => {
    return {
        type : types.ToggleListView
    }
}

// data-related actions 

export const fetchDocuments = () => {
    return {
        type : types.FetchDocuments
    }
}

// interaction-related actions

export const SetActiveDocument = (documentId) => {
    return {
        type : types.SetActiveDocument,
        payload : {
            documentId
        }
    }
}

export const UnSetActiveDocument = () => {
    return {
        type : types.UnSetActiveDocument
    }
}

export const ChangeCardinality = (cardinality) => {
    return {
        type : types.ChangeCardinality,
        payload : {
            cardinality
        }
    }
}

// canvas-related actions
export const SetDimensions = (width, height) => {
    return {
        type : types.SetDimensions,
        payload : {
            width, height
        }
    }
}