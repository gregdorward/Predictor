import { useState } from 'react';

export const Checkbox = (props) => {
  const [isChecked, setChecked] = useState(false);

  const handleCheckboxChange = () => {
    setChecked(!isChecked);
    props.game.tipped = 1;
  };

  return (
    <div className="custom-checkbox">
      <label>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="hidden-checkbox"
        />
        <div className="checkbox-wrapper">
          <div className={`custom-checkbox-box ${isChecked ? 'checked' : ''}`} />
        </div>
        Checkbox Label
      </label>
    </div>
  );
};

export default Checkbox;
