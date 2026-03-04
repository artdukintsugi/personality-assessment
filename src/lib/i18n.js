/**
 * i18n — Translation module for Personality Assessment app
 * Supports: cs (Czech), en (English)
 */

// ═══ Domain name translations ═══
const DOMAIN_NAMES = {
  cs: {
    'Negativní afektivita': 'Negativní afektivita',
    'Odtažitost': 'Odtažitost',
    'Antagonismus': 'Antagonismus',
    'Disinhibice': 'Disinhibice',
    'Psychoticismus': 'Psychoticismus',
  },
  en: {
    'Negativní afektivita': 'Negative Affectivity',
    'Odtažitost': 'Detachment',
    'Antagonismus': 'Antagonism',
    'Disinhibice': 'Disinhibition',
    'Psychoticismus': 'Psychoticism',
  },
};

// ═══ Facet name translations ═══
const FACET_NAMES = {
  cs: {},
  en: {
    'Anhedonie': 'Anhedonia',
    'Úzkostnost': 'Anxiousness',
    'Vyhášení pozornosti': 'Attention Seeking',
    'Bezcitnost': 'Callousness',
    'Klamavost': 'Deceitfulness',
    'Depresivita': 'Depressivity',
    'Roztříštěnost': 'Distractibility',
    'Excentricita': 'Eccentricity',
    'Emoční labilita': 'Emotional Lability',
    'Grandiozita': 'Grandiosity',
    'Hostilita': 'Hostility',
    'Impulzivita': 'Impulsivity',
    'Vyhýbání se intimitě': 'Intimacy Avoidance',
    'Nezodpovědnost': 'Irresponsibility',
    'Manipulativnost': 'Manipulativeness',
    'Percepční dysregulace': 'Perceptual Dysregulation',
    'Perseverace': 'Perseveration',
    'Restriktivní afektivita': 'Restricted Affectivity',
    'Riskování': 'Risk Taking',
    'Separační nejistota': 'Separation Insecurity',
    'Submisivita': 'Submissiveness',
    'Podezřívavost': 'Suspiciousness',
    'Neobvyklé přesvědčení': 'Unusual Beliefs',
    'Stažení': 'Withdrawal',
    'Rigidita': 'Rigid Perfectionism',
  },
};

// ═══ Diagnostic profile name translations ═══
const DIAG_NAMES = {
  cs: {},
  en: {
    bpd: 'Borderline Personality Disorder (BPD)',
    npd: 'Narcissistic Personality Disorder (NPD)',
    aspd: 'Antisocial Personality Disorder (ASPD)',
    avpd: 'Avoidant Personality Disorder (AvPD)',
    ocpd: 'Obsessive-Compulsive PD (OCPD)',
    stpd: 'Schizotypal Personality Disorder (StPD)',
    szpd: 'Schizoid Personality Traits',
    ppd: 'Paranoid Personality Traits',
    hpd: 'Histrionic Personality Traits',
    dpd: 'Dependent Personality Traits (DPD)',
    depressive: 'Depressive Personality Traits',
    adhd: 'ADHD — indicators (non-PD)',
    did: 'Dissociation / DID — indicators (non-PD)',
  },
};

