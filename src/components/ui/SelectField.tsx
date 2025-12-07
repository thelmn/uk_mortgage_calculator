import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface SelectFieldProps {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
  tooltip,
}) => {
  return (
    <div className={className}>
      <label className="flex items-center text-xs text-gray-600 mb-1">
        {label}
        {tooltip && <InfoTooltip content={tooltip} />}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-primary focus:border-2 disabled:bg-gray-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
