import React from 'react';

export const Avatar: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`inline-flex items-center justify-center overflow-hidden ${className}`}>{children}</div>
);

export const AvatarFallback: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`flex items-center justify-center ${className}`}>{children}</div>
);

export default Avatar;
