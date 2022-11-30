import React from "react";

function DateField(props) {
  return (
    <form className="DateForm">
      <input type="date" id="date" name="date" />
      <input type="submit" />
    </form>
  );
}

export default DateField;
