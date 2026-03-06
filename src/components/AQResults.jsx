import React, { useState } from 'react';
import { useLocalStorage } from '../lib/hooks';
import CompareModal from './CompareModal';
import { AQ_QUESTIONS, AQ_SCALE, AQ_SEVERITY, AQ_SUBSCALES, scoreAQ } from '../data/aq';
import { ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

export default function AQResults({ answers, lang, t, onBack, toggleLang, onSave }) {
  const q = AQ_QUESTIONS[lang] || AQ_QUESTIONS.cs;
  const scaleLabels = AQ_SCALE[lang] || AQ_SCALE.cs;
  const { total, subscales, binaryScores } = scoreAQ(answers);
  const validity = checkSimpleValidity(answers, 50, 0, 3, lang);
  const [showLive, setShowLive] = useLocalStorage('aq_showLiveResults', true);
  const [showCompare, setShowCompare] = useState(false);

  const severity = AQ_SEVERITY.find(s => total >= s.min && total <= s.max) || AQ_SEVERITY[0];
  const elevated = total >= 32;

  return (
    <div className="min-h-screen bg-[#060608] text-white">
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">AQ-50 — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCompare(true)} className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-200">{lang === 'cs' ? 'Porovnat' : 'Compare'}</button>
          <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-white/[0.06] text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
          <button onClick={toggleLang} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 hover:bg-gray-600">{lang === 'cs' ? 'EN' : 'CZ'}</button>
        </div>
      </div>

      {showCompare && (
        <CompareModal onClose={() => setShowCompare(false)} current={total} currentLabel={lang === 'cs' ? 'Vy' : 'You'} lang={lang} />
      )}

      {/* Total score */}
      {showLive && (
        <div className={`rounded-xl p-6 mb-4 border animate-scale-in ${elevated ? 'bg-red-900/30 border-red-700' : 'bg-green-900/30 border-green-700'}`}>
          <div className="text-center mb-3">
            <span className="text-gray-400 text-sm block mb-2">
              {lang === 'cs' ? 'Celkové skóre' : 'Total Score'}
            </span>
            <div className="text-4xl font-bold mb-1" style={{ color: severity.color }}>{total}<span className="text-lg text-gray-500">/50</span></div>
            <span className="inline-block px-4 py-2 rounded-full text-lg font-bold mt-2" style={{ background: severity.color + '33', color: severity.color, border: `2px solid ${severity.color}` }}>
              {severity[lang] || severity.cs}
            </span>
          </div>
          <div className="text-xs text-gray-400 text-center mt-3">
            {lang === 'cs'
              ? 'Klinicky relevantní práh: ≥ 32 bodů'
              : 'Clinically relevant threshold: ≥ 32 points'}
          </div>
        </div>
      )}

      {/* Subscales */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white mb-4">{lang === 'cs' ? 'Subškály (každá 0–10)' : 'Subscales (each 0–10)'}</h3>
          <div className="space-y-3">
            {Object.entries(AQ_SUBSCALES).map(([key, meta]) => {
              const score = subscales[key] ?? 0;
              const pct = (score / 10) * 100;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{meta[lang] || meta.cs}</span>
                    <span className="font-mono text-gray-400">{score}/10</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Item breakdown */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06] animate-slide-up delay-100">
          <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Odpovědi (50 položek)' : 'Answers (50 items)'}</h3>
          <div className="space-y-1">
            {Array.from({ length: 50 }, (_, i) => {
              const raw = answers?.[i] ?? 2;
              const hit = binaryScores[i] === 1;
              return (
                <div key={i} className={`flex items-start gap-2 text-sm px-2 py-1 rounded ${hit ? 'bg-indigo-900/20 border border-indigo-700/30' : ''}`}>
                  <span className="text-gray-500 w-7 shrink-0">{i + 1}.</span>
                  <span className="text-gray-300 flex-1 text-xs">{q[i]}</span>
                  <span className="text-gray-500 text-xs w-20 text-right">{scaleLabels[raw]}</span>
                  <span className={`font-mono w-5 text-right text-xs ${hit ? 'text-indigo-300' : 'text-gray-600'}`}>{hit ? '✓' : '–'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validity */}
      <ValiditySection validity={validity} lang={lang} t={t} scaleMax={3} />

      {/* Disclaimer */}
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-xs animate-slide-up delay-150">
        {lang === 'cs'
          ? 'AQ-50 je screeningový nástroj a nenahrazuje klinickou diagnostiku poruchy autistického spektra. Výsledky konzultujte s odborníkem.'
          : 'The AQ-50 is a screening tool and does not replace clinical diagnosis of autism spectrum disorder. Discuss results with a professional.'}
      </div>

      {/* Reference */}
      <div className="bg-white/[0.06]/50 rounded-xl p-4 mb-4 border border-white/[0.06]/50 animate-slide-up delay-200">
        <div className="text-xs text-gray-500 leading-relaxed">
          Baron-Cohen, S., Wheelwright, S., Skinner, R., Martin, J., & Clubley, E. (2001). The Autism-Spectrum Quotient (AQ): Evidence from Asperger syndrome/high-functioning autism, males and females, scientists and mathematicians. <em>Journal of Autism and Developmental Disorders</em>, 31(1), 5–17.
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
