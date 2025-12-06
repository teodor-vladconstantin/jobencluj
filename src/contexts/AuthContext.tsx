import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'candidate' | 'employer';
  phone: string | null;
  linkedin_url: string | null;
  cv_url: string | null;
  company_name: string | null;
  company_website: string | null;
  company_logo: string | null;
  company_description: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'candidate' | 'employer', companyName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return;
      }
      
      if (data) {
        console.log('✅ Profile loaded:', { role: data.role, email: data.email });
        setProfile(data);
      } else {
        console.warn('⚠️ No profile found for user - attempting to create one');
        // Try to get user metadata to create profile
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const role = currentUser.user_metadata?.role || 'candidate';
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: currentUser.email!,
              full_name: currentUser.user_metadata?.full_name || null,
              role: role,
              company_name: currentUser.user_metadata?.company_name || null,
            });
          
          if (insertError) {
            console.error('❌ Failed to create profile:', insertError);
          } else {
            console.log('✅ Profile created successfully, fetching...');
            // Fetch the newly created profile
            await fetchProfile(userId);
          }
        }
      }
    } catch (error) {
      console.error('❌ Profile fetch exception:', error);
      // Silent fail - profile will remain null
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔄 Auth state changed:', event, currentSession?.user?.email || 'No user');
        if (!mounted) return;
        try {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          } else {
            setProfile(null);
          }
        } finally {
          // Always clear loading even if fetchProfile fails
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession()
      .then(async ({ data: { session: currentSession } }) => {
        if (!mounted) return;
        try {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          } else {
            setProfile(null);
          }
        } finally {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('❌ getSession failed:', error);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'candidate' | 'employer',
    companyName?: string
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
            company_name: companyName || null,
          },
        },
      });

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
