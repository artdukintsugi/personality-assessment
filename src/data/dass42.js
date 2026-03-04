/**
 * DASS-42 — Depression Anxiety Stress Scales (full 42-item version)
 * Lovibond & Lovibond, 1995
 * Scale: 0-3 (Did not apply → Applied very much/most of the time)
 * 3 subscales × 14 items each
 * 
 * Also provides DASS-21 subset (items marked with *)
 */

export const DASS42_QUESTIONS = {
  cs: [
    "Rozčiloval/a jsem se kvůli celkem banálním věcem",                                              // 1  S
    "Uvědomoval/a jsem si sucho v ústech",                                                            // 2  A
    "Zdálo se mi, že nemohu prožívat žádný pozitivní pocit",                                          // 3  D
    "Měl/a jsem potíže s dýcháním (např. nadměrně rychlé dýchání, dušnost bez fyzické námahy)",       // 4  A
    "Připadalo mi, že se k ničemu nedokážu přimět",                                                   // 5  D
    "Měl/a jsem tendenci přehnaně reagovat na situace",                                                // 6  S
    "Měl/a jsem pocit roztřesenosti (např. pocit, že mi podklesnou nohy)",                             // 7  A
    "Bylo pro mě obtížné se uvolnit",                                                                 // 8  S
    "Ocital/a jsem se v situacích, které ve mně vyvolávaly takovou úzkost, že jsem byl/a velmi rád/a, když skončily", // 9  A
    "Měl/a jsem pocit, že se nemám na co těšit",                                                      // 10 D
    "Snadno jsem se rozčílil/a",                                                                       // 11 S
    "Měl/a jsem pocit, že spotřebovávám hodně nervové energie",                                       // 12 S
    "Cítil/a jsem se smutný/á a depresivní",                                                          // 13 D
    "Ztrácel/a jsem trpělivost, kdykoli mě něco zdržovalo (např. výtahy, semafory, čekání)",          // 14 S
    "Měl/a jsem pocit na omdlení",                                                                    // 15 A
    "Měl/a jsem pocit, že jsem ztratil/a zájem téměř o všechno",                                      // 16 D
    "Měl/a jsem pocit, že jako člověk nemám velkou cenu",                                             // 17 D
    "Měl/a jsem pocit, že jsem dost přecitlivělý/á",                                                  // 18 S
    "Výrazně jsem se potil/a (např. ruce) bez vysokých teplot nebo fyzické námahy",                    // 19 A
    "Měl/a jsem strach bez dobrého důvodu",                                                            // 20 A
    "Měl/a jsem pocit, že za to život nestojí",                                                        // 21 D
    "Bylo pro mě obtížné se zklidnit",                                                                // 22 S
    "Měl/a jsem potíže s polykáním",                                                                  // 23 A
    "Zdálo se mi, že nemůžu prožívat žádnou radost z věcí, které dělám",                              // 24 D
    "Uvědomoval/a jsem si činnost svého srdce bez fyzické námahy (např. zrychlení tepu, vynechání úderu)", // 25 A
    "Cítil/a jsem se sklíčeně a smutně",                                                              // 26 D
    "Zjistil/a jsem, že jsem velmi podrážděný/á",                                                     // 27 S
    "Měl/a jsem pocit, že jsem blízko paniky",                                                        // 28 A
    "Po rozčílení bylo obtížné se znovu uklidnit",                                                     // 29 S
    "Obával/a jsem se, že mě vykolejí nějaký banální, ale neznámý úkol",                              // 30 A
    "Nedokázal/a jsem se pro nic nadchnout",                                                           // 31 D
    "Bylo pro mě obtížné tolerovat, když mě někdo vyrušil od toho, co jsem právě dělal/a",           // 32 S
    "Byl/a jsem ve stavu nervového napětí",                                                            // 33 S
    "Měl/a jsem pocit, že za moc nestojím",                                                           // 34 D
    "Nesnášel/a jsem cokoli, co mě zdržovalo od toho, co jsem právě dělal/a",                        // 35 S
    "Cítil/a jsem hrůzu",                                                                             // 36 A
    "Neviděl/a jsem nic v budoucnosti, v co bych mohl/a doufat",                                      // 37 D
    "Měl/a jsem pocit, že život nemá smysl",                                                          // 38 D
    "Zjistil/a jsem, že jsem rozrušený/á",                                                            // 39 S
    "Obával/a jsem se situací, ve kterých bych mohl/a panikařit a ztrapnit se",                       // 40 A
    "Měl/a jsem třes (např. rukou)",                                                                  // 41 A
    "Bylo pro mě obtížné se přimět k zahájení činnosti",                                              // 42 D
  ],
  en: [
    "I found myself getting upset by quite trivial things",                                            // 1  S
    "I was aware of dryness of my mouth",                                                              // 2  A
    "I couldn't seem to experience any positive feeling at all",                                        // 3  D
    "I experienced breathing difficulty (eg, excessively rapid breathing, breathlessness in the absence of physical exertion)", // 4  A
    "I just couldn't seem to get going",                                                               // 5  D
    "I tended to over-react to situations",                                                            // 6  S
    "I had a feeling of shakiness (eg, legs going to give way)",                                        // 7  A
    "I found it difficult to relax",                                                                   // 8  S
    "I found myself in situations that made me so anxious I was most relieved when they ended",        // 9  A
    "I felt that I had nothing to look forward to",                                                    // 10 D
    "I found myself getting upset rather easily",                                                       // 11 S
    "I felt that I was using a lot of nervous energy",                                                 // 12 S
    "I felt sad and depressed",                                                                        // 13 D
    "I found myself getting impatient when I was delayed in any way (eg, elevators, traffic lights, being kept waiting)", // 14 S
    "I had a feeling of faintness",                                                                    // 15 A
    "I felt that I had lost interest in just about everything",                                         // 16 D
    "I felt I wasn't worth much as a person",                                                          // 17 D
    "I felt that I was rather touchy",                                                                 // 18 S
    "I perspired noticeably (eg, hands sweaty) in the absence of high temperatures or physical exertion", // 19 A
    "I felt scared without any good reason",                                                            // 20 A
    "I felt that life wasn't worthwhile",                                                               // 21 D
    "I found it hard to wind down",                                                                    // 22 S
    "I had difficulty in swallowing",                                                                  // 23 A
    "I couldn't seem to get any enjoyment out of the things I did",                                    // 24 D
    "I was aware of the action of my heart in the absence of physical exertion (eg, sense of heart rate increase, heart missing a beat)", // 25 A
    "I felt down-hearted and blue",                                                                    // 26 D
    "I found that I was very irritable",                                                               // 27 S
    "I felt I was close to panic",                                                                     // 28 A
    "I found it hard to calm down after something upset me",                                           // 29 S
    "I feared that I would be 'thrown' by some trivial but unfamiliar task",                           // 30 A
    "I was unable to become enthusiastic about anything",                                               // 31 D
    "I found it difficult to tolerate interruptions to what I was doing",                              // 32 S
    "I was in a state of nervous tension",                                                             // 33 S
    "I felt I was pretty worthless",                                                                   // 34 D
    "I was intolerant of anything that kept me from getting on with what I was doing",                 // 35 S
    "I felt terrified",                                                                                // 36 A
    "I could see nothing in the future to be hopeful about",                                           // 37 D
    "I felt that life was meaningless",                                                                // 38 D
    "I found myself getting agitated",                                                                 // 39 S
    "I was worried about situations in which I might panic and make a fool of myself",                 // 40 A
    "I experienced trembling (eg, in the hands)",                                                      // 41 A
    "I found it difficult to work up the initiative to do things",                                     // 42 D
  ],
};

