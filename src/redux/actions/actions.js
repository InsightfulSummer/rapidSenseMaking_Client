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