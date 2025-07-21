import { useEffect, useRef, useState } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

export function useScrollReveal(direction: Direction = 'up', delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay * 1000);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (direction) {
      case 'up':
        return 'animate-slide-in-up opacity-100';
      case 'down':
        return 'animate-slide-in-down opacity-100';
      case 'left':
        return 'animate-slide-in-left opacity-100';
      case 'right':
        return 'animate-slide-in-right opacity-100';
      default:
        return 'animate-fade-in opacity-100';
    }
  };

  return { ref, isVisible, animationClass: getAnimationClass() };
}