import React from "react";

function Div(props) {
  return (
    <div id={props.id} onClick={props.onClick} style={props.style} className={props.className}>{props.text}</div>
  );
}

export default Div;
