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

  // Generate sound waves
  const soundWaves = Array.from({ length: 8 }, (_, i) => (
    <div
      key={i}
      className="sound-wave"
      style={{
        animationDelay: `${i * 0.1}s`,
      }}
    />
  ));

  return (
    <div className={`kalina-welcome-overlay ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated Background */}
      <div className="kalina-bg-animation"></div>
      
      {/* Phone call visualization */}
      <div className="phone-visualization">
        <div className="phone-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 5.5C3 14.0604 9.93959 21 18.5 21C18.8862 21 19.2691 20.9859 19.6483 20.9581C20.0834 20.9262 20.3009 20.9103 20.499 20.7963C20.663 20.7019 20.8185 20.5345 20.9007 20.364C21 20.1582 21 19.9181 21 19.438V16.6207C21 16.2169 21 16.015 20.9335 15.842C20.8749 15.6891 20.7795 15.553 20.6559 15.4456C20.516 15.324 20.3262 15.255 19.9468 15.117L16.4468 13.9394C16.2178 13.8578 16.1032 13.817 15.9963 13.8046C15.9014 13.7931 15.8077 13.8062 15.7239 13.6425L15.6501 13.7239C15.5728 13.8077 15.5269 13.9014 15.5154 13.9963C15.503 14.1032 15.5422 14.2178 15.6206 14.4468L16.7982 17.9468C16.936 18.3262 17.005 18.516 16.8834 18.6559C16.776 18.7795 16.6399 18.8749 16.487 18.9335C16.314 19 16.1121 19 15.7082 19H13.7918C13.3879 19 13.186 19 13.013 18.9335C12.8601 18.8749 12.724 18.7795 12.6166 18.6559C12.495 18.516 12.564 18.3262 12.7018 17.9468L13.8794 14.4468C13.9578 14.2178 13.997 14.1032 13.9846 13.9963C13.9731 13.9014 13.9272 13.8077 13.8499 13.7239L13.7761 13.6425C13.6923 13.8062 13.5986 13.7931 13.5037 13.8046C13.3968 13.817 13.2822 13.8578 13.0532 13.9394L9.55321 15.117C9.17382 15.255 8.98413 15.324 8.84414 15.4456C8.72049 15.553 8.62511 15.6891 8.56653 15.842C8.5 16.015 8.5 16.2169 8.5 16.6207V19.438C8.5 19.9181 8.5 20.1582 8.59925 20.364C8.68146 20.5345 8.83701 20.7019 9.00097 20.7963C9.19911 20.9103 9.41661 20.9262 9.85167 20.9581C10.2309 20.9859 10.6138 21 11 21C11.5523 21 12 21.4477 12 22C12 22.5523 11.5523 23 11 23C9.61406 23 8.33785 22.9735 7.25839 22.8478C6.10699 22.7134 5.27921 22.4831 4.63803 21.8419C3.99684 21.2007 3.76654 20.373 3.63215 19.2216C3.50646 18.1421 3.48 16.8659 3.48 15.48V5.52C3.48 4.13406 3.50646 2.85785 3.63215 1.77839C3.76654 0.626986 3.99684 -0.200735 4.63803 -0.841922C5.27921 -1.48311 6.10699 -1.71341 7.25839 -1.84781C8.33785 -1.97349 9.61406 -2 11 -2H13C14.3859 -2 15.6622 -1.97349 16.7416 -1.84781C17.893 -1.71341 18.7208 -1.48311 19.362 -0.841922C20.0032 -0.200735 20.2335 0.626986 20.3679 1.77839C20.4935 2.85785 20.52 4.13406 20.52 5.52V11C20.52 11.5523 20.0723 12 19.52 12C18.9677 12 18.52 11.5523 18.52 11V5.5C18.52 4.13959 11.8604 3 3.5 3Z"
              fill="currentColor"
            />
          </svg>
        </div>
        
        {/* Sound waves emanating from phone */}
        <div className="sound-waves-container">
          {soundWaves}
        </div>
        
        {/* Voice visualization bars */}
        <div className="voice-bars">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="voice-bar"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: `${20 + Math.random() * 40}px`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Particles */}
      {showParticles && (
        <div className="particles-container">
          {particles}
        </div>
      )}
      
      {/* Animated Border */}
      {showText && (
        <div className="animated-border">
          <div className="border-line border-top"></div>
          <div className="border-line border-right"></div>
          <div className="border-line border-bottom"></div>
          <div className="border-line border-left"></div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="kalina-welcome-content">
        {showText && (
          <>
            <div className="kalina-logo-container">
              <h1 className="kalina-welcome-text">
                {'KALLINA'.split('').map((letter, index) => (
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
            
            {/* Voice Recording Animation */}
            <div className="voice-recording-animation">
              <div className="recording-line">
                <div className="recording-dot"></div>
                <div className="recording-dot"></div>
                <div className="recording-dot"></div>
                <div className="recording-dot"></div>
                <div className="recording-dot"></div>
              </div>
              <div className="recording-glow"></div>
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