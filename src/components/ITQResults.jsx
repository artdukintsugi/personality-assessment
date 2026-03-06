import React, { useState } from 'react';
import { useLocalStorage } from '../lib/hooks';
import CompareModal from './CompareModal';
import { ITQ_QUESTIONS, ITQ_SCALE, ITQ_CLUSTERS, ITQ_SEVERITY, scoreITQ, scoreITQCluster, diagnoseITQ, ITQ_PTSD_ITEMS, ITQ_DSO_ITEMS } from '../data/itq';
import { checkSimpleValidity, ValiditySection, SeverityBadge, ScoreBar } from './GenericQuestionnaire';

export default function ITQResults({ answers, questions, lang, t, onBack, toggleLang, onSave }) {
  const q = ITQ_QUESTIONS[lang] || ITQ_QUESTIONS.cs;
  const scale = ITQ_SCALE[lang] || ITQ_SCALE.cs;
  const total = scoreITQ(answers);
  const maxScore = 72;
  const validity = checkSimpleValidity(answers, 18, 0, 4, lang);
  const dx = diagnoseITQ(answers);

  const [showLive, setShowLive] = useLocalStorage('itq_showLiveResults', true);

  const [showCompare, setShowCompare] = useState(false);

  const ptsdTotal = ITQ_PTSD_ITEMS.reduce((s, i) => s + (answers?.[i] ?? 0), 0);
  const dsoTotal = ITQ_DSO_ITEMS.reduce((s, i) => s + (answers?.[i] ?? 0), 0);

  const clusterLabel = (key) => ITQ_CLUSTERS[key]?.[lang] || ITQ_CLUSTERS[key]?.cs || key;

  // Diagnosis badge
  const dxLabel = dx.diagnosis === 'cptsd'
    ? { cs: 'Komplexní PTSD', en: 'Complex PTSD', color: '#EF4444' }
    : dx.diagnosis === 'ptsd'
    ? { cs: 'PTSD', en: 'PTSD', color: '#FB923C' }
    : { cs: 'Pod prahem', en: 'Below threshold', color: '#4ADE80' };

  return (
    <div className="min-h-screen bg-[#060608] text-white">
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">ITQ — {lang === 'cs' ? 'Výsledky' : 'Results'}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCompare(true)} className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-200">{lang === 'cs' ? 'Porovnat' : 'Compare'}</button>
          <button onClick={() => setShowLive(s => !s)} className={`text-xs px-2 py-1 rounded ${showLive ? 'bg-white/[0.06] text-gray-200' : 'bg-gray-700 text-gray-300'}`}>{showLive ? (lang==='cs'?'Skrýt živé výsledky':'Hide live') : (lang==='cs'?'Zobrazit živé výsledky':'Show live')}</button>
          <button onClick={toggleLang} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 hover:bg-gray-600">{lang === 'cs' ? 'EN' : 'CZ'}</button>
        </div>
      </div>

      {showCompare && (
        <CompareModal onClose={() => setShowCompare(false)} current={(typeof total !== 'undefined') ? total : answers} currentLabel={lang === 'cs' ? 'Vy' : 'You'} lang={lang} />
      )}

      {/* Diagnosis badge */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06] animate-scale-in">
          <div className="text-center mb-3">
            <span className="text-gray-400 text-sm block mb-2">{lang === 'cs' ? 'ICD-11 diagnostický algoritmus' : 'ICD-11 Diagnostic Algorithm'}</span>
            <span className="inline-block px-4 py-2 rounded-full text-lg font-bold" style={{ background: dxLabel.color + '33', color: dxLabel.color, border: `2px solid ${dxLabel.color}` }}>
              {dxLabel[lang] || dxLabel.cs}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{lang === 'cs' ? 'Celkové skóre' : 'Total Score'}</span>
            <SeverityBadge score={total} severityLevels={ITQ_SEVERITY} lang={lang} />
          </div>
          <div className="text-4xl font-bold text-white mb-1">{total}<span className="text-lg text-gray-500">/{maxScore}</span></div>
          <ScoreBar value={total} max={maxScore} color="#7C3AED" label="" />
        </div>
      )}

      {/* PTSD / DSO summary */}
      {showLive && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/[0.06] rounded-xl p-4 border border-white/[0.06]">
            <div className="text-sm text-gray-400 mb-1">PTSD</div>
            <div className="text-2xl font-bold" style={{ color: dx.ptsdMet ? '#FB923C' : '#4ADE80' }}>{ptsdTotal}<span className="text-sm text-gray-500">/24</span></div>
            <div className="text-xs mt-1" style={{ color: dx.ptsdMet ? '#FB923C' : '#4ADE80' }}>
              {dx.ptsdMet ? (lang === 'cs' ? '✓ Kritéria splněna' : '✓ Criteria met') : (lang === 'cs' ? '✗ Kritéria nesplněna' : '✗ Criteria not met')}
            </div>
          </div>
          <div className="bg-white/[0.06] rounded-xl p-4 border border-white/[0.06]">
            <div className="text-sm text-gray-400 mb-1">DSO</div>
            <div className="text-2xl font-bold" style={{ color: dx.dsoMet ? '#A78BFA' : '#4ADE80' }}>{dsoTotal}<span className="text-sm text-gray-500">/24</span></div>
            <div className="text-xs mt-1" style={{ color: dx.dsoMet ? '#A78BFA' : '#4ADE80' }}>
              {dx.dsoMet ? (lang === 'cs' ? '✓ Kritéria splněna' : '✓ Criteria met') : (lang === 'cs' ? '✗ Kritéria nesplněna' : '✗ Criteria not met')}
            </div>
          </div>
        </div>
      )}

      {/* Cluster breakdown */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'PTSD klastry' : 'PTSD Clusters'}</h3>
          {['reExperiencing', 'avoidance', 'senseOfThreat', 'ptsdFunctional'].map(key => {
            const c = ITQ_CLUSTERS[key];
            const cScore = scoreITQCluster(answers, key);
            const maxC = c.items.length * 4;
            const met = key === 'ptsdFunctional' ? dx.ptsdClusters.functional :
                        key === 'reExperiencing' ? dx.ptsdClusters.reExperiencing :
                        key === 'avoidance' ? dx.ptsdClusters.avoidance : dx.ptsdClusters.senseOfThreat;
            return (
              <div key={key} className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{c[lang] || c.cs}</span>
                  <span className="text-xs" style={{ color: met ? '#4ADE80' : '#F87171' }}>{met ? '✓' : '✗'}</span>
                </div>
                <ScoreBar value={cScore} max={maxC} color={c.color} label="" />
              </div>
            );
          })}
        </div>
      )}

      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'DSO klastry' : 'DSO Clusters'}</h3>
          {['affectDysreg', 'negativeSelf', 'disturbedRel', 'dsoFunctional'].map(key => {
            const c = ITQ_CLUSTERS[key];
            const cScore = scoreITQCluster(answers, key);
            const maxC = c.items.length * 4;
            const met = key === 'dsoFunctional' ? dx.dsoClusters.functional :
                        key === 'affectDysreg' ? dx.dsoClusters.affectDysreg :
                        key === 'negativeSelf' ? dx.dsoClusters.negativeSelf : dx.dsoClusters.disturbedRel;
            return (
              <div key={key} className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{c[lang] || c.cs}</span>
                  <span className="text-xs" style={{ color: met ? '#4ADE80' : '#F87171' }}>{met ? '✓' : '✗'}</span>
                </div>
                <ScoreBar value={cScore} max={maxC} color={c.color} label="" />
              </div>
            );
          })}
        </div>
      )}

      {/* Diagnostic criteria overview */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Diagnostická kritéria' : 'Diagnostic Criteria'}</h3>
          <div className="text-sm space-y-2">
            <div className="text-gray-400 mb-2">{lang === 'cs' ? 'Položka je „endorsována“ pokud skóre ≥ 2.' : 'An item is "endorsed" if score ≥ 2.'}</div>
            <div className="flex items-start gap-2">
              <span className="w-5 text-center" style={{ color: dx.ptsdMet ? '#4ADE80' : '#F87171' }}>{dx.ptsdMet ? '✓' : '✗'}</span>
              <span className="text-gray-300"><strong>PTSD:</strong> {lang === 'cs' ? '≥1 endorsovaná v každém PTSD klastru + funkční dopad' : '≥1 endorsed in each PTSD cluster + functional impairment'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 text-center" style={{ color: dx.cptsdMet ? '#4ADE80' : '#F87171' }}>{dx.cptsdMet ? '✓' : '✗'}</span>
              <span className="text-gray-300"><strong>CPTSD:</strong> {lang === 'cs' ? 'PTSD kritéria + ≥1 endorsovaná v každém DSO klastru + DSO funkční dopad' : 'PTSD criteria + ≥1 endorsed in each DSO cluster + DSO functional impairment'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Item breakdown */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06] animate-slide-up delay-100">
          <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Odpovědi po položkách' : 'Item Breakdown'}</h3>
          <div className="space-y-2">
            {q.map((text, i) => {
              const v = answers?.[i] ?? 0;
              const endorsed = v >= 2;
              // Cluster headers
              let header = null;
              if (i === 0) header = lang === 'cs' ? 'Znovuprožívání' : 'Re-experiencing';
              if (i === 2) header = lang === 'cs' ? 'Vyhýbání' : 'Avoidance';
              if (i === 4) header = lang === 'cs' ? 'Pocit ohrožení' : 'Sense of Threat';
              if (i === 6) header = lang === 'cs' ? 'PTSD — funkční dopad' : 'PTSD — Functional Impairment';
              if (i === 9) header = lang === 'cs' ? 'Dysregulace afektu' : 'Affect Dysregulation';
              if (i === 11) header = lang === 'cs' ? 'Negativní sebepojetí' : 'Negative Self-Concept';
              if (i === 13) header = lang === 'cs' ? 'Narušené vztahy' : 'Disturbed Relationships';
              if (i === 15) header = lang === 'cs' ? 'DSO — funkční dopad' : 'DSO — Functional Impairment';
              return (
                <React.Fragment key={i}>
                  {header && <div className="text-xs text-purple-400 font-semibold mt-3 mb-1 uppercase tracking-wide">{header}</div>}
                  <div className={`flex items-start gap-2 text-sm px-2 py-1 rounded ${endorsed ? 'bg-red-900/20 border border-red-700/30' : ''}`}>
                    <span className="text-gray-500 w-6 shrink-0">{i + 1}.</span>
                    <span className="text-gray-300 flex-1">{text}</span>
                    <span className={`font-mono w-6 text-right ${endorsed ? 'text-red-300' : 'text-gray-400'}`}>{v}</span>
                    <span className="text-gray-500 text-xs w-20 text-right truncate">{scale[v] || ''}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Severity scale */}
      {showLive && (
        <div className="bg-white/[0.06] rounded-xl p-6 mb-4 border border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white mb-3">{lang === 'cs' ? 'Závažnost symptomů' : 'Symptom Severity'}</h3>
          <div className="space-y-1">
            {ITQ_SEVERITY.map((s, i) => {
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
          ? 'ITQ je sebeposuzovací nástroj dle ICD-11 a nenahrazuje klinické vyšetření. Diagnostické závěry by měl stanovit kvalifikovaný odborník.'
          : 'The ITQ is a self-report measure based on ICD-11 and does not replace clinical assessment. Diagnostic conclusions should be drawn by a qualified professional.'}
      </div>

      {/* Reference */}
      <div className="bg-white/[0.06]/50 rounded-xl p-4 mb-4 border border-white/[0.06]/50 animate-slide-up delay-200">
        <div className="text-xs text-gray-500 leading-relaxed">
          Cloitre M, Shevlin M, Brewin CR, et al. (2018). The International Trauma Questionnaire: development of a self-report measure of ICD-11 PTSD and complex PTSD. <em>Acta Psychiatrica Scandinavica</em> 138(6):536-546.
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onSave && (
          <button onClick={onSave} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-500">
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
