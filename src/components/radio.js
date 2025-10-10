import { Component } from "react";
export var selectedOption = "all";

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
              name="riskProfile"
              checked={this.state.checked}
              onChange={this.handleOptionChange}
              data-cy={this.props.value}
            />
            <span className="design"></span>
            <span className="riskText">Include {this.props.text}</span>
          </label>
        </div>
      </section>
    );
  }
}

export default Radio;
