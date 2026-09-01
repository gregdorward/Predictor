import { render } from "../utils/render";
import OptionsSlider from "./OptionsSlider";
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
  const handleChange = (isRight) => {
    const value = isRight ? DECIMAL_ODDS : FRACTIONAL_ODDS;
    selectedOdds = value;
    writeOddsPreference(value);
    notifyOddsPreferenceChange(value);
    renderOddsRadios();
  };

  render(
    <OptionsSlider
      leftLabel="Fractional"
      rightLabel="Decimal"
      isRight={selectedOdds === DECIMAL_ODDS}
      onChange={handleChange}
      ariaLabel="Odds format"
    />,
    "Checkbox"
  );
}

export default renderOddsRadios;
