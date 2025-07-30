import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, Settings, Bot, FileText, PhoneCall, BarChart3, Calendar, 
  Globe, Mail, Workflow, BookOpen, Phone, TestTube, PhoneForwarded, 
  CreditCard, Shield, Mic, Plus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/sidebar";
import { useAuth } from './AuthContext';

const aiAnalyticsItems = [
  { title: "Agents", url: "/account/kalina-agents", icon: Bot },
  { title: "Analytics", url: "/account/conversation-analytics", icon: BarChart3 },
  { title: "Agent AI", url: "/account/agent-ai", icon: Bot },
  { title: "Voice Demo", url: "/account/voice-demo", icon: Mic },
];

const communicationsItems = [
  { title: "Calls", url: "/account/outbound", icon: PhoneCall },
  { title: "Calendar", url: "/account/calendar", icon: Calendar },
  { title: "Phone Numbers", url: "/account/phone-numbers", icon: Phone },
  { title: "Test Call", url: "/account/test-call", icon: TestTube },
  { title: "Callbacks", url: "/account/callback-scheduler", icon: PhoneForwarded },
];

const dataToolsItems = [
  { title: "Transcripts", url: "/account/transcript", icon: FileText },
  { title: "Scraping", url: "/account/scraping", icon: Globe },
  { title: "Gmail", url: "/account/gmail", icon: Mail },
];

const workflowItems = [
  { title: "Construction", url: "/account/construction", icon: Workflow },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if user is the specific admin user
  const isSpecificAdmin = user?.id === 'a698e3c2-f0e6-4f42-8955-971d91e725ce' && 
                         user?.email === 'mariusvirlan109@gmail.com';

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/account" className="flex items-center gap-3 text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors">
          <Avatar className="w-8 h-8">
            <AvatarImage alt="Kalina AI" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
            <AvatarFallback className="bg-muted text-muted-foreground">KA</AvatarFallback>
          </Avatar>
          <span>Kalina AI</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-0 space-y-0">
        {/* Home */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/account')}>
                  <Link to="/account">
                    <User className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI & Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            AI & Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiAnalyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Communications */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Communications
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Data & Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Data & Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataToolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workflow */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Workflow
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {/* Admin Panel - Only for specific user */}
          {isSpecificAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin')} className="bg-destructive/10 text-destructive hover:bg-destructive/20">
                <Link to="/admin">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/pricing')}>
              <Link to="/pricing">
                <CreditCard className="w-4 h-4" />
                <span>Pricing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/account/documentation')}>
              <Link to="/account/documentation">
                <BookOpen className="w-4 h-4" />
                <span>Documentation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/account/settings')}>
              <Link to="/account/settings">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}