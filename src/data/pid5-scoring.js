/**
 * PID-5 Scoring Data — CORRECTED per official APA scoring key
 * Source: APA DSM-5-TR, PID-5 Full Version (Adult), Page 8
 *
 * - FM: Facet Mapping (facet → 0-indexed item indices)
 * - DF: Domain → 3 primary Facets (per APA domain scoring table)
 * - DF_ALL: Domain → all contributing facets (extended)
 * - DC: Domain Colors for UI
 * - REVERSE_SCORED: Set of 0-indexed items that are reverse-scored (value → 3 - value)
 *
 * Reverse-scored items (1-indexed per official APA scoring key, Step 1):
 *   7, 30, 35, 58, 87, 90, 96, 97, 98, 131, 142, 155, 164, 177, 210, and 215.
 */

// 0-indexed reverse-scored items (1-indexed item# minus 1)
export const REVERSE_SCORED = new Set([
  6,    // Q7:   "I avoid risky situations." → Riskování (reverse)
  29,   // Q30:  "I'm an energetic person." → Anhedonie (reverse)
  34,   // Q35:  "I avoid risky sports and activities." → Riskování (reverse)
  57,   // Q58:  "I usually think before I act." → Impulzivita (reverse)
  86,   // Q87:  "I avoid anything that might be even a little bit dangerous." → Riskování (reverse)
  89,   // Q90:  "I would never harm another person." → Bezcitnost (reverse)
  95,   // Q96:  "I seldom worry about anything." → Úzkostnost (reverse)
  96,   // Q97:  "I enjoy being in love." → Vyhýbání se intimitě (reverse)
  97,   // Q98:  "I play it safe rather than take unnecessary chances." → Riskování (reverse)
  130,  // Q131: "People are basically trustworthy." → Podezřívavost (reverse)
  141,  // Q142: "I try to tell the truth even when it's hard." → Klamavost (reverse)
  154,  // Q155: "I really live life to the fullest." → Anhedonie/Nezodpovědnost (reverse)
  163,  // Q164: "I never take risks." → Riskování (reverse)
  176,  // Q177: "I rarely feel that people I know are trying to take advantage of me." → Podezřívavost (reverse)
  209,  // Q210: "I follow through on commitments." → Nezodpovědnost (reverse)
  214,  // Q215: "I hate to take risks." → Riskování (reverse)
]);

/**
 * FM — Facet Mapping (CORRECTED per APA official scoring key)
 * Each facet maps to an array of 0-indexed item numbers.
 * R = reverse-scored item (included in REVERSE_SCORED set)
 *
 * Item counts vary: 4–14 items per facet (total 220 unique items).
 */
export const FM = {
  "Anhedonie":              [0, 22, 25, 29, 123, 154, 156, 188],        // 8 items (Q1, Q23, Q26, Q30R, Q124, Q155R, Q157, Q189)
  "Úzkostnost":             [78, 92, 94, 95, 108, 109, 129, 140, 173],  // 9 items (Q79, Q93, Q95, Q96R, Q109, Q110, Q130, Q141, Q174)
  "Vyhášení pozornosti":    [13, 42, 73, 110, 112, 172, 190, 210],      // 8 items
  "Bezcitnost":             [10, 12, 18, 53, 71, 72, 89, 152, 165, 182, 197, 199, 206, 207], // 14 items (Q90R)
  "Klamavost":              [40, 52, 55, 75, 125, 133, 141, 205, 213, 217],  // 10 items (Q142R)
  "Depresivita":            [26, 60, 65, 80, 85, 103, 118, 147, 150, 162, 167, 168, 177, 211], // 14 items
  "Roztříštěnost":          [5, 28, 46, 67, 87, 117, 131, 143, 198],    // 9 items
  "Excentricita":           [4, 20, 23, 24, 32, 51, 54, 69, 70, 151, 171, 184, 204], // 13 items
  "Emoční labilita":        [17, 61, 101, 121, 137, 164, 180],          // 7 items
  "Grandiozita":            [39, 64, 113, 178, 186, 196],               // 6 items
  "Hostilita":              [27, 31, 37, 84, 91, 115, 157, 169, 187, 215], // 10 items
  "Impulzivita":            [3, 15, 16, 21, 57, 203],                   // 6 items (Q58R)
  "Vyhýbání se intimitě":   [88, 96, 107, 119, 144, 202],               // 6 items (Q97R)
  "Nezodpovědnost":         [30, 128, 155, 159, 170, 200, 209],         // 7 items (Q210R)
  "Manipulativnost":        [106, 124, 161, 179, 218],                  // 5 items
  "Percepční dysregulace":  [35, 36, 41, 43, 58, 76, 82, 153, 191, 192, 212, 216], // 12 items
  "Perseverace":            [45, 50, 59, 77, 79, 99, 120, 127, 136],    // 9 items
  "Restriktivní afektivita":[7, 44, 83, 90, 100, 166, 183],             // 7 items
  "Riskování":              [2, 6, 34, 38, 47, 66, 68, 86, 97, 111, 158, 163, 194, 214], // 14 items (Q7R, Q35R, Q87R, Q98R, Q164R, Q215R)
  "Separační nejistota":    [11, 49, 56, 63, 126, 148, 174],            // 7 items
  "Submisivita":            [8, 14, 62, 201],                           // 4 items
  "Podezřívavost":          [1, 102, 116, 130, 132, 176, 189],          // 7 items (Q131R, Q177R)
  "Neobvyklé přesvědčení":  [93, 98, 105, 138, 142, 149, 193, 208],    // 8 items
  "Stažení":                [9, 19, 74, 81, 135, 145, 146, 160, 181, 185], // 10 items
  "Rigidita":               [33, 48, 104, 114, 122, 134, 139, 175, 195, 219], // 10 items
};

/**
 * DF — Domain → 3 PRIMARY Facets (per APA Domain Scoring Table)
 * Domain score = average of these 3 primary facet scores
 */
export const DF = {
  "Negativní afektivita": ["Emoční labilita", "Úzkostnost", "Separační nejistota"],
  "Odtažitost": ["Stažení", "Anhedonie", "Vyhýbání se intimitě"],
  "Antagonismus": ["Manipulativnost", "Klamavost", "Grandiozita"],
  "Disinhibice": ["Nezodpovědnost", "Impulzivita", "Roztříštěnost"],
  "Psychoticismus": ["Neobvyklé přesvědčení", "Excentricita", "Percepční dysregulace"],
};

/**
 * DF_ALL — Domain → ALL contributing facets (for extended display)
 * These are NOT used for domain score calculation per APA.
 * They show which facets are conceptually associated with each domain.
 */
export const DF_ALL = {
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
