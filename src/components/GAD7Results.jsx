/**
 * GAD-7 Results page
 */
import { useMemo } from 'react';
import { GAD7_SEVERITY } from '../data/gad7';
import { SeverityBadge, ScoreBar, ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

export default function GAD7Results({ answers, questions, lang, t, onBack, toggleLang }) {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 3; // 21
  const severity = GAD7_SEVERITY.find(s => total >= s.min && total <= s.max) || GAD7_SEVERITY[0];
  const validity = useMemo(() => checkSimpleValidity(answers, questions.length, 0, 3, lang), [answers, questions.length, lang]);

  const SEVERITY_LABELS = {
    cs: { minimal: 'Minimální úzkost', mild: 'Mírná úzkost', moderate: 'Středně těžká úzkost', severe: 'Těžká úzkost' },
    en: { minimal: 'Minimal anxiety', mild: 'Mild anxiety', moderate: 'Moderate anxiety', severe: 'Severe anxiety' },
  };

  const SEVERITY_DESC = {
    cs: {
      minimal: 'Vaše skóre naznačuje minimální nebo žádné příznaky úzkosti. Nevyžaduje se žádná specifická intervence.',
      mild: 'Mírné příznaky úzkosti. Doporučuje se sledování stavu. Zvažte techniky relaxace a zvládání stresu.',
      moderate: 'Středně těžké příznaky úzkosti. Zvažte psychoterapii (KBT) a/nebo farmakoterapii.',
      severe: 'Těžké příznaky úzkosti. Důrazně se doporučuje odborná pomoc — psychoterapie a/nebo anxiolytika.',
    },
    en: {
      minimal: 'Your score suggests minimal or no anxiety symptoms. No specific intervention required.',
      mild: 'Mild anxiety symptoms. Monitoring recommended. Consider relaxation techniques and stress management.',
      moderate: 'Moderate anxiety symptoms. Consider psychotherapy (CBT) and/or pharmacotherapy.',
      severe: 'Severe anxiety symptoms. Professional help strongly recommended — psychotherapy and/or anxiolytics.',
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm">← {t('back')}</button>
          <span className="text-sm font-semibold text-teal-400">GAD-7 — {lang === 'cs' ? 'Výsledky' : 'Results'}</span>
          <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
        </div>

        {/* Total score */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-4">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold font-mono" style={{ color: severity.color }}>{total}</div>
            <div className="text-gray-500 text-sm">/ {maxScore}</div>
          </div>
          <ScoreBar value={total} max={maxScore} color={severity.color} />
          <div className="mt-4">
            <SeverityBadge score={total} severityLevels={GAD7_SEVERITY} lang={lang} />
          </div>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">{SEVERITY_DESC[lang]?.[severity.key]}</p>
        </div>

        {/* Item breakdown */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{lang === 'cs' ? 'Detail odpovědí' : 'Answer Breakdown'}</h3>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const val = answers[i] ?? 0;
              return (
                <div key={i} className="p-3 rounded-xl border border-gray-800/50 bg-gray-800/20">
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

        {/* Severity scale reference */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">{lang === 'cs' ? 'Škála závažnosti GAD-7' : 'GAD-7 Severity Scale'}</h3>
          <div className="space-y-2">
            {GAD7_SEVERITY.map(s => (
              <div key={s.key} className={`flex items-center gap-3 p-2 rounded-lg ${total >= s.min && total <= s.max ? 'bg-gray-800/60 border border-gray-700/50' : ''}`}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-gray-400 flex-1">{SEVERITY_LABELS[lang]?.[s.key]}</span>
                <span className="text-xs font-mono text-gray-600">{s.min}–{s.max}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Validity */}
        <ValiditySection validity={validity} lang={lang} t={t} scaleMax={3} />

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 mb-6">
          <p className="text-amber-400/80 text-xs leading-relaxed">
            {lang === 'cs'
              ? '⚠ GAD-7 je screeningový nástroj, nikoli diagnostický test. Výsledky slouží pouze k orientaci a nenahrazují odborné klinické vyšetření.'
              : '⚠ GAD-7 is a screening tool, not a diagnostic test. Results are for informational purposes only and do not replace professional clinical assessment.'
            }
          </p>
        </div>

        {/* Export */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">📦 {t('exportResults')}</h3>
          <button onClick={() => {
            const data = { test: 'GAD-7', score: total, severity: severity.key, answers, date: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gad7_results.json'; a.click();
          }} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/60 transition-all text-left w-full">
            <div className="text-sm font-semibold text-gray-300">JSON Export</div>
            <div className="text-xs text-gray-500">{lang === 'cs' ? 'Stáhnout výsledky jako JSON' : 'Download results as JSON'}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
