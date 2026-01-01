
import React from 'react';
import { Lock, Unlock, Copy, Check } from 'lucide-react';
import { getContrastColor } from '../utils/colorUtils';

interface ColorCardProps {
  hex: string;
  isLocked: boolean;
  onToggleLock: () => void;
  onCopy: (hex: string) => void;
  isCopied: boolean;
}

const ColorCard: React.FC<ColorCardProps> = ({ hex, isLocked, onToggleLock, onCopy, isCopied }) => {
  const contrastColor = getContrastColor(hex);

  return (
    <div 
      className="relative flex flex-col items-center justify-end h-48 sm:h-64 md:h-full w-full color-card-transition group overflow-hidden shadow-sm hover:shadow-xl"
      style={{ backgroundColor: hex }}
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity" />
      
      <div className="flex flex-col items-center mb-6 md:mb-8 space-y-2 md:space-y-4 z-10">
        <button 
          onClick={onToggleLock}
          className="p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95"
          title={isLocked ? "Unlock Color" : "Lock Color"}
          style={{ color: contrastColor }}
        >
          {isLocked ? <Lock size={16} className="md:w-5 md:h-5" /> : <Unlock size={16} className="md:w-5 md:h-5" />}
        </button>

        <div className="text-center px-2">
          <p 
            className="text-lg md:text-2xl font-bold tracking-wider uppercase mb-1 drop-shadow-sm"
            style={{ color: contrastColor }}
          >
            {hex}
          </p>
          <button 
            onClick={() => onCopy(hex)}
            className="flex items-center space-x-1 px-2 md:px-3 py-1 rounded-full bg-black/10 hover:bg-black/20 transition-colors mx-auto"
            style={{ color: contrastColor, opacity: 0.8 }}
          >
            {isCopied ? <Check size={12} className="md:w-3.5 md:h-3.5" /> : <Copy size={12} className="md:w-3.5 md:h-3.5" />}
            <span className="text-[10px] md:text-xs font-medium uppercase tracking-tighter">
              {isCopied ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorCard;
