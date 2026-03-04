/**
 * PCL-5 — PTSD Checklist for DSM-5
 * Weathers, Litz, Keane, Palmieri, Marx, & Schnurr (2013)
 * Scale: 0-4 (Not at all → Extremely)
 * Total score: 0-80, cut-off ≥ 31-33 for probable PTSD
 * 4 symptom clusters (DSM-5): B, C, D, E
 */

export const PCL5_QUESTIONS = {
  cs: [
    "Opakované, znepokojující a nevyžádané vzpomínky na stresující zážitek",
    "Opakované, znepokojující sny o stresujícím zážitku",
    "Náhlý pocit nebo jednání, jako by se stresující zážitek opět opakoval (jako byste ho znovu prožíval/a)",
    "Pocit silného rozrušení, když vám něco připomnělo stresující zážitek",
    "Silné fyzické reakce na něco, co vám připomnělo stresující zážitek (např. bušení srdce, potíže s dýcháním, pocení)",
    "Vyhýbání se vzpomínkám, myšlenkám nebo pocitům spojeným se stresujícím zážitkem",
    "Vyhýbání se vnějším připomínkám stresujícího zážitku (např. lidem, místům, konverzacím, aktivitám, předmětům nebo situacím)",
    "Potíže vzpomenout si na důležité části stresujícího zážitku",
    "Silně negativní přesvědčení o sobě, druhých lidech nebo o světě (např. myšlenky jako: jsem špatný/á, je se mnou něco vážně v nepořádku, nikomu se nedá věřit, celý svět je nebezpečný)",
    "Obviňování sebe nebo někoho jiného za stresující zážitek nebo za to, co následovalo",
    "Silné negativní pocity jako strach, hrůza, hněv, vina nebo stud",
    "Ztráta zájmu o činnosti, které vás dříve bavily",
    "Pocit odcizení od ostatních lidí",
    "Potíže s prožíváním pozitivních pocitů (např. neschopnost cítit štěstí nebo lásku k blízkým osobám)",
    "Podrážděné chování, výbuchy hněvu nebo agresivní jednání",
    "Nadměrné riskování nebo konání věcí, které by vám mohly ublížit",
    "Být příliš ve střehu, ostražitý/á nebo na pozoru",
    "Být ustrašený/á nebo se snadno leknout",
    "Potíže se soustředěním",
    "Potíže s usínáním nebo udržením spánku",
  ],
  en: [
    "Repeated, disturbing, and unwanted memories of the stressful experience",
    "Repeated, disturbing dreams of the stressful experience",
    "Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)",
    "Feeling very upset when something reminded you of the stressful experience",
    "Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)",
    "Avoiding memories, thoughts, or feelings related to the stressful experience",
    "Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)",
    "Trouble remembering important parts of the stressful experience",
    "Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)",
    "Blaming yourself or someone else for the stressful experience or what happened after it",
    "Having strong negative feelings such as fear, horror, anger, guilt, or shame",
    "Loss of interest in activities that you used to enjoy",
    "Feeling distant or cut off from other people",
    "Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)",
    "Irritable behavior, angry outbursts, or acting aggressively",
    "Taking too many risks or doing things that could cause you harm",
    "Being 'superalert' or watchful or on guard",
    "Feeling jumpy or easily startled",
    "Having difficulty concentrating",
    "Trouble falling or staying asleep",
  ],
};

export const PCL5_SCALE = {
  cs: ["Vůbec ne", "Trochu", "Mírně", "Docela dost", "Extrémně"],
  en: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"],
};

/** DSM-5 symptom clusters (0-based item indices) */
export const PCL5_CLUSTERS = {
  clusterB: { name: 'intrusion', items: [0, 1, 2, 3, 4] },       // Intrusion (items 1-5)
  clusterC: { name: 'avoidance', items: [5, 6] },                  // Avoidance (items 6-7)
  clusterD: { name: 'cognitionMood', items: [7, 8, 9, 10, 11, 12, 13] }, // Neg. cognition & mood (items 8-14)
  clusterE: { name: 'arousal', items: [14, 15, 16, 17, 18, 19] }, // Arousal & reactivity (items 15-20)
};

/** Cut-off for probable PTSD diagnosis */
export const PCL5_CUTOFF = 31;

/** Alternative clinical cut-off (some studies use 33) */
export const PCL5_CUTOFF_ALT = 33;

export const PCL5_SEVERITY = [
  { min: 0, max: 10, key: 'minimal', color: '#4ADE80' },
  { min: 11, max: 20, key: 'mild', color: '#FBBF24' },
  { min: 21, max: 30, key: 'moderate', color: '#FB923C' },
  { min: 31, max: 50, key: 'significant', color: '#F87171' },
  { min: 51, max: 80, key: 'severe', color: '#EF4444' },
];

/** DSM-5 provisional diagnosis: need at least 1 B, 1 C, 2 D, 2 E items rated ≥2 (moderately) */
export const PCL5_DSM5_CRITERIA = {
  clusterB: 1,
  clusterC: 1,
  clusterD: 2,
  clusterE: 2,
};
