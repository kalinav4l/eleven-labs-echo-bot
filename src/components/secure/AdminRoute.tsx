import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin_user', {
          _user_id: user.id
        });

        if (error) throw error;
        setIsAdmin(data || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        toast({
          title: "Eroare de verificare",
          description: "Nu am putut verifica permisiunile de administrator.",
          variant: "destructive"
        });
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, toast]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Se verifică permisiunile...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    toast({
      title: "Acces restricționat",
      description: "Nu aveți permisiuni de administrator.",
      variant: "destructive"
    });
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};