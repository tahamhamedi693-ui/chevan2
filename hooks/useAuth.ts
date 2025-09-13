import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // For demo purposes, allow mock login when Supabase isn't configured
      console.log('Supabase not configured, using mock authentication');
      
      // Mock test accounts
      const testAccounts = {
        'test@passenger.com': 'password123',
        'test@driver.com': 'password123',
        'admin@rideshare.com': 'admin123'
      };
      
      if (testAccounts[email as keyof typeof testAccounts] === password) {
        // Create mock user
        const mockUser = {
          id: email === 'test@driver.com' ? 'driver-user-id' : 
              email === 'admin@rideshare.com' ? 'admin-user-id' : 'passenger-user-id',
          email,
          user_metadata: {
            full_name: email === 'test@driver.com' ? 'John Driver' :
                      email === 'admin@rideshare.com' ? 'Admin User' : 'John Passenger'
          }
        };
        
        setUser(mockUser as any);
        setSession({ user: mockUser } as any);
        
        return { data: { user: mockUser }, error: null };
      } else {
        return { data: null, error: { message: 'Invalid login credentials' } };
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Supabase login result:', { data: !!data, error: !!error });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (data.user && !error) {
      // Create profile
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      });
    }

    return { data, error };
  };

  const signOut = async () => {
    console.log('Starting signOut process...');
    
    // Clear Supabase session if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
        console.log('Supabase session cleared');
      } catch (error) {
        console.error('Supabase signOut error:', error);
      }
    }
    
    // Always clear local state
    setSession(null);
    setUser(null);
    console.log('Local auth state cleared');
    return { error: null };
  };

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}