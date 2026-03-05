import React, { useState } from 'react';
import { useLocalStorage } from '../lib/hooks';
import CompareModal from './CompareModal';
import { AUDIT_QUESTIONS, AUDIT_SCALES, AUDIT_SEVERITY, AUDIT_SUBSCALES, scoreAUDIT, scoreAUDITSubscale, Q910_SCORE_MAP } from '../data/audit';
import { checkSimpleValidity, ValiditySection, SeverityBadge, ScoreBar } from './GenericQuestionnaire';

export default function AUDITResults({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const q = AUDIT_QUESTIONS[lang] || AUDIT_QUESTIONS.cs;
  const scales = AUDIT_SCALES[lang] || AUDIT_SCALES.cs;
  const total = scoreAUDIT(answers);
  const maxScore = 40;
  const validity = checkSimpleValidity(answers, 10, 0, 4, lang);
  const [showLive, setShowLive] = useLocalStorage('audit_showLiveResults', true);
  const [showCompare, setShowCompare] = useState(false);

  // Subscale scores
  const hazScore = scoreAUDITSubscale(answers, 'hazardous');
  const depScore = scoreAUDITSubscale(answers, 'dependence');
  const harmScore = scoreAUDITSubscale(answers, 'harmful');

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">AUDIT — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCompare(true)} className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-200">{lang === 'cs' ? 'Porovnat' : 'Compare'}</button>
          <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-gray-800 text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
          <button onClick={toggleLang} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 hover:bg-gray-600">{lang === 'cs' ? 'EN' : 'CZ'}</button>
        </div>
      </div>

      {/* Compare modal */}
      {showCompare && (
        <CompareModal onClose={() => setShowCompare(false)} current={(typeof total !== 'undefined') ? total : answers} currentLabel={lang === 'cs' ? 'Vy' : 'You'} lang={lang} />
      )}

      {/* Total score */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</span>
          <SeverityBadge score={total} severityLevels={AUDIT_SEVERITY} lang={lang} />
        </div>
        <div className="text-4xl font-bold text-white mb-1">{total}<span className="text-lg text-gray-500">/{maxScore}</span></div>
        <ScoreBar value={total} max={maxScore} color="#F59E0B" label="" />
        </div>
      )}

      {/* Subscales */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Subškály' : 'Subscales'}</h3>
        <ScoreBar value={hazScore} max={12} color={AUDIT_SUBSCALES.hazardous.color} label={AUDIT_SUBSCALES.hazardous[lang] || AUDIT_SUBSCALES.hazardous.cs} />
        <ScoreBar value={depScore} max={12} color={AUDIT_SUBSCALES.dependence.color} label={AUDIT_SUBSCALES.dependence[lang] || AUDIT_SUBSCALES.dependence.cs} />
        <ScoreBar value={harmScore} max={16} color={AUDIT_SUBSCALES.harmful.color} label={AUDIT_SUBSCALES.harmful[lang] || AUDIT_SUBSCALES.harmful.cs} />
        </div>
      )}

      {/* WHO intervention zones */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Intervenční zóny WHO' : 'WHO Intervention Zones'}</h3>
        <div className="space-y-2 text-sm">
          <div className={`flex items-start gap-2 px-3 py-2 rounded-lg ${total <= 7 ? 'bg-green-900/30 border border-green-700/30' : 'opacity-50'}`}>
            <span className="w-3 h-3 rounded-full bg-green-400 mt-1 shrink-0" />
            <div>
              <span className="font-medium text-green-300">{lang === 'cs' ? 'Zóna I (0–7)' : 'Zone I (0–7)'}</span>
              <span className="text-gray-400 ml-2">{lang === 'cs' ? '— Edukace o alkoholu' : '— Alcohol education'}</span>
            </div>
          </div>
          <div className={`flex items-start gap-2 px-3 py-2 rounded-lg ${total >= 8 && total <= 15 ? 'bg-yellow-900/30 border border-yellow-700/30' : 'opacity-50'}`}>
            <span className="w-3 h-3 rounded-full bg-yellow-400 mt-1 shrink-0" />
            <div>
              <span className="font-medium text-yellow-300">{lang === 'cs' ? 'Zóna II (8–15)' : 'Zone II (8–15)'}</span>
              <span className="text-gray-400 ml-2">{lang === 'cs' ? '— Krátká intervence' : '— Brief advice'}</span>
            </div>
          </div>
          <div className={`flex items-start gap-2 px-3 py-2 rounded-lg ${total >= 16 && total <= 19 ? 'bg-orange-900/30 border border-orange-700/30' : 'opacity-50'}`}>
            <span className="w-3 h-3 rounded-full bg-orange-400 mt-1 shrink-0" />
            <div>
              <span className="font-medium text-orange-300">{lang === 'cs' ? 'Zóna III (16–19)' : 'Zone III (16–19)'}</span>
              <span className="text-gray-400 ml-2">{lang === 'cs' ? '— Krátká intervence + sledování' : '— Brief counseling + monitoring'}</span>
            </div>
          </div>
          <div className={`flex items-start gap-2 px-3 py-2 rounded-lg ${total >= 20 ? 'bg-red-900/30 border border-red-700/30' : 'opacity-50'}`}>
            <span className="w-3 h-3 rounded-full bg-red-400 mt-1 shrink-0" />
            <div>
              <span className="font-medium text-red-300">{lang === 'cs' ? 'Zóna IV (20–40)' : 'Zone IV (20–40)'}</span>
              <span className="text-gray-400 ml-2">{lang === 'cs' ? '— Doporučení na specializované vyšetření' : '— Referral to specialist'}</span>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Item breakdown */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Odpovědi po položkách' : 'Item Breakdown'}</h3>
        <div className="space-y-2">
          {q.map((text, i) => {
            const rawVal = answers?.[i];
            const scored = (i >= 8 && rawVal !== undefined) ? (Q910_SCORE_MAP[rawVal] ?? 0) : (rawVal ?? 0);
            return (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
                <span className="text-gray-300 flex-1">{text}</span>
                <span className="text-amber-300 font-mono w-8 text-right">{scored}</span>
                <span className="text-gray-500 text-xs w-24 text-right truncate">{scales[i]?.[rawVal] ?? ''}</span>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* Severity scale */}
      {showLive && (
        <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Stupnice závažnosti' : 'Severity Scale'}</h3>
        <div className="space-y-1">
          {AUDIT_SEVERITY.map((s, i) => {
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
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-xs">
        {lang === 'cs'
          ? 'AUDIT je screeningový nástroj WHO a nenahrazuje klinickou diagnostiku závislosti na alkoholu. Výsledky konzultujte s odborníkem.'
          : 'The AUDIT is a WHO screening tool and does not replace clinical diagnosis of alcohol dependence. Discuss results with a professional.'}
      </div>

      {/* Reference */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700/50">
        <div className="text-xs text-gray-500 leading-relaxed">
          Saunders JB, Aasland OG, Babor TF, de la Fuente JR, Grant M. (1993). Development of the Alcohol Use Disorders Identification Test (AUDIT). <em>Addiction</em> 88(6):791-804.
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onSave && (
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-500">
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
