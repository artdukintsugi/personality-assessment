/**
 * AQ-10 — Autism-Spectrum Quotient, 10-item abbreviated version (Allison et al., 2012)
 * 10 items, scale 0–3 (Definitely Agree / Slightly Agree / Slightly Disagree / Definitely Disagree)
 *
 * Binary scoring per item (0 or 1):
 *   Agree-scored items (1,7,8,10): score 1 if raw ≤ 1 (Definitely or Slightly Agree)
 *   Disagree-scored items (2,3,4,5,6,9): score 1 if raw ≥ 2 (Slightly or Definitely Disagree)
 *
 * Total range: 0–10; cutoff: < 6 not elevated, ≥ 6 elevated
 */

export const AQ10_QUESTIONS = {
  cs: [
    'Všímám si malých zvuků, které ostatní neslyší.',                                              // 1  agree
    'Obvykle se soustředím více na celkový obraz než na drobné detaily.',                           // 2  disagree
    'Snadno dělám více věcí najednou.',                                                             // 3  disagree
    'Pokud dojde k přerušení, mohu se velmi rychle vrátit k tomu, co jsem dělal/a.',              // 4  disagree
    'Snadno \'čtu mezi řádky\', když se mnou někdo mluví.',                                        // 5  disagree
    'Vím, kdy se posluchač začíná nudit.',                                                          // 6  disagree
    'Když čtu příběh, je pro mě obtížné zjistit záměry postav.',                                   // 7  agree
    'Rád/a sbírám informace o kategoriích věcí (např. typy aut, ptáků, vlaků, rostlin).',          // 8  agree
    'Snadno zjistím, co si někdo myslí nebo cítí, jen pohledem do jeho tváře.',                    // 9  disagree
    'Je pro mě obtížné zjistit záměry druhých.',                                                   // 10 agree
  ],
  en: [
    'I often notice small sounds when others do not.',                                              // 1  agree
    'I usually concentrate more on the whole picture, rather than the small details.',              // 2  disagree
    'I find it easy to do more than one thing at once.',                                            // 3  disagree
    'If there is an interruption, I can switch back to what I was doing very quickly.',             // 4  disagree
    'I find it easy to \'read between the lines\' when someone is talking to me.',                 // 5  disagree
    'I know how to tell if someone listening to me is getting bored.',                              // 6  disagree
    'When I\'m reading a story, I find it difficult to work out the characters\' intentions.',      // 7  agree
    'I like to collect information about categories of things (e.g. types of car, bird, train, plant, etc.).', // 8  agree
    'I find it easy to work out what someone is thinking or feeling just by looking at their face.', // 9  disagree
    'I find it difficult to work out people\'s intentions.',                                        // 10 agree
  ],
};

export const AQ10_SCALE = {
  cs: ['Rozhodně souhlasím', 'Spíše souhlasím', 'Spíše nesouhlasím', 'Rozhodně nesouhlasím'],
  en: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
};

/** Items (0-indexed) scored as 1 if answer is Agree (raw ≤ 1): 1-indexed: 1,7,8,10 */
export const AQ10_AGREE_ITEMS = [0, 6, 7, 9];

/** Items (0-indexed) scored as 1 if answer is Disagree (raw ≥ 2): 1-indexed: 2,3,4,5,6,9 */
export const AQ10_DISAGREE_ITEMS = [1, 2, 3, 4, 5, 8];

/** Convert a raw answer (0–3) for a given item index to binary (0 or 1) */
export function aq10Binary(itemIdx, rawValue) {
  if (AQ10_AGREE_ITEMS.includes(itemIdx)) return rawValue <= 1 ? 1 : 0;
  return rawValue >= 2 ? 1 : 0;
}

/** Score AQ-10. Returns { total, binaryScores } */
export function scoreAQ10(answers) {
  const binaryScores = {};
  for (let i = 0; i < 10; i++) {
    binaryScores[i] = aq10Binary(i, answers?.[i] ?? 2);
  }
  const total = Object.values(binaryScores).reduce((a, b) => a + b, 0);
  return { total, binaryScores };
}

export const AQ10_CUTOFF = 6;

export const AQ10_SEVERITY = [
  { min: 0, max: 5, key: 'low', color: '#4ADE80',
    cs: 'Nízká úroveň autistických rysů', en: 'Low autistic traits' },
  { min: 6, max: 10, key: 'elevated', color: '#F87171',
    cs: 'Zvýšená úroveň autistických rysů', en: 'Elevated autistic traits' },
];
