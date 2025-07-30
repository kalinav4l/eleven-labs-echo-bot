
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BlockedUserOverlay } from './BlockedUserOverlay';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [userBlocked, setUserBlocked] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking user status:', error);
          return;
        }

        setUserBlocked(profile?.account_type === 'banned');
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    checkUserStatus();
    
    // Set up real-time subscription to listen for changes
    const subscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user?.id}`
      }, (payload) => {
        if (payload.new.account_type === 'banned') {
          setUserBlocked(true);
        } else {
          setUserBlocked(false);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <BlockedUserOverlay isBlocked={userBlocked} />
        
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger className="-ml-1" />
              
              <div className="flex-1" />
              
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
