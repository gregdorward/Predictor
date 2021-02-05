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
        <button onClick={this.handleOnClick}>{this.props.buttonText}</button>
        {this.state.isOpen && (
          <EscapeOutside className="Collapsable">
            {this.props.text}
          </EscapeOutside>
        )}
      </div>
    );
  }
}

export default Collapsable;
