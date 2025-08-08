import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface WelcomeSectionProps {
  userName: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  return (
    <Card className="relative overflow-hidden bg-primary text-primary-foreground p-8 mb-6">
      <div className="relative z-10">
        <p className="text-primary-foreground/80 text-sm mb-2">Welcome back</p>
        <h2 className="text-3xl font-bold mb-4">{userName}</h2>
        <p className="text-primary-foreground/90 mb-6">
          Glad to see you again!<br />
          Ask me anything.
        </p>
        <Button variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Play className="w-4 h-4 mr-2" />
          Tap to record
        </Button>
      </div>
      
      {/* Abstract background design */}
      <div className="absolute top-0 right-0 w-full h-full opacity-20">
        <div className="absolute top-8 right-8 w-32 h-32 bg-accent rounded-full blur-xl"></div>
        <div className="absolute top-16 right-16 w-24 h-24 bg-accent rounded-full blur-lg"></div>
        <div className="absolute bottom-8 right-12 w-40 h-40 bg-accent rounded-full blur-2xl"></div>
      </div>
    </Card>
  );
};

export default WelcomeSection;