const translations = {
  cs: {
    appTitle: 'Osobnostní diagnostika',
    appSubtitle: 'PID-5 a LPFS-SR — standardizované dotazníky osobnostních rysů',
    loginTitle: 'Přihlášení',
    signupTitle: 'Registrace',
    continueWithGoogle: 'Pokračovat přes Google',
    or: 'nebo',
    emailPlaceholder: 'E-mail',
    passwordPlaceholder: 'Heslo',
    loginAction: 'Přihlásit se',
    signupAction: 'Zaregistrovat se',
    noAccount: 'Nemáte účet? Zaregistrujte se',
    hasAccount: 'Máte účet? Přihlaste se',
    synced: '☁ Synchronizováno',
    signOut: 'Odhlásit',
    localOnly: '💾 Výsledky se ukládají pouze lokálně',
    login: 'Přihlásit',
    signup: 'Registrace',
    localSave: '💾 Data uložena lokálně',
    pid5Desc: '220 otázek — osobnostní rysy a maladaptivní vzorce',
    lpfsDesc: '80 otázek — úroveň fungování osobnosti',
    pid5Results: '📊 Výsledky PID-5',
    lpfsResults: '📊 Výsledky LPFS',
    savedResults: '📋 Uložené výsledky',
    local: 'lokálně',
    cloud: 'cloud',
    average: 'Průměr',
    view: 'Zobrazit',
    export: 'Export',
    deleteResult: 'Opravdu smazat tento výsledek?',
    deleteFromCloud: 'Opravdu smazat z cloudu?',
    pid5ResultsTitle: 'Výsledky PID-5',
    lpfsResultsTitle: 'Výsledky LPFS-SR',
    domains: 'Domény',
    diagnosticProfiles: 'Diagnostické profily',
    close: 'Zavřít',
    debug: '🔧 Debug nástroje',
    reset: '🗑 Reset',
    back: '← Zpět',
    pid5ResultsHeading: 'Výsledky PID-5',
    filledItems: 'Vyplněno',
    items: 'položek',
    domainsRadar: 'Radarový graf domén',
    domainsOverview: 'Přehled domén',
    facetsDetail: 'Detail facet',
    diagProfilesTitle: 'Diagnostické profily',
    diagDisclaimer: 'Orientační shoda s diagnostickými kategoriemi. NENÍ klinická diagnóza.',
    elevatedProfiles: '⚠ Zvýšené profily',
    subclinical: 'Subklinické',
    fullReport: 'Plný report',
    fullReportDesc: 'HTML s grafy',
    instaStory: 'Instagram Story',
    instaStoryDesc: 'Obrázek 1080×1920',
    quickSummary: 'Stručný souhrn',
    quickSummaryDesc: 'Textový přehled',
    json: 'Raw JSON',
    jsonDesc: 'Strojově čitelné',
    resultSaved: 'Výsledek uložen!',
    saveResult: '💾 Uložit výsledek',
    menu: '☰ Menu',
    lpfsResultsHeading: 'Výsledky LPFS-SR',
    averageScore: 'Průměrné skóre',
    subscales: 'Subškály',
    selfFunctioning: '🧠 Sebe-fungování',
    interpersonal: '💗 Interpersonální',
    exportResults: 'Export výsledků',
    report: 'Report',
    reportDesc: 'HTML report',
    keyE: 'Přepnout jazyk (E)',
    hideHint: 'Skrýt nápovědu',
    showHint: 'Nápověda',
    previous: '← Předchozí',
    next: 'Další →',
    showResults: '🎯 Zobrazit výsledky',
    liveScores: 'Živé skóre domén',
    questionFacets: 'Facety této otázky:',
    liveScoresLpfs: 'Živé skóre LPFS',
    total: 'Celkem',
    sourcesFormulas: 'Zdroje & vzorce',
    scoring: 'Skórování',
    scale: 'Škála:',
    facet: 'Faceta:',
    domain: 'Doména:',
    diagnostics: 'Diagnostika:',
    totalLabel: 'Celkem:',
    subscalesLabel: 'Subškály:',
    questionFacetsInfo: 'Facety pro otázku',
    sevLow: 'Nízké',
    sevMild: 'Mírné',
    sevElevated: 'Zvýšené',
    sevHigh: 'Vysoké',
  },
  en: {
    appTitle: 'Personality Assessment',
    appSubtitle: 'PID-5 & LPFS-SR — standardized personality trait inventories',
    loginTitle: 'Log In',
    signupTitle: 'Sign Up',
    continueWithGoogle: 'Continue with Google',
    or: 'or',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    loginAction: 'Log In',
    signupAction: 'Sign Up',
    noAccount: "Don't have an account? Sign up",
    hasAccount: 'Already have an account? Log in',
    synced: '☁ Synced',
    signOut: 'Sign Out',
    localOnly: '💾 Results saved locally only',
    login: 'Log In',
    signup: 'Sign Up',
    localSave: '💾 Data saved locally',
    pid5Desc: '220 items — personality traits & maladaptive patterns',
    lpfsDesc: '80 items — level of personality functioning',
    pid5Results: '📊 PID-5 Results',
    lpfsResults: '📊 LPFS Results',
    savedResults: '📋 Saved Results',
    local: 'local',
    cloud: 'cloud',
    average: 'Average',
    view: 'View',
    export: 'Export',
    deleteResult: 'Delete this result?',
    deleteFromCloud: 'Delete from cloud?',
    pid5ResultsTitle: 'PID-5 Results',
    lpfsResultsTitle: 'LPFS-SR Results',
    domains: 'Domains',
    diagnosticProfiles: 'Diagnostic Profiles',
    close: 'Close',
    debug: '🔧 Debug tools',
    reset: '🗑 Reset',
    back: '← Back',
    pid5ResultsHeading: 'PID-5 Results',
    filledItems: 'Completed',
    items: 'items',
    domainsRadar: 'Domain Radar Chart',
    domainsOverview: 'Domain Overview',
    facetsDetail: 'Facet Details',
    diagProfilesTitle: 'Diagnostic Profiles',
    diagDisclaimer: 'Approximate match with diagnostic categories. NOT a clinical diagnosis.',
    elevatedProfiles: '⚠ Elevated Profiles',
    subclinical: 'Subclinical',
    fullReport: 'Full Report',
    fullReportDesc: 'HTML with charts',
    instaStory: 'Instagram Story',
    instaStoryDesc: '1080×1920 image',
    quickSummary: 'Quick Summary',
    quickSummaryDesc: 'Text overview',
    json: 'Raw JSON',
    jsonDesc: 'Machine-readable',
    resultSaved: 'Result saved!',
    saveResult: '💾 Save Result',
    menu: '☰ Menu',
    lpfsResultsHeading: 'LPFS-SR Results',
    averageScore: 'Average Score',
    subscales: 'Subscales',
    selfFunctioning: '🧠 Self-Functioning',
    interpersonal: '💗 Interpersonal',
    exportResults: 'Export Results',
    report: 'Report',
    reportDesc: 'HTML report',
    keyE: 'Toggle language (E)',
    hideHint: 'Hide hint',
    showHint: 'Hint',
    previous: '← Previous',
    next: 'Next →',
    showResults: '🎯 Show Results',
    liveScores: 'Live Domain Scores',
    questionFacets: 'Facets for this question:',
    liveScoresLpfs: 'Live LPFS Scores',
    total: 'Total',
    sourcesFormulas: 'Sources & Formulas',
    scoring: 'Scoring',
    scale: 'Scale:',
    facet: 'Facet:',
    domain: 'Domain:',
    diagnostics: 'Diagnostics:',
    totalLabel: 'Total:',
    subscalesLabel: 'Subscales:',
    questionFacetsInfo: 'Facets for question',
    sevLow: 'Low',
    sevMild: 'Mild',
    sevElevated: 'Elevated',
    sevHigh: 'High',
  },
};

