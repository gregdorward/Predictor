import React from 'react';
import myImage from './images/SoccerStatsHub.jpeg';

const Logo = () => {
  return (
    <div className="logo-container">
      <img src={myImage} alt="Soccer Stats Hub logo" className='responsive-logo'/>
    </div>
  );
};

export default Logo;
