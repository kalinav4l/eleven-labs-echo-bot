import React from 'react';
import { 
  Play, MessageCircle, GitBranch, Globe, Database, Mail, 
  PhoneForwarded, Clock, RotateCcw, PhoneOff, BarChart3 
} from 'lucide-react';

interface SidebarProps {
  onAddNode: (type: string) => void;
}

const nodeCategories = [
  {
    title: 'Call Flow',
    nodes: [
      { type: 'start', icon: Play, label: 'Start Call', description: 'Begin workflow' },
      { type: 'conversation', icon: MessageCircle, label: 'Conversation', description: 'AI dialog handler' },
      { type: 'endCall', icon: PhoneOff, label: 'End Call', description: 'Terminate call' },
    ]
  },
  {
    title: 'Logic & Routing',
    nodes: [
      { type: 'decision', icon: GitBranch, label: 'Decision', description: 'Conditional logic' },
      { type: 'transferCall', icon: PhoneForwarded, label: 'Transfer', description: 'Human handoff' },
      { type: 'wait', icon: Clock, label: 'Wait', description: 'Smart pause' },
      { type: 'loop', icon: RotateCcw, label: 'Loop', description: 'Iteration control' },
    ]
  },
  {
    title: 'Data & Integration',
    nodes: [
      { type: 'dataCollection', icon: Database, label: 'Collect Data', description: 'Form gathering' },
      { type: 'apiRequest', icon: Globe, label: 'API Request', description: 'External integration' },
      { type: 'emailSms', icon: Mail, label: 'Email/SMS', description: 'Send messages' },
    ]
  },
  {
    title: 'Analytics',
    nodes: [
      { type: 'analytics', icon: BarChart3, label: 'Analytics', description: 'Event tracking' },
    ]
  },
];

export const WorkflowSidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
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