
import React, { useState } from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WidgetGrid from './WidgetGrid';
import VoiceSidebar from './VoiceSidebar';

interface VoiceDashboardProps {
  data: any;
  onRefresh: () => void;
}

const VoiceDashboard = ({ data, onRefresh }: VoiceDashboardProps) => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <VoiceSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-70'}`}>
        {/* Top Navigation */}
        <nav className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Voice Command Center</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search conversations, agents, or metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar className="w-9 h-9">
              <AvatarImage src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </nav>

        {/* Widget Grid */}
        <div className="p-8">
          <WidgetGrid data={data} searchQuery={searchQuery} onRefresh={onRefresh} />
        </div>
      </div>
    </div>
  );
};

export default VoiceDashboard;
