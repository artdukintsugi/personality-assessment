/**
 * ISI — Insomnia Severity Index (Morin, 1993)
 * 7 items, scale 0-4, total range 0-28
 * Widely used clinical screener for insomnia severity
 */

export const ISI_QUESTIONS = {
  cs: [
    'Potíže s usínáním',
    'Potíže s udržením spánku (probouzení se v noci)',
    'Příliš brzké probouzení',
    'Jak jste spokojen/a se svým současným režimem spánku?',
    'Jak moc si myslíte, že vaše problémy se spánkem narušují vaše každodenní fungování (např. denní únava, schopnost pracovat/vykonávat denní povinnosti, soustředění, paměť, nálada atd.)?',
    'Jak nápadné/viditelné jsou pro ostatní vaše problémy se spánkem z hlediska zhoršení kvality vašeho života?',
    'Jak moc vás vaše současné problémy se spánkem znepokojují?',
  ],
  en: [
    'Difficulty falling asleep',
    'Difficulty staying asleep',
    'Problems waking up too early',
    'How satisfied/dissatisfied are you with your current sleep pattern?',
    'How much do you think your sleep problem interferes with your daily functioning (e.g., daytime fatigue, ability to function at work/daily chores, concentration, memory, mood, etc.)?',
    'How noticeable to others do you think your sleep problem is in terms of impairing the quality of your life?',
    'How worried/distressed are you about your current sleep problem?',
  ],
};

export const ISI_SCALE = {
  cs: [
    ['0 — Žádné', '0 — Velmi spokojen/a', '0 — Vůbec ne', '0 — Vůbec ne', '0 — Vůbec ne'],
    ['1 — Mírné', '1 — Spokojen/a', '1 — Málo', '1 — Málo', '1 — Málo'],
    ['2 — Střední', '2 — Neutrální', '2 — Poněkud', '2 — Poněkud', '2 — Poněkud'],
    ['3 — Závažné', '3 — Nespokojen/a', '3 — Hodně', '3 — Hodně', '3 — Hodně'],
    ['4 — Velmi závažné', '4 — Velmi nespokojen/a', '4 — Velmi hodně', '4 — Velmi hodně', '4 — Velmi hodně'],
  ],
  en: [
    ['0 — None', '0 — Very satisfied', '0 — Not at all', '0 — Not at all', '0 — Not at all'],
    ['1 — Mild', '1 — Satisfied', '1 — A little', '1 — A little', '1 — A little'],
    ['2 — Moderate', '2 — Moderately satisfied', '2 — Somewhat', '2 — Somewhat', '2 — Somewhat'],
    ['3 — Severe', '3 — Dissatisfied', '3 — Much', '3 — Much', '3 — Much'],
    ['4 — Very severe', '4 — Very dissatisfied', '4 — Very much', '4 — Very much', '4 — Very much'],
  ],
};

// Simplified uniform scale labels (for the QuestionnaireScreen component which uses uniform labels)
export const ISI_SCALE_SIMPLE = {
  cs: ['0 — Žádné / Vůbec ne', '1 — Mírné / Málo', '2 — Střední / Poněkud', '3 — Závažné / Hodně', '4 — Velmi závažné / Velmi hodně'],
  en: ['0 — None / Not at all', '1 — Mild / A little', '2 — Moderate / Somewhat', '3 — Severe / Much', '4 — Very severe / Very much'],
};

export const ISI_SEVERITY = [
  { key: 'none', min: 0, max: 7, color: '#4ADE80',
    cs: 'Bez klinicky významné nespavosti', en: 'No clinically significant insomnia' },
  { key: 'subthreshold', min: 8, max: 14, color: '#FBBF24',
    cs: 'Subklinická nespavost', en: 'Subthreshold insomnia' },
  { key: 'moderate', min: 15, max: 21, color: '#FB923C',
    cs: 'Klinická nespavost (středně těžká)', en: 'Clinical insomnia (moderate severity)' },
  { key: 'severe', min: 22, max: 28, color: '#F87171',
    cs: 'Klinická nespavost (těžká)', en: 'Clinical insomnia (severe)' },
];
