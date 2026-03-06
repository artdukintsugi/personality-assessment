/**
 * AQ — Autism-Spectrum Quotient (Baron-Cohen et al., 2001)
 * 50 items, scale 0–3 (Definitely Agree / Slightly Agree / Slightly Disagree / Definitely Disagree)
 *
 * Binary scoring per item (0 or 1):
 *   Agree-scored items: score 1 if raw ≤ 1 (Definitely or Slightly Agree)
 *   Disagree-scored items: score 1 if raw ≥ 2 (Slightly or Definitely Disagree)
 *
 * Total range: 0–50; cutoff: Not elevated < 32, Elevated ≥ 32
 * 5 subscales × 10 items each (binary scored)
 */

export const AQ_QUESTIONS = {
  cs: [
    'Raději dělám věci s ostatními než sám/sama.',                                              // 1  SOC  disagree
    'Raději dělám věci stále stejným způsobem.',                                                // 2  ATT  agree
    'Když se snažím si něco představit, je pro mě velmi snadné vytvořit si mentální obraz.',   // 3  IMG  disagree
    'Často se tak silně ponořím do jedné věci, že ztratím přehled o ostatním.',                // 4  ATT  agree
    'Často si všímám drobných zvuků, které ostatní neslyší.',                                  // 5  DET  agree
    'Obvykle si všímám poznávacích značek aut nebo podobných sérií čísel a písmen.',           // 6  DET  agree
    'Jiní lidé mi říkají, že to, co jsem řekl/a, je nezdvořilé, i když si myslím, že je to v pořádku.', // 7  COM  agree
    'Když čtu příběh, snadno si dokážu představit, jak asi vypadají postavy.',                 // 8  IMG  disagree
    'Fascinují mě data.',                                                                       // 9  DET  agree
    'Ve skupině snadno sleduji několik různých konverzací najednou.',                          // 10 ATT  disagree
    'Ve společenských situacích se cítím dobře.',                                              // 11 SOC  disagree
    'Mám tendenci si všímat detailů, které si ostatní nevšimnou.',                             // 12 DET  agree
    'Raději chodím do knihovny než na večírek.',                                               // 13 SOC  agree
    'Vymýšlet příběhy mi přijde snadné.',                                                     // 14 IMG  disagree
    'Cítím se více přitahován/a k lidem než k věcem.',                                        // 15 SOC  disagree
    'Mám tendenci mít velmi silné zájmy a rozrušuje mě, když je nemohu sledovat.',            // 16 ATT  agree
    'Rád/a konverzuji o různých tématech.',                                                   // 17 COM  disagree
    'Když mluvím, není vždy snadné, aby druzí přišli ke slovu.',                              // 18 COM  agree
    'Fascinují mě čísla.',                                                                    // 19 DET  agree
    'Když čtu příběh, je pro mě obtížné zjistit záměry postav.',                              // 20 IMG  agree
    'Beletrie mě příliš nebere.',                                                             // 21 IMG  agree
    'Je pro mě obtížné navazovat nová přátelství.',                                           // 22 SOC  agree
    'Neustále si všímám vzorů ve věcech.',                                                    // 23 DET  agree
    'Raději bych šel/šla do divadla než do muzea.',                                           // 24 IMG  disagree
    'Nevadí mi, když je narušen můj denní režim.',                                            // 25 ATT  disagree
    'Často zjišťuji, že nevím, jak udržet konverzaci.',                                       // 26 COM  agree
    'Snadno \'čtu mezi řádky\', když se mnou někdo mluví.',                                     // 27 COM  disagree
    'Obvykle se soustředím více na celkový obraz než na drobné detaily.',                      // 28 DET  disagree
    'Nejsem příliš dobrý/dobrá v zapamatování telefonních čísel.',                            // 29 DET  disagree
    'Obvykle si nevšimuji drobných změn v situaci nebo ve vzhledu osoby.',                     // 30 DET  disagree
    'Vím, kdy se posluchač začíná nudit.',                                                    // 31 COM  disagree
    'Snadno dělám více věcí najednou.',                                                       // 32 ATT  disagree
    'Když mluvím po telefonu, nevím vždy, kdy je moje řada mluvit.',                          // 33 COM  agree
    'Rád/a dělám věci spontánně.',                                                            // 34 ATT  disagree
    'Jsem obvykle poslední, kdo pochopí pointu vtipu.',                                       // 35 COM  agree
    'Snadno zjistím, co si někdo myslí nebo cítí, jen pohledem do jeho tváře.',               // 36 SOC  disagree
    'Pokud dojde k přerušení, mohu se velmi rychle vrátit k tomu, co jsem dělal/a.',          // 37 ATT  disagree
    'Jsem dobrý/dobrá v každodenní konverzaci.',                                              // 38 COM  disagree
    'Jiní lidé mi říkají, že stále mluvím o tomtéž.',                                         // 39 COM  agree
    'Když jsem byl/a malý/á, rád/a jsem si hrál/a s ostatními dětmi na předstírání.',         // 40 IMG  disagree
    'Rád/a sbírám informace o kategoriích věcí (např. typy aut, ptáků, vlaků, rostlin).',      // 41 IMG  agree
    'Je pro mě obtížné představit si, jaké by bylo být někým jiným.',                         // 42 IMG  agree
    'Rád/a pečlivě plánovávám aktivity, které se chystám dělat.',                             // 43 ATT  agree
    'Rád/a se účastním společenských příležitostí.',                                          // 44 SOC  disagree
    'Je pro mě obtížné zjistit záměry druhých.',                                              // 45 SOC  agree
    'Nové situace mě zneklidňují.',                                                           // 46 ATT  agree
    'Rád/a potkávám nové lidi.',                                                              // 47 SOC  disagree
    'Jsem dobrý/dobrá diplomat/ka.',                                                          // 48 SOC  disagree
    'Nejsem příliš dobrý/dobrá v zapamatování si dat narozenin.',                             // 49 DET  disagree
    'Hraní her s dětmi zahrnujících předstírání mi velmi snadno jde.',                        // 50 IMG  disagree
  ],
  en: [
    'I prefer to do things with others rather than on my own.',                                // 1  SOC  disagree
    'I prefer to do things the same way over and over again.',                                 // 2  ATT  agree
    'If I try to imagine something, I find it very easy to create a picture in my mind.',      // 3  IMG  disagree
    'I frequently get so strongly absorbed in one thing that I lose sight of other things.',   // 4  ATT  agree
    'I often notice small sounds when others do not.',                                         // 5  DET  agree
    'I usually notice car number plates or similar strings of information.',                   // 6  DET  agree
    'Other people frequently tell me that what I\'ve said is impolite, even though I think it is polite.', // 7  COM  agree
    'When I\'m reading a story, I can easily imagine what the characters might look like.',    // 8  IMG  disagree
    'I am fascinated by dates.',                                                               // 9  DET  agree
    'In a social group, I can easily keep track of several different people\'s conversations.', // 10 ATT  disagree
    'I find social situations easy.',                                                          // 11 SOC  disagree
    'I tend to notice details that others do not.',                                            // 12 DET  agree
    'I would rather go to a library than a party.',                                            // 13 SOC  agree
    'I find making up stories easy.',                                                          // 14 IMG  disagree
    'I find myself drawn more strongly to people than to things.',                             // 15 SOC  disagree
    'I tend to have very strong interests which I get upset about if I can\'t pursue.',        // 16 ATT  agree
    'I enjoy social chit-chat.',                                                               // 17 COM  disagree
    'When I talk, it isn\'t always easy for others to get a word in edgeways.',                // 18 COM  agree
    'I am fascinated by numbers.',                                                             // 19 DET  agree
    'When I\'m reading a story, I find it difficult to work out the characters\' intentions.', // 20 IMG  agree
    'I don\'t particularly enjoy reading fiction.',                                            // 21 IMG  agree
    'I find it hard to make new friends.',                                                     // 22 SOC  agree
    'I notice patterns in things all the time.',                                               // 23 DET  agree
    'I would rather go to the theatre than a museum.',                                         // 24 IMG  disagree
    'It does not upset me if my daily routine is disturbed.',                                  // 25 ATT  disagree
    'I frequently find that I don\'t know how to keep a conversation going.',                  // 26 COM  agree
    'I find it easy to "read between the lines" when someone is talking to me.',               // 27 COM  disagree
    'I usually concentrate more on the whole picture, rather than the small details.',         // 28 DET  disagree
    'I am not very good at remembering phone numbers.',                                        // 29 DET  disagree
    'I don\'t usually notice small changes in a situation, or a person\'s appearance.',        // 30 DET  disagree
    'I know how to tell if someone listening to me is getting bored.',                         // 31 COM  disagree
    'I find it easy to do more than one thing at once.',                                       // 32 ATT  disagree
    'When I talk on the phone, I\'m not sure when it\'s my turn to speak.',                    // 33 COM  agree
    'I enjoy doing things spontaneously.',                                                     // 34 ATT  disagree
    'I am often the last to understand the point of a joke.',                                  // 35 COM  agree
    'I find it easy to work out what someone is thinking or feeling just by looking at their face.', // 36 SOC  disagree
    'If there is an interruption, I can switch back to what I was doing very quickly.',        // 37 ATT  disagree
    'I am good at social chit-chat.',                                                          // 38 COM  disagree
    'People often tell me that I keep going on and on about the same thing.',                  // 39 COM  agree
    'When I was young, I used to enjoy playing games involving pretending with other children.', // 40 IMG  disagree
    'I like to collect information about categories of things (e.g. types of car, types of bird, types of train, types of plant, etc.).', // 41 IMG  agree
    'I find it difficult to imagine what it would be like to be someone else.',                // 42 IMG  agree
    'I like to plan any activities I participate in carefully.',                               // 43 ATT  agree
    'I enjoy social occasions.',                                                               // 44 SOC  disagree
    'I find it difficult to work out people\'s intentions.',                                   // 45 SOC  agree
    'New situations make me anxious.',                                                         // 46 ATT  agree
    'I enjoy meeting new people.',                                                             // 47 SOC  disagree
    'I am a good diplomat.',                                                                   // 48 SOC  disagree
    'I am not very good at remembering people\'s date of birth.',                              // 49 DET  disagree
    'I find it very easy to play games with children that involve pretending.',                // 50 IMG  disagree
  ],
};

