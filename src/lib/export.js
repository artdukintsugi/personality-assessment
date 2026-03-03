// ═══════════════════════════════════════════════════════════
// Export functions — HTML report + PDF-ready print
// ═══════════════════════════════════════════════════════════

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function severityLabel(v) {
  return v < 0.5 ? 'Nízké' : v < 1.0 ? 'Mírné' : v < 2.0 ? 'Zvýšené' : 'Vysoké';
}
function severityColor(v) {
  return v < 0.5 ? '#4ADE80' : v < 1.0 ? '#FBBF24' : v < 2.0 ? '#FB923C' : '#F87171';
}

const DC = {
  "Negativní afektivita": "#F87171",
  "Odtažitost": "#60A5FA",
  "Antagonismus": "#FBBF24",
  "Disinhibice": "#34D399",
  "Psychoticismus": "#C084FC"
};

export function exportPid5Report(domainScores, facetScores, diagnostics, DF) {
  const date = new Date().toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const flagged = diagnostics.filter(d => d.flag);

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PID-5 Výsledky — ${date}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0f; color: #e2e8f0; line-height: 1.6; padding: 2rem; max-width: 900px; margin: 0 auto; }
  @media print {
    body { background: white; color: #1a1a2e; padding: 1rem; }
    .no-print { display: none !important; }
    .card { border: 1px solid #e2e8f0 !important; background: #f8fafc !important; }
    .bar-bg { background: #e2e8f0 !important; }
    h1, h2, h3 { color: #1a1a2e !important; }
    .text-muted { color: #64748b !important; }
  }
  h1 { font-size: 2rem; font-weight: 700; background: linear-gradient(to right, #a78bfa, #f472b6, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
  h2 { font-size: 1.25rem; font-weight: 600; color: #94a3b8; margin-bottom: 1rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }
  h3 { font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
  .card { background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; }
  .text-muted { color: #64748b; font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }
  .text-sm { font-size: 0.875rem; }
  .bar-container { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
  .bar-label { width: 12rem; font-size: 0.875rem; font-weight: 500; flex-shrink: 0; }
  .bar-bg { flex: 1; height: 0.75rem; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s; }
  .bar-value { width: 3rem; text-align: right; font-size: 0.75rem; font-family: monospace; }
  .bar-sev { width: 4.5rem; text-align: right; font-size: 0.75rem; }
  .badge { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 500; }
  .diag-card { padding: 1rem; border-radius: 0.75rem; margin-bottom: 0.75rem; border: 1px solid; }
  .diag-facet { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
  .diag-facet-label { width: 10rem; font-size: 0.75rem; color: #94a3b8; }
  .diag-facet-bar { flex: 1; height: 0.375rem; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .diag-facet-val { width: 2.5rem; text-align: right; font-size: 0.75rem; font-family: monospace; color: #94a3b8; }
  .summary-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.375rem; }
  .dot { width: 0.625rem; height: 0.625rem; border-radius: 999px; flex-shrink: 0; }
  .disclaimer { margin-top: 2rem; padding: 1rem; border-radius: 0.75rem; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); }
  .disclaimer p { font-size: 0.8rem; color: #fbbf24; }
  .header-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #1e293b; }
  .print-btn { background: #7c3aed; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; }
  .print-btn:hover { background: #6d28d9; }
  @page { margin: 1.5cm; }
</style>
</head>
<body>
<div class="header-meta">
  <div>
    <h1>PID-5 — Výsledky</h1>
    <p class="text-muted">${date}</p>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨 Tisk / PDF</button>
</div>

${flagged.length > 0 ? `
<div class="card" style="border-color: rgba(248, 113, 113, 0.3); background: rgba(127, 29, 29, 0.15);">
  <h2 style="color: #f87171; border-color: rgba(248, 113, 113, 0.2);">⚠ Zvýšené diagnostické profily</h2>
  <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
    ${flagged.map(d => `<span class="badge" style="background: ${d.color}20; color: ${d.color}; border: 1px solid ${d.color}40;">${escapeHtml(d.name)} — ${d.score.toFixed(2)}</span>`).join('')}
  </div>
</div>
` : ''}

<div class="card">
  <h2>Domény — Přehled</h2>
  ${Object.entries(domainScores).map(([d, v]) => `
  <div class="bar-container">
    <div class="bar-label" style="color: ${DC[d] || '#94a3b8'}">${escapeHtml(d)}</div>
    <div class="bar-bg"><div class="bar-fill" style="width: ${(v/3)*100}%; background: ${DC[d] || '#94a3b8'}"></div></div>
    <div class="bar-value">${v.toFixed(2)}</div>
    <div class="bar-sev" style="color: ${severityColor(v)}">${severityLabel(v)}</div>
  </div>`).join('')}
</div>

<div class="card">
  <h2>Facety — Detail</h2>
  ${Object.entries(DF).map(([domain, facetList]) => `
  <div style="margin-bottom: 1.25rem;">
    <h3 style="color: ${DC[domain] || '#94a3b8'}">${escapeHtml(domain)}</h3>
    ${facetList.map(f => {
      const v = facetScores[f] || 0;
      return `
    <div class="bar-container">
      <div class="bar-label" style="color: #94a3b8; width: 14rem;">${escapeHtml(f)}</div>
      <div class="bar-bg"><div class="bar-fill" style="width: ${(v/3)*100}%; background: ${severityColor(v)}; height: 0.5rem;"></div></div>
      <div class="bar-value">${v.toFixed(2)}</div>
      <div class="bar-sev" style="color: ${severityColor(v)}">${severityLabel(v)}</div>
    </div>`;
    }).join('')}
  </div>`).join('')}
</div>

<div class="card">
  <h2>Diagnostické profily — všechny</h2>
  <div style="margin-bottom: 1.5rem;">
    ${diagnostics.map(d => `
    <div class="summary-row">
      <div class="dot" style="background: ${d.flag ? d.color : '#374151'}"></div>
      <div style="width: 14rem; font-size: 0.8rem; color: ${d.flag ? d.color : '#6b7280'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(d.name)}</div>
      <div class="bar-bg" style="flex: 1;"><div class="bar-fill" style="width: ${(d.score/3)*100}%; background: ${d.color}; opacity: ${d.flag ? 1 : 0.4};"></div></div>
      <div style="width: 2.5rem; text-align: right; font-size: 0.75rem; font-family: monospace; color: ${d.flag ? d.color : '#6b7280'}">${d.score.toFixed(2)}</div>
      <div style="width: 5rem; text-align: right; font-size: 0.75rem; color: ${d.flag ? d.color : '#4b5563'}">${d.flag ? '⚠ Zvýšené' : d.score >= 1.0 ? 'Mírné' : 'Nízké'}</div>
    </div>`).join('')}
  </div>

  ${flagged.length > 0 ? `
  <div style="margin-top: 1rem;">
    <h3 style="color: #e2e8f0;">Detail zvýšených profilů</h3>
    ${flagged.map(d => `
    <div class="diag-card" style="border-color: ${d.color}30; background: ${d.color}08;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <div class="dot" style="background: ${d.color}"></div>
        <span style="font-weight: 600; font-size: 0.875rem; color: ${d.color}">${escapeHtml(d.name)}</span>
        <span class="badge" style="margin-left: auto; background: ${d.color}20; color: ${d.color};">${d.score.toFixed(2)}</span>
      </div>
      <p class="text-xs text-muted" style="margin-bottom: 0.75rem;">${escapeHtml(d.desc)}</p>
      ${d.facets.map(f => {
        const v = facetScores[f] || 0;
        return `
      <div class="diag-facet">
        <div class="diag-facet-label">↳ ${escapeHtml(f)}</div>
        <div class="diag-facet-bar"><div class="bar-fill" style="width: ${(v/3)*100}%; background: ${severityColor(v)};"></div></div>
        <div class="diag-facet-val">${v.toFixed(2)}</div>
      </div>`;
      }).join('')}
    </div>`).join('')}
  </div>
  ` : ''}
</div>

<div class="disclaimer">
  <p><strong>⚠ Disclaimer:</strong> Tento report je orientační a nenahrazuje klinické psychologické vyšetření. PID-5 je dimenzionální nástroj měřící maladaptivní osobnostní rysy na kontinuu. Pro diagnostiku je vždy nutný klinický rozhovor s odborníkem.</p>
</div>

<div class="card text-xs text-muted" style="margin-top: 1.5rem;">
  <p><strong>Zdroje:</strong> Krueger et al. (2012) • APA DSM-5 Section III (2013) • Bach, Sellbom & Simonsen (2018) • Widiger et al. (2019)</p>
  <p style="margin-top: 0.5rem;">Generováno aplikací Diagnostický protokol — PID-5 & LPFS-SR</p>
</div>

</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `PID-5_report_${new Date().toISOString().slice(0,10)}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportLpfsReport(lpfsTotal, lpfsAns) {
  const date = new Date().toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<title>LPFS-SR Výsledky — ${date}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #0a0a0f; color: #e2e8f0; line-height: 1.6; padding: 2rem; max-width: 700px; margin: 0 auto; }
  @media print { body { background: white; color: #1a1a2e; } .no-print { display: none !important; } .card { border: 1px solid #e2e8f0 !important; background: #f8fafc !important; } h1,h2 { color: #1a1a2e !important; } .text-muted { color: #64748b !important; } }
  h1 { font-size: 2rem; font-weight: 700; color: #60a5fa; margin-bottom: 0.5rem; }
  .card { background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; }
  .text-muted { color: #64748b; font-size: 0.875rem; }
  .score-big { font-size: 4rem; font-weight: 700; text-align: center; margin: 1rem 0; }
  .score-label { text-align: center; font-size: 1.125rem; }
  .print-btn { background: #2563eb; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; }
  .disclaimer { margin-top: 2rem; padding: 1rem; border-radius: 0.75rem; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); }
  .disclaimer p { font-size: 0.8rem; color: #fbbf24; }
  .header-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #1e293b; }
</style>
</head>
<body>
<div class="header-meta">
  <div>
    <h1>LPFS-SR — Výsledky</h1>
    <p class="text-muted">${date}</p>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨 Tisk / PDF</button>
</div>

<div class="card" style="text-align: center;">
  <div class="score-big" style="color: ${severityColor(lpfsTotal)}">${lpfsTotal.toFixed(2)}</div>
  <div class="score-label" style="color: ${severityColor(lpfsTotal)}">${severityLabel(lpfsTotal)}</div>
  <p class="text-muted" style="margin-top: 0.5rem;">Průměrné skóre (škála 1–4) • ${Object.keys(lpfsAns).length} otázek</p>
</div>

<div class="disclaimer">
  <p><strong>⚠ Disclaimer:</strong> Tento report je orientační a nenahrazuje klinické vyšetření. LPFS-SR měří úroveň fungování osobnosti. Pro interpretaci kontaktujte odborníka.</p>
</div>

<div class="card text-muted" style="font-size: 0.75rem; margin-top: 1.5rem;">
  <p><strong>Zdroj:</strong> Morey (2017) — Self-report Level of Personality Functioning Scale</p>
  <p style="margin-top: 0.5rem;">Generováno aplikací Diagnostický protokol — PID-5 & LPFS-SR</p>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `LPFS_report_${new Date().toISOString().slice(0,10)}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportRawJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
