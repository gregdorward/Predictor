import { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import oddslib from "oddslib";
import { selectedOdds } from "../components/OddsRadio";

// 1. Group variables into a single exported object to satisfy the linter
export const GlobalFilters = {
  minimumXG: null,
  minimumGD: null,
  minimumGDHorA: null,
  minimumLast6: null,
  edge: null,
  O25edge: null,
  BTTSedge: null,
  oddsRange: [1.1, 10],
  over25Probability: null,
  bttsProbability: null,
  omitDraws: false,
  winProbability: null,
};

export const FilterPresets = () => {
  const applyPreset = (preset) => {
    // Reset all to defaults by modifying the object properties
    GlobalFilters.edge = null;
    GlobalFilters.bttsProbability = null;
    GlobalFilters.over25Probability = null;
    GlobalFilters.minimumXG = null;
    GlobalFilters.minimumGD = null;
    GlobalFilters.minimumGDHorA = null;
    GlobalFilters.minimumLast6 = null;
    GlobalFilters.O25edge = null;
    GlobalFilters.BTTSedge = null;
    GlobalFilters.oddsRange = [1.1, 10];
    GlobalFilters.omitDraws = false;
    GlobalFilters.winProbability = null;

    // Apply specific preset values
    switch (preset) {
      case "high_btts":
        GlobalFilters.bttsProbability = 65;
        GlobalFilters.BTTSedge = 1;
        break;
      case "value_seekers":
        GlobalFilters.edge = 10;
        break;
      case "goals_galore":
        GlobalFilters.over25Probability = 65;
        GlobalFilters.O25edge = 1;
        break;
      case "stats_picks":
        GlobalFilters.minimumXG = 2;
        GlobalFilters.minimumGD = 5;
        GlobalFilters.minimumGDHorA = 10;
        GlobalFilters.minimumLast6 = 6;
        break;
      case "long-shots":
        GlobalFilters.oddsRange = [2, 10];
        GlobalFilters.omitDraws = true;
        break;
      case "underdogs":
        GlobalFilters.oddsRange = [3, 10];
        GlobalFilters.omitDraws = true;
        break;
      case "ssh":
        GlobalFilters.edge = 1;
        GlobalFilters.minimumGD = 3;
        GlobalFilters.minimumGDHorA = 5;
        GlobalFilters.omitDraws = true;
        GlobalFilters.oddsRange = [1.2, 10];
        break;
      default:
        break;
    }

    // Dispatch event to update Slider UI
    window.dispatchEvent(new Event("filterPresetApplied"));
  };

  return (
    <div className="PresetContainer">
      <select onChange={(e) => applyPreset(e.target.value)} className="PresetDropdown">
        <option value="">Select a Preset Strategy...</option>
        <option value="high_btts">BTTS picks</option>
        <option value="value_seekers">High value picks</option>
        <option value="goals_galore">Over 2.5 picks</option>
        <option value="stats_picks">Form-based picks</option>
        <option value="long-shots">Medium to high odds win picks</option>
        <option value="underdogs">Underdog picks</option>
        <option value="ssh">Soccer Stats Hub recommended</option>
      </select>
    </div>
  );
};

const SlideDiff = (props) => {
  const isRange = props.useCase === "odds";
  const isBinary = props.useCase === "omitDraws";
  const minLimit = parseFloat(props.lower);
  const maxLimit = parseFloat(props.upper);

  const [value, setValue] = useState(isRange ? [minLimit, maxLimit] : minLimit);
  const [fractionalValue, setFractionalValue] = useState(["1/9", "9/1"]);

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

  useEffect(() => {
    const handlePreset = () => {
      let newValue;
      // Read from the GlobalFilters object
      switch (props.useCase) {
        case "edge": newValue = GlobalFilters.edge; break;
        case "btts": newValue = GlobalFilters.bttsProbability; break;
        case "winProb": newValue = GlobalFilters.winProbability; break;
        case "over25": newValue = GlobalFilters.over25Probability; break;
        case "xg": newValue = GlobalFilters.minimumXG; break;
        case "gd": newValue = GlobalFilters.minimumGD; break;
        case "gdHorA": newValue = GlobalFilters.minimumGDHorA; break;
        case "last10": newValue = GlobalFilters.minimumLast6; break;
        case "O25edge": newValue = GlobalFilters.O25edge; break;
        case "BTTSedge": newValue = GlobalFilters.BTTSedge; break;
        case "odds": newValue = GlobalFilters.oddsRange; break;
        case "omitDraws": newValue = GlobalFilters.omitDraws ? 1 : 0; break;
        default: return;
      }
      setValue(newValue === null ? minLimit : newValue);
    };

    window.addEventListener("filterPresetApplied", handlePreset);
    return () => window.removeEventListener("filterPresetApplied", handlePreset);
  }, [props.useCase, minLimit]);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    if (isRange) {
      GlobalFilters.oddsRange = newValue;
    } else {
      const filterValue = newValue === minLimit ? null : newValue;

      // Update the GlobalFilters object properties
      switch (props.useCase) {
        case "edge": GlobalFilters.edge = filterValue; break;
        case "O25edge": GlobalFilters.O25edge = filterValue; break;
        case "BTTSedge": GlobalFilters.BTTSedge = filterValue; break;
        case "xg": GlobalFilters.minimumXG = filterValue; break;
        case "gd": GlobalFilters.minimumGD = filterValue; break;
        case "gdHorA": GlobalFilters.minimumGDHorA = filterValue; break;
        case "last10": GlobalFilters.minimumLast6 = filterValue; break;
        case "winProb": GlobalFilters.winProbability = filterValue; break;
        case "over25": GlobalFilters.over25Probability = filterValue; break;
        case "btts": GlobalFilters.bttsProbability = filterValue; break;
        case "omitDraws": GlobalFilters.omitDraws = filterValue === 1; break;
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
      valueLabelFormat={(val, index) => {
        if (isRange && selectedOdds === "Fractional odds") {
          return fractionalValue[index];
        }
        if (isBinary) {
          return val === maxLimit ? "YES" : "NO";
        }
        if (!isRange && val === minLimit) return "OFF";
        return val;
      }}
    />
  );
};

export default SlideDiff;