
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BlockedUserOverlay } from './BlockedUserOverlay';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userBlocked, setUserBlocked] = useState(false);
  const isMobile = useIsMobile();
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
    <div className="flex h-screen overflow-hidden bg-white">
      <BlockedUserOverlay isBlocked={userBlocked} />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with menu button */}
        {isMobile && (
          <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg p-2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="ml-3 text-lg font-semibold text-gray-900">Kalina AI</h1>
          </header>
        )}
        
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
