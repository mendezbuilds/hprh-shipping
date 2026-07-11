import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input: React.FC<InputProps> = ({ label, error, hint, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-[10px] font-mono uppercase tracking-widest text-hprh-pine/70 font-bold select-none">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-hprh-paper border-2 ${error ? 'border-hprh-clay' : 'border-hprh-pine/15'} focus:border-hprh-sage focus:ring-1 focus:ring-hprh-sage/20 rounded py-2.5 px-3.5 text-sm text-hprh-pine placeholder-hprh-pine/30 outline-none transition-all ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-[10px] text-hprh-pine/50 font-sans">{hint}</p>}
      {error && <p className="text-[10px] text-hprh-clay font-sans font-medium">{error}</p>}
    </div>
  );
};

export default Input;
