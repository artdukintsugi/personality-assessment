/**
 * DAST-10 — Drug Abuse Screening Test (Short Form)
 * Skinner HA. (1982). The Drug Abuse Screening Test. Addictive Behaviors, 7(4), 363-371.
 * Yudko E, Lozhkina O, Fouts A. (2007). A comprehensive review of the psychometric
 * properties of the Drug Abuse Screening Test. J Subst Abuse Treat, 32(2), 189-198.
 *
 * 10 Yes/No items. Score = count of "Yes" answers (item 3 reverse: "No" = 1).
 * Total range: 0-10
 * Cut-offs: 0 = no problems, 1-2 = low level, 3-5 = moderate, 6-8 = substantial, 9-10 = severe
 */

export const DAST10_QUESTIONS = {
  cs: [
    'Užíval/a jste jiné drogy než ty, které jsou potřebné ze zdravotních důvodů?',
    'Užíval/a jste návykové léky na předpis ve vyšších dávkách než předepsaných?',
    'Dokážete vždy přestat s užíváním drog, když chcete?', // REVERSE — "Ano" = 0, "Ne" = 1
    'Měl/a jste někdy „blackout" nebo „flashback" v důsledku užívání drog?',
    'Máte někdy špatný pocit nebo pocit viny kvůli užívání drog?',
    'Stěžuje si váš partner (nebo rodiče) někdy na vaše užívání drog?',
    'Zanedbával/a jste svou rodinu kvůli užívání drog?',
    'Zapojil/a jste se někdy do nelegálních aktivit za účelem získání drog?',
    'Zažil/a jste někdy abstinenční příznaky (necítil/a se dobře), když jste přestal/a brát drogy?',
    'Měl/a jste někdy zdravotní problémy v důsledku užívání drog (např. ztráta paměti, hepatitida, křeče, krvácení)?',
  ],
  en: [
    'Have you used drugs other than those required for medical reasons?',
    'Do you abuse more than one drug at a time?',
    'Are you always able to stop using drugs when you want to?', // REVERSE — "Yes" = 0, "No" = 1
    'Have you had "blackouts" or "flashbacks" as a result of drug use?',
    'Do you ever feel bad or guilty about your drug use?',
    'Does your spouse (or parent) ever complain about your involvement with drugs?',
    'Have you neglected your family because of your use of drugs?',
    'Have you engaged in illegal activities in order to obtain drugs?',
    'Have you ever experienced withdrawal symptoms (felt sick) when you stopped taking drugs?',
    'Have you had medical problems as a result of your drug use (e.g., memory loss, hepatitis, convulsions, bleeding)?',
  ],
};

export const DAST10_SCALE = {
  cs: ['Ne', 'Ano'],
  en: ['No', 'Yes'],
};

/** Item 3 (index 2) is reverse-scored: "Yes"(1) = 0, "No"(0) = 1 */
export const DAST10_REVERSE_ITEM = 2;

export function scoreDAST10(answers) {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    const v = answers[i];
    if (v === undefined || v === null) continue;
    if (i === DAST10_REVERSE_ITEM) {
      // Reverse: No (0) scores 1, Yes (1) scores 0
      total += v === 0 ? 1 : 0;
    } else {
      total += v; // Yes (1) = 1, No (0) = 0
    }
  }
  return total;
}

export const DAST10_SEVERITY = [
  { min: 0, max: 0, key: 'none', color: '#4ADE80', cs: 'Žádné problémy', en: 'No problems reported' },
  { min: 1, max: 2, key: 'low', color: '#FBBF24', cs: 'Nízká úroveň — monitorujte', en: 'Low level — monitor' },
  { min: 3, max: 5, key: 'moderate', color: '#FB923C', cs: 'Střední úroveň — doporučena další intervence', en: 'Moderate level — further investigation recommended' },
  { min: 6, max: 8, key: 'substantial', color: '#F87171', cs: 'Významná úroveň — intenzivní posouzení', en: 'Substantial level — intensive assessment' },
  { min: 9, max: 10, key: 'severe', color: '#EF4444', cs: 'Těžká úroveň — intenzivní posouzení a léčba', en: 'Severe level — intensive assessment & treatment' },
];

export const DAST10_CUTOFF = 3;
