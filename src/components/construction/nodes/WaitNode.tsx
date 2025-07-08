import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock, Settings } from 'lucide-react';

interface WaitNodeProps {
  data: {
    label: string;
    waitType?: string;
    duration?: number;
    allowInterruption?: boolean;
  };
}

export const WaitNode: React.FC<WaitNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 p-2 rounded">
              <Clock className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Wait</h3>
              <p className="text-xs text-gray-500">Smart Pause</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Type:</span> {data.waitType || 'Fixed'}
          </div>
          <div>
            <span className="font-medium">Duration:</span> {data.duration || 5}s
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-gray-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-gray-600 border-none" 
      />
    </div>
  );
};