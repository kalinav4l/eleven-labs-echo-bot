import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Download, Save, Power, Settings } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface WorkflowToolbarProps {
  nodes: Node[];
  edges: Edge[];
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  isActive: boolean;
  onToggleActive: () => void;
  workflowName: string;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({ 
  nodes, 
  edges, 
  onClear,
  onSave,
  onLoad,
  isActive,
  onToggleActive,
  workflowName
}) => {
  const handleRun = () => {
    console.log('Running workflow:', workflowName, 'with nodes:', nodes, 'and edges:', edges);
    
    // Simulate workflow execution
    const executionData = {
      workflowId: `workflow_${Date.now()}`,
      startTime: new Date().toISOString(),
      nodes: nodes.length,
      connections: edges.length,
      status: 'running'
    };
    
    console.log('Execution started:', executionData);
  };

  const handleExport = () => {
    const workflowData = { 
      name: workflowName,
      nodes, 
      edges,
      version: '1.0',
      exported: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getWorkflowStatus = () => {
    if (nodes.length === 0) return { status: 'empty', color: 'bg-gray-100 text-gray-600' };
    if (!isActive) return { status: 'inactive', color: 'bg-yellow-100 text-yellow-700' };
    return { status: 'active', color: 'bg-green-100 text-green-700' };
  };

  const statusInfo = getWorkflowStatus();

  return (
    <Card className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg">
      <div className="p-3">
        {/* Workflow Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={statusInfo.color}>
              {statusInfo.status}
            </Badge>
            <span className="text-xs text-gray-500">
              {nodes.length} nodes, {edges.length} connections
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <Button 
            size="sm" 
            onClick={handleRun}
            disabled={nodes.length === 0}
            className="bg-gray-900 hover:bg-gray-800 text-white h-7 px-2"
          >
            <Play className="h-3 w-3 mr-1" />
            Run
          </Button>
          
          <Button 
            size="sm" 
            variant={isActive ? "default" : "outline"}
            onClick={onToggleActive}
            disabled={nodes.length === 0}
            className="h-7 px-2"
          >
            <Power className="h-3 w-3 mr-1" />
            {isActive ? 'Active' : 'Inactive'}
          </Button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onSave}
            className="h-7 px-2"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onLoad}
            className="h-7 px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            Load
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleExport}
            disabled={nodes.length === 0}
            className="h-7 px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onClear}
            disabled={nodes.length === 0}
            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
};