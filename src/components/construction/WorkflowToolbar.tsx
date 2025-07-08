import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Download } from 'lucide-react';
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
    <div className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-sm">
      <div className="p-2 flex items-center space-x-1">
        <Button 
          size="sm" 
          onClick={handleRun}
          className="bg-gray-900 hover:bg-gray-800 text-white h-7 px-2"
        >
          <Play className="h-3 w-3 mr-1" />
          Run
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost"
          onClick={onClear}
          className="h-7 px-2"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Clear
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleExport}
          className="h-7 px-2"
        >
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
};