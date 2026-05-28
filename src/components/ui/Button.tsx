import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, onClick, variant = 'primary', size = 'md',
  className, disabled, type = 'button', fullWidth
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/25',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/10',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-red-500/25',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-lg shadow-emerald-500/25',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-xl',
    md: 'px-5 py-2.5 text-base rounded-xl',
    lg: 'px-6 py-3.5 text-lg rounded-2xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
};
