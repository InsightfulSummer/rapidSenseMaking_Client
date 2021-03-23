import types from '../actions/types'
const initialState = {
    listViewOpen : true
}

const reducer = (state=initialState, actions) => {
    switch (actions.type) {
        case types.ToggleListView:
            return {
                ...state, listViewOpen : !state.listViewOpen
            }
    
        default:
            return state;
    }
}

export default reducer