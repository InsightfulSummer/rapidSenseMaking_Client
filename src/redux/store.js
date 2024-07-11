import rootReducer from './reducers/rootReducer'
import {applyMiddleware, compose, createStore} from 'redux'
import thunk from 'redux-thunk'

const store = createStore(rootReducer, compose())

export default store