import React, { useCallback, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from '@/components/construction/WorkflowSidebar';
import { WorkflowToolbar } from '@/components/construction/WorkflowToolbar';
import { AgentNode } from '@/components/construction/nodes/AgentNode';
import { PhoneNode } from '@/components/construction/nodes/PhoneNode';
import { DatabaseNode } from '@/components/construction/nodes/DatabaseNode';
import { ScrapingNode } from '@/components/construction/nodes/ScrapingNode';
import { TranscriptNode } from '@/components/construction/nodes/TranscriptNode';
import { GmailNode } from '@/components/construction/nodes/GmailNode';
import { ConditionNode } from '@/components/construction/nodes/ConditionNode';
import { TriggerNode } from '@/components/construction/nodes/TriggerNode';

const nodeTypes = {
  agent: AgentNode,
  phone: PhoneNode,
  database: DatabaseNode,
  scraping: ScrapingNode,
  transcript: TranscriptNode,
  gmail: GmailNode,
  condition: ConditionNode,
  trigger: TriggerNode,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: { label: 'Start Workflow' },
  },
];

const initialEdges: Edge[] = [];

const Construction = () => {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
      data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const saveWorkflow = () => {
    console.log('Saving workflow:', { nodes, edges, workflowName });
    // TODO: Implement save functionality
  };

  const loadWorkflow = () => {
    console.log('Loading workflow');
    // TODO: Implement load functionality
  };

  return (
    <DashboardLayout>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Workflow Constructor</h1>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={loadWorkflow}>
              Load
            </Button>
            <Button onClick={saveWorkflow} className="bg-gray-900 hover:bg-gray-800">
              Save Workflow
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with node palette */}
          <Sidebar onAddNode={addNode} />

          {/* Main canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
              attributionPosition="bottom-left"
            >
              <Controls 
                className="bg-white border border-gray-200 rounded-lg shadow-sm"
                showZoom={true}
                showFitView={true}
                showInteractive={true}
              />
              <MiniMap 
                className="bg-white border border-gray-200 rounded-lg"
                nodeStrokeColor="#374151"
                nodeColor="#f3f4f6"
                nodeBorderRadius={8}
              />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1} 
                color="#e5e7eb"
              />
            </ReactFlow>

            {/* Floating toolbar */}
            <WorkflowToolbar 
              nodes={nodes} 
              edges={edges} 
              onClear={() => {
                setNodes(initialNodes);
                setEdges([]);
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Construction;