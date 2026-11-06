import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-closea-grey"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8DFDD] text-closea-grey text-sm transition-all duration-200 placeholder:text-closea-grey-muted focus:outline-none focus:border-closea-rose focus:ring-2 focus:ring-closea-blush',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-red-600 tracking-wide">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#3D322E]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
