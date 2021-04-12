import types from "../actions/types";

const initialState = {
    width : "0",
    height : "0",
    // vis 2 
    slideHeightPorportion : 1/2,
    z : 0
}

const reducer = (state = initialState, actions) => {
    switch (actions.type) {
        case types.SetDimensions:
            return {
                ...state,
                width : actions.payload.width,
                height : actions.payload.height
            }

        case types.SetZ:
            return {
                ...state,
                z : actions.payload.z
            }

        case types.SetSliderHeightPorportion:
            return {
                ...state,
                slideHeightPorportion : actions.payload.sliderHeightPorportion
            }
    
        default:
            return state
    }
}

export default reducer