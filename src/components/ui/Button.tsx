import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 tracking-wide rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-closea-rose text-white hover:bg-[#bd9290] focus:ring-closea-rose shadow-sm',
      secondary:
        'bg-closea-blush text-closea-grey hover:bg-[#ebd8d5] focus:ring-closea-nude',
      outline:
        'border border-closea-nude text-closea-grey hover:bg-closea-blush/50 focus:ring-closea-nude',
      ghost:
        'text-closea-grey hover:bg-closea-blush/40 focus:ring-closea-nude',
      sage:
        'bg-closea-sage text-white hover:bg-closea-olive focus:ring-closea-sage shadow-sm',
      dark:
        'bg-closea-grey text-white hover:bg-[#3f3a38] focus:ring-closea-grey shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-4 py-2 gap-1.5',
      md: 'text-sm px-6 py-2.5 gap-2',
      lg: 'text-base px-8 py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
