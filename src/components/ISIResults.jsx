/**
 * ISI Results page — Insomnia Severity Index
 */
import { useMemo, useState, useEffect } from 'react';
import CompareModal from './CompareModal';
import { ISI_SEVERITY } from '../data/isi';
import { SeverityBadge, ScoreBar, ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

export default function ISIResults({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = 28;
  const severity = ISI_SEVERITY.find(s => total >= s.min && total <= s.max) || ISI_SEVERITY[0];
  const validity = useMemo(() => checkSimpleValidity(answers, 7, 0, 4, lang), [answers, lang]);

  const [showLive, setShowLive] = useState(() => {
    try { const v = localStorage.getItem('isi_showLiveResults'); return v === null ? true : v === 'true'; } catch (e) { return true; }
  });
  useEffect(() => { try { localStorage.setItem('isi_showLiveResults', showLive); } catch (e) {} }, [showLive]);

  const [showCompare, setShowCompare] = useState(false);

  const SEVERITY_DESC = {
    cs: {
      none: 'Vaše skóre nenaznačuje klinicky významnou nespavost. Spánkový režim je v normě.',
      subthreshold: 'Mírné potíže se spánkem, které nedosahují klinické závažnosti. Doporučuje se sledování a dodržování spánkové hygieny.',
      moderate: 'Středně těžká nespavost. Doporučuje se konzultace s odborníkem na spánek. Zvažte kognitivně-behaviorální terapii nespavosti (KBT-I).',
      severe: 'Těžká nespavost vyžadující odbornou péči. Důrazně se doporučuje klinické vyšetření a léčba (KBT-I a/nebo farmakoterapie).',
    },
    en: {
      none: 'Your score does not suggest clinically significant insomnia. Sleep pattern is within normal range.',
      subthreshold: 'Mild sleep difficulties not reaching clinical significance. Monitoring and sleep hygiene practices recommended.',
      moderate: 'Moderate clinical insomnia. Consultation with a sleep specialist recommended. Consider cognitive behavioral therapy for insomnia (CBT-I).',
      severe: 'Severe clinical insomnia requiring professional care. Clinical evaluation and treatment strongly recommended (CBT-I and/or pharmacotherapy).',
    },
  };

  const ITEM_GROUPS = {
    cs: [
      { label: 'Závažnost nespavosti', items: [0, 1, 2] },
      { label: 'Spokojenost se spánkem', items: [3] },
      { label: 'Dopad na fungování', items: [4, 5] },
      { label: 'Znepokojení', items: [6] },
    ],
    en: [
      { label: 'Insomnia Severity', items: [0, 1, 2] },
      { label: 'Sleep Satisfaction', items: [3] },
      { label: 'Functional Impact', items: [4, 5] },
      { label: 'Distress', items: [6] },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm">{t('back')}</button>
          <span className="text-sm font-semibold text-indigo-400">ISI — {lang === 'cs' ? 'Výsledky' : 'Results'}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCompare(true)} className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-200">{lang === 'cs' ? 'Porovnat' : 'Compare'}</button>
            <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-gray-800 text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
            <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
          </div>
        </div>

        {showCompare && (
          <CompareModal onClose={() => setShowCompare(false)} current={(typeof total !== 'undefined') ? total : answers} currentLabel={lang === 'cs' ? 'Vy' : 'You'} lang={lang} />
        )}

        {/* Total score */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-4">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold font-mono" style={{ color: severity.color }}>{total}</div>
            <div className="text-gray-500 text-sm">/ {maxScore}</div>
          </div>
          <ScoreBar value={total} max={maxScore} color={severity.color} />
          <div className="mt-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: severity.color + '20', color: severity.color }}>{severity[lang]}</span>
          </div>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">{SEVERITY_DESC[lang]?.[severity.key]}</p>
          </div>
        )}

        {/* Item breakdown by group */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{lang === 'cs' ? 'Detail odpovědí' : 'Answer Breakdown'}</h3>
          {ITEM_GROUPS[lang].map((group, gi) => (
            <div key={gi} className="mb-4 last:mb-0">
              <div className="text-xs font-semibold text-gray-500 mb-2">{group.label}</div>
              <div className="space-y-2">
                {group.items.map(i => {
                  const val = answers[i] ?? 0;
                  const pct = val / 4;
                  const color = pct <= 0.25 ? '#4ADE80' : pct <= 0.5 ? '#FBBF24' : pct <= 0.75 ? '#FB923C' : '#F87171';
                  return (
                    <div key={i} className="p-3 rounded-xl border border-gray-800/50 bg-gray-800/20">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs text-gray-600 shrink-0 mt-0.5">{i + 1}.</span>
                        <span className="text-xs text-gray-400 flex-1">{questions[i]}</span>
                        <span className="text-sm font-mono font-bold shrink-0" style={{ color }}>{val}</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Severity scale reference */}
        {showLive && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">{lang === 'cs' ? 'Škála závažnosti ISI' : 'ISI Severity Scale'}</h3>
          <div className="space-y-2">
            {ISI_SEVERITY.map(s => (
              <div key={s.key} className={`flex items-center gap-3 p-2 rounded-lg ${total >= s.min && total <= s.max ? 'bg-gray-800/60 border border-gray-700/50' : ''}`}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-gray-400 flex-1">{s[lang]}</span>
                <span className="text-xs font-mono text-gray-600">{s.min}–{s.max}</span>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Validity */}
        <ValiditySection validity={validity} lang={lang} t={t} scaleMax={4} />

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 mb-6">
          <p className="text-amber-400/80 text-xs leading-relaxed">
            {lang === 'cs'
              ? '⚠ ISI je screeningový nástroj nespavosti. Výsledky slouží pouze k orientaci a nenahrazují spánkové vyšetření. Pro diagnózu nespavosti je nutné vyšetření odborníkem na spánek.'
              : '⚠ ISI is a screening tool for insomnia. Results are for informational purposes only and do not replace a sleep assessment. A diagnosis of insomnia requires evaluation by a sleep specialist.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {onSave && <button onClick={onSave} className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white font-semibold transition-all">{t('saveResult')}</button>}
          <button onClick={() => {
            const data = { test: 'ISI', score: total, severity: severity.key, answers, date: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'isi_results.json'; a.click();
          }} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">📦 JSON</button>
          <button onClick={onBack} className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl text-gray-400 font-semibold transition-all">{t('menu')}</button>
        </div>
      </div>
    </div>
  );
}
