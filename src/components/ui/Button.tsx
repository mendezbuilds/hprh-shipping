import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-hprh-clay text-hprh-paper hover:bg-hprh-clay/90 active:scale-95 shadow-sm',
    secondary: 'bg-hprh-sage text-hprh-paper hover:bg-hprh-sage/90 active:scale-95 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    ghost: 'border-2 border-hprh-pine/20 text-hprh-pine hover:border-hprh-sage hover:text-hprh-sage hover:bg-hprh-sage/5',
  };

  const sizes = {
    sm: 'text-[10px] px-3 py-1.5',
    md: 'text-xs px-5 py-2.5',
    lg: 'text-sm px-7 py-3.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
