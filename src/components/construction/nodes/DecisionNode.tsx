import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Settings } from 'lucide-react';

interface DecisionNodeProps {
  data: {
    label: string;
    conditions?: string[];
    branches?: number;
  };
}

export const DecisionNode: React.FC<DecisionNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-yellow-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-100 p-2 rounded">
              <GitBranch className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Decision</h3>
              <p className="text-xs text-gray-500">Conditional Logic</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Conditions:</span> {data.conditions?.length || 1}
          </div>
          <div>
            <span className="font-medium">Branches:</span> {data.branches || 2}
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-yellow-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true"
        style={{ top: '60%' }}
        className="w-3 h-3 bg-green-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="false"
        style={{ top: '40%' }}
        className="w-3 h-3 bg-red-600 border-none" 
      />
    </div>
  );
};