export const DASS42_SCALE = {
  cs: ["Vůbec mě to nevystihovalo", "Částečně nebo někdy mě to vystihovalo", "Vystihovalo mě to značně nebo po větší část doby", "Vystihovalo mě to velmi přesně nebo po většinu času"],
  en: ["Did not apply to me at all", "Applied to me to some degree, or some of the time", "Applied to me to a considerable degree, or a good part of time", "Applied to me very much, or most of the time"],
};

/** Subscale item indices (0-based) */
export const DASS42_SUBSCALES = {
  depression: [2, 4, 9, 12, 15, 16, 20, 23, 25, 30, 33, 36, 37, 41],
  anxiety:    [1, 3, 6, 8, 14, 18, 19, 22, 24, 27, 29, 35, 39, 40],
  stress:     [0, 5, 7, 10, 11, 13, 17, 21, 26, 28, 31, 32, 34, 38],
};

/** DASS-21 subset: indices within DASS-42 (0-based). 
 *  DASS-21 uses items: D={3,5,10,13,16,17,21}, A={2,4,7,9,15,19,20}, S={1,6,8,11,12,14,18}
 *  But numbering in DASS-21 standalone is different. Here we map DASS-42 item indices that correspond to DASS-21.
 *  Standard DASS-21 items from DASS-42 are:
 *  Depression: 3,5,10,13,16,17,21 → 0-based: 2,4,9,12,15,16,20
 *  Anxiety: 2,4,7,9,15,19,20 → 0-based: 1,3,6,8,14,18,19
 *  Stress: 1,6,8,11,12,14,18 → 0-based: 0,5,7,10,11,13,17
 */
