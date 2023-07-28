import React, { useState } from 'react';
import { generateFixtures } from "../logic/getFixtures";
export var fixtureList = [];

const FixtureButton = (props) => {
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleButtonClick = async () => {
    if (!buttonClicked) {
      setButtonClicked(true);

      fixtureList.push(
        await generateFixtures(
          props.name,
          props.day,
          props.odds,
          props.dayFootyStats,
          props.bool,
          props.day
        )
      );

      setTimeout(() => {
        setButtonClicked(false);
      }, 2000);
    }
  };

  return (
    <button
    //   text={props.text}
      className={props.cName}
      onClickEvent={handleButtonClick}
      disabled={buttonClicked}
    >{props.text}</button>
  );
};

export default FixtureButton;