/**
 * DASS-42 Results page (with DASS-21 subset view)
 */
import { useState, useMemo, useEffect } from 'react';
import { DASS42_SUBSCALES, DASS42_SEVERITY, DASS21_SUBSET, DASS21_SEVERITY } from '../data/dass42';
import { SeverityBadge, ScoreBar, ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

function getSeverityLevel(score, severityTable) {
  return severityTable.find(s => score >= s.min && score <= s.max) || severityTable[severityTable.length - 1];
}

const SUBSCALE_COLORS = {
  depression: '#818CF8', // indigo
  anxiety: '#F87171',    // red
  stress: '#FBBF24',     // amber
};

const SUBSCALE_LABELS = {
  cs: { depression: 'Deprese', anxiety: 'Úzkost', stress: 'Stres' },
  en: { depression: 'Depression', anxiety: 'Anxiety', stress: 'Stress' },
};

const SEVERITY_LABELS = {
  cs: { normal: 'Normální', mild: 'Mírné', moderate: 'Středně těžké', severe: 'Těžké', extremelySevere: 'Extrémně těžké' },
  en: { normal: 'Normal', mild: 'Mild', moderate: 'Moderate', severe: 'Severe', extremelySevere: 'Extremely Severe' },
};

const SUBSCALE_DESC = {
  cs: {
    depression: 'Subškála deprese měří dysforii, beznaděj, znehodnocování života, sebeodmítání, ztrátu zájmu/zapojení, anhedonii a nedostatek energie.',
    anxiety: 'Subškála úzkosti měří autonomní vzrušení, kosterně-svalové napětí, situační úzkost a subjektivní prožitek úzkostného afektu.',
    stress: 'Subškála stresu měří potíže s uvolněním, nervové vzrušení, podrážděnost/přehnanou reaktivitu a netrpělivost.',
  },
  en: {
    depression: 'The Depression subscale measures dysphoria, hopelessness, devaluation of life, self-deprecation, lack of interest/involvement, anhedonia, and inertia.',
    anxiety: 'The Anxiety subscale measures autonomic arousal, skeletal muscle tension, situational anxiety, and subjective experience of anxious affect.',
    stress: 'The Stress subscale measures difficulty relaxing, nervous arousal, irritability/over-reactivity, and impatience.',
  },
};

export default function DASS42Results({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const [showDass21, setShowDass21] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareType, setCompareType] = useState(null);
  const [otherScores, setOtherScores] = useState(null);
  const [otherLabel, setOtherLabel] = useState('');
    // Reference averages (example values, replace with real data if available)
    const POP_AVG = { depression: 4, anxiety: 3, stress: 6 };
    const MDD_AVG = { depression: 18, anxiety: 10, stress: 14 };
    const GAD_AVG = { depression: 10, anxiety: 16, stress: 12 };
  const validity = useMemo(() => checkSimpleValidity(answers, questions.length, 0, 3, lang), [answers, questions.length, lang]);

  const [showLive, setShowLive] = useState(() => {
    try {
      const v = localStorage.getItem('dass42_showLiveResults');
      return v === null ? true : v === 'true';
    } catch (e) { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('dass42_showLiveResults', showLive); } catch (e) {}
  }, [showLive]);

  // Score DASS-42 subscales
  const subscaleScores42 = useMemo(() => {
    const r = {};
    for (const [sub, indices] of Object.entries(DASS42_SUBSCALES)) {
      r[sub] = indices.reduce((sum, i) => sum + (answers[i] ?? 0), 0);
    }
    return r;
  }, [answers]);

  // Score DASS-21 subset
  const subscaleScores21 = useMemo(() => {
    const r = {};
    for (const [sub, indices] of Object.entries(DASS21_SUBSET)) {
      r[sub] = indices.reduce((sum, i) => sum + (answers[i] ?? 0), 0);
    }
    return r;
  }, [answers]);

  const activeScores = showDass21 ? subscaleScores21 : subscaleScores42;
  const activeSeverity = showDass21 ? DASS21_SEVERITY : DASS42_SEVERITY;
  const activeMax = showDass21 ? 21 : 42;
  const totalScore = Object.values(activeScores).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm">← {t('back')}</button>
          <span className="text-sm font-semibold text-orange-400">DASS-{showDass21 ? '21' : '42'} — {lang === 'cs' ? 'Výsledky' : 'Results'}</span>
          <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
        </div>

        {/* Compare button */}
        <div className="mb-6">
          <button onClick={() => setShowCompare(true)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-900/40 border border-blue-500/30 text-blue-300 hover:bg-blue-900/60 transition-all">
            {lang === 'cs' ? 'Porovnat s…' : 'Compare with…'}
          </button>
        </div>

        {/* Compare Modal */}
        {showCompare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-bold text-blue-300 mb-4">{lang === 'cs' ? 'Porovnat výsledky' : 'Compare Results'}</h2>
              <div className="space-y-3 mb-4">
                <button onClick={() => { setCompareType('other'); setOtherScores(null); setOtherLabel(''); }} className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border ${compareType==='other' ? 'bg-blue-800/30 border-blue-400 text-blue-200' : 'bg-gray-900/30 border-gray-700 text-gray-400 hover:text-gray-200'}`}>{lang === 'cs' ? 'S jiným člověkem' : 'With another person'}</button>
                <button onClick={() => { setCompareType('pop'); setOtherScores(POP_AVG); setOtherLabel(lang==='cs'?'Průměr populace':'Population average'); }} className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border ${compareType==='pop' ? 'bg-blue-800/30 border-blue-400 text-blue-200' : 'bg-gray-900/30 border-gray-700 text-gray-400 hover:text-gray-200'}`}>{lang === 'cs' ? 'S průměrem populace' : 'With population average'}</button>
                <button onClick={() => { setCompareType('mdd'); setOtherScores(MDD_AVG); setOtherLabel(lang==='cs'?'Průměr u deprese (MDD)':'Average for depression (MDD)'); }} className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border ${compareType==='mdd' ? 'bg-blue-800/30 border-blue-400 text-blue-200' : 'bg-gray-900/30 border-gray-700 text-gray-400 hover:text-gray-200'}`}>{lang === 'cs' ? 'S průměrem u deprese (MDD)' : 'With average for depression (MDD)'}</button>
                <button onClick={() => { setCompareType('gad'); setOtherScores(GAD_AVG); setOtherLabel(lang==='cs'?'Průměr u úzkosti (GAD)':'Average for anxiety (GAD)'); }} className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border ${compareType==='gad' ? 'bg-blue-800/30 border-blue-400 text-blue-200' : 'bg-gray-900/30 border-gray-700 text-gray-400 hover:text-gray-200'}`}>{lang === 'cs' ? 'S průměrem u úzkosti (GAD)' : 'With average for anxiety (GAD)'}</button>
              </div>
              {compareType === 'other' && (
                <div className="mb-4">
                  <label className="block text-xs text-gray-400 mb-1">{lang === 'cs' ? 'Vlož JSON výsledků druhé osoby:' : "Paste JSON of other person's results:"}</label>
                  <textarea rows={3} className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-xs text-gray-200 mb-2" placeholder={'{"depression":12,"anxiety":8,"stress":10}'} value={otherLabel} onChange={e => setOtherLabel(e.target.value)} />
                  <button onClick={() => {
                    try {
                      const obj = JSON.parse(otherLabel);
                      if (obj.depression !== undefined && obj.anxiety !== undefined && obj.stress !== undefined) {
                        setOtherScores(obj);
                      } else {
                        alert('Invalid format');
                      }
                    } catch {
                      alert('Invalid JSON');
                    }
                  }} className="px-3 py-1 rounded bg-blue-700 text-white text-xs font-semibold">{lang === 'cs' ? 'Načíst' : 'Load'}</button>
                </div>
              )}
              {otherScores && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-blue-200 mb-2">{lang === 'cs' ? 'Porovnání subškál' : 'Subscale Comparison'}</h3>
                  <table className="w-full text-xs mb-2">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left py-1"></th>
                        <th className="text-center py-1">{lang === 'cs' ? 'Vy' : 'You'}</th>
                        <th className="text-center py-1">{compareType==='other'? (lang==='cs'?'Druhý člověk':'Other person') : otherLabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['depression','anxiety','stress'].map(sub => (
                        <tr key={sub} className="border-t border-gray-800/50">
                          <td className="py-1.5 text-gray-400">{SUBSCALE_LABELS[lang][sub]}</td>
                          <td className="text-center py-1.5 font-mono text-blue-300">{activeScores[sub]}</td>
                          <td className="text-center py-1.5 font-mono text-blue-400">{otherScores[sub]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex gap-2 mt-2">
                    {['depression','anxiety','stress'].map(sub => (
                      <div key={sub} className="flex-1">
                        <div className="text-xs text-gray-400 mb-1 text-center">{SUBSCALE_LABELS[lang][sub]}</div>
                        <div className="relative h-4 bg-gray-800 rounded-full">
                          <div className="absolute left-0 top-0 h-4 rounded-full" style={{width:`${(activeScores[sub]/activeMax)*100}%`,background:SUBSCALE_COLORS[sub],opacity:0.7}} />
                          <div className="absolute left-0 top-0 h-4 rounded-full" style={{width:`${(otherScores[sub]/activeMax)*100}%`,background:SUBSCALE_COLORS[sub],opacity:0.3}} />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                          <span>{lang==='cs'?'Vy':'You'}: {activeScores[sub]}</span>
                          <span>{compareType==='other'? (lang==='cs'?'Druhý':'Other') : otherLabel}: {otherScores[sub]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowCompare(false)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700">{lang==='cs'?'Zavřít':'Close'}</button>
              </div>
            </div>
          </div>
        )}

        {/* DASS-42 / DASS-21 toggle + show/hide live results */}
        <div className="flex gap-2 mb-6 items-center">
          <button onClick={() => setShowDass21(false)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${!showDass21 ? 'border-orange-500/40 text-orange-400 bg-orange-500/10' : 'border-gray-700/30 text-gray-500 hover:text-gray-300'}`}>
            DASS-42 {lang === 'cs' ? '(plná verze)' : '(full version)'}
          </button>
          <button onClick={() => setShowDass21(true)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${showDass21 ? 'border-orange-500/40 text-orange-400 bg-orange-500/10' : 'border-gray-700/30 text-gray-500 hover:text-gray-300'}`}>
            DASS-21 {lang === 'cs' ? '(zkrácená)' : '(short form)'}
          </button>
          <button onClick={() => setShowLive(s => !s)} className={`ml-auto px-3 py-1 rounded-lg text-xs font-semibold border ${showLive ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-gray-700/30 text-gray-400 border-gray-700/20'}`}>
            {showLive ? (lang === 'cs' ? 'Skrýt živé výsledky' : 'Hide live results') : (lang === 'cs' ? 'Zobrazit živé výsledky' : 'Show live results')}
          </button>
        </div>

        {/* Overview (live) */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-2">{lang === 'cs' ? 'Přehled subškál' : 'Subscale Overview'}</h2>
          <p className="text-gray-500 text-xs mb-6">{lang === 'cs' ? `Celkové skóre: ${totalScore} (DASS-${showDass21 ? '21' : '42'})` : `Total score: ${totalScore} (DASS-${showDass21 ? '21' : '42'})`}</p>
          
          {['depression', 'anxiety', 'stress'].map(sub => {
            const score = activeScores[sub];
            const sev = getSeverityLevel(score, activeSeverity[sub]);
            return (
              <div key={sub} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: SUBSCALE_COLORS[sub] }} />
                    <span className="text-sm font-semibold" style={{ color: SUBSCALE_COLORS[sub] }}>{SUBSCALE_LABELS[lang][sub]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-300">{score}/{activeMax}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ color: sev.color, background: sev.color + '20' }}>
                      {SEVERITY_LABELS[lang][sev.key]}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-full h-2.5 overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(score / activeMax) * 100}%`, background: SUBSCALE_COLORS[sub] }} />
                </div>
                <p className="text-xs text-gray-500">{SUBSCALE_DESC[lang][sub]}</p>
              </div>
            );
          })}
          </div>
        )}

        {/* Severity cutoffs table (live) */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">{lang === 'cs' ? 'Škála závažnosti' : 'Severity Scale'} (DASS-{showDass21 ? '21' : '42'})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-1"></th>
                  {['depression', 'anxiety', 'stress'].map(sub => (
                    <th key={sub} className="text-center py-1" style={{ color: SUBSCALE_COLORS[sub] }}>{SUBSCALE_LABELS[lang][sub]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['normal', 'mild', 'moderate', 'severe', 'extremelySevere'].map(key => (
                  <tr key={key} className="border-t border-gray-800/50">
                    <td className="py-1.5 text-gray-400">{SEVERITY_LABELS[lang][key]}</td>
                    {['depression', 'anxiety', 'stress'].map(sub => {
                      const level = activeSeverity[sub].find(s => s.key === key);
                      const isActive = level && activeScores[sub] >= level.min && activeScores[sub] <= level.max;
                      return (
                        <td key={sub} className={`text-center py-1.5 font-mono ${isActive ? 'font-bold' : 'text-gray-600'}`} style={isActive ? { color: level.color } : {}}>
                          {level ? `${level.min}–${level.max}` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {/* Item breakdown by subscale (live) */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{lang === 'cs' ? 'Detail odpovědí podle subškál' : 'Answers by Subscale'}</h3>
          {['depression', 'anxiety', 'stress'].map(sub => {
            const indices = showDass21 ? DASS21_SUBSET[sub] : DASS42_SUBSCALES[sub];
            return (
              <div key={sub} className="mb-6 last:mb-0">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: SUBSCALE_COLORS[sub] }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: SUBSCALE_COLORS[sub] }} />
                  {SUBSCALE_LABELS[lang][sub]}
                </h4>
                <div className="space-y-2">
                  {indices.map(i => {
                    const val = answers[i] ?? 0;
                    const colr = val === 0 ? '#4ADE80' : val === 1 ? '#FBBF24' : val === 2 ? '#FB923C' : '#F87171';
                    return (
                      <div key={i} className="p-2 rounded-lg border border-gray-800/30 bg-gray-800/10">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-xs text-gray-600 shrink-0">{i + 1}.</span>
                          <span className="text-xs text-gray-400 flex-1 line-clamp-2">{questions[i]}</span>
                          <span className="text-xs font-mono font-bold shrink-0" style={{ color: colr }}>{val}</span>
                        </div>
                        <div className="bg-gray-800 rounded-full h-1 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(val / 3) * 100}%`, background: colr }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* Validity */}
        <ValiditySection validity={validity} lang={lang} t={t} scaleMax={3} />

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 mb-6">
          <p className="text-amber-400/80 text-xs leading-relaxed">
            {lang === 'cs'
              ? '⚠ DASS je screeningový nástroj měřící aktuální příznaky deprese, úzkosti a stresu za poslední týden. Nejedná se o diagnostický test. Konzultujte výsledky s kvalifikovaným odborníkem.'
              : '⚠ DASS is a screening tool measuring current symptoms of depression, anxiety and stress over the past week. It is not a diagnostic test. Consult results with a qualified professional.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {onSave && <button onClick={onSave} className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white font-semibold transition-all">{t('saveResult')}</button>}
          <button onClick={() => {
            const data = {
              test: showDass21 ? 'DASS-21' : 'DASS-42',
              subscales: activeScores,
              severity: Object.fromEntries(Object.entries(activeScores).map(([sub, score]) => [sub, getSeverityLevel(score, activeSeverity[sub]).key])),
              answers,
              date: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `dass${showDass21 ? '21' : '42'}_results.json`; a.click();
          }} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">📦 JSON</button>
          <button onClick={onBack} className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl text-gray-400 font-semibold transition-all">{t('menu')}</button>
        </div>
      </div>
    </div>
  );
}
