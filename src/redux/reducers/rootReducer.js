import {
    combineReducers
} from 'redux'
import componentReducer from './componentReducer'
import dataReducer from './dataReducer'
import interactionReducer from './interactionReducer'
import canvasReducer from './canvasReducer'

const rootReducer = combineReducers({
    componentReducer,
    dataReducer,
    interactionReducer,
    canvasReducer
})

export default rootReducer