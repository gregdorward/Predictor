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
  key,
  style,
  element,
  elementTwo,
  openedClassName,
  isOpen,
  onTriggerToggle
  // onTriggerOpening,
  // onTriggerClosing,
}) => {
  return (
    <Collapsible
      transitionTime={300}
      open={isOpen}
      key={key}
      trigger={
        // ⭐️ FIX: ADD onClick={onTriggerToggle} to the button ⭐️
        <button className={classNameButton} style={{ display }} onClick={onTriggerToggle}>
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
      openedClassName={openedClassName || "Collapsable"}
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