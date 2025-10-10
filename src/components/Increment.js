import { Component, Fragment } from "react";
import { getNewTips } from "../logic/getScorePredictions"
import {allTips} from "../logic/getScorePredictions"
export var incrementValue = 3;

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
    this.setState({ incrementValue: this.state.incrementValue - 1 });
    this.setState({ riskLevel: this.state.riskLevel - 1 });
    incrementValue = (this.state.incrementValue - 1);
    riskLevel = this.state.riskLevel - 1;
    }
    getNewTips(allTips)
  };
  DecreaseItem = () => {
    if(incrementValue > 0){
      this.setState({ incrementValue: this.state.incrementValue + 1 });
      this.setState({ riskLevel: this.state.riskLevel + 1 });
      incrementValue = (this.state.incrementValue + 1);
      riskLevel = this.state.riskLevel + 1;
    }
    getNewTips(allTips)
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
