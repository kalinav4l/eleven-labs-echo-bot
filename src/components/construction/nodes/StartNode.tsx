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
    <div className="bg-white border border-green-400 rounded-md shadow-sm min-w-[160px] hover:shadow-md transition-all duration-200">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-1.5 rounded-md">
              <Play className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900">Start Call</h3>
              <p className="text-xs text-gray-500">Entry Point</p>
            </div>
          </div>
          <Settings className="h-3 w-3 text-gray-400" />
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium">Voice:</span> 
            <span>{data.voiceModel || 'Sarah'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Duration:</span> 
            <span>{data.maxDuration || 30}min</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Recording:</span> 
            <span>{data.recording ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-green-600 border-none" 
      />
    </div>
  );
};