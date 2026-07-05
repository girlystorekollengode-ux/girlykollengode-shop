import React from 'react';
import logoImg from '../../assets/logo.png';

const Logo = ({ className = '', showCircle = true, showSubtitle = true, size = 'h-12' }) => {
  return (
    <div className={`relative ${size} flex items-center shrink-0 ${className}`}>
      <img
        src={logoImg}
        alt="GIRLY Logo"
        className="h-full w-auto object-contain select-none"
      />
    </div>
  );
};

export default Logo;
