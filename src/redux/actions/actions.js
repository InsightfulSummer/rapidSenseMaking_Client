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

export const sortDocuments = (sortMetric, ascending=true) => {
    return {
        type : types.SortDocuments,
        payload : {
            sortMetric,
            ascending
        }
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

export const ToggleSortingInList = () => {
    return {
        type : types.ToggleSortingInList
    }
}

export const ToggleSortingInCanvas = () => {
    return {
        type : types.ToggleSortingInCanvas
    }
}

export const ChangeSortMetric = (sortMetric, ascending=true) => {
    return {
        type : types.ChangeSortMetric,
        payload : {
            sortMetric,
            ascending
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