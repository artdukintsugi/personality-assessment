/**
 * PCL-5 Results page
 */
import { useMemo, useState, useEffect } from 'react';
import { PCL5_CLUSTERS, PCL5_CUTOFF, PCL5_SEVERITY, PCL5_DSM5_CRITERIA } from '../data/pcl5';
import { SeverityBadge, ScoreBar, ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

const CLUSTER_LABELS = {
  cs: { intrusion: 'Intruze (Cluster B)', avoidance: 'Vyhýbání (Cluster C)', cognitionMood: 'Negativní kognice a nálada (Cluster D)', arousal: 'Hyperarousal (Cluster E)' },
  en: { intrusion: 'Intrusion (Cluster B)', avoidance: 'Avoidance (Cluster C)', cognitionMood: 'Negative Cognition & Mood (Cluster D)', arousal: 'Arousal & Reactivity (Cluster E)' },
};

const CLUSTER_DESC = {
  cs: {
    intrusion: 'Vtíravé vzpomínky, noční můry, flashbacky, emoční a fyzické reakce na připomínky traumatu.',
    avoidance: 'Vyhýbání se vnitřním (myšlenkám, pocitům) a vnějším (místům, lidem) připomínkám traumatu.',
    cognitionMood: 'Negativní přesvědčení, obviňování, negativní emoce, ztráta zájmu, odcizení, emoční otupělost.',
    arousal: 'Podrážděnost, riskování, hypervigilance, úleková reakce, potíže s koncentrací a spánkem.',
  },
  en: {
    intrusion: 'Intrusive memories, nightmares, flashbacks, emotional and physical reactions to trauma reminders.',
    avoidance: 'Avoidance of internal (thoughts, feelings) and external (places, people) trauma reminders.',
    cognitionMood: 'Negative beliefs, blame, negative emotions, loss of interest, detachment, emotional numbness.',
    arousal: 'Irritability, recklessness, hypervigilance, startle response, concentration and sleep difficulties.',
  },
};

const CLUSTER_COLORS = {
  clusterB: '#F87171',
  clusterC: '#FBBF24',
  clusterD: '#818CF8',
  clusterE: '#FB923C',
};

export default function PCL5Results({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 4; // 80
  const severity = PCL5_SEVERITY.find(s => total >= s.min && total <= s.max) || PCL5_SEVERITY[0];
  const meetsThreshold = total >= PCL5_CUTOFF;
  const validity = useMemo(() => checkSimpleValidity(answers, questions.length, 0, 4, lang), [answers, questions.length, lang]);

  // Cluster scores
  const clusterScores = useMemo(() => {
    const r = {};
    for (const [key, { name, items }] of Object.entries(PCL5_CLUSTERS)) {
      const sum = items.reduce((s, i) => s + (answers[i] ?? 0), 0);
      const max = items.length * 4;
      const endorsed = items.filter(i => (answers[i] ?? 0) >= 2).length;
      r[key] = { name, sum, max, endorsed, required: PCL5_DSM5_CRITERIA[key], met: endorsed >= PCL5_DSM5_CRITERIA[key] };
    }
    return r;
  }, [answers]);

  // DSM-5 provisional diagnosis
  const dsm5Met = Object.values(clusterScores).every(c => c.met);

  const [showLive, setShowLive] = useState(() => {
    try { const v = localStorage.getItem('pcl5_showLiveResults'); return v === null ? true : v === 'true'; } catch (e) { return true; }
  });
  useEffect(() => { try { localStorage.setItem('pcl5_showLiveResults', showLive); } catch (e) {} }, [showLive]);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm">{t('back')}</button>
          <span className="text-sm font-semibold text-rose-400">PCL-5 — {lang === 'cs' ? 'Výsledky' : 'Results'}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-gray-800 text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
            <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
          </div>
        </div>

        {/* Total score + threshold */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-4">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold font-mono" style={{ color: severity.color }}>{total}</div>
            <div className="text-gray-500 text-sm">/ {maxScore}</div>
          </div>
          <ScoreBar value={total} max={maxScore} color={severity.color} />

          {/* Threshold indicator */}
          <div className={`mt-4 p-3 rounded-xl border ${meetsThreshold ? 'border-red-500/30 bg-red-950/20' : 'border-green-500/20 bg-green-950/10'}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{meetsThreshold ? '⚠️' : '✅'}</span>
              <div>
                <div className={`text-sm font-semibold ${meetsThreshold ? 'text-red-400' : 'text-green-400'}`}>
                  {meetsThreshold
                    ? (lang === 'cs' ? 'Nad klinickým cut-off skóre' : 'Above clinical cut-off score')
                    : (lang === 'cs' ? 'Pod klinickým cut-off skóre' : 'Below clinical cut-off score')
                  }
                </div>
                <div className="text-xs text-gray-500">
                  {lang === 'cs' ? `Cut-off pro pravděpodobnou PTSD: ≥ ${PCL5_CUTOFF}` : `Cut-off for probable PTSD: ≥ ${PCL5_CUTOFF}`}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <SeverityBadge score={total} severityLevels={PCL5_SEVERITY} lang={lang} />
          </div>
          </div>
        )}

        {/* DSM-5 Cluster Analysis */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">{lang === 'cs' ? 'Analýza symptomových clusterů (DSM-5)' : 'DSM-5 Symptom Cluster Analysis'}</h3>
          <p className="text-xs text-gray-500 mb-5">
            {lang === 'cs'
              ? `Provizorní diagnóza PTSD vyžaduje splnění kritérií ve všech 4 clusterech (položky hodnocené ≥ 2). ${dsm5Met ? 'Kritéria SPLNĚNA.' : 'Kritéria NESPLNĚNA.'}`
              : `Provisional PTSD diagnosis requires meeting criteria in all 4 clusters (items rated ≥ 2). ${dsm5Met ? 'Criteria MET.' : 'Criteria NOT MET.'}`
            }
          </p>

          {Object.entries(clusterScores).map(([key, c]) => (
            <div key={key} className="mb-5 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: CLUSTER_COLORS[key] }} />
                  <span className="text-sm font-semibold" style={{ color: CLUSTER_COLORS[key] }}>{CLUSTER_LABELS[lang][c.name]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-300">{c.sum}/{c.max}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md ${c.met ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'}`}>
                    {c.endorsed}/{c.required} {lang === 'cs' ? 'splněno' : 'met'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden mb-1">
                <div className="h-full rounded-full transition-all" style={{ width: `${(c.sum / c.max) * 100}%`, background: CLUSTER_COLORS[key] }} />
              </div>
              <p className="text-xs text-gray-500">{CLUSTER_DESC[lang][c.name]}</p>
            </div>
          ))}

          {/* DSM-5 summary badge */}
          <div className={`mt-4 p-3 rounded-xl border ${dsm5Met ? 'border-red-500/30 bg-red-950/20' : 'border-gray-700/30 bg-gray-800/20'}`}>
            <div className="flex items-center gap-2">
              <span>{dsm5Met ? '🔴' : '⚪'}</span>
              <span className={`text-sm font-semibold ${dsm5Met ? 'text-red-400' : 'text-gray-400'}`}>
                {lang === 'cs'
                  ? `DSM-5 kritéria: ${dsm5Met ? 'SPLNĚNA (provizorní)' : 'Nesplněna'}`
                  : `DSM-5 criteria: ${dsm5Met ? 'MET (provisional)' : 'Not met'}`
                }
              </span>
            </div>
          </div>
          </div>
        )}

        {/* Item breakdown */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{lang === 'cs' ? 'Detail odpovědí' : 'Answer Breakdown'}</h3>
          {Object.entries(PCL5_CLUSTERS).map(([key, { name, items }]) => (
            <div key={key} className="mb-5 last:mb-0">
              <h4 className="text-sm font-semibold mb-2" style={{ color: CLUSTER_COLORS[key] }}>{CLUSTER_LABELS[lang][name]}</h4>
              <div className="space-y-2">
                {items.map(i => {
                  const val = answers[i] ?? 0;
                  const colr = val === 0 ? '#4ADE80' : val === 1 ? '#A3E635' : val === 2 ? '#FBBF24' : val === 3 ? '#FB923C' : '#F87171';
                  return (
                    <div key={i} className="p-2 rounded-lg border border-gray-800/30 bg-gray-800/10">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-xs text-gray-600 shrink-0">{i + 1}.</span>
                        <span className="text-xs text-gray-400 flex-1 line-clamp-2">{questions[i]}</span>
                        <span className="text-xs font-mono font-bold shrink-0" style={{ color: colr }}>{val}</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(val / 4) * 100}%`, background: colr }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Validity */}
        <ValiditySection validity={validity} lang={lang} t={t} scaleMax={4} />

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 mb-6">
          <p className="text-amber-400/80 text-xs leading-relaxed">
            {lang === 'cs'
              ? '⚠ PCL-5 je screeningový nástroj pro symptomy PTSD, nikoli diagnostický test. Provizorní diagnóza vyžaduje potvrzení klinickým hodnocením (CAPS-5). Konzultujte výsledky s kvalifikovaným odborníkem.'
              : '⚠ PCL-5 is a screening tool for PTSD symptoms, not a diagnostic test. Provisional diagnosis requires confirmation by clinical assessment (CAPS-5). Consult results with a qualified professional.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {onSave && <button onClick={onSave} className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white font-semibold transition-all">{t('saveResult')}</button>}
          <button onClick={() => {
            const data = {
              test: 'PCL-5', score: total, cutoffMet: meetsThreshold, dsm5CriteriaMet: dsm5Met,
              clusters: Object.fromEntries(Object.entries(clusterScores).map(([k, c]) => [c.name, { score: c.sum, max: c.max, endorsed: c.endorsed, criteriaMet: c.met }])),
              answers, date: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pcl5_results.json'; a.click();
          }} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">📦 JSON</button>
          <button onClick={onBack} className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl text-gray-400 font-semibold transition-all">{t('menu')}</button>
        </div>
      </div>
    </div>
  );
}
