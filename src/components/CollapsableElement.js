import React, { Component } from "react";
import EscapeOutside from "react-escape-outside";

class Collapsable extends Component {
  state = { isOpen: false };

  handleOnClick = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  render() {
    return (
      <div style={{ fontFamily: "sans-serif" }}>
        <button onClick={this.handleOnClick}>{"info"}</button>

        {this.state.isOpen && (
          <EscapeOutside className="Collapsable">
            Fixtures including each team's points per game picked up at home or
            away. 
            Click on "Get Predictions" to get predictions based on form data. Click on an individual fixture for detailed stats. If you change your form selection, re-tapping the fixture will fetch new form data. You can also fetch fresh predictions based on the newly selected option by re-tapping on "Get Predictions" 
            If no form radio button is chosen, the last 5 games will be used by default
          </EscapeOutside>
        )}
      </div>
    );
  }
}

export default Collapsable;
