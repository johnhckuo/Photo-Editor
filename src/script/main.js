import React, { Component } from "react";
import ReactDOM from "react-dom";
import '../style/reset.scss';
import '../style/main.scss';
import 'bootstrap/dist/css/bootstrap.css';

import Main from './pages/Main';

ReactDOM.render(
  <Main/>,
  document.getElementById('app')
);
