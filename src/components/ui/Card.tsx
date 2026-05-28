import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  gradient?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, gradient, glass }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl p-4 transition-all duration-200',
        gradient && 'bg-gradient-to-br',
        glass && 'backdrop-blur-xl bg-white/5 border border-white/10',
        onClick && 'cursor-pointer active:scale-95 hover:scale-[1.01]',
        className
      )}
    >
      {children}
    </div>
  );
};
