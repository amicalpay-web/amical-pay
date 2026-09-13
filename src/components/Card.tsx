import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-amical-dark-secondary border border-amical-dark-tertiary rounded-xl p-6 hover:border-amical-orange/50 transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
};
