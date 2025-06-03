
import React, { useState, useEffect } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WelcomeCreditsAnimationProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeCreditsAnimation = ({ isOpen, onClose }: WelcomeCreditsAnimationProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [creditsCount, setCreditsCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      // Animate credits counting up
      const targetCredits = 100000;
      const duration = 2000; // 2 seconds
      const increment = targetCredits / (duration / 50);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetCredits) {
          current = targetCredits;
          clearInterval(timer);
        }
        setCreditsCount(Math.floor(current));
      }, 50);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <Card className="bg-black border-2 border-white max-w-md mx-4 animate-scale-in">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="relative inline-block">
              <Coins className="w-20 h-20 text-yellow-400 animate-bounce" />
              <Sparkles className="w-6 h-6 text-white absolute -top-2 -right-2 animate-pulse" />
              <Sparkles className="w-4 h-4 text-white absolute -bottom-1 -left-1 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Bun venit!
          </h2>
          
          <p className="text-gray-300 mb-6">
            Felicitări! Ai primit cadou de bun venit:
          </p>
          
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-6 py-4 rounded-lg mb-6">
            <div className="text-3xl font-bold">
              {creditsCount.toLocaleString()} credite
            </div>
            <div className="text-sm opacity-80">
              Aproximativ 100 de minute de convorbire gratuită!
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Poți folosi aceste credite pentru a vorbi cu asistenții noștri AI. 
            1 minut de convorbire = 1.000 credite.
          </p>
          
          <Button 
            onClick={onClose}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3"
          >
            Să începem!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeCreditsAnimation;
