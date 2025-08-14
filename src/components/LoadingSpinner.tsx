
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
  variant?: 'default' | 'primary' | 'accent';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  message,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variantClasses = {
    default: {
      ring: 'border-muted-foreground/20',
      spinner: 'border-t-foreground',
      dot: 'bg-foreground'
    },
    primary: {
      ring: 'border-primary/20',
      spinner: 'border-t-primary',
      dot: 'bg-primary'
    },
    accent: {
      ring: 'border-accent/20',
      spinner: 'border-t-accent',
      dot: 'bg-accent'
    }
  };

  const colors = variantClasses[variant];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer ring with pulse */}
        <div className={`${sizeClasses[size]} rounded-full border-2 ${colors.ring} animate-pulse`}>
          <div className={`absolute top-0 left-0 w-full h-full rounded-full border-2 border-transparent ${colors.spinner} animate-spin`} 
               style={{ animationDuration: '0.8s' }} />
        </div>
        
        {/* Inner rotating dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-1 h-1 ${colors.dot} rounded-full animate-ping`} 
               style={{ animationDelay: '0.2s' }} />
        </div>
        
        {/* Additional visual flair for larger sizes */}
        {(size === 'lg' || size === 'xl') && (
          <div className="absolute inset-1 rounded-full border border-dashed border-muted-foreground/10 animate-spin"
               style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
        )}
      </div>
      
      {/* Loading message */}
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
