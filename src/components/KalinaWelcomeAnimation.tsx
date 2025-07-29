import React, { useEffect, useState } from 'react';

interface KalinaWelcomeAnimationProps {
  onComplete: () => void;
}

export const KalinaWelcomeAnimation: React.FC<KalinaWelcomeAnimationProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fade out after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Complete the animation after fade out
      setTimeout(onComplete, 800);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`kalina-welcome-overlay ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="kalina-welcome-content">
        <h1 className="kalina-welcome-text">KALINA</h1>
        <div className="kalina-welcome-dots">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
        </div>
      </div>
    </div>
  );
};