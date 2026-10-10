import { supabase, getSupabaseConfigStatus } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: 'student' | 'faculty' | 'admin';
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  guestToken: string | null;
  guestDisplayName: string | null;
  loading: boolean;
  error: string | null;
}

export const authService = {
  /**
   * Signs up a new student/faculty profile using Supabase Auth.
   */
  async signUp(email: string, pass: string, fullName: string, role: 'student' | 'faculty' = 'student') {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) {
      return { success: false, error: 'Supabase URL/Key missing in .env.local' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  },

  /**
   * Signs in an existing user.
   */
  async signIn(email: string, pass: string) {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) {
      return { success: false, error: 'Supabase URL/Key missing in .env.local' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  },

  /**
   * Signs out the current user.
   */
  async signOut() {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) return;
    await supabase.auth.signOut();
  },

  /**
   * Fetches profile record for authenticated user.
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      role: data.role as 'student' | 'faculty' | 'admin',
      createdAt: data.created_at,
    };
  },

  /**
   * Registers a secure guest player session in Supabase DB using stored procedure join_room_as_guest.
   */
  async registerGuestSession(joinCode: string, displayName: string, collegeName?: string) {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) {
      // Offline preview fallback token
      const guestToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      return {
        success: true,
        guestToken,
        displayName,
        roomId: 'offline-preview',
      };
    }

    try {
      const { data, error } = await supabase.rpc('join_room_as_guest', {
        p_join_code: joinCode.trim().toUpperCase(),
        p_display_name: displayName.trim(),
        p_college_name: collegeName ? collegeName.trim() : null,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        roomPlayerId: data.room_player_id,
        roomId: data.room_id,
        displayName: data.display_name,
        guestToken: data.guest_token,
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
