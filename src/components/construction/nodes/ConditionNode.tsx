import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ConditionNodeProps {
  data: {
    label: string;
    condition?: string;
  };
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] shadow-md border-2 border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-yellow-600 p-2 rounded-lg">
            <GitBranch className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Condition</h3>
            <p className="text-xs text-gray-500">
              {data.condition || 'No condition set'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button size="sm" variant="outline" className="w-full">
            <Settings className="h-3 w-3 mr-1" />
            Set Condition
          </Button>
        </div>
        
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-yellow-600" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          id="true"
          style={{ top: '60%' }}
          className="w-3 h-3 bg-green-600" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          id="false"
          style={{ top: '40%' }}
          className="w-3 h-3 bg-red-600" 
        />
      </CardContent>
    </Card>
  );
};