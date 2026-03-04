/**
 * PHQ-9 Results page
 */
import { useState, useMemo, useEffect } from 'react';
import { PHQ9_SEVERITY, PHQ9_CRITICAL_ITEM } from '../data/phq9';
import { SeverityBadge, ScoreBar, ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

export default function PHQ9Results({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
    const [showCompare, setShowCompare] = useState(false);
    const [compareType, setCompareType] = useState(null);
    const [otherScore, setOtherScore] = useState(null);
    const [otherLabel, setOtherLabel] = useState('');
    // Reference averages (example values)
    const POP_AVG = 4;
    const MDD_AVG = 18;
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 3; // 27
  const severity = PHQ9_SEVERITY.find(s => total >= s.min && total <= s.max) || PHQ9_SEVERITY[0];
  const criticalScore = answers[PHQ9_CRITICAL_ITEM] || 0;
  const validity = useMemo(() => checkSimpleValidity(answers, questions.length, 0, 3, lang), [answers, questions.length, lang]);

  const SEVERITY_LABELS = {
    cs: { minimal: 'Minimální deprese', mild: 'Mírná deprese', moderate: 'Středně těžká deprese', moderatelySevere: 'Středně těžká až těžká deprese', severe: 'Těžká deprese' },
    en: { minimal: 'Minimal depression', mild: 'Mild depression', moderate: 'Moderate depression', moderatelySevere: 'Moderately severe depression', severe: 'Severe depression' },
  };

  const SEVERITY_DESC = {
    cs: {
      minimal: 'Vaše skóre naznačuje minimální nebo žádné příznaky deprese. Nevyžaduje se žádná specifická léčba.',
      mild: 'Mírné příznaky deprese. Doporučuje se sledování a opakované vyšetření. Zvažte poradenství.',
      moderate: 'Středně těžké příznaky deprese. Zvažte psychoterapii a/nebo farmakoterapii.',
      moderatelySevere: 'Středně těžké až těžké příznaky deprese. Doporučuje se aktivní léčba — psychoterapie a/nebo antidepresiva.',
      severe: 'Těžké příznaky deprese. Důrazně se doporučuje okamžitá odborná pomoc — kombinace psychoterapie a farmakoterapie.',
    },
    en: {
      minimal: 'Your score suggests minimal or no depressive symptoms. No specific treatment required.',
      mild: 'Mild depressive symptoms. Monitoring and repeat assessment recommended. Consider counseling.',
      moderate: 'Moderate depressive symptoms. Consider psychotherapy and/or pharmacotherapy.',
      moderatelySevere: 'Moderately severe depressive symptoms. Active treatment recommended — psychotherapy and/or antidepressants.',
      severe: 'Severe depressive symptoms. Immediate professional help strongly recommended — combined psychotherapy and pharmacotherapy.',
    },
  };

  const [showLive, setShowLive] = useState(() => {
    try {
      const v = localStorage.getItem('phq9_showLiveResults');
      return v === null ? true : v === 'true';
    } catch (e) { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('phq9_showLiveResults', showLive); } catch (e) {}
  }, [showLive]);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm">← {t('back')}</button>
          <span className="text-sm font-semibold text-emerald-400">PHQ-9 — {lang === 'cs' ? 'Výsledky' : 'Results'}</span>
          <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
        </div>

        {/* Compare button */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => setShowCompare(true)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 transition-all">
            {lang === 'cs' ? 'Porovnat s…' : 'Compare with…'}
          </button>
          <button onClick={() => setShowLive(s => !s)} className={`ml-auto px-3 py-1 rounded-lg text-xs font-semibold border ${showLive ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-gray-700/30 text-gray-400 border-gray-700/20'}`}>
            {showLive ? (lang === 'cs' ? 'Skrýt živé výsledky' : 'Hide live results') : (lang === 'cs' ? 'Zobrazit živé výsledky' : 'Show live results')}
          </button>
        </div>

        {/* Compare Modal */}
        {showCompare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-bold text-emerald-300 mb-4">{lang === 'cs' ? 'Porovnat výsledky' : 'Compare Results'}</h2>
              <div className="space-y-3 mb-4">
                <button onClick={() => { setCompareType('other'); setOtherScore(null); setOtherLabel(''); }} className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border ${compareType==='other' ? 'bg-emerald-800/30 border-emerald-400 text-emerald-200' : 'bg-gray-900/30 border-gray-700 text-gray-400 hover:text-gray-200'}`}>{lang === 'cs' ? 'S jiným člověkem' : 'With another person'}</button>
                <button onClick={() => { setCompareType('pop'); setOtherScore(POP_AVG); setOtherLabel(lang==='cs'?'Průměr populace':'Population average'); }} className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border ${compareType==='pop' ? 'bg-emerald-800/30 border-emerald-400 text-emerald-200' : 'bg-gray-900/30 border-gray-700 text-gray-400 hover:text-gray-200'}`}>{lang === 'cs' ? 'S průměrem populace' : 'With population average'}</button>
                <button onClick={() => { setCompareType('mdd'); setOtherScore(MDD_AVG); setOtherLabel(lang==='cs'?'Průměr u deprese (MDD)':'Average for depression (MDD)'); }} className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border ${compareType==='mdd' ? 'bg-emerald-800/30 border-emerald-400 text-emerald-200' : 'bg-gray-900/30 border-gray-700 text-gray-400 hover:text-gray-200'}`}>{lang === 'cs' ? 'S průměrem u deprese (MDD)' : 'With average for depression (MDD)'}</button>
              </div>
              {compareType === 'other' && (
                <div className="mb-4">
                  <label className="block text-xs text-gray-400 mb-1">{lang === 'cs' ? 'Vlož JSON výsledků druhé osoby (číslo):' : 'Paste JSON of other person’s result (number):'}</label>
                  <input type="text" className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-xs text-gray-200 mb-2" placeholder="12" value={otherLabel} onChange={e => setOtherLabel(e.target.value)} />
                  <button onClick={() => {
                    const val = parseInt(otherLabel);
                    if (!isNaN(val)) setOtherScore(val);
                    else alert('Invalid number');
                  }} className="px-3 py-1 rounded bg-emerald-700 text-white text-xs font-semibold">{lang === 'cs' ? 'Načíst' : 'Load'}</button>
                </div>
              )}
              {otherScore !== null && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-emerald-200 mb-2">{lang === 'cs' ? 'Porovnání celkového skóre' : 'Total Score Comparison'}</h3>
                  <table className="w-full text-xs mb-2">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left py-1"></th>
                        <th className="text-center py-1">{lang === 'cs' ? 'Vy' : 'You'}</th>
                        <th className="text-center py-1">{compareType==='other'? (lang==='cs'?'Druhý člověk':'Other person') : otherLabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-800/50">
                        <td className="py-1.5 text-gray-400">PHQ-9</td>
                        <td className="text-center py-1.5 font-mono text-emerald-300">{total}</td>
                        <td className="text-center py-1.5 font-mono text-emerald-400">{otherScore}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="relative h-4 bg-gray-800 rounded-full mt-2">
                    <div className="absolute left-0 top-0 h-4 rounded-full" style={{width:`${(total/maxScore)*100}%`,background:severity.color,opacity:0.7}} />
                    <div className="absolute left-0 top-0 h-4 rounded-full" style={{width:`${(otherScore/maxScore)*100}%`,background:severity.color,opacity:0.3}} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                    <span>{lang==='cs'?'Vy':'You'}: {total}</span>
                    <span>{compareType==='other'? (lang==='cs'?'Druhý':'Other') : otherLabel}: {otherScore}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={()=>setShowCompare(false)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700">{lang==='cs'?'Zavřít':'Close'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Total score (live) */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-4">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold font-mono" style={{ color: severity.color }}>{total}</div>
            <div className="text-gray-500 text-sm">/ {maxScore}</div>
          </div>
          <ScoreBar value={total} max={maxScore} color={severity.color} />
          <div className="mt-4">
            <SeverityBadge score={total} severityLevels={PHQ9_SEVERITY} lang={lang} />
          </div>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">{SEVERITY_DESC[lang]?.[severity.key]}</p>
          </div>
        )}

        {/* Critical item warning */}
        {criticalScore > 0 && (
          <div className="bg-red-950/30 rounded-2xl border border-red-500/30 p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-red-400 font-semibold text-sm mb-1">{lang === 'cs' ? 'Upozornění — Položka 9 (Sebevražedné myšlenky)' : 'Warning — Item 9 (Suicidal Ideation)'}</h3>
                <p className="text-red-300/80 text-xs leading-relaxed">
                  {lang === 'cs'
                    ? `Odpověděl/a jste ${criticalScore} na otázku o myšlenkách na sebepoškození. Jakýkoli kladný skór na této položce vyžaduje podrobnější klinické vyšetření a posouzení bezpečnosti. Pokud máte aktuální sebevražedné myšlenky, kontaktujte prosím krizovou linku (116 123) nebo vyhledejte odbornou pomoc.`
                    : `You answered ${criticalScore} on the question about self-harm thoughts. Any positive score on this item requires further clinical assessment and safety evaluation. If you are currently having suicidal thoughts, please contact a crisis helpline or seek professional help immediately.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Item breakdown (live) */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{lang === 'cs' ? 'Detail odpovědí' : 'Answer Breakdown'}</h3>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const val = answers[i] ?? 0;
              const isItem9 = i === PHQ9_CRITICAL_ITEM;
              return (
                <div key={i} className={`p-3 rounded-xl border ${isItem9 && val > 0 ? 'border-red-500/30 bg-red-950/10' : 'border-gray-800/50 bg-gray-800/20'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs text-gray-600 shrink-0 mt-0.5">{i + 1}.</span>
                    <span className="text-xs text-gray-400 flex-1">{q}</span>
                    <span className="text-sm font-mono font-bold shrink-0" style={{ color: val === 0 ? '#4ADE80' : val === 1 ? '#FBBF24' : val === 2 ? '#FB923C' : '#F87171' }}>{val}</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(val / 3) * 100}%`, background: val === 0 ? '#4ADE80' : val === 1 ? '#FBBF24' : val === 2 ? '#FB923C' : '#F87171' }} />
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        {/* Severity scale reference (live) */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">{lang === 'cs' ? 'Škála závažnosti PHQ-9' : 'PHQ-9 Severity Scale'}</h3>
          <div className="space-y-2">
            {PHQ9_SEVERITY.map(s => (
              <div key={s.key} className={`flex items-center gap-3 p-2 rounded-lg ${total >= s.min && total <= s.max ? 'bg-gray-800/60 border border-gray-700/50' : ''}`}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-gray-400 flex-1">{SEVERITY_LABELS[lang]?.[s.key]}</span>
                <span className="text-xs font-mono text-gray-600">{s.min}–{s.max}</span>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Validity */}
        <ValiditySection validity={validity} lang={lang} t={t} scaleMax={3} />

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 mb-6">
          <p className="text-amber-400/80 text-xs leading-relaxed">
            {lang === 'cs'
              ? '⚠ PHQ-9 je screeningový nástroj, nikoli diagnostický test. Výsledky slouží pouze k orientaci a nenahrazují odborné klinické vyšetření. Pro diagnózu deprese je nutné vyšetření kvalifikovaným odborníkem.'
              : '⚠ PHQ-9 is a screening tool, not a diagnostic test. Results are for informational purposes only and do not replace professional clinical assessment. A diagnosis of depression requires evaluation by a qualified professional.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {onSave && <button onClick={onSave} className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white font-semibold transition-all">{t('saveResult')}</button>}
          <button onClick={() => {
            const data = { test: 'PHQ-9', score: total, severity: severity.key, item9: criticalScore, answers, date: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'phq9_results.json'; a.click();
          }} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">📦 JSON</button>
          <button onClick={onBack} className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl text-gray-400 font-semibold transition-all">{t('menu')}</button>
        </div>
      </div>
    </div>
  );
}