export const DASS21_SUBSET = {
  depression: [2, 4, 9, 12, 15, 16, 20],
  anxiety:    [1, 3, 6, 8, 14, 18, 19],
  stress:     [0, 5, 7, 10, 11, 13, 17],
};

/** DASS-42 severity cut-offs (sum of items in subscale) */
export const DASS42_SEVERITY = {
  depression: [
    { min: 0, max: 9, key: 'normal', color: '#4ADE80' },
    { min: 10, max: 13, key: 'mild', color: '#FBBF24' },
    { min: 14, max: 20, key: 'moderate', color: '#FB923C' },
    { min: 21, max: 27, key: 'severe', color: '#F87171' },
    { min: 28, max: 42, key: 'extremelySevere', color: '#EF4444' },
  ],
  anxiety: [
    { min: 0, max: 7, key: 'normal', color: '#4ADE80' },
    { min: 8, max: 9, key: 'mild', color: '#FBBF24' },
    { min: 10, max: 14, key: 'moderate', color: '#FB923C' },
    { min: 15, max: 19, key: 'severe', color: '#F87171' },
    { min: 20, max: 42, key: 'extremelySevere', color: '#EF4444' },
  ],
  stress: [
    { min: 0, max: 14, key: 'normal', color: '#4ADE80' },
    { min: 15, max: 18, key: 'mild', color: '#FBBF24' },
    { min: 19, max: 25, key: 'moderate', color: '#FB923C' },
    { min: 26, max: 33, key: 'severe', color: '#F87171' },
    { min: 34, max: 42, key: 'extremelySevere', color: '#EF4444' },
  ],
};

/** DASS-21 severity cut-offs (sum × 2, or use raw sum with these halved thresholds) 
 *  Standard practice: multiply DASS-21 subscale sums by 2 to compare with DASS-42 norms.
 *  Here we provide raw DASS-21 cut-offs (without multiplying). */
export const DASS21_SEVERITY = {
  depression: [
    { min: 0, max: 4, key: 'normal', color: '#4ADE80' },
    { min: 5, max: 6, key: 'mild', color: '#FBBF24' },
    { min: 7, max: 10, key: 'moderate', color: '#FB923C' },
    { min: 11, max: 13, key: 'severe', color: '#F87171' },
    { min: 14, max: 21, key: 'extremelySevere', color: '#EF4444' },
  ],
  anxiety: [
    { min: 0, max: 3, key: 'normal', color: '#4ADE80' },
    { min: 4, max: 4, key: 'mild', color: '#FBBF24' },
    { min: 5, max: 7, key: 'moderate', color: '#FB923C' },
    { min: 8, max: 9, key: 'severe', color: '#F87171' },
    { min: 10, max: 21, key: 'extremelySevere', color: '#EF4444' },
  ],
  stress: [
    { min: 0, max: 7, key: 'normal', color: '#4ADE80' },
    { min: 8, max: 9, key: 'mild', color: '#FBBF24' },
    { min: 10, max: 12, key: 'moderate', color: '#FB923C' },
    { min: 13, max: 16, key: 'severe', color: '#F87171' },
    { min: 17, max: 21, key: 'extremelySevere', color: '#EF4444' },
  ],
};
