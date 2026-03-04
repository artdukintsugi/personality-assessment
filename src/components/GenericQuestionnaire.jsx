/**
 * GenericQuestionnaire — Reusable questionnaire component for clinical screening tools
 * Used by PHQ-9, GAD-7, DASS-42, PCL-5, CATI, ISI, ASRS, EAT-26, MDQ, CUDIT-R
 */
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Questionnaire filling screen
 */
export function QuestionnaireScreen({
  title, questions, scaleLabels, scaleMin, scaleMax,
  answers, setAnswers, idx, setIdx, onComplete,
  color, lang, t, toggleLang, onBack,
  instruction,
  liveScoreConfig, // { severityLevels, maxScore, label, scoreFn? }
}) {
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? answered / total : 0;
  const q = questions[idx];

  const answer = useCallback((val) => {
    setAnswers(prev => ({ ...prev, [idx]: val }));
    if (idx < total - 1) setTimeout(() => setIdx(idx + 1), 200);
    else setTimeout(() => onComplete(), 400);
  }, [idx, total, setAnswers, setIdx, onComplete]);

  // Keyboard handler
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= scaleMin && num <= scaleMax) {
        e.preventDefault();
        answer(num);
      }
      if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); setIdx(idx - 1); }
      if (e.key === 'ArrowRight' && idx < total - 1) { e.preventDefault(); setIdx(idx + 1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answer, idx, total, scaleMin, scaleMax, setIdx]);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm transition-all">← {t('back')}</button>
          <span className="text-sm font-semibold" style={{ color }}>{title}</span>
          <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{answered}/{total}</span>
            <span className="text-xs text-gray-600">{Math.round(progress * 100)}%</span>
          </div>
          <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress * 100}%`, background: color }} />
          </div>
        </div>

        {/* Instruction (shown on first question) */}
        {instruction && idx === 0 && (
          <div className="mb-4 p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400">
            {instruction}
          </div>
        )}

        {/* Question */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <div className="text-xs text-gray-600 mb-2">{lang === 'cs' ? 'Otázka' : 'Question'} {idx + 1}/{total}</div>
          <p className="text-lg text-gray-100 leading-relaxed mb-6">{q}</p>

          {/* Answer buttons */}
          <div className="space-y-2">
            {scaleLabels.map((label, i) => {
              const val = scaleMin + i;
              const isSelected = answers[idx] === val;
              return (
                <button
                  key={val}
                  onClick={() => answer(val)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-opacity-60 bg-opacity-20'
                      : 'border-gray-700/30 bg-gray-800/20 hover:border-gray-600/40 hover:bg-gray-800/40'
                  }`}
                  style={isSelected ? { borderColor: color + '80', background: color + '15' } : {}}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'text-white' : 'text-gray-500 bg-gray-800'
                  }`} style={isSelected ? { background: color } : {}}>
                    {val}
                  </span>
                  <span className={`text-sm ${isSelected ? 'font-medium' : 'text-gray-400'}`} style={isSelected ? { color } : {}}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-1 flex-wrap">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === idx ? 'scale-125' : answers[i] !== undefined ? 'opacity-60' : 'bg-gray-800'
              }`}
              style={i === idx ? { background: color } : answers[i] !== undefined ? { background: color } : {}}
            />
          ))}
        </div>

        {/* Live Score Panel */}
        {liveScoreConfig && answered > 0 && (() => {
          const { severityLevels, maxScore, label, scoreFn, subscales } = liveScoreConfig;
          const liveTotal = scoreFn ? scoreFn(answers) : Object.values(answers).reduce((s, v) => s + (v ?? 0), 0);
          const pct = maxScore > 0 ? Math.min(liveTotal / maxScore * 100, 100) : 0;
          const currentSev = severityLevels?.find(s => liveTotal >= s.min && liveTotal <= s.max);
          return (
            <div className="mt-6 p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{lang === 'cs' ? 'Průběžné skóre' : 'Live Score'}</span>
                <span className="text-xs font-mono text-gray-400">{label}</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-2xl font-bold text-white">{liveTotal}</span>
                <span className="text-sm text-gray-600 mb-0.5">/ {maxScore}</span>
                {currentSev && (
                  <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: currentSev.color + '20', color: currentSev.color }}>
                    {currentSev[lang] || currentSev.cs || currentSev.key}
                  </span>
                )}
              </div>
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: currentSev?.color || color }} />
              </div>

              {/* Subscale breakdown */}
              {subscales && subscales.length > 0 && answered >= 2 && (
                <div className="mt-3 pt-3 border-t border-gray-800/60">
                  <div className="text-xs text-gray-600 mb-2">{lang === 'cs' ? 'Subškály' : 'Subscales'}</div>
                  <div className="space-y-1.5">
                    {subscales.map((sub, si) => {
                      const subScore = sub.scoreFn ? sub.scoreFn(answers) : sub.items.reduce((s, idx) => s + (answers[idx] ?? 0), 0);
                      const subPct = sub.max > 0 ? Math.min(subScore / sub.max * 100, 100) : 0;
                      const subSev = sub.severityLevels?.find(sv => subScore >= sv.min && subScore <= sv.max);
                      return (
                        <div key={si}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-500 truncate flex-1 mr-2">{sub[lang] || sub.cs || sub.label}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs font-mono text-gray-400">{subScore}/{sub.max}</span>
                              {subSev && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: subSev.color + '20', color: subSev.color }}>
                                  {subSev[lang] || subSev.cs || subSev.key}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-800 rounded-full h-1 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${subPct}%`, background: sub.color || subSev?.color || color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/**
 * Simple validity check for short questionnaires
 */
export function checkSimpleValidity(answers, total, scaleMin, scaleMax, lang) {
  const checks = [];
  const answered = Object.keys(answers).length;
  const vals = Object.values(answers);

  // 1. Completeness
  const completeness = answered / total;
  checks.push({
    id: 'completeness',
    status: completeness < 0.8 ? 'fail' : completeness < 1 ? 'warn' : 'pass',
    value: Math.round(completeness * 100),
  });

  // 2. Straight-lining
  const range = scaleMax - scaleMin + 1;
  const freq = new Array(range).fill(0);
  vals.forEach(v => { if (v >= scaleMin && v <= scaleMax) freq[v - scaleMin]++; });
  const maxFreq = Math.max(...freq);
  const maxPct = answered > 0 ? maxFreq / answered : 0;
  const dominantVal = freq.indexOf(maxFreq) + scaleMin;
  checks.push({
    id: 'straightLining',
    status: maxPct > 0.85 ? 'fail' : maxPct > 0.70 ? 'warn' : 'pass',
    value: Math.round(maxPct * 100),
    detail: dominantVal,
  });

  // 3. Variability
  const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const variance = vals.length ? vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length : 0;
  const sd = Math.sqrt(variance);
  // Thresholds relative to scale range
  const sdLow = (scaleMax - scaleMin) * 0.1;
  const sdWarn = (scaleMax - scaleMin) * 0.15;
  checks.push({
    id: 'variability',
    status: sd < sdLow ? 'fail' : sd < sdWarn ? 'warn' : 'pass',
    value: sd.toFixed(2),
  });

  // Verdict
  const fails = checks.filter(c => c.status === 'fail').length;
  const warns = checks.filter(c => c.status === 'warn').length;
  let verdict = 'valid';
  if (fails >= 2 || checks.some(c => c.id === 'straightLining' && c.status === 'fail')) verdict = 'invalid';
  else if (fails >= 1 || warns >= 2) verdict = 'questionable';
  else if (warns >= 1) verdict = 'acceptable';

  return { checks, verdict, mean: mean.toFixed(2), sd: sd.toFixed(2) };
}

/**
 * Validity display section — reusable for all questionnaires
 */
export function ValiditySection({ validity, lang, t, scaleMax }) {
  const ico = { pass: '✅', warn: '⚠️', fail: '❌' };
  const clr = { pass: 'text-green-400', warn: 'text-amber-400', fail: 'text-red-400' };
  const bg = { pass: 'bg-green-950/20 border-green-500/20', warn: 'bg-amber-950/20 border-amber-500/20', fail: 'bg-red-950/20 border-red-500/20' };
  const verdictColors = { valid: 'text-green-400 bg-green-950/30 border-green-500/30', acceptable: 'text-cyan-400 bg-cyan-950/30 border-cyan-500/30', questionable: 'text-amber-400 bg-amber-950/30 border-amber-500/30', invalid: 'text-red-400 bg-red-950/30 border-red-500/30' };
  const verdictIcons = { valid: '✅', acceptable: '🟢', questionable: '⚠️', invalid: '❌' };

  const desc = (c) => {
    const descs = {
      completeness: { cs: `Zodpovězeno ${c.value}% položek (doporučeno 100%).`, en: `Answered ${c.value}% of items (100% recommended).` },
      straightLining: { cs: `Nejběžnější odpověď '${c.detail}' použita v ${c.value}% případů.${c.status !== 'pass' ? ' Naznačuje možné nepozorné odpovídání.' : ''}`, en: `Most common answer '${c.detail}' used in ${c.value}% of items.${c.status !== 'pass' ? ' Suggests possible inattentive responding.' : ''}` },
      variability: { cs: `Směrodatná odchylka ${c.value} (čím nižší, tím uniformnější odpovědi).`, en: `Standard deviation ${c.value} (lower = more uniform responses).` },
    };
    return descs[c.id]?.[lang] || '';
  };

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 backdrop-blur-xl mb-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">🔍 {t('validityTitle')}</h3>
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-5 ${verdictColors[validity.verdict]}`}>
        <span className="text-lg">{verdictIcons[validity.verdict]}</span>
        <div>
          <div className="font-semibold text-sm">{t('verdict_' + validity.verdict)}</div>
          <div className="text-xs opacity-70">{t('verdictDesc_' + validity.verdict)}</div>
        </div>
      </div>
      <div className="flex gap-4 mb-5 text-xs text-gray-500">
        <span>{t('validityMean')}: <strong className="text-gray-300 font-mono">{validity.mean}</strong></span>
        <span>{t('validitySD')}: <strong className="text-gray-300 font-mono">{validity.sd}</strong></span>
      </div>
      <div className="space-y-2">
        {validity.checks.map(c => (
          <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border ${bg[c.status]}`}>
            <span className="text-base shrink-0">{ico[c.status]}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${clr[c.status]}`}>{t('validity_' + c.id)}</div>
              <div className="text-xs text-gray-500">{desc(c)}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-600 text-xs mt-4">{t('validityExplain')}</p>
    </div>
  );
}

/**
 * Severity badge component
 */
export function SeverityBadge({ score, severityLevels, lang }) {
  const level = severityLevels.find(s => score >= s.min && score <= s.max) || severityLevels[severityLevels.length - 1];
  const SEVERITY_LABELS = {
    cs: { minimal: 'Minimální', mild: 'Mírná', moderate: 'Středně těžká', moderatelySevere: 'Středně těžká až těžká', severe: 'Těžká', extremelySevere: 'Extrémně těžká', normal: 'Normální', significant: 'Významná', low: 'Nízké riziko', hazardous: 'Rizikové', harmful: 'Škodlivé', dependence: 'Možná porucha' },
    en: { minimal: 'Minimal', mild: 'Mild', moderate: 'Moderate', moderatelySevere: 'Moderately Severe', severe: 'Severe', extremelySevere: 'Extremely Severe', normal: 'Normal', significant: 'Significant', low: 'Low Risk', hazardous: 'Hazardous', harmful: 'Harmful', dependence: 'Possible CUD' },
  };
  const label = SEVERITY_LABELS[lang]?.[level.key] || level[lang] || level.cs || level.key;

  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm" style={{ color: level.color, borderColor: level.color + '40', background: level.color + '15' }}>
      <span className="w-3 h-3 rounded-full" style={{ background: level.color }} />
      {label}
    </span>
  );
}

/**
 * Score bar component
 */
export function ScoreBar({ value, max, color, label }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mb-3">
      {label && <div className="flex justify-between mb-1"><span className="text-xs text-gray-400">{label}</span><span className="text-xs font-mono text-gray-300">{value}/{max}</span></div>}
      <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  );
}
