import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp } from 'lucide-react';

interface WelcomeCardProps {
  displayName: string;
  totalCalls: number;
  totalCost: number;
}

const WelcomeCard = ({ displayName, totalCalls, totalCost }: WelcomeCardProps) => {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground relative">
      <CardContent className="p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">
              Bună, {displayName}!
            </h2>
          </div>
          
          <p className="text-primary-foreground/80 mb-6">
            Gestionează agenții tăi AI și urmărește performanțele
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm opacity-80">Apeluri Totale</span>
              </div>
              <div className="text-3xl font-bold">{totalCalls}</div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm opacity-80">Cost Total</span>
              </div>
              <div className="text-3xl font-bold">${totalCost.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;