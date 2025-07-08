import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BarChart3, Settings } from 'lucide-react';

interface AnalyticsNodeProps {
  data: {
    label: string;
    eventName?: string;
    eventCategory?: string;
    timing?: string;
  };
}

export const AnalyticsNode: React.FC<AnalyticsNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-emerald-300 rounded-lg shadow-sm min-w-[200px] hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 p-2 rounded">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
              <p className="text-xs text-gray-500">Event Tracking</p>
            </div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Event:</span> {data.eventName || 'custom_event'}
          </div>
          <div>
            <span className="font-medium">Timing:</span> {data.timing || 'Immediate'}
          </div>
        </div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-emerald-600 border-none" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-emerald-600 border-none" 
      />
    </div>
  );
};