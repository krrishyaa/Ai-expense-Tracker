import React from 'react';

export const Badge: React.FC<{ variant?: string; className?: string; children?: React.ReactNode }> = ({ className = '', children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded ${className}`}>{children}</span>
);

export default Badge;
