import React from "react";
import { FormControlLabel, Switch } from "@material-ui/core";
export let homeAwayOnly = false

function SwitchComponent({ label }) {
  const [state, setState] = React.useState(false);

  const handleChange = async event => {
    setState(event.target.checked);
    homeAwayOnly = event.target.checked
  };

  label = homeAwayOnly === true ? "Home/Away only" : "All games"


  return (
    <div>
      <FormControlLabel
        control={
          <Switch
            checked={state}
            onChange={handleChange}
            value={state}
            inputProps={{ "aria-label": "secondary checkbox" }}
          />
        }
        label={label}
        labelPlacement="start"
      />
    </div>
  );
}

export default SwitchComponent;
