import React, { useEffect, useState } from 'react';

interface DashboardEntranceProps {
  children: React.ReactNode;
  isEntering: boolean;
}

export const DashboardEntrance: React.FC<DashboardEntranceProps> = ({
  children,
  isEntering
}) => {
  const [showContent, setShowContent] = useState(!isEntering);
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'entering' | 'visible'>('hidden');

  useEffect(() => {
    if (isEntering) {
      setAnimationPhase('hidden');
      const timer1 = setTimeout(() => {
        setShowContent(true);
        setAnimationPhase('entering');
      }, 100);

      const timer2 = setTimeout(() => {
        setAnimationPhase('visible');
      }, 600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setShowContent(true);
      setAnimationPhase('visible');
    }
  }, [isEntering]);

  if (!showContent) {
    return null;
  }

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'hidden':
        return 'opacity-0 scale-95 translate-y-8';
      case 'entering':
        return 'opacity-0 scale-95 translate-y-8 animate-[entrance_0.8s_ease-out_forwards]';
      case 'visible':
        return 'opacity-100 scale-100 translate-y-0';
      default:
        return '';
    }
  };

  return (
    <div className={`transition-all duration-700 ease-out ${getAnimationClasses()}`}>
      {/* Staggered Animation for Child Elements */}
      <div className="dashboard-entrance">
        {children}
      </div>
      
      {/* Welcome Effect */}
      {animationPhase === 'entering' && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-4xl font-bold text-primary opacity-0 animate-[welcome_2s_ease-out_forwards]">
              Bun venit!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};