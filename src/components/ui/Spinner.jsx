import React from 'react';

const Spinner = ({ size = 'md' }) => {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizes[size]} rounded-full border-primary-100 border-t-primary animate-spin`}
      />
    </div>
  );
};

export default Spinner;
