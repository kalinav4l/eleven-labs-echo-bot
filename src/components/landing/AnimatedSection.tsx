
import React from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface AnimatedSectionProps {
  children: React.ReactNode;
  variant: 'light' | 'dark';
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  variant,
  direction = 'up',
  delay = 0,
  className = ''
}) => {
  const { ref, isVisible } = useScrollReveal(direction, delay);

  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -100, y: 0 };
      case 'right': return { x: 100, y: 0 };
      case 'down': return { x: 0, y: -100 };
      default: return { x: 0, y: 50 };
    }
  };

  const baseClasses = variant === 'dark' 
    ? 'bg-black text-white' 
    : 'bg-white text-black';

  return (
    <motion.section
      ref={ref}
      className={`relative overflow-hidden ${baseClasses} ${className}`}
      initial={{
        opacity: 0,
        scale: 0.95,
        ...getInitialPosition()
      }}
      animate={isVisible ? {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0
      } : {}}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.3 }
      }}
    >
      {/* Gradient border effect */}
      <div className={`absolute inset-0 ${
        variant === 'dark' 
          ? 'bg-gradient-to-r from-white/10 via-transparent to-white/10' 
          : 'bg-gradient-to-r from-black/10 via-transparent to-black/10'
      } pointer-events-none`} />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              variant === 'dark' ? 'bg-white/20' : 'bg-black/20'
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </motion.section>
  );
};
