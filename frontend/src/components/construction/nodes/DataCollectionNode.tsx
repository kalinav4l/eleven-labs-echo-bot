import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Settings } from 'lucide-react';

interface DataCollectionNodeProps {
  data: {
    label: string;
    fields?: string[];
    validationRules?: number;
    sequential?: boolean;
  };
}

export const DataCollectionNode: React.FC<DataCollectionNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-indigo-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-100 p-2 rounded">
              <Database className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Data Collection</h3>
              <p className="text-xs text-gray-500">Form Data Gathering</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Fields:</span> {data.fields?.length || 0}
          </div>
          <div>
            <span className="font-medium">Flow:</span> {data.sequential ? 'Sequential' : 'Dynamic'}
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-indigo-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="complete"
        style={{ top: '40%' }}
        className="w-3 h-3 bg-green-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="partial"
        style={{ top: '60%' }}
        className="w-3 h-3 bg-yellow-600 border-none" 
      />
    </div>
  );
};