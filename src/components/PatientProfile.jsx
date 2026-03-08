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

const STALE_WARN = 90;   // days → amber badge
const STALE_OLD  = 180;  // days → red badge

function daysAgo(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function stalenessLabel(days, lang) {
  if (days === null) return null;
  if (days < 30) return null;
  const cs = lang === 'cs';
  if (days < 60)  return cs ? '1 měs.' : '1 mo.';
  if (days < 90)  return cs ? '2 měs.' : '2 mo.';
  if (days < 180) return cs ? `${Math.floor(days/30)} měs.` : `${Math.floor(days/30)} mo.`;
  if (days < 365) return cs ? `${Math.floor(days/30)} měs.` : `${Math.floor(days/30)} mo.`;
  return cs ? `${Math.floor(days/365)} r.` : `${Math.floor(days/365)} yr.`;
}

export default function PatientProfile({ history, lang, onGoToTest, onViewResult, toggleLang, onBack, userEmail }) {
  useMemo(() => createT(lang), [lang]);
  const [showAllTests, setShowAllTests] = useState(false);

  const crossRefs = useMemo(() => generateCrossReferences(history, lang), [history, lang]);
  const testStatuses = useMemo(() => getTestStatus(history, lang), [history, lang]);
  const completedTests = Object.keys(testStatuses);
  const allTestKeys = Object.keys(TEST_META);
  const missingTests = allTestKeys.filter(k => !testStatuses[k]);

  const flagged   = completedTests.filter(k => ['elevated', 'critical'].includes(testStatuses[k].status));
  const critical  = completedTests.filter(k => testStatuses[k].status === 'critical');

  const staleTests = completedTests.filter(k => {
    const entry = history.find(h => h.type === k);
    const d = daysAgo(entry?.date);
    return d !== null && d >= STALE_WARN;
  });

  const ScoreDisplay = ({ testKey, histEntry, st }) => {
    if (testKey === 'pid5') return <span className="text-xs text-gray-500">{histEntry?.topDiags?.length || 0} {lang === 'cs' ? 'profilů' : 'profiles'}</span>;
    if (testKey === 'lpfs') return <span className="text-sm font-mono tabular-nums" style={{ color: st.color }}>{(histEntry?.score ?? 0).toFixed(2)}</span>;
    if (testKey === 'mdq') return <span className={`text-xs font-medium ${histEntry?.positive ? 'text-red-400' : 'text-green-400'}`}>{histEntry?.positive ? (lang === 'cs' ? 'Pozitivní' : 'Positive') : (lang === 'cs' ? 'Negativní' : 'Negative')}</span>;
    if (testKey === 'asrs') {
      // Old data stores partA (0–6), new stores total (0–18) — show partA/6 for old, total/18 for new
      const score = histEntry?.score ?? 0;
      if (score <= 6) return <span className="text-sm font-mono tabular-nums" style={{ color: STATUS_STYLES[st.status]?.dot }}>{score}<span className="text-gray-600 text-xs">/6 Part A</span></span>;
      return <span className="text-sm font-mono tabular-nums" style={{ color: STATUS_STYLES[st.status]?.dot }}>{score}<span className="text-gray-600 text-xs">/18</span></span>;
    }
    if (testKey === 'dass42' && (histEntry?.depression != null)) {
      const dep = histEntry.depression; const anx = histEntry.anxiety; const str = histEntry.stress;
      return <span className="text-xs text-gray-400 tabular-nums">D:{dep} A:{anx} S:{str}</span>;
    }
    return <span className="text-sm font-mono tabular-nums" style={{ color: STATUS_STYLES[st.status]?.dot }}>{histEntry?.score ?? '–'}</span>;
  };

  const TestRow = ({ testKey, histEntry }) => {
    const st = testStatuses[testKey];
    const sty = STATUS_STYLES[st.status];
    // ASRS: old data (score ≤6) = partA out of 6, new = total out of 18
    const asrsMax = testKey === 'asrs' && histEntry?.score != null && histEntry.score <= 6 ? 6 : MAX_SCORES[testKey];
    const pct = histEntry?.score != null && asrsMax ? Math.round((histEntry.score / asrsMax) * 100) : null;
    const date = histEntry?.date ? new Date(histEntry.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'cs-CZ', { day: 'numeric', month: 'short' }) : null;
    const days = daysAgo(histEntry?.date);
    const ageLabel = stalenessLabel(days, lang);
    const isVeryStale = days !== null && days >= STALE_OLD;
    const isStale     = days !== null && days >= STALE_WARN;

    return (
      <div className="test-row px-5 py-3.5 flex items-center gap-4 group">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sty.dot, opacity: 0.9 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{st.name}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${sty.bg} ${sty.border} ${sty.text} border`}>
              {st.label}
            </span>
            {isStale && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md border ${isVeryStale ? 'bg-red-500/[0.08] border-red-500/[0.2] text-red-400' : 'bg-amber-500/[0.08] border-amber-500/[0.2] text-amber-400'}`}>
                {ageLabel} {lang === 'cs' ? '· zastaralé' : '· outdated'}
              </span>
            )}
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

        {/* Nav */}
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

        {/* ── DASHBOARD ──────────────────────────────── */}
        <div className="mb-10 animate-scale-in">
          <h1 className="heading-xl text-white/95 mb-6">{lang === 'cs' ? 'Klinický profil' : 'Clinical Profile'}</h1>

          {completedTests.length === 0 ? (
            <div className="frosted p-10 text-center">
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                {lang === 'cs'
                  ? 'Vyplňte alespoň jeden dotazník a uložte výsledky, abyste viděli svůj klinický profil.'
                  : 'Complete and save at least one questionnaire to see your clinical profile here.'}
              </p>
              <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-white/90 text-[#060608] font-semibold text-sm hover:bg-white transition-colors">
                {lang === 'cs' ? 'Přejít na dotazníky' : 'Go to questionnaires'}
              </button>
            </div>
          ) : (
            <>
              {/* Stat row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="frosted px-4 py-3.5 text-center">
                  <div className="text-2xl font-bold tabular-nums text-white/90">{completedTests.length}<span className="text-sm text-gray-600 font-normal">/{allTestKeys.length}</span></div>
                  <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">{lang === 'cs' ? 'Dokončeno' : 'Completed'}</div>
                </div>
                <div className={`px-4 py-3.5 text-center rounded-2xl border ${flagged.length > 0 ? 'bg-orange-500/[0.06] border-orange-500/[0.15]' : 'frosted'}`}>
                  <div className={`text-2xl font-bold tabular-nums ${flagged.length > 0 ? 'text-orange-400' : 'text-white/90'}`}>{flagged.length}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">{lang === 'cs' ? 'Zvýšených' : 'Elevated'}</div>
                </div>
                <div className={`px-4 py-3.5 text-center rounded-2xl border ${crossRefs.length > 0 ? 'bg-purple-500/[0.06] border-purple-500/[0.15]' : 'frosted'}`}>
                  <div className={`text-2xl font-bold tabular-nums ${crossRefs.length > 0 ? 'text-purple-400' : 'text-white/90'}`}>{crossRefs.length}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">{lang === 'cs' ? 'Překryvů' : 'Overlaps'}</div>
                </div>
              </div>

              {/* Staleness banner */}
              {staleTests.length > 0 && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.18] flex items-start gap-3">
                  <span className="text-amber-400 mt-0.5 shrink-0">⏱</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-300/90">
                      {lang === 'cs'
                        ? `${staleTests.length} ${staleTests.length === 1 ? 'test je zastaralý' : staleTests.length < 5 ? 'testy jsou zastaralé' : 'testů je zastaralých'}`
                        : `${staleTests.length} ${staleTests.length === 1 ? 'test is outdated' : 'tests are outdated'}`}
                    </p>
                    <p className="text-xs text-amber-400/60 mt-0.5">
                      {lang === 'cs'
                        ? 'Pro aktuální výsledky zvažte opakování testů starších 3 měsíců.'
                        : 'For current results, consider retaking tests older than 3 months.'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {staleTests.map(k => (
                        <button key={k} onClick={() => onGoToTest(k)}
                          className="text-[11px] px-2 py-1 rounded-lg bg-amber-500/[0.1] border border-amber-500/[0.2] text-amber-400 hover:bg-amber-500/[0.18] transition-colors">
                          {testStatuses[k].name} →
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status overview — all tests as dot grid */}
              <div className="frosted px-5 py-4">
                <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium mb-3">{lang === 'cs' ? 'Přehled' : 'Overview'}</p>
                <div className="flex flex-wrap gap-2">
                  {completedTests.map(k => {
                    const st = testStatuses[k];
                    const sty = STATUS_STYLES[st.status];
                    return (
                      <button key={k} onClick={() => onViewResult(history.find(h => h.type === k))}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:brightness-110 ${sty.bg} ${sty.border} ${sty.text}`}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sty.dot }} />
                        {st.name}
                      </button>
                    );
                  })}
                  {missingTests.length > 0 && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-600 border border-white/[0.05]">
                      +{missingTests.length} {lang === 'cs' ? 'nevyplněných' : 'incomplete'}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── ELEVATED FINDINGS ──────────────────────── */}
        {flagged.length > 0 && (
          <div className="mb-8 animate-slide-up">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium px-1 mb-3">
              {lang === 'cs' ? 'Zvýšené nálezy' : 'Elevated Findings'}
            </p>
            <div className="rounded-2xl overflow-hidden border border-orange-500/[0.12] bg-orange-500/[0.03] divide-y divide-white/[0.05]">
              {/* Critical first */}
              {[...critical, ...flagged.filter(k => !critical.includes(k))].map(k => {
                const histEntry = history.find(h => h.type === k);
                return <TestRow key={k} testKey={k} histEntry={histEntry} />;
              })}
            </div>
          </div>
        )}

        {/* ── DIAGNOSTIC OVERLAPS ────────────────────── */}
        {crossRefs.length > 0 && (
          <div className="mb-8 animate-slide-up delay-50">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium px-1 mb-3">
              {lang === 'cs' ? 'Diagnostické překryvy' : 'Diagnostic Overlaps'}
            </p>
            <div className="rounded-2xl frosted overflow-hidden divide-y divide-white/[0.05]">
              {crossRefs.map(ref => {
                const strengthDot = ref.strength === 'strong' ? '#F87171' : ref.strength === 'moderate' ? '#FBBF24' : '#60A5FA';
                const strengthText = ref.strength === 'strong' ? 'text-red-400' : ref.strength === 'moderate' ? 'text-amber-400' : 'text-blue-400';
                return (
                  <div key={ref.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: strengthDot, opacity: 0.85 }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white/90 mb-1">{ref.title[lang]}</div>
                        <div className="text-xs text-gray-500 leading-relaxed mb-2">{ref.description[lang]}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ref.tests.map(tk => (
                            <span key={tk} className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.05] text-gray-500 font-mono border border-white/[0.06]">
                              {TEST_META[tk]?.name || tk}
                            </span>
                          ))}
                          <span className={`text-[11px] ${strengthText} ml-1`}>
                            {ref.strength === 'strong' ? (lang === 'cs' ? 'silná vazba' : 'strong') : ref.strength === 'moderate' ? (lang === 'cs' ? 'střední' : 'moderate') : (lang === 'cs' ? 'naznačující' : 'suggestive')}
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

        {/* ── ALL RESULTS ────────────────────────────── */}
        {completedTests.length > 0 && (
          <div className="mb-8 animate-slide-up delay-100">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium px-1 mb-3">
              {lang === 'cs' ? 'Všechny výsledky' : 'All Results'}
            </p>
            {CLINICAL_DOMAINS.map(domain => {
              const doneInDomain = domain.tests.filter(k => testStatuses[k]);
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

        {/* Disclaimer */}
        {completedTests.length > 0 && (
          <p className="text-xs text-gray-600 leading-relaxed text-center px-4 mb-10">
            {lang === 'cs'
              ? 'Výsledky jsou ze sebeposuzovacích dotazníků a neslouží jako klinická diagnóza. Překryvy ukazují statisticky známé komorbidity, nikoli kauzální vztahy. Konzultujte odborníka.'
              : 'Results are from self-report questionnaires and do not constitute a clinical diagnosis. Overlaps indicate statistically known comorbidities, not causal relationships. Consult a professional.'}
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
