import React from "react";

export function CreateBadge(props) {
  return (
    <img
      src={`https://cdn.footystats.org/img/${props.image}`}
      className={props.ClassName}
      alt={props.alt}
      flex-shrink={props.flexShrink}
    />
  );
}