export function createT(lang) {
  const dict = translations[lang] || translations.cs;
  const fallback = translations.cs;
  return (key) => dict[key] !== undefined ? dict[key] : (fallback[key] !== undefined ? fallback[key] : key);
}

export function sevLabel(v, lang) {
  const t = createT(lang);
  if (v < 0.5) return t('sevLow');
  if (v < 1.0) return t('sevMild');
  if (v < 2.0) return t('sevElevated');
  return t('sevHigh');
}

const LPFS_SUB_NAMES = {
  cs: { identity: 'Identita', selfDirection: 'Sebe-řízení', empathy: 'Empatie', intimacy: 'Intimita' },
  en: { identity: 'Identity', selfDirection: 'Self-Direction', empathy: 'Empathy', intimacy: 'Intimacy' },
};

export function lpfsSubName(sub, lang) {
  const names = LPFS_SUB_NAMES[lang] || LPFS_SUB_NAMES.cs;
  return names[sub] !== undefined ? names[sub] : sub;
}

/** Translate a domain name (e.g. 'Negativní afektivita' → 'Negative Affectivity') */
export function domainName(name, lang) {
  if (lang === 'cs') return name;
  return DOMAIN_NAMES.en[name] || name;
}

/** Translate a facet name (e.g. 'Úzkostnost' → 'Anxiousness') */
export function facetName(name, lang) {
  if (lang === 'cs') return name;
  return FACET_NAMES.en[name] || name;
}

/** Translate a diagnostic profile name by id */
export function diagName(id, csName, lang) {
  if (lang === 'cs') return csName;
  return DIAG_NAMES.en[id] || csName;
}

/** Short domain name for radar chart */
export function domainShort(name, lang) {
  if (lang === 'en') {
    const en = DOMAIN_NAMES.en[name] || name;
    const shorts = { 'Negative Affectivity': 'Neg. Affect.', 'Psychoticism': 'Psychotic.' };
    return shorts[en] || en;
  }
  const shorts = { 'Negativní afektivita': 'Neg. afekt.', 'Psychoticismus': 'Psychotic.' };
  return shorts[name] || name;
}
