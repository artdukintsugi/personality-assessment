/**
 * CATI — Comprehensive Autistic Trait Inventory (English et al., 2021)
 * CATI v1.1 — 42 items, 6 subscales × 7 items each
 * Scale: 1-5 (Definitely Disagree to Definitely Agree)
 * Reverse-scored items: 8, 15, 19, 23, 28 (1-indexed)
 * Total range: 42–210, subscale range: 7–35
 */

// Subscale keys & metadata
export const CATI_SUBSCALES = {
  SOC: { cs: 'Sociální interakce', en: 'Social Interactions', color: '#818CF8' },
  COM: { cs: 'Komunikace', en: 'Communication', color: '#F87171' },
  CAM: { cs: 'Sociální kamufláž', en: 'Social Camouflage', color: '#FBBF24' },
  FLX: { cs: 'Kognitivní (ne)flexibilita', en: 'Cognitive (In)Flexibility', color: '#34D399' },
  REG: { cs: 'Autoregulační chování', en: 'Self-regulatory Behaviours', color: '#60A5FA' },
  SEN: { cs: 'Senzorická citlivost', en: 'Sensory Sensitivity', color: '#A78BFA' },
};

// 0-indexed item indices for each subscale (mapped from scoring key)
// 1-indexed: SOC=8,10,15,17,28,30,35 / COM=13,19,23,26,33,37,42 / CAM=3,6,9,16,22,29,39
// FLX=2,5,14,21,27,34,38 / REG=1,7,12,20,25,32,41 / SEN=4,11,18,24,31,36,40
export const CATI_SUBSCALE_ITEMS = {
  SOC: [7, 9, 14, 16, 27, 29, 34],
  COM: [12, 18, 22, 25, 32, 36, 41],
  CAM: [2, 5, 8, 15, 21, 28, 38],
  FLX: [1, 4, 13, 20, 26, 33, 37],
  REG: [0, 6, 11, 19, 24, 31, 40],
  SEN: [3, 10, 17, 23, 30, 35, 39],
};

// Reverse-scored items (0-indexed): items 8, 15, 19, 23, 28 in 1-indexed = indices 7, 14, 18, 22, 27
export const CATI_REVERSE_ITEMS = [7, 14, 18, 22, 27];

export const CATI_SCALE = {
  cs: ['1 — Rozhodně nesouhlasím', '2 — Spíše nesouhlasím', '3 — Ani souhlas, ani nesouhlas', '4 — Spíše souhlasím', '5 — Rozhodně souhlasím'],
  en: ['1 — Definitely Disagree', '2 — Somewhat Disagree', '3 — Neither Agree nor Disagree', '4 — Somewhat Agree', '5 — Definitely Agree'],
};

