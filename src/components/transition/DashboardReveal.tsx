import React, { useEffect, useState } from 'react';

interface DashboardRevealProps {
  isRevealing: boolean;
  children: React.ReactNode;
}

export const DashboardReveal: React.FC<DashboardRevealProps> = ({
  isRevealing,
  children
}) => {
  const [revealPhase, setRevealPhase] = useState<'hidden' | 'revealing' | 'revealed'>('hidden');

  useEffect(() => {
    if (isRevealing) {
      setRevealPhase('revealing');
      // Start revealing elements with stagger
      setTimeout(() => {
        setRevealPhase('revealed');
      }, 100);
    } else {
      setRevealPhase('hidden');
    }
  }, [isRevealing]);

  return (
    <div 
      className={`dashboard-reveal ${revealPhase}`}
      style={{
        opacity: revealPhase === 'hidden' ? 0 : 1,
        transition: 'opacity 300ms ease-out',
      }}
    >
      {children}
    </div>
  );
};