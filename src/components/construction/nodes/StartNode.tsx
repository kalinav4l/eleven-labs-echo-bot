import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, Settings } from 'lucide-react';

interface StartNodeProps {
  data: {
    label: string;
    firstMessage?: string;
    voiceModel?: string;
    maxDuration?: number;
    recording?: boolean;
  };
}

export const StartNode: React.FC<StartNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-green-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-2 rounded">
              <Play className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Start Call</h3>
              <p className="text-xs text-gray-500">Workflow Entry Point</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Voice:</span> {data.voiceModel || 'Sarah'}
          </div>
          <div>
            <span className="font-medium">Duration:</span> {data.maxDuration || 30}min
          </div>
          <div>
            <span className="font-medium">Recording:</span> {data.recording ? 'On' : 'Off'}
          </div>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-green-600 border-none" 
      />
    </div>
  );
};