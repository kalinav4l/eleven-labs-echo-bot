
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BlockedUserOverlay } from './BlockedUserOverlay';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [userBlocked, setUserBlocked] = useState(false);
  const { user } = useAuth();

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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <BlockedUserOverlay isBlocked={userBlocked} />
        
        <AppSidebar />
        
        <SidebarInset className="flex flex-col">
          {/* Header with trigger for mobile */}
          <header className="flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900 lg:hidden">Kalina AI</h1>
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
