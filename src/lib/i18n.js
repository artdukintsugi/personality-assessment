/**
 * i18n — Translation module for Personality Assessment app
 * Supports: cs (Czech), en (English)
 */

const translations = {
  cs: {
    // App title / menu
    appTitle: 'Osobnostní diagnostika',
    appSubtitle: 'PID-5 a LPFS-SR — standardizované dotazníky osobnostních rysů',

    // Auth
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

    // Test cards
    pid5Desc: '220 otázek — osobnostní rysy a maladaptivní vzorce',
    lpfsDesc: '80 otázek — úroveň fungování osobnosti',
    pid5Results: '📊 Výsledky PID-5',
    lpfsResults: '📊 Výsledky LPFS',

    // Saved results
    savedResults: '📋 Uložené výsledky',
    local: 'lokálně',
    cloud: 'cloud',
    average: 'Průměr',
    view: 'Zobrazit',
    export: 'Export',
    deleteResult: 'Opravdu smazat tento výsledek?',
    deleteFromCloud: 'Opravdu smazat z cloudu?',

    // Result viewer modal
    pid5ResultsTitle: 'Výsledky PID-5',
    lpfsResultsTitle: 'Výsledky LPFS-SR',
    domains: 'Domény',
    diagnosticProfiles: 'Diagnostické profily',
    close: 'Zavřít',

    // Debug
    debug: '🔧 Debug nástroje',
    reset: '🗑 Reset',

    // PID-5 Results page
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

    // LPFS Results page
    lpfsResultsHeading: 'Výsledky LPFS-SR',
    averageScore: 'Průměrné skóre',
    subscales: 'Subškály',
    selfFunctioning: '🧠 Sebe-fungování',
    interpersonal: '💗 Interpersonální',
    exportResults: 'Export výsledků',
    report: 'Report',
    reportDesc: 'HTML report',

    // Questionnaire
    keyE: 'Přepnout jazyk (E)',
    hideHint: 'Skrýt nápovědu',
    showHint: 'Nápověda',
    previous: '← Předchozí',
    next: 'Další →',
    showResults: '🎯 Zobrazit výsledky',

    // Live dashboard
    liveScores: 'Živé skóre domén',
    questionFacets: 'Facety této otázky:',
    liveScoresLpfs: 'Živé skóre LPFS',
    total: 'Celkem',

    // Scoring info
    sourcesFormulas: 'Zdroje & vzorce',
    scoring: 'Skórování',
    scale: 'Škála:',
    facet: 'Faceta:',
    domain: 'Doména:',
    diagnostics: 'Diagnostika:',
    totalLabel: 'Celkem:',
    subscalesLabel: 'Subškály:',
    questionFacetsInfo: 'Facety pro otázku',

    // Severity labels
    sevLow: 'Nízké',
    sevMild: 'Mírné',
    sevElevated: 'Zvýšené',
    sevHigh: 'Vysoké',
  },

  en: {
    // App title / menu
    appTitle: 'Personality Assessment',
    appSubtitle: 'PID-5 & LPFS-SR — standardized personality trait inventories',

    // Auth
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

    // Test cards
    pid5Desc: '220 items — personality traits & maladaptive patterns',
    lpfsDesc: '80 items — level of personality functioning',
    pid5Results: '📊 PID-5 Results',
    lpfsResults: '📊 LPFS Results',

    // Saved results
    savedResults: '📋 Saved Results',
    local: 'local',
    cloud: 'cloud',
    average: 'Average',
    view: 'View',
    export: 'Export',
    deleteResult: 'Delete this result?',
    deleteFromCloud: 'Delete from cloud?',

    // Result viewer modal
    pid5ResultsTitle: 'PID-5 Results',
    lpfsResultsTitle: 'LPFS-SR Results',
    domains: 'Domains',
    diagnosticProfiles: 'Diagnostic Profiles',
    close: 'Close',

    // Debug
    debug: '🔧 Debug tools',
    reset: '🗑 Reset',

    // PID-5 Results page
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

    // LPFS Results page
    lpfsResultsHeading: 'LPFS-SR Results',
    averageScore: 'Average Score',
    subscales: 'Subscales',
    selfFunctioning: '🧠 Self-Functioning',
    interpersonal: '💗 Interpersonal',
    exportResults: 'Export Results',
    report: 'Report',
    reportDesc: 'HTML report',

    // Questionnaire
    keyE: 'Toggle language (E)',
    hideHint: 'Hide hint',
    showHint: 'Hint',
    previous: '← Previous',
    next: 'Next →',
    showResults: '🎯 Show Results',

    // Live dashboard
    liveScores: 'Live Domain Scores',
    questionFacets: 'Facets for this question:',
    liveScoresLpfs: 'Live LPFS Scores',
    total: 'Total',

    // Scoring info
    sourcesFormulas: 'Sources & Formulas',
    scoring: 'Scoring',
    scale: 'Scale:',
    facet: 'Facet:',
    domain: 'Domain:',
    diagnostics: 'Diagnostics:',
    totalLabel: 'Total:',
    subscalesLabel: 'Subscales:',
    questionFacetsInfo: 'Facets for question',

    // Severity labels
    sevLow: 'Low',
    sevMild: 'Mild',
    sevElevated: 'Elevated',
    sevHigh: 'High',
  },
};

/**
 * Create a translation function for the given language.
 * Returns a function t(key) that looks up the key in the translations.
 * Falls back to Czech, then to the key itself.
 */
export function createT(lang) {
  const dict = translations[lang] || translations.cs;
  const fallback = translations.cs;
  return (key) => dict[key] ?? fallback[key] ?? key;
}

/**
 * Severity label based on value and language.
 * 0-0.5: Low, 0.5-1.0: Mild, 1.0-2.0: Elevated, 2.0+: High
 */
export function sevLabel(v, lang) {
  const t = createT(lang);
  if (v < 0.5) return t('sevLow');
  if (v < 1.0) return t('sevMild');
  if (v < 2.0) return t('sevElevated');
  return t('sevHigh');
}

/**
 * LPFS subscale display name by language.
 */
const LPFS_SUB_NAMES = {
  cs: {
    identity: 'Identita',
    selfDirection: 'Sebe-řízení',
    empathy: 'Empatie',
    intimacy: 'Intimita',
  },
  en: {
    identity: 'Identity',
    selfDirection: 'Self-Direction',
    empathy: 'Empathy',
    intimacy: 'Intimacy',
  },
};

export function lpfsSubName(sub, lang) {
  const names = LPFS_SUB_NAMES[lang] || LPFS_SUB_NAMES.cs;
  return names[sub] ?? sub;
}
