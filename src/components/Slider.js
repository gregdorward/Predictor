import { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import { selectedOdds } from "../components/OddsRadio";
import { decimalToFractional } from "../utils/oddsFormat";
export let rangeValue = [1, 10];

export const Slide = (props) => {
  const [range, setRange] = useState([1.1, 10]);
  const [fractionalValue, setFractionalValue] = useState(["1/9", "10/1"]);

  useEffect(() => {
    if (selectedOdds === "Fractional odds") {
      try {
        setFractionalValue([
          decimalToFractional(range[0]),
          decimalToFractional(range[1]),
        ]);
      } catch (error) {
        console.log(error);
      }
    }
  }, [range]);

  const handleChange = (event, newValue) => {
    setRange(newValue);
    rangeValue = newValue;
  };

  return (
    <Slider
      aria-label="Always visible"
      value={range}
      sx={{
        width: "90%",
        color: "#fe8c00",
      }}
      onChange={handleChange}
      valueLabelDisplay="auto"
      step={0.1}
      min={1.1}
      max={10}
      valueLabelFormat={(value, index) =>
        selectedOdds === "Fractional odds" ? fractionalValue[index] : value
      }
    />
  );
};
