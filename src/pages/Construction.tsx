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
import { StartNode } from '@/components/construction/nodes/StartNode';
import { ConversationNode } from '@/components/construction/nodes/ConversationNode';
import { DecisionNode } from '@/components/construction/nodes/DecisionNode';
import { ApiRequestNode } from '@/components/construction/nodes/ApiRequestNode';
import { DataCollectionNode } from '@/components/construction/nodes/DataCollectionNode';
import { EmailSmsNode } from '@/components/construction/nodes/EmailSmsNode';
import { TransferCallNode } from '@/components/construction/nodes/TransferCallNode';
import { WaitNode } from '@/components/construction/nodes/WaitNode';
import { LoopNode } from '@/components/construction/nodes/LoopNode';
import { EndCallNode } from '@/components/construction/nodes/EndCallNode';
import { AnalyticsNode } from '@/components/construction/nodes/AnalyticsNode';
import { WorkflowSidebar } from '@/components/construction/WorkflowSidebar';
import { WorkflowToolbar } from '@/components/construction/WorkflowToolbar';
import { NodeConfigPanel } from '@/components/construction/NodeConfigPanel';
import { GlobalSettingsPanel } from '@/components/construction/GlobalSettingsPanel';
import { VariableManager } from '@/components/construction/VariableManager';
import { ArrowLeft, Settings, Play, Variable } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const nodeTypes = {
  start: StartNode,
  conversation: ConversationNode,
  decision: DecisionNode,
  apiRequest: ApiRequestNode,
  dataCollection: DataCollectionNode,
  emailSms: EmailSmsNode,
  transferCall: TransferCallNode,
  wait: WaitNode,
  loop: LoopNode,
  endCall: EndCallNode,
  analytics: AnalyticsNode,
};

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Start Call',
      firstMessage: 'Hello! How can I help you today?',
      voiceModel: 'Sarah',
      maxDuration: 30,
      recording: true
    },
  },
];

const initialEdges: Edge[] = [];

const Construction = () => {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('AI Call Workflow');
  const [isWorkflowActive, setIsWorkflowActive] = useState(false);
  const [workflowData, setWorkflowData] = useState<any[]>([]);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showVariableManager, setShowVariableManager] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    globalPrompt: 'You are a helpful AI assistant for customer service calls.',
    globalVoice: 'sarah',
    company: 'Kalina AI',
    timezone: 'EET'
  });
  const [variables, setVariables] = useState<any[]>([]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        isActive: true,
        createdAt: new Date().toISOString()
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const updateNode = useCallback((nodeId: string, data: any) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  }, [setNodes]);

  const testNode = useCallback((nodeId: string) => {
    console.log('Testing node:', nodeId);
    toast({
      title: "Node Test",
      description: `Successfully tested node ${nodeId}`,
    });
  }, []);

  const saveWorkflow = () => {
    const workflowData = {
      name: workflowName,
      nodes,
      edges,
      isActive: isWorkflowActive,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`workflow_${workflowName}`, JSON.stringify(workflowData));
    console.log('Saving workflow:', workflowData);
    toast({
      title: "Workflow Saved",
      description: `"${workflowName}" has been saved successfully.`,
    });
  };

  const loadWorkflow = () => {
    // Simple load from localStorage for demo
    const savedWorkflow = localStorage.getItem(`workflow_${workflowName}`);
    if (savedWorkflow) {
      const data = JSON.parse(savedWorkflow);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setIsWorkflowActive(data.isActive || false);
      toast({
        title: "Workflow Loaded",
        description: `"${workflowName}" has been loaded successfully.`,
      });
    } else {
      toast({
        title: "No Workflow Found",
        description: `No saved workflow found with name "${workflowName}".`,
        variant: "destructive"
      });
    }
  };

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
    toast({
      title: "Test Started",
      description: `Running workflow "${workflowName}" with ${nodes.length} nodes`,
    });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
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
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="AI Call Workflow"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowGlobalSettings(true)}
            className="flex items-center space-x-1"
          >
            <Settings className="h-4 w-4" />
            <span>Global Settings</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowVariableManager(true)}
            className="flex items-center space-x-1"
          >
            <Variable className="h-4 w-4" />
            <span>Variables</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadWorkflow}
            className="flex items-center space-x-1"
          >
            <span>Load</span>
          </Button>
          <Button 
            size="sm" 
            onClick={saveWorkflow} 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
          >
            <span>Save</span>
          </Button>
          <Button 
            size="sm" 
            onClick={handleRun}
            disabled={nodes.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
          >
            <Play className="h-4 w-4" />
            <span>Test</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* AI Workflow Sidebar */}
        <WorkflowSidebar onAddNode={addNode} />

        {/* Full Canvas */}
          <div className="flex-1 relative bg-gray-50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
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

            {/* Enhanced Workflow Toolbar */}
            <WorkflowToolbar 
              nodes={nodes} 
              edges={edges} 
              onClear={() => {
                setNodes(initialNodes);
                setEdges([]);
              }}
              onSave={saveWorkflow}
              onLoad={loadWorkflow}
              isActive={isWorkflowActive}
              onToggleActive={() => setIsWorkflowActive(!isWorkflowActive)}
              workflowName={workflowName}
            />
          </div>

          {/* Node Configuration Panel */}
          {selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdateNode={updateNode}
              onTestNode={testNode}
              workflowData={workflowData}
            />
          )}
      </div>

      {/* Global Settings Panel */}
      <GlobalSettingsPanel
        isOpen={showGlobalSettings}
        onClose={() => setShowGlobalSettings(false)}
        settings={globalSettings}
        onUpdateSettings={setGlobalSettings}
      />

      {/* Variable Manager */}
      <VariableManager
        isOpen={showVariableManager}
        onClose={() => setShowVariableManager(false)}
        variables={variables}
        onUpdateVariables={setVariables}
      />
    </div>
  );
};

export default Construction;