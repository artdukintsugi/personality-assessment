// ═══════════════════════════════════════════════════════════
// Export functions — Full PDF report + Instagram Story + Quick Summary
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
  "Negativní afektivita": "#F87171", "Odtažitost": "#60A5FA",
  "Antagonismus": "#FBBF24", "Disinhibice": "#34D399", "Psychoticismus": "#C084FC"
};

// ═══ FULL PDF REPORT ═══
export function exportPid5Report(domainScores, facetScores, diagnostics, DF) {
  const date = new Date().toLocaleDateString('cs-CZ', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
  const flagged = diagnostics.filter(d => d.flag);
  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PID-5 Výsledky — ${date}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;line-height:1.6;padding:2rem;max-width:900px;margin:0 auto}
@media print{body{background:#fff;color:#1a1a2e;padding:1rem}.no-print{display:none!important}.card{border:1px solid #e2e8f0!important;background:#f8fafc!important}.bar-bg{background:#e2e8f0!important}h1,h2,h3{color:#1a1a2e!important}.text-muted{color:#64748b!important}.badge{border:1px solid #94a3b8!important}}
h1{font-size:2rem;font-weight:700;background:linear-gradient(to right,#a78bfa,#f472b6,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem}
h2{font-size:1.25rem;font-weight:600;color:#94a3b8;margin-bottom:1rem;border-bottom:1px solid #1e293b;padding-bottom:.5rem}
h3{font-size:.875rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.75rem}
.card{background:rgba(15,23,42,.6);border:1px solid #1e293b;border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem}
.text-muted{color:#64748b;font-size:.875rem}
.bar-container{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem}
.bar-label{width:12rem;font-size:.875rem;font-weight:500;flex-shrink:0}
.bar-bg{flex:1;height:.75rem;background:#1e293b;border-radius:999px;overflow:hidden}
.bar-fill{height:100%;border-radius:999px}
.bar-value{width:3rem;text-align:right;font-size:.75rem;font-family:monospace}
.bar-sev{width:4.5rem;text-align:right;font-size:.75rem}
.badge{display:inline-flex;align-items:center;gap:.25rem;font-size:.75rem;padding:.25rem .75rem;border-radius:999px;font-weight:500}
.diag-card{padding:1rem;border-radius:.75rem;margin-bottom:.75rem;border:1px solid}
.summary-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.375rem}
.dot{width:.625rem;height:.625rem;border-radius:999px;flex-shrink:0}
.disclaimer{margin-top:2rem;padding:1rem;border-radius:.75rem;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3)}
.disclaimer p{font-size:.8rem;color:#fbbf24}
.header-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #1e293b}
.btn{border:none;padding:.5rem 1.5rem;border-radius:.5rem;cursor:pointer;font-size:.875rem;font-weight:500;margin-right:.5rem}
.btn-purple{background:#7c3aed;color:#fff}.btn-purple:hover{background:#6d28d9}
.btn-gray{background:#374151;color:#d1d5db}.btn-gray:hover{background:#4b5563}
@page{margin:1.5cm}
</style></head><body>
<div class="header-meta">
  <div><h1>PID-5 — Výsledky</h1><p class="text-muted">${date}</p></div>
  <div class="no-print">
    <button class="btn btn-purple" onclick="window.print()">🖨 Tisk / PDF</button>
  </div>
</div>
${flagged.length > 0 ? `<div class="card" style="border-color:rgba(248,113,113,.3);background:rgba(127,29,29,.15)">
  <h2 style="color:#f87171;border-color:rgba(248,113,113,.2)">⚠ Zvýšené diagnostické profily</h2>
  <div style="display:flex;flex-wrap:wrap;gap:.5rem">${flagged.map(d => `<span class="badge" style="background:${d.color}20;color:${d.color};border:1px solid ${d.color}40">${escapeHtml(d.name)} — ${d.score.toFixed(2)}</span>`).join('')}</div>
</div>` : ''}
<div class="card"><h2>Domény — Přehled</h2>
${Object.entries(domainScores).map(([d,v]) => `<div class="bar-container">
  <div class="bar-label" style="color:${DC[d]||'#94a3b8'}">${escapeHtml(d)}</div>
  <div class="bar-bg"><div class="bar-fill" style="width:${(v/3)*100}%;background:${DC[d]||'#94a3b8'}"></div></div>
  <div class="bar-value">${v.toFixed(2)}</div>
  <div class="bar-sev" style="color:${severityColor(v)}">${severityLabel(v)}</div>
</div>`).join('')}</div>
<div class="card"><h2>Facety — Detail</h2>
${Object.entries(DF).map(([domain, facetList]) => `<div style="margin-bottom:1.25rem">
  <h3 style="color:${DC[domain]||'#94a3b8'}">${escapeHtml(domain)}</h3>
  ${facetList.map(f => { const v = facetScores[f]||0; return `<div class="bar-container">
    <div class="bar-label" style="color:#94a3b8;width:14rem">${escapeHtml(f)}</div>
    <div class="bar-bg"><div class="bar-fill" style="width:${(v/3)*100}%;background:${severityColor(v)};height:.5rem"></div></div>
    <div class="bar-value">${v.toFixed(2)}</div>
    <div class="bar-sev" style="color:${severityColor(v)}">${severityLabel(v)}</div>
  </div>`; }).join('')}
</div>`).join('')}</div>
<div class="card"><h2>Diagnostické profily</h2>
<div style="margin-bottom:1.5rem">${diagnostics.map(d => `<div class="summary-row">
  <div class="dot" style="background:${d.flag?d.color:'#374151'}"></div>
  <div style="width:14rem;font-size:.8rem;color:${d.flag?d.color:'#6b7280'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(d.name)}</div>
  <div class="bar-bg" style="flex:1"><div class="bar-fill" style="width:${(d.score/3)*100}%;background:${d.color};opacity:${d.flag?1:.4}"></div></div>
  <div style="width:2.5rem;text-align:right;font-size:.75rem;font-family:monospace;color:${d.flag?d.color:'#6b7280'}">${d.score.toFixed(2)}</div>
  <div style="width:5rem;text-align:right;font-size:.75rem;color:${d.flag?d.color:'#4b5563'}">${d.flag?'⚠ Zvýšené':d.score>=1.0?'Mírné':'Nízké'}</div>
</div>`).join('')}</div>
${flagged.length>0?`<div style="margin-top:1rem"><h3 style="color:#e2e8f0">Detail zvýšených profilů</h3>
${flagged.map(d=>`<div class="diag-card" style="border-color:${d.color}30;background:${d.color}08">
  <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem">
    <div class="dot" style="background:${d.color}"></div>
    <span style="font-weight:600;font-size:.875rem;color:${d.color}">${escapeHtml(d.name)}</span>
    <span class="badge" style="margin-left:auto;background:${d.color}20;color:${d.color}">${d.score.toFixed(2)}</span>
  </div>
  <p style="font-size:.75rem;color:#64748b;margin-bottom:.75rem">${escapeHtml(d.desc)}</p>
  ${d.facets.map(f=>{const v=facetScores[f]||0;return`<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem">
    <div style="width:10rem;font-size:.75rem;color:#94a3b8">↳ ${escapeHtml(f)}</div>
    <div style="flex:1;height:.375rem;background:#1e293b;border-radius:999px;overflow:hidden"><div class="bar-fill" style="width:${(v/3)*100}%;background:${severityColor(v)}"></div></div>
    <div style="width:2.5rem;text-align:right;font-size:.75rem;font-family:monospace;color:#94a3b8">${v.toFixed(2)}</div>
  </div>`;}).join('')}
</div>`).join('')}</div>`:''}</div>
<div class="disclaimer"><p><strong>⚠ Disclaimer:</strong> Tento report je orientační a nenahrazuje klinické psychologické vyšetření. PID-5 je dimenzionální nástroj měřící maladaptivní osobnostní rysy na kontinuu. Pro diagnostiku je vždy nutný klinický rozhovor s odborníkem.</p></div>
<div class="card text-muted" style="margin-top:1.5rem;font-size:.75rem">
  <p><strong>Zdroje:</strong> Krueger et al. (2012) • APA DSM-5 Section III (2013) • Bach, Sellbom & Simonsen (2018) • Widiger et al. (2019)</p>
  <p style="margin-top:.5rem">Generováno: Diagnostický protokol — PID-5 & LPFS-SR</p>
</div></body></html>`;
  downloadHtml(html, `PID-5_report_${new Date().toISOString().slice(0,10)}.html`);
}

// ═══ INSTAGRAM STORY — compact visual card ═══
export function exportInstagramStory(domainScores, diagnostics) {
  const flagged = diagnostics.filter(d => d.flag);
  const date = new Date().toLocaleDateString('cs-CZ', { day:'numeric', month:'short', year:'numeric' });
  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080">
<title>PID-5 Story</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;font-family:'Inter',sans-serif;background:linear-gradient(160deg,#0a0a1a 0%,#1a0a2e 30%,#0a1a2e 60%,#0a0a1a 100%);color:#fff;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:80px 60px}
.title{font-size:56px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#f472b6,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;text-align:center}
.subtitle{font-size:24px;color:#64748b;margin-bottom:60px;text-align:center}
.domain-row{display:flex;align-items:center;gap:20px;width:100%;margin-bottom:24px;padding:20px 30px;background:rgba(255,255,255,.04);border-radius:20px;border:1px solid rgba(255,255,255,.06)}
.domain-name{font-size:28px;font-weight:600;width:340px;flex-shrink:0}
.domain-bar{flex:1;height:20px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden}
.domain-fill{height:100%;border-radius:999px}
.domain-val{font-size:28px;font-weight:700;width:80px;text-align:right;font-family:monospace}
.domain-sev{font-size:22px;width:120px;text-align:right}
.flagged{margin-top:50px;width:100%;padding:40px;background:rgba(248,113,113,.06);border-radius:24px;border:1px solid rgba(248,113,113,.2)}
.flagged-title{font-size:32px;font-weight:700;color:#f87171;margin-bottom:20px}
.flagged-item{display:flex;align-items:center;gap:16px;margin-bottom:12px}
.flagged-dot{width:16px;height:16px;border-radius:999px;flex-shrink:0}
.flagged-name{font-size:26px;font-weight:500;flex:1}
.flagged-score{font-size:26px;font-weight:700;font-family:monospace}
.footer{margin-top:auto;text-align:center;color:#374151;font-size:20px}
.print-btn{position:fixed;top:20px;right:20px;background:#7c3aed;color:#fff;border:none;padding:12px 24px;border-radius:12px;font-size:16px;cursor:pointer;z-index:999}
@media print{.print-btn{display:none}}
</style></head><body>
<button class="print-btn" onclick="window.print()">📱 Uložit jako obrázek (Print → PDF)</button>
<div class="title">PID-5 Profil</div>
<div class="subtitle">Osobnostní rysy · ${date}</div>
${Object.entries(domainScores).map(([d,v]) => `<div class="domain-row">
  <div class="domain-name" style="color:${DC[d]}">${escapeHtml(d)}</div>
  <div class="domain-bar"><div class="domain-fill" style="width:${(v/3)*100}%;background:${DC[d]}"></div></div>
  <div class="domain-val">${v.toFixed(2)}</div>
  <div class="domain-sev" style="color:${severityColor(v)}">${severityLabel(v)}</div>
</div>`).join('')}
${flagged.length > 0 ? `<div class="flagged">
  <div class="flagged-title">⚠ Zvýšené profily</div>
  ${flagged.slice(0,5).map(d => `<div class="flagged-item">
    <div class="flagged-dot" style="background:${d.color}"></div>
    <div class="flagged-name" style="color:${d.color}">${escapeHtml(d.name.split('(')[0].trim())}</div>
    <div class="flagged-score" style="color:${d.color}">${d.score.toFixed(2)}</div>
  </div>`).join('')}
</div>` : '<div style="margin-top:50px;padding:40px;background:rgba(74,222,128,.06);border-radius:24px;border:1px solid rgba(74,222,128,.2);text-align:center"><div style="font-size:32px;color:#4ade80;font-weight:700">✓ Bez zvýšených profilů</div></div>'}
<div class="footer">Diagnostický protokol · PID-5 & LPFS-SR · Orientační výsledky</div>
</body></html>`;
  downloadHtml(html, `PID-5_story_${new Date().toISOString().slice(0,10)}.html`);
}

// ═══ QUICK SUMMARY — compact one-pager ═══
export function exportQuickSummary(domainScores, facetScores, diagnostics, DF) {
  const date = new Date().toLocaleDateString('cs-CZ', { day:'numeric', month:'short', year:'numeric' });
  const flagged = diagnostics.filter(d => d.flag);
  const top5Facets = Object.entries(facetScores).sort((a,b) => b[1]-a[1]).slice(0,5);
  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PID-5 Shrnutí</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;padding:1.5rem;max-width:600px;margin:0 auto;font-size:14px}
@media print{body{background:#fff;color:#1a1a2e}.card{border:1px solid #e2e8f0!important;background:#f8fafc!important}h1{color:#1a1a2e!important;background:none!important;-webkit-text-fill-color:#1a1a2e!important}.no-print{display:none!important}.muted{color:#64748b!important}}
h1{font-size:1.5rem;font-weight:700;background:linear-gradient(to right,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.25rem}
.card{background:rgba(15,23,42,.6);border:1px solid #1e293b;border-radius:.75rem;padding:1rem;margin-bottom:1rem}
.muted{color:#64748b;font-size:.75rem}
.row{display:flex;align-items:center;gap:.5rem;margin-bottom:.375rem}
.dot{width:8px;height:8px;border-radius:999px;flex-shrink:0}
.bar{flex:1;height:6px;background:#1e293b;border-radius:999px;overflow:hidden}
.fill{height:100%;border-radius:999px}
.val{width:2rem;text-align:right;font-size:.7rem;font-family:monospace}
.label{width:9rem;font-size:.8rem;font-weight:500;flex-shrink:0}
.sev{font-size:.7rem;width:3.5rem;text-align:right}
.btn{display:block;text-align:center;background:#7c3aed;color:#fff;border:none;padding:.5rem 1rem;border-radius:.5rem;cursor:pointer;font-size:.8rem;margin-top:.5rem}
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:1px solid #1e293b">
  <div><h1>PID-5 Shrnutí</h1><p class="muted">${date}</p></div>
  <button class="btn no-print" onclick="window.print()">🖨 PDF</button>
</div>
<div class="card"><div style="font-size:.75rem;font-weight:600;color:#94a3b8;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em">Domény</div>
${Object.entries(domainScores).map(([d,v]) => `<div class="row">
  <div class="label" style="color:${DC[d]}">${escapeHtml(d)}</div>
  <div class="bar"><div class="fill" style="width:${(v/3)*100}%;background:${DC[d]}"></div></div>
  <div class="val">${v.toFixed(2)}</div>
  <div class="sev" style="color:${severityColor(v)}">${severityLabel(v)}</div>
</div>`).join('')}</div>
<div class="card"><div style="font-size:.75rem;font-weight:600;color:#94a3b8;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em">Top 5 facet</div>
${top5Facets.map(([f,v]) => `<div class="row">
  <div class="label" style="color:#d1d5db">${escapeHtml(f)}</div>
  <div class="bar"><div class="fill" style="width:${(v/3)*100}%;background:${severityColor(v)}"></div></div>
  <div class="val">${v.toFixed(2)}</div>
  <div class="sev" style="color:${severityColor(v)}">${severityLabel(v)}</div>
</div>`).join('')}</div>
${flagged.length > 0 ? `<div class="card" style="border-color:rgba(248,113,113,.3);background:rgba(127,29,29,.15)">
<div style="font-size:.75rem;font-weight:600;color:#f87171;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em">⚠ Zvýšené profily</div>
${flagged.map(d => `<div class="row">
  <div class="dot" style="background:${d.color}"></div>
  <div class="label" style="color:${d.color}">${escapeHtml(d.name.split('(')[0].trim())}</div>
  <div class="val" style="color:${d.color}">${d.score.toFixed(2)}</div>
</div>`).join('')}</div>` : ''}
<div class="muted" style="text-align:center;margin-top:.5rem">Orientační výsledky · Nenahrazuje klinické vyšetření</div>
</body></html>`;
  downloadHtml(html, `PID-5_shrnuti_${new Date().toISOString().slice(0,10)}.html`);
}

// ═══ LPFS REPORT ═══
export function exportLpfsReport(lpfsTotal, lpfsAns, subscaleScores) {
  const date = new Date().toLocaleDateString('cs-CZ', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
  const subNames = { identity: "Identita", selfDirection: "Sebesměrování", empathy: "Empatie", intimacy: "Intimita" };
  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LPFS-SR Výsledky — ${date}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;line-height:1.6;padding:2rem;max-width:700px;margin:0 auto}
@media print{body{background:#fff;color:#1a1a2e}.no-print{display:none!important}.card{border:1px solid #e2e8f0!important;background:#f8fafc!important}h1,h2{color:#1a1a2e!important}.muted{color:#64748b!important}}
h1{font-size:2rem;font-weight:700;color:#60a5fa;margin-bottom:.5rem}
.card{background:rgba(15,23,42,.6);border:1px solid #1e293b;border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem}
.muted{color:#64748b;font-size:.875rem}
.score-big{font-size:4rem;font-weight:700;text-align:center;margin:1rem 0}
.btn{background:#2563eb;color:#fff;border:none;padding:.5rem 1.5rem;border-radius:.5rem;cursor:pointer;font-size:.875rem}
.disclaimer{margin-top:2rem;padding:1rem;border-radius:.75rem;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3)}
.disclaimer p{font-size:.8rem;color:#fbbf24}
.sub-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.sub-label{width:10rem;font-size:.875rem;font-weight:500;color:#93c5fd}
.sub-bar{flex:1;height:.625rem;background:#1e293b;border-radius:999px;overflow:hidden}
.sub-fill{height:100%;border-radius:999px;background:#60a5fa}
.sub-val{width:3rem;text-align:right;font-size:.75rem;font-family:monospace}
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid #1e293b">
  <div><h1>LPFS-SR — Výsledky</h1><p class="muted">${date}</p></div>
  <button class="btn no-print" onclick="window.print()">🖨 PDF</button>
</div>
<div class="card" style="text-align:center">
  <div class="score-big" style="color:${severityColor(lpfsTotal)}">${lpfsTotal.toFixed(2)}</div>
  <div style="font-size:1.125rem;color:${severityColor(lpfsTotal)}">${severityLabel(lpfsTotal)}</div>
  <p class="muted" style="margin-top:.5rem">Průměrné skóre (škála 1–4) · ${Object.keys(lpfsAns).length} otázek</p>
</div>
${subscaleScores ? `<div class="card">
  <h2 style="font-size:1rem;font-weight:600;color:#93c5fd;margin-bottom:1rem;border-bottom:1px solid #1e293b;padding-bottom:.5rem">Subškály</h2>
  ${Object.entries(subscaleScores).map(([k,v]) => `<div class="sub-row">
    <div class="sub-label">${subNames[k] || k}</div>
    <div class="sub-bar"><div class="sub-fill" style="width:${(v/4)*100}%"></div></div>
    <div class="sub-val">${v.toFixed(2)}</div>
  </div>`).join('')}
  <div style="margin-top:1rem;padding-top:.75rem;border-top:1px solid #1e293b">
    <div class="sub-row"><div class="sub-label" style="color:#a78bfa;font-weight:600">Sebe-fungování</div><div class="sub-val" style="color:#a78bfa">${((subscaleScores.identity+subscaleScores.selfDirection)/2).toFixed(2)}</div></div>
    <div class="sub-row"><div class="sub-label" style="color:#f472b6;font-weight:600">Interpersonální</div><div class="sub-val" style="color:#f472b6">${((subscaleScores.empathy+subscaleScores.intimacy)/2).toFixed(2)}</div></div>
  </div>
</div>` : ''}
<div class="disclaimer"><p><strong>⚠ Disclaimer:</strong> Tento report je orientační a nenahrazuje klinické vyšetření. LPFS-SR měří úroveň fungování osobnosti. Pro interpretaci kontaktujte odborníka.</p></div>
<div class="card muted" style="font-size:.75rem;margin-top:1.5rem">
  <p><strong>Zdroj:</strong> Morey (2017) — Self-report Level of Personality Functioning Scale</p>
  <p style="margin-top:.5rem">Generováno: Diagnostický protokol — PID-5 & LPFS-SR</p>
</div></body></html>`;
  downloadHtml(html, `LPFS_report_${new Date().toISOString().slice(0,10)}.html`);
}

function downloadHtml(html, filename) {
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
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
