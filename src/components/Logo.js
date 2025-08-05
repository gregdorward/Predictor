import React from 'react';
import myImage from './images/NewLogo.png';

const Logo = () => {
  return (
    <h1 className="logo-container">
      <img src={myImage} alt="Soccer Stats Hub logo" className='responsive-logo'/>
    </h1>
  );
};

export default Logo;
