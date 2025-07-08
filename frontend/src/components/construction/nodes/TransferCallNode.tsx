import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PhoneForwarded, Settings } from 'lucide-react';

interface TransferCallNodeProps {
  data: {
    label: string;
    transferType?: string;
    destination?: string;
    timeout?: number;
  };
}

export const TransferCallNode: React.FC<TransferCallNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-orange-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-100 p-2 rounded">
              <PhoneForwarded className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Transfer Call</h3>
              <p className="text-xs text-gray-500">Human Handoff</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Type:</span> {data.transferType || 'Cold'}
          </div>
          <div>
            <span className="font-medium">Timeout:</span> {data.timeout || 30}s
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-orange-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="success"
        style={{ top: '40%' }}
        className="w-3 h-3 bg-green-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="failed"
        style={{ top: '60%' }}
        className="w-3 h-3 bg-red-600 border-none" 
      />
    </div>
  );
};