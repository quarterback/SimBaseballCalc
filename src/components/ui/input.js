import React from 'react';

export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  error = false,
  disabled = false,
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`input ${error ? 'input--error' : ''} ${className}`}
      {...props}
    />
  );
};
