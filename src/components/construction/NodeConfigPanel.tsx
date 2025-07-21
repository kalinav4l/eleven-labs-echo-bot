import React, { useState, useCallback } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Play, Settings, Code, Database, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, data: any) => void;
  onTestNode: (nodeId: string) => void;
  workflowData: any[];
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onUpdateNode,
  onTestNode,
  workflowData
}) => {
  const [nodeData, setNodeData] = useState(node?.data || {});
  const [isActive, setIsActive] = useState(node?.data?.isActive !== false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleSave = useCallback(() => {
    if (!node) return;
    
    onUpdateNode(node.id, {
      ...nodeData,
      isActive,
      lastModified: new Date().toISOString()
    });
    
    toast({
      title: "Node Updated",
      description: "Configuration saved successfully",
    });
  }, [node, nodeData, isActive, onUpdateNode]);

  const handleTest = useCallback(async () => {
    if (!node) return;
    
    setTestResults({ loading: true });
    
    // Simulate test execution
    setTimeout(() => {
      const mockResults = {
        success: true,
        executionTime: Math.random() * 1000 + 200,
        inputData: workflowData[workflowData.length - 1] || {},
        outputData: {
          ...nodeData,
          processedAt: new Date().toISOString(),
          status: 'completed'
        }
      };
      setTestResults(mockResults);
      onTestNode(node.id);
    }, 1500);
  }, [node, nodeData, workflowData, onTestNode]);

  const renderAgentConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="agentId">Agent ID</Label>
        <Input
          id="agentId"
          value={nodeData.agentId as string || ''}
          onChange={(e) => setNodeData({...nodeData, agentId: e.target.value})}
          placeholder="agent_xxxxxxxxx"
        />
      </div>
      <div>
        <Label htmlFor="agentName">Agent Name</Label>
        <Input
          id="agentName"
          value={nodeData.agentName as string || ''}
          onChange={(e) => setNodeData({...nodeData, agentName: e.target.value})}
          placeholder="My AI Agent"
        />
      </div>
      <div>
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={nodeData.systemPrompt as string || ''}
          onChange={(e) => setNodeData({...nodeData, systemPrompt: e.target.value})}
          placeholder="You are a helpful assistant..."
          rows={4}
        />
      </div>
      <div>
        <Label htmlFor="language">Language</Label>
        <Select value={nodeData.language as string || 'ro'} onValueChange={(value) => setNodeData({...nodeData, language: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ro">Romanian</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderPhoneConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={nodeData.phoneNumber as string || ''}
          onChange={(e) => setNodeData({...nodeData, phoneNumber: e.target.value})}
          placeholder="+40712345678"
        />
      </div>
      <div>
        <Label htmlFor="callType">Call Type</Label>
        <Select value={nodeData.callType as string || 'inbound'} onValueChange={(value) => setNodeData({...nodeData, callType: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="timeout">Timeout (seconds)</Label>
        <Input
          id="timeout"
          type="number"
          value={nodeData.timeout as number || 30}
          onChange={(e) => setNodeData({...nodeData, timeout: parseInt(e.target.value)})}
        />
      </div>
    </div>
  );

  const renderDatabaseConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="operation">Operation</Label>
        <Select value={nodeData.operation as string || 'read'} onValueChange={(value) => setNodeData({...nodeData, operation: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="write">Write</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="table">Table</Label>
        <Input
          id="table"
          value={nodeData.table as string || ''}
          onChange={(e) => setNodeData({...nodeData, table: e.target.value})}
          placeholder="users, conversations, etc."
        />
      </div>
      <div>
        <Label htmlFor="query">Query/Conditions</Label>
        <Textarea
          id="query"
          value={nodeData.query as string || ''}
          onChange={(e) => setNodeData({...nodeData, query: e.target.value})}
          placeholder="WHERE user_id = {{previous.user_id}}"
          rows={3}
        />
      </div>
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="condition">Condition</Label>
        <Textarea
          id="condition"
          value={nodeData.condition as string || ''}
          onChange={(e) => setNodeData({...nodeData, condition: e.target.value})}
          placeholder="{{previous.status}} === 'completed'"
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor="trueLabel">True Path Label</Label>
        <Input
          id="trueLabel"
          value={nodeData.trueLabel as string || 'True'}
          onChange={(e) => setNodeData({...nodeData, trueLabel: e.target.value})}
        />
      </div>
      <div>
        <Label htmlFor="falseLabel">False Path Label</Label>
        <Input
          id="falseLabel"
          value={nodeData.falseLabel as string || 'False'}
          onChange={(e) => setNodeData({...nodeData, falseLabel: e.target.value})}
        />
      </div>
    </div>
  );

  const renderExpressionHelper = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">Available Data</h4>
      <div className="text-xs space-y-2">
        <div>
          <Badge variant="outline" className="mb-1">Previous Node</Badge>
          <div className="pl-2 text-gray-600">
            <div>{"{{previous.data}}"} - Previous node output</div>
            <div>{"{{previous.status}}"} - Execution status</div>
          </div>
        </div>
        <div>
          <Badge variant="outline" className="mb-1">Workflow Context</Badge>
          <div className="pl-2 text-gray-600">
            <div>{"{{workflow.id}}"} - Workflow identifier</div>
            <div>{"{{workflow.timestamp}}"} - Execution timestamp</div>
          </div>
        </div>
        <div>
          <Badge variant="outline" className="mb-1">Functions</Badge>
          <div className="pl-2 text-gray-600">
            <div>{"{{now()}}"} - Current timestamp</div>
            <div>{"{{uuid()}}"} - Generate UUID</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestResults = () => {
    if (!testResults) return null;

    if (testResults.loading) {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span>Testing node...</span>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Test Results</span>
          <Badge variant={testResults.success ? "default" : "destructive"}>
            {testResults.success ? 'Success' : 'Failed'}
          </Badge>
        </div>
        
        <div className="text-xs space-y-2">
          <div>
            <span className="font-medium">Execution Time:</span> {Math.round(testResults.executionTime)}ms
          </div>
          
          <div>
            <span className="font-medium">Input Data:</span>
            <pre className="mt-1 p-2 bg-gray-50 rounded text-[10px] overflow-auto max-h-20">
              {JSON.stringify(testResults.inputData, null, 2)}
            </pre>
          </div>
          
          <div>
            <span className="font-medium">Output Data:</span>
            <pre className="mt-1 p-2 bg-gray-50 rounded text-[10px] overflow-auto max-h-20">
              {JSON.stringify(testResults.outputData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  if (!node) return null;

  const nodeConfig = {
    agent: renderAgentConfig,
    phone: renderPhoneConfig,
    database: renderDatabaseConfig,
    condition: renderConditionConfig,
    scraping: () => (
      <div className="space-y-4">
        <div>
          <Label htmlFor="url">Website URL</Label>
          <Input
            id="url"
            value={nodeData.url as string || ''}
            onChange={(e) => setNodeData({...nodeData, url: e.target.value})}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <Label htmlFor="scrapingType">Scraping Type</Label>
          <Select value={nodeData.scrapingType as string || 'single'} onValueChange={(value) => setNodeData({...nodeData, scrapingType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Page</SelectItem>
              <SelectItem value="full_site">Full Site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),
    gmail: () => (
      <div className="space-y-4">
        <div>
          <Label htmlFor="emailType">Email Type</Label>
          <Select value={nodeData.emailType as string || 'notification'} onValueChange={(value) => setNodeData({...nodeData, emailType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notification">Notification</SelectItem>
              <SelectItem value="confirmation">Confirmation</SelectItem>
              <SelectItem value="report">Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="recipient">Recipient Email</Label>
          <Input
            id="recipient"
            value={nodeData.recipient as string || ''}
            onChange={(e) => setNodeData({...nodeData, recipient: e.target.value})}
            placeholder="user@example.com or {{previous.email}}"
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={nodeData.subject as string || ''}
            onChange={(e) => setNodeData({...nodeData, subject: e.target.value})}
            placeholder="Your workflow has completed"
          />
        </div>
      </div>
    ),
    trigger: () => (
      <div className="space-y-4">
        <div>
          <Label htmlFor="triggerType">Trigger Type</Label>
          <Select value={nodeData.triggerType as string || 'manual'} onValueChange={(value) => setNodeData({...nodeData, triggerType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="schedule">Schedule</SelectItem>
              <SelectItem value="call_received">Call Received</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {nodeData.triggerType === 'schedule' && (
          <div>
            <Label htmlFor="schedule">Schedule (Cron)</Label>
            <Input
              id="schedule"
              value={nodeData.schedule as string || ''}
              onChange={(e) => setNodeData({...nodeData, schedule: e.target.value})}
              placeholder="0 9 * * * (every day at 9 AM)"
            />
          </div>
        )}
        {nodeData.triggerType === 'webhook' && (
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={nodeData.webhookUrl as string || ''}
              onChange={(e) => setNodeData({...nodeData, webhookUrl: e.target.value})}
              placeholder="Generated automatically"
              readOnly
            />
          </div>
        )}
      </div>
    ),
    transcript: () => (
      <div className="space-y-4">
        <div>
          <Label htmlFor="operation">Operation</Label>
          <Select value={nodeData.operation as string || 'process'} onValueChange={(value) => setNodeData({...nodeData, operation: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="process">Process</SelectItem>
              <SelectItem value="save">Save</SelectItem>
              <SelectItem value="analyze">Analyze</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <h2 className="text-lg font-semibold text-gray-900">
            {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="p-4 space-y-6">
            {/* Node Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Node Active</Label>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <Separator />

            {/* Node Configuration */}
            {nodeConfig[node.type as keyof typeof nodeConfig]?.() || (
              <div className="text-sm text-gray-500">
                No configuration available for this node type.
              </div>
            )}

            <Separator />

            {/* Expression Helper */}
            {renderExpressionHelper()}
          </TabsContent>

          <TabsContent value="test" className="p-4 space-y-4">
            <div className="space-y-4">
              <Button 
                onClick={handleTest} 
                className="w-full"
                disabled={testResults?.loading}
              >
                <Play className="h-4 w-4 mr-2" />
                Test Node
              </Button>
              
              {renderTestResults()}
            </div>
          </TabsContent>

          <TabsContent value="data" className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Node Information</h4>
                <div className="text-xs space-y-1 text-gray-600">
                  <div>ID: {node.id}</div>
                  <div>Type: {node.type}</div>
                  <div>Position: {Math.round(node.position.x)}, {Math.round(node.position.y)}</div>
                  {nodeData.lastModified && (
                    <div>Modified: {new Date(nodeData.lastModified as string).toLocaleString()}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Raw Data</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(nodeData, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};