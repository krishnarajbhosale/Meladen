import { useState } from 'react';

interface Props {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

export default function InputField({ label, type = 'text', value, onChange, required }: Props) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 pt-5 pb-2 text-sm text-[#b8b3ac] outline-none focus:border-[#c9a84c] transition-colors duration-200"
      />
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-200 ${
          active ? 'top-1.5 text-[10px] tracking-wide text-[#c9a84c]' : 'top-3.5 text-sm text-[#888]'
        }`}
      >
        {label}{required && ' *'}
      </label>
    </div>
  );
}
