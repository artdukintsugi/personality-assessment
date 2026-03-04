import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const mountedRef = useRef(true);
  const sessionResolvedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    if (!isSupabaseConfigured()) { setLoading(false); return; }

    // Listen for auth state changes FIRST — this catches the INITIAL_SESSION event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;
      console.log('[auth]', event, session?.user?.email ?? 'no user');

      // Only update user on meaningful events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setUser(session?.user ?? null);
        sessionResolvedRef.current = true;
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    // Fallback: if onAuthStateChange hasn't fired INITIAL_SESSION within 2s, resolve loading
    const timeout = setTimeout(() => {
      if (!mountedRef.current || sessionResolvedRef.current) return;
      console.log('[auth] fallback: resolving via getSession');
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mountedRef.current) return;
        setUser(session?.user ?? null);
        setLoading(false);
      });
    }, 2000);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
    setUser(null);
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
