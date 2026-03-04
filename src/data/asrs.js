/**
 * ASRS v1.1 — Adult ADHD Self-Report Scale (Kessler et al., 2005)
 * 6-item screener (Part A), scale 0-4
 * Total range 0-24; ≥14 suggests ADHD likely
 */

export const ASRS_QUESTIONS = {
  cs: [
    'Jak často máte potíže s dokončením závěrečných detailů projektu poté, co jsou náročné části hotové?',
    'Jak často máte potíže s udržením pořádku, když musíte dělat úkol vyžadující organizaci?',
    'Jak často máte problémy se zapamatováním si schůzek nebo závazků?',
    'Když máte úkol vyžadující hodně přemýšlení, jak často se mu vyhýbáte nebo odkládáte jeho zahájení?',
    'Jak často se ošíváte nebo vrtíte rukama či nohama, když musíte dlouho sedět?',
    'Jak často se cítíte přehnaně aktivní a nuceni něco dělat, jako byste byli poháněni motorem?',
  ],
  en: [
    'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    'How often do you have problems remembering appointments or obligations?',
    'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
  ],
};

export const ASRS_SCALE = {
  cs: ['Nikdy', 'Zřídka', 'Někdy', 'Často', 'Velmi často'],
  en: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
};

export const ASRS_SEVERITY = [
  { min: 0, max: 9, key: 'low', color: '#4ADE80', cs: 'Nízká pravděpodobnost ADHD', en: 'ADHD unlikely' },
  { min: 10, max: 13, key: 'borderline', color: '#FBBF24', cs: 'Hraniční — zvažte podrobnější vyšetření', en: 'Borderline — consider further evaluation' },
  { min: 14, max: 17, key: 'likely', color: '#FB923C', cs: 'ADHD pravděpodobné', en: 'ADHD likely' },
  { min: 18, max: 24, key: 'highlyLikely', color: '#F87171', cs: 'ADHD vysoce pravděpodobné', en: 'ADHD highly likely' },
];

/** Items 1-3 = Inattention subscale, Items 4-6 = Hyperactivity/Impulsivity subscale (0-indexed) */
export const ASRS_SUBSCALES = {
  inattention: [0, 1, 2],
  hyperactivity: [3, 4, 5],
};
