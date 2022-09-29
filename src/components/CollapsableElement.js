import React, { Component } from "react";
import EscapeOutside from "react-escape-outside";

class Collapsable extends Component {
  state = { isOpen: false };

  handleOnClick = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
    console.log(this.state.isOpen);
  };

  render() {
    return (
      <div>
        <div>
          <button className={this.props.className} onClick={this.handleOnClick}>
            {this.props.buttonText}
          </button>
        </div>
        <div style={this.props.style}>
          {/* <div>{this.props.element}</div> */}
          {!this.state.isOpen && (
            <EscapeOutside className="Collapsable">
              <div className="flex-container">
                <div className={this.props.classNameDiv}>{this.props.text}</div>
                <div className={this.props.classNameDivTwo}>
                  {this.props.textTwo}
                </div>
              </div>
            </EscapeOutside>
          )}
          {this.state.isOpen && (
            <EscapeOutside className="Collapsable">
              <div className="flex-container">
                <div className={this.props.classNameDiv}>
                  {this.props.element}
                </div>
                <div className={this.props.classNameDivTwo}>
                  {this.props.elementTwo}
                </div>
              </div>
            </EscapeOutside>
          )}
        </div>
      </div>
    );
  }
}

export default Collapsable;
