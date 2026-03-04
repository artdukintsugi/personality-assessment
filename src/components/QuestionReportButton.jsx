import React, { useState } from 'react';
import { addReport } from '../lib/feedback';

const TYPE_OPTIONS = [
  { value: 'grammar', emoji: '📝', cs: 'Špatná gramatika / překlad', en: 'Bad grammar / translation' },
  { value: 'scoring', emoji: '🔢', cs: 'Nesprávné počítání', en: 'Wrong scoring' },
  { value: 'other', emoji: '📋', cs: 'Jiné', en: 'Other' },
];

/**
 * Inline report button shown next to each question.
 * Opens a tiny popover where user can quickly flag the question.
 */
export default function QuestionReportButton({ questionIndex, questionText, testId, lang = 'cs' }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('grammar');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    addReport({
      type,
      message: note.trim() || (type === 'grammar' ? 'Chyba v textu otázky' : type === 'scoring' ? 'Problém s počítáním skóre' : 'Problém s otázkou'),
      testId,
      questionIndex,
      questionText,
      lang,
    });
    setNote('');
    setSent(true);
    setTimeout(() => { setSent(false); setOpen(false); }, 1500);
  };

  if (sent) {
    return (
      <span className="inline-flex items-center text-green-400 text-[10px] gap-1 ml-1">
        ✓ {lang === 'cs' ? 'Odesláno' : 'Sent'}
      </span>
    );
  }

  return (
    <span className="relative inline-block ml-1">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-gray-700 hover:text-amber-400 text-xs transition-all"
        title={lang === 'cs' ? 'Nahlásit problém s otázkou' : 'Report issue with this question'}
      >
        ⚑
      </button>

      {open && (
        <div
          className="absolute right-0 top-6 z-50 bg-gray-950 border border-gray-700 rounded-xl p-3 shadow-xl w-56"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-[10px] text-gray-500 mb-2">
            {lang === 'cs' ? `Nahlásit Q${questionIndex + 1}` : `Report Q${questionIndex + 1}`}
          </div>

          {/* Quick type buttons */}
          <div className="flex flex-wrap gap-1 mb-2">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                  type === opt.value
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                    : 'border-gray-700/40 bg-gray-800/30 text-gray-500'
                }`}
              >
                {opt.emoji} {opt[lang] || opt.cs}
              </button>
            ))}
          </div>

          {/* Optional note */}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder={lang === 'cs' ? 'Poznámka (volitelné)...' : 'Note (optional)...'}
            className="w-full p-1.5 rounded bg-gray-900 border border-gray-700 text-[11px] text-gray-300 placeholder:text-gray-600 resize-none mb-2"
          />

          <div className="flex gap-2">
            <button onClick={submit} className="flex-1 py-1 rounded bg-amber-600 text-white text-[10px] font-semibold hover:bg-amber-500 transition-all">
              {lang === 'cs' ? 'Odeslat' : 'Submit'}
            </button>
            <button onClick={() => setOpen(false)} className="px-2 py-1 rounded bg-gray-800 text-gray-500 text-[10px] hover:text-gray-300 transition-all">
              ✕
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
