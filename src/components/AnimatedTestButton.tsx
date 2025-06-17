
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
      {/* Overlapping Circles Animation - Similar to the infographic */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer Circle - Green (like the outer ring in the image) */}
        <div 
          className={cn(
            "absolute w-14 h-14 rounded-full border-4 border-green-400/60",
            isAnimating && "animate-spin"
          )}
          style={{ 
            animationDuration: '4s',
            background: 'conic-gradient(from 0deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.3))'
          }}
        />
        
        {/* Middle Circle - Yellow/Orange (like the middle ring) */}
        <div 
          className={cn(
            "absolute w-10 h-10 rounded-full border-4 border-yellow-500/70",
            isAnimating && "animate-spin"
          )}
          style={{ 
            animationDuration: '2.5s', 
            animationDirection: 'reverse',
            background: 'conic-gradient(from 45deg, rgba(234, 179, 8, 0.4), rgba(249, 115, 22, 0.3), rgba(234, 179, 8, 0.4))'
          }}
        />
        
        {/* Inner Circle - Dark/Black (like the inner section) */}
        <div 
          className={cn(
            "absolute w-6 h-6 rounded-full border-3 border-gray-800/60",
            isAnimating && "animate-spin"
          )}
          style={{ 
            animationDuration: '1.8s',
            background: 'conic-gradient(from 90deg, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.4), rgba(31, 41, 55, 0.6))'
          }}
        />
        
        {/* Center Core - Active indicator */}
        <div 
          className={cn(
            "absolute w-2 h-2 rounded-full transition-all duration-300",
            isActive ? "bg-yellow-400 shadow-lg" : "bg-gray-700",
            isAnimating && "animate-pulse"
          )}
          style={{
            boxShadow: isActive ? '0 0 12px rgba(250, 204, 21, 0.8), 0 0 24px rgba(250, 204, 21, 0.4)' : 'none'
          }}
        />
      </div>

      {/* Button Content */}
      <div className="relative z-10 flex items-center gap-2">
        <TestTube className="w-4 h-4" />
        Testează Agent
      </div>

      {/* Enhanced Glow Effect when active */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-yellow-400/20 to-green-400/20 rounded-lg animate-pulse" />
      )}
      
      {/* Speaking Animation Overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg animate-pulse" />
      )}
    </Button>
  );
};
