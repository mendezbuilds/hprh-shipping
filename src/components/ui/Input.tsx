import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-sans placeholder-slate-400 outline-none transition-all ${
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/30' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500 font-sans">{hint}</p>}
      {error && <p className="text-xs text-rose-600 font-sans font-medium">{error}</p>}
    </div>
  );
};

export default Input;
