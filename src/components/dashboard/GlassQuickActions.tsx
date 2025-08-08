import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Phone, BarChart3, Users, Zap, ArrowRight } from 'lucide-react';

const GlassQuickActions = () => {
  const actions = [
    {
      label: 'Agent Nou',
      description: 'Creează un agent AI',
      href: '/agent-ai',
      icon: Plus,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Apel Test',
      description: 'Testează agenții',
      href: '/test-call',
      icon: Phone,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Analytics',
      description: 'Vezi statisticile',
      href: '/conversation-analytics',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Contacte',
      description: 'Gestionează contactele',
      href: '/contacts',
      icon: Users,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="relative group animate-fade-in">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg" />
      
      {/* Content */}
      <div className="relative p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Acțiuni Rapide</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <div 
                className="group/action p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${action.gradient} shadow-md group-hover/action:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover/action:text-primary transition-colors">
                      {action.label}
                    </h4>
                    <p className="text-xs text-foreground/60">
                      {action.description}
                    </p>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-foreground/40 group-hover/action:text-primary group-hover/action:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlassQuickActions;