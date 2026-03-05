#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }
  if (!GITHUB_TOKEN) {
    console.error('Missing GITHUB_TOKEN (or GH_TOKEN) env var');
    process.exit(1);
  }
  if (!GITHUB_REPO) {
    console.error('Missing GITHUB_REPO env var (owner/repo)');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch unsynced reports
  const { data: reports, error } = await supabase
    .from('feedback_reports')
    .select('*')
    .is('github_issue', null)
    .order('inserted_at', { ascending: true })
    .limit(200);

  if (error) {
    console.error('Supabase select error:', error.message || error);
    process.exit(1);
  }

  console.log(`Found ${reports.length} unsynced reports`);

  for (const r of reports) {
    const title = makeTitle(r);
    const body = makeBody(r);
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'sync-feedback-script'
        },
        body: JSON.stringify({ title, body, labels: makeLabels(r) })
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('GitHub API error creating issue:', res.status, text);
        continue;
      }
      const issue = await res.json();
      console.log(`Created issue ${issue.html_url} for report ${r.id}`);
      // update supabase row
      const { error: upErr } = await supabase.from('feedback_reports').update({ github_issue: issue.html_url, github_issue_number: issue.number, synced_at: new Date().toISOString() }).eq('id', r.id);
      if (upErr) console.warn('Failed to update report row:', upErr.message || upErr);
    } catch (e) {
      console.error('Error creating issue for report', r.id, e.message || e);
    }
  }
}

function makeTitle(r) {
  const prefix = r.type ? `[${capitalize(r.type)}]` : '[Report]';
  const test = r.test_id ? ` (${r.test_id.toUpperCase()})` : '';
  const q = (r.question_index !== null && r.question_index !== undefined) ? ` Q${r.question_index + 1}` : '';
  const msg = (r.message || '').slice(0, 60);
  return `${prefix}${test}${q} — ${msg}`;
}

function makeBody(r) {
  let body = '';
  body += `**Type:** ${r.type || 'report'}\n\n`;
  if (r.test_id) body += `**Test:** ${r.test_id}\n`;
  if (r.question_index !== null && r.question_index !== undefined) body += `**Question:** ${r.question_index + 1}\n`;
  if (r.question_text) body += `**Question text:** ${r.question_text}\n\n`;
  body += `**Message:**\n\n${r.message || ''}\n\n`;
  body += `**Reported at:** ${r.timestamp || r.inserted_at}\n`;
  body += `**Report ID:** \`${r.id}\`\n`;
  if (r.meta) body += `\n<details><summary>Metadata</summary>\n\n\`\`\`json\n${JSON.stringify(r.meta, null, 2)}\n\`\`\`\n</details>\n`;
  return body;
}

function makeLabels(r) {
  const labels = ['user-report'];
  if (r.type === 'grammar') labels.push('grammar', 'content');
  if (r.type === 'scoring') labels.push('scoring', 'logic');
  if (r.type === 'bug') labels.push('bug');
  if (r.type === 'suggestion') labels.push('enhancement');
  if (r.test_id) labels.push(`test:${r.test_id}`);
  return labels;
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

main().catch(e => { console.error(e); process.exit(1); });
