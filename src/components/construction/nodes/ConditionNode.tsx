import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

interface ConditionNodeProps {
  data: {
    label: string;
    condition?: string;
  };
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm min-w-[160px] hover:shadow-md transition-shadow">
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-yellow-100 p-1.5 rounded">
            <GitBranch className="h-3 w-3 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-900">Condition</h3>
            <p className="text-[10px] text-gray-500">
              {data.condition || 'Not configured'}
            </p>
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-yellow-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true"
        style={{ top: '60%' }}
        className="w-2 h-2 bg-green-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="false"
        style={{ top: '40%' }}
        className="w-2 h-2 bg-red-600 border-none" 
      />
    </div>
  );
};