import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface FluidRevealProps {
  isActive: boolean;
  triggerElement?: HTMLElement | null;
  onComplete: () => void;
}

export const FluidReveal: React.FC<FluidRevealProps> = ({
  isActive,
  triggerElement,
  onComplete
}) => {
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'expand' | 'reveal' | 'complete'>('idle');

  useEffect(() => {
    if (!isActive) {
      setAnimationPhase('idle');
      return;
    }

    // Calculate starting position from trigger element
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (triggerElement) {
      const rect = triggerElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    // Calculate final radius to cover entire screen
    const maxDistance = Math.sqrt(
      Math.pow(Math.max(startX, window.innerWidth - startX), 2) +
      Math.pow(Math.max(startY, window.innerHeight - startY), 2)
    );

    // Phase 1: Expand mask from trigger point
    setAnimationPhase('expand');
    setMaskStyle({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'hsl(var(--primary))',
      borderRadius: '50%',
      transform: `translate(${startX}px, ${startY}px) scale(0)`,
      transformOrigin: 'center',
      zIndex: 9999,
      opacity: 1,
      transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    });

    // Start expansion
    setTimeout(() => {
      setMaskStyle(prev => ({
        ...prev,
        transform: `translate(${startX - maxDistance}px, ${startY - maxDistance}px) scale(${maxDistance * 2 / 100})`,
      }));
    }, 50);

    // Phase 2: Brief transparency to hint at dashboard
    setTimeout(() => {
      setMaskStyle(prev => ({
        ...prev,
        opacity: 0.85,
        transition: 'opacity 100ms ease-out',
      }));
    }, 450);

    // Phase 3: Start reveal
    setTimeout(() => {
      setAnimationPhase('reveal');
      setMaskStyle(prev => ({
        ...prev,
        opacity: 0,
        transform: `translate(${startX - maxDistance}px, ${startY - maxDistance}px) scale(${maxDistance * 3 / 100})`,
        transition: 'opacity 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }));
    }, 550);

    // Phase 4: Complete
    setTimeout(() => {
      setAnimationPhase('complete');
      onComplete();
    }, 900);

  }, [isActive, triggerElement, onComplete]);

  if (animationPhase === 'idle' || animationPhase === 'complete') {
    return null;
  }

  return createPortal(
    <div style={maskStyle} />,
    document.body
  );
};