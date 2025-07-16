import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Settings, Plus } from 'lucide-react';
import { AgentResponse } from '@/types/dtos';

interface AgentToolsProps {
  agentData: AgentResponse;
  setAgentData: React.Dispatch<React.SetStateAction<AgentResponse | null>>;
}

interface BuiltInTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const AgentTools: React.FC<AgentToolsProps> = ({ agentData, setAgentData }) => {
  const builtInTools: BuiltInTool[] = [
    {
      id: 'end_call',
      name: 'End call',
      description: 'Gives agent the ability to end the call with the user.',
      enabled: agentData.conversation_config?.agent?.prompt?.built_in_tools?.end_call?.enabled || false
    },
    {
      id: 'detect_language',
      name: 'Detect language',
      description: 'Gives agent the ability to change the language during conversation.',
      enabled: agentData.conversation_config?.agent?.prompt?.built_in_tools?.detect_language?.enabled || false
    },
    {
      id: 'skip_turn',
      name: 'Skip turn',
      description: 'Agent will skip its turn if user explicitly indicates they need a moment.',
      enabled: agentData.conversation_config?.agent?.prompt?.built_in_tools?.skip_turn?.enabled || false
    },
    {
      id: 'transfer_to_agent',
      name: 'Transfer to agent',
      description: 'Gives agent the ability to transfer the call to another AI agent.',
      enabled: agentData.conversation_config?.agent?.prompt?.built_in_tools?.transfer_to_agent?.enabled || false
    },
    {
      id: 'transfer_to_number',
      name: 'Transfer to number',
      description: 'Gives agent the ability to transfer the call to a human.',
      enabled: agentData.conversation_config?.agent?.prompt?.built_in_tools?.transfer_to_number?.enabled || false
    },
    {
      id: 'play_keypad_touch_tone',
      name: 'Play keypad touch tone',
      description: 'Gives agent the ability to play keypad touch tones during a phone call.',
      enabled: agentData.conversation_config?.agent?.prompt?.built_in_tools?.play_keypad_touch_tone?.enabled || false
    }
  ];

  const handleToolToggle = (toolId: string, enabled: boolean) => {
    setAgentData({
      ...agentData,
      conversation_config: {
        ...agentData.conversation_config,
        agent: {
          ...agentData.conversation_config?.agent,
          prompt: {
            ...agentData.conversation_config?.agent?.prompt,
            built_in_tools: {
              ...agentData.conversation_config?.agent?.prompt?.built_in_tools,
              [toolId]: {
                enabled: enabled
              }
            }
          }
        }
      }
    });
  };

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Tools
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Let the agent perform specific actions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Built-in Tools */}
        <div className="space-y-4">
          {builtInTools.map((tool) => (
            <div key={tool.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
              <div className="space-y-1 flex-1">
                <Label htmlFor={tool.id} className="text-foreground font-medium cursor-pointer">
                  {tool.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {tool.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => {
                    // TODO: Open tool configuration modal
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Switch
                  id={tool.id}
                  checked={tool.enabled}
                  onCheckedChange={(checked) => handleToolToggle(tool.id, checked)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Custom Tools Section */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-foreground font-medium">Custom tools</h4>
              <p className="text-sm text-muted-foreground">
                Provide the agent with custom tools it can use to help users.
              </p>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add tool
            </Button>
          </div>
          
          {/* Placeholder for custom tools */}
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No custom tools added yet.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentTools;