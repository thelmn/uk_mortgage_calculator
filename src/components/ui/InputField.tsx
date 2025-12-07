import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface InputFieldProps {
  label: string;
  type?: 'text' | 'number';
  value: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  step?: string;
  min?: string | number;
  max?: string | number;
  placeholder?: string;
  className?: string;
  highlightClass?: string;
  tooltip?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  step,
  min,
  max,
  placeholder,
  className = '',
  highlightClass = '',
  tooltip,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
      onChange(newValue);
    }
  };

  return (
    <div className={className}>
      <label className="flex items-center text-xs text-gray-600 mb-1">
        {label}
        {tooltip && <InfoTooltip content={tooltip} />}
      </label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-primary focus:border-2 disabled:bg-gray-100 ${highlightClass}`}
      />
    </div>
  );
};
