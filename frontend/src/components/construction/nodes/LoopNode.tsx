import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { RotateCcw, Settings } from 'lucide-react';

interface LoopNodeProps {
  data: {
    label: string;
    loopType?: string;
    iterations?: number;
    breakCondition?: string;
  };
}

export const LoopNode: React.FC<LoopNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-cyan-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-cyan-100 p-2 rounded">
              <RotateCcw className="h-4 w-4 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Loop</h3>
              <p className="text-xs text-gray-500">Iteration Control</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Type:</span> {data.loopType || 'For Each'}
          </div>
          <div>
            <span className="font-medium">Max:</span> {data.iterations || 10}
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-cyan-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="continue"
        style={{ top: '40%' }}
        className="w-3 h-3 bg-cyan-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="break"
        style={{ top: '60%' }}
        className="w-3 h-3 bg-red-600 border-none" 
      />
    </div>
  );
};