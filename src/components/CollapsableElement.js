import React from "react";
import Collapsible from "react-collapsible";

const Collapsable = ({
  buttonText,
  classNameButton,
  display,
  className,
  classNameFlex,
  classNameTwo,
  classNameThree,
  style,
  element,
  elementTwo,
  isOpen,
  onTriggerOpening,
  onTriggerClosing,
}) => {
  return (
    <Collapsible
      transitionTime={300}
      open={isOpen}
      onOpening={onTriggerOpening}
      onClosing={onTriggerClosing}
      trigger={
        <button className={classNameButton} style={{ display }}>
          {buttonText}
        </button>
      }
      className={className || "Collapsable"}
    >
      <div className={classNameFlex || ""}>
        <span className={classNameTwo || buttonText} style={style}>
          {element}
        </span>
        <span className={classNameThree || buttonText}>{elementTwo}</span>
      </div>
    </Collapsible>
  );
};

export default Collapsable;
