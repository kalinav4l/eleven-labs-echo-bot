import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

interface TriggerNodeProps {
  data: {
    label: string;
    triggerType?: 'manual' | 'webhook' | 'schedule' | 'call_received';
  };
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm min-w-[160px] hover:shadow-md transition-shadow">
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-gray-100 p-1.5 rounded">
            <Play className="h-3 w-3 text-gray-700" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-900">Start</h3>
            <p className="text-[10px] text-gray-500">
              {data.triggerType ? data.triggerType.replace('_', ' ') : 'Manual trigger'}
            </p>
          </div>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-gray-700 border-none" 
      />
    </div>
  );
};