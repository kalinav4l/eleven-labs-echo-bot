import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DatabaseNodeProps {
  data: {
    label: string;
    operation?: 'read' | 'write' | 'update' | 'delete';
    table?: string;
  };
}

export const DatabaseNode: React.FC<DatabaseNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] shadow-md border-2 border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Database className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Database</h3>
            <p className="text-xs text-gray-500">
              {data.operation ? `${data.operation.toUpperCase()} operation` : 'No operation set'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button size="sm" variant="outline" className="w-full">
            <Settings className="h-3 w-3 mr-1" />
            Configure DB
          </Button>
        </div>
        
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-purple-600" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-3 h-3 bg-purple-600" 
        />
      </CardContent>
    </Card>
  );
};