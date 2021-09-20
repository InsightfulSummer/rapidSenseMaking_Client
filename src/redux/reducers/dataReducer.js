import types from '../actions/types';
import * as d3 from 'd3'

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const initialState = {
    documents : [],
    requestId : null,
    clusters : [],
    groups : []
}

const reducer = (state = initialState, actions) => {
    switch (actions.type) {
        case types.SetDocuments : 
            return {...state, documents: actions.payload.documents}

        case types.ExtractClusters : 
            let tmpClusters = state.clusters
            let tmpDocuments_ = state.documents
            tmpDocuments_.map(document => {
                let clusterObject = {
                    id : document.cluster_id,
                    name : document.cluster_label,
                    color : colorScale(document.cluster_id),
                    wordCloud : document.cluster_wordCloud.split(" || ")
                }
                let newCluster = tmpClusters.find(cluster => {
                    return cluster.id == document.cluster_id
                })
                if (newCluster == undefined){
                    tmpClusters.push(clusterObject)
                }
                document.cluster = clusterObject
            })
            return {...state, clusters: tmpClusters, documents: tmpDocuments_}

        case types.SortDocuments : 
            let tmpDocuments = state.documents;
            let ascending = actions.payload.ascending;
            let sortMetric = actions.payload.sortMetric
            tmpDocuments = tmpDocuments.sort((a,b)=>{
                let a_ = sortMetric == "publishingDate" ? parseInt(a[sortMetric].substring(0,4)) : sortMetric == "outlinks" ? a[sortMetric].length : a[sortMetric].replace(/[^a-zA-Z ]/g, "").toUpperCase()
                let b_ = sortMetric == "publishingDate" ? parseInt(b[sortMetric].substring(0,4)) : sortMetric == "outlinks" ? b[sortMetric].length : b[sortMetric].replace(/[^a-zA-Z ]/g, "").toUpperCase()
                if (sortMetric != "title") {
                    if (ascending) {
                        return a_ - b_
                    } else {
                        return b_ - a_
                    }
                } else {
                    if (a_ < b_) {
                        return ascending ? -1 : +1
                    } 
                    if (a_ > b_) {
                        return ascending ? +1 : -1
                    }
                    return 0
                }
            })
            return {...state, documents : tmpDocuments}

        case types.SetRequestId : 
            return {...state, requestId: actions.payload.requestId}
        default:
            return state;
    }
}

export default reducer 

// case types.AddOneCluster : 
// let tmpClusters_ = state.clusters;
// let last_id = tmpClusters_[tmpClusters_.length-1].id
// let cluster_name_ = actions.payload.cluster_name ? actions.payload.cluster_name : "cluster_"+(last_id+1)
// tmpClusters_.push({
//     name : cluster_name_,
//     color : colorScale(last_id+1),
//     id : last_id+1
// })
// return {...state, clusters: tmpClusters_}

// case types.RemoveOneCluster : 
// let tmpClusters__ = state.clusters.filter(cluster => {
//     return cluster.id != actions.payload.cluster_id
// })

// let tmpDocuments__ = state.documents
// tmpDocuments__.filter(doc_f => {
//     return doc_f.cluster.id == actions.payload.cluster_id
// }).map(doc_m => {
//     let index__ = Math.floor(Math.random()*tmpClusters__.length + 1)
//     doc_m.cluster = tmpClusters__[index__-1]
// })
// return {...state, clusters: tmpClusters__, documents: tmpDocuments__}

// case types.ChangeClusterOfDocument :
// let _tmpDocs_ = state.documents;
// let _index__ = _tmpDocs_.findIndex(item => {
//     return item.id == actions.payload.document_id
// })
// let clusterItem = state.clusters.find(item => {
//     return item.id == actions.payload.cluster_id
// })
// _tmpDocs_[_index__].cluster = clusterItem
// return {...state, documents: _tmpDocs_}

// case types.RenameCluster :
// let tmpClusters___ = state.clusters;
// let _index_ = tmpClusters___.findIndex(item => {
//     return item.id == actions.payload.cluster_id
// })
// tmpClusters___[_index_].name = actions.payload.new_name
// return {...state, clusters: tmpDocuments__}

// case types.AddOneGroup :
// let tmpGroups = state.groups; //tmpClusters_[tmpClusters_.length-1].id
// let last_group_id = tmpGroups.length > 0 ? tmpGroups[tmpGroups.length-1].id : 0
// let group_name = actions.payload.group_name ? actions.payload.group_name : "group_"+(last_group_id+1)
// tmpClusters_.push({
//     name : group_name,
//     id : last_group_id+1
// })
// return {...state, groups: tmpGroups}

// case types.RemoveOneGroup : 
// let tmpGroups_ = state.groups.filter(group => {
//     return group.id != actions.payload.group_id
// })

// let tmp_Documents__ = state.documents
// tmp_Documents__.filter(doc => {
//     return doc.group.id == actions.payload.group_id
// }).map(doc_m => {
//     doc_m.group = null
// })
// return {...state, groups: tmpGroups_, documents: tmp_Documents__}
// case types.RenameGroup :
// let tmpGroups__ = state.groups;
// let groupIndex = tmpGroups__.findIndex(item => {
//     return item.id == actions.payload.group_id
// })
// tmpGroups__[groupIndex].name = actions.payload.new_name
// return {...state, groups: tmpGroups__}
// case types.ChangeGroupOfDocument : 
// let _tmp_Documents = state.documents;
// let documentIndex = _tmp_Documents.findIndex(item => {
//     return item.id == actions.payload.document_id
// })
// let groupItem = state.groups.find(item => {
//     return item.id == actions.payload.group_id
// })
// _tmp_Documents[documentIndex].group = groupItem