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
      <div style={this.props.style}>
        <button className={this.props.className} onClick={this.handleOnClick}>{this.props.buttonText}</button>
        {/* <div>{this.props.element}</div> */}
        {!this.state.isOpen && (
          <EscapeOutside className="Collapsable">
            {this.props.element}
          </EscapeOutside>
        )}
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
