import { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import oddslib from "oddslib";
import { selectedOdds } from "../components/OddsRadio";
import {
  GlobalFilters,
  applyFilterPreset,
  FILTER_PRESET_NAMES,
} from "../logic/tipFilters";

export { GlobalFilters };

export const FilterPresets = () => {
  const applyPreset = (preset) => {
    if (!preset) return;
    applyFilterPreset(preset);
    window.dispatchEvent(new Event("filterPresetApplied"));
  };

  return (
    <div className="PresetContainer">
      <select onChange={(e) => applyPreset(e.target.value)} className="PresetDropdown">
        <option value="">Select a Preset Strategy...</option>
        {Object.entries(FILTER_PRESET_NAMES).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
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