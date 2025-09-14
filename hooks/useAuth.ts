import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserType } from '@/types/database';
import { Database } from '../lib/database.types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session and fetch user type
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile to get user type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', session.user.id)
          .single() as { data: { user_type: UserType } | null; error: any };
        
        if (profile?.user_type) {
          setUserType(profile.user_type);
        }
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile to get user type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', session.user.id)
          .single() as { data: { user_type: UserType } | null; error: any };
        
        if (profile?.user_type) {
          setUserType(profile.user_type);
        }
      } else {
        setUserType(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string, userType: UserType) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    });

    if (data.user && !error) {
      // Create user profile with user type
      try {
        // Use correct type for insert
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            user_type: userType,
            rating: 5.0,
            total_trips: 0,
          });
        
        if (profileError) {
          console.error('[useAuth] Profile creation error:', profileError);
          
          // Check if it's a missing column error
          if (profileError.message?.includes('user_type') || profileError.code === '42703') {
            console.error('[useAuth] Database schema issue: user_type column missing');
            console.error('[useAuth] Please run the migration to add user_type column to profiles table');
            console.error('[useAuth] See DATABASE_SETUP.md for instructions');
            
            // Try to create profile without user_type as fallback
            const { error: fallbackError } = await supabase
              .from('profiles')
              .insert({
                user_id: data.user.id,
                email: data.user.email!,
                full_name: fullName,
                rating: 5.0,
                total_trips: 0,
              });
            
            if (fallbackError) {
              console.error('[useAuth] Fallback profile creation also failed:', fallbackError);
            } else {
              console.log('[useAuth] Profile created without user_type (fallback)');
            }
          }
        } else {
          console.log('[useAuth] Profile created successfully with user type:', userType);
          setUserType(userType);
        }
      } catch (err) {
        console.error('[useAuth] Error creating profile:', err);
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    console.log('[useAuth] Starting signOut process...');
    console.log('[useAuth] Current user:', user?.email);
    console.log('[useAuth] Supabase configured:', isSupabaseConfigured());
    
    try {
      // Clear Supabase session if configured
      if (isSupabaseConfigured()) {
        console.log('[useAuth] Attempting to sign out from Supabase...');
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('[useAuth] Supabase signOut error:', error);
          // Continue with local cleanup even if Supabase signOut fails
        } else {
          console.log('[useAuth] Supabase session cleared successfully');
        }
      } else {
        console.log('[useAuth] Supabase not configured, skipping Supabase signOut');
      }
      
      // Force clear the session from AsyncStorage
      console.log('[useAuth] Clearing AsyncStorage...');
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const keys = await AsyncStorage.getAllKeys();
      console.log('[useAuth] All AsyncStorage keys:', keys);
      const supabaseKeys = keys.filter(key => key.includes('supabase'));
      if (supabaseKeys.length > 0) {
        await AsyncStorage.multiRemove(supabaseKeys);
        console.log('[useAuth] Cleared Supabase keys from AsyncStorage:', supabaseKeys);
      } else {
        console.log('[useAuth] No Supabase keys found in AsyncStorage');
      }
      
      // Always clear local state
      console.log('[useAuth] Clearing local state...');
      setSession(null);
      setUser(null);
      setUserType(null);
      setLoading(false);
      console.log('[useAuth] Local auth state cleared - user is now:', user);
      
      return { error: null };
    } catch (error) {
      console.error('[useAuth] SignOut error caught:', error);
      console.error('[useAuth] Error details:', JSON.stringify(error, null, 2));
      // Even on error, clear local state
      setSession(null);
      setUser(null);
      setUserType(null);
      setLoading(false);
      return { error: error as Error };
    }
  };

  return {
    session,
    user,
    userType,
    loading,
    signIn,
    signUp,
    signOut,
  };
}