import {
    combineReducers
} from 'redux'
import componentReducer from './componentReducer'
import dataReducer from './dataReducer'
import interactionReducer from './interactionReducer'

const rootReducer = combineReducers({
    componentReducer,
    dataReducer,
    interactionReducer
})

export default rootReducer