export const CATI_QUESTIONS = {
  cs: [
    'Často přistihnu sám/sama sebe, jak si pohrávám nebo opakovaně manipuluji s předměty (např. cvakám propiskou)',
    'Rád/a se držím určitých rutin při každodenních činnostech',
    'Vynakládám hodně duševní energie na to, abych zapadl/a mezi ostatní',
    'Jsem velmi citlivý/á na jasné osvětlení',
    'Jsou určité činnosti, které vždy dělám stejným způsobem, pokaždé',
    'Někdy pozoruji, jak lidé komunikují, a snažím se je napodobit, když potřebuji socializovat',
    'Často se houpám, když sedím na židli',
    'Obecně si užívám společenské akce', // REVERSE
    'Hledám strategie a způsoby, jak působit společenštěji',
    'V sociálních situacích se snažím vyhnout interakcím s ostatními lidmi',
    'Jsou chvíle, kdy cítím, že mé smysly jsou přetížené',
    'Jsou určité předměty, se kterými si pohrávám a které mi pomáhají se uklidnit nebo soustředit myšlenky',
    'Číst neverbální signály (např. výrazy obličeje, řeč těla) je pro mě obtížné',
    'Rád/a mám své věci roztříděné určitým způsobem a trávím čas tím, aby tomu tak bylo',
    'Sociální interakce je pro mě snadná', // REVERSE
    'Když komunikuji s jinými lidmi, vynakládám hodně úsilí na sledování toho, jak působím',
    'Sociální interakce jsou pro mě stresující',
    'Jsem velmi citlivý/á na dotek',
    'Dokážu rozpoznat, jak se lidé cítí, z výrazů jejich obličeje', // REVERSE
    'Mám tendenci přecházet sem a tam nebo se pohybovat opakovanou cestou',
    'Cítím nepohodlí, když mi je zabráněno dokončit určitou rutinu',
    'Spoléhám se na sadu naučených frází, když mluvím s lidmi',
    'Je pro mě snadné vycítit, co někdo jiný cítí', // REVERSE
    'Jsem velmi citlivý/á na určité chutě (např. slaná, kyselá, pikantní nebo sladká)',
    'Provádím určité opakující se činnosti, když se cítím ve stresu',
    'Zřídka používám neverbální signály při interakcích s ostatními',
    'Často trvám na tom, dělat věci určitým způsobem, nebo je předělávat, dokud nejsou „tak akorát“',
    'Cítím se sebejistě nebo schopně, když potkávám nové lidi', // REVERSE
    'Před zapojením do sociální situace si kde je to možné vytvořím scénář, který budu následovat',
    'Společenské události jsou pro mě často náročné',
    'Někdy přítomnost pachu znemožňuje soustředit se na cokoli jiného',
    'Jsou určité opakující se činnosti, které ostatní považují za pro mě „charakteristické“ (např. hladím si vlasy)',
    'Metafory nebo „přenesené významy“ mě často matou',
    'Vadí mi, když se plány, které jsem si udělal/a, změní',
    'Je pro mě obtížné získávat nové přátele',
    'Reaguji silně na nečekané hlasité zvuky',
    'Mám potíže porozumět pohledu někoho jiného',
    'Rád/a si uspořádávám předměty do řad nebo vzorů',
    'Snažím se dodržovat určitá „pravidla“, abych se v sociálních situacích zorientoval/a',
    'Jsem citlivý/á na blikající světla',
    'Mám určité návyky, které je pro mě obtížné přestat dělat (např. kousání/trhání nehtů, vytrhávání pramenů vlasů)',
    'Mám potíže porozumět „nepsaným pravidlům“ sociálních situací',
  ],
  en: [
    'I often find myself fiddling or playing repetitively with objects (e.g. clicking pens)',
    'I like to stick to certain routines for every-day tasks',
    'I expend a lot of mental energy trying to fit in with others',
    'I am very sensitive to bright lighting',
    'There are certain activities that I always choose to do the same way, every time',
    'Sometimes I watch people interacting and try to copy them when I need to socialise',
    'I often rock when sitting in a chair',
    'I generally enjoy social events', // REVERSE
    'I look for strategies and ways to appear more sociable',
    'In social situations, I try to avoid interactions with other people',
    'There are times when I feel that my senses are overloaded',
    'There are certain objects that I fiddle or play with that can help me calm down or collect my thoughts',
    'Reading non-verbal cues (e.g. facial expressions, body language) is difficult for me',
    'I like my belongings to be sorted in certain ways and will spend time making sure they are that way',
    'Social interaction is easy for me', // REVERSE
    'When interacting with other people, I spend a lot of effort monitoring how I am coming across',
    'I find social interactions stressful',
    'I am very sensitive to touch',
    'I can tell how people feel from their facial expressions', // REVERSE
    'I have a tendency to pace or move around in a repetitive path',
    'I feel discomfort when prevented from completing a particular routine',
    'I rely on a set of scripts when I talk with people',
    'I find it easy to sense what someone else is feeling', // REVERSE
    'I am very sensitive to particular tastes (e.g. salty, sour, spicy, or sweet)',
    'I engage in certain repetitive actions when I feel stressed',
    'I rarely use non-verbal cues in my interactions with others',
    'I often insist on doing things in a certain way, or re-doing things until they are "just right"',
    'I feel confident or capable when meeting new people', // REVERSE
    'Before engaging in a social situation, I will create a script to follow where possible',
    'Social occasions are often challenging for me',
    'Sometimes the presence of a smell makes it hard for me to focus on anything else',
    'There are certain repetitive actions that others consider to be "characteristic" of me (e.g. stroking my hair)',
    'Metaphors or "figures of speech" often confuse me',
    'It annoys me when plans I have made are changed',
    'I find it difficult to make new friends',
    'I react strongly to unexpected loud noises',
    'I have difficulty understanding someone else\'s point-of-view',
    'I like to arrange items in rows or patterns',
    'I try to follow certain "rules" in order to get by in social situations',
    'I am sensitive to flickering lights',
    'I have certain habits that I find difficult to stop (e.g. biting/tearing nails, pulling strands of hair)',
    'I have difficulty understanding the "unspoken rules" of social situations',
  ],
};

/**
 * Score a CATI response set. Returns { total, subscales: { SOC: score, ... } }
 * Handles reverse scoring for items 8, 15, 19, 23, 28 (0-indexed: 7, 14, 18, 22, 27)
 */
export function scoreCATI(answers) {
  const scored = {};
  for (let i = 0; i < 42; i++) {
    const raw = answers[i] ?? 3; // default to neutral if missing
    scored[i] = CATI_REVERSE_ITEMS.includes(i) ? (6 - raw) : raw;
  }
  const total = Object.values(scored).reduce((a, b) => a + b, 0);

  const subscales = {};
  for (const [key, meta] of Object.entries(CATI_SUBSCALES)) {
    const items = CATI_SUBSCALE_ITEMS[key];
    subscales[key] = items.reduce((sum, idx) => sum + (scored[idx] || 0), 0);
  }

  return { total, subscales, scored };
}

// Severity interpretation (no official cut-offs published, using distributional guidance)
// Based on Bell et al. 2019 community sample means ~105 (SD ~25)
export const CATI_SEVERITY = [
  { key: 'low', min: 42, max: 84, color: '#4ADE80',
    cs: 'Nízké autistické rysy', en: 'Low autistic traits' },
  { key: 'belowAvg', min: 85, max: 104, color: '#A3E635',
    cs: 'Podprůměrné autistické rysy', en: 'Below-average autistic traits' },
  { key: 'average', min: 105, max: 125, color: '#FBBF24',
    cs: 'Průměrné autistické rysy', en: 'Average autistic traits' },
  { key: 'aboveAvg', min: 126, max: 150, color: '#FB923C',
    cs: 'Nadprůměrné autistické rysy', en: 'Above-average autistic traits' },
  { key: 'high', min: 151, max: 210, color: '#F87171',
    cs: 'Vysoké autistické rysy', en: 'High autistic traits' },
];
