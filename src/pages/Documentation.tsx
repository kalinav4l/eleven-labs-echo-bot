import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Bot, Phone, BarChart3, Calendar, Globe, Mail, FileText, Settings, 
  Zap, MessageCircle, Users, Headphones, Code, BookOpen, 
  ChevronRight, Play, Eye, Wrench, PieChart
} from 'lucide-react';

const Documentation = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const menuSections = [
    {
      title: 'GET STARTED',
      items: [
        { id: 'overview', title: 'Overview', icon: Eye },
        { id: 'quickstart', title: 'Quickstart', icon: Play },
        { id: 'models', title: 'Models', icon: Bot },
        { id: 'changelog', title: 'Changelog', icon: FileText }
      ]
    },
    {
      title: 'CAPABILITIES',
      items: [
        { id: 'voice-agents', title: 'Voice Agents', icon: Headphones },
        { id: 'phone-calls', title: 'Phone Calls', icon: Phone },
        { id: 'analytics', title: 'Analytics', icon: BarChart3 },
        { id: 'scheduling', title: 'Scheduling', icon: Calendar },
        { id: 'web-scraping', title: 'Web Scraping', icon: Globe },
        { id: 'email-integration', title: 'Email Integration', icon: Mail },
        { id: 'transcriptions', title: 'Transcriptions', icon: FileText }
      ]
    },
    {
      title: 'DEVELOPER GUIDES',
      items: [
        { id: 'tutorials', title: 'Tutorials', icon: BookOpen },
        { id: 'apis', title: 'APIs & SDKs', icon: Code },
        { id: 'webhooks', title: 'Webhooks', icon: Zap }
      ]
    }
  ];

  const renderOverview = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Kalina AI</h1>
            <p className="text-xl text-gray-600">
              Kalina AI is an AI voice agent platform for automated phone calls and customer interactions.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border text-sm">
            <FileText className="h-4 w-4" />
            Copy page
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Most popular</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Developer quickstart</h3>
            <p className="text-gray-600">Learn how to integrate Kalina AI</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Agents</h3>
            <p className="text-gray-600">Deploy voice agents in minutes</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product guides</h3>
            <p className="text-gray-600">Learn how to use Kalina AI</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API reference</h3>
            <p className="text-gray-600">Dive into our API reference</p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet the models</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Kalina v3</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">ALPHA</span>
            </div>
            <p className="text-gray-600 mb-4">Our most emotionally rich, expressive voice agent model</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>Dramatic delivery and performance</div>
              <div>70+ languages supported</div>
            </div>
          </div>
          <div className="p-6 border border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kalina Multilingual v2</h3>
            <p className="text-gray-600 mb-4">Lifelike, consistent quality voice synthesis model</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>Natural-sounding output</div>
              <div>29 languages supported</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickstart = () => (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Quickstart Guide</h1>
      <p className="text-xl text-gray-600 mb-8">Get started with Kalina AI in under 5 minutes</p>
      
      <div className="space-y-8">
        <div className="p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <h3 className="text-xl font-semibold">Create your first agent</h3>
          </div>
          <p className="text-gray-600 mb-4">Start by creating your first AI voice agent with a specific personality and purpose.</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">Navigate to Agents → Create New Agent</code>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <h3 className="text-xl font-semibold">Configure your agent</h3>
          </div>
          <p className="text-gray-600 mb-4">Set up the system prompt, voice, and behavior parameters.</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">System Prompt → Voice Selection → First Message</code>
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <h3 className="text-xl font-semibold">Test and deploy</h3>
          </div>
          <p className="text-gray-600 mb-4">Test your agent with sample calls before launching to production.</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">Test Call → Monitor Performance → Launch Campaign</code>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModels = () => (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Models</h1>
      <p className="text-xl text-gray-600 mb-8">Explore our advanced AI voice models</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Kalina v3</h3>
          </div>
          <p className="text-gray-600 mb-4">Most advanced conversational AI model</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Natural conversations</li>
            <li>• Emotional intelligence</li>
            <li>• Multi-language support</li>
          </ul>
        </div>

        <div className="p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Headphones className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold">Voice Synthesis</h3>
          </div>
          <p className="text-gray-600 mb-4">High-quality voice generation</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Natural intonation</li>
            <li>• Multiple voices</li>
            <li>• Real-time processing</li>
          </ul>
        </div>

        <div className="p-6 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Conversation Engine</h3>
          </div>
          <p className="text-gray-600 mb-4">Intelligent dialogue management</p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Context awareness</li>
            <li>• Intent recognition</li>
            <li>• Dynamic responses</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'quickstart':
        return renderQuickstart();
      case 'models':
        return renderModels();
      case 'voice-agents':
        return (
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Voice Agents</h1>
            <p className="text-xl text-gray-600 mb-8">Create and manage AI voice agents</p>
            <div className="prose prose-lg">
              <p>Voice agents are AI-powered assistants that can handle phone calls, answer questions, and perform various automated tasks.</p>
            </div>
          </div>
        );
      case 'phone-calls':
        return (
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Phone Calls</h1>
            <p className="text-xl text-gray-600 mb-8">Automated phone call management</p>
            <div className="prose prose-lg">
              <p>Make individual calls or batch campaigns to hundreds of contacts simultaneously.</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Analytics</h1>
            <p className="text-xl text-gray-600 mb-8">Performance monitoring and insights</p>
            <div className="prose prose-lg">
              <p>Track conversation metrics, sentiment analysis, and optimize your AI agents' performance.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon</h1>
            <p className="text-xl text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">Documentation</h1>
          </div>
          
          <nav className="flex-1 px-4 pb-4">
            <div className="space-y-8">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors text-sm ${
                            activeSection === item.id
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;