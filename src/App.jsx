import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { SOURCES, FACET_META, DOMAIN_META, SCORING_INFO } from './lib/scoring-meta';
import { getQuestionHint, getDiagExplanation, getLpfsSubscale, LPFS_SUBSCALE_NAMES, LPFS_SUBSCALES } from './lib/question-hints';
import { exportPid5Report, exportInstagramStory, exportQuickSummary, exportLpfsReport, exportRawJson, exportPid5AnswerSheet, exportLpfsAnswerSheet } from './lib/export-v2';
import { useAuth, saveResultToCloud, loadResultsFromCloud, deleteResultFromCloud } from './lib/auth';
import { Q, Q_EN, LPFS_Q, FM, DF, DF_ALL, DC, REVERSE_SCORED, DIAG_PROFILES, DIAG_DETAILS } from './data';
import { createT, sevLabel, lpfsSubName, domainName, facetName, diagName, diagDesc, domainShort, metaDesc } from './lib/i18n';

// ═══ REVERSE LOOKUP: item → facets ═══
const REVERSE = {};
Object.entries(FM).forEach(([f, items]) => items.forEach(i => { if(!REVERSE[i]) REVERSE[i]=[]; REVERSE[i].push(f); }));
function facetDomain(f) { for (const [d, fs] of Object.entries(DF_ALL)) { if (fs.includes(f)) return d; } return null; }

/**
 * Score PID-5 facets with REVERSE SCORING support.
 * Reverse-scored items: score = 3 - rawValue (scale 0-3).
 * e.g. Q90 "Nikdy bych druhému neublížil/a" (Bezcitnost) — answering 3 should DECREASE callousness.
 */
function scoreFacets(answers) {
  const r = {};
  Object.entries(FM).forEach(([f, items]) => {
    const vals = items.map(i => {
      const raw = answers[i];
      if (raw === undefined || raw === null) return null;
      return REVERSE_SCORED.has(i) ? 3 - raw : raw;
    }).filter(v => v !== null);
    r[f] = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  });
  return r;
}
function scoreDomains(facetScores) { const r = {}; Object.entries(DF).forEach(([d, fs]) => { const vals = fs.map(f => facetScores[f] || 0); r[d] = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0; }); return r; }
const SEV_CLR = (v) => v < 0.5 ? "#4ADE80" : v < 1.0 ? "#FBBF24" : v < 2.0 ? "#FB923C" : "#F87171";

/** Compress answers to a URL-safe base64 string */
function compressAnswers(answers, type) {
  // For PID-5: 220 answers (0-3), 2 bits each = 55 bytes
  // For LPFS: 80 answers (1-4), 2 bits each = 20 bytes
  const count = type === 'pid5' ? 220 : 80;
  const offset = type === 'pid5' ? 0 : 1; // LPFS starts at 1
  const bytes = [];
  for (let i = 0; i < count; i += 4) {
    let byte = 0;
    for (let j = 0; j < 4 && (i + j) < count; j++) {
      const val = (answers[i + j] !== undefined ? answers[i + j] - offset : 0) & 0x3;
      byte |= (val << (j * 2));
    }
    bytes.push(byte);
  }
  // Convert to URL-safe base64
  const bin = String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decompress answers from URL-safe base64 string */
function decompressAnswers(encoded, type) {
  const count = type === 'pid5' ? 220 : 80;
  const offset = type === 'pid5' ? 0 : 1;
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded);
  const bytes = Array.from(bin).map(c => c.charCodeAt(0));
  const answers = {};
  for (let i = 0; i < count; i++) {
    const byteIdx = Math.floor(i / 4);
    const bitOffset = (i % 4) * 2;
    if (byteIdx < bytes.length) {
      answers[i] = ((bytes[byteIdx] >> bitOffset) & 0x3) + offset;
    }
  }
  return answers;
}

function scoreLpfsSubscales(lpfsAns) {
  const r = {};
  Object.entries(LPFS_SUBSCALES).forEach(([sub, indices]) => {
    const vals = indices.map(i => lpfsAns[i]).filter(v => v !== undefined && v !== null);
    r[sub] = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  });
  return r;
}

function scoreDiagnostics(fScores) {
  return DIAG_PROFILES.map(prof => {
    let totalW = 0, totalS = 0;
    prof.facets.forEach(f => { const w = prof.weights[f] || 1; totalW += w; totalS += (fScores[f] || 0) * w; });
    const score = totalW > 0 ? totalS / totalW : 0;
    return { ...prof, score, flag: score >= prof.threshold };
  }).sort((a, b) => b.score - a.score);
}

// ═══ TOOLTIP COMPONENT ═══
function HoverTip({ children, text, wide, block }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  if (!text) return children;
  const Tag = block ? 'div' : 'span';
  return (
    <Tag className={`relative ${block ? 'block' : 'inline-block'}`} ref={ref} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className={`absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-xs leading-relaxed text-gray-200 bg-gray-800/95 border border-gray-600/40 backdrop-blur-xl shadow-2xl pointer-events-none animate-in fade-in ${wide ? 'w-72' : 'w-56'}`}
          style={{animation: 'fadeIn .15s ease-out'}}>
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700/80" />
        </span>
      )}
    </Tag>
  );
}

