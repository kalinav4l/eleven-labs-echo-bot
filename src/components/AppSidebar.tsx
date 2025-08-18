import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Settings, Brain, FileText, Phone, TrendingUp, CalendarDays, 
  MessageSquare, BookOpen, Smartphone, Zap, 
  CreditCard, Shield, Database, Search
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
import { useIsMobile } from '@/hooks/use-mobile';

const aiAnalyticsItems = [
  { title: "AI Agents", url: "/account/kalina-agents", icon: Brain },
  { title: "Rapoarte", url: "/account/conversation-analytics", icon: TrendingUp },
  { title: "Chat AI", url: "/account/agent-ai", icon: MessageSquare },
];

const communicationsItems = [
  { title: "Apeluri", url: "/account/outbound", icon: Phone },
  { title: "Programări", url: "/account/calendar", icon: CalendarDays },
  { title: "Numere", url: "/account/phone-numbers", icon: Smartphone },
  { title: "Test Apel", url: "/account/test-call", icon: Zap },
];

const dataToolsItems = [
  { title: "Transcrieri", url: "/account/transcript", icon: FileText },
  { title: "Extragere Date", url: "/account/scraping", icon: Search },
];

const workflowItems = [
  { title: "Prompt-uri AI", url: "/account/agent-prompts", icon: Brain },
  { title: "Baza de Date", url: "/account/workflow-database", icon: Database },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Check if user is the specific admin user
  const isSpecificAdmin = user?.id === 'a698e3c2-f0e6-4f42-8955-971d91e725ce' && 
                         user?.email === 'mariusvirlan109@gmail.com';

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={`${isMobile ? 'w-72' : ''}`}>

      <SidebarHeader className={`${isMobile ? 'p-6' : 'p-4'}`}>

        <Link to="/account" className={`flex items-center gap-3 text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors ${isMobile ? 'touch-target' : ''}`}>
          <Avatar className={`${isMobile ? 'w-10 h-10' : 'w-8 h-8'}`}>
            <AvatarImage alt="Kalina AI" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
            <AvatarFallback className="bg-muted text-muted-foreground">KA</AvatarFallback>
          </Avatar>
          <span className={isMobile ? 'text-xl' : ''}>Kalina AI</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-0 space-y-0 pb-56 md:pb-40 overflow-y-auto">
        {/* Home */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/account')}>
                  <Link to="/account">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI & Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs uppercase tracking-wider text-muted-foreground ${isMobile ? 'px-6 py-2' : ''}`}>
            AI & Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiAnalyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className={isMobile ? 'touch-target text-base py-3' : ''}>
                    <Link to={item.url}>
                      <item.icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
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
          <SidebarGroupLabel className={`text-xs uppercase tracking-wider text-muted-foreground ${isMobile ? 'px-6 py-2' : ''}`}>
            Communications
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className={isMobile ? 'touch-target text-base py-3' : ''}>
                    <Link to={item.url}>
                      <item.icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
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
          <SidebarGroupLabel className={`text-xs uppercase tracking-wider text-muted-foreground ${isMobile ? 'px-6 py-2' : ''}`}>
            Data & Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataToolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className={isMobile ? 'touch-target text-base py-3' : ''}>
                    <Link to={item.url}>
                      <item.icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
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
          <SidebarGroupLabel className={`text-xs uppercase tracking-wider text-muted-foreground ${isMobile ? 'px-6 py-2' : ''}`}>
            Workflow
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className={isMobile ? 'touch-target text-base py-3' : ''}>
                    <Link 
                      to={item.url}
                      onClick={() => console.log(`🔗 Navigating to: ${item.url} (${item.title})`)}
                    >
                      <item.icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`sticky bottom-0 z-10 border-t border-border bg-background ${isMobile ? 'p-4' : 'p-2'}`}>
        <SidebarMenu>
          {/* Admin Panel - Only for specific user */}
          {isSpecificAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin')} className={`${isMobile ? 'touch-target text-base py-3' : ''}`}>
                <Link to="/admin">
                  <Shield className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/pricing')} className={isMobile ? 'touch-target text-base py-3' : ''}>
              <Link to="/pricing">
                <CreditCard className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                <span>Pricing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/account/documentation')} className={isMobile ? 'touch-target text-base py-3' : ''}>
              <Link to="/account/documentation">
                <BookOpen className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                <span>Documentation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/account/settings')} className={isMobile ? 'touch-target text-base py-3' : ''}>
              <Link to="/account/settings">
                <Settings className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}