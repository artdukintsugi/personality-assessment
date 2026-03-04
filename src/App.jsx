import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { SOURCES, FACET_META, DOMAIN_META, SCORING_INFO } from './lib/scoring-meta';
import { getQuestionHint, getDiagExplanation, getLpfsSubscale, LPFS_SUBSCALE_NAMES, LPFS_SUBSCALES } from './lib/question-hints';
import { exportPid5Report, exportInstagramStory, exportQuickSummary, exportLpfsReport, exportRawJson, exportPid5AnswerSheet, exportLpfsAnswerSheet } from './lib/export-v2';
import { useAuth, saveResultToCloud, loadResultsFromCloud, deleteResultFromCloud } from './lib/auth';
import { Q, Q_EN, LPFS_Q, FM, DF, DF_ALL, DC, REVERSE_SCORED, DIAG_PROFILES, DIAG_DETAILS } from './data';
import { PHQ9_QUESTIONS, PHQ9_SCALE, PHQ9_SEVERITY, PHQ9_CRITICAL_ITEM } from './data/phq9';
import { GAD7_QUESTIONS, GAD7_SCALE, GAD7_SEVERITY } from './data/gad7';
import { DASS42_QUESTIONS, DASS42_SCALE, DASS42_SUBSCALES, DASS42_SEVERITY } from './data/dass42';
import { PCL5_QUESTIONS, PCL5_SCALE, PCL5_CLUSTERS, PCL5_CUTOFF, PCL5_SEVERITY, PCL5_DSM5_CRITERIA } from './data/pcl5';
import { CATI_QUESTIONS, CATI_SCALE, CATI_SUBSCALES, CATI_SUBSCALE_ITEMS, CATI_REVERSE_ITEMS, CATI_SEVERITY, scoreCATI } from './data/cati';
import { ISI_QUESTIONS, ISI_SCALE_SIMPLE, ISI_SEVERITY } from './data/isi';
import { ASRS_QUESTIONS, ASRS_SCALE, ASRS_SEVERITY, ASRS_SUBSCALES } from './data/asrs';
import { EAT26_QUESTIONS, EAT26_SCALE, EAT26_SEVERITY, EAT26_SUBSCALES, scoreEAT26, EAT26_REVERSE_ITEM } from './data/eat26';
import { MDQ_PART1, MDQ_PART2, MDQ_PART3, MDQ_PART3_SCALE, MDQ_YESNO, scoreMDQ, MDQ_TOTAL_ITEMS } from './data/mdq';
import { CUDITR_QUESTIONS, CUDITR_SCALES, CUDITR_SEVERITY, CUDITR_CUTOFF, CUDITR_SCALE_SIMPLE, scoreCUDITR } from './data/cuditr';
import { AUDIT_QUESTIONS, AUDIT_SCALES, AUDIT_SEVERITY, AUDIT_CUTOFF, AUDIT_SUBSCALES, scoreAUDIT, Q910_SCORE_MAP } from './data/audit';
import { DAST10_QUESTIONS, DAST10_SCALE, DAST10_SEVERITY, DAST10_REVERSE_ITEM, DAST10_CUTOFF, scoreDAST10 } from './data/dast10';
import { ITQ_QUESTIONS, ITQ_SCALE, ITQ_CLUSTERS, ITQ_SEVERITY, scoreITQ, diagnoseITQ } from './data/itq';
import { QuestionnaireScreen } from './components/GenericQuestionnaire';
import PHQ9Results from './components/PHQ9Results';
import GAD7Results from './components/GAD7Results';
import DASS42Results from './components/DASS42Results';
import PCL5Results from './components/PCL5Results';
import CATIResults from './components/CATIResults';
import ISIResults from './components/ISIResults';
import ASRSResults from './components/ASRSResults';
import EAT26Results from './components/EAT26Results';
import MDQResults from './components/MDQResults';
import CUDITRResults from './components/CUDITRResults';
import AUDITResults from './components/AUDITResults';
import DAST10Results from './components/DAST10Results';
import ITQResults from './components/ITQResults';
import PatientProfile from './components/PatientProfile';
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

/**
 * ═══ VALIDITY ASSESSMENT ═══
 * Checks response patterns for indicators of invalid or questionable data.
 * Based on psychometric best practices for PID-5 and self-report measures.
 */
function checkPid5Validity(answers) {
  const checks = [];
  const total = 220;
  const answered = Object.keys(answers).length;
  const vals = Object.values(answers);
  
  // 1. Completeness
  const completeness = answered / total;
  if (completeness < 1) {
    checks.push({ id: 'completeness', status: completeness < 0.8 ? 'fail' : 'warn', value: Math.round(completeness * 100) });
  } else {
    checks.push({ id: 'completeness', status: 'pass', value: 100 });
  }
  
  // 2. Straight-lining (same answer > 80%)
  const freq = [0, 0, 0, 0];
  vals.forEach(v => { if (v >= 0 && v <= 3) freq[v]++; });
  const maxFreq = Math.max(...freq);
  const maxPct = answered > 0 ? maxFreq / answered : 0;
  const dominantVal = freq.indexOf(maxFreq);
  if (maxPct > 0.80) {
    checks.push({ id: 'straightLining', status: 'fail', value: Math.round(maxPct * 100), detail: dominantVal });
  } else if (maxPct > 0.60) {
    checks.push({ id: 'straightLining', status: 'warn', value: Math.round(maxPct * 100), detail: dominantVal });
  } else {
    checks.push({ id: 'straightLining', status: 'pass', value: Math.round(maxPct * 100) });
  }
  
  // 3. Response variability (standard deviation)
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const variance = vals.length ? vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length : 0;
  const sd = Math.sqrt(variance);
  if (sd < 0.4) {
    checks.push({ id: 'variability', status: 'fail', value: sd.toFixed(2) });
  } else if (sd < 0.6) {
    checks.push({ id: 'variability', status: 'warn', value: sd.toFixed(2) });
  } else {
    checks.push({ id: 'variability', status: 'pass', value: sd.toFixed(2) });
  }
  
  // 4. Reverse-item consistency
  // Check if reverse-scored items are answered consistently with their facet direction
  let inconsistentPairs = 0;
  let totalPairs = 0;
  for (const item of REVERSE_SCORED) {
    const facets = REVERSE[item];
    if (!facets) continue;
    for (const f of facets) {
      const fItems = FM[f];
      if (!fItems) continue;
      const regularItems = fItems.filter(i => !REVERSE_SCORED.has(i) && answers[i] !== undefined);
      if (regularItems.length === 0 || answers[item] === undefined) continue;
      const reversedVal = 3 - answers[item];
      const regularMean = regularItems.reduce((a, i) => a + answers[i], 0) / regularItems.length;
      totalPairs++;
      if (Math.abs(reversedVal - regularMean) > 2.0) inconsistentPairs++;
    }
  }
  const inconsistencyRate = totalPairs > 0 ? inconsistentPairs / totalPairs : 0;
  if (inconsistencyRate > 0.5) {
    checks.push({ id: 'reverseConsistency', status: 'fail', value: Math.round(inconsistencyRate * 100) });
  } else if (inconsistencyRate > 0.25) {
    checks.push({ id: 'reverseConsistency', status: 'warn', value: Math.round(inconsistencyRate * 100) });
  } else {
    checks.push({ id: 'reverseConsistency', status: 'pass', value: Math.round(inconsistencyRate * 100) });
  }
  
  // 5. Over-reporting (mean > 2.3 on 0-3 scale → almost everything "true")
  if (mean > 2.3) {
    checks.push({ id: 'overReporting', status: 'fail', value: mean.toFixed(2) });
  } else if (mean > 2.0) {
    checks.push({ id: 'overReporting', status: 'warn', value: mean.toFixed(2) });
  } else {
    checks.push({ id: 'overReporting', status: 'pass', value: mean.toFixed(2) });
  }
  
  // 6. Under-reporting (mean < 0.3 → almost everything "false")
  if (mean < 0.3) {
    checks.push({ id: 'underReporting', status: 'fail', value: mean.toFixed(2) });
  } else if (mean < 0.5) {
    checks.push({ id: 'underReporting', status: 'warn', value: mean.toFixed(2) });
  } else {
    checks.push({ id: 'underReporting', status: 'pass', value: mean.toFixed(2) });
  }
  
  // Overall verdict
  const fails = checks.filter(c => c.status === 'fail').length;
  const warns = checks.filter(c => c.status === 'warn').length;
  let verdict = 'valid';
  if (fails >= 2 || checks.some(c => c.id === 'straightLining' && c.status === 'fail')) verdict = 'invalid';
  else if (fails >= 1 || warns >= 2) verdict = 'questionable';
  else if (warns >= 1) verdict = 'acceptable';
  
  return { checks, verdict, mean: mean.toFixed(2), sd: sd.toFixed(2) };
}

