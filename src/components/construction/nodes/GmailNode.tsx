import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail } from 'lucide-react';

interface GmailNodeProps {
  data: {
    label: string;
    emailType?: 'confirmation' | 'notification' | 'report';
    recipient?: string;
  };
}

export const GmailNode: React.FC<GmailNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm min-w-[160px] hover:shadow-md transition-shadow">
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-red-100 p-1.5 rounded">
            <Mail className="h-3 w-3 text-red-600" />
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-900">Email</h3>
            <p className="text-[10px] text-gray-500">
              {data.emailType ? `${data.emailType}` : 'Not configured'}
            </p>
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-red-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-red-600 border-none" 
      />
    </div>
  );
};