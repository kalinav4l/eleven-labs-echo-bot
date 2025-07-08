import React from 'react';
import { Bot, Phone, Database, Globe, FileText, Mail, GitBranch, Play } from 'lucide-react';

interface SidebarProps {
  onAddNode: (type: string) => void;
}

const nodeCategories = [
  {
    title: 'Triggers',
    nodes: [
      { type: 'trigger', icon: Play, label: 'Start', description: 'Workflow trigger' },
    ]
  },
  {
    title: 'AI & Communication',
    nodes: [
      { type: 'agent', icon: Bot, label: 'AI Agent', description: 'AI conversation handler' },
      { type: 'phone', icon: Phone, label: 'Phone', description: 'Call management' },
      { type: 'gmail', icon: Mail, label: 'Email', description: 'Send notifications' },
    ]
  },
  {
    title: 'Data',
    nodes: [
      { type: 'database', icon: Database, label: 'Database', description: 'Data operations' },
      { type: 'scraping', icon: Globe, label: 'Scraping', description: 'Web data extraction' },
      { type: 'transcript', icon: FileText, label: 'Transcript', description: 'Process recordings' },
    ]
  },
  {
    title: 'Logic',
    nodes: [
      { type: 'condition', icon: GitBranch, label: 'Condition', description: 'If/else logic' },
    ]
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-3">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Components</h2>
        
        <div className="space-y-4">
          {nodeCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.nodes.map((node) => (
                  <div 
                    key={node.type}
                    className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onAddNode(node.type)}
                  >
                    <div className="bg-gray-100 p-1.5 rounded mr-2">
                      <node.icon className="h-3 w-3 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900">{node.label}</div>
                      <div className="text-[10px] text-gray-500">{node.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};