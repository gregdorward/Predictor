import React, { Component, Fragment } from "react";
import { getScorePrediction } from "../logic/getScorePredictions"
export var incrementValue = 2;
export var incrementValueTwo = 2.5;

export var riskLevel = 10;

class Increment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      incrementValue,
      riskLevel,
      show: true,
    };
  }

  IncrementItem = () => {
    if(incrementValue > 1){
    this.setState({ incrementValue: this.state.incrementValue + 0.1 });
    this.setState({ riskLevel: this.state.riskLevel - 1 });
    incrementValue = (this.state.incrementValue + 0.1).toFixed(1);
    riskLevel = this.state.riskLevel - 1;
    }

    getScorePrediction("default", false);
    console.log("incrementValue")
    console.log(incrementValue)
  };
  DecreaseItem = () => {
    if(incrementValue > 1){
      this.setState({ incrementValue: this.state.incrementValue - 0.1 });
      this.setState({ riskLevel: this.state.riskLevel + 1 });
      incrementValue = (this.state.incrementValue - 0.1).toFixed(1);
      riskLevel = this.state.riskLevel + 1;
    }


    getScorePrediction("default", false);
    console.log("incrementValue")
    console.log(incrementValue)


  };

  render() {
    return (
      <Fragment>
          <button className="IncrementButton" onClick={this.IncrementItem}>
            -
          </button>
          <button className="DecrementButton" onClick={this.DecreaseItem}>
            +
          </button>
      </Fragment>

    );
  }
}

export default Increment;
