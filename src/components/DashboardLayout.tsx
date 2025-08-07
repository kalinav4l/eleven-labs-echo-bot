import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModernSidebar } from './ModernSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BlockedUserOverlay } from './BlockedUserOverlay';
import { PaymentIssueNotification } from './PaymentIssueNotification';
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from 'lucide-react';
import { APP_VERSION } from '@/config/version';
const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [userBlocked, setUserBlocked] = useState(false);
  const [notificationType, setNotificationType] = useState<'payment_method' | 'low_balance' | 'no_balance' | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const isMobile = useIsMobile();
  const {
    user,
    signOut
  } = useAuth();
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return;
      try {
        // Check user profile for banned status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error checking user status:', profileError);
          return;
        }
        
        setUserBlocked(profile?.account_type === 'banned');

        // Check user balance and spending
        const { data: balance, error: balanceError } = await supabase
          .from('user_balance')
          .select('balance_usd')
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: stats, error: statsError } = await supabase
          .from('user_statistics')
          .select('total_spent_usd')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!balanceError && balance) {
          setUserBalance(balance.balance_usd || 0);
        }

        if (!statsError && stats) {
          setTotalSpent(stats.total_spent_usd || 0);
        }

        // Show notification ONLY when balance is at 0
        const currentBalance = balance?.balance_usd || 0;

        if (currentBalance <= 0) {
          setNotificationType('no_balance');
        } else {
          setNotificationType(null); // Don't show notification unless balance is 0
        }
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
        <PaymentIssueNotification 
          notificationType={notificationType}
          spentAmount={totalSpent}
          remainingBalance={userBalance}
          onDismiss={() => setNotificationType(null)} 
        />
        <BlockedUserOverlay isBlocked={userBlocked} />
        
        <ModernSidebar />
        
        <div className="flex-1 flex flex-col" style={{ paddingTop: userBlocked ? '80px' : '0' }}>
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
          <main className="flex-1 overflow-y-auto min-h-0">
            <div className={`max-w-7xl mx-auto ${isMobile ? 'px-2 py-2 min-h-[calc(100vh-4rem)]' : 'px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-6'}`}>
              {children}
            </div>
            
            {/* Version Footer */}
            <div className="text-center py-4 text-xs text-muted-foreground border-t">
              {APP_VERSION}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
};
export default DashboardLayout;