import React from 'react';
import { cn } from '../../utils/cn';
import { getBudgetColor } from '../../utils/format';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  className?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
  budgetStyle?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, color, className, height = 8, animated = true, showLabel, budgetStyle
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const barColor = budgetStyle ? getBudgetColor(value) : (color || '#6C63FF');

  return (
    <div className={cn('relative', className)}>
      <div
        className="w-full rounded-full bg-white/10 overflow-hidden"
        style={{ height }}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000',
            animated && 'transition-[width]'
          )}
          style={{
            width: `${clampedValue}%`,
            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
            boxShadow: `0 0 10px ${barColor}44`,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-400 mt-1 block text-right">{Math.round(clampedValue)}%</span>
      )}
    </div>
  );
};

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value, size = 80, strokeWidth = 8, color = '#6C63FF', children, className
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s ease',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};
