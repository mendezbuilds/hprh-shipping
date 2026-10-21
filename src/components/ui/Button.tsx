import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer select-none';

  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 hover:shadow-md hover:shadow-indigo-500/20 border border-transparent focus:ring-indigo-600 focus:ring-offset-white',
    secondary: 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs focus:ring-indigo-600 focus:ring-offset-white',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 hover:shadow-md hover:shadow-rose-500/20 border border-transparent focus:ring-rose-600 focus:ring-offset-white',
    ghost: 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-transparent shadow-none focus:ring-indigo-600 focus:ring-offset-white',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-500/20 border border-transparent focus:ring-emerald-600 focus:ring-offset-white',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5',
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
