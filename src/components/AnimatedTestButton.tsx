
import React from 'react';
import { TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';

interface AnimatedTestButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isAnimating?: boolean;
}

export const AnimatedTestButton: React.FC<AnimatedTestButtonProps> = ({
  onClick,
  isActive = false,
  isAnimating = false,
}) => {
  return (
    <Button
      onClick={onClick}
      className="relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg shadow-lg overflow-hidden"
    >
      {/* Overlapping Circles Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer Circle - Green */}
        <div 
          className={cn(
            "absolute w-16 h-16 rounded-full border-4 border-green-400/30",
            isAnimating && "animate-spin"
          )}
          style={{ animationDuration: '3s' }}
        />
        
        {/* Middle Circle - Yellow */}
        <div 
          className={cn(
            "absolute w-12 h-12 rounded-full border-4 border-yellow-400/50",
            isAnimating && "animate-spin"
          )}
          style={{ animationDuration: '2s', animationDirection: 'reverse' }}
        />
        
        {/* Inner Circle - Black */}
        <div 
          className={cn(
            "absolute w-8 h-8 rounded-full border-4 border-gray-900/40",
            isAnimating && "animate-spin"
          )}
          style={{ animationDuration: '1.5s' }}
        />
        
        {/* Center Core */}
        <div 
          className={cn(
            "absolute w-3 h-3 rounded-full transition-all duration-300",
            isActive ? "bg-yellow-400 shadow-yellow-400/50" : "bg-gray-600",
            isAnimating && "animate-pulse"
          )}
          style={{
            boxShadow: isActive ? '0 0 15px rgba(250, 204, 21, 0.6)' : 'none'
          }}
        />
      </div>

      {/* Button Content */}
      <div className="relative z-10 flex items-center gap-2">
        <TestTube className="w-4 h-4" />
        Testează Agent
      </div>

      {/* Glow Effect */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-yellow-400/20 rounded-lg animate-pulse" />
      )}
    </Button>
  );
};