// ═══ localStorage ═══
const LS_KEYS = { answers: 'diag_pid5_answers', idx: 'diag_pid5_idx', lpfsAns: 'diag_lpfs_answers', lpfsIdx: 'diag_lpfs_idx', history: 'diag_results_history', lang: 'diag_lang' };
function lsGet(key, fallback) { try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

export default function App() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive mode from URL path
  const mode = useMemo(() => {
    const p = location.pathname;
    if (p === '/pid5') return 'pid5';
    if (p === '/lpfs') return 'lpfs';
    if (p === '/pid5/results') return 'pid5_results';
    if (p === '/lpfs/results') return 'lpfs_results';
    if (p === '/history') return 'history';
    if (p.startsWith('/r/pid5/')) return 'shared_pid5';
    if (p.startsWith('/r/lpfs/')) return 'shared_lpfs';
    if (p.startsWith('/diag/')) return 'diag_detail';
    return 'menu';
  }, [location.pathname]);

  const setMode = useCallback((m) => {
    const routes = { menu: '/', pid5: '/pid5', lpfs: '/lpfs', pid5_results: '/pid5/results', lpfs_results: '/lpfs/results', history: '/history' };
    navigate(routes[m] || '/');
  }, [navigate]);
  const [idx, setIdx] = useState(() => lsGet(LS_KEYS.idx, 0));
  const [answers, setAnswers] = useState(() => lsGet(LS_KEYS.answers, {}));
  const [lpfsIdx, setLpfsIdx] = useState(() => lsGet(LS_KEYS.lpfsIdx, 0));
  const [lpfsAns, setLpfsAns] = useState(() => lsGet(LS_KEYS.lpfsAns, {}));
  const [hoveredVal, setHoveredVal] = useState(null);
  const [showDiagLive, setShowDiagLive] = useState(true);
  const [showScoringInfo, setShowScoringInfo] = useState(false);
  const [history, setHistory] = useState(() => lsGet(LS_KEYS.history, []));
  const [showHistory, setShowHistory] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [authForm, setAuthForm] = useState(null); // null | 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [cloudResults, setCloudResults] = useState([]);
  const [viewingResult, setViewingResult] = useState(null); // for viewing a saved result in full-page mode
  const [viewingSource, setViewingSource] = useState(null); // 'local' | 'cloud' — indicates we're viewing saved data
  const [lang, setLang] = useState(() => lsGet(LS_KEYS.lang, 'cs')); // 'cs' | 'en'
  const [shareToast, setShareToast] = useState(false);
  const t = useMemo(() => createT(lang), [lang]);
  const SEV = useCallback((v) => sevLabel(v, lang), [lang]);

  useEffect(() => { lsSet(LS_KEYS.lang, lang); }, [lang]);
  useEffect(() => { lsSet(LS_KEYS.answers, answers); }, [answers]);
  useEffect(() => { lsSet(LS_KEYS.idx, idx); }, [idx]);
  useEffect(() => { lsSet(LS_KEYS.lpfsAns, lpfsAns); }, [lpfsAns]);
  useEffect(() => { lsSet(LS_KEYS.lpfsIdx, lpfsIdx); }, [lpfsIdx]);
  useEffect(() => { lsSet(LS_KEYS.history, history); }, [history]);

  // Load shared result from URL
  useEffect(() => {
    const p = location.pathname;
    if (p.startsWith('/r/pid5/')) {
      try {
        const encoded = p.slice('/r/pid5/'.length);
        const decoded = decompressAnswers(encoded, 'pid5');
        if (Object.keys(decoded).length > 0) {
          setAnswers(decoded);
          setIdx(219);
          setViewingResult({ date: null });
          setViewingSource('shared');
        }
      } catch (e) { console.error('Failed to decode shared PID-5 result:', e); }
    } else if (p.startsWith('/r/lpfs/')) {
      try {
        const encoded = p.slice('/r/lpfs/'.length);
        const decoded = decompressAnswers(encoded, 'lpfs');
        if (Object.keys(decoded).length > 0) {
          setLpfsAns(decoded);
          setLpfsIdx(79);
          setViewingResult({ date: null });
          setViewingSource('shared');
        }
      } catch (e) { console.error('Failed to decode shared LPFS result:', e); }
    }
  }, []);  // only on mount

  const shareCurrentResult = useCallback((type) => {
    const ans = type === 'pid5' ? answers : lpfsAns;
    const encoded = compressAnswers(ans, type);
    const url = `${window.location.origin}/r/${type}/${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }).catch(() => {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  }, [answers, lpfsAns]);

  // Load cloud results when user signs in
  useEffect(() => {
    if (auth?.user) {
      loadResultsFromCloud(auth.user).then(setCloudResults).catch(() => setCloudResults([]));
    } else {
      setCloudResults([]);
    }
  }, [auth?.user?.id]);

  const saveToHistory = useCallback((type, data) => {
    const entry = { id: Date.now(), type, date: new Date().toISOString(), ...data };
    setHistory(prev => [entry, ...prev].slice(0, 50));
    // Also save to cloud if authenticated
    if (auth?.user) {
      saveResultToCloud(auth.user, type, { ...data, date: entry.date }).then(() => {
        loadResultsFromCloud(auth.user).then(setCloudResults);
      });
    }
  }, [auth?.user]);

  // Manual save functions — called only when user clicks "Uložit výsledek"
  const savePid5Result = useCallback(() => {
    const fScores = scoreFacets(answers);
    const diags = scoreDiagnostics(fScores);
    saveToHistory('pid5', {
      topDiags: diags.filter(d => d.flag).map(d => ({ id: d.id, name: d.name, score: d.score, color: d.color })),
      fullData: { domeny: scoreDomains(fScores), facety: fScores, diagnostika: diags.map(d => ({id:d.id,name:d.name,score:d.score,flag:d.flag})), odpovedi: answers }
    });
  }, [answers, saveToHistory]);

  const saveLpfsResult = useCallback(() => {
    const vals = Object.values(lpfsAns);
    const avg = vals.reduce((a,b) => a+b, 0) / vals.length;
    saveToHistory('lpfs', { score: avg, fullData: { prumer: avg, subskaly: scoreLpfsSubscales(lpfsAns), odpovedi: lpfsAns } });
  }, [lpfsAns, saveToHistory]);

  // View saved result — loads answers into state and navigates to full results page
  const viewSavedResult = useCallback((result) => {
    const fd = result.fullData || result;
    if (result.type === 'pid5' && fd) {
      // If we have raw answers, load them into state for full interactivity
      if (fd.odpovedi && Object.keys(fd.odpovedi).length > 0) {
        setAnswers(fd.odpovedi);
        setIdx(219);
      }
      setViewingResult(result);
      setViewingSource('saved');
      setMode('pid5_results');
    } else if (result.type === 'lpfs' && fd) {
      if (fd.odpovedi && Object.keys(fd.odpovedi).length > 0) {
        setLpfsAns(fd.odpovedi);
        setLpfsIdx(79);
      }
      setViewingResult(result);
      setViewingSource('saved');
      setMode('lpfs_results');
    }
  }, [setMode]);

  const curAns = mode === "pid5" ? answers : lpfsAns;
  const answered = Object.keys(curAns).length;

  const answer = useCallback((val) => {
    if (mode === "pid5") {
      setAnswers(p => ({...p, [idx]: val}));
      if (idx < Q.length - 1) setTimeout(() => setIdx(idx + 1), 200);
      else setTimeout(() => setMode("pid5_results"), 400);
    } else if (mode === "lpfs") {
      setLpfsAns(p => ({...p, [lpfsIdx]: val}));
      if (lpfsIdx < LPFS_Q.length - 1) setTimeout(() => setLpfsIdx(lpfsIdx + 1), 200);
      else setTimeout(() => setMode("lpfs_results"), 400);
    }
  }, [mode, idx, lpfsIdx]);

  const toggleLang = useCallback(() => setLang(l => l === 'cs' ? 'en' : 'cs'), []);

  // ═══ Global E key — works on ALL screens (menu, results, questionnaire) ═══
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === 'e' || e.key === 'E') { e.preventDefault(); toggleLang(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleLang]);

  // Questionnaire number keys — only in pid5/lpfs modes
  useEffect(() => {
    if (mode !== "pid5" && mode !== "lpfs") return;
    const isPid = mode === "pid5";
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (isPid && ["0","1","2","3"].includes(e.key)) { e.preventDefault(); answer(parseInt(e.key)); }
      else if (!isPid && ["1","2","3","4"].includes(e.key)) { e.preventDefault(); answer(parseInt(e.key)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, answer]);

  const facetScores = useMemo(() => scoreFacets(answers), [answers]);
  const domainScores = useMemo(() => scoreDomains(facetScores), [facetScores]);
  const diagnostics = useMemo(() => scoreDiagnostics(facetScores), [facetScores]);
  const lpfsSubscaleScores = useMemo(() => scoreLpfsSubscales(lpfsAns), [lpfsAns]);

  const previewFacetScores = useMemo(() => {
    if (hoveredVal === null || mode !== "pid5") return facetScores;
    return scoreFacets({ ...answers, [idx]: hoveredVal });
  }, [hoveredVal, answers, idx, mode, facetScores]);
  const previewDomainScores = useMemo(() => {
    if (hoveredVal === null || mode !== "pid5") return domainScores;
    return scoreDomains(previewFacetScores);
  }, [hoveredVal, mode, previewFacetScores, domainScores]);
  const previewDiagnostics = useMemo(() => {
    if (hoveredVal === null || mode !== "pid5") return diagnostics;
    return scoreDiagnostics(previewFacetScores);
  }, [hoveredVal, mode, previewFacetScores, diagnostics]);

  // LPFS preview scores
  const previewLpfsSubscales = useMemo(() => {
    if (hoveredVal === null || mode !== "lpfs") return lpfsSubscaleScores;
    return scoreLpfsSubscales({ ...lpfsAns, [lpfsIdx]: hoveredVal });
  }, [hoveredVal, lpfsAns, lpfsIdx, mode, lpfsSubscaleScores]);
  const previewLpfsTotal = useMemo(() => {
    if (hoveredVal === null || mode !== "lpfs") return null;
    const newAns = { ...lpfsAns, [lpfsIdx]: hoveredVal };
    const vals = Object.values(newAns);
    return vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
  }, [hoveredVal, lpfsAns, lpfsIdx, mode]);

  const radarData = useMemo(() =>
    Object.entries(domainScores).map(([d, v]) => ({ domain: domainShort(d, lang), value: Math.round(v * 100) / 100, full: domainName(d, lang) })),
    [domainScores, lang]
  );

  const lpfsTotal = useMemo(() => {
    const vals = Object.values(lpfsAns);
    return vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length * 100) / 100 : 0;
  }, [lpfsAns]);

  const fillSample = useCallback(() => { const s = {}; for (let i = 0; i < 220; i++) { const r = Math.random(); s[i] = r < 0.2 ? 0 : r < 0.5 ? 1 : r < 0.8 ? 2 : 3; } setAnswers(s); setIdx(219); setMode("pid5_results"); }, []);
  const fillSampleLpfs = useCallback(() => { const s = {}; for (let i = 0; i < 80; i++) { const r = Math.random(); s[i] = r < 0.2 ? 1 : r < 0.5 ? 2 : r < 0.8 ? 3 : 4; } setLpfsAns(s); setLpfsIdx(79); setMode("lpfs_results"); }, []);

  const handleAuth = async (action) => {
    setAuthError('');
    const res = action === 'login' ? await auth.signIn(authEmail, authPass) : await auth.signUp(authEmail, authPass);
    if (res?.error) setAuthError(res.error.message);
    else { setAuthForm(null); setAuthEmail(''); setAuthPass(''); }
  };

  // ═══ DiagCard component ═══
  const DiagCard = ({ diag, fScores }) => {
    const { name, color, desc, facets: dFacets, score, flag, id } = diag;
    const explanation = getDiagExplanation(id, lang);
    const displayName = diagName(id, name, lang);
    return (
      <div className={`mb-4 p-4 rounded-xl border transition-all ${flag ? 'border-opacity-40' : 'border-gray-700/30 bg-gray-800/20'}`} style={flag ? { borderColor: color + '50', background: color + '08' } : {}}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <HoverTip text={explanation} wide>
            <span className="font-semibold text-sm cursor-help" style={{ color: flag ? color : '#9CA3AF' }}>{displayName}</span>
          </HoverTip>
          <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: flag ? color + '20' : '#374151', color: flag ? color : '#6B7280' }}>
            {score.toFixed(2)} — {flag ? t('sevElevated') : score >= 1.0 ? t('sevMild') : t('sevLow')}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3">{diagDesc(desc, lang)}</p>
        <div className="space-y-1">
          {dFacets.map(f => {
            const v = fScores[f] || 0;
            const meta = FACET_META[f];
            return (
              <div key={f}>
                <div className="flex items-center justify-between mb-0.5">
                  <HoverTip text={metaDesc(meta?.desc, lang)}>
                    <div className="text-xs text-gray-400 truncate cursor-help">↳ {facetName(f, lang)}</div>
                  </HoverTip>
                  <div className="text-xs font-mono text-gray-400 shrink-0">{v.toFixed(2)}</div>
                </div>
                <div className="bg-gray-800 rounded-full h-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(v/3)*100}%`, background: SEV_CLR(v) }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══ AUTH MODAL ═══
  const AuthModal = () => authForm && (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAuthForm(null)}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{authForm === 'login' ? t('loginTitle') : t('signupTitle')}</h3>
        {authError && <div className="text-red-400 text-xs mb-3 p-2 rounded-lg bg-red-950/30 border border-red-500/20">{authError}</div>}
        {/* Google OAuth */}
        <button onClick={async () => { setAuthError(''); const res = await auth.signInWithGoogle(); if (res?.error) setAuthError(res.error.message); }}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold text-sm mb-3 flex items-center justify-center gap-2 border border-gray-300 transition-all">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          {t('continueWithGoogle')}
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-xs text-gray-500">{t('or')}</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>
        {/* Email + heslo */}
        <input type="email" placeholder={t('emailPlaceholder')} value={authEmail} onChange={e => setAuthEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-200 focus:outline-none focus:border-purple-500" />
        <input type="password" placeholder={t('passwordPlaceholder')} value={authPass} onChange={e => setAuthPass(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
          onKeyDown={e => e.key === 'Enter' && handleAuth(authForm)} />
        <button onClick={() => handleAuth(authForm)} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm mb-2">
          {authForm === 'login' ? t('loginAction') : t('signupAction')}
        </button>
        <button onClick={() => setAuthForm(authForm === 'login' ? 'signup' : 'login')} className="w-full text-center text-xs text-gray-500 hover:text-gray-300">
          {authForm === 'login' ? t('noAccount') : t('hasAccount')}
        </button>
      </div>
    </div>
  );

  // ── MENU ──
  if (mode === "menu") return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <AuthModal />
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-end mb-4">
            <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-2">{t('appTitle')}</h1>
          <p className="text-gray-500 text-sm">{t('appSubtitle')}</p>
        </div>

        {/* Auth bar */}
        <div className="mb-8 p-4 rounded-2xl bg-gray-900/50 border border-gray-800/60">
          {auth?.user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">{auth.user.email?.[0]?.toUpperCase()}</div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-200 truncate">{auth.user.email}</div>
                  <div className="text-xs text-green-500/70">{t('synced')}</div>
                </div>
              </div>
              <button onClick={() => auth.signOut()} className="text-xs text-gray-600 hover:text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all">{t('signOut')}</button>
            </div>
          ) : auth?.isConfigured ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-gray-500">{t('localOnly')}</span>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setAuthForm('login')} className="text-xs px-4 py-2 rounded-lg bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-all font-medium">{t('login')}</button>
                <button onClick={() => setAuthForm('signup')} className="text-xs px-4 py-2 rounded-lg bg-gray-800/60 text-gray-400 hover:text-gray-300 transition-all">{t('signup')}</button>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-600">{t('localSave')}</span>
          )}
        </div>

        {/* Test cards */}
        <div className="grid gap-3 mb-6">
          <button onClick={() => setMode("pid5")} className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 hover:border-purple-400/40 transition-all text-left group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">PID-5</div>
                <div className="text-xs text-gray-500 mt-1">{t('pid5Desc')}</div>
              </div>
              <span className="text-gray-600 group-hover:text-gray-400 text-lg">→</span>
            </div>
            {Object.keys(answers).length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{width: `${(Object.keys(answers).length/220)*100}%`}} /></div>
                <span className="text-xs text-purple-400 shrink-0">{Object.keys(answers).length}/220</span>
              </div>
            )}
          </button>
          <button onClick={() => setMode("lpfs")} className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/20 hover:border-blue-400/40 transition-all text-left group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-blue-300 group-hover:text-blue-200 transition-colors">LPFS-SR</div>
                <div className="text-xs text-gray-500 mt-1">{t('lpfsDesc')}</div>
              </div>
              <span className="text-gray-600 group-hover:text-gray-400 text-lg">→</span>
            </div>
            {Object.keys(lpfsAns).length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width: `${(Object.keys(lpfsAns).length/80)*100}%`}} /></div>
                <span className="text-xs text-blue-400 shrink-0">{Object.keys(lpfsAns).length}/80</span>
              </div>
            )}
          </button>
        </div>

        {/* Quick result buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.keys(answers).length === 220 && <button onClick={() => setMode("pid5_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">{t('pid5Results')}</button>}
          {Object.keys(lpfsAns).length === 80 && <button onClick={() => setMode("lpfs_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">{t('lpfsResults')}</button>}
        </div>

        {/* ═══ SAVED RESULTS / HISTORY ═══ */}
        {(history.length > 0 || cloudResults.length > 0) && (
          <div className="mb-6">
            <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800/60 hover:border-gray-700 transition-all">
              <span className="text-sm text-gray-400 flex items-center gap-2">{t('savedResults')} <span className="text-xs text-gray-600">({history.length} {t('local')}{cloudResults.length > 0 ? ` + ${cloudResults.length} ${t('cloud')}` : ''})</span></span>
              <span className="text-xs text-gray-600">{showHistory ? '▾' : '▸'}</span>
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2 max-h-96 overflow-y-auto pr-1">
                {/* Local results */}
                {history.map((h) => (
                  <div key={h.id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/60 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${h.type === 'pid5' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{h.type === 'pid5' ? 'PID-5' : 'LPFS'}</span>
                        <span className="text-xs text-gray-600">{new Date(h.date).toLocaleString(lang === 'en' ? 'en-US' : 'cs-CZ')}</span>
                      </div>
                    </div>
                    {h.type === 'pid5' && h.topDiags?.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                        {h.topDiags.slice(0, 4).map((d, j) => (
                          <span key={j} className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                            {(d.id ? diagName(d.id, d.name, lang) : d.name).split('(')[0].split('—')[0].trim()}: {d.score.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    )}
                    {h.type === 'lpfs' && <div className="text-xs text-gray-400 mb-3">{t('average')}: {h.score?.toFixed(2)}</div>}
                    <div className="flex gap-2">
                      <button onClick={() => viewSavedResult(h)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition-all">{t('view')}</button>
                      <button onClick={() => {
                        const blob = new Blob([JSON.stringify(h.fullData, null, 2)], {type:'application/json'});
                        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                        a.download = `${h.type}_${h.date.slice(0,10)}.json`; a.click();
                      }} className="text-xs px-3 py-1.5 rounded-lg bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition-all">{t('export')}</button>
                      <button onClick={() => { if (confirm(t('deleteResult'))) setHistory(prev => prev.filter(x => x.id !== h.id)); }}
                        className="text-xs px-3 py-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-all ml-auto">🗑</button>
                    </div>
                  </div>
                ))}
                {/* Cloud results */}
                {cloudResults.length > 0 && (
                  <>
                    <div className="text-xs text-gray-600 px-2 pt-2 flex items-center gap-2"><span className="h-px flex-1 bg-gray-800" /><span>☁ Cloud</span><span className="h-px flex-1 bg-gray-800" /></div>
                    {cloudResults.map((cr) => (
                      <div key={cr.id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/60 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${cr.type === 'pid5' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{cr.type === 'pid5' ? 'PID-5' : 'LPFS'}</span>
                            <span className="text-xs text-gray-600">{new Date(cr.created_at).toLocaleString(lang === 'en' ? 'en-US' : 'cs-CZ')}</span>
                            <span className="text-xs text-gray-700">☁</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => viewSavedResult({ type: cr.type, fullData: cr.data?.fullData || cr.data, date: cr.created_at })}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition-all">{t('view')}</button>
                          <button onClick={() => {
                            const blob = new Blob([JSON.stringify(cr.data, null, 2)], {type:'application/json'});
                            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                            a.download = `${cr.type}_cloud_${cr.created_at?.slice(0,10)}.json`; a.click();
                          }} className="text-xs px-3 py-1.5 rounded-lg bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition-all">{t('export')}</button>
                          <button onClick={async () => {
                            if (confirm(t('deleteFromCloud'))) {
                              await deleteResultFromCloud(auth.user, cr.id);
                              setCloudResults(prev => prev.filter(x => x.id !== cr.id));
                            }
                          }} className="text-xs px-3 py-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-all ml-auto">🗑</button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Debug tools */}
        <div className="mt-6 pt-4 border-t border-gray-800/40">
          <div className="text-xs text-gray-700 mb-2">{t('debug')}</div>
          <div className="flex gap-2">
            <button onClick={fillSample} className="flex-1 p-2.5 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 PID-5</button>
            <button onClick={fillSampleLpfs} className="flex-1 p-2.5 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 LPFS</button>
            <button onClick={() => { setAnswers({}); setIdx(0); setLpfsAns({}); setLpfsIdx(0); }} className="flex-1 p-2.5 rounded-lg bg-gray-900/40 border border-red-900/20 text-gray-600 text-xs hover:text-red-400 hover:border-red-800 transition-all">{t('reset')}</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DIAGNOSTIC DETAIL PAGE ──
  if (mode === "diag_detail") {
    const diagId = location.pathname.split('/diag/')[1];
    const profile = DIAG_PROFILES.find(p => p.id === diagId);
    const detail = DIAG_DETAILS[diagId];
    const d = detail?.[lang] || detail?.cs;
    const displayName = profile ? diagName(profile.id, profile.name, lang) : diagId;
    const diagScore = diagnostics.find(x => x.id === diagId);

    if (!d) return (
      <div className="min-h-screen bg-gray-950 text-white p-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{lang === 'cs' ? 'Detail pro tuto diagnózu není k dispozici.' : 'Detail not available for this diagnosis.'}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-all">{t('back')}</button>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{t('diagBackToResults')}</button>
            <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              {profile && <div className="w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-gray-950" style={{background: profile.color, ringColor: profile.color + '60'}} />}
              <h1 className="text-2xl md:text-3xl font-bold" style={{color: profile?.color || '#E5E7EB'}}>{displayName.split('(')[0].trim()}</h1>
            </div>
            {displayName.includes('(') && <div className="text-sm text-gray-500 mb-2 ml-8">{displayName.match(/\(([^)]+)\)/)?.[1]}</div>}
            <p className="text-xs text-gray-600 ml-8">{d.fullName}</p>
            {diagScore && (
              <div className="mt-4 ml-8 inline-flex items-center gap-3 px-4 py-2 rounded-xl border" style={{borderColor: profile?.color + '30', background: profile?.color + '08'}}>
                <span className="text-sm text-gray-400">{lang === 'cs' ? 'Vaše skóre:' : 'Your score:'}</span>
                <span className="text-xl font-bold font-mono" style={{color: profile?.color}}>{diagScore.score.toFixed(2)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{background: diagScore.flag ? (profile?.color + '25') : '#374151', color: diagScore.flag ? profile?.color : '#9CA3AF'}}>{diagScore.flag ? `⚠ ${t('sevElevated')}` : diagScore.score >= 1.0 ? t('sevMild') : t('sevLow')}</span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
            <p className="text-gray-300 leading-relaxed">{d.summary}</p>
          </div>

          {/* Key Traits */}
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4" style={{color: profile?.color || '#E5E7EB'}}>📋 {t('diagKeyTraits')}</h3>
            <ul className="space-y-2">
              {d.keyTraits.map((trait, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{background: profile?.color || '#6B7280'}} />
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
            {/* Facet scores if available */}
            {profile && diagScore && (
              <div className="mt-5 pt-4 border-t border-gray-800/60">
                <div className="text-xs text-gray-500 mb-3">{lang === 'cs' ? 'Vaše skóre v relevantních facetech:' : 'Your scores on relevant facets:'}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {profile.facets.map(f => {
                    const fv = facetScores[f] || 0;
                    return (
                      <div key={f} className="flex items-center gap-2">
                        <div className="flex-1 text-xs text-gray-400 truncate">{facetName(f, lang)}</div>
                        <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{width: `${(fv/3)*100}%`, background: SEV_CLR(fv)}} />
                        </div>
                        <div className="text-xs font-mono w-8 text-right" style={{color: SEV_CLR(fv)}}>{fv.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* How it manifests */}
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">🔍 {t('diagHowManifests')}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{d.howItManifests}</p>
          </div>

          {/* Relationships + Work side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-5 backdrop-blur-xl">
              <h3 className="text-base font-semibold text-pink-300 mb-3">💗 {t('diagRelationships')}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{d.relationships}</p>
            </div>
            <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-5 backdrop-blur-xl">
              <h3 className="text-base font-semibold text-blue-300 mb-3">💼 {t('diagWorkLife')}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{d.workLife}</p>
            </div>
          </div>

          {/* Treatment */}
          <div className="bg-green-950/20 rounded-2xl border border-green-500/15 p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-300 mb-3">🩺 {t('diagTreatment')}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{d.treatment}</p>
          </div>

          {/* Important note */}
          <div className="bg-amber-950/20 rounded-2xl border border-amber-500/20 p-6 mb-8">
            <h3 className="text-base font-semibold text-amber-300 mb-2">📌 {t('diagImportantNote')}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{d.note}</p>
          </div>

          {/* Disclaimer */}
          <p className="text-amber-400/80 text-xs p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 mb-8">{t('summaryNote')}</p>

          <div className="flex gap-3 mb-12">
            <button onClick={() => navigate(-1)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">{t('diagBackToResults')}</button>
            <button onClick={() => setMode("menu")} className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl text-gray-400 font-semibold transition-all">{t('menu')}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PID-5 RESULTS ──
  if (mode === "pid5_results" || mode === "shared_pid5") return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setMode("menu")} className="text-gray-500 hover:text-gray-300 text-sm">{t('back')}</button>
          <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
        </div>
        <h2 className="text-3xl font-bold text-purple-300 mb-2">{t('pid5ResultsHeading')}</h2>
        <p className="text-gray-400 mb-4">{t('filledItems')} {Object.keys(answers).length}/220 {t('items')}</p>
        {viewingSource === 'shared' && (
          <div className="mb-6 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
            <span className="text-xs text-cyan-400">🔗 {t('viewingSharedResult')}</span>
            <button onClick={() => { setViewingResult(null); setViewingSource(null); setMode('menu'); }} className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-800 transition-all">{t('close')}</button>
          </div>
        )}
        {viewingSource === 'saved' && viewingResult && (
          <div className="mb-6 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-amber-400">📋 {lang === 'cs' ? 'Prohlížíte uložený výsledek' : 'Viewing saved result'}{viewingResult.date ? ` — ${new Date(viewingResult.date).toLocaleString(lang === 'en' ? 'en-US' : 'cs-CZ')}` : ''}</span>
            <button onClick={() => { setViewingResult(null); setViewingSource(null); setMode('menu'); }} className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-800 transition-all">{t('close')}</button>
          </div>
        )}

        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('domainsRadar')}</h3>
          <div className="w-full" style={{height: 350}}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="domain" tick={{fill:'#9CA3AF', fontSize:12}} />
                <PolarRadiusAxis domain={[0, 3]} tick={{fill:'#6B7280', fontSize:10}} />
                <Radar dataKey="value" stroke="#C084FC" fill="#C084FC" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{background:'#1F2937',border:'1px solid #374151',borderRadius:12,color:'#fff'}} formatter={(v,_n,p) => [v.toFixed(2), p.payload.full]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('domainsOverview')}</h3>
          {Object.entries(domainScores).map(([d, v]) => (
            <HoverTip key={d} text={metaDesc(DOMAIN_META[d]?.desc, lang)} wide block>
              <div className="cursor-help mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium truncate" style={{color: DC[d]}}>{domainName(d, lang)}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono">{v.toFixed(2)}</span>
                    <span className="text-xs" style={{color: SEV_CLR(v)}}>{SEV(v)}</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width: `${(v/3)*100}%`, background: DC[d]}} />
                </div>
              </div>
            </HoverTip>
          ))}
        </div>

        {/* ═══ FACET DETAILS — Modern Grid ═══ */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-6">{t('facetsDetail')}</h3>
          {Object.entries(DF_ALL).map(([domain, facetList]) => (
            <div key={domain} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full" style={{background: DC[domain]}} />
                <h4 className="text-sm font-bold uppercase tracking-wider" style={{color: DC[domain]}}>{domainName(domain, lang)}</h4>
                <div className="flex-1 h-px" style={{background: DC[domain] + '30'}} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {facetList.map(f => {
                  const v = facetScores[f] || 0;
                  const meta = FACET_META[f];
                  const sevColor = SEV_CLR(v);
                  return (
                    <HoverTip key={f} text={metaDesc(meta?.desc, lang)} wide block>
                      <div className="cursor-help group rounded-xl border border-gray-800/60 bg-gray-900/40 p-4 hover:border-gray-600/60 hover:bg-gray-800/40 hover:shadow-lg hover:shadow-black/20 transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">{facetName(f, lang)}</div>
                            {lang === 'en' && <div className="text-[10px] text-gray-600 truncate">{f}</div>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-lg font-bold font-mono" style={{color: sevColor}}>{v.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="bg-gray-800 rounded-full h-2 overflow-hidden mb-2">
                          <div className="h-full rounded-full transition-all duration-500" style={{width: `${(v/3)*100}%`, background: sevColor}} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{background: sevColor + '20', color: sevColor}}>{SEV(v)}</span>
                          <span className="text-[10px] text-gray-600 font-mono">{meta?.items?.length || '—'} {t('items')}</span>
                        </div>
                      </div>
                    </HoverTip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ DIAGNOSTIC PROFILES — Modern Grid ═══ */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">{t('diagProfilesTitle')}</h3>
          <p className="text-xs text-gray-500 mb-6">{t('diagDisclaimer')}</p>

          {/* Elevated profiles — large grid cards */}
          {diagnostics.filter(d => d.flag).length > 0 && (
            <div className="mb-8">
              <div className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <span>⚠</span> {t('elevatedProfiles')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnostics.filter(d => d.flag).map(d => {
                  const explanation = getDiagExplanation(d.id, lang);
                  const displayName = diagName(d.id, d.name, lang);
                  return (
                    <div key={d.id} className="group rounded-2xl border-2 p-5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200" style={{borderColor: d.color + '40', background: d.color + '08'}}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-gray-950" style={{background: d.color, ringColor: d.color + '60'}} />
                        <div className="flex-1 min-w-0">
                          <HoverTip text={explanation} wide>
                            <div onClick={() => navigate(`/diag/${d.id}`)} className="text-base font-bold cursor-pointer truncate hover:underline underline-offset-2" style={{color: d.color}}>{displayName.split('(')[0].trim()}</div>
                          </HoverTip>
                          {displayName.includes('(') && <div className="text-[10px] text-gray-500">{displayName.match(/\(([^)]+)\)/)?.[1]}</div>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold font-mono" style={{color: d.color}}>{d.score.toFixed(2)}</div>
                          <div className="text-[10px] font-medium px-2 py-0.5 rounded-full mt-1" style={{background: d.color + '25', color: d.color}}>⚠ {t('sevElevated')}</div>
                        </div>
                      </div>
                      <div className="bg-gray-800/60 rounded-full h-2.5 overflow-hidden mb-3">
                        <div className="h-full rounded-full transition-all" style={{width: `${(d.score/3)*100}%`, background: d.color}} />
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {d.facets.map(f => {
                          const fv = facetScores[f] || 0;
                          return (
                            <div key={f} className="flex items-center gap-1.5">
                              <div className="flex-1 text-[11px] text-gray-400 truncate">↳ {facetName(f, lang)}</div>
                              <div className="text-[11px] font-mono shrink-0" style={{color: SEV_CLR(fv)}}>{fv.toFixed(2)}</div>
                            </div>
                          );
                        })}
                      </div>
                      <button onClick={() => navigate(`/diag/${d.id}`)} className="mt-3 text-xs font-medium hover:underline underline-offset-2 transition-colors" style={{color: d.color + 'CC'}}>→ {t('diagLearnMore')}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subclinical — medium cards */}
          {diagnostics.filter(d => !d.flag && d.score >= 0.8).length > 0 && (
            <div className="mb-8">
              <div className="text-sm font-semibold text-gray-500 mb-4">{t('subclinical')}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {diagnostics.filter(d => !d.flag && d.score >= 0.8).map(d => {
                  const explanation = getDiagExplanation(d.id, lang);
                  const displayName = diagName(d.id, d.name, lang);
                  return (
                    <HoverTip key={d.id} text={explanation} wide block>
                      <div onClick={() => navigate(`/diag/${d.id}`)} className="cursor-pointer group rounded-xl border border-gray-700/40 bg-gray-900/40 p-4 hover:border-gray-600/60 hover:bg-gray-800/30 hover:shadow-lg hover:shadow-black/20 transition-all duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{background: d.color, opacity: 0.6}} />
                          <div className="text-sm font-medium text-gray-300 group-hover:text-gray-100 truncate transition-colors flex-1">{displayName.split('(')[0].trim()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full" style={{width: `${(d.score/3)*100}%`, background: d.color, opacity: 0.6}} />
                          </div>
                          <span className="text-sm font-mono font-bold text-gray-400">{d.score.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block" style={{background: '#374151', color: '#9CA3AF'}}>{t('sevMild')}</div>
                          <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">→ {t('diagLearnMore')}</span>
                        </div>
                      </div>
                    </HoverTip>
                  );
                })}
              </div>
            </div>
          )}

          {/* All profiles — compact summary */}
          <div className="bg-gray-900/40 rounded-2xl border border-gray-800/60 p-5">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">{t('diagProfilesTitle')} — {lang === 'en' ? 'all' : 'vše'}</div>
            <div className="space-y-2">
              {diagnostics.map(d => {
                const displayName = diagName(d.id, d.name, lang);
                return (
                  <HoverTip key={d.id} text={getDiagExplanation(d.id, lang)} wide block>
                    <div onClick={() => navigate(`/diag/${d.id}`)} className="cursor-pointer group flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-800/40 transition-all">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.flag ? d.color : '#374151' }} />
                      <div className="flex-1 text-sm truncate min-w-0 group-hover:text-gray-200 group-hover:underline underline-offset-2 transition-colors" style={{ color: d.flag ? d.color : '#6B7280' }}>{displayName.split('(')[0].trim()}</div>
                      <div className="flex-1 max-w-[120px] bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(d.score/3)*100}%`, background: d.color, opacity: d.flag ? 1 : 0.4 }} />
                      </div>
                      <div className="w-12 text-right text-sm font-mono shrink-0" style={{ color: d.flag ? d.color : '#6B7280' }}>{d.score.toFixed(2)}</div>
                      <div className="w-16 text-xs text-right shrink-0" style={{ color: d.flag ? d.color : '#4B5563' }}>{d.flag ? `⚠ ${t('sevElevated')}` : d.score >= 1.0 ? t('sevMild') : t('sevLow')}</div>
                    </div>
                  </HoverTip>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ SUMMARY PARAGRAPH — EXPANDED ═══ */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('summaryTitle')}</h3>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300 space-y-4">
            <p>{t('summaryIntro')}</p>

            {/* Domain analysis */}
            {(() => {
              const elevated = Object.entries(domainScores).filter(([, v]) => v >= 1.5).sort((a, b) => b[1] - a[1]);
              const mild = Object.entries(domainScores).filter(([, v]) => v >= 1.0 && v < 1.5);
              if (elevated.length > 0) {
                return <>
                  <p>{t('summaryDomains')} <strong>{elevated.map(([d, v]) => `${domainName(d, lang)} (${v.toFixed(2)})`).join(', ')}</strong>{mild.length > 0 ? `, ${lang === 'cs' ? 'a mírně zvýšené' : 'with mildly elevated'}: ${mild.map(([d, v]) => `${domainName(d, lang)} (${v.toFixed(2)})`).join(', ')}` : ''}.</p>
                  <p className="text-gray-400">{t('summaryDomainExplain')}</p>
                </>;
              }
              if (mild.length > 0) {
                return <>
                  <p>{t('summaryDomains')} <strong>{mild.map(([d, v]) => `${domainName(d, lang)} (${v.toFixed(2)})`).join(', ')}</strong> ({lang === 'cs' ? 'mírná úroveň' : 'mild level'}).</p>
                  <p className="text-gray-400">{t('summaryDomainExplain')}</p>
                </>;
              }
              return null;
            })()}

            {/* Top elevated facets */}
            {(() => {
              const topFacets = Object.entries(facetScores).filter(([, v]) => v >= 1.5).sort((a, b) => b[1] - a[1]).slice(0, 5);
              if (topFacets.length > 0) {
                return <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
                  <p className="font-medium text-gray-200 mb-2">{lang === 'cs' ? '🔍 Nejvýraznější facety:' : '🔍 Most prominent facets:'}</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-300">
                    {topFacets.map(([f, v]) => (
                      <li key={f}><strong>{facetName(f, lang)}</strong> ({v.toFixed(2)}) — <span className="text-gray-400">{metaDesc(FACET_META[f]?.desc, lang)}</span></li>
                    ))}
                  </ul>
                  <p className="text-gray-500 text-xs mt-2">{t('summaryFacetDetail')}</p>
                </div>;
              }
              return null;
            })()}

            {/* Diagnostic profiles explanation */}
            {diagnostics.filter(d => d.flag).length > 0 ? (
              <>
                <p>{t('summaryElevated')} <strong>{diagnostics.filter(d => d.flag).map(d => diagName(d.id, d.name, lang).split('(')[0].split('—')[0].trim()).join(', ')}</strong>.</p>
                <p className="text-gray-400">{t('summaryElevatedExplain')}</p>
              </>
            ) : (
              <p className="text-green-400/80">{t('summaryNoElevated')}</p>
            )}

            {/* What to do next */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/15">
              <p className="font-semibold text-purple-300 mb-2">💡 {t('summaryWhatNext')}</p>
              <p className="text-gray-300">{t('summaryWhatNextText')}</p>
            </div>

            <p className="text-amber-400/80 text-xs mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">{t('summaryNote')}</p>
          </div>
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">📦 {t('exportResults')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button onClick={() => exportPid5Report(domainScores, facetScores, diagnostics, DF_ALL)} className="p-4 rounded-xl bg-purple-900/40 border border-purple-500/30 hover:border-purple-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-purple-300">{t('fullReport')}</div>
              <div className="text-xs text-gray-500 mt-1">{t('fullReportDesc')}</div>
            </button>
            <button onClick={() => exportInstagramStory(domainScores, diagnostics)} className="p-4 rounded-xl bg-pink-900/40 border border-pink-500/30 hover:border-pink-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-pink-300">{t('instaStory')}</div>
              <div className="text-xs text-gray-500 mt-1">{t('instaStoryDesc')}</div>
            </button>
            <button onClick={() => exportQuickSummary(domainScores, facetScores, diagnostics, DF_ALL)} className="p-4 rounded-xl bg-amber-900/40 border border-amber-500/30 hover:border-amber-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-amber-300">{t('quickSummary')}</div>
              <div className="text-xs text-gray-500 mt-1">{t('quickSummaryDesc')}</div>
            </button>
            <button onClick={() => exportPid5AnswerSheet(answers, lang === 'en' ? Q_EN : Q, lang)} className="p-4 rounded-xl bg-green-900/40 border border-green-500/30 hover:border-green-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-green-300">📋 {t('answerSheet')}</div>
              <div className="text-xs text-gray-500 mt-1">{t('answerSheetDesc')}</div>
            </button>
            <button onClick={() => exportRawJson({ domeny: domainScores, facety: facetScores, diagnostika: diagnostics.map(d => ({id:d.id,name:d.name,score:d.score,flag:d.flag})), odpovedi: answers }, 'pid5_vysledky.json')} className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/60 transition-all text-left">
              <div className="text-sm font-semibold text-gray-300">{t('json')}</div>
              <div className="text-xs text-gray-500 mt-1">{t('jsonDesc')}</div>
            </button>
            <button onClick={() => shareCurrentResult('pid5')} className="p-4 rounded-xl bg-cyan-900/40 border border-cyan-500/30 hover:border-cyan-400/60 transition-all text-left relative">
              <div className="text-sm font-semibold text-cyan-300">{t('shareResult')}</div>
              <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? 'Unikátní odkaz' : 'Unique link'}</div>
            </button>
          </div>
        </div>

        {/* Share toast */}
        {shareToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium shadow-xl animate-bounce">{t('shareLink')}</div>
        )}

        <div className="flex gap-3 mb-12">
          <button onClick={() => { savePid5Result(); alert(t('resultSaved')); }} className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white font-semibold transition-all">{t('saveResult')}</button>
          <button onClick={() => setMode("menu")} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">{t('menu')}</button>
        </div>
      </div>
    </div>
  );

  // ── LPFS RESULTS ──
  if (mode === "lpfs_results" || mode === "shared_lpfs") return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setMode("menu")} className="text-gray-500 hover:text-gray-300 text-sm">{t('back')}</button>
          <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
        </div>
        <h2 className="text-3xl font-bold text-blue-300 mb-2">{t('lpfsResultsHeading')}</h2>
        {viewingSource === 'shared' && (
          <div className="mb-6 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
            <span className="text-xs text-cyan-400">🔗 {t('viewingSharedResult')}</span>
            <button onClick={() => { setViewingResult(null); setViewingSource(null); setMode('menu'); }} className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-800 transition-all">{t('close')}</button>
          </div>
        )}
        {viewingSource === 'saved' && viewingResult && (
          <div className="mb-6 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-sm flex items-center justify-between">
            <span>📂 {lang === 'cs' ? 'Zobrazujete uložený výsledek' : 'Viewing saved result'}{viewingResult.created_at ? ` (${new Date(viewingResult.created_at).toLocaleDateString(lang === 'cs' ? 'cs-CZ' : 'en-US')})` : ''}</span>
            <button onClick={() => { setViewingSource(null); setViewingResult(null); setMode('history'); }} className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs transition-all">✕ {lang === 'cs' ? 'Zavřít' : 'Close'}</button>
          </div>
        )}
        <p className="text-gray-400 mb-4">{t('filledItems')} {Object.keys(lpfsAns).length}/80 {t('items')}</p>
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
          <div className="text-center">
            <div className="text-6xl font-bold" style={{color: SEV_CLR(lpfsTotal)}}>{lpfsTotal.toFixed(2)}</div>
            <div className="text-gray-400 mt-2">{t('averageScore')}</div>
            <div className="text-lg mt-1" style={{color: SEV_CLR(lpfsTotal)}}>{SEV(lpfsTotal)}</div>
          </div>
        </div>
        {/* Subscales */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
          <h3 className="text-sm font-semibold text-blue-300 mb-4">{t('subscales')}</h3>
          {Object.entries(lpfsSubscaleScores).map(([sub, v]) => (
            <div key={sub} className="flex items-center gap-3 mb-3">
              <div className="w-32 text-sm font-medium text-blue-200">{lpfsSubName(sub, lang)}</div>
              <div className="flex-1 bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{width: `${(v/4)*100}%`}} />
              </div>
              <div className="w-10 text-right text-sm font-mono text-gray-300">{v.toFixed(2)}</div>
            </div>
          ))}
          <div className="border-t border-gray-700/30 pt-3 mt-3 flex gap-4 text-xs">
            <span className="text-purple-400">{t('selfFunctioning')}: {((lpfsSubscaleScores.identity + lpfsSubscaleScores.selfDirection) / 2).toFixed(2)}</span>
            <span className="text-pink-400">{t('interpersonal')}: {((lpfsSubscaleScores.empathy + lpfsSubscaleScores.intimacy) / 2).toFixed(2)}</span>
          </div>
        </div>
        {/* ═══ LPFS SUMMARY — EXPANDED ═══ */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('summaryTitle')}</h3>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300 space-y-4">
            <p>{t('summaryLpfsExplain')}</p>
            <p>{t('summaryLpfsIntro')} <strong className="text-xl" style={{color: SEV_CLR(lpfsTotal)}}>{lpfsTotal.toFixed(2)}</strong> ({SEV(lpfsTotal)})</p>
            {lpfsTotal >= 1.5 ? (
              <>
                <p>{t('summaryLpfsHigh')}</p>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(lpfsSubscaleScores).filter(([, v]) => v >= 1.5).sort((a, b) => b[1] - a[1]).map(([sub, v]) => (
                    <li key={sub}><strong>{lpfsSubName(sub, lang)}</strong>: {v.toFixed(2)} — <span className="text-gray-400">{(() => {
                      const hints = { identity: { cs: 'Stabilita sebeobrazu, sebeúcta a emoční regulace', en: 'Self-image stability, self-esteem, and emotional regulation' }, selfDirection: { cs: 'Schopnost stanovovat si cíle a řídit svůj život', en: 'Ability to set goals and direct your own life' }, empathy: { cs: 'Schopnost chápat perspektivu a pocity druhých', en: 'Ability to understand others\' perspectives and feelings' }, intimacy: { cs: 'Schopnost vytvářet a udržovat blízké vztahy', en: 'Ability to form and maintain close relationships' } };
                      return hints[sub]?.[lang] || hints[sub]?.cs || '';
                    })()}</span></li>
                  ))}
                </ul>
                <p className="text-gray-400">{t('summaryLpfsHighExplain')}</p>
              </>
            ) : (
              <>
                <p className="text-green-400/80">{t('summaryLpfsOk')}</p>
                <p className="text-gray-400">{t('summaryLpfsOkExplain')}</p>
              </>
            )}

            {/* What to do next */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/15">
              <p className="font-semibold text-blue-300 mb-2">💡 {t('summaryWhatNext')}</p>
              <p className="text-gray-300">{t('summaryWhatNextText')}</p>
            </div>

            <p className="text-amber-400/80 text-xs mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">{t('summaryNote')}</p>
          </div>
        </div>
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">{t('exportResults')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button onClick={() => exportLpfsReport(lpfsTotal, lpfsAns, lpfsSubscaleScores)} className="p-3 rounded-xl bg-blue-900/40 border border-blue-500/30 hover:border-blue-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-blue-300">{t('report')}</div>
              <div className="text-xs text-gray-500">{t('reportDesc')}</div>
            </button>
            <button onClick={() => exportLpfsAnswerSheet(lpfsAns, LPFS_Q, lang)} className="p-3 rounded-xl bg-green-900/40 border border-green-500/30 hover:border-green-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-green-300">📋 {t('answerSheet')}</div>
              <div className="text-xs text-gray-500">{t('answerSheetDesc')}</div>
            </button>
            <button onClick={() => exportRawJson({ prumer: lpfsTotal, subskaly: lpfsSubscaleScores, odpovedi: lpfsAns }, 'lpfs_vysledky.json')} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/60 transition-all text-left">
              <div className="text-sm font-semibold text-gray-300">{t('json')}</div>
              <div className="text-xs text-gray-500">{t('jsonDesc')}</div>
            </button>
            <button onClick={() => shareCurrentResult('lpfs')} className="p-3 rounded-xl bg-cyan-900/40 border border-cyan-500/30 hover:border-cyan-400/60 transition-all text-left">
              <div className="text-sm font-semibold text-cyan-300">{t('shareResult')}</div>
              <div className="text-xs text-gray-500">{lang === 'cs' ? 'Unikátní odkaz' : 'Unique link'}</div>
            </button>
          </div>
        </div>

        {/* Share toast */}
        {shareToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium shadow-xl animate-bounce">{t('shareLink')}</div>
        )}

        <div className="flex gap-3">
          <button onClick={() => { saveLpfsResult(); alert(t('resultSaved')); }} className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white font-semibold transition-all">{t('saveResult')}</button>
          <button onClick={() => setMode("menu")} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">{t('menu')}</button>
        </div>
      </div>
    </div>
  );

  // ═══ QUESTIONNAIRE UI ═══
  const isPid = mode === "pid5";
  const curQ = isPid ? (lang === 'en' ? Q_EN : Q) : LPFS_Q;
  const curI = isPid ? idx : lpfsIdx;
  const setCurI = isPid ? setIdx : setLpfsIdx;
  const curA = isPid ? answers : lpfsAns;
  const optLabelsCz = isPid ? ["0 — Zcela nepravdivé", "1 — Částečně nepravdivé", "2 — Částečně pravdivé", "3 — Zcela pravdivé"] : ["1 — Zcela nepravdivé", "2 — Trochu pravdivé", "3 — Převážně pravdivé", "4 — Zcela pravdivé"];
  const optLabelsEn = isPid ? ["0 — Very false or often false", "1 — Sometimes or somewhat false", "2 — Sometimes or somewhat true", "3 — Very true or often true"] : ["1 — Totally false", "2 — Somewhat true", "3 — Mostly true", "4 — Totally true"];
  const optLabels = lang === 'en' ? optLabelsEn : optLabelsCz;
  const optValues = isPid ? [0,1,2,3] : [1,2,3,4];
  const facets = isPid ? (REVERSE[curI] || []) : [];
  const domain = facets.length ? facetDomain(facets[0]) : null;
  const progress = (answered / (isPid ? Q.length : LPFS_Q.length)) * 100;
  const liveDiags = hoveredVal !== null ? previewDiagnostics : diagnostics;
  const questionHint = getQuestionHint(mode, curI, facets, lang);
  const lpfsSub = !isPid ? getLpfsSubscale(curI) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .scroll-thin::-webkit-scrollbar{width:4px} .scroll-thin::-webkit-scrollbar-track{background:transparent} .scroll-thin::-webkit-scrollbar-thumb{background:#374151;border-radius:2px}`}</style>
      <AuthModal />
      {/* Progress bar */}
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/60 px-4 py-2.5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <button onClick={() => setMode("menu")} className="hover:text-gray-300 transition-colors">{t('menu')}</button>
            <div className="flex items-center gap-3">
              <button onClick={toggleLang} className={`px-2 py-0.5 rounded text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`} title={t('keyE')}>{lang === 'en' ? 'EN' : 'CZ'}</button>
              <span className="font-mono">{answered}/{isPid ? Q.length : LPFS_Q.length}</span>
            </div>
          </div>
          <div className="w-full bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isPid ? 'bg-purple-500' : 'bg-blue-500'}`} style={{width: `${progress}%`}} />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* ═══ LEFT: Question card ═══ */}
          <div className="w-full lg:w-[440px] lg:shrink-0">
            {/* Domain / subscale tag */}
            {isPid && domain && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {facets.map(f => (
                  <HoverTip key={f} text={metaDesc(FACET_META[f]?.desc, lang)}>
                    <span className="text-xs px-2.5 py-1 rounded-full border cursor-help" style={{borderColor: DC[domain] + '60', color: DC[domain], background: DC[domain] + '15'}}>{facetName(f, lang)}</span>
                  </HoverTip>
                ))}
              </div>
            )}
            {!isPid && lpfsSub && (
              <div className="flex gap-2 mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full border border-blue-500/40 text-blue-300 bg-blue-500/10">
                  {lpfsSubName(lpfsSub, lang)}
                </span>
              </div>
            )}

            <div className={`rounded-2xl border p-5 md:p-6 ${isPid ? 'bg-purple-950/20 border-purple-500/15' : 'bg-blue-950/20 border-blue-500/15'}`}>
              <div className="text-gray-600 text-xs mb-2 font-mono">#{curI + 1}</div>
              <p className="text-base md:text-lg font-medium leading-relaxed mb-4 text-gray-100">{curQ[curI]}</p>

              {questionHint && (
                <div className="mb-4">
                  <button onClick={() => setShowHint(!showHint)} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                    <span>💡</span> {showHint ? t('hideHint') : t('showHint')}
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 rounded-xl bg-gray-800/30 border border-gray-700/20 text-xs" style={{animation: 'fadeIn .2s ease-out'}}>
                      <p className="text-gray-300 mb-1">{questionHint.hint}</p>
                      <p className="text-gray-500 italic">{questionHint.example}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                {optLabels.map((label, i) => {
                  const val = optValues[i];
                  const isSelected = curA[curI] === val;
                  return (
                    <button key={i} onClick={() => answer(val)} onMouseEnter={() => setHoveredVal(val)} onMouseLeave={() => setHoveredVal(null)}
                      className={`p-3 rounded-xl text-left transition-all border text-sm ${isSelected ? (isPid ? 'bg-purple-600/30 border-purple-400/50 text-purple-200' : 'bg-blue-600/30 border-blue-400/50 text-blue-200') : 'bg-gray-900/30 border-gray-700/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-800/30'}`}>
                      <span className="inline-flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500 text-xs font-mono border border-gray-600/30">{val}</kbd>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 gap-2">
              <button onClick={() => setCurI(Math.max(0, curI - 1))} disabled={curI === 0} className="text-sm text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors">{t('previous')}</button>
              <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({length: Math.min(10, Math.ceil((curI+1)/10)*10) - Math.floor(curI/10)*10}, (_, j) => {
                  const n = Math.floor(curI / 10) * 10 + j;
                  if (n >= curQ.length) return null;
                  const has = curA[n] !== undefined;
                  return <button key={n} onClick={() => setCurI(n)} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center transition-all ${n === curI ? (isPid ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white') : has ? 'bg-gray-700 text-gray-300' : 'bg-gray-800/40 text-gray-600'}`}>{n+1}</button>;
                })}
              </div>
              <button onClick={() => setCurI(Math.min(curQ.length - 1, curI + 1))} disabled={curI >= curQ.length - 1} className="text-sm text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors">{t('next')}</button>
            </div>

            {answered >= (isPid ? Q.length : LPFS_Q.length) && (
              <button onClick={() => setMode(isPid ? 'pid5_results' : 'lpfs_results')} className={`w-full mt-4 p-3.5 rounded-xl font-semibold transition-all ${isPid ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}`}>{t('showResults')}</button>
            )}
          </div>

          {/* ═══ RIGHT: Live dashboards ═══ */}
          <div className="flex-1 min-w-0 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto scroll-thin space-y-3">

            {/* PID-5 Live domain scores */}
            {isPid && (
              <div className="rounded-xl border border-purple-500/15 bg-purple-950/10 p-4">
                <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />{t('liveScores')}</span>
                  <span className="text-gray-600 font-mono">{Object.keys(answers).length}/220</span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(hoveredVal !== null ? previewDomainScores : domainScores).map(([d, v]) => {
                    const base = domainScores[d] || 0;
                    const diff = hoveredVal !== null ? v - base : 0;
                    return (
                      <HoverTip key={d} text={metaDesc(DOMAIN_META[d]?.desc, lang)} block>
                        <div className="flex items-center gap-2 cursor-help">
                          <div className="w-28 text-xs font-medium truncate" style={{color: DC[d]}}>{domainName(d, lang)}</div>
                          <div className="flex-1 bg-gray-800/60 rounded-full h-1.5 overflow-hidden relative">
                            <div className="absolute inset-0 h-full rounded-full transition-all duration-300" style={{width: `${(base/3)*100}%`, background: DC[d], opacity: hoveredVal !== null ? 0.35 : 1}} />
                            {hoveredVal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{width: `${(v/3)*100}%`, background: DC[d]}} />}
                          </div>
                          <div className="w-10 text-right text-xs font-mono text-gray-300">{v.toFixed(2)}</div>
                          <div className={`w-10 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-800'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : ''}</div>
                        </div>
                      </HoverTip>
                    );
                  })}
                </div>
                {facets.length > 0 && (
                  <div className="border-t border-gray-800/40 pt-2 mt-3 space-y-1">
                    <div className="text-xs text-gray-600 mb-1">{t('questionFacets')}</div>
                    {facets.map(f => {
                      const displayScores = hoveredVal !== null ? previewFacetScores : facetScores;
                      const v = displayScores[f] || 0;
                      const base = facetScores[f] || 0;
                      const diff = hoveredVal !== null ? v - base : 0;
                      return (
                        <HoverTip key={f} text={metaDesc(FACET_META[f]?.desc, lang)} block>
                          <div className="flex items-center gap-2 cursor-help">
                            <div className="w-28 text-xs text-gray-400 truncate">↳ {facetName(f, lang)}</div>
                            <div className="flex-1 bg-gray-800/60 rounded-full h-1 overflow-hidden relative">
                              <div className="absolute inset-0 h-full rounded-full transition-all duration-300" style={{width: `${(base/3)*100}%`, background: SEV_CLR(base), opacity: hoveredVal !== null ? 0.35 : 1}} />
                              {hoveredVal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{width: `${(v/3)*100}%`, background: SEV_CLR(v)}} />}
                            </div>
                            <div className="w-10 text-right text-xs font-mono text-gray-400">{v.toFixed(2)}</div>
                            <div className={`w-10 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-800'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : ''}</div>
                          </div>
                        </HoverTip>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PID-5 Live diagnostics */}
            {isPid && (
              <div className="rounded-xl border border-gray-700/20 bg-gray-900/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500 flex items-center gap-2"><span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />{t('diagProfilesTitle')}</div>
                  <button onClick={() => setShowDiagLive(!showDiagLive)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{showDiagLive ? '▾' : '▸'}</button>
                </div>
                {showDiagLive && (
                  <div className="space-y-0.5">
                    {liveDiags.map(d => {
                      const baseDiag = diagnostics.find(x => x.id === d.id);
                      const diff = baseDiag && hoveredVal !== null ? d.score - baseDiag.score : 0;
                      return (
                        <HoverTip key={d.id} text={getDiagExplanation(d.id, lang)} block>
                          <div className="flex items-center gap-1.5 py-0.5 cursor-help">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.flag ? d.color : '#374151' }} />
                            <div className="w-28 text-xs truncate" style={{ color: d.flag ? d.color : '#6B7280' }}>{diagName(d.id, d.name, lang).split('(')[0].split('—')[0].trim()}</div>
                            <div className="flex-1 bg-gray-800/60 rounded-full h-1 overflow-hidden relative">
                              <div className="absolute inset-0 h-full rounded-full transition-all duration-300" style={{ width: `${((baseDiag?.score || 0)/3)*100}%`, background: d.color, opacity: hoveredVal !== null ? 0.35 : 1 }} />
                              {hoveredVal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{ width: `${(d.score/3)*100}%`, background: d.color }} />}
                            </div>
                            <div className="w-8 text-right text-xs font-mono" style={{ color: d.flag ? d.color : '#6B7280' }}>{d.score.toFixed(2)}</div>
                            <div className={`w-8 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-800'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : ''}</div>
                          </div>
                        </HoverTip>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LPFS Live Dashboard */}
            {!isPid && (
              <div className="rounded-xl border border-blue-500/15 bg-blue-950/10 p-4">
                <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    {t('liveScoresLpfs')}
                  </span>
                  <span className="text-gray-600 font-mono">{Object.keys(lpfsAns).length}/80</span>
                </div>
                {/* Total */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-800/40">
                  <div className="w-20 text-xs font-medium text-blue-300">{t('total')}</div>
                  <div className="flex-1 bg-gray-800/60 rounded-full h-2 overflow-hidden relative">
                    <div className="absolute inset-0 h-full rounded-full transition-all" style={{width: `${(lpfsTotal/4)*100}%`, background: SEV_CLR(lpfsTotal), opacity: previewLpfsTotal !== null ? 0.35 : 1}} />
                    {previewLpfsTotal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{width: `${(previewLpfsTotal/4)*100}%`, background: SEV_CLR(previewLpfsTotal)}} />}
                  </div>
                  <div className="w-10 text-right text-sm font-mono font-bold" style={{color: SEV_CLR(previewLpfsTotal ?? lpfsTotal)}}>{(previewLpfsTotal ?? lpfsTotal).toFixed(2)}</div>
                  {previewLpfsTotal !== null && (() => { const diff = previewLpfsTotal - lpfsTotal; return <div className={`w-10 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-800'}`}>{diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : ''}</div>; })()}
                </div>
                {/* Subscales */}
                {Object.entries(previewLpfsSubscales).map(([sub, v]) => {
                  const base = lpfsSubscaleScores[sub] || 0;
                  const diff = previewLpfsTotal !== null ? v - base : 0;
                  return (
                    <div key={sub} className="flex items-center gap-2 mb-1.5">
                      <div className="w-24 text-xs text-blue-200/70 truncate">{lpfsSubName(sub, lang)}</div>
                      <div className="flex-1 bg-gray-800/60 rounded-full h-1 overflow-hidden relative">
                        <div className="absolute inset-0 h-full rounded-full" style={{width: `${(base/4)*100}%`, background: '#60A5FA', opacity: previewLpfsTotal !== null ? 0.35 : 1}} />
                        {previewLpfsTotal !== null && <div className="absolute inset-0 h-full rounded-full transition-all duration-200" style={{width: `${(v/4)*100}%`, background: '#60A5FA'}} />}
                      </div>
                      <div className="w-10 text-right text-xs font-mono text-gray-400">{v.toFixed(2)}</div>
                      <div className={`w-10 text-right text-xs font-mono ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-gray-800'}`}>
                        {diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Scoring Info panel */}
            <div>
              <button onClick={() => setShowScoringInfo(!showScoringInfo)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs transition-all border ${showScoringInfo ? 'bg-amber-950/20 border-amber-500/20 text-amber-300' : 'bg-gray-900/30 border-gray-800/40 text-gray-600 hover:text-gray-400 hover:border-gray-700'}`}>
                <span className="flex items-center gap-2"><span>{showScoringInfo ? '📖' : '📐'}</span>{t('sourcesFormulas')}</span>
                <span>{showScoringInfo ? '▾' : '▸'}</span>
              </button>
              {showScoringInfo && (
                <div className="mt-2 rounded-xl border border-amber-500/15 bg-amber-950/10 p-4 space-y-3 text-xs">
                  <div>
                    <div className="text-amber-300 font-semibold mb-1.5">{t('scoring')}</div>
                    <div className="text-gray-400 space-y-1">
                      <p>• <span className="text-gray-300">{t('scale')}</span> {isPid ? SCORING_INFO.pid5.scale : SCORING_INFO.lpfs.scale}</p>
                      {isPid ? <>
                        <p>• <span className="text-gray-300">{t('facet')}</span> {SCORING_INFO.pid5.facetFormula}</p>
                        <p>• <span className="text-gray-300">{t('domain')}</span> {SCORING_INFO.pid5.domainFormula}</p>
                        <p>• <span className="text-gray-300">{t('diagnostics')}</span> {SCORING_INFO.pid5.diagFormula}</p>
                      </> : <>
                        <p>• <span className="text-gray-300">{t('totalLabel')}</span> {SCORING_INFO.lpfs.totalFormula}</p>
                        <p>• <span className="text-gray-300">{t('subscalesLabel')}</span> {SCORING_INFO.lpfs.subscales}</p>
                      </>}
                    </div>
                  </div>
                  {isPid && facets.length > 0 && (
                    <div>
                      <div className="text-amber-300 font-semibold mb-1.5">{t('questionFacetsInfo')} #{curI + 1}</div>
                      {facets.map(f => { const meta = FACET_META[f]; if (!meta) return null; const src = SOURCES[meta.source]; return (
                        <div key={f} className="mb-2 p-2 rounded-lg bg-gray-900/40 border border-gray-700/20">
                          <div className="font-semibold text-gray-200">{facetName(f, lang)} <span className="text-gray-600">({meta.en})</span></div>
                          <p className="font-mono text-[11px] text-amber-400/80 bg-black/30 rounded px-2 py-1 mt-1">{meta.formulaExact}</p>
                          <p className="text-gray-500 mt-1">📚 {src?.url ? <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-400/70 hover:text-blue-300 underline underline-offset-2">{src.short}</a> : meta.source}</p>
                        </div>
                      ); })}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
