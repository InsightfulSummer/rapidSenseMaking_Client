import React from 'react'

const ActionCenter = () => {
    return (
        <div className="actionCenter">
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div className="searchInListContainer">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon">
                                <i class="fas fa-search"></i>
                            </span>
                        </div>
                        <input type="text" className="form-control" placeholder="Search thorough documents ..." aria-label="Username" aria-describedby="basic-addon" />
                    </div>
                </div>
                <div className="sortingIconContainer_">
                    <i className="fas fa-history sortingIcon_" />
                </div>
            </div>
            <div className="sortingMenuContainer">
                <p className="sortingTitle">Sort By ...</p>
                <p className="sortingMenuOption">Publishing Date (Ascending) <i></i></p>
                <p className="sortingMenuOption">Publishing Date (Descending) <i></i></p>
                <p className="sortingMenuOption">Relativity <i></i></p>
                <p className="sortingMenuOption">Relativity to a custom document <i></i></p>
                <p className="sortingMenuOption">Most Cited Documents <i></i></p>
                <p className="sortingMenuOption">Most Citing Documents <i></i></p>
            </div>
        </div>
    )
}

export default ActionCenter