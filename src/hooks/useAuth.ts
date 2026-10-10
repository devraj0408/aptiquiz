import { useState, useEffect } from 'react';
import { supabase, getSupabaseConfigStatus } from '../lib/supabase';
import { authService, AuthState } from '../services/authService';
import { sessionCookieManager } from '../lib/sessionCookies';

export function useAuth(): AuthState & {
  signIn: typeof authService.signIn;
  signUp: typeof authService.signUp;
  signOut: () => Promise<void>;
  setGuestSession: (token: string, name: string) => void;
} {
  const initialGuest = sessionCookieManager.getGuestSession();

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    guestToken: initialGuest.guestToken,
    guestDisplayName: initialGuest.guestName,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Get current session and sync cookies
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        sessionCookieManager.syncAuthSession(session.access_token, session.refresh_token);
        authService.getProfile(session.user.id).then(profile => {
          setState(prev => ({ ...prev, user: session.user, profile, loading: false }));
        });
      } else {
        sessionCookieManager.syncAuthSession(null, null);
        setState(prev => ({ ...prev, user: null, profile: null, loading: false }));
      }
    });

    // Listen to Auth state changes and sync cookies across tabs / windows
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        sessionCookieManager.syncAuthSession(session.access_token, session.refresh_token);
        const profile = await authService.getProfile(session.user.id);
        setState(prev => ({ ...prev, user: session.user, profile, loading: false }));
      } else {
        sessionCookieManager.syncAuthSession(null, null);
        setState(prev => ({ ...prev, user: null, profile: null, loading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
    sessionCookieManager.clearAllSessions();
    setState({
      user: null,
      profile: null,
      guestToken: null,
      guestDisplayName: null,
      loading: false,
      error: null,
    });
  };

  const setGuestSession = (token: string, name: string) => {
    sessionCookieManager.syncGuestSession(token, name);
    setState(prev => ({
      ...prev,
      guestToken: token,
      guestDisplayName: name,
    }));
  };

  return {
    ...state,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut,
    setGuestSession,
  };
}
