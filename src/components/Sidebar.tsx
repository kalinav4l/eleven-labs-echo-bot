// Locație: src/components/Sidebar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, Bot, BarChart3, FileText, PhoneCall } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Sidebar = () => {
  const location = useLocation();

  const linkClasses = "text-gray-700 hover:bg-gray-100 hover:text-gray-900 group flex items-center px-2 py-3 text-base rounded-md transition-colors";

  return (
    // Containerul nu mai are nevoie de clase de lățime sau tranziție.
    // 'h-full' asigură că umple tot spațiul vertical al panoului său.
    <div className="flex flex-col h-full bg-white border-r">
      {/* Header-ul barei laterale */}
      <div className="flex items-center px-4 py-3 border-b h-16">
        <Link to="/account" className="flex items-center text-xl font-bold text-gray-900 overflow-hidden">
          <Avatar className="mr-2 w-8 h-8">
            <AvatarImage alt="@shadcn" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <span className="truncate">Kalina AI</span>
        </Link>
      </div>
      
      {/* Navigarea principală */}
      <div className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          <Link to="/account" className={linkClasses}>
            <User className="flex-shrink-0 h-5 w-5 mr-3" />
            <span className="truncate">home</span>
          </Link>
          
          <Link to="/account/kalina-agents" className={linkClasses}>
            <Bot className="flex-shrink-0 h-5 w-5 mr-3" />
            <span className="truncate">agents</span>
          </Link>

          <Link to="/account/conversation-analytics" className={linkClasses}>
            <BarChart3 className="flex-shrink-0 h-5 w-5 mr-3" />
            <span className="truncate">analytics</span>
          </Link>

          <Link to="/account/transcript" className={linkClasses}>
            <FileText className="flex-shrink-0 h-5 w-5 mr-3" />
            <span className="truncate">transcript</span>
          </Link>

          <Link to="/account/outbound" className={linkClasses}>
            <PhoneCall className="flex-shrink-0 h-5 w-5 mr-3" />
            <span className="truncate">outbound</span>
          </Link>

          <Link to="/account/settings" className={linkClasses}>
            <Settings className="flex-shrink-0 h-5 w-5 mr-3" />
            <span className="truncate">setări</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;