function checkLpfsValidity(lpfsAns) {
  const checks = [];
  const total = 80;
  const answered = Object.keys(lpfsAns).length;
  const vals = Object.values(lpfsAns);
  
  // 1. Completeness
  const completeness = answered / total;
  if (completeness < 1) {
    checks.push({ id: 'completeness', status: completeness < 0.8 ? 'fail' : 'warn', value: Math.round(completeness * 100) });
  } else {
    checks.push({ id: 'completeness', status: 'pass', value: 100 });
  }
  
  // 2. Straight-lining (LPFS scale 1-4)
  const freq = [0, 0, 0, 0, 0]; // index 0 unused, 1-4 used
  vals.forEach(v => { if (v >= 1 && v <= 4) freq[v]++; });
  const maxFreq = Math.max(freq[1], freq[2], freq[3], freq[4]);
  const maxPct = answered > 0 ? maxFreq / answered : 0;
  const dominantVal = freq.indexOf(maxFreq);
  if (maxPct > 0.80) {
    checks.push({ id: 'straightLining', status: 'fail', value: Math.round(maxPct * 100), detail: dominantVal });
  } else if (maxPct > 0.60) {
    checks.push({ id: 'straightLining', status: 'warn', value: Math.round(maxPct * 100), detail: dominantVal });
  } else {
    checks.push({ id: 'straightLining', status: 'pass', value: Math.round(maxPct * 100) });
  }
  
  // 3. Response variability
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const variance = vals.length ? vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length : 0;
  const sd = Math.sqrt(variance);
  if (sd < 0.35) {
    checks.push({ id: 'variability', status: 'fail', value: sd.toFixed(2) });
  } else if (sd < 0.55) {
    checks.push({ id: 'variability', status: 'warn', value: sd.toFixed(2) });
  } else {
    checks.push({ id: 'variability', status: 'pass', value: sd.toFixed(2) });
  }
  
  // 4. Subscale consistency — check if subscale scores are wildly different (not an invalidity per se, but worth noting)
  // Skip for validity, just use variability
  
  // 5. Over-reporting (mean > 3.3 on 1-4 scale)
  if (mean > 3.3) {
    checks.push({ id: 'overReporting', status: 'fail', value: mean.toFixed(2) });
  } else if (mean > 3.0) {
    checks.push({ id: 'overReporting', status: 'warn', value: mean.toFixed(2) });
  } else {
    checks.push({ id: 'overReporting', status: 'pass', value: mean.toFixed(2) });
  }
  
  // 6. Under-reporting (mean < 1.3 on 1-4 scale)
  if (mean < 1.3) {
    checks.push({ id: 'underReporting', status: 'fail', value: mean.toFixed(2) });
  } else if (mean < 1.5) {
    checks.push({ id: 'underReporting', status: 'warn', value: mean.toFixed(2) });
  } else {
    checks.push({ id: 'underReporting', status: 'pass', value: mean.toFixed(2) });
  }
  
  // Overall verdict
  const fails = checks.filter(c => c.status === 'fail').length;
  const warns = checks.filter(c => c.status === 'warn').length;
  let verdict = 'valid';
  if (fails >= 2 || checks.some(c => c.id === 'straightLining' && c.status === 'fail')) verdict = 'invalid';
  else if (fails >= 1 || warns >= 2) verdict = 'questionable';
  else if (warns >= 1) verdict = 'acceptable';
  
  return { checks, verdict, mean: mean.toFixed(2), sd: sd.toFixed(2) };
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
const LS_KEYS = { answers: 'diag_pid5_answers', idx: 'diag_pid5_idx', lpfsAns: 'diag_lpfs_answers', lpfsIdx: 'diag_lpfs_idx', history: 'diag_results_history', lang: 'diag_lang', onboarded: 'diag_onboarded', phq9Ans: 'diag_phq9_answers', phq9Idx: 'diag_phq9_idx', gad7Ans: 'diag_gad7_answers', gad7Idx: 'diag_gad7_idx', dass42Ans: 'diag_dass42_answers', dass42Idx: 'diag_dass42_idx', pcl5Ans: 'diag_pcl5_answers', pcl5Idx: 'diag_pcl5_idx', catiAns: 'diag_cati_answers', catiIdx: 'diag_cati_idx', isiAns: 'diag_isi_answers', isiIdx: 'diag_isi_idx', asrsAns: 'diag_asrs_answers', asrsIdx: 'diag_asrs_idx', eat26Ans: 'diag_eat26_answers', eat26Idx: 'diag_eat26_idx', mdqAns: 'diag_mdq_answers', mdqIdx: 'diag_mdq_idx', cuditrAns: 'diag_cuditr_answers', cuditrIdx: 'diag_cuditr_idx', auditAns: 'diag_audit_answers', auditIdx: 'diag_audit_idx', dast10Ans: 'diag_dast10_answers', dast10Idx: 'diag_dast10_idx', itqAns: 'diag_itq_answers', itqIdx: 'diag_itq_idx' };
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
    if (p === '/phq9') return 'phq9';
    if (p === '/gad7') return 'gad7';
    if (p === '/dass42') return 'dass42';
    if (p === '/pcl5') return 'pcl5';
    if (p === '/cati') return 'cati';
    if (p === '/isi') return 'isi';
    if (p === '/asrs') return 'asrs';
    if (p === '/eat26') return 'eat26';
    if (p === '/mdq') return 'mdq';
    if (p === '/cuditr') return 'cuditr';
    if (p === '/audit') return 'audit';
    if (p === '/dast10') return 'dast10';
    if (p === '/itq') return 'itq';
    if (p === '/pid5/results') return 'pid5_results';
    if (p === '/lpfs/results') return 'lpfs_results';
    if (p === '/phq9/results') return 'phq9_results';
    if (p === '/gad7/results') return 'gad7_results';
    if (p === '/dass42/results') return 'dass42_results';
    if (p === '/pcl5/results') return 'pcl5_results';
    if (p === '/cati/results') return 'cati_results';
    if (p === '/isi/results') return 'isi_results';
    if (p === '/asrs/results') return 'asrs_results';
    if (p === '/eat26/results') return 'eat26_results';
    if (p === '/mdq/results') return 'mdq_results';
    if (p === '/cuditr/results') return 'cuditr_results';
    if (p === '/audit/results') return 'audit_results';
    if (p === '/dast10/results') return 'dast10_results';
    if (p === '/itq/results') return 'itq_results';
    if (p === '/sources') return 'sources';
    if (p === '/history') return 'history';
    if (p === '/profile') return 'profile';
    if (p.startsWith('/r/pid5/')) return 'shared_pid5';
    if (p.startsWith('/r/lpfs/')) return 'shared_lpfs';
    if (p.startsWith('/diag/')) return 'diag_detail';
    return 'menu';
  }, [location.pathname]);

  const setMode = useCallback((m) => {
    const routes = { menu: '/', pid5: '/pid5', lpfs: '/lpfs', phq9: '/phq9', gad7: '/gad7', dass42: '/dass42', pcl5: '/pcl5', cati: '/cati', isi: '/isi', asrs: '/asrs', eat26: '/eat26', mdq: '/mdq', cuditr: '/cuditr', audit: '/audit', dast10: '/dast10', itq: '/itq', pid5_results: '/pid5/results', lpfs_results: '/lpfs/results', phq9_results: '/phq9/results', gad7_results: '/gad7/results', dass42_results: '/dass42/results', pcl5_results: '/pcl5/results', cati_results: '/cati/results', isi_results: '/isi/results', asrs_results: '/asrs/results', eat26_results: '/eat26/results', mdq_results: '/mdq/results', cuditr_results: '/cuditr/results', audit_results: '/audit/results', dast10_results: '/dast10/results', itq_results: '/itq/results', history: '/history', profile: '/profile', sources: '/sources' };
    navigate(routes[m] || '/');
  }, [navigate]);
  const [idx, setIdx] = useState(() => lsGet(LS_KEYS.idx, 0));
  const [answers, setAnswers] = useState(() => lsGet(LS_KEYS.answers, {}));
  const [lpfsIdx, setLpfsIdx] = useState(() => lsGet(LS_KEYS.lpfsIdx, 0));
  const [lpfsAns, setLpfsAns] = useState(() => lsGet(LS_KEYS.lpfsAns, {}));
  // New questionnaires state
  const [phq9Ans, setPhq9Ans] = useState(() => lsGet(LS_KEYS.phq9Ans, {}));
  const [phq9Idx, setPhq9Idx] = useState(() => lsGet(LS_KEYS.phq9Idx, 0));
  const [gad7Ans, setGad7Ans] = useState(() => lsGet(LS_KEYS.gad7Ans, {}));
  const [gad7Idx, setGad7Idx] = useState(() => lsGet(LS_KEYS.gad7Idx, 0));
  const [dass42Ans, setDass42Ans] = useState(() => lsGet(LS_KEYS.dass42Ans, {}));
  const [dass42Idx, setDass42Idx] = useState(() => lsGet(LS_KEYS.dass42Idx, 0));
  const [pcl5Ans, setPcl5Ans] = useState(() => lsGet(LS_KEYS.pcl5Ans, {}));
  const [pcl5Idx, setPcl5Idx] = useState(() => lsGet(LS_KEYS.pcl5Idx, 0));
  const [catiAns, setCatiAns] = useState(() => lsGet(LS_KEYS.catiAns, {}));
  const [catiIdx, setCatiIdx] = useState(() => lsGet(LS_KEYS.catiIdx, 0));
  const [isiAns, setIsiAns] = useState(() => lsGet(LS_KEYS.isiAns, {}));
  const [isiIdx, setIsiIdx] = useState(() => lsGet(LS_KEYS.isiIdx, 0));
  const [asrsAns, setAsrsAns] = useState(() => lsGet(LS_KEYS.asrsAns, {}));
  const [asrsIdx, setAsrsIdx] = useState(() => lsGet(LS_KEYS.asrsIdx, 0));
  const [eat26Ans, setEat26Ans] = useState(() => lsGet(LS_KEYS.eat26Ans, {}));
  const [eat26Idx, setEat26Idx] = useState(() => lsGet(LS_KEYS.eat26Idx, 0));
  const [mdqAns, setMdqAns] = useState(() => lsGet(LS_KEYS.mdqAns, {}));
  const [mdqIdx, setMdqIdx] = useState(() => lsGet(LS_KEYS.mdqIdx, 0));
  const [cuditrAns, setCuditrAns] = useState(() => lsGet(LS_KEYS.cuditrAns, {}));
  const [cuditrIdx, setCuditrIdx] = useState(() => lsGet(LS_KEYS.cuditrIdx, 0));
  const [auditAns, setAuditAns] = useState(() => lsGet(LS_KEYS.auditAns, {}));
  const [auditIdx, setAuditIdx] = useState(() => lsGet(LS_KEYS.auditIdx, 0));
  const [dast10Ans, setDast10Ans] = useState(() => lsGet(LS_KEYS.dast10Ans, {}));
  const [dast10Idx, setDast10Idx] = useState(() => lsGet(LS_KEYS.dast10Idx, 0));
  const [itqAns, setItqAns] = useState(() => lsGet(LS_KEYS.itqAns, {}));
  const [itqIdx, setItqIdx] = useState(() => lsGet(LS_KEYS.itqIdx, 0));
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
  const [showOnboarding, setShowOnboarding] = useState(() => !lsGet(LS_KEYS.onboarded, false));
  const [onboardStep, setOnboardStep] = useState(0);
  const t = useMemo(() => createT(lang), [lang]);
  const SEV = useCallback((v) => sevLabel(v, lang), [lang]);

  useEffect(() => { lsSet(LS_KEYS.lang, lang); }, [lang]);
  useEffect(() => { lsSet(LS_KEYS.answers, answers); }, [answers]);
  useEffect(() => { lsSet(LS_KEYS.idx, idx); }, [idx]);
  useEffect(() => { lsSet(LS_KEYS.lpfsAns, lpfsAns); }, [lpfsAns]);
  useEffect(() => { lsSet(LS_KEYS.lpfsIdx, lpfsIdx); }, [lpfsIdx]);
  useEffect(() => { lsSet(LS_KEYS.history, history); }, [history]);
  useEffect(() => { lsSet(LS_KEYS.phq9Ans, phq9Ans); }, [phq9Ans]);
  useEffect(() => { lsSet(LS_KEYS.phq9Idx, phq9Idx); }, [phq9Idx]);
  useEffect(() => { lsSet(LS_KEYS.gad7Ans, gad7Ans); }, [gad7Ans]);
  useEffect(() => { lsSet(LS_KEYS.gad7Idx, gad7Idx); }, [gad7Idx]);
  useEffect(() => { lsSet(LS_KEYS.dass42Ans, dass42Ans); }, [dass42Ans]);
  useEffect(() => { lsSet(LS_KEYS.dass42Idx, dass42Idx); }, [dass42Idx]);
  useEffect(() => { lsSet(LS_KEYS.pcl5Ans, pcl5Ans); }, [pcl5Ans]);
  useEffect(() => { lsSet(LS_KEYS.pcl5Idx, pcl5Idx); }, [pcl5Idx]);
  useEffect(() => { lsSet(LS_KEYS.catiAns, catiAns); }, [catiAns]);
  useEffect(() => { lsSet(LS_KEYS.catiIdx, catiIdx); }, [catiIdx]);
  useEffect(() => { lsSet(LS_KEYS.isiAns, isiAns); }, [isiAns]);
  useEffect(() => { lsSet(LS_KEYS.isiIdx, isiIdx); }, [isiIdx]);
  useEffect(() => { lsSet(LS_KEYS.asrsAns, asrsAns); }, [asrsAns]);
  useEffect(() => { lsSet(LS_KEYS.asrsIdx, asrsIdx); }, [asrsIdx]);
  useEffect(() => { lsSet(LS_KEYS.eat26Ans, eat26Ans); }, [eat26Ans]);
  useEffect(() => { lsSet(LS_KEYS.eat26Idx, eat26Idx); }, [eat26Idx]);
  useEffect(() => { lsSet(LS_KEYS.mdqAns, mdqAns); }, [mdqAns]);
  useEffect(() => { lsSet(LS_KEYS.mdqIdx, mdqIdx); }, [mdqIdx]);
  useEffect(() => { lsSet(LS_KEYS.cuditrAns, cuditrAns); }, [cuditrAns]);
  useEffect(() => { lsSet(LS_KEYS.cuditrIdx, cuditrIdx); }, [cuditrIdx]);
  useEffect(() => { lsSet(LS_KEYS.auditAns, auditAns); }, [auditAns]);
  useEffect(() => { lsSet(LS_KEYS.auditIdx, auditIdx); }, [auditIdx]);
  useEffect(() => { lsSet(LS_KEYS.dast10Ans, dast10Ans); }, [dast10Ans]);
  useEffect(() => { lsSet(LS_KEYS.dast10Idx, dast10Idx); }, [dast10Idx]);
  useEffect(() => { lsSet(LS_KEYS.itqAns, itqAns); }, [itqAns]);
  useEffect(() => { lsSet(LS_KEYS.itqIdx, itqIdx); }, [itqIdx]);

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

  const savePhq9Result = useCallback(() => {
    const total = Object.values(phq9Ans).reduce((a,b) => a+b, 0);
    const sev = PHQ9_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('phq9', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, odpovedi: phq9Ans } });
  }, [phq9Ans, saveToHistory]);

  const saveGad7Result = useCallback(() => {
    const total = Object.values(gad7Ans).reduce((a,b) => a+b, 0);
    const sev = GAD7_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('gad7', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, odpovedi: gad7Ans } });
  }, [gad7Ans, saveToHistory]);

  const saveDass42Result = useCallback(() => {
    const total = Object.values(dass42Ans).reduce((a,b) => a+b, 0);
    saveToHistory('dass42', { score: total, fullData: { score: total, odpovedi: dass42Ans } });
  }, [dass42Ans, saveToHistory]);

  const savePcl5Result = useCallback(() => {
    const total = Object.values(pcl5Ans).reduce((a,b) => a+b, 0);
    saveToHistory('pcl5', { score: total, cutoffMet: total >= PCL5_CUTOFF, fullData: { score: total, cutoffMet: total >= PCL5_CUTOFF, odpovedi: pcl5Ans } });
  }, [pcl5Ans, saveToHistory]);

  const saveCatiResult = useCallback(() => {
    const { total, subscales } = scoreCATI(catiAns);
    const sev = CATI_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('cati', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, subscales, odpovedi: catiAns } });
  }, [catiAns, saveToHistory]);

  const saveIsiResult = useCallback(() => {
    const total = Object.values(isiAns).reduce((a,b) => a+b, 0);
    const sev = ISI_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('isi', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, odpovedi: isiAns } });
  }, [isiAns, saveToHistory]);

  const saveAsrsResult = useCallback(() => {
    const total = Object.values(asrsAns).reduce((a,b) => a+b, 0);
    const sev = ASRS_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('asrs', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, odpovedi: asrsAns } });
  }, [asrsAns, saveToHistory]);

  const saveEat26Result = useCallback(() => {
    const total = scoreEAT26(eat26Ans);
    const sev = EAT26_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('eat26', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, odpovedi: eat26Ans } });
  }, [eat26Ans, saveToHistory]);

  const saveMdqResult = useCallback(() => {
    const { part1Yes, part2Yes, part3Severity, positive } = scoreMDQ(mdqAns);
    saveToHistory('mdq', { score: part1Yes, positive, fullData: { part1Yes, part2Yes, part3Severity, positive, odpovedi: mdqAns } });
  }, [mdqAns, saveToHistory]);

  const saveCuditrResult = useCallback(() => {
    const total = scoreCUDITR(cuditrAns);
    const sev = CUDITR_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('cuditr', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, odpovedi: cuditrAns } });
  }, [cuditrAns, saveToHistory]);

  const saveAuditResult = useCallback(() => {
    const total = scoreAUDIT(auditAns);
    const sev = AUDIT_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('audit', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, odpovedi: auditAns } });
  }, [auditAns, saveToHistory]);

  const saveDast10Result = useCallback(() => {
    const total = scoreDAST10(dast10Ans);
    const sev = DAST10_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('dast10', { score: total, severity: sev?.key, fullData: { score: total, severity: sev?.key, odpovedi: dast10Ans } });
  }, [dast10Ans, saveToHistory]);

  const saveItqResult = useCallback(() => {
    const total = scoreITQ(itqAns);
    const dx = diagnoseITQ(itqAns);
    const sev = ITQ_SEVERITY.find(s => total >= s.min && total <= s.max);
    saveToHistory('itq', { score: total, severity: sev?.key, diagnosis: dx.diagnosis, fullData: { score: total, severity: sev?.key, diagnosis: dx.diagnosis, odpovedi: itqAns } });
  }, [itqAns, saveToHistory]);

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
    } else if (fd?.odpovedi) {
      // Generic handler for new test types (phq9, gad7, dass42, pcl5, cati, isi)
      const typeMap = {
        phq9: { setAns: setPhq9Ans, setIdx: setPhq9Idx, count: 9, results: 'phq9_results' },
        gad7: { setAns: setGad7Ans, setIdx: setGad7Idx, count: 7, results: 'gad7_results' },
        dass42: { setAns: setDass42Ans, setIdx: setDass42Idx, count: 42, results: 'dass42_results' },
        pcl5: { setAns: setPcl5Ans, setIdx: setPcl5Idx, count: 20, results: 'pcl5_results' },
        cati: { setAns: setCatiAns, setIdx: setCatiIdx, count: 42, results: 'cati_results' },
        isi: { setAns: setIsiAns, setIdx: setIsiIdx, count: 7, results: 'isi_results' },
        asrs: { setAns: setAsrsAns, setIdx: setAsrsIdx, count: 6, results: 'asrs_results' },
        eat26: { setAns: setEat26Ans, setIdx: setEat26Idx, count: 26, results: 'eat26_results' },
        mdq: { setAns: setMdqAns, setIdx: setMdqIdx, count: 15, results: 'mdq_results' },
        cuditr: { setAns: setCuditrAns, setIdx: setCuditrIdx, count: 8, results: 'cuditr_results' },
        audit: { setAns: setAuditAns, setIdx: setAuditIdx, count: 10, results: 'audit_results' },
        dast10: { setAns: setDast10Ans, setIdx: setDast10Idx, count: 10, results: 'dast10_results' },
        itq: { setAns: setItqAns, setIdx: setItqIdx, count: 18, results: 'itq_results' },
      };
      const cfg = typeMap[result.type];
      if (cfg) {
        cfg.setAns(fd.odpovedi);
        cfg.setIdx(cfg.count - 1);
        setViewingResult(result);
        setViewingSource('saved');
        setMode(cfg.results);
      }
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
  const fillSamplePhq9 = useCallback(() => { const s = {}; for (let i = 0; i < 9; i++) s[i] = Math.floor(Math.random() * 4); setPhq9Ans(s); setPhq9Idx(8); setMode("phq9_results"); }, []);
  const fillSampleGad7 = useCallback(() => { const s = {}; for (let i = 0; i < 7; i++) s[i] = Math.floor(Math.random() * 4); setGad7Ans(s); setGad7Idx(6); setMode("gad7_results"); }, []);
  const fillSampleDass42 = useCallback(() => { const s = {}; for (let i = 0; i < 42; i++) s[i] = Math.floor(Math.random() * 4); setDass42Ans(s); setDass42Idx(41); setMode("dass42_results"); }, []);
  const fillSamplePcl5 = useCallback(() => { const s = {}; for (let i = 0; i < 20; i++) s[i] = Math.floor(Math.random() * 5); setPcl5Ans(s); setPcl5Idx(19); setMode("pcl5_results"); }, []);
  const fillSampleCati = useCallback(() => { const s = {}; for (let i = 0; i < 42; i++) s[i] = Math.floor(Math.random() * 5) + 1; setCatiAns(s); setCatiIdx(41); setMode("cati_results"); }, []);
  const fillSampleIsi = useCallback(() => { const s = {}; for (let i = 0; i < 7; i++) s[i] = Math.floor(Math.random() * 5); setIsiAns(s); setIsiIdx(6); setMode("isi_results"); }, []);
  const fillSampleAsrs = useCallback(() => { const s = {}; for (let i = 0; i < 6; i++) s[i] = Math.floor(Math.random() * 5); setAsrsAns(s); setAsrsIdx(5); setMode("asrs_results"); }, []);
  const fillSampleEat26 = useCallback(() => { const s = {}; for (let i = 0; i < 26; i++) s[i] = Math.floor(Math.random() * 6); setEat26Ans(s); setEat26Idx(25); setMode("eat26_results"); }, []);
  const fillSampleMdq = useCallback(() => { const s = {}; for (let i = 0; i < 13; i++) s[i] = Math.random() > 0.5 ? 0 : 1; s[13] = Math.random() > 0.5 ? 0 : 1; s[14] = Math.floor(Math.random() * 4); setMdqAns(s); setMdqIdx(14); setMode("mdq_results"); }, []);
  const fillSampleCuditr = useCallback(() => { const s = {}; for (let i = 0; i < 7; i++) s[i] = Math.floor(Math.random() * 5); s[7] = Math.floor(Math.random() * 3); setCuditrAns(s); setCuditrIdx(7); setMode("cuditr_results"); }, []);
  const fillSampleAudit = useCallback(() => { const s = {}; for (let i = 0; i < 8; i++) s[i] = Math.floor(Math.random() * 5); s[8] = Math.floor(Math.random() * 3); s[9] = Math.floor(Math.random() * 3); setAuditAns(s); setAuditIdx(9); setMode("audit_results"); }, []);
  const fillSampleDast10 = useCallback(() => { const s = {}; for (let i = 0; i < 10; i++) s[i] = Math.random() > 0.5 ? 1 : 0; setDast10Ans(s); setDast10Idx(9); setMode("dast10_results"); }, []);
  const fillSampleItq = useCallback(() => { const s = {}; for (let i = 0; i < 18; i++) s[i] = Math.floor(Math.random() * 5); setItqAns(s); setItqIdx(17); setMode("itq_results"); }, []);

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

  // ═══ ONBOARDING POPUP ═══
  const ONBOARD_STEPS = useMemo(() => lang === 'cs' ? [
    { icon: '🧠', title: 'Vítejte v psychodiagnostice', desc: 'Tato aplikace obsahuje 15 vědecky validovaných screeningových dotazníků pro sebeposouzení osobnosti, nálady, úzkosti, traumatu a dalších oblastí duševního zdraví.' },
    { icon: '📋', title: 'Jak to funguje', desc: 'Vyberte si dotazník, odpovídejte na otázky a na konci uvidíte své výsledky s podrobným skórováním. Odpovědi se automaticky ukládají — můžete se kdykoliv vrátit a pokračovat.' },
    { icon: '🔗', title: 'Cross-reference analýza', desc: 'Po vyplnění více dotazníků systém automaticky analyzuje vztahy mezi vašimi výsledky — například jak spolu souvisí deprese, úzkost a nespavost.' },
    { icon: '🔒', title: 'Soukromí a bezpečnost', desc: 'Vaše data jsou uložena pouze lokálně ve vašem prohlížeči. Po přihlášení se synchronizují do cloudu a zpřístupní Klinický profil. Žádná data nesdílíme s třetími stranami.' },
    { icon: '⚕️', title: 'Důležité upozornění', desc: 'Tato aplikace je sebeposuzovací screeningový nástroj a nepředstavuje klinickou diagnózu. Pro odborné posouzení vždy konzultujte klinického psychologa nebo psychiatra.' },
  ] : [
    { icon: '🧠', title: 'Welcome to Psychodiagnostics', desc: 'This app contains 15 scientifically validated self-report screening questionnaires for personality, mood, anxiety, trauma, and other mental health domains.' },
    { icon: '📋', title: 'How It Works', desc: 'Choose a questionnaire, answer the questions, and see your results with detailed scoring at the end. Answers are saved automatically — you can return and continue anytime.' },
    { icon: '🔗', title: 'Cross-Reference Analysis', desc: 'After completing multiple questionnaires, the system automatically analyzes relationships between your results — e.g., how depression, anxiety, and insomnia are interconnected.' },
    { icon: '🔒', title: 'Privacy & Security', desc: 'Your data is stored locally in your browser only. After signing in, data syncs to the cloud and unlocks the Clinical Profile. We never share data with third parties.' },
    { icon: '⚕️', title: 'Important Notice', desc: 'This app is a self-report screening tool and does not constitute a clinical diagnosis. Always consult a clinical psychologist or psychiatrist for professional assessment.' },
  ], [lang]);

  const OnboardingModal = () => showOnboarding && (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => {}}>
      <div className="bg-gray-900 border border-gray-700/60 rounded-3xl p-0 w-full max-w-md overflow-hidden shadow-2xl shadow-purple-500/10">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5 pb-2">
          {ONBOARD_STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === onboardStep ? 'w-6 bg-purple-400' : i < onboardStep ? 'w-1.5 bg-purple-400/50' : 'w-1.5 bg-gray-700'}`} />
          ))}
        </div>
        {/* Content */}
        <div className="px-8 py-6 text-center">
          <div className="text-5xl mb-4">{ONBOARD_STEPS[onboardStep].icon}</div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">{ONBOARD_STEPS[onboardStep].title}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{ONBOARD_STEPS[onboardStep].desc}</p>
        </div>
        {/* Buttons */}
        <div className="px-8 pb-6 flex gap-3">
          {onboardStep > 0 && (
            <button onClick={() => setOnboardStep(s => s - 1)} className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-all">
              ← {lang === 'cs' ? 'Zpět' : 'Back'}
            </button>
          )}
          {onboardStep < ONBOARD_STEPS.length - 1 ? (
            <button onClick={() => setOnboardStep(s => s + 1)} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all">
              {lang === 'cs' ? 'Další' : 'Next'} →
            </button>
          ) : (
            <button onClick={() => { setShowOnboarding(false); lsSet(LS_KEYS.onboarded, true); }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all">
              {lang === 'cs' ? 'Začít používat' : 'Get Started'} ✨
            </button>
          )}
        </div>
        {/* Skip */}
        {onboardStep < ONBOARD_STEPS.length - 1 && (
          <div className="text-center pb-5">
            <button onClick={() => { setShowOnboarding(false); lsSet(LS_KEYS.onboarded, true); }} className="text-xs text-gray-600 hover:text-gray-400 transition-all">
              {lang === 'cs' ? 'Přeskočit úvod' : 'Skip intro'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── MENU ──
  if (mode === "menu") return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <AuthModal />
      <OnboardingModal />

      {/* ═══ HERO SECTION ═══ */}
      <div className="relative overflow-hidden">
        {/* Gradient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-purple-500/8 via-pink-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-8 pb-4 md:pt-12 relative">
          {/* Top bar: help + lang */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => { setShowOnboarding(true); setOnboardStep(0); }} className="text-xs text-gray-600 hover:text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-800/60 transition-all flex items-center gap-1.5">
              <span className="text-sm">❓</span> {lang === 'cs' ? 'Jak to funguje' : 'How it works'}
            </button>
            <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
          </div>

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              {lang === 'cs' ? '15 validovaných nástrojů' : '15 validated instruments'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-4 leading-tight">{t('appTitle')}</h1>
            <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              {lang === 'cs' 
                ? 'Komplexní screeningová psychodiagnostika s automatickou analýzou cross-referencí mezi výsledky.'
                : 'Comprehensive screening psychodiagnostics with automatic cross-reference analysis between results.'}
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { icon: '🧠', label: lang === 'cs' ? 'Osobnost' : 'Personality' },
              { icon: '💭', label: lang === 'cs' ? 'Nálada' : 'Mood' },
              { icon: '⚡', label: lang === 'cs' ? 'Trauma' : 'Trauma' },
              { icon: '🧩', label: lang === 'cs' ? 'Neurovývoj' : 'Neurodevelopment' },
              { icon: '🍷', label: lang === 'cs' ? 'Substance' : 'Substances' },
              { icon: '🔗', label: lang === 'cs' ? 'Cross-reference' : 'Cross-reference' },
            ].map(f => (
              <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/60 border border-gray-700/40 text-xs text-gray-400">
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-8 md:pb-12">

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

        {/* Patient Profile Button — auth only */}
        {auth?.user && (history.length > 0 || cloudResults.length > 0) && (
          <button onClick={() => setMode('profile')} className="w-full mb-6 p-5 rounded-2xl bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-purple-900/20 border border-cyan-500/20 hover:border-cyan-400/40 transition-all text-left group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <div className="text-lg font-semibold text-cyan-300 group-hover:text-cyan-200 transition-colors">{lang === 'cs' ? 'Klinický profil' : 'Clinical Profile'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{lang === 'cs' ? 'Přehled výsledků, cross-reference a historie' : 'Results overview, cross-references & history'}</div>
                </div>
              </div>
              <span className="text-gray-600 group-hover:text-gray-400 text-lg">→</span>
            </div>
          </button>
        )}

        {/* ═══ Personality Assessment ═══ */}
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-3 px-1">
            <span className="h-px flex-1 bg-gray-800" />
            <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">{lang === 'cs' ? 'Osobnostní diagnostika' : 'Personality Assessment'}</span>
            <span className="h-px flex-1 bg-gray-800" />
          </div>
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

        {/* ═══ Clinical Screening Tools ═══ */}
        <div className="mb-2 mt-6">
          <div className="flex items-center gap-3 mb-3 px-1">
            <span className="h-px flex-1 bg-gray-800" />
            <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">{lang === 'cs' ? 'Klinický screening' : 'Clinical Screening'}</span>
            <span className="h-px flex-1 bg-gray-800" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* PHQ-9 */}
          <button onClick={() => setMode("phq9")} className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/20 hover:border-emerald-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-emerald-300 group-hover:text-emerald-200 transition-colors">PHQ-9</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '9 otázek — deprese' : '9 items — depression'}</div>
            {Object.keys(phq9Ans).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${(Object.keys(phq9Ans).length/9)*100}%`}} /></div>
                <span className="text-xs text-emerald-400 shrink-0">{Object.keys(phq9Ans).length}/9</span>
              </div>
            )}
          </button>
          {/* GAD-7 */}
          <button onClick={() => setMode("gad7")} className="p-4 rounded-2xl bg-gradient-to-br from-teal-900/40 to-teal-800/20 border border-teal-500/20 hover:border-teal-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-teal-300 group-hover:text-teal-200 transition-colors">GAD-7</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '7 otázek — úzkost' : '7 items — anxiety'}</div>
            {Object.keys(gad7Ans).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{width: `${(Object.keys(gad7Ans).length/7)*100}%`}} /></div>
                <span className="text-xs text-teal-400 shrink-0">{Object.keys(gad7Ans).length}/7</span>
              </div>
            )}
          </button>
          {/* DASS-42 */}
          <button onClick={() => setMode("dass42")} className="p-4 rounded-2xl bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-500/20 hover:border-orange-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-orange-300 group-hover:text-orange-200 transition-colors">DASS-42</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '42 otázek — deprese, úzkost, stres' : '42 items — depression, anxiety, stress'}</div>
            {Object.keys(dass42Ans).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{width: `${(Object.keys(dass42Ans).length/42)*100}%`}} /></div>
                <span className="text-xs text-orange-400 shrink-0">{Object.keys(dass42Ans).length}/42</span>
              </div>
            )}
          </button>
          {/* PCL-5 */}
          <button onClick={() => setMode("pcl5")} className="p-4 rounded-2xl bg-gradient-to-br from-rose-900/40 to-rose-800/20 border border-rose-500/20 hover:border-rose-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-rose-300 group-hover:text-rose-200 transition-colors">PCL-5</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '20 otázek — PTSD' : '20 items — PTSD'}</div>
            {Object.keys(pcl5Ans).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-rose-500 rounded-full" style={{width: `${(Object.keys(pcl5Ans).length/20)*100}%`}} /></div>
                <span className="text-xs text-rose-400 shrink-0">{Object.keys(pcl5Ans).length}/20</span>
              </div>
            )}
          </button>
          {/* CATI */}
          <button onClick={() => setMode("cati")} className="p-4 rounded-2xl bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-500/20 hover:border-violet-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-violet-300 group-hover:text-violet-200 transition-colors">CATI</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '42 otázek — autistické rysy' : '42 items — autistic traits'}</div>
            {Object.keys(catiAns).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{width: `${(Object.keys(catiAns).length/42)*100}%`}} /></div>
                <span className="text-xs text-violet-400 shrink-0">{Object.keys(catiAns).length}/42</span>
              </div>
            )}
          </button>
          {/* ISI */}
          <button onClick={() => setMode("isi")} className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 border border-indigo-500/20 hover:border-indigo-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors">ISI</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '7 otázek — nespavost' : '7 items — insomnia'}</div>
            {Object.keys(isiAns).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${(Object.keys(isiAns).length/7)*100}%`}} /></div>
                <span className="text-xs text-indigo-400 shrink-0">{Object.keys(isiAns).length}/7</span>
              </div>
            )}
          </button>
          {/* ASRS */}
          <button onClick={() => setMode("asrs")} className="p-4 rounded-2xl bg-gradient-to-br from-sky-900/40 to-sky-800/20 border border-sky-500/20 hover:border-sky-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-sky-300 group-hover:text-sky-200 transition-colors">ASRS</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '6 otázek — ADHD' : '6 items — ADHD'}</div>
            {Object.keys(asrsAns).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{width: `${(Object.keys(asrsAns).length/6)*100}%`}} /></div>
                <span className="text-xs text-sky-400 shrink-0">{Object.keys(asrsAns).length}/6</span>
              </div>
            )}
          </button>
          {/* EAT-26 */}
          <button onClick={() => setMode("eat26")} className="p-4 rounded-2xl bg-gradient-to-br from-pink-900/40 to-pink-800/20 border border-pink-500/20 hover:border-pink-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-pink-300 group-hover:text-pink-200 transition-colors">EAT-26</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '26 otázek — poruchy příjmu potravy' : '26 items — eating disorders'}</div>
            {Object.keys(eat26Ans).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-pink-500 rounded-full" style={{width: `${(Object.keys(eat26Ans).length/26)*100}%`}} /></div>
                <span className="text-xs text-pink-400 shrink-0">{Object.keys(eat26Ans).length}/26</span>
              </div>
            )}
          </button>
          {/* MDQ */}
          <button onClick={() => setMode("mdq")} className="p-4 rounded-2xl bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-500/20 hover:border-amber-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-amber-300 group-hover:text-amber-200 transition-colors">MDQ</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '15 otázek — bipolární porucha' : '15 items — bipolar disorder'}</div>
            {Object.keys(mdqAns).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{width: `${(Object.keys(mdqAns).length/15)*100}%`}} /></div>
                <span className="text-xs text-amber-400 shrink-0">{Object.keys(mdqAns).length}/15</span>
              </div>
            )}
          </button>
          {/* CUDIT-R */}
          <button onClick={() => setMode("cuditr")} className="p-4 rounded-2xl bg-gradient-to-br from-lime-900/40 to-lime-800/20 border border-lime-500/20 hover:border-lime-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-lime-300 group-hover:text-lime-200 transition-colors">CUDIT-R</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '8 otázek — konopí' : '8 items — cannabis'}</div>
            {Object.keys(cuditrAns).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-lime-500 rounded-full" style={{width: `${(Object.keys(cuditrAns).length/8)*100}%`}} /></div>
                <span className="text-xs text-lime-400 shrink-0">{Object.keys(cuditrAns).length}/8</span>
              </div>
            )}
          </button>
          {/* AUDIT */}
          <button onClick={() => setMode("audit")} className="p-4 rounded-2xl bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-500/20 hover:border-yellow-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-yellow-300 group-hover:text-yellow-200 transition-colors">AUDIT</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '10 otázek — alkohol' : '10 items — alcohol'}</div>
            {Object.keys(auditAns).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{width: `${(Object.keys(auditAns).length/10)*100}%`}} /></div>
                <span className="text-xs text-yellow-400 shrink-0">{Object.keys(auditAns).length}/10</span>
              </div>
            )}
          </button>
          {/* DAST-10 */}
          <button onClick={() => setMode("dast10")} className="p-4 rounded-2xl bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/20 hover:border-red-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-red-300 group-hover:text-red-200 transition-colors">DAST-10</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '10 otázek — drogy' : '10 items — drug use'}</div>
            {Object.keys(dast10Ans).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{width: `${(Object.keys(dast10Ans).length/10)*100}%`}} /></div>
                <span className="text-xs text-red-400 shrink-0">{Object.keys(dast10Ans).length}/10</span>
              </div>
            )}
          </button>
          {/* ITQ */}
          <button onClick={() => setMode("itq")} className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-900/40 to-fuchsia-800/20 border border-fuchsia-500/20 hover:border-fuchsia-400/40 transition-all text-left group">
            <div className="text-sm font-semibold text-fuchsia-300 group-hover:text-fuchsia-200 transition-colors">ITQ</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? '18 otázek — CPTSD (ICD-11)' : '18 items — CPTSD (ICD-11)'}</div>
            {Object.keys(itqAns).length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-1 overflow-hidden"><div className="h-full bg-fuchsia-500 rounded-full" style={{width: `${(Object.keys(itqAns).length/18)*100}%`}} /></div>
                <span className="text-xs text-fuchsia-400 shrink-0">{Object.keys(itqAns).length}/18</span>
              </div>
            )}
          </button>
        </div>

        {/* Quick result buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.keys(answers).length === 220 && <button onClick={() => setMode("pid5_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">{t('pid5Results')}</button>}
          {Object.keys(lpfsAns).length === 80 && <button onClick={() => setMode("lpfs_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">{t('lpfsResults')}</button>}
          {Object.keys(phq9Ans).length === 9 && <button onClick={() => setMode("phq9_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 PHQ-9</button>}
          {Object.keys(gad7Ans).length === 7 && <button onClick={() => setMode("gad7_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 GAD-7</button>}
          {Object.keys(dass42Ans).length === 42 && <button onClick={() => setMode("dass42_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 DASS-42</button>}
          {Object.keys(pcl5Ans).length === 20 && <button onClick={() => setMode("pcl5_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 PCL-5</button>}
          {Object.keys(catiAns).length === 42 && <button onClick={() => setMode("cati_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 CATI</button>}
          {Object.keys(isiAns).length === 7 && <button onClick={() => setMode("isi_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 ISI</button>}
          {Object.keys(asrsAns).length === 6 && <button onClick={() => setMode("asrs_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 ASRS</button>}
          {Object.keys(eat26Ans).length === 26 && <button onClick={() => setMode("eat26_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 EAT-26</button>}
          {Object.keys(mdqAns).length === 15 && <button onClick={() => setMode("mdq_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 MDQ</button>}
          {Object.keys(cuditrAns).length === 8 && <button onClick={() => setMode("cuditr_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 CUDIT-R</button>}
          {Object.keys(auditAns).length === 10 && <button onClick={() => setMode("audit_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 AUDIT</button>}
          {Object.keys(dast10Ans).length === 10 && <button onClick={() => setMode("dast10_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 DAST-10</button>}
          {Object.keys(itqAns).length === 18 && <button onClick={() => setMode("itq_results")} className="p-3 rounded-xl bg-green-900/30 border border-green-500/20 text-green-400 text-sm font-medium hover:border-green-400/40 transition-all">📊 ITQ</button>}
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
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          h.type === 'pid5' ? 'bg-purple-500/20 text-purple-400' :
                          h.type === 'lpfs' ? 'bg-blue-500/20 text-blue-400' :
                          h.type === 'phq9' ? 'bg-emerald-500/20 text-emerald-400' :
                          h.type === 'gad7' ? 'bg-teal-500/20 text-teal-400' :
                          h.type === 'dass42' ? 'bg-orange-500/20 text-orange-400' :
                          h.type === 'pcl5' ? 'bg-rose-500/20 text-rose-400' :
                          h.type === 'cati' ? 'bg-violet-500/20 text-violet-400' :
                          h.type === 'isi' ? 'bg-indigo-500/20 text-indigo-400' :
                          h.type === 'asrs' ? 'bg-sky-500/20 text-sky-400' :
                          h.type === 'eat26' ? 'bg-pink-500/20 text-pink-400' :
                          h.type === 'mdq' ? 'bg-amber-500/20 text-amber-400' :
                          h.type === 'cuditr' ? 'bg-lime-500/20 text-lime-400' :
                          h.type === 'audit' ? 'bg-yellow-500/20 text-yellow-400' :
                          h.type === 'dast10' ? 'bg-red-500/20 text-red-400' :
                          h.type === 'itq' ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{
                          { pid5: 'PID-5', lpfs: 'LPFS', phq9: 'PHQ-9', gad7: 'GAD-7', dass42: 'DASS-42', pcl5: 'PCL-5', cati: 'CATI', isi: 'ISI' }[h.type] || h.type
                        }</span>
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
                    {['phq9','gad7','dass42','pcl5','cati','isi','asrs','eat26','cuditr','audit','dast10','itq'].includes(h.type) && h.score != null && (
                      <div className="text-xs text-gray-400 mb-3">{lang === 'cs' ? 'Skóre' : 'Score'}: {h.score}{h.severity ? ` — ${h.severity}` : ''}</div>
                    )}
                    {h.type === 'mdq' && (
                      <div className="text-xs mb-3" style={{ color: h.positive ? '#F87171' : '#4ADE80' }}>
                        {h.positive ? (lang === 'cs' ? '⚠️ Pozitivní screening' : '⚠️ Positive Screen') : (lang === 'cs' ? '✓ Negativní screening' : '✓ Negative Screen')}
                      </div>
                    )}
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
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                              cr.type === 'pid5' ? 'bg-purple-500/20 text-purple-400' :
                              cr.type === 'lpfs' ? 'bg-blue-500/20 text-blue-400' :
                              cr.type === 'phq9' ? 'bg-emerald-500/20 text-emerald-400' :
                              cr.type === 'gad7' ? 'bg-teal-500/20 text-teal-400' :
                              cr.type === 'dass42' ? 'bg-orange-500/20 text-orange-400' :
                              cr.type === 'pcl5' ? 'bg-rose-500/20 text-rose-400' :
                              cr.type === 'cati' ? 'bg-violet-500/20 text-violet-400' :
                              cr.type === 'isi' ? 'bg-indigo-500/20 text-indigo-400' :
                              cr.type === 'asrs' ? 'bg-sky-500/20 text-sky-400' :
                              cr.type === 'eat26' ? 'bg-pink-500/20 text-pink-400' :
                              cr.type === 'mdq' ? 'bg-amber-500/20 text-amber-400' :
                              cr.type === 'cuditr' ? 'bg-lime-500/20 text-lime-400' :
                              cr.type === 'audit' ? 'bg-yellow-500/20 text-yellow-400' :
                              cr.type === 'dast10' ? 'bg-red-500/20 text-red-400' :
                              cr.type === 'itq' ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>{
                              { pid5: 'PID-5', lpfs: 'LPFS', phq9: 'PHQ-9', gad7: 'GAD-7', dass42: 'DASS-42', pcl5: 'PCL-5', cati: 'CATI', isi: 'ISI', asrs: 'ASRS', eat26: 'EAT-26', mdq: 'MDQ', cuditr: 'CUDIT-R' }[cr.type] || cr.type
                            }</span>
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
        <details className="mt-6 pt-4 border-t border-gray-800/40">
          <summary className="text-xs text-gray-700 mb-2 cursor-pointer hover:text-gray-500 transition-all">{t('debug')}</summary>
          <div className="grid grid-cols-4 gap-2 mb-2 mt-2">
            <button onClick={fillSample} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 PID-5</button>
            <button onClick={fillSampleLpfs} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 LPFS</button>
            <button onClick={fillSamplePhq9} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 PHQ-9</button>
            <button onClick={fillSampleGad7} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 GAD-7</button>
            <button onClick={fillSampleDass42} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 DASS</button>
            <button onClick={fillSamplePcl5} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 PCL-5</button>
            <button onClick={fillSampleCati} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 CATI</button>
            <button onClick={fillSampleIsi} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 ISI</button>
            <button onClick={fillSampleAsrs} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 ASRS</button>
            <button onClick={fillSampleEat26} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 EAT</button>
            <button onClick={fillSampleMdq} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 MDQ</button>
            <button onClick={fillSampleCuditr} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 CUDIT</button>
            <button onClick={fillSampleAudit} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 AUDIT</button>
            <button onClick={fillSampleDast10} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 DAST</button>
            <button onClick={fillSampleItq} className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/40 text-gray-600 text-xs hover:text-gray-400 hover:border-gray-700 transition-all">🎲 ITQ</button>
          </div>
          <button onClick={() => { setAnswers({}); setIdx(0); setLpfsAns({}); setLpfsIdx(0); setPhq9Ans({}); setPhq9Idx(0); setGad7Ans({}); setGad7Idx(0); setDass42Ans({}); setDass42Idx(0); setPcl5Ans({}); setPcl5Idx(0); setCatiAns({}); setCatiIdx(0); setIsiAns({}); setIsiIdx(0); setAsrsAns({}); setAsrsIdx(0); setEat26Ans({}); setEat26Idx(0); setMdqAns({}); setMdqIdx(0); setCuditrAns({}); setCuditrIdx(0); setAuditAns({}); setAuditIdx(0); setDast10Ans({}); setDast10Idx(0); setItqAns({}); setItqIdx(0); }} className="w-full p-2 rounded-lg bg-gray-900/40 border border-red-900/20 text-gray-600 text-xs hover:text-red-400 hover:border-red-800 transition-all">{t('reset')} 🗑️</button>
        </details>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800/30 text-center">
          <p className="text-xs text-gray-700 leading-relaxed max-w-md mx-auto">
            {lang === 'cs' 
              ? 'Sebeposuzovací screeningový nástroj. Nepředstavuje klinickou diagnózu. Pro odborné posouzení konzultujte klinického psychologa nebo psychiatra.'
              : 'Self-report screening tool. Does not constitute a clinical diagnosis. Consult a clinical psychologist or psychiatrist for professional assessment.'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-800">
            <span>PID-5</span><span>·</span><span>LPFS-SR</span><span>·</span><span>PHQ-9</span><span>·</span><span>GAD-7</span><span>·</span><span>DASS-42</span><span>·</span><span>PCL-5</span><span>·</span><span>CATI</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-1 text-xs text-gray-800">
            <span>ISI</span><span>·</span><span>ASRS</span><span>·</span><span>EAT-26</span><span>·</span><span>MDQ</span><span>·</span><span>CUDIT-R</span><span>·</span><span>AUDIT</span><span>·</span><span>DAST-10</span><span>·</span><span>ITQ</span>
          </div>
          <button onClick={() => setMode('sources')} className="mt-4 text-xs text-purple-500/60 hover:text-purple-400 transition-all">
            📚 {lang === 'cs' ? 'Zdroje a reference' : 'Sources & References'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── PATIENT PROFILE (auth-gated) ──
  if (mode === "profile") {
    if (!auth?.user) {
      // Not logged in — show login prompt
      return (
        <div className="min-h-screen bg-gray-950 text-white font-sans flex items-center justify-center p-4">
          <AuthModal />
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-200 mb-2">{lang === 'cs' ? 'Přihlášení vyžadováno' : 'Login Required'}</h2>
            <p className="text-sm text-gray-500 mb-6">{lang === 'cs' ? 'Klinický profil je dostupný pouze pro přihlášené uživatele. Vaše data jsou bezpečně uložena na vašem účtu.' : 'Clinical profile is only available for logged-in users. Your data is securely stored in your account.'}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setAuthForm('login')} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all">{lang === 'cs' ? 'Přihlásit se' : 'Log in'}</button>
              <button onClick={() => setMode('menu')} className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-all">{lang === 'cs' ? 'Zpět' : 'Back'}</button>
            </div>
          </div>
        </div>
      );
    }
    // Merge local history + cloud results into unified list for profile
    const cloudAsHistory = cloudResults.map(cr => ({
      id: cr.id,
      type: cr.type,
      date: cr.created_at,
      score: cr.data?.score ?? cr.data?.fullData?.score ?? undefined,
      severity: cr.data?.severity ?? cr.data?.fullData?.severity ?? undefined,
      positive: cr.data?.positive ?? cr.data?.fullData?.positive ?? undefined,
      topDiags: cr.data?.topDiags ?? cr.data?.fullData?.topDiags ?? undefined,
      fullData: cr.data?.fullData || cr.data,
      _source: 'cloud',
    }));
    // Deduplicate: prefer cloud version if same id exists, otherwise merge
    const localWithSource = history.map(h => ({ ...h, _source: 'local' }));
    const allResults = [...cloudAsHistory, ...localWithSource];
    // Dedupe by type+date (keep latest per type, but preserve all for timeline)
    const seen = new Set();
    const dedupedResults = allResults.filter(h => {
      const key = `${h.type}_${h.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <PatientProfile
        history={dedupedResults}
        lang={lang}
        toggleLang={toggleLang}
        onBack={() => setMode('menu')}
        onGoToTest={(test) => setMode(test)}
        onViewResult={(h) => viewSavedResult(h)}
        userEmail={auth.user.email}
      />
    );
  }

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

        {/* ═══ VALIDITY ASSESSMENT ═══ */}
        {(() => {
          const v = checkPid5Validity(answers);
          const ico = { pass: '✅', warn: '⚠️', fail: '❌' };
          const clr = { pass: 'text-green-400', warn: 'text-amber-400', fail: 'text-red-400' };
          const bg = { pass: 'bg-green-950/20 border-green-500/20', warn: 'bg-amber-950/20 border-amber-500/20', fail: 'bg-red-950/20 border-red-500/20' };
          const verdictColors = { valid: 'text-green-400 bg-green-950/30 border-green-500/30', acceptable: 'text-cyan-400 bg-cyan-950/30 border-cyan-500/30', questionable: 'text-amber-400 bg-amber-950/30 border-amber-500/30', invalid: 'text-red-400 bg-red-950/30 border-red-500/30' };
          const verdictIcons = { valid: '✅', acceptable: '🟢', questionable: '⚠️', invalid: '❌' };
          const desc = (c) => {
            const descs = {
              completeness: { cs: `Zodpovězeno ${c.value}% položek (doporučeno 100%).`, en: `Answered ${c.value}% of items (100% recommended).` },
              straightLining: { cs: `Nejběžnější odpověď '${c.detail}' použita v ${c.value}% případů.${c.status !== 'pass' ? ' Naznačuje možné nepozorné odpovídání.' : ''}`, en: `Most common answer '${c.detail}' used in ${c.value}% of items.${c.status !== 'pass' ? ' Suggests possible inattentive responding.' : ''}` },
              variability: { cs: `Směrodatná odchylka ${c.value} (čím nižší, tím uniformnější odpovědi).`, en: `Standard deviation ${c.value} (lower = more uniform responses).` },
              reverseConsistency: { cs: `Nekonzistence u ${c.value}% reverzních položek.${c.status !== 'pass' ? ' Naznačuje nepozornost nebo nepochopení.' : ''}`, en: `Inconsistency in ${c.value}% of reverse-scored items.${c.status !== 'pass' ? ' Suggests inattention or misunderstanding.' : ''}` },
              overReporting: { cs: `Průměr odpovědí ${c.value}/3.${c.status !== 'pass' ? ' Nadměrně vysoký — vše označeno jako "pravdivé".' : ''}`, en: `Response mean ${c.value}/3.${c.status !== 'pass' ? ' Excessively high — almost everything marked as "true".' : ''}` },
              underReporting: { cs: `Průměr odpovědí ${c.value}/3.${c.status !== 'pass' ? ' Nadměrně nízký — vše označeno jako "nepravdivé".' : ''}`, en: `Response mean ${c.value}/3.${c.status !== 'pass' ? ' Excessively low — almost everything marked as "false".' : ''}` },
            };
            return descs[c.id]?.[lang] || '';
          };
          return (
            <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">🔍 {t('validityTitle')}</h3>
              
              {/* Verdict badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-5 ${verdictColors[v.verdict]}`}>
                <span className="text-lg">{verdictIcons[v.verdict]}</span>
                <div>
                  <div className="font-semibold text-sm">{t('verdict_' + v.verdict)}</div>
                  <div className="text-xs opacity-70">{t('verdictDesc_' + v.verdict)}</div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-4 mb-5 text-xs text-gray-500">
                <span>{t('validityMean')}: <strong className="text-gray-300 font-mono">{v.mean}</strong></span>
                <span>{t('validitySD')}: <strong className="text-gray-300 font-mono">{v.sd}</strong></span>
              </div>
              
              {/* Individual checks */}
              <div className="space-y-2">
                {v.checks.map(c => (
                  <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border ${bg[c.status]}`}>
                    <span className="text-base shrink-0">{ico[c.status]}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${clr[c.status]}`}>{t('validity_' + c.id)}</div>
                      <div className="text-xs text-gray-500">{desc(c)}</div>
                    </div>
                    <div className={`text-sm font-mono shrink-0 ${clr[c.status]}`}>{c.value}{c.id === 'completeness' || c.id === 'straightLining' || c.id === 'reverseConsistency' ? '%' : ''}</div>
                  </div>
                ))}
              </div>
              
              <p className="text-gray-600 text-xs mt-4">{t('validityExplain')}</p>
            </div>
          );
        })()}

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

        {/* ═══ LPFS VALIDITY ASSESSMENT ═══ */}
        {(() => {
          const v = checkLpfsValidity(lpfsAns);
          const ico = { pass: '✅', warn: '⚠️', fail: '❌' };
          const clr = { pass: 'text-green-400', warn: 'text-amber-400', fail: 'text-red-400' };
          const bg = { pass: 'bg-green-950/20 border-green-500/20', warn: 'bg-amber-950/20 border-amber-500/20', fail: 'bg-red-950/20 border-red-500/20' };
          const verdictColors = { valid: 'text-green-400 bg-green-950/30 border-green-500/30', acceptable: 'text-cyan-400 bg-cyan-950/30 border-cyan-500/30', questionable: 'text-amber-400 bg-amber-950/30 border-amber-500/30', invalid: 'text-red-400 bg-red-950/30 border-red-500/30' };
          const verdictIcons = { valid: '✅', acceptable: '🟢', questionable: '⚠️', invalid: '❌' };
          const desc = (c) => {
            const descs = {
              completeness: { cs: `Zodpovězeno ${c.value}% položek (doporučeno 100%).`, en: `Answered ${c.value}% of items (100% recommended).` },
              straightLining: { cs: `Nejběžnější odpověď '${c.detail}' použita v ${c.value}% případů.${c.status !== 'pass' ? ' Naznačuje možné nepozorné odpovídání.' : ''}`, en: `Most common answer '${c.detail}' used in ${c.value}% of items.${c.status !== 'pass' ? ' Suggests possible inattentive responding.' : ''}` },
              variability: { cs: `Směrodatná odchylka ${c.value} (čím nižší, tím uniformnější odpovědi).`, en: `Standard deviation ${c.value} (lower = more uniform responses).` },
              overReporting: { cs: `Průměr odpovědí ${c.value}/4.${c.status !== 'pass' ? ' Nadměrně vysoký — vše označeno jako „zcela pravdivé“.' : ''}`, en: `Response mean ${c.value}/4.${c.status !== 'pass' ? ' Excessively high — almost everything marked as "completely true".' : ''}` },
              underReporting: { cs: `Průměr odpovědí ${c.value}/4.${c.status !== 'pass' ? ' Nadměrně nízký — vše označeno jako „zcela nepravdivé“.' : ''}`, en: `Response mean ${c.value}/4.${c.status !== 'pass' ? ' Excessively low — almost everything marked as "completely false".' : ''}` },
            };
            return descs[c.id]?.[lang] || '';
          };
          return (
            <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">🔍 {t('validityTitle')}</h3>
              
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-5 ${verdictColors[v.verdict]}`}>
                <span className="text-lg">{verdictIcons[v.verdict]}</span>
                <div>
                  <div className="font-semibold text-sm">{t('verdict_' + v.verdict)}</div>
                  <div className="text-xs opacity-70">{t('verdictDesc_' + v.verdict)}</div>
                </div>
              </div>
              
              <div className="flex gap-4 mb-5 text-xs text-gray-500">
                <span>{t('validityMean')}: <strong className="text-gray-300 font-mono">{v.mean}</strong></span>
                <span>{t('validitySD')}: <strong className="text-gray-300 font-mono">{v.sd}</strong></span>
              </div>
              
              <div className="space-y-2">
                {v.checks.map(c => (
                  <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border ${bg[c.status]}`}>
                    <span className="text-base shrink-0">{ico[c.status]}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${clr[c.status]}`}>{t('validity_' + c.id)}</div>
                      <div className="text-xs text-gray-500">{desc(c)}</div>
                    </div>
                    <div className={`text-sm font-mono shrink-0 ${clr[c.status]}`}>{c.value}{c.id === 'completeness' || c.id === 'straightLining' ? '%' : ''}</div>
                  </div>
                ))}
              </div>
              
              <p className="text-gray-600 text-xs mt-4">{t('validityExplain')}</p>
            </div>
          );
        })()}

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

  // ═══ PHQ-9 QUESTIONNAIRE ═══
  if (mode === 'phq9') return (
    <QuestionnaireScreen
      title="PHQ-9"
      questions={PHQ9_QUESTIONS[lang]}
      scaleLabels={PHQ9_SCALE[lang]}
      scaleMin={0} scaleMax={3}
      answers={phq9Ans} setAnswers={setPhq9Ans}
      idx={phq9Idx} setIdx={setPhq9Idx}
      onComplete={() => setMode('phq9_results')}
      color="#10B981" lang={lang} t={t} toggleLang={toggleLang}
      onBack={() => setMode('menu')}
      instruction={lang === 'cs' ? 'Za poslední 2 týdny, jak často vás trápil některý z následujících problémů?' : 'Over the last 2 weeks, how often have you been bothered by any of the following problems?'}
      liveScoreConfig={{ severityLevels: PHQ9_SEVERITY, maxScore: 27, label: 'PHQ-9',
        subscales: [
          { items: [0,1,2,3,4], max: 15, color: '#60A5FA', cs: 'Somatický', en: 'Somatic' },
          { items: [5,6,7,8], max: 12, color: '#A78BFA', cs: 'Kognitivně-afektivní', en: 'Cognitive-Affective' },
        ]
      }}
    />
  );

  // ═══ GAD-7 QUESTIONNAIRE ═══
  if (mode === 'gad7') return (
    <QuestionnaireScreen
      title="GAD-7"
      questions={GAD7_QUESTIONS[lang]}
      scaleLabels={GAD7_SCALE[lang]}
      scaleMin={0} scaleMax={3}
      answers={gad7Ans} setAnswers={setGad7Ans}
      idx={gad7Idx} setIdx={setGad7Idx}
      onComplete={() => setMode('gad7_results')}
      color="#14B8A6" lang={lang} t={t} toggleLang={toggleLang}
      onBack={() => setMode('menu')}
      instruction={lang === 'cs' ? 'Za poslední 2 týdny, jak často vás trápil některý z následujících problémů?' : 'Over the last 2 weeks, how often have you been bothered by any of the following problems?'}
      liveScoreConfig={{ severityLevels: GAD7_SEVERITY, maxScore: 21, label: 'GAD-7' }}
    />
  );

  // ═══ DASS-42 QUESTIONNAIRE ═══
  if (mode === 'dass42') return (
    <QuestionnaireScreen
      title="DASS-42"
      questions={DASS42_QUESTIONS[lang]}
      scaleLabels={DASS42_SCALE[lang]}
      scaleMin={0} scaleMax={3}
      answers={dass42Ans} setAnswers={setDass42Ans}
      idx={dass42Idx} setIdx={setDass42Idx}
      onComplete={() => setMode('dass42_results')}
      color="#F97316" lang={lang} t={t} toggleLang={toggleLang}
      onBack={() => setMode('menu')}
      instruction={lang === 'cs' ? 'Přečtěte si prosím každé tvrzení a zakroužkujte číslo 0, 1, 2 nebo 3, které nejlépe vyjadřuje, jak moc se na vás tvrzení vztahovalo v uplynulém týdnu.' : 'Please read each statement and select 0, 1, 2 or 3 which indicates how much the statement applied to you over the past week.'}
      liveScoreConfig={{ maxScore: 126, label: 'DASS-42',
        subscales: [
          { items: DASS42_SUBSCALES.depression, max: 42, color: '#60A5FA', cs: 'Deprese', en: 'Depression', severityLevels: DASS42_SEVERITY.depression },
          { items: DASS42_SUBSCALES.anxiety, max: 42, color: '#F87171', cs: 'Úzkost', en: 'Anxiety', severityLevels: DASS42_SEVERITY.anxiety },
          { items: DASS42_SUBSCALES.stress, max: 42, color: '#FBBF24', cs: 'Stres', en: 'Stress', severityLevels: DASS42_SEVERITY.stress },
        ]
      }}
    />
  );

  // ═══ PCL-5 QUESTIONNAIRE ═══
  if (mode === 'pcl5') return (
    <QuestionnaireScreen
      title="PCL-5"
      questions={PCL5_QUESTIONS[lang]}
      scaleLabels={PCL5_SCALE[lang]}
      scaleMin={0} scaleMax={4}
      answers={pcl5Ans} setAnswers={setPcl5Ans}
      idx={pcl5Idx} setIdx={setPcl5Idx}
      onComplete={() => setMode('pcl5_results')}
      color="#F43F5E" lang={lang} t={t} toggleLang={toggleLang}
      onBack={() => setMode('menu')}
      instruction={lang === 'cs' ? 'Níže je uveden seznam problémů, které lidé někdy mívají v reakci na velmi stresující zážitek. Uveďte prosím, jak moc vás každý problém trápil v uplynulém měsíci.' : 'Below is a list of problems that people sometimes have in response to a very stressful experience. Please indicate how much you have been bothered by each problem in the past month.'}
      liveScoreConfig={{ severityLevels: PCL5_SEVERITY, maxScore: 80, label: 'PCL-5',
        subscales: [
          { items: PCL5_CLUSTERS.clusterB.items, max: 20, color: '#F87171', cs: 'B: Intruzivní', en: 'B: Intrusion' },
          { items: PCL5_CLUSTERS.clusterC.items, max: 8, color: '#FBBF24', cs: 'C: Vyhýbání', en: 'C: Avoidance' },
          { items: PCL5_CLUSTERS.clusterD.items, max: 28, color: '#60A5FA', cs: 'D: Kognice/Nálada', en: 'D: Cognition/Mood' },
          { items: PCL5_CLUSTERS.clusterE.items, max: 24, color: '#A78BFA', cs: 'E: Arousal', en: 'E: Arousal' },
        ]
      }}
    />
  );

  // ═══ PHQ-9 RESULTS ═══
  if (mode === 'phq9_results') return (
    <PHQ9Results answers={phq9Ans} questions={PHQ9_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { savePhq9Result(); alert(t('resultSaved')); }} />
  );

  // ═══ GAD-7 RESULTS ═══
  if (mode === 'gad7_results') return (
    <GAD7Results answers={gad7Ans} questions={GAD7_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveGad7Result(); alert(t('resultSaved')); }} />
  );

  // ═══ DASS-42 RESULTS ═══
  if (mode === 'dass42_results') return (
    <DASS42Results answers={dass42Ans} questions={DASS42_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveDass42Result(); alert(t('resultSaved')); }} />
  );

  // ═══ PCL-5 RESULTS ═══
  if (mode === 'pcl5_results') return (
    <PCL5Results answers={pcl5Ans} questions={PCL5_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { savePcl5Result(); alert(t('resultSaved')); }} />
  );

  // ═══ CATI QUESTIONNAIRE ═══
  if (mode === 'cati') return (
    <QuestionnaireScreen
      title="CATI"
      questions={CATI_QUESTIONS[lang]}
      scaleLabels={CATI_SCALE[lang]}
      scaleMin={1} scaleMax={5}
      answers={catiAns} setAnswers={setCatiAns}
      idx={catiIdx} setIdx={setCatiIdx}
      onComplete={() => setMode('cati_results')}
      color="#8B5CF6" lang={lang} t={t} toggleLang={toggleLang}
      onBack={() => setMode('menu')}
      instruction={lang === 'cs' ? 'Přečtěte si prosím každé tvrzení a vyberte, nakolik s ním souhlasíte.' : 'Please read each statement and indicate how much you agree with it.'}
      liveScoreConfig={{ severityLevels: CATI_SEVERITY, maxScore: 210, label: 'CATI', scoreFn: (ans) => scoreCATI(ans).total,
        subscales: Object.entries(CATI_SUBSCALE_ITEMS).map(([key, items]) => ({
          items,
          max: 35,
          color: CATI_SUBSCALES[key].color,
          cs: CATI_SUBSCALES[key].cs,
          en: CATI_SUBSCALES[key].en,
          scoreFn: (ans) => items.reduce((s, i) => {
            const v = ans[i]; if (v === undefined || v === null) return s;
            return s + (CATI_REVERSE_ITEMS.includes(i) ? (6 - v) : v);
          }, 0),
        }))
      }}
    />
  );

  // ═══ ISI QUESTIONNAIRE ═══
  if (mode === 'isi') return (
    <QuestionnaireScreen
      title="ISI"
      questions={ISI_QUESTIONS[lang]}
      scaleLabels={ISI_SCALE_SIMPLE[lang]}
      scaleMin={0} scaleMax={4}
      answers={isiAns} setAnswers={setIsiAns}
      idx={isiIdx} setIdx={setIsiIdx}
      onComplete={() => setMode('isi_results')}
      color="#6366F1" lang={lang} t={t} toggleLang={toggleLang}
      onBack={() => setMode('menu')}
      instruction={lang === 'cs' ? 'Prosím ohodnoťte závažnost vašich současných problémů se spánkem.' : 'Please rate the severity of your current sleep problems.'}
      liveScoreConfig={{ severityLevels: ISI_SEVERITY, maxScore: 28, label: 'ISI' }}
    />
  );

  // ═══ CATI RESULTS ═══
  if (mode === 'cati_results') return (
    <CATIResults answers={catiAns} questions={CATI_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveCatiResult(); alert(t('resultSaved')); }} />
  );

  // ═══ ISI RESULTS ═══
  if (mode === 'isi_results') return (
    <ISIResults answers={isiAns} questions={ISI_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveIsiResult(); alert(t('resultSaved')); }} />
  );

  // ═══ ASRS QUESTIONNAIRE ═══
  if (mode === 'asrs') return (
    <QuestionnaireScreen
      title="ASRS v1.1"
      questions={ASRS_QUESTIONS[lang]}
      scaleLabels={ASRS_SCALE[lang]}
      scaleMin={0} scaleMax={4}
      answers={asrsAns} setAnswers={setAsrsAns}
      idx={asrsIdx} setIdx={setAsrsIdx}
      onComplete={() => setMode('asrs_results')}
      color="#0EA5E9" lang={lang} t={t} toggleLang={toggleLang}
      onBack={() => setMode('menu')}
      instruction={lang === 'cs' ? 'Jak často se u vás projevují následující příznaky?' : 'How often do you experience the following symptoms?'}
      liveScoreConfig={{ severityLevels: ASRS_SEVERITY, maxScore: 24, label: 'ASRS',
        subscales: [
          { items: ASRS_SUBSCALES.inattention, max: 12, color: '#60A5FA', cs: 'Nepozornost', en: 'Inattention' },
          { items: ASRS_SUBSCALES.hyperactivity, max: 12, color: '#F87171', cs: 'Hyperaktivita/Impulzivita', en: 'Hyperactivity/Impulsivity' },
        ]
      }}
    />
  );

  // ═══ ASRS RESULTS ═══
  if (mode === 'asrs_results') return (
    <ASRSResults answers={asrsAns} questions={ASRS_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveAsrsResult(); alert(t('resultSaved')); }} />
  );

  // ═══ EAT-26 QUESTIONNAIRE ═══
  if (mode === 'eat26') return (
    <QuestionnaireScreen
      title="EAT-26"
      questions={EAT26_QUESTIONS[lang]}
      scaleLabels={EAT26_SCALE[lang]}
      scaleMin={0} scaleMax={5}
      answers={eat26Ans} setAnswers={setEat26Ans}
      idx={eat26Idx} setIdx={setEat26Idx}
      onComplete={() => setMode('eat26_results')}
      color="#EC4899" lang={lang} t={t} toggleLang={toggleLang}
      onBack={() => setMode('menu')}
      instruction={lang === 'cs' ? 'Označte odpověď, která nejlépe vystihuje vaše chování.' : 'Check the answer that best applies to your behavior.'}
      liveScoreConfig={{ severityLevels: EAT26_SEVERITY, maxScore: 78, label: 'EAT-26', scoreFn: scoreEAT26,
        subscales: Object.entries(EAT26_SUBSCALES).map(([key, sub]) => ({
          items: sub.items,
          max: key === 'oralControl' ? 21 : (key === 'dieting' ? 36 : 18),
          color: key === 'dieting' ? '#EC4899' : key === 'bulimia' ? '#F97316' : '#8B5CF6',
          cs: sub.cs,
          en: sub.en,
          scoreFn: (ans) => sub.items.reduce((s, i) => {
            const v = ans[i]; if (v === undefined || v === null) return s;
            if (i === EAT26_REVERSE_ITEM) {
              return s + (v === 5 ? 3 : v === 4 ? 2 : v === 3 ? 1 : 0);
            }
            return s + (v === 0 ? 3 : v === 1 ? 2 : v === 2 ? 1 : 0);
          }, 0),
        }))
      }}
    />
  );

  // ═══ EAT-26 RESULTS ═══
  if (mode === 'eat26_results') return (
    <EAT26Results answers={eat26Ans} questions={EAT26_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveEat26Result(); alert(t('resultSaved')); }} />
  );

  // ═══ MDQ QUESTIONNAIRE ═══
  if (mode === 'mdq') {
    // MDQ is special: Part 1 (13 yes/no), Part 2 (1 yes/no), Part 3 (1 severity 0-3)
    // We use items 0-12 as yes/no (scale 0-1), item 13 as yes/no (scale 0-1), item 14 as severity (scale 0-3)
    const mdqAllQuestions = [...(MDQ_PART1[lang] || MDQ_PART1.cs), MDQ_PART2[lang] || MDQ_PART2.cs, MDQ_PART3[lang] || MDQ_PART3.cs];
    const mdqCurrentIdx = mdqIdx;
    const isYesNo = mdqCurrentIdx < 14;
    const scaleLabels = isYesNo ? (MDQ_YESNO[lang] || MDQ_YESNO.cs) : (MDQ_PART3_SCALE[lang] || MDQ_PART3_SCALE.cs);
    const scaleMax = isYesNo ? 1 : 3;

    return (
      <QuestionnaireScreen
        title="MDQ"
        questions={mdqAllQuestions}
        scaleLabels={scaleLabels}
        scaleMin={0} scaleMax={scaleMax}
        answers={mdqAns} setAnswers={setMdqAns}
        idx={mdqIdx} setIdx={setMdqIdx}
        onComplete={() => setMode('mdq_results')}
        color="#F59E0B" lang={lang} t={t} toggleLang={toggleLang}
        onBack={() => setMode('menu')}
        instruction={lang === 'cs' ? 'Prosím odpovězte na následující otázky o vašich zážitcích.' : 'Please answer the following questions about your experiences.'}
      />
    );
  }

  // ═══ MDQ RESULTS ═══
  if (mode === 'mdq_results') return (
    <MDQResults answers={mdqAns} questions={[]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveMdqResult(); alert(t('resultSaved')); }} />
  );

  // ═══ CUDIT-R QUESTIONNAIRE ═══
  if (mode === 'cuditr') {
    // CUDIT-R Q8 (index 7) has only 3 options (scored 0/2/4) while Q1-7 have 5 options (scored 0-4)
    const cuditrScales = CUDITR_SCALES[lang] || CUDITR_SCALES.cs;
    const isQ8 = cuditrIdx === 7;
    const cuditrScaleLabels = cuditrScales[cuditrIdx] || cuditrScales[0];
    const cuditrScaleMax = isQ8 ? 2 : 4;

    return (
      <QuestionnaireScreen
        title="CUDIT-R"
        questions={CUDITR_QUESTIONS[lang]}
        scaleLabels={cuditrScaleLabels}
        scaleMin={0} scaleMax={cuditrScaleMax}
        answers={cuditrAns} setAnswers={setCuditrAns}
        idx={cuditrIdx} setIdx={setCuditrIdx}
        onComplete={() => setMode('cuditr_results')}
        color="#84CC16" lang={lang} t={t} toggleLang={toggleLang}
        onBack={() => setMode('menu')}
        instruction={lang === 'cs' ? 'Odpovězte na otázky o vašem užívání konopí.' : 'Answer questions about your cannabis use.'}
        liveScoreConfig={{ severityLevels: CUDITR_SEVERITY, maxScore: 32, label: 'CUDIT-R', scoreFn: scoreCUDITR }}
      />
    );
  }

  // ═══ CUDIT-R RESULTS ═══
  if (mode === 'cuditr_results') return (
    <CUDITRResults answers={cuditrAns} questions={CUDITR_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveCuditrResult(); alert(t('resultSaved')); }} />
  );

  // ═══ AUDIT QUESTIONNAIRE ═══
  if (mode === 'audit') {
    const auditScales = AUDIT_SCALES[lang] || AUDIT_SCALES.cs;
    const isQ910 = auditIdx >= 8;
    const auditScaleLabels = auditScales[auditIdx] || auditScales[0];
    const auditScaleMax = isQ910 ? 2 : 4;

    return (
      <QuestionnaireScreen
        title="AUDIT"
        questions={AUDIT_QUESTIONS[lang]}
        scaleLabels={auditScaleLabels}
        scaleMin={0} scaleMax={auditScaleMax}
        answers={auditAns} setAnswers={setAuditAns}
        idx={auditIdx} setIdx={setAuditIdx}
        onComplete={() => setMode('audit_results')}
        color="#EAB308" lang={lang} t={t} toggleLang={toggleLang}
        onBack={() => setMode('menu')}
        instruction={lang === 'cs' ? 'Odpovězte prosím na otázky o vašem užívání alkoholu.' : 'Please answer questions about your alcohol use.'}
        liveScoreConfig={{ severityLevels: AUDIT_SEVERITY, maxScore: 40, label: 'AUDIT', scoreFn: scoreAUDIT,
          subscales: [
            { items: AUDIT_SUBSCALES.hazardous.items, max: 12, color: AUDIT_SUBSCALES.hazardous.color, cs: AUDIT_SUBSCALES.hazardous.cs, en: AUDIT_SUBSCALES.hazardous.en },
            { items: AUDIT_SUBSCALES.dependence.items, max: 12, color: AUDIT_SUBSCALES.dependence.color, cs: AUDIT_SUBSCALES.dependence.cs, en: AUDIT_SUBSCALES.dependence.en },
            { items: AUDIT_SUBSCALES.harmful.items, max: 16, color: AUDIT_SUBSCALES.harmful.color, cs: AUDIT_SUBSCALES.harmful.cs, en: AUDIT_SUBSCALES.harmful.en,
              scoreFn: (ans) => AUDIT_SUBSCALES.harmful.items.reduce((s, i) => {
                const v = ans[i]; if (v === undefined || v === null) return s;
                return s + (i >= 8 ? (Q910_SCORE_MAP[v] ?? 0) : v);
              }, 0)
            },
          ]
        }}
      />
    );
  }

  // ═══ AUDIT RESULTS ═══
  if (mode === 'audit_results') return (
    <AUDITResults answers={auditAns} questions={AUDIT_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveAuditResult(); alert(t('resultSaved')); }} />
  );

  // ═══ DAST-10 QUESTIONNAIRE ═══
  if (mode === 'dast10') {
    const dast10ScaleLabels = DAST10_SCALE[lang] || DAST10_SCALE.cs;
    return (
      <QuestionnaireScreen
        title="DAST-10"
        questions={DAST10_QUESTIONS[lang]}
        scaleLabels={dast10ScaleLabels}
        scaleMin={0} scaleMax={1}
        answers={dast10Ans} setAnswers={setDast10Ans}
        idx={dast10Idx} setIdx={setDast10Idx}
        onComplete={() => setMode('dast10_results')}
        color="#EF4444" lang={lang} t={t} toggleLang={toggleLang}
        onBack={() => setMode('menu')}
        instruction={lang === 'cs' ? 'Následující otázky se týkají vašeho užívání drog (bez alkoholu) za posledních 12 měsíců.' : 'The following questions concern your drug use (excluding alcohol) in the last 12 months.'}
        liveScoreConfig={{ severityLevels: DAST10_SEVERITY, maxScore: 10, label: 'DAST-10', scoreFn: scoreDAST10 }}
      />
    );
  }

  // ═══ DAST-10 RESULTS ═══
  if (mode === 'dast10_results') return (
    <DAST10Results answers={dast10Ans} questions={DAST10_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveDast10Result(); alert(t('resultSaved')); }} />
  );

  // ═══ ITQ QUESTIONNAIRE ═══
  if (mode === 'itq') {
    const itqScaleLabels = ITQ_SCALE[lang] || ITQ_SCALE.cs;
    return (
      <QuestionnaireScreen
        title="ITQ"
        questions={ITQ_QUESTIONS[lang]}
        scaleLabels={itqScaleLabels}
        scaleMin={0} scaleMax={4}
        answers={itqAns} setAnswers={setItqAns}
        idx={itqIdx} setIdx={setItqIdx}
        onComplete={() => setMode('itq_results')}
        color="#D946EF" lang={lang} t={t} toggleLang={toggleLang}
        onBack={() => setMode('menu')}
        instruction={lang === 'cs' ? 'Následující otázky se týkají reakcí na traumatický zážitek. Uveďte, jak moc vás tyto problémy trápily v posledním měsíci.' : 'The following questions relate to reactions to a traumatic experience. Indicate how much these problems have bothered you in the past month.'}
        liveScoreConfig={{ severityLevels: ITQ_SEVERITY, maxScore: 72, label: 'ITQ', scoreFn: scoreITQ,
          subscales: [
            { items: ITQ_CLUSTERS.reExperiencing.items, max: 8, color: ITQ_CLUSTERS.reExperiencing.color, cs: ITQ_CLUSTERS.reExperiencing.cs, en: ITQ_CLUSTERS.reExperiencing.en },
            { items: ITQ_CLUSTERS.avoidance.items, max: 8, color: ITQ_CLUSTERS.avoidance.color, cs: ITQ_CLUSTERS.avoidance.cs, en: ITQ_CLUSTERS.avoidance.en },
            { items: ITQ_CLUSTERS.senseOfThreat.items, max: 8, color: ITQ_CLUSTERS.senseOfThreat.color, cs: ITQ_CLUSTERS.senseOfThreat.cs, en: ITQ_CLUSTERS.senseOfThreat.en },
            { items: ITQ_CLUSTERS.affectDysreg.items, max: 8, color: ITQ_CLUSTERS.affectDysreg.color, cs: ITQ_CLUSTERS.affectDysreg.cs, en: ITQ_CLUSTERS.affectDysreg.en },
            { items: ITQ_CLUSTERS.negativeSelf.items, max: 8, color: ITQ_CLUSTERS.negativeSelf.color, cs: ITQ_CLUSTERS.negativeSelf.cs, en: ITQ_CLUSTERS.negativeSelf.en },
            { items: ITQ_CLUSTERS.disturbedRel.items, max: 8, color: ITQ_CLUSTERS.disturbedRel.color, cs: ITQ_CLUSTERS.disturbedRel.cs, en: ITQ_CLUSTERS.disturbedRel.en },
          ]
        }}
      />
    );
  }

  // ═══ ITQ RESULTS ═══
  if (mode === 'itq_results') return (
    <ITQResults answers={itqAns} questions={ITQ_QUESTIONS[lang]} lang={lang} t={t} onBack={() => setMode('menu')} toggleLang={toggleLang} onSave={() => { saveItqResult(); alert(t('resultSaved')); }} />
  );

  // ═══ SOURCES / REFERENCES PAGE ═══
  if (mode === 'sources') return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{lang === 'cs' ? '📚 Zdroje & Reference' : '📚 Sources & References'}</h1>
          <div className="flex gap-2">
            <button onClick={toggleLang} className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors">{lang === 'cs' ? 'EN' : 'CZ'}</button>
            <button onClick={() => setMode('menu')} className="px-4 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 transition-colors">{t('menu')}</button>
          </div>
        </div>

        {/* Main data spreadsheet */}
        <div className="mb-8 p-5 rounded-2xl bg-purple-900/20 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <h2 className="font-bold text-purple-300">{lang === 'cs' ? 'Hlavní datový zdroj' : 'Primary Data Source'}</h2>
          </div>
          <p className="text-sm text-gray-400 mb-3">{lang === 'cs'
            ? 'Kompletní tabulka s položkami, skórováním, cut-offy a normami pro všechny použité nástroje:'
            : 'Complete spreadsheet with items, scoring, cut-offs and norms for all instruments:'
          }</p>
          <a href="https://docs.google.com/spreadsheets/d/1zn-o0o_qLqDu5ib2BCmJQ4unEaBBseULkDT2uei_ano/edit?gid=2088090629#gid=2088090629" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 text-sm hover:bg-purple-600/50 transition-all">
            📋 Google Sheets — {lang === 'cs' ? 'Otevřít tabulku' : 'Open Spreadsheet'} ↗
          </a>
        </div>

        {/* Scoring & interpretation tools */}
        <h2 className="text-lg font-bold text-gray-300 mb-3">{lang === 'cs' ? '🔧 Nástroje pro skórování a interpretaci' : '🔧 Scoring & Interpretation Tools'}</h2>
        <div className="space-y-3 mb-8">
          {[
            { title: 'APA — PID-5 Full Version (Adult)', desc: lang === 'cs' ? 'Oficiální formulář s pokyny ke skórování, volně stažitelné PDF od APA' : 'Official form with scoring instructions, freely downloadable PDF from APA', url: 'https://www.psychiatry.org/getmedia/594673a6-1b9b-4298-8b52-c4c652c4a4e2/APA-DSM5TR-ThePersonalityInventoryForDSM5FullVersionAdult.pdf' },
            { title: 'NovoPsych — PID-5-SF', desc: lang === 'cs' ? 'Přehled skórování, interpretace a psychometrie PID-5' : 'Scoring overview, interpretation and psychometrics for PID-5', url: 'https://novopsych.com/assessments/diagnosis/personality-inventory-for-dsm-5-short-form-pid-5-sf/' },
            { title: 'Lloyd & Preece Psychometric Auto-Scorer v1.4', desc: lang === 'cs' ? 'Volně stažitelný Excel s automatickým skórováním PID-5 a dalších testů (Psychology Centre of Western Australia)' : 'Free downloadable Excel with automatic PID-5 scoring (Psychology Centre of Western Australia)', url: 'https://psychologywa.com/psychometric/' },
          ].map((tool, i) => (
            <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-gray-900/60 border border-gray-800/60 hover:border-gray-600/60 transition-all">
              <div className="font-semibold text-sm text-blue-400 mb-1">{tool.title} ↗</div>
              <p className="text-xs text-gray-500">{tool.desc}</p>
            </a>
          ))}
        </div>

        {/* Original publications per instrument */}
        <h2 className="text-lg font-bold text-gray-300 mb-3">{lang === 'cs' ? '📄 Původní publikace' : '📄 Original Publications'}</h2>
        <p className="text-gray-500 text-xs mb-4">{lang === 'cs'
          ? 'Reference k původním článkům, ze kterých jsou převzaty položky, škály a cut-off skóry.'
          : 'References to original articles from which items, scales and cut-off scores are derived.'
        }</p>
        <div className="space-y-3 mb-8">
          {[
            { title: 'PID-5', color: '#A855F7', ref: 'American Psychiatric Association (2013). Diagnostic and Statistical Manual of Mental Disorders (5th ed.), Section III: Alternative DSM-5 Model for Personality Disorders (AMPD), pp. 773–781.', ref2: 'Krueger RF, Derringer J, Markon KE, Watson D, Skodol AE. (2012). Initial construction of a maladaptive personality trait model and inventory for DSM-5. Psychological Medicine, 42(9), 1879–1890.' },
            { title: 'LPFS-SR', color: '#3B82F6', ref: 'Morey LC. (2017). Development and initial evaluation of a self-report form of the DSM-5 Level of Personality Functioning Scale. Psychological Assessment, 29(10), 1302–1308. doi:10.1037/pas0000450' },
            { title: 'PHQ-9', color: '#10B981', ref: 'Kroenke K, Spitzer RL, Williams JBW. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613.' },
            { title: 'GAD-7', color: '#14B8A6', ref: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of Internal Medicine, 166(10), 1092–1097.' },
            { title: 'DASS-42', color: '#F97316', ref: 'Lovibond SH & Lovibond PF. (1995). Manual for the Depression Anxiety Stress Scales (2nd ed.). Psychology Foundation of Australia.' },
            { title: 'PCL-5', color: '#F43F5E', ref: 'Weathers FW, Litz BT, Keane TM, Palmieri PA, Marx BP, Schnurr PP. (2013). The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD.' },
            { title: 'CATI', color: '#8B5CF6', ref: 'English MCW, Gignac GE, Visser TAW, Whitehouse AJO, Maybery MT. (2021). Comprehensive Autistic Trait Inventory (CATI). 42 items, 6 subscales.' },
            { title: 'ISI', color: '#6366F1', ref: 'Morin CM. (1993). Insomnia Severity Index. 7 items, scale 0–4, total 0–28.' },
            { title: 'ASRS v1.1', color: '#0EA5E9', ref: 'Kessler RC, Adler L, Ames M, et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychological Medicine, 35(2), 245–256.' },
            { title: 'EAT-26', color: '#EC4899', ref: 'Garner DM, Olmsted MP, Bohr Y, Garfinkel PE. (1982). The Eating Attitudes Test: psychometric features and clinical correlates. Psychological Medicine, 12(4), 871–878.' },
            { title: 'MDQ', color: '#F59E0B', ref: 'Hirschfeld RMA, Williams JBW, Spitzer RL, et al. (2000). Development and Validation of a Screening Instrument for Bipolar Spectrum Disorder: The Mood Disorder Questionnaire. Am J Psychiatry, 157(11), 1873–1875.' },
            { title: 'CUDIT-R', color: '#84CC16', ref: 'Adamson SJ, Kay-Lambkin FJ, Baker AL, Lewin TJ, Thornton L, Kelly BJ, Sellman JD. (2010). An Improved Brief Measure of Cannabis Misuse: The Cannabis Use Disorders Identification Test–Revised (CUDIT-R). Drug and Alcohol Dependence, 110, 137–143.' },
            { title: 'AUDIT', color: '#EAB308', ref: 'Saunders JB, Aasland OG, Babor TF, de la Fuente JR, Grant M. (1993). Development of the Alcohol Use Disorders Identification Test (AUDIT): WHO Collaborative Project on Early Detection of Persons with Harmful Alcohol Consumption-II. Addiction, 88(6), 791–804.' },
            { title: 'DAST-10', color: '#EF4444', ref: 'Skinner HA. (1982). The Drug Abuse Screening Test. Addictive Behaviors, 7(4), 363–371.', ref2: 'Yudko E, Lozhkina O, Fouts A. (2007). A comprehensive review of the psychometric properties of the Drug Abuse Screening Test. Journal of Substance Abuse Treatment, 32(2), 189–198.' },
            { title: 'ITQ', color: '#D946EF', ref: 'Cloitre M, Shevlin M, Brewin CR, et al. (2018). The International Trauma Questionnaire: development of a self-report measure of ICD-11 PTSD and complex PTSD. Acta Psychiatrica Scandinavica, 138(6), 536–546. doi:10.1111/acps.12956' },
          ].map((src, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/60" style={{ borderLeftWidth: 3, borderLeftColor: src.color }}>
              <div className="font-bold text-sm mb-1" style={{ color: src.color }}>{src.title}</div>
              <p className="text-xs text-gray-400 leading-relaxed">{src.ref}</p>
              {src.ref2 && <p className="text-xs text-gray-500 leading-relaxed mt-1">{src.ref2}</p>}
            </div>
          ))}
        </div>

        {/* DSM-5 base reference */}
        <h2 className="text-lg font-bold text-gray-300 mb-3">{lang === 'cs' ? '📘 Základní reference' : '📘 Base Reference'}</h2>
        <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/40 mb-8">
          <p className="text-xs text-gray-400 leading-relaxed">American Psychiatric Association (2013). <em>Diagnostic and Statistical Manual of Mental Disorders</em> (5th ed.). Washington, DC: APA Publishing.</p>
          <a href="https://www.psychiatry.org/psychiatrists/practice/dsm" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-400 mt-1 inline-block">psychiatry.org/psychiatrists/practice/dsm ↗</a>
        </div>

        {/* MMPI info section */}
        <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/40 mb-8">
          <div className="font-bold text-sm mb-2 text-red-400">MMPI — Minnesota Multiphasic Personality Inventory</div>
          <p className="text-xs text-gray-400 leading-relaxed mb-2">
            {lang === 'cs'
              ? 'MMPI je jedním z nejznámějších psychodiagnostických nástrojů pro posouzení osobnosti a psychopatologie. V této aplikaci není zahrnut z důvodu licenčních omezení a ochrany autorských práv. Pokud vás MMPI zajímá, můžete využít následující zdroje pro studium nebo orientační online verze:'
              : 'MMPI is one of the most well-known psychodiagnostic tools for personality and psychopathology assessment. It is not included in this app due to licensing restrictions and copyright protection. If you are interested in MMPI, you can use the following sources for study or unofficial online versions:'
            }
          </p>
          <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1">
            <li>
              <a href="https://is.muni.cz/th/b8prs/Martin_Hajny_Diplomova_prace.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{lang === 'cs' ? 'Diplomová práce Martin Hajný (Masarykova univerzita)' : 'Martin Hajný Thesis (Masaryk University)'}</a>
            </li>
            <li>
              <a href="https://docs.google.com/spreadsheets/d/1zn-o0o_qLqDu5ib2BCmJQ4unEaBBseULkDT2uei_ano/edit?gid=2088090629#gid=2088090629" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Sheets — {lang === 'cs' ? 'Kompletní tabulka' : 'Complete spreadsheet'}</a>
            </li>
            <li>
              <a href="https://www.idrlabs.com/multiphasic-personality/test.php" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{lang === 'cs' ? 'IDRlabs: Neoficiální online MMPI test' : 'IDRlabs: Unofficial online MMPI test'}</a>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            {lang === 'cs'
              ? '⚠️ MMPI je chráněn autorskými právy. Online verze nejsou oficiální a slouží pouze pro orientační účely.'
              : '⚠️ MMPI is copyright protected. Online versions are unofficial and for informational purposes only.'
            }
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/40">
          <p className="text-xs text-gray-500 leading-relaxed">
            {lang === 'cs'
              ? '⚠️ Disclaimer: Tento nástroj je určen pouze pro edukační a screeningové účely. Nenahrazuje odborné klinické vyšetření. Výsledky by měly být interpretovány kvalifikovaným odborníkem.'
              : '⚠️ Disclaimer: This tool is intended for educational and screening purposes only. It does not replace professional clinical evaluation. Results should be interpreted by a qualified professional.'
            }
          </p>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setMode('menu')} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">{t('menu')}</button>
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
