/**
 * CUDIT-R — Cannabis Use Disorder Identification Test – Revised (Adamson et al., 2010)
 * 8 items, mostly scale 0-4; total 0-32; ≥8 = hazardous use, ≥12 = possible CUD
 */

export const CUDITR_QUESTIONS = {
  cs: [
    'Jak často jste v posledních 6 měsících užíval/a marihuanu/konopí?',
    'Kolik hodin jste byl/a „zhulený/á" (pod vlivem) v typický den, kdy jste užíval/a marihuanu?',
    'Jak často jste byl/a v posledních 6 měsících „zhulený/á" celý den?',
    'Jak často jste měl/a v posledních 6 měsících problémy s pamětí nebo koncentrací po užití marihuany?',
    'Jak často se vám v posledních 6 měsících stalo, že užívání marihuany narušilo vaše normální každodenní povinnosti (práce, škola, domácnost)?',
    'Zkoušel/a jste v posledních 6 měsících neúspěšně snížit nebo přestat užívat marihuanu?',
    'Jak často jste v posledních 6 měsících cítil/a, že vaše užívání marihuany způsobilo problémy v emoční oblasti (podrážděnost, úzkost, deprese) nebo sociální oblasti?',
    'Jak často jste v posledních 6 měsících cítil/a abstinenční příznaky po vysazení marihuany, jako např. podrážděnost, úzkost, nespavost, nechutenství, neklid?',
  ],
  en: [
    'How often did you use cannabis in the last 6 months?',
    'How many hours were you "stoned" on a typical day when you had been using cannabis?',
    'How often during the past 6 months were you "stoned" for the whole day?',
    'How often during the past 6 months did you have a problem with your memory or concentration after using cannabis?',
    'How often during the past 6 months did use of cannabis interfere with your normal daily activities (work, school, housework)?',
    'Have you tried to cut down or stop using cannabis during the past 6 months and been unable to do so?',
    'How often during the past 6 months has your cannabis use caused emotional problems (irritability, anxiety, depression) or social problems?',
    'How often during the past 6 months did you experience withdrawal symptoms (irritability, anxiety, insomnia, appetite loss, restlessness) after stopping cannabis?',
  ],
};

export const CUDITR_SCALES = {
  cs: [
    // Q1
    ['Nikdy', 'Jednou měsíčně nebo méně', '2–4× za měsíc', '2–3× týdně', '4× nebo vícekrát týdně'],
    // Q2
    ['Méně než 1 hodina', '1–2 hodiny', '3–4 hodiny', '5–6 hodin', '7 a více hodin'],
    // Q3-Q5
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q6
    ['Ne, nikdy', 'Ano, ale ne v posledních 6 měsících', 'Ano, jednou za poslední měsíc', 'Ano, vícekrát v posledních 6 měsících', 'Ano, téměř neustále'],
    // Q7-Q8
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
  ],
  en: [
    ['Never', 'Monthly or less', '2–4 times a month', '2–3 times a week', '4 or more times a week'],
    ['Less than 1 hour', '1–2 hours', '3–4 hours', '5–6 hours', '7 or more hours'],
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    ['No, never', 'Yes, but not in the last 6 months', 'Yes, once in the past month', 'Yes, several times in the past 6 months', 'Yes, almost constantly'],
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
  ],
};

/** Uniform simplified scale for generic questionnaire (not used for per-item scales) */
export const CUDITR_SCALE_SIMPLE = {
  cs: ['0', '1', '2', '3', '4'],
  en: ['0', '1', '2', '3', '4'],
};

export const CUDITR_SEVERITY = [
  { min: 0, max: 2, key: 'low', color: '#4ADE80', cs: 'Nízké riziko', en: 'Low risk' },
  { min: 3, max: 7, key: 'moderate', color: '#FBBF24', cs: 'Mírné riziko', en: 'Moderate risk' },
  { min: 8, max: 11, key: 'hazardous', color: '#FB923C', cs: 'Rizikové užívání', en: 'Hazardous use' },
  { min: 12, max: 32, key: 'dependence', color: '#F87171', cs: 'Možná porucha z užívání konopí', en: 'Possible cannabis use disorder' },
];

export const CUDITR_CUTOFF = 8;
