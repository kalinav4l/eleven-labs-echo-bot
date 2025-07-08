import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';

interface DatabaseNodeProps {
  data: {
    label: string;
    operation?: 'read' | 'write' | 'update' | 'delete';
    table?: string;
  };
}

export const DatabaseNode: React.FC<DatabaseNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm min-w-[160px] hover:shadow-md transition-shadow">
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-purple-100 p-1.5 rounded">
            <Database className="h-3 w-3 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-900">Database</h3>
            <p className="text-[10px] text-gray-500">
              {data.operation ? `${data.operation.toUpperCase()}` : 'Not configured'}
            </p>
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-purple-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-purple-600 border-none" 
      />
    </div>
  );
};