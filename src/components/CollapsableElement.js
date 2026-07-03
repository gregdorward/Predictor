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
  defaultOpen = false,
  titleOnly = false,
  locked = false,
  onTriggerToggle
  // onTriggerOpening,
  // onTriggerClosing,
}) => {
  const handleTriggerClick = (event) => {
    if (locked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onTriggerToggle?.(event);
  };

  const buttonClassName = [
    classNameButton,
    locked ? "StatHeader--locked" : "",
  ]
    .filter(Boolean)
    .join(" ");
  if (titleOnly) {
    return (
      <div className={`${className || "Collapsable"} Collapsable--titleOnly`}>
        <h3 className={`Collapsable-title ${classNameButton || ""}`}>{buttonText}</h3>
        <div className={classNameFlex || "Collapsable-content"}>
          <div className={classNameTwo || buttonText} style={style}>
            {element}
          </div>
          {elementTwo ? (
            <div className={classNameThree || buttonText}>{elementTwo}</div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Collapsible
      transitionTime={300}
      open={locked ? false : isOpen ?? (defaultOpen ? true : undefined)}
      key={key}
      trigger={
        <button
          type="button"
          className={buttonClassName}
          style={{ display }}
          onClick={handleTriggerClick}
          disabled={locked}
          aria-expanded={locked ? false : !!isOpen}
        >
          {buttonImage && (
            <img
              src={buttonImage}
              alt={buttonText}
              className="player-image-thumb"
            />
          )}
          {locked ? (
            <span className="StatHeader-label">
              <span className="StatHeader-lock" aria-hidden="true">
                🔒
              </span>
              {buttonText}
            </span>
          ) : (
            buttonText
          )}
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