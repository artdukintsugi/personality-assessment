# Copilot Instructions — Personality Assessment App

## User Feedback System

This project has a built-in user feedback/issue reporting system. Users can report problems (grammar errors, scoring bugs, suggestions) directly from the app UI. Reports are stored in `localStorage` and can be exported as JSON, then synced to GitHub Issues.

### How the feedback system works

1. **Global floating 🐛 button** (`src/components/FeedbackButton.jsx`) — always visible in bottom-right corner. Opens a modal where users select issue type, related test, and describe the problem.
2. **Per-question ⚑ flag button** (`src/components/QuestionReportButton.jsx`) — shown inline next to each question in `GenericQuestionnaire.jsx`. Lets users quickly report grammar/translation errors or scoring issues for a specific question.
3. **Storage** (`src/lib/feedback.js`) — reports saved to localStorage under key `app_feedback_reports`. Each report has: `id`, `type` (grammar|scoring|bug|suggestion|other), `message`, `testId`, `questionIndex`, `questionText`, `lang`, `timestamp`, `resolved`.
4. **GitHub sync** (`scripts/sync-feedback-to-github.js`) — CLI script that reads exported JSON and creates GitHub Issues with appropriate labels.

### Resolving user-reported issues

When working on issues labeled `user-report` from GitHub:

1. **Read the issue carefully** — it contains the test ID, question number, question text, and user's description.
2. **Find the relevant data file** based on `testId`:
   - `phq9` → `src/data/phq9.js`
   - `gad7` → `src/data/gad7.js`
   - `dass42` → `src/data/dass42.js`
   - `pcl5` → `src/data/pcl5.js`
   - `cati` → `src/data/cati.js`
   - `isi` → `src/data/isi.js`
   - `asrs` → `src/data/asrs.js`
   - `eat26` → `src/data/eat26.js`
   - `mdq` → `src/data/mdq.js`
   - `cuditr` → `src/data/cuditr.js`
   - `audit` → `src/data/audit.js`
   - `dast10` → `src/data/dast10.js`
   - `itq` → `src/data/itq.js`
   - `pid5` → `src/data/index.js` (Q, Q_EN arrays)
   - `lpfs` → `src/data/index.js` (LPFS_Q)
3. **For grammar/translation issues** (`[Grammar]` label):
   - Check both `cs` and `en` question arrays
   - Fix typos, diacritics, wrong translations
   - Questions are typically in arrays like `PHQ9_QUESTIONS.cs[index]`
4. **For scoring issues** (`[Scoring]` label):
   - Check the scoring function in the data file (e.g., `scoreCATI`, `scoreEAT26`, `scoreDAST10`)
   - Check severity level thresholds
   - Check reverse-scored items
   - Verify against the original clinical instrument
5. **For bugs** (`[Bug]` label):
   - Check the corresponding Results component in `src/components/<Test>Results.jsx`
   - Check `GenericQuestionnaire.jsx` for questionnaire-level bugs
6. **After fixing**, close the GitHub issue with a reference to the commit.

### Project structure overview

- `src/App.jsx` — Main app, 2900+ lines, mode-based routing
- `src/components/GenericQuestionnaire.jsx` — Reusable questionnaire screen
- `src/components/<Test>Results.jsx` — 13 results components (PHQ9, GAD7, DASS42, PCL5, CATI, ISI, ASRS, EAT26, MDQ, CUDITR, AUDIT, DAST10, ITQ)
- `src/data/*.js` — Test data, questions, scales, severity levels, scoring functions
- `src/lib/i18n.js` — Translations (cs/en)
- `src/lib/feedback.js` — Feedback storage helpers
- `src/lib/compare.js` — Compare/share link helpers
- `src/lib/auth.jsx` — Supabase auth (optional)
- `src/lib/export.js`, `src/lib/export-v2.js` — Report export functions

### Common patterns

- Questions are bilingual: `{ cs: [...], en: [...] }` — fix both languages when editing
- Czech uses diacritics: ě, š, č, ř, ž, ý, á, í, é, ú, ů, ď, ť, ň
- Czech quotes: use `„..."` (not `"..."`)
- Scale labels are also bilingual arrays
- Severity levels have `{ key, min, max, color, cs, en }` structure
- Tests use `localStorage` for persistence with keys like `diag_<test>_answers`
