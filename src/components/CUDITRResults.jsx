import React, { useState } from 'react';
import { useLocalStorage } from '../lib/hooks';
import CompareModal from './CompareModal';
import { CUDITR_QUESTIONS, CUDITR_SCALES, CUDITR_SEVERITY, CUDITR_CUTOFF, scoreCUDITR, Q8_SCORE_MAP } from '../data/cuditr';
import { checkSimpleValidity, ValiditySection, SeverityBadge, ScoreBar } from './GenericQuestionnaire';

export default function CUDITRResults({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const q = CUDITR_QUESTIONS[lang] || CUDITR_QUESTIONS.cs;
  const scales = CUDITR_SCALES[lang] || CUDITR_SCALES.cs;
  const total = scoreCUDITR(answers);
  const maxScore = 32;
  const validity = checkSimpleValidity(answers, 8, 0, 4, lang);
  const aboveCutoff = total >= CUDITR_CUTOFF;

  const [showLive, setShowLive] = useLocalStorage('cuditr_showLiveResults', true);
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div className="min-h-screen bg-[#060608] text-white">
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">CUDIT-R — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCompare(true)} className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-200">{lang === 'cs' ? 'Porovnat' : 'Compare'}</button>
          <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-white/[0.06] text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
          <button onClick={toggleLang} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 hover:bg-gray-600">{lang === 'cs' ? 'EN' : 'CZ'}</button>
        </div>
      </div>

      {showCompare && (
        <CompareModal onClose={() => setShowCompare(false)} current={(typeof total !== 'undefined') ? total : answers} currentLabel={lang === 'cs' ? 'Vy' : 'You'} lang={lang} />
      )}

      {/* Total score */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06] animate-scale-in">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</span>
          <SeverityBadge score={total} severityLevels={CUDITR_SEVERITY} lang={lang} />
        </div>
        <div className="text-4xl font-bold text-white mb-1">{total}<span className="text-lg text-gray-500">/{maxScore}</span></div>
        <ScoreBar value={total} max={maxScore} color="#34D399" label="" />
        {aboveCutoff && (
          <div className="mt-3 p-2 bg-red-900/40 border border-red-700 rounded text-red-200 text-sm">
            ⚠️ {lang === 'cs'
              ? `Skóre ≥ ${CUDITR_CUTOFF} — naznačuje rizikové užívání konopí.${total >= 12 ? ' Skóre ≥ 12 naznačuje možnou poruchu z užívání konopí — doporučeno podrobnější vyšetření.' : ''}`
              : `Score ≥ ${CUDITR_CUTOFF} — indicates hazardous cannabis use.${total >= 12 ? ' Score ≥ 12 suggests possible cannabis use disorder — further assessment recommended.' : ''}`}
          </div>
        )}
        </div>
      )}

      {/* Item breakdown */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06] animate-slide-up delay-100">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Odpovědi po položkách' : 'Item Breakdown'}</h3>
        <div className="space-y-3">
          {q.map((text, i) => {
            const v = answers?.[i];
            const itemLabels = scales[i];
            // For Q8 (index 7), display the actual score (0/2/4) not the answer index
            const displayScore = (v !== undefined && v !== null) ? (i === 7 ? (Q8_SCORE_MAP[v] ?? v) : v) : null;
            return (
              <div key={i} className="text-sm">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
                  <span className="text-gray-300 flex-1">{text}</span>
                  <span className="text-emerald-300 font-mono w-8 text-right">{displayScore ?? '–'}</span>
                </div>
                {v !== undefined && v !== null && itemLabels?.[v] && (
                  <div className="ml-8 text-gray-500 text-xs">{itemLabels[v]}</div>
                )}
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* Severity scale */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Stupnice závažnosti' : 'Severity Scale'}</h3>
        <div className="space-y-1">
          {CUDITR_SEVERITY.map((s, i) => {
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
      )}

      {/* Validity */}
      <ValiditySection validity={validity} lang={lang} t={t} scaleMax={4} />

      {/* Disclaimer */}
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-xs animate-slide-up delay-150">
        {lang === 'cs'
          ? 'CUDIT-R je screeningový nástroj a nenahrazuje klinickou diagnostiku poruchy z užívání konopí. Výsledky konzultujte s odborníkem.'
          : 'The CUDIT-R is a screening tool and does not replace clinical diagnosis of cannabis use disorder. Discuss results with a professional.'}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onSave && (
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500">
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
