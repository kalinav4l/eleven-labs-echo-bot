import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Phone, Settings, Play, Plus, Trash2, Mic, Bot, Zap, Save, TestTube, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  serverUrl: string;
}

const Construction = () => {
  const { user } = useAuth();
  const [agentName, setAgentName] = useState('Untitled Assistant');
  const [isActive, setIsActive] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [model, setModel] = useState('gpt-4o');
  const [voice, setVoice] = useState('nova');
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showAddTool, setShowAddTool] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const addTool = () => {
    const newTool: Tool = {
      id: `tool_${Date.now()}`,
      name: '',
      description: '',
      parameters: [],
      serverUrl: ''
    };
    setTools([...tools, newTool]);
    setSelectedTool(newTool);
    setShowAddTool(true);
  };

  const updateTool = (toolId: string, updates: Partial<Tool>) => {
    setTools(tools.map(tool => 
      tool.id === toolId ? { ...tool, ...updates } : tool
    ));
  };

  const deleteTool = (toolId: string) => {
    setTools(tools.filter(tool => tool.id !== toolId));
    if (selectedTool?.id === toolId) {
      setSelectedTool(null);
      setShowAddTool(false);
    }
  };

  const saveAgent = () => {
    const agentData = {
      name: agentName,
      systemPrompt,
      model,
      voice,
      tools,
      isActive,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`agent_${agentName}`, JSON.stringify(agentData));
    toast({
      title: "Agent Saved",
      description: `"${agentName}" has been saved successfully.`,
    });
  };

  const testAgent = () => {
    toast({
      title: "Test Started",
      description: "Voice test call initiated. You should receive a call shortly.",
    });
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={testAgent}>
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button size="sm" onClick={saveAgent} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
          
          {/* Agent Name */}
          <div className="space-y-3">
            <div>
              <Input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="text-lg font-medium border-none px-0 focus-visible:ring-0 shadow-none"
                placeholder="Assistant Name"
              />
            </div>
            
            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="text-sm font-medium">Active Status</Label>
              <div className="flex items-center space-x-2">
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="config">Config</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="p-6 space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nova">Nova (Female)</SelectItem>
                    <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                    <SelectItem value="echo">Echo (Male)</SelectItem>
                    <SelectItem value="onyx">Onyx (Male)</SelectItem>
                    <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define your assistant's personality, role, and behavior..."
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  This defines how your assistant behaves and responds to users.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="p-0">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Functions & Tools</h3>
                  <Button size="sm" onClick={addTool} variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tool
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Define what actions your assistant can perform.
                </p>
              </div>
              
              <div className="space-y-1">
                {tools.map((tool) => (
                  <div 
                    key={tool.id} 
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-l-2 ${
                      selectedTool?.id === tool.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedTool(tool);
                      setShowAddTool(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {tool.name || 'Unnamed Tool'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {tool.description || 'No description'}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {tool.parameters.length} params
                          </Badge>
                          {tool.serverUrl && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              API
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTool(tool.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {tools.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tools added yet</p>
                    <p className="text-xs">Add functions to give your assistant capabilities</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="test" className="p-6 space-y-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Mic className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Test Your Assistant</h3>
                  <p className="text-sm text-gray-500">
                    Start a voice call to test your assistant's behavior
                  </p>
                </div>
                <Button onClick={testAgent} className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Start Test Call
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Test Configuration</h4>
                <div className="space-y-2">
                  <Label className="text-xs">Phone Number (Optional)</Label>
                  <Input placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Test Scenario</Label>
                  <Select defaultValue="general">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Conversation</SelectItem>
                      <SelectItem value="booking">Appointment Booking</SelectItem>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="sales">Sales Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Panel - Tool Configuration */}
      {showAddTool && selectedTool && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Configure Tool</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddTool(false)}>
                ×
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label>Function Name</Label>
              <Input
                value={selectedTool.name}
                onChange={(e) => updateTool(selectedTool.id, { name: e.target.value })}
                placeholder="e.g., getWeather, bookAppointment"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={selectedTool.description}
                onChange={(e) => updateTool(selectedTool.id, { description: e.target.value })}
                placeholder="Describe what this function does and when to use it..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Server URL</Label>
              <Input
                value={selectedTool.serverUrl}
                onChange={(e) => updateTool(selectedTool.id, { serverUrl: e.target.value })}
                placeholder="https://your-api.com/endpoint"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Parameters</Label>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Parameter
                </Button>
              </div>
              
              {selectedTool.parameters.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No parameters defined</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Construction;