import { useMemo, useState } from 'react';
import { generateCrossReferences, getTestStatus, TEST_META, CLINICAL_DOMAINS } from '../lib/cross-reference';
import { createT } from '../lib/i18n';

const STATUS_STYLES = {
  ok:       { bg: 'bg-green-500/[0.08]',  border: 'border-green-500/[0.15]',  text: 'text-green-400',  dot: '#4ADE80' },
  warning:  { bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/[0.15]', text: 'text-yellow-400', dot: '#FBBF24' },
  elevated: { bg: 'bg-orange-500/[0.08]', border: 'border-orange-500/[0.15]', text: 'text-orange-400', dot: '#F97316' },
  critical: { bg: 'bg-red-500/[0.08]',    border: 'border-red-500/[0.15]',    text: 'text-red-400',    dot: '#F87171' },
};

const MAX_SCORES = { phq9: 27, gad7: 21, dass42: 126, pcl5: 80, cati: 210, isi: 28, asrs: 18, eat26: 78, cuditr: 32, itq: 72, audit: 40, dast10: 10, aq: 50, aq10: 10 };

export default function PatientProfile({ history, lang, onGoToTest, onViewResult, toggleLang, onBack, userEmail }) {
  const t = useMemo(() => createT(lang), [lang]);
  const [showAllTests, setShowAllTests] = useState(false);

  const crossRefs = useMemo(() => generateCrossReferences(history, lang), [history, lang]);
  const testStatuses = useMemo(() => getTestStatus(history, lang), [history, lang]);
  const completedTests = Object.keys(testStatuses);
  const allTestKeys = Object.keys(TEST_META);
  const missingTests = allTestKeys.filter(k => !testStatuses[k]);

  const flagged = completedTests.filter(k => ['elevated', 'critical'].includes(testStatuses[k].status));

  const ScoreDisplay = ({ testKey, histEntry, st }) => {
    if (testKey === 'pid5') return <span className="text-xs text-gray-500">{histEntry?.topDiags?.length || 0} {lang === 'cs' ? 'profilů' : 'profiles'}</span>;
    if (testKey === 'lpfs') return <span className="text-sm font-mono tabular-nums" style={{ color: st.color }}>{(histEntry?.score ?? 0).toFixed(2)}</span>;
    if (testKey === 'mdq') return <span className={`text-xs font-medium ${histEntry?.positive ? 'text-red-400' : 'text-green-400'}`}>{histEntry?.positive ? (lang === 'cs' ? 'Pozitivní' : 'Positive') : (lang === 'cs' ? 'Negativní' : 'Negative')}</span>;
    return <span className="text-sm font-mono tabular-nums" style={{ color: STATUS_STYLES[st.status]?.dot }}>{histEntry?.score ?? '–'}</span>;
  };

  const TestRow = ({ testKey, histEntry }) => {
    const st = testStatuses[testKey];
    const sty = STATUS_STYLES[st.status];
    const pct = histEntry?.score != null && MAX_SCORES[testKey] ? Math.round((histEntry.score / MAX_SCORES[testKey]) * 100) : null;
    const date = histEntry?.date ? new Date(histEntry.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'cs-CZ', { day: 'numeric', month: 'short' }) : null;

    return (
      <div className="test-row px-5 py-3.5 flex items-center gap-4 group">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sty.dot, opacity: 0.9 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{st.name}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${sty.bg} ${sty.border} ${sty.text} border`}>
              {st.label}
            </span>
          </div>
          {pct !== null && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 max-w-[120px] bg-white/[0.06] rounded-full h-1 overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: sty.dot, opacity: 0.7 }} />
              </div>
              <span className="text-[11px] text-gray-600 tabular-nums">{pct}%</span>
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <ScoreDisplay testKey={testKey} histEntry={histEntry} st={st} />
          {date && <div className="text-[11px] text-gray-600 mt-0.5">{date}</div>}
        </div>
        <div className="flex gap-1 shrink-0">
          {histEntry && (
            <button onClick={() => onViewResult(histEntry)} className="text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-gray-500 hover:text-gray-200 hover:bg-white/[0.08] transition-all">
              {lang === 'cs' ? 'Výsledky' : 'Results'}
            </button>
          )}
          <button onClick={() => onGoToTest(testKey)} className="text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-gray-500 hover:text-gray-200 hover:bg-white/[0.08] transition-all">
            {lang === 'cs' ? 'Znovu' : 'Retake'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white">
      <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← {lang === 'cs' ? 'Menu' : 'Menu'}
          </button>
          <div className="flex items-center gap-3">
            {userEmail && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
                  {userEmail[0].toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[160px]">{userEmail}</span>
              </div>
            )}
            <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/25 text-amber-400/90 bg-amber-500/[0.06]' : 'border-white/[0.08] text-gray-500 hover:text-gray-400 hover:border-white/[0.12]'}`}>
              {lang === 'en' ? 'EN' : 'CZ'}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="heading-xl text-white/95 mb-1">{lang === 'cs' ? 'Klinický profil' : 'Clinical Profile'}</h1>
          <p className="text-sm text-gray-500">
            {completedTests.length === 0
              ? (lang === 'cs' ? 'Žádné uložené výsledky' : 'No saved results yet')
              : (lang === 'cs' ? `${completedTests.length} z ${allTestKeys.length} nástrojů dokončeno` : `${completedTests.length} of ${allTestKeys.length} instruments completed`)}
          </p>
        </div>

        {/* Empty state */}
        {completedTests.length === 0 && (
          <div className="frosted p-10 text-center mb-8">
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              {lang === 'cs'
                ? 'Vyplňte alespoň jeden dotazník a uložte výsledky, abyste viděli svůj klinický profil.'
                : 'Complete and save at least one questionnaire to see your clinical profile here.'}
            </p>
            <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-white/90 text-[#060608] font-semibold text-sm hover:bg-white transition-colors">
              {lang === 'cs' ? 'Přejít na dotazníky' : 'Go to questionnaires'}
            </button>
          </div>
        )}

        {/* Flagged findings */}
        {flagged.length > 0 && (
          <div className="mb-8 animate-slide-up">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium px-1 mb-3">
              {lang === 'cs' ? 'Zvýšené nálezy' : 'Elevated Findings'}
            </p>
            <div className="rounded-2xl overflow-hidden border border-orange-500/[0.12] bg-orange-500/[0.04] divide-y divide-white/[0.05]">
              {flagged.map(k => {
                const histEntry = history.find(h => h.type === k);
                return <TestRow key={k} testKey={k} histEntry={histEntry} />;
              })}
            </div>
          </div>
        )}

        {/* Results by category */}
        {completedTests.length > 0 && (
          <div className="mb-8 animate-slide-up delay-50">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium px-1 mb-3">
              {lang === 'cs' ? 'Všechny výsledky' : 'All Results'}
            </p>
            {CLINICAL_DOMAINS.map(domain => {
              const doneInDomain = domain.tests.filter(k => testStatuses[k] && !flagged.includes(k));
              const missingInDomain = domain.tests.filter(k => !testStatuses[k]);
              if (doneInDomain.length === 0 && (!showAllTests || missingInDomain.length === 0)) return null;
              return (
                <div key={domain.id} className="mb-4">
                  <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium px-5 mb-1.5">{domain.title[lang]}</p>
                  <div className="rounded-2xl frosted overflow-hidden divide-y divide-white/[0.05]">
                    {doneInDomain.map(k => (
                      <TestRow key={k} testKey={k} histEntry={history.find(h => h.type === k)} />
                    ))}
                    {showAllTests && missingInDomain.map(k => {
                      const meta = TEST_META[k];
                      return (
                        <div key={k} className="test-row px-5 py-3.5 flex items-center gap-4 opacity-40">
                          <span className="w-2 h-2 rounded-full border border-white/[0.2] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-500">{meta.name}</span>
                            <div className="text-xs text-gray-700 mt-0.5">{meta.items} {lang === 'cs' ? 'otázek' : 'items'}</div>
                          </div>
                          <button onClick={() => onGoToTest(k)} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-gray-500 hover:text-gray-200 hover:bg-white/[0.08] transition-all shrink-0">
                            {lang === 'cs' ? 'Vyplnit' : 'Start'} →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {missingTests.length > 0 && (
              <button onClick={() => setShowAllTests(!showAllTests)} className="mt-1 w-full py-2.5 rounded-xl text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {showAllTests
                  ? (lang === 'cs' ? 'Skrýt nevyplněné' : 'Hide incomplete')
                  : (lang === 'cs' ? `Zobrazit ${missingTests.length} nevyplněných` : `Show ${missingTests.length} incomplete`)}
              </button>
            )}
          </div>
        )}

        {/* Cross-references */}
        {crossRefs.length > 0 && (
          <div className="mb-8 animate-slide-up delay-100">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium px-1 mb-3">
              {lang === 'cs' ? 'Vzájemné překryvy' : 'Diagnostic Overlaps'}
            </p>
            <div className="rounded-2xl frosted overflow-hidden divide-y divide-white/[0.05]">
              {crossRefs.map(ref => {
                const strengthColor = ref.strength === 'strong' ? 'text-red-400' : ref.strength === 'moderate' ? 'text-amber-400' : 'text-blue-400';
                const strengthDot = ref.strength === 'strong' ? '#F87171' : ref.strength === 'moderate' ? '#FBBF24' : '#60A5FA';
                return (
                  <div key={ref.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: strengthDot, opacity: 0.8 }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white/90 mb-1">{ref.title[lang]}</div>
                        <div className="text-xs text-gray-500 leading-relaxed mb-2">{ref.description[lang]}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ref.tests.map(tk => (
                            <span key={tk} className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.05] text-gray-500 font-mono border border-white/[0.06]">
                              {TEST_META[tk]?.name || tk}
                            </span>
                          ))}
                          <span className={`text-[11px] ${strengthColor} ml-1`}>
                            {ref.strength === 'strong' ? (lang === 'cs' ? 'silná vazba' : 'strong link') : ref.strength === 'moderate' ? (lang === 'cs' ? 'středně silná' : 'moderate') : (lang === 'cs' ? 'naznačující' : 'suggestive')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {completedTests.length > 0 && (
          <p className="text-xs text-gray-600 leading-relaxed text-center px-4 mb-10">
            {lang === 'cs'
              ? 'Výsledky jsou generovány ze sebeposuzovacích dotazníků a neslouží jako klinická diagnóza. Překryvy ukazují statisticky známé komorbidity, nikoli kauzální vztahy. Konzultujte klinického psychologa nebo psychiatra.'
              : 'Results are generated from self-report questionnaires and do not constitute a clinical diagnosis. Overlaps indicate statistically known comorbidities, not causal relationships. Consult a clinical psychologist or psychiatrist.'}
          </p>
        )}

        <div className="flex justify-center pb-8">
          <button onClick={onBack} className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.09] rounded-xl text-gray-400 text-sm font-medium transition-all">
            {lang === 'cs' ? 'Zpět na menu' : 'Back to menu'}
          </button>
        </div>

      </div>
    </div>
  );
}
