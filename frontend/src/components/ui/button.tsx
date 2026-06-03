import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }> = ({ children, className = '', ...props }) => {
  return (
    <button {...props} className={`${className} inline-flex items-center justify-center`}>
      {children}
    </button>
  );
};

export default Button;
