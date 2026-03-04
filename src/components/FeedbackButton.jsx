import React, { useState, useEffect } from 'react';
import { addReport, getReports, resolveReport, deleteReport, clearResolved, exportReportsJSON } from '../lib/feedback';

const REPORT_TYPES = [
  { value: 'grammar', emoji: '📝', cs: 'Gramatika / překlad', en: 'Grammar / translation' },
  { value: 'scoring', emoji: '🔢', cs: 'Chybné počítání skóre', en: 'Wrong score calculation' },
  { value: 'bug', emoji: '🐛', cs: 'Chyba v aplikaci', en: 'App bug' },
  { value: 'suggestion', emoji: '💡', cs: 'Návrh na zlepšení', en: 'Suggestion' },
  { value: 'other', emoji: '📋', cs: 'Jiné', en: 'Other' },
];

export default function FeedbackButton({ lang: langProp }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('form');
  const [type, setType] = useState('bug');
  const [message, setMessage] = useState('');
  const [testId, setTestId] = useState('');
  const [sent, setSent] = useState(false);
  const [reports, setReports] = useState([]);

  // Auto-detect language from localStorage if not provided via prop
  const lang = langProp || (() => { try { return JSON.parse(localStorage.getItem('diag_lang')) || 'cs'; } catch { return 'cs'; } })();

  useEffect(() => {
    if (open && view === 'list') setReports(getReports());
  }, [open, view]);

  const submit = () => {
    if (!message.trim()) return;
    addReport({ type, message: message.trim(), testId: testId || undefined, lang });
    setMessage('');
    setTestId('');
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  const handleResolve = (id) => { resolveReport(id); setReports(getReports()); };
  const handleDelete = (id) => { deleteReport(id); setReports(getReports()); };

  const handleExport = () => {
    const json = exportReportsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-reports-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearResolved = () => { clearResolved(); setReports(getReports()); };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-amber-600 hover:bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-amber-900/40 transition-all hover:scale-110"
        title={lang === 'cs' ? 'Nahlásit problém' : 'Report an issue'}
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-gray-950 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-lg">🐛</span>
            <h2 className="text-sm font-bold text-gray-200">{lang === 'cs' ? 'Nahlásit problém' : 'Report an Issue'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView(view === 'form' ? 'list' : 'form')} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-gray-200 transition-all">
              {view === 'form' ? (lang === 'cs' ? '📋 Přehled' : '📋 View All') : (lang === 'cs' ? '➕ Nový' : '➕ New')}
            </button>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300 text-lg transition-all">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'form' ? (
            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">{lang === 'cs' ? 'Typ problému' : 'Issue type'}</label>
                <div className="flex flex-wrap gap-2">
                  {REPORT_TYPES.map(rt => (
                    <button
                      key={rt.value}
                      onClick={() => setType(rt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                        type === rt.value
                          ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                          : 'border-gray-700/40 bg-gray-800/30 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {rt.emoji} {rt[lang] || rt.cs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test selector */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{lang === 'cs' ? 'Týká se testu (volitelné)' : 'Related test (optional)'}</label>
                <select
                  value={testId}
                  onChange={e => setTestId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-300"
                >
                  <option value="">{lang === 'cs' ? '— Obecné —' : '— General —'}</option>
                  {['phq9','gad7','dass42','pcl5','cati','isi','asrs','eat26','mdq','cuditr','audit','dast10','itq','pid5','lpfs'].map(t => (
                    <option key={t} value={t}>{t.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{lang === 'cs' ? 'Popis problému' : 'Description'}</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  placeholder={lang === 'cs' ? 'Popište problém, který jste našli...' : 'Describe the issue you found...'}
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-sm text-gray-200 placeholder:text-gray-600 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={submit}
                disabled={!message.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sent ? (lang === 'cs' ? '✓ Odesláno!' : '✓ Sent!') : (lang === 'cs' ? 'Odeslat hlášení' : 'Submit Report')}
              </button>

              <p className="text-[10px] text-gray-600 text-center">
                {lang === 'cs'
                  ? 'Hlášení se ukládají lokálně. Vývojář je může synchronizovat s GitHub Issues.'
                  : 'Reports are stored locally. The developer can sync them to GitHub Issues.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2 mb-3">
                <button onClick={handleExport} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-gray-200 transition-all">
                  📥 Export JSON
                </button>
                <button onClick={handleClearResolved} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-gray-200 transition-all">
                  🗑 {lang === 'cs' ? 'Smazat vyřešené' : 'Clear Resolved'}
                </button>
              </div>

              {reports.length === 0 && (
                <div className="text-center text-gray-600 text-sm py-8">{lang === 'cs' ? 'Žádná hlášení' : 'No reports'}</div>
              )}

              {reports.map(r => {
                const rt = REPORT_TYPES.find(t => t.value === r.type);
                return (
                  <div key={r.id} className={`p-3 rounded-xl border ${r.resolved ? 'border-green-900/40 bg-green-950/10' : 'border-gray-800 bg-gray-900/40'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{rt?.emoji || '📋'}</span>
                          <span className="text-xs font-medium text-gray-300">{rt?.[lang] || r.type}</span>
                          {r.testId && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-mono">{r.testId.toUpperCase()}</span>}
                          {r.resolved && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-400">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{r.message}</p>
                        {r.questionIndex !== undefined && (
                          <p className="text-[10px] text-gray-600 mt-1">Q{r.questionIndex + 1}{r.questionText ? `: "${r.questionText.slice(0, 60)}${r.questionText.length > 60 ? '...' : ''}"` : ''}</p>
                        )}
                        <p className="text-[10px] text-gray-700 mt-1">{new Date(r.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {!r.resolved && (
                          <button onClick={() => handleResolve(r.id)} className="text-[10px] px-2 py-0.5 rounded bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-all">✓</button>
                        )}
                        <button onClick={() => handleDelete(r.id)} className="text-[10px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all">✕</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
