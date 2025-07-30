import React from 'react';
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

const navigationItems = [
  {
    title: "Dashboard",
    items: [
      { title: "Home", url: "/account", icon: User },
    ]
  },
  {
    title: "AI & Analytics",
    items: [
      { title: "Agents", url: "/account/kalina-agents", icon: Bot },
      { title: "Analytics", url: "/account/conversation-analytics", icon: BarChart3 },
      { title: "Agent AI", url: "/account/agent-ai", icon: Bot },
      { title: "Voice Demo", url: "/account/voice-demo", icon: Mic },
    ]
  },
  {
    title: "Communications",
    items: [
      { title: "Calls", url: "/account/outbound", icon: PhoneCall },
      { title: "Calendar", url: "/account/calendar", icon: Calendar },
      { title: "Phone Numbers", url: "/account/phone-numbers", icon: Phone },
      { title: "Test Call", url: "/account/test-call", icon: Phone },
      { title: "Callbacks", url: "/account/callbacks", icon: PhoneForwarded },
    ]
  },
  {
    title: "Data & Tools",
    items: [
      { title: "Transcripts", url: "/account/transcript", icon: FileText },
      { title: "Scraping", url: "/account/scraping", icon: Globe },
      { title: "Gmail", url: "/account/gmail", icon: Mail },
    ]
  },
  {
    title: "Workflow & Automation",
    items: [
      { title: "Construction", url: "/account/construction", icon: Workflow },
    ]
  },
];

const bottomItems = [
  { title: "Pricing", url: "/pricing", icon: CreditCard },
  { title: "Documentation", url: "/account/documentation", icon: BookOpen },
  { title: "Settings", url: "/account/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;

  // Check if user is the specific admin user - acest check va fi înlocuit cu role-based check mai târziu
  const isSpecificAdmin = user?.id === 'a698e3c2-f0e6-4f42-8955-971d91e725ce' && 
                         user?.email === 'mariusvirlan109@gmail.com';

  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

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
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
              {bottomItems.map((item) => (
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
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}