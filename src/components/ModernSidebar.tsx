import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, Settings, Bot, FileText, PhoneCall, BarChart3, Calendar, 
  Globe, Mail, Workflow, BookOpen, Phone, TestTube, PhoneForwarded, 
  CreditCard, Shield, Mic, Plus, ChevronRight, MessageSquare,
  Activity, TrendingUp, Zap, Database, Search, ChevronDown, Home
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from './AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserProfile } from '@/hooks/useUserProfile';

// Navigation Configuration
const navigationConfig = {
  main: [
    { title: "Home", url: "/account", icon: Home }
  ],
  aiAgents: [
    { title: "My Agents", url: "/account/kalina-agents", icon: Bot },
    { title: "Create Agent", url: "/account/agent-ai", icon: Plus },
    { title: "Test Agent", url: "/account/test-call", icon: TestTube },
    { title: "Voice Demo", url: "/account/voice-demo", icon: Mic },
  ],
  communications: [
    { title: "Outbound Calls", url: "/account/outbound", icon: PhoneCall },
    { title: "Calendar", url: "/account/calendar", icon: Calendar },
    { title: "Phone Numbers", url: "/account/phone-numbers", icon: Phone },
    { title: "Callbacks", url: "/account/callback-scheduler", icon: PhoneForwarded },
  ],
  analytics: [
    { title: "Analytics", url: "/account/conversation-analytics", icon: TrendingUp },
  ],
  dataTools: [
    { title: "Transcripts", url: "/account/transcript", icon: FileText },
    { title: "Web Scraping", url: "/account/scraping", icon: Globe },
    { title: "Gmail", url: "/account/gmail", icon: Mail },
    { title: "Webhooks", url: "/account/webhooks", icon: Database },
  ],
  workflow: [
    { title: "Construction", url: "/account/construction", icon: Workflow },
  ],
  footer: [
    { title: "Pricing", url: "/pricing", icon: CreditCard },
    { title: "Documentation", url: "/account/documentation", icon: BookOpen },
    { title: "Settings", url: "/account/settings", icon: Settings },
  ]
};

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  items, 
  defaultExpanded = false,
  showChevron = true 
}: {
  title: string;
  items: any[];
  defaultExpanded?: boolean;
  showChevron?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location.pathname === path;
  const hasActiveItem = items.some(item => isActive(item.url));
  
  // Force expand if has active item
  const expanded = hasActiveItem || isExpanded;
  
  // Collapsed state - show only icons
  if (collapsed && !isMobile) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive(item.url)} 
                  tooltip={item.title}
                  className="w-10 h-10 p-0 justify-center"
                >
                  <Link to={item.url}>
                    <item.icon className="w-4 h-4" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      {showChevron && (
        <SidebarGroupLabel 
          className={`flex items-center justify-between cursor-pointer group transition-all duration-200 ${
            hasActiveItem ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
          } ${isMobile ? 'px-6 py-3 text-sm' : 'px-3 py-2 text-xs'} uppercase tracking-wider`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{title}</span>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} 
          />
        </SidebarGroupLabel>
      )}
      
      {(!showChevron || expanded) && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive(item.url)} 
                  className={`group transition-all duration-200 ${
                    isMobile ? 'py-3 text-base min-h-12' : 'py-2 text-sm min-h-10'
                  } ${
                    isActive(item.url) 
                      ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                      : 'hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Link to={item.url} className="flex items-center w-full">
                    <item.icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-3 flex-shrink-0`} />
                    <span className="flex-1 truncate">{item.title}</span>
                    {isActive(item.url) && (
                      <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};

// User Profile Header Component
const UserProfileHeader = () => {
  const { user } = useAuth();
  const { profile, loading, displayName } = useUserProfile();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const isMobile = useIsMobile();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (collapsed && !isMobile) {
    return (
      <div className="flex justify-center p-2">
        <Avatar className="w-8 h-8 ring-2 ring-primary/20">
          <AvatarImage 
            alt={displayName || "User"} 
            src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" 
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
            {displayName ? getInitials(displayName) : 'KA'}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Profile Section */}
      <div className="flex items-center space-x-3">
        <Avatar className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} ring-2 ring-primary/20`}>
          <AvatarImage 
            alt={displayName || "User"} 
            src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" 
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {displayName ? getInitials(displayName) : 'KA'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {loading ? 'Loading...' : displayName || 'User'}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            AI Assistant Manager
          </p>
        </div>
        
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/30 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-foreground">5</div>
          <div className="text-xs text-muted-foreground">Agents</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-foreground">1.2k</div>
          <div className="text-xs text-muted-foreground">Minutes</div>
        </div>
      </div>

      {/* Create Agent CTA */}
      <Button 
        asChild 
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
      >
        <Link to="/account/agent-ai" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Create Agent</span>
        </Link>
      </Button>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const isMobile = useIsMobile();
  
  if (collapsed && !isMobile) return null;

  const activities = [
    { id: 1, type: 'call', title: 'Call completed', time: '2 min ago', color: 'bg-green-500' },
    { id: 2, type: 'agent', title: 'Agent created', time: '5 min ago', color: 'bg-blue-500' },
    { id: 3, type: 'transcript', title: 'Transcript saved', time: '10 min ago', color: 'bg-purple-500' },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={`text-xs uppercase tracking-wider text-muted-foreground ${isMobile ? 'px-6 py-2' : 'px-3 py-2'}`}>
        Recent Activity
      </SidebarGroupLabel>
      <SidebarGroupContent className="px-3 pb-4">
        <div className="space-y-2">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center space-x-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div className={`w-2 h-2 ${activity.color} rounded-full flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

// Main Sidebar Component
export function ModernSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  // Check if user is admin
  const isSpecificAdmin = user?.id === 'a698e3c2-f0e6-4f42-8955-971d91e725ce' && 
                         user?.email === 'mariusvirlan109@gmail.com';

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar 
      className={`
        ${isMobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} 
        transition-all duration-300 ease-in-out
        liquid-glass border-r backdrop-blur-xl
      `}
    >
      {/* Header with User Profile */}
      <SidebarHeader className={`${isMobile ? 'p-6' : collapsed ? 'p-2' : 'p-4'} border-b border-border/50`}>
        <UserProfileHeader />
      </SidebarHeader>

      <SidebarContent className="p-0 space-y-1">
        {/* Main Navigation */}
        <CollapsibleSection 
          title="Home" 
          items={navigationConfig.main}
          showChevron={false}
        />

        {/* AI Agents */}
        <CollapsibleSection 
          title="AI Agents" 
          items={navigationConfig.aiAgents}
          defaultExpanded={location.pathname.includes('/kalina-agents') || location.pathname.includes('/agent-ai')}
        />

        {/* Communications */}
        <CollapsibleSection 
          title="Communications" 
          items={navigationConfig.communications}
          defaultExpanded={location.pathname.includes('/outbound') || location.pathname.includes('/calendar') || location.pathname.includes('/phone-numbers')}
        />

        {/* Analytics */}
        <CollapsibleSection 
          title="Analytics" 
          items={navigationConfig.analytics}
          defaultExpanded={location.pathname.includes('/analytics')}
        />

        {/* Data & Tools */}
        <CollapsibleSection 
          title="Data & Tools" 
          items={navigationConfig.dataTools}
          defaultExpanded={false}
        />

        {/* Workflow */}
        <CollapsibleSection 
          title="Workflow" 
          items={navigationConfig.workflow}
          showChevron={false}
        />

        {/* Recent Activity */}
        <RecentActivity />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className={`${isMobile ? 'p-4' : collapsed ? 'p-2' : 'p-3'} border-t border-border/50`}>
        <SidebarMenu>
          {/* Admin Panel - Only for specific user */}
          {isSpecificAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/admin')} 
                className={`bg-destructive/10 text-destructive hover:bg-destructive/20 mb-2 ${isMobile ? 'py-3 text-base min-h-12' : 'py-2 text-sm min-h-10'}`}
              >
                <Link to="/admin" className="flex items-center">
                  <Shield className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} ${collapsed && !isMobile ? '' : 'mr-3'}`} />
                  {(!collapsed || isMobile) && <span className="font-medium">Admin Panel</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {navigationConfig.footer.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive(item.url)} 
                className={`${isMobile ? 'py-3 text-base min-h-12' : 'py-2 text-sm min-h-10'} ${collapsed && !isMobile ? 'w-10 h-10 p-0 justify-center' : ''}`}
                tooltip={collapsed && !isMobile ? item.title : undefined}
              >
                <Link to={item.url} className="flex items-center">
                  <item.icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} ${collapsed && !isMobile ? '' : 'mr-3'}`} />
                  {(!collapsed || isMobile) && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}