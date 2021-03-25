import React from 'react'
import './App.css';
import MainScreen from './screens/mainScreen';

// redux imports
import {Provider} from 'react-redux'
import store from './redux/store'

const App = () => {
  return (
    <Provider store={store}>
      <MainScreen />
    </Provider>
  )
}

export default App;
