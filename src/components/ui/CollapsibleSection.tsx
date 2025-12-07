import React from 'react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
  className = '',
}) => {
  return (
    <div className={`border border-gray-300 rounded ${className}`}>
      <div
        onClick={onToggle}
        className="flex justify-between items-center p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition"
      >
        <div>
          <div className="font-medium text-sm">{title}</div>
          {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
        </div>
        <svg
          className={`w-5 h-5 transform transition ${isOpen ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};
