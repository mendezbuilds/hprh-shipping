import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, error, hint, options, placeholder, className = '', id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold select-none">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-hprh-paper border-2 ${error ? 'border-hprh-clay' : 'border-hprh-pine/15'} focus:border-hprh-sage focus:ring-1 focus:ring-hprh-sage/20 rounded py-2.5 px-3.5 text-sm text-hprh-pine outline-none transition-all appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && !error && <p className="text-[10px] text-hprh-pine/50 font-sans">{hint}</p>}
      {error && <p className="text-[10px] text-hprh-clay font-sans font-medium">{error}</p>}
    </div>
  );
};

export default Select;
