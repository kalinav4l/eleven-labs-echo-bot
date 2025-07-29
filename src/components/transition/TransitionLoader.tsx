import React from 'react';
import { ParticleSystem } from './ParticleSystem';

interface TransitionLoaderProps {
  isVisible: boolean;
  progress: number;
}

export const TransitionLoader: React.FC<TransitionLoaderProps> = ({
  isVisible,
  progress
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl" />
      
      {/* Particle System */}
      <ParticleSystem isActive={isVisible} particleCount={80} />
      
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-3xl animate-[spin_20s_linear_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent/20 to-accent/10 rounded-full blur-3xl animate-[spin_15s_linear_infinite_reverse]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Logo/Brand Animation */}
        <div className="relative">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-[gradient-shift_2s_ease-in-out_infinite]">
            Kalina AI
          </h1>
          <div className="absolute inset-0 text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent opacity-50 blur-sm animate-[gradient-shift_2s_ease-in-out_infinite]">
            Kalina AI
          </div>
        </div>

        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
              fill="none"
              opacity="0.3"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(var(--accent))" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary animate-pulse">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-xl font-medium text-foreground animate-fade-in">
            Pregătim experiența ta...
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
          </div>
        </div>
      </div>

      {/* Morphing Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-primary to-accent rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};