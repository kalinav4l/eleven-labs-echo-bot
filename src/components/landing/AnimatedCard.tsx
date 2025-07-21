
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface AnimatedCardProps {
  children: React.ReactNode;
  variant: 'light' | 'dark';
  delay?: number;
  index?: number;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  variant,
  delay = 0,
  index = 0,
  className = ''
}) => {
  const baseClasses = variant === 'dark'
    ? 'bg-black text-white border-white/20 hover:border-white/40'
    : 'bg-white text-black border-black/20 hover:border-black/40';

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.9,
        rotateX: 15
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0
      }}
      transition={{
        duration: 0.6,
        delay: delay + index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        scale: 1.03,
        rotateY: 5,
        boxShadow: variant === 'dark' 
          ? '0 20px 40px rgba(255, 255, 255, 0.1)' 
          : '0 20px 40px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3 }
      }}
      viewport={{ once: true }}
      className="perspective-1000"
    >
      <Card className={`${baseClasses} ${className} relative overflow-hidden group`}>
        {/* Hover glow effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          variant === 'dark'
            ? 'bg-gradient-to-br from-white/5 via-transparent to-white/10'
            : 'bg-gradient-to-br from-black/5 via-transparent to-black/10'
        }`} />
        
        {/* Magnetic ripple effect */}
        <motion.div
          className={`absolute inset-0 rounded-lg ${
            variant === 'dark' ? 'bg-white/5' : 'bg-black/5'
          } scale-0 group-hover:scale-100 transition-transform duration-500`}
        />
        
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    </motion.div>
  );
};
