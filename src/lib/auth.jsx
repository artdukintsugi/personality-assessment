import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!isSupabaseConfigured()) { setLoading(false); return; }

    // Single source of truth: onAuthStateChange handles EVERYTHING
    // including INITIAL_SESSION (fires on page load with existing session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;
      console.log('[auth] event:', event, session?.user?.email ?? 'no user');

      // Accept session from ALL events that carry one
      if (session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }

      // Mark loading done on initial session check
      if (event === 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    // Safety net: if INITIAL_SESSION never fires (shouldn't happen), resolve after 3s
    const timeout = setTimeout(() => {
      if (!mountedRef.current) return;
      setLoading(false);
    }, 3000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase není nakonfigurován' } };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email, password) => {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase není nakonfigurován' } };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase není nakonfigurován' } };
    console.log('[auth] starting Google OAuth, redirectTo:', window.location.origin);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) console.error('[auth] Google OAuth error:', error);
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    console.log('[auth] signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) console.error('[auth] signOut error:', error);
    // Don't setUser(null) here — let onAuthStateChange handle it
  }, []);

  const value = { user, loading, signIn, signUp, signOut, signInWithGoogle, showAuth, setShowAuth, isConfigured: isSupabaseConfigured() };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// ═══ Cloud storage ═══
export async function saveResultToCloud(user, type, data) {
  if (!isSupabaseConfigured() || !user) return null;
  const { data: result, error } = await supabase.from('results').insert({
    user_id: user.id,
    type,
    data,
    created_at: new Date().toISOString(),
  }).select().single();
  if (error) { console.error('Save error:', error); return null; }
  return result;
}

export async function loadResultsFromCloud(user) {
  if (!isSupabaseConfigured() || !user) return [];
  const { data, error } = await supabase.from('results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error('Load error:', error); return []; }
  return data;
}

export async function deleteResultFromCloud(user, id) {
  if (!isSupabaseConfigured() || !user) return;
  await supabase.from('results').delete().eq('id', id).eq('user_id', user.id);
}
