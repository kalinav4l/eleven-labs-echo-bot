import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench, Star, Zap } from 'lucide-react';

const Construction = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.history.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">
            Visual Workflow Builder
          </h1>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            Create sophisticated AI call workflows with our drag-and-drop interface. 
            Coming soon with advanced features.
          </p>

          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Drag & drop workflow nodes
              </span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Real-time workflow testing
              </span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
              <Wrench className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Advanced automation tools
              </span>
            </div>
          </div>

          <Button 
            onClick={() => window.history.back()}
            className="mt-6"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Construction;