import React from 'react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
interface GlassWelcomeProps {
  displayName: string;
  totalCalls: number;
  totalCost: number;
}
const GlassWelcomeCard = ({
  displayName,
  totalCalls,
  totalCost
}: GlassWelcomeProps) => {
  return <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl opacity-60" />
      
      {/* Content */}
      <div className="relative p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Bună, {displayName}!</h2>
                <p className="text-muted-foreground">Panoul tău de performanță AI</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="w-24 h-24 rounded-full border border-border bg-gradient-to-br from-primary/15 to-secondary/15 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-10 h-10 text-primary" />
            </div>
          </div>
        </header>

        <div className="border-t border-border/50" />

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <article className="group rounded-2xl border border-border/60 bg-background/40 backdrop-blur p-5 transition-all hover:shadow-lg hover-scale">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Apeluri totale</span>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary">Live</div>
            </div>
            <div className="mt-2 text-4xl font-bold text-foreground">{totalCalls}</div>
            <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-primary/40 via-accent/40 to-secondary/40" />
          </article>

          <article className="group rounded-2xl border border-border/60 bg-background/40 backdrop-blur p-5 transition-all hover:shadow-lg hover-scale">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Cost total</span>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent">Actualizat</div>
            </div>
            <div className="mt-2 text-4xl font-bold text-foreground">${totalCost.toFixed(2)}</div>
            <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-secondary/40 via-accent/40 to-primary/40" />
          </article>
        </section>
      </div>
      
      {/* Floating decorative elements */}
      
      
    </div>;
};
export default GlassWelcomeCard;