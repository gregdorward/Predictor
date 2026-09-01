const OptionsSlider = ({
  leftLabel,
  rightLabel,
  isRight,
  onChange,
  ariaLabel,
}) => {
  const setLeft = () => {
    if (isRight) onChange(false);
  };

  const setRight = () => {
    if (!isRight) onChange(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setLeft();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setRight();
    }
  };

  return (
    <div
      className={`OptionsSlider${isRight ? " OptionsSlider--right" : ""}`}
      role="group"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={`OptionsSlider-label OptionsSlider-label--left${
          !isRight ? " OptionsSlider-label--active" : ""
        }`}
        onClick={setLeft}
        aria-pressed={!isRight}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        className="OptionsSlider-track"
        onClick={() => (isRight ? setLeft() : setRight())}
        aria-label={`${leftLabel} or ${rightLabel}`}
      >
        <span className="OptionsSlider-thumb" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`OptionsSlider-label OptionsSlider-label--right${
          isRight ? " OptionsSlider-label--active" : ""
        }`}
        onClick={setRight}
        aria-pressed={isRight}
      >
        {rightLabel}
      </button>
    </div>
  );
};

export default OptionsSlider;
