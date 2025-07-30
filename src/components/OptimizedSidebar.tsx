import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, Settings, Bot, FileText, PhoneCall, X, BarChart3, Calendar, Globe, Mail, 
  Workflow, BookOpen, Phone, TestTube, PhoneForwarded, CreditCard, Shield, Mic,
  ChevronDown, ChevronRight, Minimize2, Maximize2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarSection {
  id: string;
  title: string;
  items: Array<{
    to: string;
    icon: React.ComponentType<any>;
    label: string;
  }>;
  collapsed: boolean;
  priority: number; // 1 = highest priority (always visible)
}

const OptimizedSidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isCompact, setIsCompact] = useState(false);
  const [sections, setSections] = useState<SidebarSection[]>([]);

  // Check if user is admin
  const isSpecificAdmin = user?.id === 'a698e3c2-f0e6-4f42-8955-971d91e725ce' && 
                         user?.email === 'mariusvirlan109@gmail.com';

  const defaultSections: SidebarSection[] = [
    {
      id: 'ai-analytics',
      title: 'AI & Analytics',
      priority: 1,
      collapsed: false,
      items: [
        { to: '/account/kalina-agents', icon: Bot, label: 'Agents' },
        { to: '/account/conversation-analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/account/agent-ai', icon: Bot, label: 'Agent AI' },
        { to: '/account/voice-demo', icon: Mic, label: 'Voice Demo' }
      ]
    },
    {
      id: 'communications',
      title: 'Communications',
      priority: 2,
      collapsed: false,
      items: [
        { to: '/account/outbound', icon: PhoneCall, label: 'Calls' },
        { to: '/account/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/account/phone-numbers', icon: Phone, label: 'Phone Numbers' },
        { to: '/account/test-call', icon: Phone, label: 'Test Call' },
        { to: '/account/callbacks', icon: PhoneForwarded, label: 'Callbacks' }
      ]
    },
    {
      id: 'data-tools',
      title: 'Data & Tools',
      priority: 3,
      collapsed: true,
      items: [
        { to: '/account/transcript', icon: FileText, label: 'Transcripts' },
        { to: '/account/scraping', icon: Globe, label: 'Scraping' },
        { to: '/account/gmail', icon: Mail, label: 'Gmail' }
      ]
    },
    {
      id: 'workflow',
      title: 'Workflow',
      priority: 4,
      collapsed: true,
      items: [
        { to: '/account/construction', icon: Workflow, label: 'Construction' }
      ]
    }
  ];

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setSections(defaultSections);
        return;
      }

      try {
        const response = await supabase
          .from('user_dashboard_preferences')
          .select('sidebar_sections, sidebar_compact')
          .eq('user_id', user.id)
          .maybeSingle();

        if (response.error) {
          console.error('Error loading sidebar preferences:', response.error);
          setSections(defaultSections);
          return;
        }

        const data = response.data as any;
        if (data && data.sidebar_sections) {
          setSections(data.sidebar_sections as SidebarSection[]);
        } else {
          setSections(defaultSections);
        }

        if (data && data.sidebar_compact !== null && data.sidebar_compact !== undefined) {
          setIsCompact(data.sidebar_compact);
        }
      } catch (error) {
        console.error('Error loading sidebar preferences:', error);
        setSections(defaultSections);
      }
    };

    loadPreferences();
  }, [user]);

  // Save preferences
  const savePreferences = async (newSections: SidebarSection[], compact: boolean) => {
    if (!user) return;

    try {
      await supabase
        .from('user_dashboard_preferences')
        .upsert({
          user_id: user.id,
          sidebar_sections: newSections,
          sidebar_compact: compact
        });
    } catch (error) {
      console.error('Error saving sidebar preferences:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, collapsed: !section.collapsed }
        : section
    );
    setSections(newSections);
    savePreferences(newSections, isCompact);
  };

  const toggleCompact = () => {
    const newCompact = !isCompact;
    setIsCompact(newCompact);
    savePreferences(sections, newCompact);
  };

  // Calculate available space and auto-collapse low priority sections if needed
  const getVisibleSections = () => {
    if (isMobile) return sections;
    
    // Auto-collapse strategy based on screen height
    const screenHeight = window.innerHeight;
    const baseHeight = 200; // Header + footer space
    const itemHeight = isCompact ? 32 : 42;
    const sectionHeaderHeight = isCompact ? 24 : 32;
    
    let usedHeight = baseHeight;
    const visibleSections = [...sections];
    
    // Calculate used height and auto-collapse if needed
    for (let i = 0; i < visibleSections.length; i++) {
      const section = visibleSections[i];
      usedHeight += sectionHeaderHeight;
      
      if (!section.collapsed) {
        usedHeight += section.items.length * itemHeight;
      }
      
      // If we're running out of space, collapse lower priority sections
      if (usedHeight > screenHeight - 100 && section.priority > 2) {
        visibleSections[i] = { ...section, collapsed: true };
        usedHeight -= section.items.length * itemHeight;
      }
    }
    
    return visibleSections;
  };

  const visibleSections = getVisibleSections();

  const linkClasses = (path: string) => 
    `${location.pathname === path 
      ? 'bg-muted text-foreground' 
      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    } group flex items-center px-3 ${isCompact ? 'py-1.5' : 'py-2'} text-sm font-medium rounded-lg transition-colors`;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 lg:hidden" 
          onClick={onClose} 
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-40 ${isCompact ? 'w-56' : 'w-64'} bg-background border-r transition-all duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto flex flex-col`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-4 ${isCompact ? 'py-3' : 'py-4'} border-b`}>
          <Link 
            to="/account" 
            className="flex items-center text-lg font-semibold text-foreground hover:text-muted-foreground transition-colors" 
            onClick={isMobile ? onClose : undefined}
          >
            <Avatar className={`mr-2 ${isCompact ? 'w-6 h-6' : 'w-8 h-8'}`}>
              <AvatarImage alt="Kalina AI" src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" />
              <AvatarFallback className="bg-muted text-muted-foreground">KA</AvatarFallback>
            </Avatar>
            {!isCompact && <span>Kalina AI</span>}
          </Link>
          
          <div className="flex items-center gap-1">
            <button
              onClick={toggleCompact}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title={isCompact ? "Expand sidebar" : "Compact sidebar"}
            >
              {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button 
              onClick={onClose} 
              className="text-muted-foreground hover:text-foreground focus:outline-none rounded-lg p-1 transition-colors lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <nav className={`flex-1 overflow-y-auto px-3 ${isCompact ? 'py-2' : 'py-4'}`}>
          {/* Home Link */}
          <div className={`${isCompact ? 'mb-3' : 'mb-4'}`}>
            <Link 
              to="/account" 
              className={linkClasses('/account')}
              onClick={isMobile ? onClose : undefined}
            >
              <User className={`${isCompact ? 'mr-2 h-3.5 w-3.5' : 'mr-3 h-4 w-4'}`} />
              <span>Home</span>
            </Link>
          </div>

          {/* Dynamic Sections */}
          {visibleSections.map((section) => (
            <div key={section.id} className={`${isCompact ? 'mb-3' : 'mb-4'}`}>
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-2 ${isCompact ? 'py-1' : 'py-1.5'} text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors`}
              >
                <span>{isCompact ? section.title.split(' ')[0] : section.title}</span>
                {section.collapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              
              {!section.collapsed && (
                <div className={`space-y-0.5 ${isCompact ? 'mt-1' : 'mt-2'}`}>
                  {section.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={linkClasses(item.to)}
                      onClick={isMobile ? onClose : undefined}
                    >
                      <item.icon className={`${isCompact ? 'mr-2 h-3.5 w-3.5' : 'mr-3 h-4 w-4'}`} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t px-3 ${isCompact ? 'py-2' : 'py-3'} space-y-0.5`}>
          {isSpecificAdmin && (
            <Link 
              to="/admin" 
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={isMobile ? onClose : undefined}
            >
              <Shield className={`${isCompact ? 'mr-2 h-3.5 w-3.5' : 'mr-3 h-4 w-4'}`} />
              <span className="font-semibold">{isCompact ? 'Admin' : 'Admin Panel'}</span>
            </Link>
          )}
          
          <Link 
            to="/pricing" 
            className={linkClasses('/pricing')}
            onClick={isMobile ? onClose : undefined}
          >
            <CreditCard className={`${isCompact ? 'mr-2 h-3.5 w-3.5' : 'mr-3 h-4 w-4'}`} />
            <span>Pricing</span>
          </Link>
          
          <Link 
            to="/account/documentation" 
            className={linkClasses('/account/documentation')}
            onClick={isMobile ? onClose : undefined}
          >
            <BookOpen className={`${isCompact ? 'mr-2 h-3.5 w-3.5' : 'mr-3 h-4 w-4'}`} />
            <span>{isCompact ? 'Docs' : 'Documentation'}</span>
          </Link>
          
          <Link 
            to="/account/settings" 
            className={linkClasses('/account/settings')}
            onClick={isMobile ? onClose : undefined}
          >
            <Settings className={`${isCompact ? 'mr-2 h-3.5 w-3.5' : 'mr-3 h-4 w-4'}`} />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default OptimizedSidebar;