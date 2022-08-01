import React, { Component } from "react";
export var selectedOdds = "Fractional odds";


export class OddsRadio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOdds: this.props.value,
    };
  }

  handleOptionChange = () => {
    this.setState({
      selectedOdds: this.props.value,
    });
    selectedOdds = this.state.selectedOdds;
    console.log(selectedOdds)
  };

  render() {
    return (
      <section className="dark2">
        <div className={this.props.className}>
          <label>
            <input
              type="radio"
              name="odds"
              checked={this.state.checked}
              onChange={this.handleOptionChange}
              data-cy={this.props.value}
            />
            <span className="design"></span>
            <span className="text">{this.props.value}</span>
          </label>
        </div>
      </section>
    );
  }
}

export default OddsRadio;