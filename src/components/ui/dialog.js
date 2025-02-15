import React from 'react';

export const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">{children}</div>
    </div>
  );
};

export const DialogContent = ({ children, className }) => (
  <div className={`dialog-content ${className}`}>{children}</div>
);

export const DialogHeader = ({ children }) => (
  <div className="dialog-header">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="dialog-title">{children}</h2>
);

export const DialogTrigger = ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
);
