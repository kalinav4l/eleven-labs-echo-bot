
import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VoiceSidebar from './VoiceSidebar';
import WidgetGrid from './WidgetGrid';

const VoiceDashboard = () => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <VoiceSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white border-b border-gray-100 flex items-center px-6">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Kalina AI</h1>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations, agents, or metrics..."
                className="w-full h-10 pl-10 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-700 cursor-pointer hover:text-blue-500 transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <Settings className="w-5 h-5 text-gray-700 cursor-pointer hover:text-blue-500 transition-colors" />
            <Avatar className="w-9 h-9">
              <AvatarImage src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
              <AvatarFallback>KA</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <WidgetGrid />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDashboard;
