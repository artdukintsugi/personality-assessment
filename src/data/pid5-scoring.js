/**
 * PID-5 Scoring Data
 * - FM: Facet Mapping (facet → 0-indexed item indices)
 * - DF: Domain → Facets mapping
 * - DC: Domain Colors for UI
 * - REVERSE_SCORED: Set of 0-indexed items that are reverse-scored (value → 3 - value)
 *
 * Reverse-scored items (1-indexed per official PID-5 scoring key):
 *   7, 30, 35, 58, 87, 90, 96, 97, 98, 100, 131, 142, 155, 164, 177, 210
 * These items are phrased in the opposite direction — e.g., "I would never hurt anyone"
 * = HIGH agreeableness → LOW callousness. For scoring, we flip: score = 3 - raw_value.
 */

// 0-indexed reverse-scored items (1-indexed item# minus 1)
export const REVERSE_SCORED = new Set([
  6,    // Q7:   "Vyhýbám se riskantním situacím." → Riskování (reverse)
  29,   // Q30:  "Jsem energický člověk." → Nezodpovědnost (reverse — measures responsibility)
  34,   // Q35:  "Vyhýbám se riskantním sportům a aktivitám." → Riskování (reverse)
  57,   // Q58:  "Obvykle myslím dříve, než jednám." → Impulzivita (reverse — measures thoughtfulness)
  86,   // Q87:  "Vyhýbám se čemukoliv, co by mohlo být dokonce jen trochu nebezpečné." → Riskování (reverse)
  89,   // Q90:  "Nikdy bych druhému neublížil/a." → Bezcitnost (reverse — HIGH = LOW callousness)
  95,   // Q96:  "Zřídka si dělám s něčím starosti." → Úzkostnost (reverse)
  96,   // Q97:  "Užívám si být zamilovaný/á." → Vyhýbání se intimitě (reverse)
  97,   // Q98:  "Sázím na jistotu, spíše než se pouštět do zbytečných výzev." → Riskování (reverse)
  99,   // Q100: "Lidé mi říkají, že je těžké vědět, co cítím." → Restriktivní afektivita (non-reverse in some versions, included per standard key)
  130,  // Q131: "Lidé jsou v zásadě důvěryhodní." → Podezřívavost (reverse — HIGH trust = LOW suspiciousness)
  141,  // Q142: "Snažím se říkat pravdu, i když bolí." → Klamavost (reverse — honesty = LOW deceit)
  154,  // Q155: "Žiji skutečně naplno." → Anhedonie/Depresivita (reverse — HIGH enjoyment = LOW anhedonia)
  163,  // Q164: "Nikdy nepodstupuji riziko." → Riskování (reverse)
  176,  // Q177: "Zřídkakdy cítím, že mě lidé, které znám, zkouší využívat." → Podezřívavost (reverse)
  209,  // Q210: "Své závazky dotahuji do konce." → Nezodpovědnost (reverse — responsibility = LOW irresponsibility)
]);

/**
 * FM — Facet Mapping
 * Each facet maps to an array of 0-indexed item numbers.
 *
 * FIX applied: Item 117 removed from "Podezřívavost" (Q118 "Mám potíže udržet mysl
 * zaměřenou na to, co je třeba udělat" is about concentration/distractibility,
 * NOT suspiciousness — it belongs only in Roztříštěnost).
 */
export const FM = {
  "Anhedonie": [0, 22, 25, 26, 123, 156, 188, 189],
  "Úzkostnost": [78, 92, 94, 108, 109, 129, 140, 173],
  "Vyhášení pozornosti": [13, 42, 73, 110, 112, 172, 190, 210],
  "Bezcitnost": [18, 53, 71, 89, 152, 165, 182, 183],
  "Klamavost": [40, 52, 55, 125, 133, 155, 161, 213],
  "Depresivita": [60, 65, 80, 103, 147, 150, 157, 168],
  "Roztříštěnost": [5, 28, 67, 117, 131, 143, 198, 199],
  "Excentricita": [20, 23, 24, 32, 69, 70, 151, 171, 184, 204],
  "Emoční labilita": [17, 61, 121, 137, 157, 164, 180, 211],
  "Grandiozita": [39, 64, 113, 114, 178, 186, 196, 197],
  "Hostilita": [27, 31, 37, 84, 115, 169, 187, 215],
  "Impulzivita": [3, 4, 14, 21, 128, 158, 203, 219],
  "Vyhýbání se intimitě": [9, 81, 88, 107, 119, 144, 145, 202],
  "Nezodpovědnost": [30, 46, 86, 88, 159, 170, 200, 209],
  "Manipulativnost": [55, 72, 75, 106, 124, 125, 134, 179],
  "Percepční dysregulace": [35, 36, 41, 43, 58, 76, 93, 98, 138, 142, 149, 192, 194, 212, 216],
  "Perseverace": [45, 59, 77, 79, 99, 120, 127, 136],
  "Restriktivní afektivita": [7, 83, 90, 100, 146, 166, 183, 167],
  "Riskování": [6, 34, 38, 47, 48, 66, 68, 87, 96, 97, 111, 163, 195, 214],
  "Separační nejistota": [11, 49, 56, 63, 126, 148, 174, 201],
  "Submisivita": [8, 15, 16, 62, 63, 201, 202, 9],
  "Podezřívavost": [1, 102, 116, 132, 133, 176, 189],  // FIXED: removed 117 (Roztříštěnost only)
  "Neobvyklé přesvědčení": [93, 94, 142, 143, 149, 150, 192, 205],
  "Stažení": [9, 74, 81, 82, 119, 135, 145, 161, 182, 185, 207],
  "Rigidita": [33, 49, 51, 60, 78, 80, 104, 115, 122, 135, 139, 175, 196, 219],
};

/**
 * DF — Domain → Facets mapping (DSM-5 Section III)
 */
export const DF = {
  "Negativní afektivita": ["Emoční labilita", "Úzkostnost", "Separační nejistota", "Hostilita", "Perseverace", "Submisivita", "Restriktivní afektivita"],
  "Odtažitost": ["Stažení", "Vyhýbání se intimitě", "Anhedonie", "Depresivita", "Restriktivní afektivita", "Podezřívavost"],
  "Antagonismus": ["Manipulativnost", "Klamavost", "Grandiozita", "Vyhášení pozornosti", "Bezcitnost"],
  "Disinhibice": ["Nezodpovědnost", "Impulzivita", "Roztříštěnost", "Riskování", "Rigidita"],
  "Psychoticismus": ["Neobvyklé přesvědčení", "Excentricita", "Percepční dysregulace"],
};

/**
 * DC — Domain Colors (for UI visualization)
 */
export const DC = {
  "Negativní afektivita": "#F87171",
  "Odtažitost": "#60A5FA",
  "Antagonismus": "#FBBF24",
  "Disinhibice": "#34D399",
  "Psychoticismus": "#C084FC",
};
