import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Square, RotateCcw, Download, Upload } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface WorkflowToolbarProps {
  nodes: Node[];
  edges: Edge[];
  onClear: () => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({ 
  nodes, 
  edges, 
  onClear 
}) => {
  const handleRun = () => {
    console.log('Running workflow with nodes:', nodes, 'and edges:', edges);
    // TODO: Implement workflow execution
  };

  const handleExport = () => {
    const workflowData = { nodes, edges };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="absolute top-4 right-4 z-10 bg-white border border-gray-200 shadow-lg">
      <div className="p-3 flex items-center space-x-2">
        <Button 
          size="sm" 
          onClick={handleRun}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="h-4 w-4 mr-1" />
          Run
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={onClear}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Clear
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </Card>
  );
};