
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to check admin status
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log("Checking admin status for userId:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      console.log("Admin check result:", data);
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    console.log("AuthProvider initialized");
    
    // First check for existing session synchronously
    const setupAuth = async () => {
      try {
        // Check for existing session first
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData.session?.user?.id);
        
        if (sessionData.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          
          // Check admin status if we have a user
          if (sessionData.session.user) {
            await checkAdminStatus(sessionData.session.user.id);
          }
        }
      } catch (error) {
        console.error("Error during auth setup:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check admin status when auth state changes
        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(() => {
            checkAdminStatus(currentSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Initial setup
    setupAuth();

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("Login failed", { description: error.message });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("Signup failed", { description: error.message });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Sign out failed", { description: error.message });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error("Password reset failed", { description: error.message });
      throw error;
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
  };

  console.log("Auth context value:", { isAuthenticated: !!user, isAdmin, userId: user?.id });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
