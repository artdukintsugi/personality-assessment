import React, { useState } from 'react';
import { useLocalStorage } from '../lib/hooks';
import CompareModal from './CompareModal';
import { DAST10_QUESTIONS, DAST10_SCALE, DAST10_SEVERITY, DAST10_REVERSE_ITEM, scoreDAST10, DAST10_CUTOFF } from '../data/dast10';
import { checkSimpleValidity, ValiditySection, SeverityBadge, ScoreBar } from './GenericQuestionnaire';

export default function DAST10Results({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const q = DAST10_QUESTIONS[lang] || DAST10_QUESTIONS.cs;
  const scale = DAST10_SCALE[lang] || DAST10_SCALE.cs;
  const total = scoreDAST10(answers);
  const maxScore = 10;
  const validity = checkSimpleValidity(answers, 10, 0, 1, lang);
  const aboveCutoff = total >= DAST10_CUTOFF;

  const [showLive, setShowLive] = useLocalStorage('dast10_showLiveResults', true);
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div className="min-h-screen bg-[#060608] text-white">
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">DAST-10 — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
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
          <SeverityBadge score={total} severityLevels={DAST10_SEVERITY} lang={lang} />
        </div>
        <div className="text-4xl font-bold text-white mb-1">{total}<span className="text-lg text-gray-500">/{maxScore}</span></div>
        <ScoreBar value={total} max={maxScore} color="#EF4444" label="" />
        </div>
      )}

      {/* Cutoff alert */}
      {showLive && aboveCutoff && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-4 text-red-200 text-sm flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <span className="font-semibold">{lang === 'cs' ? 'Pozitivní screening' : 'Positive screening'}</span>
            <span className="text-red-300 ml-1">
              {lang === 'cs'
                ? `(skóre ≥ ${DAST10_CUTOFF}) — doporučeno další vyšetření.`
                : `(score ≥ ${DAST10_CUTOFF}) — further evaluation recommended.`}
            </span>
          </div>
        </div>
      )}

      {/* Item breakdown */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06] animate-slide-up delay-100">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Odpovědi po položkách' : 'Item Breakdown'}</h3>
        <div className="space-y-2">
          {q.map((text, i) => {
            const rawVal = answers?.[i];
            const isReverse = (i === DAST10_REVERSE_ITEM);
            // Scoring: normally Yes=1, but item 3 (index 2) is reversed: No=1
            const scored = isReverse ? (rawVal === 0 ? 1 : 0) : (rawVal ?? 0);
            return (
              <div key={i} className={`flex items-start gap-2 text-sm ${isReverse ? 'bg-indigo-900/20 rounded px-2 py-1 border border-indigo-700/30' : ''}`}>
                <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
                <span className="text-gray-300 flex-1">
                  {text}
                  {isReverse && <span className="text-indigo-400 text-xs ml-1">(R)</span>}
                </span>
                <span className="text-red-300 font-mono w-6 text-right">{scored}</span>
                <span className="text-gray-500 text-xs w-12 text-right">{rawVal !== undefined ? scale[rawVal] : '—'}</span>
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
          {DAST10_SEVERITY.map((s, i) => {
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
      <ValiditySection validity={validity} lang={lang} t={t} scaleMax={1} />

      {/* Disclaimer */}
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-xs animate-slide-up delay-150">
        {lang === 'cs'
          ? 'DAST-10 je screeningový nástroj pro identifikaci problémového užívání drog a nenahrazuje klinickou diagnostiku. Výsledky konzultujte s odborníkem.'
          : 'The DAST-10 is a screening tool for identifying problematic drug use and does not replace clinical diagnosis. Discuss results with a professional.'}
      </div>

      {/* Reference */}
      <div className="bg-white/[0.06]/50 rounded-xl p-4 mb-4 border border-white/[0.06]/50 animate-slide-up delay-200">
        <div className="text-xs text-gray-500 leading-relaxed">
          Skinner HA. (1982). The Drug Abuse Screening Test. <em>Addictive Behaviors</em> 7(4):363-371. · Yudko E, Lozhkina O, Fouts A. (2007). A comprehensive review of the psychometric properties of the DAST. <em>J Subst Abuse Treat</em> 32(2):189-198.
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onSave && (
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500">
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
