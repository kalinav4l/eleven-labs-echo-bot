import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Bot, 
  FileText, 
  PhoneCall, 
  BarChart3, 
  Calendar, 
  Globe, 
  Mail, 
  Workflow, 
  BookOpen, 
  Phone, 
  PhoneForwarded, 
  CreditCard, 
  Shield, 
  Mic 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SidebarSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  icon: string;
  url: string;
  group: string;
}

const iconMap = {
  User, Settings, Bot, FileText, PhoneCall, BarChart3, Calendar, 
  Globe, Mail, Workflow, BookOpen, Phone, PhoneForwarded, CreditCard, Shield, Mic
};

const defaultNavigationItems: SidebarSection[] = [
  { id: 'dashboard', title: 'Home', enabled: true, order: 0, icon: 'User', url: '/account', group: 'Dashboard' },
  { id: 'agents', title: 'Agents', enabled: true, order: 1, icon: 'Bot', url: '/account/kalina-agents', group: 'AI & Analytics' },
  { id: 'analytics', title: 'Analytics', enabled: true, order: 2, icon: 'BarChart3', url: '/account/conversation-analytics', group: 'AI & Analytics' },
  { id: 'agent-ai', title: 'Agent AI', enabled: true, order: 3, icon: 'Bot', url: '/account/agent-ai', group: 'AI & Analytics' },
  { id: 'voice-demo', title: 'Voice Demo', enabled: true, order: 4, icon: 'Mic', url: '/account/voice-demo', group: 'AI & Analytics' },
  { id: 'calls', title: 'Calls', enabled: true, order: 5, icon: 'PhoneCall', url: '/account/outbound', group: 'Communications' },
  { id: 'calendar', title: 'Calendar', enabled: true, order: 6, icon: 'Calendar', url: '/account/calendar', group: 'Communications' },
  { id: 'phone-numbers', title: 'Phone Numbers', enabled: true, order: 7, icon: 'Phone', url: '/account/phone-numbers', group: 'Communications' },
  { id: 'test-call', title: 'Test Call', enabled: true, order: 8, icon: 'Phone', url: '/account/test-call', group: 'Communications' },
  { id: 'callbacks', title: 'Callbacks', enabled: true, order: 9, icon: 'PhoneForwarded', url: '/account/callbacks', group: 'Communications' },
  { id: 'transcripts', title: 'Transcripts', enabled: true, order: 10, icon: 'FileText', url: '/account/transcript', group: 'Data & Tools' },
  { id: 'scraping', title: 'Scraping', enabled: true, order: 11, icon: 'Globe', url: '/account/scraping', group: 'Data & Tools' },
  { id: 'gmail', title: 'Gmail', enabled: true, order: 12, icon: 'Mail', url: '/account/gmail', group: 'Data & Tools' },
  { id: 'construction', title: 'Construction', enabled: true, order: 13, icon: 'Workflow', url: '/account/construction', group: 'Workflow & Automation' },
];
const bottomItems = [
  { title: "Pricing", url: "/pricing", icon: "CreditCard" },
  { title: "Documentation", url: "/account/documentation", icon: "BookOpen" },
  { title: "Settings", url: "/account/settings", icon: "Settings" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  
  const [navigationItems, setNavigationItems] = useState<SidebarSection[]>(defaultNavigationItems);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is the specific admin user - acest check va fi înlocuit cu role-based check mai târziu
  const isSpecificAdmin = user?.id === 'a698e3c2-f0e6-4f42-8955-971d91e725ce' && 
                         user?.email === 'mariusvirlan109@gmail.com';

  const collapsed = state === "collapsed";

  useEffect(() => {
    loadSidebarPreferences();

    // Listen for preference updates
    const handlePreferencesUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setNavigationItems(event.detail.filter((item: SidebarSection) => item.enabled).sort((a: SidebarSection, b: SidebarSection) => a.order - b.order));
      }
    };

    window.addEventListener('sidebarPreferencesUpdated', handlePreferencesUpdate as EventListener);
    
    return () => {
      window.removeEventListener('sidebarPreferencesUpdated', handlePreferencesUpdate as EventListener);
    };
  }, [user]);

  const loadSidebarPreferences = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_dashboard_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.preferences && typeof data.preferences === 'object' && 'sidebar_sections' in data.preferences) {
        const savedSections = (data.preferences.sidebar_sections as unknown) as SidebarSection[];
        // Filter enabled sections and sort by order
        const enabledSections = savedSections.filter(section => section.enabled).sort((a, b) => a.order - b.order);
        setNavigationItems(enabledSections);
      } else {
        setNavigationItems(defaultNavigationItems);
      }
    } catch (error) {
      console.error('Error loading sidebar preferences:', error);
      setNavigationItems(defaultNavigationItems);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path: string) => currentPath === path;

  // Group navigation items by their group
  const groupedItems = navigationItems.reduce((groups, item) => {
    const group = item.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, SidebarSection[]>);

  if (isLoading) {
    return (
      <Sidebar className="border-r border-gray-200" collapsible="icon">
        <SidebarHeader className="border-b border-gray-200">
          <div className="flex items-center gap-2 px-2 py-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-gray-100 text-gray-600">KA</AvatarFallback>
            </Avatar>
            {!collapsed && <span className="text-lg font-semibold">Se încarcă...</span>}
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-gray-200" collapsible="icon">
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage alt="Kalina AI" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
            <AvatarFallback className="bg-gray-100 text-gray-600">KA</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <Link to="/account" className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              Kalina AI
            </Link>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {groupName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || User;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive(item.url)}
                        className={`${
                          isActive(item.url)
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } transition-colors duration-200`}
                      >
                        <Link to={item.url}>
                          <IconComponent className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Admin Panel - Only for specific user */}
        {isSpecificAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive('/admin')}
                    className={`${
                      isActive('/admin')
                        ? 'bg-red-100 text-red-900 border border-red-200 font-semibold'
                        : 'text-red-600 hover:bg-red-50 hover:text-red-900 border border-red-200'
                    } shadow-sm transition-colors duration-200`}
                  >
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Bottom Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Settings;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      className={`${
                        isActive(item.url)
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } transition-colors duration-200`}
                    >
                      <Link to={item.url}>
                        <IconComponent className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}