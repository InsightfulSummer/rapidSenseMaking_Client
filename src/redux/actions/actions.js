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

export const SetActiveAxisRange = (start, end) => {
    return {
        type : types.SetActiveAxisRange,
        payload : {
            activeAxisRange : [start, end]
        }
    }
}

export const UnsetActiveAxisRange = () => {
    return {
        type : types.UnsetActiveAxisRange
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