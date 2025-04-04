import React from 'react';
import myImage from './images/SoccerStatsHub.jpeg';

const Logo = () => {
  return (
    <h1 className="logo-container">
      <img src={myImage} alt="Soccer Stats Hub logo" className='responsive-logo'/>
    </h1>
  );
};

export default Logo;
