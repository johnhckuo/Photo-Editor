import React, { Component } from "react";
import ReactDOM from "react-dom";
import Blur from "../components/Blur";
import Crop from "../components/Crop";
import Upload from "../components/Upload";

class Main extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div id="container">
        <Upload />
        <Crop />
        <Blur />
      </div>
    );
  }
}
export default Main;
