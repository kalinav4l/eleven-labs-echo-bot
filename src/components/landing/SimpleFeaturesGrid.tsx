import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Brain, 
  Clock, 
  Globe, 
  Shield, 
  Zap, 
  BarChart3,
  MessageSquare,
  Settings,
  Phone
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Advanced AI Brain",
    description: "Powered by state-of-the-art language models that understand context and nuance"
  },
  {
    icon: Clock,
    title: "24/7 Availability", 
    description: "Your AI agents work around the clock, never taking breaks or sick days"
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Communicate with customers in 40+ languages with perfect pronunciation"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption and compliance certifications"
  },
  {
    icon: Zap,
    title: "Lightning Fast Setup",
    description: "Get your AI agent up and running in under 3 minutes with our intuitive builder"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Deep insights into call performance, customer sentiment, and conversation trends"
  },
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description: "Human-like interactions that feel authentic and build genuine connections"
  },
  {
    icon: Settings,
    title: "Easy Customization",
    description: "Tailor your agent's personality, knowledge base, and responses to your brand"
  },
  {
    icon: Phone,
    title: "Multi-channel Support",
    description: "Voice calls, web chat, and integrations with your existing communication tools"
  }
];

export const SimpleFeaturesGrid = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need for AI-Powered Communication
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to transform how your business communicates with customers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};