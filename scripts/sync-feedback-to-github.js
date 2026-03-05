#!/usr/bin/env node
/**
 * sync-feedback-to-github.js
 * Reads exported feedback JSON and creates GitHub Issues with appropriate labels.
 * Usage: node scripts/sync-feedback-to-github.js feedback_reports.json
 */

import fs from 'fs';
import https from 'https';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'artdukintsugi';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'personality-assessment';

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required.');
  process.exit(1);
}

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node scripts/sync-feedback-to-github.js <feedback_reports.json>');
  process.exit(1);
}

const reports = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
const unresolved = reports.filter(r => !r.resolved);

console.log(`Found ${unresolved.length} unresolved report(s) to sync.`);

const TYPE_LABEL_MAP = {
  grammar: 'grammar',
  scoring: 'scoring',
  bug: 'bug',
  suggestion: 'suggestion',
  other: 'user-report',
};

function githubRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'feedback-sync-script',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw || '{}') }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createIssue(report) {
  const typeLabel = TYPE_LABEL_MAP[report.type] || 'user-report';
  const title = `[${report.type.charAt(0).toUpperCase() + report.type.slice(1)}] ${(report.message || '').slice(0, 60)}`;
  const body = [
    `**Type:** ${report.type}`,
    report.testId ? `**Test:** ${report.testId}` : null,
    report.questionIndex != null ? `**Question #:** ${report.questionIndex + 1}` : null,
    report.questionText ? `**Question text:** ${report.questionText}` : null,
    `**Language:** ${report.lang || 'unknown'}`,
    `**Reported at:** ${new Date(report.timestamp).toISOString()}`,
    '',
    '---',
    '',
    report.message,
  ].filter(l => l !== null).join('\n');

  const res = await githubRequest('POST', `/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
    title,
    body,
    labels: [typeLabel, 'user-report'],
  });

  if (res.status === 201) {
    console.log(`✓ Created issue #${res.body.number}: ${title}`);
  } else {
    console.error(`✗ Failed to create issue for report ${report.id}:`, res.body.message);
  }
}

for (const report of unresolved) {
  await createIssue(report);
}

console.log('Done.');
