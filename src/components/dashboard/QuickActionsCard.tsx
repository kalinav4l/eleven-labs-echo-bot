import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Phone, BarChart3, Users, Zap } from 'lucide-react';

const QuickActionsCard = () => {
  const actions = [
    {
      label: 'Agent Nou',
      href: '/agent-ai',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Apel Test',
      href: '/test-call',
      icon: Phone,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Analytics',
      href: '/conversation-analytics',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      label: 'Contacte',
      href: '/contacts',
      icon: Users,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Acțiuni Rapide
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button 
                className={`w-full h-16 ${action.color} text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
              >
                <div className="flex flex-col items-center gap-1">
                  <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">{action.label}</span>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;