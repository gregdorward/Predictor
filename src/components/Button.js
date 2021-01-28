import React from "react";

export function Button(props) {
  return (
    <div id="Button">
      <button variant="primary" type="button" onClick={props.onClickEvent}>
        {props.text}
      </button>
    </div>
  );
}
