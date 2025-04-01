import React from "react";
import Collapsible from "react-collapsible";

const Collapsable = (props) => {
  return (
    <Collapsible transitionTime={300} Key={props.buttonText} trigger={<button className={props.classNameButton} style={{ display: props.display }}>{props.buttonText}</button>} className={props.className? props.className: "Collapsable"}>
      <div key={`123${props.buttonText}`} className={props.classNameFlex? props.classNameFlex: ""}>
      <span className={props.classNameTwo? props.classNameTwo: props.buttonText} style={props.style} key={`123${props.buttonText}`}>{props.element}</span>
      <span className={props.classNameThree? props.classNameTwo: props.buttonText} key={`456${props.buttonText}`}>{props.elementTwo}</span>
      </div>
    </Collapsible>
  );
};


export default Collapsable;