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

    // 1. Get the initial session synchronously first
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mountedRef.current) return;
      if (error) console.warn('[auth] getSession error:', error.message);
      console.log('[auth] initial getSession:', session?.user?.email ?? 'no session');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;
      console.log('[auth] event:', event, session?.user?.email ?? 'no user');

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      // Ignore INITIAL_SESSION — we already handle it via getSession above
    });

    return () => {
      mountedRef.current = false;
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