export const AQ_SCALE = {
  cs: ['Rozhodně souhlasím', 'Spíše souhlasím', 'Spíše nesouhlasím', 'Rozhodně nesouhlasím'],
  en: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
};

/**
 * Items (0-indexed) scored as 1 if answer is Agree (raw ≤ 1):
 * 1-indexed: 2,4,5,6,7,9,12,13,16,18,19,20,21,22,23,26,33,35,39,41,42,43,45,46
 */
export const AQ_AGREE_ITEMS = [1, 3, 4, 5, 6, 8, 11, 12, 15, 17, 18, 19, 20, 21, 22, 25, 32, 34, 38, 40, 41, 42, 44, 45];

/**
 * Items (0-indexed) scored as 1 if answer is Disagree (raw ≥ 2):
 * 1-indexed: 1,3,8,10,11,14,15,17,24,25,27,28,29,30,31,32,34,36,37,38,40,44,47,48,49,50
 */
export const AQ_DISAGREE_ITEMS = [0, 2, 7, 9, 10, 13, 14, 16, 23, 24, 26, 27, 28, 29, 30, 31, 33, 35, 36, 37, 39, 43, 46, 47, 48, 49];

export const AQ_SUBSCALES = {
  SOC: { items: [0, 10, 12, 14, 21, 35, 43, 44, 46, 47], cs: 'Sociální dovednosti', en: 'Social Skill', color: '#818CF8' },
  ATT: { items: [1, 3, 9, 15, 24, 31, 33, 36, 42, 45], cs: 'Přepínání pozornosti', en: 'Attention Switching', color: '#F87171' },
  DET: { items: [4, 5, 8, 11, 18, 22, 27, 28, 29, 48], cs: 'Pozornost k detailům', en: 'Attention to Detail', color: '#FBBF24' },
  COM: { items: [6, 16, 17, 25, 26, 30, 32, 34, 37, 38], cs: 'Komunikace', en: 'Communication', color: '#34D399' },
  IMG: { items: [2, 7, 13, 19, 20, 23, 39, 40, 41, 49], cs: 'Imaginace', en: 'Imagination', color: '#60A5FA' },
};

