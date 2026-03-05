import React, { useState } from 'react';
import { useLocalStorage } from '../lib/hooks';
import CompareModal from './CompareModal';
import { EAT26_QUESTIONS, EAT26_SCALE, EAT26_SEVERITY, EAT26_SUBSCALES, EAT26_CUTOFF, scoreEAT26, EAT26_REVERSE_ITEM } from '../data/eat26';
import { checkSimpleValidity, ValiditySection, SeverityBadge, ScoreBar } from './GenericQuestionnaire';

export default function EAT26Results({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const q = EAT26_QUESTIONS[lang] || EAT26_QUESTIONS.cs;
  const scaleLabels = EAT26_SCALE[lang] || EAT26_SCALE.cs;
  const total = scoreEAT26(answers || []);
  const maxScore = 78;
  const validity = checkSimpleValidity(answers, 26, 0, 5, lang);

  // Subscale scores
  const subscaleScores = {};
  for (const [key, sub] of Object.entries(EAT26_SUBSCALES)) {
    let sc = 0;
    for (const i of sub.items) {
      const v = answers?.[i];
      if (v === undefined || v === null) continue;
      if (i === EAT26_REVERSE_ITEM) {
        if (v === 5) sc += 3; else if (v === 4) sc += 2; else if (v === 3) sc += 1;
      } else {
        if (v === 0) sc += 3; else if (v === 1) sc += 2; else if (v === 2) sc += 1;
      }
    }
    subscaleScores[key] = sc;
  }

  const aboveCutoff = total >= EAT26_CUTOFF;

  const [showLive, setShowLive] = useLocalStorage('eat26_showLiveResults', true);

  const [showCompare, setShowCompare] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">EAT-26 — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCompare(true)} className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-200">{lang === 'cs' ? 'Porovnat' : 'Compare'}</button>
          <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-gray-800 text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
          <button onClick={toggleLang} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 hover:bg-gray-600">{lang === 'cs' ? 'EN' : 'CZ'}</button>
        </div>
      </div>

      {showCompare && (
        <CompareModal onClose={() => setShowCompare(false)} current={(typeof total !== 'undefined') ? total : (typeof subscaleScores !== 'undefined' ? subscaleScores : answers)} currentLabel={lang === 'cs' ? 'Vy' : 'You'} lang={lang} />
      )}

      {/* Total score */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</span>
          <SeverityBadge score={total} severityLevels={EAT26_SEVERITY} lang={lang} />
        </div>
        <div className="text-4xl font-bold text-white mb-1">{total}<span className="text-lg text-gray-500">/{maxScore}</span></div>
        <ScoreBar value={total} max={maxScore} color="#F472B6" label="" />
        {aboveCutoff && (
          <div className="mt-3 p-2 bg-red-900/40 border border-red-700 rounded text-red-200 text-sm">
            ⚠️ {lang === 'cs'
              ? `Skóre ≥ ${EAT26_CUTOFF} — doporučeno klinické vyšetření poruch příjmu potravy.`
              : `Score ≥ ${EAT26_CUTOFF} — clinical evaluation for eating disorders is recommended.`}
          </div>
        )}
        </div>
      )}

      {/* Subscales */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Subškály' : 'Subscales'}</h3>
        {Object.entries(EAT26_SUBSCALES).map(([key, sub]) => (
          <ScoreBar
            key={key}
            value={subscaleScores[key]}
            max={sub.items.length * 3}
            color={key === 'dieting' ? '#F472B6' : key === 'bulimia' ? '#FB923C' : '#60A5FA'}
            label={sub[lang] || sub.cs}
          />
        ))}
        </div>
      )}

      {/* Item breakdown */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Odpovědi po položkách' : 'Item Breakdown'}</h3>
        <div className="space-y-2">
          {q.map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
              <span className="text-gray-300 flex-1">{text}</span>
              <span className="text-pink-300 font-mono w-8 text-right">{answers?.[i] ?? '–'}</span>
              <span className="text-gray-500 text-xs w-20 text-right">{scaleLabels[answers?.[i]] ?? ''}</span>
            </div>
          ))}
        </div>
        </div>
      )}

      {/* Severity scale */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Stupnice závažnosti' : 'Severity Scale'}</h3>
        <div className="space-y-1">
          {EAT26_SEVERITY.map((s, i) => {
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
      <ValiditySection validity={validity} lang={lang} t={t} scaleMax={5} />

      {/* Disclaimer */}
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-xs">
        {lang === 'cs'
          ? 'EAT-26 je screeningový nástroj a nenahrazuje klinickou diagnostiku poruch příjmu potravy. Výsledky konzultujte s odborníkem.'
          : 'The EAT-26 is a screening tool and does not replace clinical diagnosis of eating disorders. Discuss results with a professional.'}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onSave && (
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm hover:bg-pink-500">
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
