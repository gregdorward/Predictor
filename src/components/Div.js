import React from "react";

function Div(props) {
  return (
    <div className={props.className}>{props.text}</div>
  );
}

export default Div;
