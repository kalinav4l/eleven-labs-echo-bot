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
    <div className="bg-white border border-gray-300 rounded-md shadow-sm min-w-[140px] hover:shadow-md transition-all duration-200">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 p-1.5 rounded-md">
              <Clock className="h-3 w-3 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900">Wait</h3>
              <p className="text-xs text-gray-500">Pause</p>
            </div>
          </div>
          <Settings className="h-3 w-3 text-gray-400" />
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium">Type:</span> 
            <span>{data.waitType || 'Fixed'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Duration:</span> 
            <span>{data.duration || 5}s</span>
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-gray-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-gray-600 border-none" 
      />
    </div>
  );
};