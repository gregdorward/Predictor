import React from "react";

export function CreateBadge(props) {

  if(props.image === "-"){
    return (
      <div className={props.ClassName} />
    );
  } else {
    return (
      <img
        src={`https://cdn.footystats.org/img/${props.image}`}
        className={props.ClassName}
        alt={props.alt}
        flex-shrink={props.flexShrink}
      />
    );
  }
}
