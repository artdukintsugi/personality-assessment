/**
 * PHQ-9 — Patient Health Questionnaire-9
 * Screening for depression severity (Kroenke, Spitzer & Williams, 2001)
 * Scale: 0-3 (Not at all → Nearly every day)
 * Total score: 0-27
 */

export const PHQ9_QUESTIONS = {
  cs: [
    "Malý zájem nebo potěšení z činností",
    "Pocit smutku, deprese nebo beznaděje",
    "Potíže s usínáním, probouzení se v noci nebo příliš mnoho spánku",
    "Pocit únavy nebo nedostatku energie",
    "Špatná chuť k jídlu nebo přejídání",
    "Špatné mínění o sobě — nebo pocit, že jste zklamal/a sebe nebo svou rodinu",
    "Potíže se soustředěním, např. při čtení novin nebo sledování televize",
    "Pohybujete se nebo mluvíte tak pomalu, že si toho ostatní mohli všimnout? Nebo naopak — jste tak neklidný/á nebo roztěkaný/á, že se pohybujete mnohem více než obvykle",
    "Myšlenky, že by vám bylo lépe, kdybyste nežil/a, nebo myšlenky na sebepoškození",
  ],
  en: [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself in some way",
  ],
};

export const PHQ9_SCALE = {
  cs: ["Vůbec ne", "Několik dní", "Více než polovinu dní", "Téměř každý den"],
  en: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
};

export const PHQ9_SEVERITY = [
  { min: 0, max: 4, key: 'minimal', color: '#4ADE80', cs: 'Minimální deprese', en: 'Minimal depression' },
  { min: 5, max: 9, key: 'mild', color: '#FBBF24', cs: 'Mírná deprese', en: 'Mild depression' },
  { min: 10, max: 14, key: 'moderate', color: '#FB923C', cs: 'Středně těžká deprese', en: 'Moderate depression' },
  { min: 15, max: 19, key: 'moderatelySevere', color: '#F87171', cs: 'Středně těžká až těžká deprese', en: 'Moderately severe depression' },
  { min: 20, max: 27, key: 'severe', color: '#EF4444', cs: 'Těžká deprese', en: 'Severe depression' },
];

export const PHQ9_FUNCTIONAL = {
  cs: ["Vůbec ne", "Poněkud obtížné", "Velmi obtížné", "Mimořádně obtížné"],
  en: ["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"],
};

/** Item 9 is critical — suicidal ideation flag */
export const PHQ9_CRITICAL_ITEM = 8; // 0-indexed
