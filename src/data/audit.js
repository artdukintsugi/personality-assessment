/**
 * AUDIT — Alcohol Use Disorders Identification Test
 * Saunders JB, Aasland OG, Babor TF, de la Fuente JR, Grant M. (1993).
 * Development of the Alcohol Use Disorders Identification Test (AUDIT):
 * WHO Collaborative Project on Early Detection of Persons with Harmful Alcohol Consumption-II.
 * Addiction 88(6):791-804.
 *
 * 10 items. Q1-Q8 scored 0-4, Q9-Q10 scored 0/2/4.
 * Total range 0-40.
 * 3 domains: Hazardous use (Q1-3), Dependence symptoms (Q4-6), Harmful use (Q7-10)
 * Cut-offs: ≥8 hazardous, ≥16 harmful, ≥20 possible dependence
 */

export const AUDIT_QUESTIONS = {
  cs: [
    'Jak často pijete alkoholické nápoje?',
    'Kolik sklenic alkoholického nápoje si obvykle dáte v den, kdy pijete?',
    'Jak často vypijete šest nebo více sklenic při jedné příležitosti?',
    'Jak často jste během posledního roku zjistil/a, že nejste schopen/schopna přestat pít, jakmile jste začal/a?',
    'Jak často jste během posledního roku nesplnil/a to, co se od vás běžně očekávalo, kvůli pití?',
    'Jak často jste během posledního roku potřeboval/a první ranní drink, abyste se dostal/a do pohody po silném pití předchozí den?',
    'Jak často jste během posledního roku měl/a pocit viny nebo výčitek svědomí po pití?',
    'Jak často jste během posledního roku nebyl/a schopen/schopna si vzpomenout, co se stalo předchozí večer, protože jste pil/a?',
    'Utrpěl/a jste vy nebo někdo jiný zranění v důsledku vašeho pití?',
    'Vyjádřil někdo z vašich příbuzných, přátel, lékařů nebo jiných zdravotníků obavy ohledně vašeho pití nebo vám doporučil, abyste pití omezil/a?',
  ],
  en: [
    'How often do you have a drink containing alcohol?',
    'How many drinks containing alcohol do you have on a typical day when you are drinking?',
    'How often do you have six or more drinks on one occasion?',
    'How often during the last year have you found that you were not able to stop drinking once you had started?',
    'How often during the last year have you failed to do what was normally expected from you because of drinking?',
    'How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?',
    'How often during the last year have you had a feeling of guilt or remorse after drinking?',
    'How often during the last year have you been unable to remember what happened the night before because you had been drinking?',
    'Have you or someone else been injured as a result of your drinking?',
    'Has a relative or friend or a doctor or another health worker been concerned about your drinking or suggested you cut down?',
  ],
};

/**
 * Per-item response scales.
 * Q1-8 (items 0-7): 5 options scored 0-4
 * Q9-10 (items 8-9): 3 options — answer 0→score 0, answer 1→score 2, answer 2→score 4
 */
export const AUDIT_SCALES = {
  cs: [
    // Q1 — Frequency
    ['Nikdy', 'Jednou měsíčně nebo méně', '2–4× za měsíc', '2–3× týdně', '4× nebo vícekrát týdně'],
    // Q2 — Quantity
    ['1–2', '3–4', '5–6', '7–9', '10 nebo více'],
    // Q3 — Binge frequency
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q4
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q5
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q6
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q7
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q8
    ['Nikdy', 'Méně než měsíčně', 'Měsíčně', 'Týdně', 'Denně nebo téměř denně'],
    // Q9 — 3 options, scored 0/2/4
    ['Ne', 'Ano, ale ne v posledním roce', 'Ano, v posledním roce'],
    // Q10 — 3 options, scored 0/2/4
    ['Ne', 'Ano, ale ne v posledním roce', 'Ano, v posledním roce'],
  ],
  en: [
    // Q1
    ['Never', 'Monthly or less', '2-4 times a month', '2-3 times a week', '4+ times a week'],
    // Q2
    ['1 or 2', '3 or 4', '5 or 6', '7 to 9', '10 or more'],
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
    // Q8
    ['Never', 'Less than monthly', 'Monthly', 'Weekly', 'Daily or almost daily'],
    // Q9 — 3 options, scored 0/2/4
    ['No', 'Yes, but not in the last year', 'Yes, during the last year'],
    // Q10 — 3 options, scored 0/2/4
    ['No', 'Yes, but not in the last year', 'Yes, during the last year'],
  ],
};

/** Mapping for Q9 and Q10: answer index → score */
export const Q910_SCORE_MAP = [0, 2, 4];

/**
 * Score AUDIT correctly per the original WHO manual:
 * Q1-8 (items 0-7): raw answer value 0-4
 * Q9-10 (items 8-9): 3 response options — answer 0→score 0, answer 1→score 2, answer 2→score 4
 */
export function scoreAUDIT(answers) {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    const v = typeof answers === 'object' && !Array.isArray(answers) ? answers[i] : answers?.[i];
    if (v === undefined || v === null) continue;
    if (i >= 8) {
      total += Q910_SCORE_MAP[v] ?? 0;
    } else {
      total += v;
    }
  }
  return total;
}

/** AUDIT subscales (0-based item indices) */
export const AUDIT_SUBSCALES = {
  hazardous:  { items: [0, 1, 2], cs: 'Rizikové pití', en: 'Hazardous Use', color: '#FBBF24' },
  dependence: { items: [3, 4, 5], cs: 'Příznaky závislosti', en: 'Dependence Symptoms', color: '#FB923C' },
  harmful:    { items: [6, 7, 8, 9], cs: 'Škodlivé pití', en: 'Harmful Use', color: '#F87171' },
};

/** Score a specific subscale */
export function scoreAUDITSubscale(answers, subscale) {
  return AUDIT_SUBSCALES[subscale].items.reduce((sum, i) => {
    const v = answers?.[i];
    if (v === undefined || v === null) return sum;
    if (i >= 8) return sum + (Q910_SCORE_MAP[v] ?? 0);
    return sum + v;
  }, 0);
}

export const AUDIT_SEVERITY = [
  { min: 0, max: 7, key: 'low', color: '#4ADE80', cs: 'Nízké riziko', en: 'Low risk' },
  { min: 8, max: 15, key: 'hazardous', color: '#FBBF24', cs: 'Rizikové pití — doporučena krátká intervence', en: 'Hazardous drinking — brief intervention recommended' },
  { min: 16, max: 19, key: 'harmful', color: '#FB923C', cs: 'Škodlivé pití — krátká intervence + pokračující sledování', en: 'Harmful drinking — brief intervention + continued monitoring' },
  { min: 20, max: 40, key: 'dependence', color: '#F87171', cs: 'Možná závislost na alkoholu — doporučena diagnostika a léčba', en: 'Possible alcohol dependence — diagnostic evaluation & treatment recommended' },
];

export const AUDIT_CUTOFF = 8;

