
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddWidget: () => void;
}

const EmptyState = ({ onAddWidget }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 text-center p-8">
      <div className="mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        Build Your Perfect Dashboard
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Add widgets to track what matters most to your team. Monitor calls, sentiment, and performance metrics in real-time.
      </p>
      
      <Button 
        onClick={onAddWidget} 
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Widget
      </Button>
    </div>
  );
};

export default EmptyState;
