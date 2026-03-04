/**
 * CATI Results page — Camouflaging Autistic Traits Questionnaire
 */
import { useMemo } from 'react';
import { CATI_SUBSCALES, CATI_SUBSCALE_ITEMS, CATI_REVERSE_ITEMS, CATI_SEVERITY, scoreCATI } from '../data/cati';
import { SeverityBadge, ScoreBar, ValiditySection, checkSimpleValidity } from './GenericQuestionnaire';

export default function CATIResults({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const { total, subscales, scored } = useMemo(() => scoreCATI(answers), [answers]);
  const severity = CATI_SEVERITY.find(s => total >= s.min && total <= s.max) || CATI_SEVERITY[0];
  const validity = useMemo(() => checkSimpleValidity(answers, 42, 1, 5, lang), [answers, lang]);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm">← {t('back')}</button>
          <span className="text-sm font-semibold text-violet-400">CATI — {lang === 'cs' ? 'Výsledky' : 'Results'}</span>
          <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>{lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}</button>
        </div>

        {/* Total score */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-gray-200 mb-4">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold font-mono" style={{ color: severity.color }}>{total}</div>
            <div className="text-gray-500 text-sm">/ 210</div>
          </div>
          <ScoreBar value={total - 42} max={210 - 42} color={severity.color} label={`${total}/210`} />
          <div className="mt-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: severity.color + '20', color: severity.color }}>{severity[lang]}</span>
          </div>
        </div>

        {/* Subscale overview */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{lang === 'cs' ? 'Subškály' : 'Subscales'}</h3>
          <div className="space-y-4">
            {Object.entries(CATI_SUBSCALES).map(([key, meta]) => {
              const score = subscales[key] || 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                      <span className="text-sm text-gray-300">{meta[lang]}</span>
                    </div>
                    <span className="text-sm font-mono font-bold" style={{ color: meta.color }}>{score}<span className="text-gray-600 font-normal">/35</span></span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${((score - 7) / 28) * 100}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Item breakdown by subscale */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">{lang === 'cs' ? 'Detail odpovědí' : 'Answer Breakdown'}</h3>
          {Object.entries(CATI_SUBSCALES).map(([key, meta]) => (
            <div key={key} className="mb-5 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-xs font-semibold text-gray-400">{meta[lang]} ({key})</span>
              </div>
              <div className="space-y-2">
                {CATI_SUBSCALE_ITEMS[key].map(idx => {
                  const raw = answers[idx] ?? 0;
                  const isReverse = CATI_REVERSE_ITEMS.includes(idx);
                  const val = scored[idx] || 0;
                  return (
                    <div key={idx} className={`p-3 rounded-xl border ${isReverse ? 'border-amber-500/20 bg-amber-950/5' : 'border-gray-800/50 bg-gray-800/20'}`}>
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-xs text-gray-600 shrink-0 mt-0.5">{idx + 1}.{isReverse ? ' ↕' : ''}</span>
                        <span className="text-xs text-gray-400 flex-1">{questions[idx]}</span>
                        <span className="text-sm font-mono font-bold shrink-0" style={{ color: meta.color }}>{val}</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(val / 5) * 100}%`, background: meta.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Severity scale reference */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">{lang === 'cs' ? 'Interpretační škála CATI' : 'CATI Interpretation Scale'}</h3>
          <div className="space-y-2">
            {CATI_SEVERITY.map(s => (
              <div key={s.key} className={`flex items-center gap-3 p-2 rounded-lg ${total >= s.min && total <= s.max ? 'bg-gray-800/60 border border-gray-700/50' : ''}`}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-gray-400 flex-1">{s[lang]}</span>
                <span className="text-xs font-mono text-gray-600">{s.min}–{s.max}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Validity */}
        <ValiditySection validity={validity} lang={lang} t={t} scaleMax={5} />

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 mb-6">
          <p className="text-amber-400/80 text-xs leading-relaxed">
            {lang === 'cs'
              ? '⚠ CATI je screeningový nástroj autistických rysů a kamufláže. Výsledky slouží pouze k orientaci a nenahrazují klinické vyšetření. Diagnózu poruchy autistického spektra může stanovit pouze kvalifikovaný odborník na základě komplexního vyšetření.'
              : '⚠ CATI is a screening tool for autistic traits and camouflaging. Results are for informational purposes only and do not replace clinical assessment. A diagnosis of autism spectrum disorder can only be made by a qualified professional through comprehensive evaluation.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          {onSave && <button onClick={onSave} className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl text-white font-semibold transition-all">{t('saveResult')}</button>}
          <button onClick={() => {
            const data = { test: 'CATI', total, subscales, severity: severity.key, answers, date: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cati_results.json'; a.click();
          }} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">📦 JSON</button>
          <button onClick={onBack} className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl text-gray-400 font-semibold transition-all">{t('menu')}</button>
        </div>
      </div>
    </div>
  );
}
