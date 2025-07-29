import { useState, useCallback, useRef } from 'react';

export const useFluidReveal = () => {
  const [isActive, setIsActive] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const startReveal = useCallback((triggerElement?: HTMLElement) => {
    if (triggerElement) {
      triggerElementRef.current = triggerElement;
    }
    setIsActive(true);
    setIsRevealing(false);
  }, []);

  const onRevealComplete = useCallback(() => {
    setIsActive(false);
    setIsRevealing(true);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setIsRevealing(false);
    triggerElementRef.current = null;
  }, []);

  return {
    isActive,
    isRevealing,
    triggerElement: triggerElementRef.current,
    startReveal,
    onRevealComplete,
    reset
  };
};