import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Shield, Users, Phone, FileText, BarChart3, Settings, CreditCard, 
  Bot, Database, Globe, Activity, AlertTriangle, Download, Upload,
  Monitor, Zap, Lock, Bell, TrendingUp, MessageSquare, UserCog,
  Calendar, FileTextIcon, BarChart, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { 
    name: 'Utilizatori', 
    icon: Users,
    subItems: [
      { name: 'Gestionare Utilizatori', href: '/admin/users' },
      { name: 'Roluri și Permisiuni', href: '/admin/roles' },
      { name: 'Activitate Utilizatori', href: '/admin/user-activity' },
      { name: 'Statistici Utilizatori', href: '/admin/user-stats' }
    ]
  },
  { 
    name: 'Apeluri & Conversații', 
    icon: Phone,
    subItems: [
      { name: 'Istoric Apeluri', href: '/admin/calls' },
      { name: 'Conversații Live', href: '/admin/live-calls' },
      { name: 'Calitate Apeluri', href: '/admin/call-quality' },
      { name: 'Analiza Conversații', href: '/admin/conversation-analytics' }
    ]
  },
  { 
    name: 'Agenți AI', 
    icon: Bot,
    subItems: [
      { name: 'Gestionare Agenți', href: '/admin/agents' },
      { name: 'Performanța Agenților', href: '/admin/agent-performance' },
      { name: 'Configurare Voce', href: '/admin/voice-config' },
      { name: 'Knowledge Base', href: '/admin/knowledge-base' }
    ]
  },
  { 
    name: 'Financiar', 
    icon: CreditCard,
    subItems: [
      { name: 'Tranzacții', href: '/admin/transactions' },
      { name: 'Facturare', href: '/admin/billing' },
      { name: 'Planuri și Prețuri', href: '/admin/pricing' },
      { name: 'Rapoarte Financiare', href: '/admin/financial-reports' }
    ]
  },
  { 
    name: 'Sistem', 
    icon: Database,
    subItems: [
      { name: 'Monitorizare Sistem', href: '/admin/system-monitor' },
      { name: 'Performanță API', href: '/admin/api-performance' },
      { name: 'Backup & Restore', href: '/admin/backup' },
      { name: 'Configurare Sistem', href: '/admin/system-config' }
    ]
  },
  { 
    name: 'Securitate', 
    icon: Lock,
    subItems: [
      { name: 'Monitor Securitate', href: '/admin/security' },
      { name: 'Autentificare', href: '/admin/auth-settings' },
      { name: 'Loguri de Securitate', href: '/admin/security-logs' },
      { name: 'Rate Limiting', href: '/admin/rate-limiting' }
    ]
  },
  { 
    name: 'Comunicații', 
    icon: MessageSquare,
    subItems: [
      { name: 'SMS Management', href: '/admin/sms' },
      { name: 'Email Marketing', href: '/admin/email' },
      { name: 'Notificări', href: '/admin/notifications' },
      { name: 'Webhook Manager', href: '/admin/webhooks' }
    ]
  },
  { 
    name: 'Analytics', 
    icon: TrendingUp,
    subItems: [
      { name: 'Dashboard Analytics', href: '/admin/analytics' },
      { name: 'Rapoarte Personalizate', href: '/admin/custom-reports' },
      { name: 'Export Date', href: '/admin/data-export' },
      { name: 'KPI Monitoring', href: '/admin/kpi-monitor' }
    ]
  },
  { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
  { name: 'Setări Generale', href: '/admin/settings', icon: Settings }
];

export function AdminSidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className="hidden md:flex md:w-72 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Shield className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold">Kalina Admin</span>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              if ('subItems' in item) {
                const isExpanded = expandedItems.includes(item.name);
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="w-full group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-8 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isActive = location.pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={cn(
                                'block px-2 py-1 text-xs rounded-md transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              }
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}