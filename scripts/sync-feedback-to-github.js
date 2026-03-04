#!/usr/bin/env node
/**
 * sync-feedback-to-github.js
 * 
 * Reads feedback reports from a JSON file (exported from the app's localStorage)
 * and creates GitHub Issues for each unresolved report.
 * 
 * Usage:
 *   node scripts/sync-feedback-to-github.js <reports.json> [--dry-run]
 * 
 * Required environment variables:
 *   GITHUB_TOKEN - GitHub personal access token with 'repo' scope
 *   GITHUB_REPO  - Repository in format 'owner/repo'
 * 
 * The script will:
 *   1. Read the JSON file with reports
 *   2. Create a GitHub Issue for each unresolved report
 *   3. Add appropriate labels (auto-creates them if missing)
 *   4. Output issue URLs for each created issue
 */

import { readFileSync, writeFileSync } from 'fs';

const GITHUB_API = 'https://api.github.com';

async function ghFetch(path, opts = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN env var is required');
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...opts,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }
  return res.json();
}

function issueTitle(report) {
  const prefix = {
    grammar: '[Grammar]', scoring: '[Scoring]', bug: '[Bug]', suggestion: '[Suggestion]', other: '[Report]',
  };
  const pfx = prefix[report.type] || '[Report]';
  const test = report.testId ? ` (${report.testId.toUpperCase()})` : '';
  const q = report.questionIndex !== undefined ? ` Q${report.questionIndex + 1}` : '';
  const msg = report.message.length > 60 ? report.message.slice(0, 57) + '...' : report.message;
  return `${pfx}${test}${q} — ${msg}`;
}

function issueBody(report) {
  const typeEmoji = { grammar: '📝', scoring: '🔢', bug: '🐛', suggestion: '💡', other: '📋' };
  const emoji = typeEmoji[report.type] || '📋';
  let body = `## ${emoji} ${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report\n\n`;
  body += `**Message:** ${report.message}\n\n`;
  if (report.testId) body += `**Test:** \`${report.testId}\`\n`;
  if (report.questionIndex !== undefined) {
    body += `**Question #${report.questionIndex + 1}**`;
    if (report.questionText) body += `: _"${report.questionText}"_`;
    body += '\n';
  }
  if (report.lang) body += `**Language:** ${report.lang}\n`;
  body += `**Reported:** ${report.timestamp}\n`;
  body += `**Report ID:** \`${report.id}\`\n`;
  if (report.meta) {
    body += `\n<details><summary>Extra metadata</summary>\n\n\`\`\`json\n${JSON.stringify(report.meta, null, 2)}\n\`\`\`\n</details>\n`;
  }
  body += '\n---\n_Auto-created from user feedback report._';
  return body;
}

function issueLabels(report) {
  const labels = ['user-report'];
  if (report.type === 'grammar') labels.push('grammar', 'content');
  if (report.type === 'scoring') labels.push('scoring', 'logic');
  if (report.type === 'bug') labels.push('bug');
  if (report.type === 'suggestion') labels.push('enhancement');
  if (report.testId) labels.push(`test:${report.testId}`);
  return labels;
}

async function ensureLabels(repo, labels) {
  const existing = await ghFetch(`/repos/${repo}/labels?per_page=100`);
  const existingNames = new Set(existing.map(l => l.name));
  const colors = {
    'user-report': 'D4C5F9', grammar: 'FEF3C7', content: 'FDE68A',
    scoring: 'BFDBFE', logic: '93C5FD', bug: 'FCA5A5', enhancement: 'A7F3D0',
  };
  for (const label of labels) {
    if (!existingNames.has(label)) {
      try {
        await ghFetch(`/repos/${repo}/labels`, {
          method: 'POST',
          body: JSON.stringify({ name: label, color: colors[label] || 'EDEDED' }),
        });
        console.log(`  ✓ Created label: ${label}`);
      } catch (e) {
        console.warn(`  ⚠ Could not create label '${label}': ${e.message}`);
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const file = args.find(a => !a.startsWith('--'));

  if (!file) {
    console.error('Usage: node scripts/sync-feedback-to-github.js <reports.json> [--dry-run]');
    process.exit(1);
  }

  const repo = process.env.GITHUB_REPO;
  if (!repo && !dryRun) {
    console.error('Set GITHUB_REPO env var (e.g. owner/repo)');
    process.exit(1);
  }

  let reports;
  try {
    reports = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`Failed to read ${file}: ${e.message}`);
    process.exit(1);
  }

  const unresolved = reports.filter(r => !r.resolved);
  console.log(`📋 Found ${reports.length} total reports, ${unresolved.length} unresolved.\n`);

  if (unresolved.length === 0) {
    console.log('Nothing to sync.');
    return;
  }

  // Collect all needed labels
  const allLabels = new Set();
  unresolved.forEach(r => issueLabels(r).forEach(l => allLabels.add(l)));

  if (!dryRun) {
    console.log('🏷  Ensuring labels exist...');
    await ensureLabels(repo, [...allLabels]);
    console.log('');
  }

  for (const report of unresolved) {
    const title = issueTitle(report);
    const body = issueBody(report);
    const labels = issueLabels(report);

    if (dryRun) {
      console.log(`[DRY RUN] Would create issue:`);
      console.log(`  Title: ${title}`);
      console.log(`  Labels: ${labels.join(', ')}`);
      console.log(`  Report ID: ${report.id}`);
      console.log('');
    } else {
      try {
        const issue = await ghFetch(`/repos/${repo}/issues`, {
          method: 'POST',
          body: JSON.stringify({ title, body, labels }),
        });
        console.log(`✅ Created: ${issue.html_url}`);
        // Mark as synced by adding githubIssue field
        report.githubIssue = issue.html_url;
        report.githubIssueNumber = issue.number;
      } catch (e) {
        console.error(`❌ Failed to create issue for ${report.id}: ${e.message}`);
      }
    }
  }

  if (!dryRun) {
    // Write back updated reports with GitHub URLs
    writeFileSync(file, JSON.stringify(reports, null, 2));
    console.log(`\n📁 Updated ${file} with GitHub issue links.`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
