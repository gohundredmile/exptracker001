import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label, value, onChange, placeholder, type = 'text',
  className, prefix, suffix, error, disabled, required
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className={cn(
        'flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all duration-200',
        'bg-white/5 border-white/10 focus-within:border-indigo-500 focus-within:bg-white/10',
        error && 'border-red-500/50',
        disabled && 'opacity-50'
      )}>
        {prefix && <span className="text-gray-400 flex-shrink-0">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
        />
        {suffix && <span className="text-gray-400 flex-shrink-0">{suffix}</span>}
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
};

interface SelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, className, required }) => {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-xl border border-white/10 bg-gray-800 text-white px-3 py-2.5 outline-none focus:border-indigo-500 transition-all text-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};
