import { Component } from "react";
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
    const { title } = this.props;

    return (
      <div className="MultisHub__buildHeader">
        <button
          type="button"
          className="IncrementButton MultisHub__stepperBtn MultisHub__stepperBtn--remove"
          onClick={this.IncrementItem}
          aria-label="Remove leg from multi"
        >
          −
        </button>
        {title ? (
          <p className="MultisHub__buildHeaderTitle" id="multis-build-a-multi-label">
            {title}
          </p>
        ) : null}
        <button
          type="button"
          className="DecrementButton MultisHub__stepperBtn MultisHub__stepperBtn--add"
          onClick={this.DecreaseItem}
          aria-label="Add leg to multi"
        >
          +
        </button>
      </div>
    );
  }
}

export default Increment;
