import React from 'react';

export const Input = ({ type = 'text', placeholder = '', value, onChange, className = '', ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
