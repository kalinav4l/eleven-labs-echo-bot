import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';

interface TranscriptNodeProps {
  data: {
    label: string;
    operation?: 'process' | 'save' | 'analyze';
  };
}

export const TranscriptNode: React.FC<TranscriptNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm min-w-[160px] hover:shadow-md transition-shadow">
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-teal-100 p-1.5 rounded">
            <FileText className="h-3 w-3 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-900">Transcript</h3>
            <p className="text-[10px] text-gray-500">
              {data.operation ? `${data.operation}` : 'Not configured'}
            </p>
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-teal-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-teal-600 border-none" 
      />
    </div>
  );
};