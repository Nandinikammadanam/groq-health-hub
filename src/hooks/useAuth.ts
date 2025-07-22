import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  medical_license?: string;
  specialization?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: 'patient' | 'doctor' | 'admin', additionalData?: any) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          set({ session, user: session?.user ?? null });
          
          if (session?.user) {
            // Defer Supabase calls to avoid deadlock
            setTimeout(async () => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              set({ 
                profile, 
                isAuthenticated: true,
                isLoading: false 
              });
            }, 0);
          } else {
            set({ 
              profile: null, 
              isAuthenticated: false,
              isLoading: false 
            });
          }
        }
      );

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({ 
          session,
          user: session.user,
          profile,
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      profile: null,
      session: null,
      isAuthenticated: false,
    });
  },

  signup: async (email: string, password: string, fullName: string, role: 'patient' | 'doctor' | 'admin', additionalData?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
            phone: additionalData?.phone,
            date_of_birth: additionalData?.dateOfBirth,
            address: additionalData?.address,
            emergency_contact: additionalData?.emergencyContact,
            medical_license: additionalData?.medicalLicense,
            specialization: additionalData?.specialization,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user } = get();
      if (!user) {
        return { error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Update local state
      const currentProfile = get().profile;
      if (currentProfile) {
        set({ profile: { ...currentProfile, ...updates } });
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },
}));