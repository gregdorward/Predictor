import React from "react";
import Collapsible from "react-collapsible";

const Collapsable = ({
  buttonText,
  buttonImage, // NEW
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
          {buttonImage && (
            <img
              src={buttonImage}
              alt={buttonText}
              className="player-image-thumb"
            />
          )}
          {buttonText}
        </button>
      }
      className={className || "Collapsable"}
    >
      <div className={classNameFlex || ""}>
        <div className={classNameTwo || buttonText} style={style}>
          {element}
        </div>
        <div className={classNameThree || buttonText}>{elementTwo}</div>
      </div>
    </Collapsible>
  );
};

export default Collapsable;