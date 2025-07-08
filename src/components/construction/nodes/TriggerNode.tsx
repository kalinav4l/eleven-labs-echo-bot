import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TriggerNodeProps {
  data: {
    label: string;
    triggerType?: 'manual' | 'webhook' | 'schedule' | 'call_received';
  };
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] shadow-md border-2 border-gray-300 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-gray-700 p-2 rounded-lg">
            <Play className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Workflow Trigger</h3>
            <p className="text-xs text-gray-500">
              {data.triggerType ? data.triggerType.replace('_', ' ') : 'Manual trigger'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button size="sm" variant="outline" className="w-full">
            <Settings className="h-3 w-3 mr-1" />
            Setup Trigger
          </Button>
        </div>
        
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-3 h-3 bg-gray-700" 
        />
      </CardContent>
    </Card>
  );
};