import { useState, useEffect } from 'react';

interface UsePageTransitionOptions {
  duration?: number;
  onComplete?: () => void;
}

export const usePageTransition = (options: UsePageTransitionOptions = {}) => {
  const { duration = 3000, onComplete } = options;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'complete'>('idle');

  const startTransition = () => {
    setIsTransitioning(true);
    setProgress(0);
    setPhase('loading');

    // Simulate loading progress
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress >= 100) {
        setPhase('complete');
        setTimeout(() => {
          setIsTransitioning(false);
          setPhase('idle');
          onComplete?.();
        }, 500);
      } else {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  };

  return {
    isTransitioning,
    progress,
    phase,
    startTransition
  };
};