import React, { useState } from 'react';
import { decodePayload, parseCompareFromUrl } from '../lib/compare';

export default function CompareModal({ onClose, current, currentLabel, lang }) {
  const [input, setInput] = useState('');
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');

  const tryParse = (raw) => {
    setError('');
    try { const p = parseCompareFromUrl(raw); if (p) return p; } catch {}
    try { const p = decodePayload(raw); if (p) return p; } catch {}
    try { return JSON.parse(raw); } catch {}
    const n = parseFloat(raw);
    if (!isNaN(n)) return { test: 'unknown', scores: n, label: 'Other' };
    return null;
  };

  const onLoad = () => {
    const p = tryParse(input.trim());
    if (!p) { setError(lang === 'cs' ? 'Nelze rozparsovat vstup' : 'Unable to parse input'); return; }
    setPayload(p);
  };

  const renderComparison = () => {
    if (!payload) return null;
    const other = payload.scores;
    const label = payload.label || payload.test || (lang === 'cs' ? 'Druhý' : 'Other');

    if (typeof current === 'number' && typeof other === 'number') {
      const max = Math.max(current, other, 1);
      const pctA = Math.round((current / max) * 100);
      const pctB = Math.round((other / max) * 100);
      return (
        <div>
          <h3 className="text-sm font-semibold text-emerald-200 mb-2">{lang === 'cs' ? 'Porovnání celkového skóre' : 'Total Score Comparison'}</h3>
          <div className="mb-2 text-xs text-gray-400">{currentLabel}: {current} — {label}: {other}</div>
          <div className="relative bg-gray-800 rounded-full h-4 overflow-hidden mb-2">
            <div className="absolute left-0 top-0 h-4 rounded-full" style={{ width: `${pctA}%`, background: '#7C3AED' }} />
            <div className="absolute left-0 top-0 h-4 rounded-full" style={{ width: `${pctB}%`, background: '#7C3AED', opacity: 0.35 }} />
          </div>
        </div>
      );
    }

    if (typeof current === 'object' && typeof other === 'object') {
      const keys = Array.from(new Set([...Object.keys(current), ...Object.keys(other)]));
      return (
        <div>
          <h3 className="text-sm font-semibold text-emerald-200 mb-2">{lang === 'cs' ? 'Porovnání subškál' : 'Subscale Comparison'}</h3>
          <div className="space-y-3">
            {keys.map(k => {
              const a = Number(current[k] ?? 0);
              const b = Number(other[k] ?? 0);
              const max = Math.max(a, b, 1);
              const pa = Math.round((a / max) * 100);
              const pb = Math.round((b / max) * 100);
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>{k}</span>
                    <span className="font-mono">{a} — {b}</span>
                  </div>
                  <div className="relative bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div className="absolute left-0 top-0 h-3 rounded-full" style={{ width: `${pa}%`, background: '#3B82F6' }} />
                    <div className="absolute left-0 top-0 h-3 rounded-full" style={{ width: `${pb}%`, background: '#3B82F6', opacity: 0.35 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-sm font-semibold text-emerald-200 mb-2">{lang === 'cs' ? 'Načtená data' : 'Loaded data'}</h3>
        <pre className="text-xs p-2 bg-gray-900 rounded text-gray-200 overflow-auto">{JSON.stringify(payload, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-emerald-300">{lang === 'cs' ? 'Porovnat pomocí odkazu nebo dat' : 'Compare by link or data'}</h2>
          <button onClick={onClose} className="text-gray-400 text-sm">{lang === 'cs' ? 'Zavřít' : 'Close'}</button>
        </div>
        <label className="block text-xs text-gray-400 mb-2">{lang === 'cs' ? 'Vložte sdílecí odkaz, base64 payload, JSON nebo číslo' : 'Paste a share link, base64 payload, JSON or a number'}</label>
        <div className="flex gap-2 mb-4">
          <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 text-xs text-gray-200" />
          <button onClick={onLoad} className="px-3 py-1 rounded bg-emerald-700 text-white text-xs">{lang === 'cs' ? 'Načíst' : 'Load'}</button>
        </div>
        {error && <div className="text-red-400 text-xs mb-3">{error}</div>}
        {renderComparison()}
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-800 text-gray-300 text-xs">{lang === 'cs' ? 'Hotovo' : 'Done'}</button>
        </div>
      </div>
    </div>
  );
}
