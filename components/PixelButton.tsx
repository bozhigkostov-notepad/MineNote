
import React from 'react';

interface PixelButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'red';
  className?: string;
  disabled?: boolean;
}

const PixelButton: React.FC<PixelButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'default', 
  className = '',
  disabled = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'green': return 'bg-[#55FF55] border-[#00AA00] hover:bg-[#77FF77]';
      case 'red': return 'bg-[#FF5555] border-[#AA0000] hover:bg-[#FF7777]';
      default: return 'bg-[#c6c6c6] border-[#555] hover:bg-[#d6d6d6]';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        mc-button px-4 py-2 text-2xl font-bold uppercase tracking-wider
        active:translate-y-1 active:shadow-inner disabled:opacity-50 disabled:translate-y-0
        ${getVariantStyles()}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default PixelButton;
