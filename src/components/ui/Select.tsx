import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, hint, options, placeholder, className = '', id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-sans outline-none transition-all cursor-pointer ${
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/30' : ''
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-slate-500 font-sans">{hint}</p>}
      {error && <p className="text-xs text-rose-600 font-sans font-medium">{error}</p>}
    </div>
  );
};

export default Select;
