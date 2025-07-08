import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Phone, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PhoneNodeProps {
  data: {
    label: string;
    phoneNumber?: string;
    callType?: 'inbound' | 'outbound';
  };
}

export const PhoneNode: React.FC<PhoneNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] shadow-md border-2 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Phone Handler</h3>
            <p className="text-xs text-gray-500">
              {data.phoneNumber || 'No number configured'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button size="sm" variant="outline" className="w-full">
            <Settings className="h-3 w-3 mr-1" />
            Setup Phone
          </Button>
        </div>
        
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-green-600" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-3 h-3 bg-green-600" 
        />
      </CardContent>
    </Card>
  );
};