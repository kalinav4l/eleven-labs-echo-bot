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
import { Button } from '@/components/ui/button';
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
import { ArrowLeft } from 'lucide-react';

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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Minimal Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between h-12">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="px-2 py-1 border-none bg-transparent text-lg font-medium text-gray-900 focus:outline-none focus:bg-white focus:border focus:border-gray-300 focus:rounded"
            placeholder="Untitled Workflow"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={loadWorkflow}>
            Load
          </Button>
          <Button size="sm" onClick={saveWorkflow} className="bg-gray-900 hover:bg-gray-800 text-white">
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Minimal Sidebar */}
        <Sidebar onAddNode={addNode} />

        {/* Full Canvas */}
        <div className="flex-1 relative bg-gray-50">
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
            minZoom={0.1}
            maxZoom={2}
          >
            <Controls 
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-sm"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
            <MiniMap 
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg"
              nodeStrokeColor="#6B7280"
              nodeColor="#F3F4F6"
              nodeBorderRadius={6}
              pannable
              zoomable
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={24} 
              size={1} 
              color="#D1D5DB"
            />
          </ReactFlow>

          {/* Minimal Floating Toolbar */}
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
  );
};

export default Construction;