import React from 'react';
import { MDQ_PART1, MDQ_PART2, MDQ_PART3, MDQ_PART3_SCALE, MDQ_YESNO, scoreMDQ, MDQ_TOTAL_ITEMS } from '../data/mdq';
import { ScoreBar } from './GenericQuestionnaire';

export default function MDQResults({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const part1Q = MDQ_PART1[lang] || MDQ_PART1.cs;
  const yesNo = MDQ_YESNO[lang] || MDQ_YESNO.cs;
  const p3Scale = MDQ_PART3_SCALE[lang] || MDQ_PART3_SCALE.cs;
  const { part1Yes, part2Yes, part3Severity, positive } = scoreMDQ(answers || []);

  // Count answered items
  const answeredCount = (answers || []).filter(v => v !== undefined && v !== null).length;
  const allAnswered = answeredCount === MDQ_TOTAL_ITEMS;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">MDQ — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <button onClick={toggleLang} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 hover:bg-gray-600">{lang === 'cs' ? 'EN' : 'CZ'}</button>
      </div>

      {/* Screening result */}
      <div className={`rounded-xl p-6 mb-4 border ${positive ? 'bg-red-900/30 border-red-700' : 'bg-green-900/30 border-green-700'}`}>
        <div className="text-lg font-bold mb-2" style={{ color: positive ? '#F87171' : '#4ADE80' }}>
          {positive
            ? (lang === 'cs' ? '⚠️ Pozitivní screening' : '⚠️ Positive Screen')
            : (lang === 'cs' ? '✓ Negativní screening' : '✓ Negative Screen')}
        </div>
        <p className="text-gray-300 text-sm">
          {positive
            ? (lang === 'cs'
              ? 'Výsledky naznačují možnou bipolární poruchu. Doporučujeme konzultaci s psychiatrem.'
              : 'Results suggest a possible bipolar disorder. Consultation with a psychiatrist is recommended.')
            : (lang === 'cs'
              ? 'Výsledky nenasvědčují bipolární poruše, ale pokud máte obavy, konzultujte odborníka.'
              : 'Results do not suggest bipolar disorder, but consult a professional if you have concerns.')}
        </p>
      </div>

      {/* Scoring breakdown */}
      <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Kritéria screeningu' : 'Screening Criteria'}</h3>
        <div className="space-y-3">
          {/* Part 1 */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{lang === 'cs' ? 'Část 1: Ano odpovědi' : 'Part 1: Yes answers'} (≥7 {lang === 'cs' ? 'potřeba' : 'needed'})</span>
            <span className={`font-bold ${part1Yes >= 7 ? 'text-red-400' : 'text-green-400'}`}>{part1Yes}/13</span>
          </div>
          <ScoreBar value={part1Yes} max={13} color={part1Yes >= 7 ? '#F87171' : '#4ADE80'} label="" />

          {/* Part 2 */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{lang === 'cs' ? 'Část 2: Současný výskyt' : 'Part 2: Co-occurrence'}</span>
            <span className={`font-bold ${part2Yes ? 'text-red-400' : 'text-green-400'}`}>
              {part2Yes ? yesNo[0] : yesNo[1]}
            </span>
          </div>

          {/* Part 3 */}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{lang === 'cs' ? 'Část 3: Závažnost problémů' : 'Part 3: Problem severity'} (≥2 {lang === 'cs' ? 'potřeba' : 'needed'})</span>
            <span className={`font-bold ${part3Severity >= 2 ? 'text-red-400' : 'text-green-400'}`}>
              {p3Scale[part3Severity] || part3Severity}
            </span>
          </div>
        </div>
      </div>

      {/* Part 1 items */}
      <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Část 1 — Manické příznaky' : 'Part 1 — Manic Symptoms'}</h3>
        <div className="space-y-2">
          {part1Q.map((text, i) => {
            const v = answers?.[i];
            const isYes = v === 0;
            return (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
                <span className="text-gray-300 flex-1">{text}</span>
                <span className={`font-mono w-12 text-right ${isYes ? 'text-red-400' : 'text-green-400'}`}>
                  {v !== undefined && v !== null ? (isYes ? yesNo[0] : yesNo[1]) : '–'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2 & 3 */}
      <div className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Části 2–3' : 'Parts 2–3'}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-gray-500 w-6 shrink-0">14.</span>
            <span className="text-gray-300 flex-1">{(MDQ_PART2[lang] || MDQ_PART2.cs)}</span>
            <span className={`font-mono w-12 text-right ${answers?.[13] === 0 ? 'text-red-400' : 'text-green-400'}`}>
              {answers?.[13] !== undefined && answers?.[13] !== null ? (answers[13] === 0 ? yesNo[0] : yesNo[1]) : '–'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 w-6 shrink-0">15.</span>
            <span className="text-gray-300 flex-1">{(MDQ_PART3[lang] || MDQ_PART3.cs)}</span>
            <span className="text-amber-300 font-mono w-20 text-right">
              {answers?.[14] !== undefined && answers?.[14] !== null ? p3Scale[answers[14]] : '–'}
            </span>
          </div>
        </div>
      </div>

      {/* Validity */}
      {!allAnswered && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-sm">
          ⚠️ {lang === 'cs'
            ? `Zodpovězeno ${answeredCount} z ${MDQ_TOTAL_ITEMS} položek. Výsledky mohou být neúplné.`
            : `Answered ${answeredCount} of ${MDQ_TOTAL_ITEMS} items. Results may be incomplete.`}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-4 text-yellow-200 text-xs">
        {lang === 'cs'
          ? 'MDQ je screeningový nástroj a nenahrazuje klinickou diagnostiku bipolární poruchy. Pozitivní výsledek vyžaduje další vyšetření psychiatrem.'
          : 'The MDQ is a screening tool and does not replace clinical diagnosis of bipolar disorder. A positive result requires further psychiatric evaluation.'}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onSave && (
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-500">
            💾 {lang === 'cs' ? 'Uložit do profilu' : 'Save to Profile'}
          </button>
        )}
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 text-sm hover:bg-gray-600">
          ← {lang === 'cs' ? 'Zpět do menu' : 'Back to Menu'}
        </button>
      </div>
    </div>
  );
}
