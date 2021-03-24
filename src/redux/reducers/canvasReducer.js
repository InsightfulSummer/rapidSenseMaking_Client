import types from "../actions/types";

const initialState = {
    width : "0",
    height : "0"
}

const reducer = (state = initialState, actions) => {
    switch (actions.type) {
        case types.SetDimensions:
            return {
                ...state,
                width : actions.payload.width,
                height : actions.payload.height
            }
    
        default:
            return state
    }
}

export default reducer