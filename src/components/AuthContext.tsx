
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
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [isRealLogin, setIsRealLogin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Show animation only for real login events, not session restoration
        if (event === 'SIGNED_IN' && isRealLogin) {
          setShowWelcome(true);
          setIsRealLogin(false); // Reset flag after showing animation
          setTimeout(() => {
            console.log('User signed in successfully');
          }, 0);
        }
      }
    );

    // Check for existing session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setIsInitialLoad(false);
      
      // If we already have a session, mark it so we don't show animation on SIGNED_IN events
      if (session?.user) {
        setHasExistingSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [isRealLogin]);

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Set flag to indicate this is a real login attempt
      setIsRealLogin(true);
      
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
        setIsRealLogin(false); // Reset flag on error
        return { error };
      }

      if (data.user) {
        console.log('Sign in successful');
        // Don't force reload - let React Router handle navigation
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
      
      // Reset states
      setShowWelcome(false);
      setHasExistingSession(false);
      setIsRealLogin(false);
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
      
      // Clear user and session state
      setUser(null);
      setSession(null);
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear state anyway and reset flags
      setUser(null);
      setSession(null);
      setShowWelcome(false);
      setHasExistingSession(false);
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
