import { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import oddslib from "oddslib";
import { selectedOdds } from "../components/OddsRadio";

// Global Filter Variables
export let minimumXG = null;
export let minimumGD = null;
export let minimumGDHorA = null;
export let minimumLast6 = null;
export let edge = null;
export let O25edge = null;
export let BTTSedge = null;
export let oddsRange = [1.1, 10]; // Default range for Odds
export let over25Probability = null;
export let bttsProbability = null;

const SlideDiff = (props) => {
  const isRange = props.useCase === "odds";
  const minLimit = parseFloat(props.lower);
  const maxLimit = parseFloat(props.upper);

  // Initialize state based on whether it's a range or a single value
  const [value, setValue] = useState(isRange ? [minLimit, maxLimit] : minLimit);
  const [fractionalValue, setFractionalValue] = useState(["1/9", "9/1"]);

  // Handle Fractional Odds conversion for the "odds" range slider
  useEffect(() => {
    if (isRange && selectedOdds === "Fractional odds") {
      try {
        const f1 = oddslib.from("decimal", value[0]).to("fractional", { precision: 1 });
        const f2 = oddslib.from("decimal", value[1]).to("fractional", { precision: 1 });
        setFractionalValue([f1, f2]);
      } catch (e) {
        console.error("Conversion error", e);
      }
    }
  }, [value, isRange]);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    if (isRange) {
      oddsRange = newValue;
    } else {
      // Single slider logic: Reset to null if at the minimum
      const filterValue = newValue === minLimit ? null : newValue;

      switch (props.useCase) {
        case "edge": edge = filterValue; break;
        case "O25edge": O25edge = filterValue; break;
        case "BTTSedge": BTTSedge = filterValue; break;
        case "xg": minimumXG = filterValue; break;
        case "gd": minimumGD = filterValue; break;
        case "gdHorA": minimumGDHorA = filterValue; break;
        case "last10": minimumLast6 = filterValue; break;
        case "over25": over25Probability = filterValue; break;
        case "btts": bttsProbability = filterValue; break;
        default: break;
      }
    }
  };

  return (
    <Slider
      value={value}
      onChange={handleChange}
      min={minLimit}
      max={maxLimit}
      step={props.step || 1}
      valueLabelDisplay="auto"
      sx={{ width: "90%", color: "#fe8c00" }}
      // Logic for the tooltip label
      valueLabelFormat={(val, index) => {
        if (isRange && selectedOdds === "Fractional odds") {
          return fractionalValue[index];
        }
        if (!isRange && val === minLimit) return "OFF";
        return val;
      }}
    />
  );
};

export default SlideDiff;