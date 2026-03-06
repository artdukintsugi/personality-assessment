import React, { useState } from 'react';
import { useLocalStorage } from '../lib/hooks';
import CompareModal from './CompareModal';
import { AQ10_QUESTIONS, AQ10_SCALE, AQ10_SEVERITY, scoreAQ10 } from '../data/aq10';
import { ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

export default function AQ10Results({ answers, lang, t, onBack, toggleLang, onSave }) {
  const q = AQ10_QUESTIONS[lang] || AQ10_QUESTIONS.cs;
  const scaleLabels = AQ10_SCALE[lang] || AQ10_SCALE.cs;
  const { total, binaryScores } = scoreAQ10(answers);
  const validity = checkSimpleValidity(answers, 10, 0, 3, lang);
  const [showLive, setShowLive] = useLocalStorage('aq10_showLiveResults', true);
  const [showCompare, setShowCompare] = useState(false);

  const severity = AQ10_SEVERITY.find(s => total >= s.min && total <= s.max) || AQ10_SEVERITY[0];
  const elevated = total >= 6;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">AQ-10 — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCompare(true)} className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-200">{lang === 'cs' ? 'Porovnat' : 'Compare'}</button>
          <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-gray-800 text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
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
            <div className="text-4xl font-bold mb-1" style={{ color: severity.color }}>{total}<span className="text-lg text-gray-500">/10</span></div>
            <span className="inline-block px-4 py-2 rounded-full text-lg font-bold mt-2" style={{ background: severity.color + '33', color: severity.color, border: `2px solid ${severity.color}` }}>
              {severity[lang] || severity.cs}
            </span>
          </div>
          <div className="text-xs text-gray-400 text-center mt-3">
            {lang === 'cs'
              ? 'Klinicky relevantní práh: ≥ 6 bodů'
              : 'Clinically relevant threshold: ≥ 6 points'}
          </div>
        </div>
      )}

      {/* Item breakdown */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700 animate-slide-up delay-100">
          <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Odpovědi (10 položek)' : 'Answers (10 items)'}</h3>
          <div className="space-y-2">
            {Array.from({ length: 10 }, (_, i) => {
              const raw = answers?.[i] ?? 2;
              const hit = binaryScores[i] === 1;
              return (
                <div key={i} className={`flex items-start gap-2 text-sm px-2 py-1 rounded ${hit ? 'bg-indigo-900/20 border border-indigo-700/30' : ''}`}>
                  <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
                  <span className="text-gray-300 flex-1">{q[i]}</span>
                  <span className="text-gray-500 text-xs w-24 text-right">{scaleLabels[raw]}</span>
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
          ? 'AQ-10 je screeningový nástroj a nenahrazuje klinickou diagnostiku poruchy autistického spektra. Výsledky konzultujte s odborníkem.'
          : 'The AQ-10 is a screening tool and does not replace clinical diagnosis of autism spectrum disorder. Discuss results with a professional.'}
      </div>

      {/* Reference */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700/50 animate-slide-up delay-200">
        <div className="text-xs text-gray-500 leading-relaxed">
          Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). Toward brief "Red Flags" for autism spectrum disorders: The Short Autism Spectrum Quotient and the Short Quantitative Checklist in 1,000 cases and 3,000 controls. <em>Journal of the American Academy of Child & Adolescent Psychiatry</em>, 51(2), 202–212.
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
