import React, { useState } from 'react';
import { useLocalStorage } from '../lib/hooks';
import CompareModal from './CompareModal';
import { ASRS_QUESTIONS, ASRS_SCALE, ASRS_SEVERITY, scoreASRS } from '../data/asrs';
import { ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

export default function ASRSResults({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const q = ASRS_QUESTIONS[lang] || ASRS_QUESTIONS.cs;
  const scaleLabels = ASRS_SCALE[lang] || ASRS_SCALE.cs;
  const { partA, total, binaryScores } = scoreASRS(answers);
  const validity = checkSimpleValidity(answers, 18, 0, 4, lang);
  const [showLive, setShowLive] = useLocalStorage('asrs_showLiveResults', true);
  const [showCompare, setShowCompare] = useState(false);

  const partASeverity = ASRS_SEVERITY.find(s => partA >= s.min && partA <= s.max) || ASRS_SEVERITY[0];
  const adhd = partA >= 4;

  return (
    <div className="min-h-screen bg-[#060608] text-white">
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">ASRS v1.1 — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCompare(true)} className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-200">{lang === 'cs' ? 'Porovnat' : 'Compare'}</button>
          <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-white/[0.06] text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
          <button onClick={toggleLang} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 hover:bg-gray-600">{lang === 'cs' ? 'EN' : 'CZ'}</button>
        </div>
      </div>

      {showCompare && (
        <CompareModal onClose={() => setShowCompare(false)} current={partA} currentLabel={lang === 'cs' ? 'Vy' : 'You'} lang={lang} />
      )}

      {/* Part A result */}
      {showLive && (
        <div className={`rounded-xl p-6 mb-4 border animate-scale-in ${adhd ? 'bg-red-900/30 border-red-700' : 'bg-green-900/30 border-green-700'}`}>
          <div className="text-center mb-3">
            <span className="text-gray-400 text-sm block mb-2">
              {lang === 'cs' ? 'Part A — Screeningové skóre' : 'Part A — Screening Score'}
            </span>
            <div className="text-4xl font-bold mb-1" style={{ color: partASeverity.color }}>{partA}<span className="text-lg text-gray-500">/6</span></div>
            <span className="inline-block px-4 py-2 rounded-full text-lg font-bold mt-2" style={{ background: partASeverity.color + '33', color: partASeverity.color, border: `2px solid ${partASeverity.color}` }}>
              {partASeverity[lang] || partASeverity.cs}
            </span>
          </div>
          <div className="text-xs text-gray-400 text-center mt-3">
            {lang === 'cs'
              ? 'Hranice pro klinicky signifikantní screening: ≥ 4 položky splněny v Part A'
              : 'Clinical screening threshold: ≥ 4 items met in Part A'}
          </div>
        </div>
      )}

      {/* Part A item breakdown */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06] animate-slide-up delay-100">
          <h3 className="text-lg font-semibold text-white mb-1">{lang === 'cs' ? 'Part A — Screener (položky 1–6)' : 'Part A — Screener (items 1–6)'}</h3>
          <p className="text-xs text-gray-500 mb-3">
            {lang === 'cs'
              ? 'Položky 1–3: práh „Někdy" (≥2) | Položky 4–6: práh „Často" (≥3)'
              : 'Items 1–3: threshold "Sometimes" (≥2) | Items 4–6: threshold "Often" (≥3)'}
          </p>
          <div className="space-y-2">
            {[0,1,2,3,4,5].map(i => {
              const raw = answers?.[i] ?? 0;
              const hit = binaryScores[i] === 1;
              return (
                <div key={i} className={`flex items-start gap-2 text-sm px-2 py-1 rounded ${hit ? 'bg-indigo-900/20 border border-indigo-700/30' : ''}`}>
                  <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
                  <span className="text-gray-300 flex-1">{q[i]}</span>
                  <span className="text-gray-500 text-xs w-20 text-right">{scaleLabels[raw]}</span>
                  <span className={`font-mono w-6 text-right text-xs ${hit ? 'text-indigo-300' : 'text-gray-600'}`}>{hit ? '✓' : '–'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Part B item breakdown */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white mb-1">{lang === 'cs' ? 'Part B — Rozšířená škála (položky 7–18)' : 'Part B — Extended Scale (items 7–18)'}</h3>
          <p className="text-xs text-gray-500 mb-1">{lang === 'cs' ? 'Celkové skóre Part B:' : 'Part B total:'} <span className="text-white font-bold">{total - partA}/12</span></p>
          <p className="text-xs text-gray-500 mb-3">{lang === 'cs' ? 'Celkové skóre (Part A + B):' : 'Total score (Part A + B):'} <span className="text-white font-bold">{total}/18</span></p>
          <div className="space-y-2">
            {[6,7,8,9,10,11,12,13,14,15,16,17].map(i => {
              const raw = answers?.[i] ?? 0;
              const hit = binaryScores[i] === 1;
              return (
                <div key={i} className={`flex items-start gap-2 text-sm px-2 py-1 rounded ${hit ? 'bg-indigo-900/20 border border-indigo-700/30' : ''}`}>
                  <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
                  <span className="text-gray-300 flex-1">{q[i]}</span>
                  <span className="text-gray-500 text-xs w-20 text-right">{scaleLabels[raw]}</span>
                  <span className={`font-mono w-6 text-right text-xs ${hit ? 'text-indigo-300' : 'text-gray-600'}`}>{hit ? '✓' : '–'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validity */}
      <ValiditySection validity={validity} lang={lang} t={t} scaleMax={4} />

      {/* Disclaimer */}
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-xs animate-slide-up delay-150">
        {lang === 'cs'
          ? 'ASRS v1.1 je screeningový nástroj a nenahrazuje klinickou diagnostiku ADHD. Výsledky konzultujte s odborníkem.'
          : 'The ASRS v1.1 is a screening tool and does not replace clinical ADHD diagnosis. Discuss results with a professional.'}
      </div>

      {/* Reference */}
      <div className="bg-white/[0.06]/50 rounded-xl p-4 mb-4 border border-white/[0.06]/50 animate-slide-up delay-200">
        <div className="text-xs text-gray-500 leading-relaxed">
          Kessler, R.C., Adler, L., Ames, M., et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS). <em>Psychological Medicine</em>, 35(2), 245–256.
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onSave && (
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500">
            💾 {lang === 'cs' ? 'Uložit do profilu' : 'Save to Profile'}
          </button>
        )}
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 text-sm hover:bg-gray-600">
          {lang === 'cs' ? 'Zpět do menu' : 'Back to Menu'}
        </button>
      </div>
    </div>
    </div>
  );
}
