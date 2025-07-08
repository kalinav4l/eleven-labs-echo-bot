import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ScrapingNodeProps {
  data: {
    label: string;
    url?: string;
    scrapingType?: 'single' | 'full_site';
  };
}

export const ScrapingNode: React.FC<ScrapingNodeProps> = ({ data }) => {
  return (
    <Card className="min-w-[200px] shadow-md border-2 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-orange-600 p-2 rounded-lg">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Web Scraping</h3>
            <p className="text-xs text-gray-500">
              {data.url ? new URL(data.url).hostname : 'No URL configured'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button size="sm" variant="outline" className="w-full">
            <Settings className="h-3 w-3 mr-1" />
            Setup Scraping
          </Button>
        </div>
        
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-orange-600" 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-3 h-3 bg-orange-600" 
        />
      </CardContent>
    </Card>
  );
};