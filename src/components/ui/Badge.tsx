import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'sage'       // Availability, success, confirmed
  | 'olive'      // Atelier active, verified
  | 'rose'       // Featured, highlight
  | 'nude'       // Pending approval, in-review
  | 'blush'      // Neutral draft, subtle
  | 'grey'       // Rejected, cancelled, suspended
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'blush',
  className,
  dot = false,
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    sage: 'bg-[#EBF1E9] text-closea-olive border border-closea-sage/30',
    olive: 'bg-closea-olive text-white',
    rose: 'bg-closea-rose text-white',
    nude: 'bg-[#F7EFEF] text-closea-grey border border-closea-nude/40',
    blush: 'bg-closea-blush text-closea-grey',
    grey: 'bg-[#ECEAE9] text-closea-grey border border-closea-grey/20',
    outline: 'border border-closea-nude text-closea-grey bg-white',
  };

  const dotColors: Record<BadgeVariant, string> = {
    sage: 'bg-closea-sage',
    olive: 'bg-white',
    rose: 'bg-white',
    nude: 'bg-closea-rose',
    blush: 'bg-closea-grey-light',
    grey: 'bg-closea-grey',
    outline: 'bg-closea-nude',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full inline-block', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
