import React, { useState } from "react";
import { Checkbox } from "@material-ui/core";
import { orderedLeagues } from "../App";


class CheckBox extends React.Component {
  state = { isChecked: true };

  toggle = () => {
    this.setState((prevState) => ({ isChecked: !prevState.isChecked }));
  };

  render() {
    const items = [];

    for (let i = 0; i < orderedLeagues.length; i++) {
        const element = orderedLeagues[i];
        console.log(element)
        items.push(
            <div className="Checkbox">
              <Checkbox className="LeagueCheckboxes" checked={this.state.isChecked} onChange={this.toggle} />
              <label className="LeagueOption" onClick={this.toggle}>
                {element.name}
              </label>
            </div>
          );
    }
    return (
    <div>{items}</div>
    )
}
}
export default CheckBox