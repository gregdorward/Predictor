import React, { Component } from "react";
export var selectedOption = "5";

export var fixtureList = [];

export class Radio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: this.props.value,
    };
  }

  handleOptionChange = () => {
    this.setState({
      selectedOption: this.props.value,
    });
    selectedOption = this.state.selectedOption;
  };

  render() {
    return (
      <section className="dark">
        <div className={this.props.className}>
          <label>
            <input
              type="radio"
              name="lastGames"
              checked={this.state.checked}
              onChange={this.handleOptionChange}
            />
            <span className="design"></span>
            <span className="text">Last {this.props.value} games</span>
          </label>
        </div>
      </section>
    );
  }
}

export default Radio;
