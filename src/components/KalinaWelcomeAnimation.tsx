import React, { useEffect, useState } from 'react';

interface KalinaWelcomeAnimationProps {
  onComplete: () => void;
}

export const KalinaWelcomeAnimation: React.FC<KalinaWelcomeAnimationProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showText, setShowText] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Start particles immediately
    setShowParticles(true);
    
    // Show text after a short delay
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);

    // Start fade out after 4 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
      // Complete the animation after fade out
      setTimeout(onComplete, 1000);
    }, 4000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 4}s`,
      }}
    />
  ));

  return (
    <div className={`kalina-welcome-overlay ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated Background */}
      <div className="kalina-bg-animation"></div>
      
      {/* Particles */}
      {showParticles && (
        <div className="particles-container">
          {particles}
        </div>
      )}
      
      {/* Main Content */}
      <div className="kalina-welcome-content">
        {showText && (
          <>
            <div className="kalina-logo-container">
              <h1 className="kalina-welcome-text">
                {'KALINA'.split('').map((letter, index) => (
                  <span
                    key={index}
                    className="kalina-letter"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {letter}
                  </span>
                ))}
              </h1>
              <div className="kalina-glow"></div>
            </div>
            
            <div className="kalina-tagline">
              <span className="tagline-text">Powered by AI</span>
            </div>
            
            <div className="kalina-welcome-dots">
              <div className="dot dot-1"></div>
              <div className="dot dot-2"></div>
              <div className="dot dot-3"></div>
            </div>
            
            {/* Geometric shapes */}
            <div className="geometric-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};