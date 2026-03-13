import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  variant = 'primary',
  ...props
}) => {
  const baseStyles = "w-full font-bold text-lg rounded-xl py-4 transition-all flex justify-center items-center disabled:opacity-50";

  const variantStyles = variant === 'primary'
    ? "bg-[#00C897] hover:bg-[#00b085] text-white"
    : "bg-transparent border-2 border-[#2C4A7C] hover:bg-[#2C4A7C]/30 text-white";

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${baseStyles} ${variantStyles} ${props.className}`}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        children
      )}
    </button>
  );
};