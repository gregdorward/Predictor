import React from "react";

function TextBlock(props) {
  return (
    <div className={props.className}>
      <div>{props.text}</div>
    </div>
  );
}

export default TextBlock;
