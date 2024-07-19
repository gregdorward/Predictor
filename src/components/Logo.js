import React from 'react';
import myImage from './images/xg-tipping-high-resolution-logo-transparent.png';

const Logo = () => {
  return (
    <div className="logo-container">
      <img src={myImage} alt="XG Tipping logo" className='responsive-logo'/>
    </div>
  );
};

export default Logo;
