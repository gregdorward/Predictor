import React, { Component } from "react";
import Collapsible from "react-collapsible";

const Collapsable = (props) => {
  return (
    <Collapsible transitionTime={300} trigger={<button>{props.buttonText}</button>} className="Collapsable">
      <span className={props.buttonText} style={props.style} key={123}>{props.element}</span>
      <span key={456}>{props.elementTwo}</span>
    </Collapsible>
  );
};

export default Collapsable;