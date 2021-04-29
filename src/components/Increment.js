import React, { Component, Fragment } from "react";
import { getScorePrediction } from "../logic/getScorePredictions"
export var incrementValue = 1.9;
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
    this.setState({ incrementValue: this.state.incrementValue + 0.1 });
    this.setState({ riskLevel: this.state.riskLevel - 1 });
    incrementValue = (this.state.incrementValue + 0.1).toFixed(1);
    riskLevel = this.state.riskLevel - 1;
    getScorePrediction("default", false);
  };
  DecreaseItem = () => {
    this.setState({ incrementValue: this.state.incrementValue - 0.1 });
    this.setState({ riskLevel: this.state.riskLevel + 1 });

    incrementValue = (this.state.incrementValue - 0.1).toFixed(1);
    riskLevel = this.state.riskLevel + 1;
    getScorePrediction("default", false);
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
