import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-bold uppercase tracking-wider transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'btn-manga',
      secondary: 'btn-manga-secondary',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-manga',
      outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white shadow-manga',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizes = {
      default: 'h-11 px-6 py-3',
      sm: 'h-9 px-4 text-sm',
      lg: 'h-14 px-8 text-lg',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
