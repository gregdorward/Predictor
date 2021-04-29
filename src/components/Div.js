import React from "react";

function Div(props) {
  return (
    <div id={props.id} style={props.style} className={props.className}>{props.text}</div>
  );
}

export default Div;
