import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  tooltip?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked,
  onChange,
  className = '',
  tooltip,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary rounded focus:ring-primary"
      />
      <label className="flex items-center text-sm">
        {label}
        {tooltip && <InfoTooltip content={tooltip} />}
      </label>
    </div>
  );
};
