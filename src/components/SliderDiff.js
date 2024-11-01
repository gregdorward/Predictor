import React, { useState } from "react";
import Slider from "@mui/material/Slider";
export let minimumXG = 0;
export let minimumGD = 0;
export let minimumGDHorA = 0;
export let minimumLast6 = 0;

function SlideDiff(props) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    switch (true) {
      case props.useCase === "xg":
        minimumXG = newValue;
        break;
      case props.useCase === "gd":
        minimumGD = newValue;
        break;
      case props.useCase === "gdHorA":
        minimumGDHorA = newValue;
        break;
      case props.useCase === "last10":
        minimumLast6 = newValue;
        break;

      default:
        break;
    }
  };

  return (
    <Slider
      aria-label="Always visible"
      value={value}
      sx={{
        width: "90%",
        color: "#030061",
      }}
      onChange={handleChange}
      step={1}
      marks={props.marks}
      valueLabelDisplay="auto"
      min={parseFloat(props.lower)}
      max={parseFloat(props.upper)}
    />
  );
}

export default SlideDiff;
