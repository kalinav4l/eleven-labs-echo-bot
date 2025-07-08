import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageCircle, Settings } from 'lucide-react';

interface ConversationNodeProps {
  data: {
    label: string;
    prompt?: string;
    expectedResponses?: string[];
    interruptionHandling?: boolean;
  };
}

export const ConversationNode: React.FC<ConversationNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded">
              <MessageCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Conversation</h3>
              <p className="text-xs text-gray-500">AI Dialog Handler</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Responses:</span> {data.expectedResponses?.length || 0}
          </div>
          <div>
            <span className="font-medium">Interruptions:</span> {data.interruptionHandling ? 'Allow' : 'Block'}
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-blue-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-blue-600 border-none" 
      />
    </div>
  );
};