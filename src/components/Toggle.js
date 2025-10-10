import { useState } from "react";
export var toggleState = false;
export var setIsOff = false;

export const Toggles = () => {
  [toggleState, setIsOff] = useState(false);

  return (
    <button className="ResultsOptions" onClick={() => setIsOff(!toggleState)}>
      {toggleState ? "Results overview" : "Results detailed"}
    </button>
  );
};
