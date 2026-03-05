import React, { useEffect, useState } from 'react';
import { getReports, addReport, resolveReport, deleteReport, exportReportsJSON } from '../lib/feedback';

export default function FeedbackButton({ lang = 'cs' }) {
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [type, setType] = useState('other');
  const [message, setMessage] = useState('');

  useEffect(() => setReports(getReports()), []);

  const refresh = () => setReports(getReports());

  const submit = () => {
    if (!message.trim()) return;
    addReport({ type, message: message.trim(), lang });
    setMessage('');
    refresh();
    setTimeout(() => setOpen(false), 600);
  };

  const handleResolve = (id) => { resolveReport(id); refresh(); };
  const handleDelete = (id) => { deleteReport(id); refresh(); };

  const handleExport = () => {
    const blob = new Blob([exportReportsJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'feedback_reports.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fixed right-4 bottom-4 z-[999]">
        <button
          onClick={() => setOpen(true)}
          title={lang === 'cs' ? 'Nahlásit problém' : 'Report an issue'}
          className="relative w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center shadow-lg border border-amber-700/30"
        >
          ⚑
          {reports.filter(r => !r.resolved).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {reports.filter(r => !r.resolved).length}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-200">{lang === 'cs' ? 'Nahlásit problém' : 'Report an issue'}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleExport} className="text-xs text-gray-400 hover:text-gray-200">Export</button>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-200">✕</button>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[12px] text-gray-400 mb-1">{lang === 'cs' ? 'Typ' : 'Type'}</div>
              <div className="flex gap-2 mb-2">
                <button onClick={() => setType('grammar')} className={`px-2 py-1 rounded text-xs ${type === 'grammar' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300'}`}>📝 {lang === 'cs' ? 'Gramatika' : 'Grammar'}</button>
                <button onClick={() => setType('scoring')} className={`px-2 py-1 rounded text-xs ${type === 'scoring' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300'}`}>🔢 {lang === 'cs' ? 'Skórování' : 'Scoring'}</button>
                <button onClick={() => setType('bug')} className={`px-2 py-1 rounded text-xs ${type === 'bug' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300'}`}>🐛 Bug</button>
                <button onClick={() => setType('suggestion')} className={`px-2 py-1 rounded text-xs ${type === 'suggestion' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300'}`}>💡 {lang === 'cs' ? 'Návrh' : 'Suggestion'}</button>
              </div>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder={lang === 'cs' ? 'Popište problém...' : 'Describe the issue...'}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder:text-gray-500" />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button onClick={submit} className="flex-1 py-2 rounded bg-amber-600 text-white font-semibold text-sm">{lang === 'cs' ? 'Odeslat' : 'Submit'}</button>
              <button onClick={() => { setMessage(''); setType('other'); }} className="px-3 py-2 rounded bg-gray-800 text-gray-400 text-sm">{lang === 'cs' ? 'Vymazat' : 'Clear'}</button>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-2">{lang === 'cs' ? 'Nahlášené problémy' : 'Reported issues'}</div>
              <div className="max-h-56 overflow-auto space-y-2">
                {reports.length === 0 && <div className="text-xs text-gray-500">{lang === 'cs' ? 'Žádné nahlášení' : 'No reports yet'}</div>}
                {reports.map(r => (
                  <div key={r.id} className={`p-2 rounded-lg border ${r.resolved ? 'border-green-700 bg-green-950/5' : 'border-gray-700 bg-gray-900'}`}>
                    <div className="flex items-start gap-2">
                      <div className="text-xs text-gray-300 font-mono">{r.type}</div>
                      <div className="text-sm text-gray-200 break-words flex-1">{r.message}</div>
                      <div className="ml-auto text-xs text-gray-400 shrink-0">{new Date(r.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {!r.resolved && <button onClick={() => handleResolve(r.id)} className="text-xs text-green-400">{lang === 'cs' ? 'Vyřešit' : 'Resolve'}</button>}
                      <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500">{lang === 'cs' ? 'Smazat' : 'Delete'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
