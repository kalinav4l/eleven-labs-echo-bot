import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, Settings } from 'lucide-react';

interface EmailSmsNodeProps {
  data: {
    label: string;
    channel?: string;
    template?: string;
    timing?: string;
  };
}

export const EmailSmsNode: React.FC<EmailSmsNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-red-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-red-100 p-2 rounded">
              <Mail className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Email/SMS</h3>
              <p className="text-xs text-gray-500">Communication</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Channel:</span> {data.channel || 'Email'}
          </div>
          <div>
            <span className="font-medium">Timing:</span> {data.timing || 'Immediate'}
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-red-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-red-600 border-none" 
      />
    </div>
  );
};