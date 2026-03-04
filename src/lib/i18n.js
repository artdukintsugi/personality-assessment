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
    summaryTitle: '📝 Shrnutí výsledků',
    summaryIntro: 'Na základě vašich odpovědí v dotazníku PID-5 (220 položek) jsme identifikovali následující vzorce osobnostních rysů:',
    summaryDomains: 'Nejvýraznějšími oblastmi jsou',
    summaryElevated: 'Zvýšené profily naznačují možnou přítomnost rysů spojených s:',
    summaryNote: '⚠ Tyto výsledky jsou orientační a NEJSOU klinickou diagnózou. Pro přesné posouzení je nutné konzultovat s odborníkem na duševní zdraví.',
    summaryNoElevated: 'Žádný z diagnostických profilů nedosáhl zvýšené úrovně, což naznačuje, že vaše osobnostní rysy se pohybují v běžném rozmezí.',
    summaryLpfsIntro: 'Na základě vašich odpovědí v dotazníku LPFS-SR (80 položek) bylo vaše celkové skóre úrovně fungování osobnosti:',
    summaryLpfsHigh: 'Vaše skóre přesahuje klinický práh (≥ 1.5), což naznačuje možné obtíže v oblasti fungování osobnosti. Nejvíce se to projevuje v oblastech:',
    summaryLpfsOk: 'Vaše skóre je pod klinickým prahem, což naznačuje přiměřenou úroveň fungování osobnosti.',
    history: 'Historie',
    navPid5: 'PID-5 Test',
    navLpfs: 'LPFS-SR Test',
    navResults: 'Výsledky',
    viewFullResults: 'Zobrazit plné výsledky',
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
    summaryTitle: '📝 Results Summary',
    summaryIntro: 'Based on your answers to the PID-5 questionnaire (220 items), we identified the following personality trait patterns:',
    summaryDomains: 'The most prominent domains are',
    summaryElevated: 'Elevated profiles suggest possible presence of traits associated with:',
    summaryNote: '⚠ These results are indicative and are NOT a clinical diagnosis. For accurate assessment, consult a mental health professional.',
    summaryNoElevated: 'None of the diagnostic profiles reached elevated levels, suggesting your personality traits fall within the normal range.',
    summaryLpfsIntro: 'Based on your answers to the LPFS-SR questionnaire (80 items), your overall level of personality functioning score was:',
    summaryLpfsHigh: 'Your score exceeds the clinical threshold (≥ 1.5), suggesting possible difficulties in personality functioning. This is most evident in the areas of:',
    summaryLpfsOk: 'Your score is below the clinical threshold, suggesting adequate personality functioning.',
    history: 'History',
    navPid5: 'PID-5 Test',
    navLpfs: 'LPFS-SR Test',
    navResults: 'Results',
    viewFullResults: 'View Full Results',
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

/** Translate a diagnostic profile description (bilingual object or plain string) */
export function diagDesc(desc, lang) {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  return desc[lang] || desc.cs || '';
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
