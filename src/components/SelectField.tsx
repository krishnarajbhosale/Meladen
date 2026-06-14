import { useState } from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  /** Placeholder shown when no value is selected. */
  placeholder?: string;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
  placeholder = 'Select',
}: Props) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        disabled={disabled}
        className={`w-full appearance-none rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 pt-5 pb-2 pr-9 text-sm outline-none transition-colors duration-200 focus:border-[#c9a84c] disabled:opacity-50 ${
          value ? 'text-[#b8b3ac]' : 'text-transparent'
        }`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map(opt => (
          <option key={opt} value={opt} className="text-[#b8b3ac]">
            {opt}
          </option>
        ))}
      </select>
      <label
        className={`pointer-events-none absolute left-4 transition-all duration-200 ${
          active ? 'top-1.5 text-[10px] tracking-wide text-[#c9a84c]' : 'top-3.5 text-sm text-[#888]'
        }`}
      >
        {label}
        {required && ' *'}
      </label>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888]"
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
