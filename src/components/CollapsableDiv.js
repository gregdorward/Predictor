import React, { Component } from "react";
import EscapeOutside from "react-escape-outside";

class CollapsableDiv extends Component {
  state = { isOpen: false };

  handleOnClick = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  render() {
    return (
      <div style={{ fontFamily: "sans-serif" }} onClick={this.handleOnClick}>
        {this.state.isOpen && (
          <EscapeOutside className="CollapsableDiv">
          </EscapeOutside>
        )}
      </div>
    );
  }
}

export default CollapsableDiv;