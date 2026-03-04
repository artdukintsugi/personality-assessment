/**
 * PHQ-9 Results page
 */
import { useMemo } from 'react';
import { PHQ9_SEVERITY, PHQ9_CRITICAL_ITEM } from '../data/phq9';
import { SeverityBadge, ScoreBar, ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

export default function PHQ9Results({ answers, questions, lang, t, onBack, toggleLang }) {
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

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm">← {t('back')}</button>
          <span className="text-sm font-semibold text-emerald-400">PHQ-9 — {lang === 'cs' ? 'Výsledky' : 'Results'}</span>
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
            <SeverityBadge score={total} severityLevels={PHQ9_SEVERITY} lang={lang} />
          </div>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">{SEVERITY_DESC[lang]?.[severity.key]}</p>
        </div>

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

        {/* Item breakdown */}
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

        {/* Severity scale reference */}
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

        {/* Export */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">📦 {t('exportResults')}</h3>
          <button onClick={() => {
            const data = { test: 'PHQ-9', score: total, severity: severity.key, item9: criticalScore, answers, date: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'phq9_results.json'; a.click();
          }} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/60 transition-all text-left w-full">
            <div className="text-sm font-semibold text-gray-300">{lang === 'cs' ? 'JSON Export' : 'JSON Export'}</div>
            <div className="text-xs text-gray-500">{lang === 'cs' ? 'Stáhnout výsledky jako JSON' : 'Download results as JSON'}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
