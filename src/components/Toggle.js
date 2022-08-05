import React, { useState } from 'react';
export var buttonState = false
var setIsOff = false

export const Toggles = () => {
    [buttonState, setIsOff] = useState(false);

    console.log(buttonState)
  
    return (
      <button className='disclaimerButton' onClick={() => setIsOff(!buttonState)}>{ buttonState ? 'Only predict games with enough form' : 'Predict all anyway' }</button>
    );
  }
  
