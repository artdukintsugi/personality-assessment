/**
 * MDQ — Mood Disorder Questionnaire (Hirschfeld et al., 2000)
 * Part 1: 13 Yes/No items (manic/hypomanic symptoms)
 * Part 2: 1 Yes/No (co-occurrence)
 * Part 3: 1 item — severity (0-3)
 * Positive screen: ≥7 Yes in Part 1 AND Yes in Part 2 AND ≥2 in Part 3
 */

export const MDQ_PART1 = {
  cs: [
    'Cítil/a jste se tak dobře nebo tak „nahoře", že si ostatní lidé mysleli, že nejste svůj/svá, nebo jste byl/a tak „nahoře", že jste se dostal/a do problémů?',
    'Byl/a jste tak podrážděný/á, že jste na lidi křičel/a nebo začínal/a hádky či konflikty?',
    'Cítil/a jste se mnohem sebejistěji než obvykle?',
    'Spal/a jste mnohem méně než obvykle a zjistil/a jste, že vám to vlastně nechybí?',
    'Byl/a jste mnohem sdílnější nebo mluvil/a jste mnohem rychleji než obvykle?',
    'Myšlenky vám rychle běžely hlavou a nedokázal/a jste je zpomalit?',
    'Byl/a jste tak snadno rozptylován/a věcmi kolem sebe, že jste se obtížně soustředil/a nebo udržel/a myšlenkovou niť?',
    'Měl/a jste mnohem více energie než obvykle?',
    'Byl/a jste mnohem aktivnější nebo dělal/a jste mnohem více věcí než obvykle?',
    'Byl/a jste mnohem společenštější nebo otevřenější než obvykle — například jste telefonoval/a přátelům uprostřed noci?',
    'Měl/a jste větší zájem o sex než obvykle?',
    'Dělal/a jste věci, které jsou pro vás neobvyklé, nebo o kterých by si ostatní lidé mysleli, že jsou přehnané, hloupé nebo riskantní?',
    'Utrácení peněz vás dostalo do problémů nebo do problémů přivedlo vaši rodinu?',
  ],
  en: [
    'You felt so good or so hyper that other people thought you were not your normal self, or you were so hyper that you got into trouble?',
    'You were so irritable that you shouted at people or started fights or arguments?',
    'You felt much more self-confident than usual?',
    'You got much less sleep than usual and found you didn\'t really miss it?',
    'You were much more talkative or spoke much faster than usual?',
    'Thoughts raced through your head and you couldn\'t slow your mind down?',
    'You were so easily distracted by things around you that you had trouble concentrating or staying on track?',
    'You had much more energy than usual?',
    'You were much more active or did many more things than usual?',
    'You were much more social or outgoing than usual — for example, you telephoned friends in the middle of the night?',
    'You were much more interested in sex than usual?',
    'You did things that were unusual for you or that other people might have thought were excessive, foolish, or risky?',
    'Spending money got you or your family into trouble?',
  ],
};

export const MDQ_PART2 = {
  cs: 'Pokud jste odpověděl/a ANO na více než jednu z výše uvedených otázek: Vyskytlo se některé z těchto věcí ve stejném časovém období?',
  en: 'If you checked YES to more than one of the above, have several of these ever happened during the same period of time?',
};

export const MDQ_PART3 = {
  cs: 'Jak velký problém vám kterýkoli z těchto příznaků způsobil — například neschopnost pracovat, rodinné, finanční či právní problémy, hádky nebo konflikty?',
  en: 'How much of a problem did any of these cause you — like being unable to work; having family, money or legal troubles; getting into arguments or fights?',
};

export const MDQ_PART3_SCALE = {
  cs: ['Žádný problém', 'Malý problém', 'Středně velký problém', 'Závažný problém'],
  en: ['No problem', 'Minor problem', 'Moderate problem', 'Serious problem'],
};

export const MDQ_YESNO = {
  cs: ['Ano', 'Ne'],
  en: ['Yes', 'No'],
};

/**
 * Scoring: part1Score = count of "yes" (value=0 means yes in our 0/1 scale where 0=Yes,1=No)
 * Positive screen: part1Score ≥ 7 AND part2 = Yes(0) AND part3 ≥ 2
 */
export function scoreMDQ(answers) {
  // answers[0..12] = Part 1 (0=Yes, 1=No)
  // answers[13] = Part 2 (0=Yes, 1=No)
  // answers[14] = Part 3 (0-3)
  const part1Yes = (answers || []).slice(0, 13).filter(v => v === 0).length;
  const part2Yes = answers?.[13] === 0;
  const part3Severity = answers?.[14] ?? 0;
  const positive = part1Yes >= 7 && part2Yes && part3Severity >= 2;
  return { part1Yes, part2Yes, part3Severity, positive };
}

export const MDQ_TOTAL_ITEMS = 15;
