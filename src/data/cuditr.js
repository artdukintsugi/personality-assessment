/**
 * CUDIT-R — Cannabis Use Disorder Identification Test – Revised
 * Adamson SJ, Kay-Lambkin FJ, Baker AL, Lewin TJ, Thornton L, Kelly BJ, & Sellman JD. (2010).
 * An Improved Brief Measure of Cannabis Misuse: The Cannabis Use Disorders Identification
 * Test – Revised (CUDIT-R). Drug and Alcohol Dependence 110:137-143.
 *
 * 8 items. Questions 1-7 scored 0-4, Question 8 scored 0/2/4. Total range 0-32.
 * ≥8 = hazardous cannabis use, ≥12 = possible cannabis use disorder.
 */

export const CUDITR_QUESTIONS = {
  cs: [
    'Jak často užíváte konopí?',
    'Kolik hodin jste byl/a „zhulený/á" (pod vlivem) v typický den, kdy jste užíval/a konopí?',
    'Jak často jste v posledních 6 měsících zjistil/a, že nejste schopen/schopna přestat s užíváním konopí, jakmile jste začal/a?',
    'Jak často jste v posledních 6 měsících nesplnil/a to, co se od vás běžně očekávalo, kvůli užívání konopí?',
    'Jak často jste v posledních 6 měsících věnoval/a velkou část svého času získávání, užívání konopí nebo zotavování se z jeho účinků?',
    'Jak často jste v posledních 6 měsících měl/a problémy s pamětí nebo koncentrací po užití konopí?',
    'Jak často užíváte konopí v situacích, které by mohly být fyzicky nebezpečné, jako je řízení, obsluha strojů nebo péče o děti?',
    'Přemýšlel/a jste někdy o tom, že byste omezil/a nebo přestal/a s užíváním konopí?',
  ],
  en: [
    'How often do you use cannabis?',
    'How many hours were you "stoned" on a typical day when you had been using cannabis?',
    'How often during the past 6 months did you find that you were not able to stop using cannabis once you had started?',
    'How often during the past 6 months did you fail to do what was normally expected from you because of using cannabis?',
    'How often in the past 6 months have you devoted a great deal of your time to getting, using, or recovering from cannabis?',
    'How often in the past 6 months have you had a problem with your memory or concentration after using cannabis?',
    'How often do you use cannabis in situations that could be physically hazardous, such as driving, operating machinery, or caring for children?',
    'Have you ever thought about cutting down, or stopping, your use of cannabis?',
  ],
};

/**
 * Per-item response scales.
 * Q1-7 (items 0-6): 5 options scored 0-4
 * Q8 (item 7):      3 options — stored as answer 0/1/2, mapped to scores 0/2/4 by scoreCUDITR()
 */
export const CUDITR_SCALES = {
  cs: [
    // Q1
    ['Nikdy', 'Jednou měsíčně nebo méně', '2–4× za měsíc', '2–3× týdně', '4× nebo vícekrát týdně'],
    // Q2
    ['Méně než 1 hodina', '1–2 hodiny', '3–4 hodiny', '5–6 hodin', '7 a více hodin'],
    // Q3
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q4
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q5
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q6
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q7
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q8 — only 3 options, answer values 0/1/2, scored 0/2/4
    ['Nikdy', 'Ano, ale ne v posledních 6 měsících', 'Ano, v posledních 6 měsících'],
  ],
  en: [
    // Q1
    ['Never', 'Monthly or less', '2-4 times a month', '2-3 times a week', '4+ times a week'],
    // Q2
    ['Less than 1', '1 or 2', '3 or 4', '5 or 6', '7 or more'],
    // Q3
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    // Q4
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    // Q5
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    // Q6
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    // Q7
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    // Q8 — only 3 options, answer values 0/1/2, scored 0/2/4
    ['Never', 'Yes, but not in the past 6 months', 'Yes, during the past 6 months'],
  ],
};

/**
 * Score CUDIT-R correctly per the original paper:
 * Q1-7 (items 0-6): raw answer value 0-4
 * Q8 (item 7): 3 response options — answer 0→score 0, answer 1→score 2, answer 2→score 4
 */
export const Q8_SCORE_MAP = [0, 2, 4];

export function scoreCUDITR(answers) {
  let total = 0;
  for (let i = 0; i < 8; i++) {
    const v = typeof answers === 'object' && !Array.isArray(answers) ? answers[i] : answers?.[i];
    if (v === undefined || v === null) continue;
    if (i === 7) {
      total += Q8_SCORE_MAP[v] ?? 0;
    } else {
      total += v;
    }
  }
  return total;
}

/** Uniform simplified scale for GenericQuestionnaire (Q1-7 display) */
export const CUDITR_SCALE_SIMPLE = {
  cs: ['0', '1', '2', '3', '4'],
  en: ['0', '1', '2', '3', '4'],
};

export const CUDITR_SEVERITY = [
  { min: 0, max: 7, key: 'low', color: '#4ADE80', cs: 'Nízké riziko', en: 'Low risk' },
  { min: 8, max: 11, key: 'hazardous', color: '#FB923C', cs: 'Rizikové užívání konopí', en: 'Hazardous cannabis use' },
  { min: 12, max: 32, key: 'dependence', color: '#F87171', cs: 'Možná porucha z užívání konopí — doporučeno další vyšetření', en: 'Possible cannabis use disorder — further assessment recommended' },
];

export const CUDITR_CUTOFF = 8;
