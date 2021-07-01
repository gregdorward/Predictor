import React from "react";

export function Button(props) {
  return (
    <div id="Button">
      <button data-cy={props.text} variant="primary" type="button" onClick={props.onClickEvent} className={props.className}>
        {props.text}
      </button>
    </div>
  );
}
