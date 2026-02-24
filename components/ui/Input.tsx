import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  startIcon?: React.ReactNode; 
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  startIcon, 
  endIcon, 
  onEndIconClick, 
  ...props 
}) => {
  return (
    <div className="flex flex-col w-full mb-4 relative">
      <label className="text-white text-sm mb-2 font-medium">{label}</label>
      <div className="relative flex items-center">
        
        {startIcon && (
          <div className="absolute left-4 text-gray-400">
            {startIcon}
          </div>
        )}

        <input
          {...props}
          className={`w-full bg-[#2C4A7C] text-white placeholder-gray-400 rounded-xl py-3 outline-none focus:ring-2 focus:ring-[#00C897] transition-all 
            ${startIcon ? 'pl-12' : 'pl-4'} 
            ${endIcon ? 'pr-12' : 'pr-4'}
          `}
        />

        {endIcon && (
          <button
            type="button"
            onClick={onEndIconClick}
            className="absolute right-4 text-gray-400 hover:text-white transition-colors"
          >
            {endIcon}
          </button>
        )}
      </div>
    </div>
  );
};