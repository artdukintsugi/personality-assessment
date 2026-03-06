/**
 * ASRS v1.1 — Adult ADHD Self-Report Scale (Kessler et al., 2005)
 * 18 items: Part A (screener, items 1–6) + Part B (items 7–18)
 * Scale: 0–4 (Never / Rarely / Sometimes / Often / Very Often)
 *
 * Scoring: binary per item (0 or 1 based on threshold)
 *   Items 1,2,3,9,12,16,18 (1-indexed) → 1 if score ≥ 2 ("Sometimes")
 *   Items 4,5,6,7,8,10,11,13,14,15,17 (1-indexed) → 1 if score ≥ 3 ("Often")
 * Part A score (items 1–6): range 0–6; ≥ 4 = highly consistent with ADHD
 * Total score (all 18): range 0–18
 */

export const ASRS_QUESTIONS = {
  cs: [
    // Part A (1–6)
    'Jak často máte potíže s dokončením závěrečných detailů projektu poté, co jsou náročné části hotové?',
    'Jak často máte potíže s udržením pořádku, když musíte plnit úkol vyžadující organizaci?',
    'Jak často máte problémy se zapamatováním si schůzek nebo závazků?',
    'Když máte úkol vyžadující hodně přemýšlení, jak často se mu vyhýbáte nebo odkládáte jeho zahájení?',
    'Jak často se ošíváte nebo vrtíte rukama či nohama, když musíte dlouho sedět?',
    'Jak často se cítíte přehnaně aktivní a nuceni něco dělat, jako byste byli poháněni motorem?',
    // Part B (7–18)
    'Jak často děláte nepozorné chyby, když pracujete na nudném nebo obtížném projektu?',
    'Jak často máte potíže se soustředěním při nudné nebo opakující se práci?',
    'Jak často máte potíže soustředit se na to, co vám lidé říkají, přestože s vámi přímo mluví?',
    'Jak často ztrácíte věci nebo máte potíže s jejich nalezením doma nebo v práci?',
    'Jak často vás rozptyluje okolní ruch nebo aktivita?',
    'Jak často opouštíte své místo na schůzkách nebo v situacích, kde se od vás očekává, že zůstanete sedět?',
    'Jak často se cítíte neklidní nebo neschopní se uvolnit?',
    'Jak často máte potíže se zklidněním a relaxací, když máte volný čas?',
    'Jak často zjišťujete, že v sociálních situacích mluvíte příliš mnoho?',
    'Jak často v rozhovoru dokončujete věty druhého dříve, než je může dokončit on/ona sám/sama?',
    'Jak často máte potíže s čekáním na svou řadu, když je to vyžadováno?',
    'Jak často přerušujete ostatní, když jsou zaneprázdněni?',
  ],
  en: [
    // Part A (1–6)
    'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    'How often do you have problems remembering appointments or obligations?',
    'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
    // Part B (7–18)
    'How often do you make careless mistakes when you have to work on a boring or difficult project?',
    'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
    'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
    'How often do you misplace or have difficulty finding things at home or at work?',
    'How often are you distracted by activity or noise around you?',
    'How often do you leave your seat in meetings or other situations in which you are expected to remain seated?',
    'How often do you feel restless or fidgety?',
    'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
    'How often do you find yourself talking too much when you are in social situations?',
    'When you\'re in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?',
    'How often do you have difficulty waiting your turn in situations when turn taking is required?',
    'How often do you interrupt others when they are busy?',
  ],
};

export const ASRS_SCALE = {
  cs: ['Nikdy', 'Zřídka', 'Někdy', 'Často', 'Velmi často'],
  en: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
};

/**
 * Items (0-indexed) where threshold is "Sometimes" (≥ 2):
 * 1-indexed: 1, 2, 3, 9, 12, 16, 18 → 0-indexed: 0, 1, 2, 8, 11, 15, 17
 */
export const ASRS_SOMETIMES_ITEMS = [0, 1, 2, 8, 11, 15, 17];

/**
 * Items (0-indexed) where threshold is "Often" (≥ 3):
 * 1-indexed: 4, 5, 6, 7, 8, 10, 11, 13, 14, 15, 17 → 0-indexed: 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 16
 */
export const ASRS_OFTEN_ITEMS = [3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 16];

/** Convert a raw answer (0–4) for a given item index to binary (0 or 1) */
export function asrsBinary(itemIdx, rawValue) {
  if (ASRS_SOMETIMES_ITEMS.includes(itemIdx)) return rawValue >= 2 ? 1 : 0;
  return rawValue >= 3 ? 1 : 0;
}

/** Score ASRS: returns { partA, total, binaryScores } */
export function scoreASRS(answers) {
  const binaryScores = {};
  for (let i = 0; i < 18; i++) {
    binaryScores[i] = asrsBinary(i, answers?.[i] ?? 0);
  }
  const partA = [0, 1, 2, 3, 4, 5].reduce((s, i) => s + binaryScores[i], 0);
  const total = Object.values(binaryScores).reduce((a, b) => a + b, 0);
  return { partA, total, binaryScores };
}

export const ASRS_SEVERITY = [
  { min: 0, max: 3, key: 'low', color: '#4ADE80',
    cs: 'Symptomy neodpovídají ADHD', en: 'Symptoms inconsistent with ADHD' },
  { min: 4, max: 6, key: 'high', color: '#F87171',
    cs: 'Symptomy vysoce odpovídají ADHD', en: 'Symptoms highly consistent with ADHD' },
];

/** Part A subscale (inattention: 0–2, hyperactivity/impulsivity: 3–5) */
export const ASRS_SUBSCALES = {
  inattention: [0, 1, 2],
  hyperactivity: [3, 4, 5],
};
