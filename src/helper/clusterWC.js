import React from 'react'

const ClusterWC = ({clusters}) => {
    return (
        <div className="clusterWC">
            {
                clusters.map((cluster, index) => (
                    <div className="clusterWCContainer" id={"clusterWCContainer_"+index} style={{borderColor:cluster.color}}></div>
                ))
            }
        </div>
    )
}

export default ClusterWC