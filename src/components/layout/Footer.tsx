import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 h-10 flex items-center justify-center border-t border-gray-300 text-xs text-gray-600 flex-shrink-0">
      © {new Date().getFullYear()} UK Mortgage Calculator • Version 1.0 • Estimates only - consult a qualified advisor
    </footer>
  );
};
