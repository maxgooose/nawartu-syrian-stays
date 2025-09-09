import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'guest' | 'host' | 'admin';
  avatar_url?: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log(`Fetching profile for user ${userId}, attempt ${retryCount + 1}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist and it's the first retry, wait and try again
        // This handles the case where the trigger hasn't fired yet
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log('Profile not found, retrying in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retryCount + 1);
        }
        
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) {
      throw new Error('No authenticated user or profile');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      
      toast({
        title: profile.preferred_language === 'ar' ? 'تم التحديث' : 'Profile updated',
        description: profile.preferred_language === 'ar' ? 
          'تم تحديث ملفك الشخصي بنجاح' : 
          'Your profile has been updated successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: profile.preferred_language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: profile?.preferred_language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid auth state change conflicts
          setTimeout(async () => {
            let profileData = await fetchProfile(session.user.id);
            
            // If profile doesn't exist, create it manually as fallback
            if (!profileData) {
              console.log('Profile not found, creating manually...');
              try {
                const { data: newProfile, error } = await supabase
                  .from('profiles')
                  .insert({
                    user_id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                    phone: session.user.user_metadata?.phone || '',
                    preferred_language: session.user.user_metadata?.preferred_language || 'ar',
                    role: 'guest'
                  })
                  .select()
                  .single();
                
                if (error) {
                  console.error('Error creating profile:', error);
                } else {
                  console.log('Profile created manually:', newProfile);
                  profileData = newProfile;
                }
              } catch (createError) {
                console.error('Error in manual profile creation:', createError);
              }
            }
            
            setProfile(profileData);
            setLoading(false);
          }, 500);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};