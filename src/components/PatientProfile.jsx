import { useMemo, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { generateCrossReferences, getTestStatus, TEST_META, CLINICAL_DOMAINS } from '../lib/cross-reference';
import { createT, diagName } from '../lib/i18n';

// ════════════════════════════════════════════════
// Status icon/colors
// ════════════════════════════════════════════════
const STATUS_STYLES = {
  ok:       { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', dot: '#4ADE80', icon: '✓' },
  warning:  { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: '#FBBF24', icon: '~' },
  elevated: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', dot: '#F97316', icon: '▲' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: '#F87171', icon: '!' },
};

const STRENGTH_LABELS = {
  strong:    { cs: 'Silná souvislost', en: 'Strong Link' },
  moderate:  { cs: 'Středně silná', en: 'Moderate Link' },
  suggestive:{ cs: 'Naznačující', en: 'Suggestive' },
};

const STRENGTH_STYLES = {
  strong:    'border-red-500/30 bg-red-950/20',
  moderate:  'border-amber-500/30 bg-amber-950/20',
  suggestive:'border-blue-500/30 bg-blue-950/20',
};

// ════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════
export default function PatientProfile({ history, lang, onGoToTest, onViewResult, toggleLang, onBack, userEmail }) {
  const t = useMemo(() => createT(lang), [lang]);
  const [expandedRef, setExpandedRef] = useState(null);
  const [showAllTests, setShowAllTests] = useState(false);

  // Cross-references
  const crossRefs = useMemo(() => generateCrossReferences(history, lang), [history, lang]);
  
  // Latest test statuses
  const testStatuses = useMemo(() => getTestStatus(history, lang), [history, lang]);
  const completedTests = Object.keys(testStatuses);
  const allTestKeys = Object.keys(TEST_META);
  const missingTests = allTestKeys.filter(k => !testStatuses[k]);

  // Overall risk profile for radar chart
  const radarData = useMemo(() => {
    return CLINICAL_DOMAINS.map(d => {
      const testsInDomain = d.tests.filter(t => testStatuses[t]);
      if (testsInDomain.length === 0) return { domain: d.title[lang], value: 0, fill: d.color };
      
      // Map each test status to a numeric value
      const statusVal = { ok: 0, warning: 1, elevated: 2, critical: 3 };
      const max = Math.max(...testsInDomain.map(t => statusVal[testStatuses[t]?.status] ?? 0));
      return { domain: d.title[lang], value: max, fill: d.color, icon: d.icon };
    }).filter(d => d.value > 0 || true); // keep all domains
  }, [testStatuses, lang]);

  // History grouped by type for timeline
  const historyByType = useMemo(() => {
    const grouped = {};
    history.forEach(h => {
      if (!grouped[h.type]) grouped[h.type] = [];
      grouped[h.type].push(h);
    });
    return grouped;
  }, [history]);

  // Count of elevated/critical findings
  const elevatedCount = completedTests.filter(k => ['elevated', 'critical'].includes(testStatuses[k].status)).length;
  const criticalCount = completedTests.filter(k => testStatuses[k].status === 'critical').length;

  // Score data for bar chart
  const barData = useMemo(() => {
    return completedTests
      .filter(k => k !== 'pid5' && k !== 'lpfs' && k !== 'mdq') // skip complex ones
      .map(k => {
        const s = testStatuses[k];
        const score = history.find(h => h.type === k)?.score ?? 0;
        const maxScores = { phq9: 27, gad7: 21, dass42: 126, pcl5: 80, cati: 210, isi: 28, asrs: 18, eat26: 78, cuditr: 32, itq: 72, audit: 40, dast10: 10, aq: 50, aq10: 10 };
        const pct = maxScores[k] ? Math.round((score / maxScores[k]) * 100) : 0;
        return { name: s.name, score, pct, color: s.color, status: s.status };
      });
  }, [completedTests, testStatuses, history]);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm transition-colors flex items-center gap-1">
              {lang === 'cs' ? 'Menu' : 'Menu'}
            </button>
          <button onClick={toggleLang} className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${lang === 'en' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-gray-700/40 text-gray-500 hover:text-gray-300'}`}>
            {lang === 'en' ? '🇬🇧 EN' : '🇨🇿 CZ'}
          </button>
        </div>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold shrink-0">
              {userEmail?.[0]?.toUpperCase() || '?'}
            </div>
            {userEmail && <span className="text-sm text-gray-400 truncate max-w-[200px]">{userEmail}</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {lang === 'cs' ? 'Klinický profil' : 'Clinical Profile'}
          </h1>
          <p className="text-gray-500 text-sm">
            {lang === 'cs' 
              ? `${completedTests.length} z ${allTestKeys.length} nástrojů dokončeno` 
              : `${completedTests.length} of ${allTestKeys.length} instruments completed`}
          </p>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* SUMMARY CARDS */}
        {/* ════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-scale-in">
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800/60 text-center">
            <div className="text-3xl font-bold text-gray-200">{completedTests.length}</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? 'Dokončeno' : 'Completed'}</div>
          </div>
          <div className={`p-4 rounded-2xl text-center ${elevatedCount > 0 ? 'bg-orange-950/30 border border-orange-500/20' : 'bg-gray-900/60 border border-gray-800/60'}`}>
            <div className={`text-3xl font-bold ${elevatedCount > 0 ? 'text-orange-400' : 'text-gray-200'}`}>{elevatedCount}</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? 'Zvýšených' : 'Elevated'}</div>
          </div>
          <div className={`p-4 rounded-2xl text-center ${crossRefs.length > 0 ? 'bg-purple-950/30 border border-purple-500/20' : 'bg-gray-900/60 border border-gray-800/60'}`}>
            <div className={`text-3xl font-bold ${crossRefs.length > 0 ? 'text-purple-400' : 'text-gray-200'}`}>{crossRefs.length}</div>
            <div className="text-xs text-gray-500 mt-1">{lang === 'cs' ? 'Vzájemné vazby' : 'Cross-links'}</div>
          </div>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* RISK RADAR */}
        {/* ════════════════════════════════════════════ */}
        {completedTests.length >= 2 && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-gray-200 mb-1">
              {lang === 'cs' ? '🎯 Přehled oblastí' : '🎯 Domain Overview'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {lang === 'cs' ? '0 = v normě, 1 = mírné, 2 = zvýšené, 3 = kritické' : '0 = normal, 1 = mild, 2 = elevated, 3 = critical'}
            </p>
            <div className="w-full" style={{ height: 320 }}>
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 3]} tick={{ fill: '#6B7280', fontSize: 10 }} tickCount={4} />
                  <Radar dataKey="value" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip 
                    contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 12, color: '#fff' }} 
                    formatter={(v) => {
                      const labels = { 0: lang === 'cs' ? 'V normě' : 'Normal', 1: lang === 'cs' ? 'Mírné' : 'Mild', 2: lang === 'cs' ? 'Zvýšené' : 'Elevated', 3: lang === 'cs' ? 'Kritické' : 'Critical' };
                      return [labels[v] || v, ''];
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* SCORE BAR CHART */}
        {/* ════════════════════════════════════════════ */}
        {barData.length >= 2 && (
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 mb-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-gray-200 mb-1">
              {lang === 'cs' ? '📊 Relativní závažnost' : '📊 Relative Severity'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {lang === 'cs' ? 'Procento z maximálního skóre' : 'Percentage of maximum score'}
            </p>
            <div className="w-full" style={{ height: Math.max(200, barData.length * 40 + 40) }}>
              <ResponsiveContainer>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF', fontSize: 12 }} width={65} />
                  <Tooltip 
                    contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 12, color: '#fff' }}
                    formatter={(v, name, p) => [`${v}%`, `${lang === 'cs' ? 'Skóre' : 'Score'}: ${p.payload.score}`]}
                  />
                  <Bar dataKey="pct" radius={[0, 6, 6, 0]} animationDuration={600} animationEasing="ease-out">
                    {barData.map((d, i) => (
                      <Cell key={i} fill={d.color} fillOpacity={0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* ALL TEST RESULTS */}
        {/* ════════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-1">
            <span className="h-px flex-1 bg-gray-800" />
            <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">
              {lang === 'cs' ? 'Výsledky nástrojů' : 'Instrument Results'}
            </span>
            <span className="h-px flex-1 bg-gray-800" />
          </div>

          <div className="space-y-3">
            {CLINICAL_DOMAINS.map(domain => {
              const testsInDomain = domain.tests.filter(t => testStatuses[t]);
              const missingInDomain = domain.tests.filter(t => !testStatuses[t]);
              if (testsInDomain.length === 0 && !showAllTests) return null;

              return (
                <div key={domain.id} className="bg-gray-900/60 rounded-2xl border border-gray-800/60 overflow-hidden">
                  {/* Domain header */}
                  <div className="px-5 py-3 border-b border-gray-800/40 flex items-center gap-3">
                    <span className="text-lg">{domain.icon}</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: domain.color }}>{domain.title[lang]}</div>
                      <div className="text-xs text-gray-600">{domain.description[lang]}</div>
                    </div>
                  </div>

                  {/* Test results */}
                  <div className="divide-y divide-gray-800/30">
                    {testsInDomain.map(testKey => {
                      const st = testStatuses[testKey];
                      const sty = STATUS_STYLES[st.status];
                      const histEntry = history.find(h => h.type === testKey);
                      const histCount = historyByType[testKey]?.length || 0;
                      
                      return (
                        <div key={testKey} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-800/20 transition-all">
                          {/* Status dot */}
                          <div className="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-gray-950" 
                            style={{ background: sty.dot, ringColor: sty.dot + '40' }} />
                          
                          {/* Test info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-200">{st.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${sty.bg} ${sty.border} ${sty.text} border`}>
                                {st.label}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {st.category[lang]}
                              {histEntry?.date && (
                                <> · {new Date(histEntry.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'cs-CZ')}</>
                              )}
                              {histCount > 1 && (
                                <span className="text-gray-700"> · {histCount}× {lang === 'cs' ? 'vyplněno' : 'completed'}</span>
                              )}
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right shrink-0">
                            {testKey === 'pid5' ? (
                              <div className="text-xs text-gray-400">
                                {histEntry?.topDiags?.length || 0} {lang === 'cs' ? 'profilů' : 'profiles'}
                              </div>
                            ) : testKey === 'lpfs' ? (
                              <div className="text-sm font-mono" style={{ color: st.color }}>
                                {(histEntry?.score ?? 0).toFixed(2)}
                              </div>
                            ) : testKey === 'mdq' ? (
                              <div className={`text-xs font-semibold ${histEntry?.positive ? 'text-red-400' : 'text-green-400'}`}>
                                {histEntry?.positive ? (lang === 'cs' ? 'Pozitivní' : 'Positive') : (lang === 'cs' ? 'Negativní' : 'Negative')}
                              </div>
                            ) : (
                              <div className="text-sm font-mono" style={{ color: sty.dot }}>
                                {histEntry?.score ?? '–'}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1.5 shrink-0">
                            {histEntry && (
                              <button 
                                onClick={() => onViewResult(histEntry)}
                                className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition-all"
                                title={lang === 'cs' ? 'Zobrazit výsledky' : 'View results'}
                              >
                                📊
                              </button>
                            )}
                            <button 
                              onClick={() => onGoToTest(testKey)}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60 transition-all"
                              title={lang === 'cs' ? 'Opakovat test' : 'Retake test'}
                            >
                              🔄
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Missing tests in this domain */}
                    {showAllTests && missingInDomain.map(testKey => {
                      const meta = TEST_META[testKey];
                      return (
                        <div key={testKey} className="px-5 py-4 flex items-center gap-4 opacity-50 hover:opacity-80 transition-all">
                          <div className="w-3 h-3 rounded-full shrink-0 border border-gray-700 border-dashed" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-500">{meta.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/40 border border-gray-700/40 text-gray-600">
                                {lang === 'cs' ? 'Nevyplněno' : 'Not completed'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-700 mt-0.5">{meta.category[lang]} · {meta.items} {lang === 'cs' ? 'otázek' : 'items'}</div>
                          </div>
                          <button 
                            onClick={() => onGoToTest(testKey)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-800/40 text-gray-500 hover:text-gray-300 hover:bg-gray-700/60 transition-all"
                          >
                            {lang === 'cs' ? 'Vyplnit' : 'Start'} →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {missingTests.length > 0 && (
            <button 
              onClick={() => setShowAllTests(!showAllTests)}
              className="mt-3 w-full py-2.5 rounded-xl bg-gray-900/40 border border-gray-800/40 text-xs text-gray-500 hover:text-gray-300 hover:border-gray-700 transition-all"
            >
              {showAllTests 
                ? (lang === 'cs' ? 'Skrýt nevyplněné' : 'Hide incomplete') 
                : (lang === 'cs' ? `Zobrazit ${missingTests.length} nevyplněných nástrojů` : `Show ${missingTests.length} incomplete instruments`)}
            </button>
          )}
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* CROSS-REFERENCES */}
        {/* ════════════════════════════════════════════ */}
        {crossRefs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 px-1">
              <span className="h-px flex-1 bg-gray-800" />
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                {lang === 'cs' ? 'Diagnostické cross-reference' : 'Diagnostic Cross-References'}
              </span>
              <span className="h-px flex-1 bg-gray-800" />
            </div>

            <div className="space-y-3">
              {crossRefs.map((ref) => (
                <div 
                  key={ref.id} 
                  className={`rounded-2xl border backdrop-blur-xl overflow-hidden transition-all ${STRENGTH_STYLES[ref.strength]}`}
                >
                  {/* Header - always visible */}
                  <button 
                    onClick={() => setExpandedRef(expandedRef === ref.id ? null : ref.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-all"
                  >
                    <span className="text-xl shrink-0">{ref.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-200 mb-1">{ref.title[lang]}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {ref.tests.map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-gray-800/60 text-gray-500 font-mono">
                            {TEST_META[t]?.name || t}
                          </span>
                        ))}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ref.strength === 'strong' ? 'bg-red-500/15 text-red-400' :
                          ref.strength === 'moderate' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-blue-500/15 text-blue-400'
                        }`}>
                          {STRENGTH_LABELS[ref.strength][lang]}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-600 text-xs shrink-0">{expandedRef === ref.id ? '▾' : '▸'}</span>
                  </button>

                  {/* Expanded description */}
                  {expandedRef === ref.id && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="p-4 rounded-xl bg-gray-950/40 border border-gray-800/40">
                        <p className="text-sm text-gray-300 leading-relaxed">{ref.description[lang]}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* HISTORY TIMELINE */}
        {/* ════════════════════════════════════════════ */}
        {history.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 px-1">
              <span className="h-px flex-1 bg-gray-800" />
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                {lang === 'cs' ? 'Časová osa' : 'Timeline'}
              </span>
              <span className="h-px flex-1 bg-gray-800" />
            </div>

            <div className="bg-gray-900/60 rounded-2xl border border-gray-800/60 overflow-hidden">
              <div className="divide-y divide-gray-800/30">
                {history.slice(0, 20).map((h, i) => {
                  const meta = TEST_META[h.type];
                  if (!meta) return null;
                  const status = testStatuses[h.type];
                  const sty = STATUS_STYLES[status?.status || 'ok'];

                  return (
                    <div key={h.id || i} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-800/20 transition-all">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center gap-1 shrink-0 w-8">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                        {i < history.slice(0, 20).length - 1 && <div className="w-px h-4 bg-gray-800" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.name}</span>
                          {h.type === 'mdq' ? (
                            <span className={`text-xs ${h.positive ? 'text-red-400' : 'text-green-400'}`}>
                              {h.positive ? '⚠️' : '✓'}
                            </span>
                          ) : h.score != null && (
                            <span className="text-xs text-gray-500 font-mono">{typeof h.score === 'number' && h.score % 1 !== 0 ? h.score.toFixed(2) : h.score}</span>
                          )}
                          {h.severity && <span className={`text-xs ${sty.text}`}>{h.severity}</span>}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="text-xs text-gray-600 shrink-0 flex items-center gap-1">
                        {h._source === 'cloud' && <span title="Cloud">☁</span>}
                        {new Date(h.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'cs-CZ')}
                      </div>

                      {/* View button */}
                      <button 
                        onClick={() => onViewResult(h)}
                        className="text-xs px-2 py-1 rounded-lg bg-gray-800/40 text-gray-500 hover:text-gray-300 transition-all shrink-0"
                      >
                        →
                      </button>
                    </div>
                  );
                })}
              </div>
              {history.length > 20 && (
                <div className="px-5 py-2 text-center text-xs text-gray-600 border-t border-gray-800/40">
                  {lang === 'cs' ? `+ ${history.length - 20} dalších záznamů` : `+ ${history.length - 20} more entries`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* EMPTY STATE */}
        {/* ════════════════════════════════════════════ */}
        {completedTests.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              {lang === 'cs' ? 'Žádné výsledky' : 'No Results Yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {lang === 'cs' 
                ? 'Vyplňte alespoň jeden dotazník a uložte výsledky, abyste zde viděli svůj klinický profil.' 
                : 'Complete at least one questionnaire and save the results to see your clinical profile here.'}
            </p>
            <button onClick={onBack} className="px-6 py-3 rounded-xl bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-all font-medium text-sm">
              {lang === 'cs' ? '← Přejít na dotazníky' : '← Go to questionnaires'}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* CLINICAL NOTE */}
        {/* ════════════════════════════════════════════ */}
        {completedTests.length > 0 && (
          <div className="bg-amber-950/20 rounded-2xl border border-amber-500/20 p-5 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0 mt-0.5">📌</span>
              <div>
                <h3 className="text-sm font-semibold text-amber-300 mb-1">
                  {lang === 'cs' ? 'Důležité upozornění' : 'Important Notice'}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {lang === 'cs'
                    ? 'Tento profil je generován z výsledků sebeposuzovacích dotazníků a slouží pouze jako orientační pomůcka. Nepředstavuje klinickou diagnózu. Cross-reference ukazují statisticky známé komorbidity a diagnostické překryvy, nikoli kauzální souvislosti. Pro odborné posouzení vždy konzultujte klinického psychologa nebo psychiatra.'
                    : 'This profile is generated from self-report questionnaire results and serves only as an orientation aid. It does not constitute a clinical diagnosis. Cross-references indicate statistically known comorbidities and diagnostic overlaps, not causal relationships. Always consult a clinical psychologist or psychiatrist for professional assessment.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="flex justify-center pb-8">
          <button onClick={onBack} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all">
          {lang === 'cs' ? 'Zpět na menu' : 'Back to menu'}
          </button>
        </div>

      </div>
    </div>
  );
}
