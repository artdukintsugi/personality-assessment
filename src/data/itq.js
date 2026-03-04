/**
 * ITQ — International Trauma Questionnaire
 * Cloitre M, Shevlin M, Brewin CR, et al. (2018).
 * The International Trauma Questionnaire: development of a self-report measure
 * of ICD-11 PTSD and complex PTSD. Acta Psychiatrica Scandinavica, 138(6), 536-546.
 * doi:10.1111/acps.12956
 *
 * 18 items (12 core + 6 functional impairment), scale 0-4
 * 6 PTSD items (Re-experiencing: 1-2, Avoidance: 3-4, Sense of Threat: 5-6)
 * 3 PTSD functional impairment items (7-9)
 * 6 DSO items (Affect Dysregulation: 10-11, Negative Self-Concept: 12-13, Disturbed Relationships: 14-15)
 * 3 DSO functional impairment items (16-18)
 *
 * PTSD diagnosis: ≥2 on at least 1 item per PTSD cluster + functional impairment
 * CPTSD diagnosis: PTSD criteria met + ≥2 on at least 1 item per DSO cluster + DSO functional impairment
 *
 * Freely available from: https://www.traumameasuresglobal.com/itq
 */

export const ITQ_QUESTIONS = {
  cs: [
    // PTSD — Re-experiencing (Re)
    'Noční můry o traumatickém zážitku/zážitcích nebo myšlenky na ně, když jste o tom nechtěl/a přemýšlet?',
    'Silné obrazy nebo vzpomínky, kde se zdálo, že se traumatický zážitek znovu odehrává právě tady a teď?',
    // PTSD — Avoidance (Av)
    'Vyhýbání se vnitřním připomínkám traumatického zážitku/zážitků (například myšlenkám, pocitům nebo fyzickým vjemům)?',
    'Vyhýbání se vnějším připomínkám traumatického zážitku/zážitků (například lidem, místům, konverzacím, předmětům, činnostem, situacím)?',
    // PTSD — Sense of current Threat (Th)
    'Zvýšená ostražitost — například neustálé sledování svého okolí nebo pocit překvapení z neočekávaných věcí?',
    'Pocit nervozity nebo snadného vylekání?',
    // PTSD — Functional impairment
    'Ovlivnily výše uvedené problémy vaše vztahy a sociální život?',
    'Ovlivnily výše uvedené problémy vaši práci nebo schopnost pracovat?',
    'Ovlivnily výše uvedené problémy jakoukoli jinou důležitou oblast vašeho života?',
    // DSO — Affect Dysregulation (AD)
    'Když jsem rozrušen/a, trvá mi dlouho, než se uklidním.',
    'Mám pocit emoční otupělosti.',
    // DSO — Negative Self-Concept (NSC)
    'Cítím se jako neúspěšný/á.',
    'Vnímám sám/samu sebe jako bezcennou osobu.',
    // DSO — Disturbed Relationships (DR)
    'Mám pocit odtržení a vzdálenosti od lidí.',
    'Je pro mě obtížné zůstat emocionálně blízko lidem.',
    // DSO — Functional impairment
    'Ovlivnily výše uvedené problémy (otázky 10–15) vaše vztahy a sociální život?',
    'Ovlivnily výše uvedené problémy (otázky 10–15) vaši práci nebo schopnost pracovat?',
    'Ovlivnily výše uvedené problémy (otázky 10–15) jakoukoli jinou důležitou oblast vašeho života?',
  ],
  en: [
    // PTSD — Re-experiencing (Re)
    'Having upsetting dreams that replay part of the experience or are clearly related to the experience?',
    'Having powerful images or memories that sometimes come into your mind in which you feel the experience is happening again in the here and now?',
    // PTSD — Avoidance (Av)
    'Avoiding internal reminders of the experience (for example, thoughts, feelings, or physical sensations)?',
    'Avoiding external reminders of the experience (for example, people, places, conversations, objects, activities, or situations)?',
    // PTSD — Sense of current Threat (Th)
    'Being "super-alert", watchful, or on guard?',
    'Feeling jumpy or easily startled?',
    // PTSD — Functional impairment
    'Have the above problems affected your relationships or social life?',
    'Have the above problems affected your work or ability to work?',
    'Have the above problems affected any other important part of your life?',
    // DSO — Affect Dysregulation (AD)
    'When I am upset, it takes me a long time to calm down.',
    'I feel numb or emotionally shut down.',
    // DSO — Negative Self-Concept (NSC)
    'I feel like a failure.',
    'I feel worthless.',
    // DSO — Disturbed Relationships (DR)
    'I feel distant or cut off from people.',
    'I find it hard to stay emotionally close to people.',
    // DSO — Functional impairment
    'Have the above problems (questions 10-15) affected your relationships or social life?',
    'Have the above problems (questions 10-15) affected your work or ability to work?',
    'Have the above problems (questions 10-15) affected any other important part of your life?',
  ],
};

