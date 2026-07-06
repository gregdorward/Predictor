import { Component } from "react";
import { render } from "../utils/render";
import {
  FRACTIONAL_ODDS,
  DECIMAL_ODDS,
  readOddsPreference,
  writeOddsPreference,
} from "../utils/oddsPreference";

export var selectedOdds = readOddsPreference();

const oddsChangeListeners = new Set();

export function onOddsPreferenceChange(listener) {
  oddsChangeListeners.add(listener);
  return () => oddsChangeListeners.delete(listener);
}

function notifyOddsPreferenceChange(value) {
  for (const listener of oddsChangeListeners) {
    listener(value);
  }
}

export function applyOddsPreference(value) {
  selectedOdds = value;
  writeOddsPreference(value);
  renderOddsRadios();
}

export function renderOddsRadios() {
  const handleChange = (value) => {
    selectedOdds = value;
    writeOddsPreference(value);
    notifyOddsPreferenceChange(value);
    renderOddsRadios();
  };

  render(
    <div className="OddsRadios">
      <OddsRadio value={FRACTIONAL_ODDS} onChange={handleChange} />
      <OddsRadio value={DECIMAL_ODDS} onChange={handleChange} />
    </div>,
    "Checkbox"
  );
}

export class OddsRadio extends Component {
  handleOptionChange = () => {
    if (this.props.onChange) {
      this.props.onChange(this.props.value);
    }
  };

  render() {
    const isChecked = selectedOdds === this.props.value;

    return (
      <section className="dark2">
        <div className={this.props.className}>
          <label>
            <input
              type="radio"
              name="odds"
              checked={isChecked}
              onChange={this.handleOptionChange}
              data-cy={this.props.value}
              data-testid={this.props.value}
              className="Hidden"
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
