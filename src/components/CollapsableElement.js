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
            away
          </EscapeOutside>
        )}
      </div>
    );
  }
}

export default Collapsable;
