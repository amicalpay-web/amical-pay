import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-amical-orange hover:bg-amical-orange-dark text-white focus:ring-amical-orange',
    secondary: 'bg-amical-dark-tertiary hover:bg-amical-dark-secondary text-white focus:ring-amical-dark-tertiary',
    ghost: 'bg-transparent hover:bg-amical-dark-tertiary text-white focus:ring-amical-dark-tertiary',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const finalClass = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <button
      disabled={disabled || isLoading}
      className={finalClass}
      {...props}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};
