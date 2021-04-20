import SampleData from '../../data/sampleListOfDocuments.json'
import types from '../actions/types';
import * as d3 from 'd3'

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const initialState = {
    documents : SampleData,
    clusters : [{
        name : "mainCluster",
        id : 1,
        color : colorScale(1)
    }]
}

const reducer = (state = initialState, actions) => {
    switch (actions.type) {
        case types.FetchDocuments:
            return {
                ...state, documents : SampleData
            }

        case types.SortDocuments : 
            let tmpDocuments = state.documents;
            let ascending = actions.payload.ascending;
            let sortMetric = actions.payload.sortMetric
            tmpDocuments = tmpDocuments.sort((a,b)=>{
                if (ascending) {
                    return parseInt(a[sortMetric]) - parseInt(b[sortMetric])
                } else {
                    return parseInt(b[sortMetric]) - parseInt(a[sortMetric])
                }
            })
            return {...state, documents : tmpDocuments}

        case types.AutoClustering : 
            let tmpClusters = state.clusters;
            let tmpDocuments_ = state.documents;
            for (let i=2; i<= actions.payload.n_clusters && tmpClusters.length < actions.payload.n_clusters; i++){
                tmpClusters.push({
                    name : "cluster_"+ i,
                    color : colorScale(i),
                    id : i
                })
            }
            tmpDocuments_.map(doc => {
                let index_ = Math.floor(Math.random()*tmpClusters.length + 1)
                doc.cluster = tmpClusters[index_-1]
            })
            return {...state, clusters: tmpClusters, documents: tmpDocuments_}

        case types.AddOneCluster : 
            let tmpClusters_ = state.clusters;
            let last_id = tmpClusters_[tmpClusters_.length-1].id
            let cluster_name_ = actions.payload.cluster_name ? actions.payload.cluster_name : "cluster_"+(last_id+1)
            tmpClusters_.push({
                name : cluster_name_,
                color : colorScale(last_id+1),
                id : last_id+1
            })
            return {...state, clusters: tmpClusters_}

        case types.RemoveOneCluster : 
            let tmpClusters__ = state.clusters.filter(cluster => {
                return cluster.id != actions.payload.cluster_id
            })

            let tmpDocuments__ = state.documents
            tmpDocuments__.filter(doc_f => {
                return doc_f.cluster.id == actions.payload.cluster_id
            }).map(doc_m => {
                let index__ = Math.floor(Math.random()*tmpClusters__.length + 1)
                doc_m.cluster = tmpClusters__[index__-1]
            })
            return {...state, clusters: tmpClusters__, documents: tmpDocuments__}

        case types.ChangeClusterOfDocument :
            let _tmpDocs_ = state.documents;
            let _index__ = _tmpDocs_.findIndex(item => {
                return item.id == actions.payload.document_id
            })
            let clusterItem = state.clusters.find(item => {
                return item.id == actions.payload.cluster_id
            })
            _tmpDocs_[_index__].cluster = clusterItem
            return {...state, documents: _tmpDocs_}

        case types.RenameCluster :
            let tmpClusters___ = state.clusters;
            let _index_ = tmpClusters___.findIndex(item => {
                return item.id == actions.payload.cluster_id
            })
            tmpClusters___[_index_].name = actions.payload.new_name
            return {...state, clusters: tmpDocuments__}
        default:
            return state;
    }
}

export default reducer 