export const ITQ_SCALE = {
  cs: ['0 — Vůbec ne', '1 — Trochu', '2 — Středně', '3 — Hodně', '4 — Extrémně'],
  en: ['0 — Not at all', '1 — A little bit', '2 — Moderately', '3 — Quite a bit', '4 — Extremely'],
};

/** Item clusters (0-based indices) */
export const ITQ_CLUSTERS = {
  // PTSD clusters
  reExperiencing:  { items: [0, 1], cs: 'Znovuprožívání', en: 'Re-experiencing', color: '#F87171' },
  avoidance:       { items: [2, 3], cs: 'Vyhýbání', en: 'Avoidance', color: '#FBBF24' },
  senseOfThreat:   { items: [4, 5], cs: 'Pocit ohrožení', en: 'Sense of Threat', color: '#FB923C' },
  ptsdFunctional:  { items: [6, 7, 8], cs: 'PTSD funkční dopad', en: 'PTSD Functional Impairment', color: '#F43F5E' },
  // DSO clusters
  affectDysreg:    { items: [9, 10], cs: 'Dysregulace afektu', en: 'Affect Dysregulation', color: '#A78BFA' },
  negativeSelf:    { items: [11, 12], cs: 'Negativní sebepojetí', en: 'Negative Self-Concept', color: '#60A5FA' },
  disturbedRel:    { items: [13, 14], cs: 'Narušené vztahy', en: 'Disturbed Relationships', color: '#818CF8' },
  dsoFunctional:   { items: [15, 16, 17], cs: 'DSO funkční dopad', en: 'DSO Functional Impairment', color: '#7C3AED' },
};

/** Score total (simple sum of all 18 items, 0-72) */
export function scoreITQ(answers) {
  let total = 0;
  for (let i = 0; i < 18; i++) {
    const v = answers[i];
    if (v !== undefined && v !== null) total += v;
  }
  return total;
}

/** Score a cluster (sum of items in cluster) */
export function scoreITQCluster(answers, clusterKey) {
  const cluster = ITQ_CLUSTERS[clusterKey];
  if (!cluster) return 0;
  return cluster.items.reduce((s, i) => s + (answers[i] ?? 0), 0);
}

/**
 * ICD-11 diagnostic algorithm.
 * An item "endorses" a symptom if score ≥ 2.
 *
 * PTSD: At least 1 endorsed item in Re, Av, Th + at least 1 endorsed functional impairment item (6-8)
 * CPTSD: PTSD met + at least 1 endorsed in AD, NSC, DR + at least 1 endorsed DSO functional impairment (15-17)
 */
export function diagnoseITQ(answers) {
  const endorsed = (items) => items.some(i => (answers[i] ?? 0) >= 2);

  const ptsdRe = endorsed([0, 1]);
  const ptsdAv = endorsed([2, 3]);
  const ptsdTh = endorsed([4, 5]);
  const ptsdFunc = endorsed([6, 7, 8]);

  const dsoAD = endorsed([9, 10]);
  const dsoNSC = endorsed([11, 12]);
  const dsoDR = endorsed([13, 14]);
  const dsoFunc = endorsed([15, 16, 17]);

  const ptsdMet = ptsdRe && ptsdAv && ptsdTh && ptsdFunc;
  const dsoMet = dsoAD && dsoNSC && dsoDR && dsoFunc;

  const cptsdMet = ptsdMet && dsoMet;

  return {
    ptsdClusters: { reExperiencing: ptsdRe, avoidance: ptsdAv, senseOfThreat: ptsdTh, functional: ptsdFunc },
    dsoClusters: { affectDysreg: dsoAD, negativeSelf: dsoNSC, disturbedRel: dsoDR, functional: dsoFunc },
    ptsdMet,
    dsoMet,
    cptsdMet,
    diagnosis: cptsdMet ? 'cptsd' : ptsdMet ? 'ptsd' : 'none',
  };
}

/** PTSD total (items 0-5), DSO total (items 9-14), max each = 24 */
export const ITQ_PTSD_ITEMS = [0, 1, 2, 3, 4, 5];
export const ITQ_DSO_ITEMS = [9, 10, 11, 12, 13, 14];

export const ITQ_SEVERITY = [
  { min: 0, max: 17, key: 'low', color: '#4ADE80', cs: 'Nízké symptomy', en: 'Low symptoms' },
  { min: 18, max: 35, key: 'moderate', color: '#FBBF24', cs: 'Střední symptomy', en: 'Moderate symptoms' },
  { min: 36, max: 53, key: 'high', color: '#FB923C', cs: 'Vysoké symptomy', en: 'High symptoms' },
  { min: 54, max: 72, key: 'severe', color: '#EF4444', cs: 'Závažné symptomy', en: 'Severe symptoms' },
];
