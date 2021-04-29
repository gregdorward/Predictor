import React, { Component } from "react";
import EscapeOutside from "react-escape-outside";

class CollapsableDiv extends Component {
  state = { isOpen: true };

  handleOnClick = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  render() {
    return (
      <div style={{ fontFamily: "sans-serif" }} >
        <div onClick={this.handleOnClick}>{this.props.text}</div>
        {this.state.isOpen && (
          <EscapeOutside className="CollapsableDiv">
          </EscapeOutside>
        )}
      </div>
    );
  }
}

export default CollapsableDiv;