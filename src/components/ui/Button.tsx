import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-closea-rosewood text-white hover:bg-[#853c4b] shadow-md hover:shadow-lg',
      secondary: 'bg-closea-ink text-white hover:bg-black shadow-md',
      outline: 'border-2 border-gray-200 text-closea-ink hover:border-gray-300 hover:bg-gray-50',
      ghost: 'text-closea-inkSoft hover:bg-gray-100 hover:text-closea-ink',
      sage: 'bg-closea-sage text-closea-olive hover:bg-[#dce6d8]',
      dark: 'bg-gray-900 text-white hover:bg-black shadow-md',
    };

    const sizes = {
      sm: 'text-xs px-4 py-2',
      md: 'text-sm px-6 py-3',
      lg: 'text-base px-8 py-4',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';