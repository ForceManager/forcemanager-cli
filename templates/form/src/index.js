import React from 'react';
import ReactDOM from 'react-dom';
import { HoiPoiProvider } from 'hoi-poi-ui';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ThemeProvider } from '@material-ui/styles';
import MomentUtils from '@date-io/moment';
// import moment from 'moment';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import materialTheme from './configs/materialTheme';
// import hoiPoiTheme from './configs/hoiPoiTheme.js';

ReactDOM.render(
  <HoiPoiProvider>
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <ThemeProvider theme={materialTheme}>
        <App />
      </ThemeProvider>
    </MuiPickersUtilsProvider>
  </HoiPoiProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
