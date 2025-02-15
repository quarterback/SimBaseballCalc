import React from 'react';

export const Button = ({ children, onClick, variant = 'default', disabled = false }) => {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100',
    disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
  };

  const classes = `${baseClasses} ${disabled ? variants.disabled : variants[variant]}`;

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
