import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PhoneOff, Settings } from 'lucide-react';

interface EndCallNodeProps {
  data: {
    label: string;
    closingMessage?: string;
    callDisposition?: string;
    generateSummary?: boolean;
  };
}

export const EndCallNode: React.FC<EndCallNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-red-400 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-red-100 p-2 rounded">
              <PhoneOff className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">End Call</h3>
              <p className="text-xs text-gray-500">Call Termination</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Disposition:</span> {data.callDisposition || 'Success'}
          </div>
          <div>
            <span className="font-medium">Summary:</span> {data.generateSummary ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-red-600 border-none" 
      />
    </div>
  );
};