import React from 'react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

interface GlassWelcomeProps {
  displayName: string;
  totalCalls: number;
  totalCost: number;
}

const GlassWelcomeCard = ({ displayName, totalCalls, totalCost }: GlassWelcomeProps) => {
  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl opacity-60" />
      
      {/* Content */}
      <div className="relative p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  Bună, {displayName}!
                </h2>
                <p className="text-foreground/70">
                  Dashboard-ul tău de performanță AI
                </p>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Zap className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground/60">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Apeluri Totale</span>
            </div>
            <div className="text-4xl font-bold text-foreground">{totalCalls}</div>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground/60">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Cost Total</span>
            </div>
            <div className="text-4xl font-bold text-foreground">${totalCost.toFixed(2)}</div>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full backdrop-blur-sm animate-pulse" />
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full backdrop-blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default GlassWelcomeCard;