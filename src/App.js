import React from 'react'
import './App.css';
import MainScreen from './screens/mainScreen';

// redux imports
import rootReducer from './redux/reducers/rootReducer'
import {createStore} from 'redux'
import {Provider} from 'react-redux'
const store = createStore(rootReducer)

const App = () => {
  return (
    <Provider store={store}>
      <MainScreen />
    </Provider>
  )
}

export default App;
