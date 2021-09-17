import SampleData from '../../data/sampleListOfDocuments.json'
import types from '../actions/types';
import * as d3 from 'd3'

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const initialState = {
    documents : SampleData,
    requestId : null,
    clusters : [{
        name : "mainCluster",
        id : 1,
        color : colorScale(1)
    }],
    groups : []
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

        // random links - just for demo
        case types.CreateRandomLinks :
            let tmpDocs = state.documents
            tmpDocs.map(doc => {
                let randomLength = Math.floor(Math.random() * (15 - 3) + 3)
                let links =[]
                for(let i = 0; i<randomLength; i++){
                    let randomId = Math.floor(Math.random() * (state.documents.length - 1) + 1)
                    if (randomId+"" != doc.id_) {
                        links.push(randomId)
                    }
                }
                doc.links = links
            })
            return {...state,documents: tmpDocs}

        case types.DataCompeleting : 
            let tmpDocs_ = state.documents
            let journalLists = [
                "International Journal of Computer Vision",
                "IEEE Transactions on Pattern Analysis and Machine Intelligence"
                ,"ACM Computing Surveys"
                ,"ACM Transactions on Graphics"
                ,"IEEE Transactions on Multimedia"
            ]
            tmpDocs_.map((doc,index) => {
                doc.relevancies = []
                doc.journal = journalLists[index%5]
                state.clusters.map(c =>{
                    let randomRelevancyScore = Math.floor(Math.random() * (10 - 5) + 5)
                    let randomRelevancy = {
                        cluster : c,
                        score : randomRelevancyScore
                    }
                    doc.relevancies.push(randomRelevancy)
                })
            })
            return {...state,documents:tmpDocs_}

        case types.AddOneGroup :
            let tmpGroups = state.groups; //tmpClusters_[tmpClusters_.length-1].id
            let last_group_id = tmpGroups.length > 0 ? tmpGroups[tmpGroups.length-1].id : 0
            let group_name = actions.payload.group_name ? actions.payload.group_name : "group_"+(last_group_id+1)
            tmpClusters_.push({
                name : group_name,
                id : last_group_id+1
            })
            return {...state, groups: tmpGroups}

        case types.RemoveOneGroup : 
            let tmpGroups_ = state.groups.filter(group => {
                return group.id != actions.payload.group_id
            })

            let tmp_Documents__ = state.documents
            tmp_Documents__.filter(doc => {
                return doc.group.id == actions.payload.group_id
            }).map(doc_m => {
                doc_m.group = null
            })
            return {...state, groups: tmpGroups_, documents: tmp_Documents__}
        case types.RenameGroup :
            let tmpGroups__ = state.groups;
            let groupIndex = tmpGroups__.findIndex(item => {
                return item.id == actions.payload.group_id
            })
            tmpGroups__[groupIndex].name = actions.payload.new_name
            return {...state, groups: tmpGroups__}
        case types.ChangeGroupOfDocument : 
            let _tmp_Documents = state.documents;
            let documentIndex = _tmp_Documents.findIndex(item => {
                return item.id == actions.payload.document_id
            })
            let groupItem = state.groups.find(item => {
                return item.id == actions.payload.group_id
            })
            _tmp_Documents[documentIndex].group = groupItem

        case types.SetRequestId : 
            return {...state, requestId: actions.payload.requestId}
        default:
            return state;
    }
}

export default reducer 