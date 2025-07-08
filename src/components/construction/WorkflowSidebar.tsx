import React from 'react';
import { Bot, Phone, Database, Globe, FileText, Mail, GitBranch, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SidebarProps {
  onAddNode: (type: string) => void;
}

const nodeCategories = [
  {
    title: 'Triggers',
    nodes: [
      { type: 'trigger', icon: Play, label: 'Trigger', description: 'Start point for workflow' },
    ]
  },
  {
    title: 'AI & Communication',
    nodes: [
      { type: 'agent', icon: Bot, label: 'AI Agent', description: 'Connect AI agent for conversations' },
      { type: 'phone', icon: Phone, label: 'Phone', description: 'Handle phone calls and numbers' },
      { type: 'gmail', icon: Mail, label: 'Gmail', description: 'Send emails and confirmations' },
    ]
  },
  {
    title: 'Data & Processing',
    nodes: [
      { type: 'database', icon: Database, label: 'Database', description: 'Store and retrieve data' },
      { type: 'scraping', icon: Globe, label: 'Scraping', description: 'Extract web data' },
      { type: 'transcript', icon: FileText, label: 'Transcript', description: 'Process transcripts and history' },
    ]
  },
  {
    title: 'Logic',
    nodes: [
      { type: 'condition', icon: GitBranch, label: 'Condition', description: 'Add conditional logic' },
    ]
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow Components</h2>
        
        <div className="space-y-6">
          {nodeCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.nodes.map((node) => (
                  <Card 
                    key={node.type}
                    className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                    onClick={() => onAddNode(node.type)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <node.icon className="h-4 w-4 text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{node.label}</h4>
                          <p className="text-xs text-gray-500 mt-1">{node.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};