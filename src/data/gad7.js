/**
 * GAD-7 — Generalized Anxiety Disorder 7-item scale
 * Screening for anxiety severity (Spitzer, Kroenke, Williams & Löwe, 2006)
 * Scale: 0-3 (Not at all → Nearly every day)
 * Total score: 0-21
 */

export const GAD7_QUESTIONS = {
  cs: [
    "Pocit nervozity, úzkosti nebo napětí",
    "Neschopnost zastavit nebo ovládat starosti",
    "Přílišné starosti o různé věci",
    "Obtíže s uvolněním se",
    "Takový neklid, že je těžké zůstat v klidu",
    "Snadná podrážděnost nebo popudlivost",
    "Pocit strachu, jako by se mělo stát něco hrozného",
  ],
  en: [
    "Feeling nervous, anxious or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen",
  ],
};

export const GAD7_SCALE = {
  cs: ["Vůbec ne", "Několik dní", "Více než polovinu dní", "Téměř každý den"],
  en: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
};

export const GAD7_SEVERITY = [
  { min: 0, max: 4, key: 'minimal', color: '#4ADE80' },
  { min: 5, max: 9, key: 'mild', color: '#FBBF24' },
  { min: 10, max: 14, key: 'moderate', color: '#FB923C' },
  { min: 15, max: 21, key: 'severe', color: '#F87171' },
];

export const GAD7_FUNCTIONAL = {
  cs: ["Vůbec ne", "Poněkud obtížné", "Velmi obtížné", "Mimořádně obtížné"],
  en: ["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"],
};
