/**
 * feedback.js — User feedback / issue reporting system
 * Stores reports in localStorage, with optional sync to GitHub Issues.
 */

import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'app_feedback_reports';

/** Get all stored feedback reports */
export function getReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Save a new feedback report
 * @param {Object} report
 * @param {string} report.type - 'grammar' | 'scoring' | 'bug' | 'suggestion' | 'other'
 * @param {string} report.message - User description
 * @param {string} [report.testId] - Which test (e.g. 'phq9', 'gad7')
 * @param {number} [report.questionIndex] - Zero-based question index
 * @param {string} [report.questionText] - The question text for context
 * @param {string} [report.lang] - Language at time of report
 */
export function addReport(report) {
  const reports = getReports();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    ...report,
    timestamp: new Date().toISOString(),
    resolved: false,
  };
  reports.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  // Fire-and-forget attempt to sync to Supabase if configured
  if (isSupabaseConfigured()) {
    // insert without awaiting so UI stays snappy
    try {
      supabase.from('feedback_reports').insert([{ ...entry }]).then(() => {}).catch(() => {});
    } catch (e) {
      // ignore
    }
  }
  return entry;
}

/**
 * Try to sync a single report to Supabase explicitly
 */
export async function syncReportToSupabase(report) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('feedback_reports').insert([{ ...report }]);
    if (error) throw error;
    return data;
  } catch (e) {
    return null;
  }
}

/** Mark a report as resolved */
export function resolveReport(id) {
  const reports = getReports();
  const r = reports.find(r => r.id === id);
  if (r) {
    r.resolved = true;
    r.resolvedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
}

/** Delete a report */
export function deleteReport(id) {
  const reports = getReports().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

/** Clear all resolved reports */
export function clearResolved() {
  const reports = getReports().filter(r => !r.resolved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

/** Export all reports as JSON string */
export function exportReportsJSON() {
  return JSON.stringify(getReports(), null, 2);
}

/** Format a report into a GitHub Issue body (Markdown) */
export function formatAsGitHubIssue(report) {
  const typeEmoji = { grammar: '\u{1F4DD}', scoring: '\u{1F522}', bug: '\u{1F41B}', suggestion: '\u{1F4A1}', other: '\u{1F4CB}' };
  const emoji = typeEmoji[report.type] || '\u{1F4CB}';
  let body = '## ' + emoji + ' ' + report.type.charAt(0).toUpperCase() + report.type.slice(1) + ' Report\n\n';
  body += '**Message:** ' + report.message + '\n\n';
  if (report.testId) body += '**Test:** ' + report.testId + '\n';
  if (report.questionIndex !== undefined && report.questionIndex !== null) {
    body += '**Question #' + (report.questionIndex + 1) + '**';
    if (report.questionText) body += ': "' + report.questionText + '"';
    body += '\n';
  }
  if (report.lang) body += '**Language:** ' + report.lang + '\n';
  body += '**Reported:** ' + report.timestamp + '\n';
  body += '**Report ID:** `' + report.id + '`\n';
  return body;
}

/** Generate GitHub Issue title from a report */
export function issueTitle(report) {
  const prefix = { grammar: '[Grammar]', scoring: '[Scoring]', bug: '[Bug]', suggestion: '[Suggestion]', other: '[Report]' };
  const pfx = prefix[report.type] || '[Report]';
  const test = report.testId ? ' (' + report.testId.toUpperCase() + ')' : '';
  const q = report.questionIndex !== undefined ? ' Q' + (report.questionIndex + 1) : '';
  const msg = report.message.length > 60 ? report.message.slice(0, 57) + '...' : report.message;
  return pfx + test + q + ' \u2014 ' + msg;
}

/** Generate labels for a GitHub Issue */
export function issueLabels(report) {
  const labels = ['user-report'];
  if (report.type === 'grammar') labels.push('grammar', 'content');
  if (report.type === 'scoring') labels.push('scoring', 'logic');
  if (report.type === 'bug') labels.push('bug');
  if (report.type === 'suggestion') labels.push('enhancement');
  if (report.testId) labels.push('test:' + report.testId);
  return labels;
}
