import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Mic } from 'lucide-react';

export const SimpleHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/30 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-small-black/[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 mb-8 bg-primary/10 rounded-full text-sm text-primary border border-primary/20">
          <Mic className="w-4 h-4 mr-2" />
          AI-Powered Voice Technology
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
          Transform Your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60"> Business </span>
          with AI Agents
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Create intelligent voice agents that handle customer calls, bookings, and support 
          with human-like conversations. Available 24/7 in 40+ languages.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button asChild size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-transform">
            <Link to="/auth">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-transform">
            <Link to="/voice-demo">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm">
            <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-muted-foreground">Uptime Guarantee</div>
          </div>
          <div className="text-center p-6 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm">
            <div className="text-3xl font-bold text-primary mb-2">&lt;3min</div>
            <div className="text-muted-foreground">Setup Time</div>
          </div>
          <div className="text-center p-6 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm">
            <div className="text-3xl font-bold text-primary mb-2">40+</div>
            <div className="text-muted-foreground">Languages</div>
          </div>
        </div>
      </div>
    </section>
  );
};