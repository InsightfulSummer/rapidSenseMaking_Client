import React from 'react'
import './App.css';
import MainScreen from './screens/mainScreen';
import Slider from './screens/slider'
import UploadScreen from './screens/uploadScreen';
import { Route, BrowserRouter } from "react-router-dom";

// redux imports
import {Provider} from 'react-redux'
import store from './redux/store'

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Route path="/test" exact component={Slider} />
        <Route path="/" exact component={UploadScreen} />
        <Route path="/main" exact component={MainScreen} />
      </BrowserRouter>
    </Provider>
  )
}

export default App;
