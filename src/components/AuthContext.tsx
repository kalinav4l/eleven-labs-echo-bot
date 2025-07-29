
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          // Show welcome animation
          setShowWelcome(true);
          // Defer data fetching to prevent deadlocks
          setTimeout(() => {
            console.log('User signed in successfully');
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setIsInitialLoad(false); // Mark initial load as complete
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn('Global signout warning:', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (data.user) {
        console.log('Sign in successful, redirecting...');
        // Force page reload for clean state
        setTimeout(() => {
          window.location.href = '/account';
        }, 100);
      }

      return { error: null };
    } catch (err: any) {
      console.error('Sign in exception:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('Starting signup process for:', email);
      
      // Clean up existing state first
      cleanupAuthState();

      const redirectUrl = `${window.location.origin}/account`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Sign up response:', data);

      // If user was created successfully but needs email confirmation
      if (data.user && !data.session) {
        console.log('User created, email confirmation required');
        return { error: null };
      }

      // If user was created and logged in immediately
      if (data.user && data.session) {
        console.log('User created and logged in immediately');
        return { error: null };
      }

      return { error: null };
    } catch (err: any) {
      console.error('Sign up exception:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload anyway
      window.location.href = '/auth';
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    showWelcome,
    setShowWelcome,
    signIn,
    signUp,
    signOut,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};
