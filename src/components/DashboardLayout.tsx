import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BlockedUserOverlay } from './BlockedUserOverlay';
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from 'lucide-react';
const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [userBlocked, setUserBlocked] = useState(false);
  const isMobile = useIsMobile();
  const {
    user,
    signOut
  } = useAuth();
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return;
      try {
        const {
          data: profile,
          error
        } = await supabase.from('profiles').select('account_type').eq('id', user.id).single();
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
    const subscription = supabase.channel('profile_changes').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${user?.id}`
    }, payload => {
      if (payload.new.account_type === 'banned') {
        setUserBlocked(true);
      } else {
        setUserBlocked(false);
      }
    }).subscribe();
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
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background mobile-safe-area">
        <BlockedUserOverlay isBlocked={userBlocked} />
        
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          {isMobile && (
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-16 flex items-center px-4">
              <div className="flex items-center justify-between w-full">
                <SidebarTrigger className="touch-target">
                  <Menu className="h-6 w-6" />
                </SidebarTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Kalina AI</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="touch-target">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </header>
          )}
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3 py-3' : 'px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-6'}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
};
export default DashboardLayout;