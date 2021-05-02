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

export const CreateRandomLinks = () => {
    return {
        type : types.CreateRandomLinks
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

    // for visualization 2
export const SetZ = (z) => {
    return {
        type : types.SetZ,
        payload : {
            z
        }
    }
}

export const setSliderHeightPorportion = (sliderHeightPorportion) => {
    return {
        type : types.SetSliderHeightPorportion,
        payload : {
            sliderHeightPorportion
        }
    }
}

// clustering related actions

export const autoCluster = (n_clusters) => {
    return {
        type : types.AutoClustering,
        payload : {
            n_clusters
        }
    }
}

export const addOneCluster = (cluster_name=null) => {
    return {
        type : types.AddOneCluster,
        payload : {
            cluster_name
        }
    }
}

export const removeOneCluster = (cluster_id) => {
    return {
        type : types.RemoveOneCluster,
        payload : {
            cluster_id
        }
    }
}

export const changeClusterOfDocument = (document_id, cluster_id) => {
    return {
        type : types.ChangeClusterOfDocument,
        payload : {
            document_id, cluster_id
        }
    }
}   

export const renameCluster = (cluster_id, new_name) => {
    return {
        type : types.RenameCluster,
        payload : {
            cluster_id, new_name
        }
    }
}