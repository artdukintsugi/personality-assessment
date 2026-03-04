/**
 * EAT-26 — Eating Attitudes Test (Garner et al., 1982)
 * 26 items, scale 0-3 (scored: Always=3, Usually=2, Often=1, rest=0; except item 25 reverse)
 * Total range 0-78; ≥20 suggests clinical concern
 */

export const EAT26_QUESTIONS = {
  cs: [
    'Mám strach z nadváhy.',
    'Vyhýbám se jídlu, když mám hlad.',
    'Přistihnu se, že jsem zaujatý/á myšlenkami na jídlo.',
    'Měl/a jsem záchvaty přejídání, při kterých jsem cítil/a, že nedokážu přestat jíst.',
    'Krájím si jídlo na malé kousky.',
    'Uvědomuji si kalorický obsah jídla, které jím.',
    'Vyhýbám se zejména jídlům s vysokým obsahem sacharidů (chléb, rýže, brambory).',
    'Mám pocit, že ostatní by preferovali, kdybych jedl/a více.',
    'Po jídle zvracím.',
    'Po jídle mám silné pocity viny.',
    'Zabývám se touhou být štíhlejší.',
    'Při cvičení myslím na spalování kalorií.',
    'Ostatní si myslí, že jsem příliš hubený/á.',
    'Zabývám se myšlenkami na tuk na svém těle.',
    'Jídlo mi trvá déle než ostatním.',
    'Vyhýbám se jídlům obsahujícím cukr.',
    'Jím dietní potraviny.',
    'Mám pocit, že jídlo ovládá můj život.',
    'Prokazuji sebeovládání kolem jídla.',
    'Mám pocit, že mě ostatní tlačí, abych jedl/a.',
    'Věnuji jídlu příliš mnoho času a myšlenek.',
    'Cítím se nepříjemně po konzumaci sladkostí.',
    'Dodržuji diety.',
    'Mám rád/a pocit prázdného žaludku.',
    'Po jídle mám nutkání zvracet.',
    'Mám rád/a zkoušení nových, bohatých jídel.',
  ],
  en: [
    'Am terrified about being overweight.',
    'Avoid eating when I am hungry.',
    'Find myself preoccupied with food.',
    'Have gone on eating binges where I feel that I may not be able to stop.',
    'Cut my food into small pieces.',
    'Aware of the calorie content of foods that I eat.',
    'Particularly avoid food with a high carbohydrate content (bread, rice, potatoes).',
    'Feel that others would prefer if I ate more.',
    'Vomit after I have eaten.',
    'Feel extremely guilty after eating.',
    'Am preoccupied with a desire to be thinner.',
    'Think about burning up calories when I exercise.',
    'Other people think that I am too thin.',
    'Am preoccupied with the thought of having fat on my body.',
    'Take longer than others to eat my meals.',
    'Avoid foods with sugar in them.',
    'Eat diet foods.',
    'Feel that food controls my life.',
    'Display self-control around food.',
    'Feel that others pressure me to eat.',
    'Give too much time and thought to food.',
    'Feel uncomfortable after eating sweets.',
    'Engage in dieting behavior.',
    'Like my stomach to be empty.',
    'Have the impulse to vomit after meals.',
    'Enjoy trying new rich foods.',
  ],
};

/** Standard EAT-26 Likert labels (response options) */
export const EAT26_SCALE = {
  cs: ['Vždy', 'Obvykle', 'Často', 'Někdy', 'Zřídka', 'Nikdy'],
  en: ['Always', 'Usually', 'Often', 'Sometimes', 'Rarely', 'Never'],
};

/**
 * EAT-26 scoring: items scored 0-5 in Likert then collapsed:
 * Always=3, Usually=2, Often=1, Sometimes/Rarely/Never=0
 * Item 25 (0-indexed) is reverse scored:
 * Never=3, Rarely=2, Sometimes=1, rest=0
 */
export const EAT26_REVERSE_ITEM = 25; // 0-indexed (item 26)

export function scoreEAT26(answers) {
  let total = 0;
  for (let i = 0; i < 26; i++) {
    const v = answers[i];
    if (v === undefined || v === null) continue;
    if (i === EAT26_REVERSE_ITEM) {
      // Reverse: Never(5)=3, Rarely(4)=2, Sometimes(3)=1, rest=0
      if (v === 5) total += 3;
      else if (v === 4) total += 2;
      else if (v === 3) total += 1;
    } else {
      // Standard: Always(0)=3, Usually(1)=2, Often(2)=1, rest=0
      if (v === 0) total += 3;
      else if (v === 1) total += 2;
      else if (v === 2) total += 1;
    }
  }
  return total;
}

/** Subscale item indices (0-based) */
export const EAT26_SUBSCALES = {
  dieting: { items: [0, 5, 6, 10, 11, 13, 15, 16, 21, 22, 23, 24], cs: 'Držení diet', en: 'Dieting' },
  bulimia: { items: [2, 3, 8, 9, 17, 20], cs: 'Bulimie a zaujetí jídlem', en: 'Bulimia & Food Preoccupation' },
  oralControl: { items: [1, 4, 7, 12, 14, 19, 25], cs: 'Orální kontrola', en: 'Oral Control' },
};

export const EAT26_SEVERITY = [
  { min: 0, max: 9, key: 'low', color: '#4ADE80', cs: 'Nízké riziko', en: 'Low risk' },
  { min: 10, max: 19, key: 'moderate', color: '#FBBF24', cs: 'Mírně zvýšené riziko', en: 'Mildly elevated risk' },
  { min: 20, max: 78, key: 'high', color: '#F87171', cs: 'Významně zvýšené riziko — doporučeno klinické vyšetření', en: 'Significantly elevated risk — clinical evaluation recommended' },
];

export const EAT26_CUTOFF = 20;
