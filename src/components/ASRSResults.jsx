import React from 'react';
import { ASRS_QUESTIONS, ASRS_SCALE, ASRS_SEVERITY, ASRS_SUBSCALES } from '../data/asrs';
import { checkSimpleValidity, ValiditySection, SeverityBadge, ScoreBar } from './GenericQuestionnaire';

export default function ASRSResults({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const q = ASRS_QUESTIONS[lang] || ASRS_QUESTIONS.cs;
  const scaleLabels = ASRS_SCALE[lang] || ASRS_SCALE.cs;
  const total = (answers || []).reduce((s, v) => s + (v ?? 0), 0);
  const maxScore = 24;
  const validity = checkSimpleValidity(answers, 6, 0, 4, lang);

  // Subscale scores
  const inattScore = ASRS_SUBSCALES.inattention.reduce((s, i) => s + (answers?.[i] ?? 0), 0);
  const hyperScore = ASRS_SUBSCALES.hyperactivity.reduce((s, i) => s + (answers?.[i] ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">ASRS v1.1 — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <button onClick={toggleLang} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 hover:bg-gray-600">{lang === 'cs' ? 'EN' : 'CZ'}</button>
      </div>

      {/* Total score */}
      <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</span>
          <SeverityBadge score={total} severityLevels={ASRS_SEVERITY} lang={lang} />
        </div>
        <div className="text-4xl font-bold text-white mb-1">{total}<span className="text-lg text-gray-500">/{maxScore}</span></div>
        <ScoreBar value={total} max={maxScore} color="#818CF8" label="" />
      </div>

      {/* Subscales */}
      <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Subškály' : 'Subscales'}</h3>
        <ScoreBar value={inattScore} max={12} color="#60A5FA" label={lang === 'cs' ? 'Nepozornost' : 'Inattention'} />
        <ScoreBar value={hyperScore} max={12} color="#F472B6" label={lang === 'cs' ? 'Hyperaktivita / Impulzivita' : 'Hyperactivity / Impulsivity'} />
      </div>

      {/* Item breakdown */}
      <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Odpovědi po položkách' : 'Item Breakdown'}</h3>
        <div className="space-y-2">
          {q.map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
              <span className="text-gray-300 flex-1">{text}</span>
              <span className="text-indigo-300 font-mono w-8 text-right">{answers?.[i] ?? '–'}</span>
              <span className="text-gray-500 text-xs w-20 text-right">{scaleLabels[answers?.[i]] ?? ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Severity scale */}
      <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Stupnice závažnosti' : 'Severity Scale'}</h3>
        <div className="space-y-1">
          {ASRS_SEVERITY.map((s, i) => {
            const active = total >= s.min && total <= s.max;
            return (
              <div key={i} className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${active ? 'bg-gray-700' : ''}`}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-gray-400 w-14">{s.min}–{s.max}</span>
                <span className={active ? 'text-white font-semibold' : 'text-gray-400'}>{s[lang] || s.cs}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validity */}
      <ValiditySection validity={validity} lang={lang} t={t} scaleMax={4} />

      {/* Disclaimer */}
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-xs">
        {lang === 'cs'
          ? 'ASRS v1.1 je screeningový nástroj a nenahrazuje klinickou diagnostiku ADHD. Výsledky konzultujte s odborníkem.'
          : 'The ASRS v1.1 is a screening tool and does not replace clinical ADHD diagnosis. Discuss results with a professional.'}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onSave && (
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500">
            💾 {lang === 'cs' ? 'Uložit do profilu' : 'Save to Profile'}
          </button>
        )}
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 text-sm hover:bg-gray-600">
          ← {lang === 'cs' ? 'Zpět do menu' : 'Back to Menu'}
        </button>
      </div>
    </div>
    </div>
  );
}