/** Convert a raw answer (0–3) for a given item index to binary (0 or 1) */
export function aqBinary(itemIdx, rawValue) {
  if (AQ_AGREE_ITEMS.includes(itemIdx)) return rawValue <= 1 ? 1 : 0;
  return rawValue >= 2 ? 1 : 0;
}

/** Score AQ. Returns { total, subscales, binaryScores } */
export function scoreAQ(answers) {
  const binaryScores = {};
  for (let i = 0; i < 50; i++) {
    binaryScores[i] = aqBinary(i, answers?.[i] ?? 2); // default neutral (slightly disagree)
  }
  const total = Object.values(binaryScores).reduce((a, b) => a + b, 0);
  const subscales = {};
  for (const [key, meta] of Object.entries(AQ_SUBSCALES)) {
    subscales[key] = meta.items.reduce((s, idx) => s + (binaryScores[idx] || 0), 0);
  }
  return { total, subscales, binaryScores };
}

export const AQ_CUTOFF = 32;

export const AQ_SEVERITY = [
  { min: 0, max: 31, key: 'low', color: '#4ADE80',
    cs: 'Nízká úroveň autistických rysů', en: 'Low autistic traits' },
  { min: 32, max: 50, key: 'elevated', color: '#F87171',
    cs: 'Zvýšená úroveň autistických rysů', en: 'Elevated autistic traits' },
];
