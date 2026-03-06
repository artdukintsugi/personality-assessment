/**
 * Cross-Reference Engine
 * 
 * Maps clinical relationships between all 15 questionnaires.
 * Based on established comorbidity patterns and clinical literature.
 * 
 * Each cross-reference defines:
 *  - which tests are involved
 *  - what condition(s) the relationship indicates
 *  - when the cross-reference fires (thresholds)
 *  - clinical explanation (CZ + EN)
 *  - strength: 'strong' | 'moderate' | 'suggestive'
 */

import { DASS42_SUBSCALES } from '../data/dass42';
import { PCL5_CUTOFF } from '../data/pcl5';
import { EAT26_CUTOFF } from '../data/eat26';
import { CUDITR_CUTOFF } from '../data/cuditr';
import { AUDIT_CUTOFF } from '../data/audit';
import { DAST10_CUTOFF } from '../data/dast10';

// ════════════════════════════════════════════════
// Helper: get latest result of a given type from history
// ════════════════════════════════════════════════
export function getLatest(history, type) {
  return history.find(h => h.type === type) || null;
}

export function getLatestScore(history, type) {
  const h = getLatest(history, type);
  if (!h) return null;
  if (h.score !== undefined) return h.score;
  if (h.fullData?.score !== undefined) return h.fullData.score;
  return null;
}

// ════════════════════════════════════════════════
// Cross-reference definitions
// ════════════════════════════════════════════════

/**
 * Generate all applicable cross-references from history.
 * Returns array of { id, tests[], strength, icon, title, description, color }
 */
export function generateCrossReferences(history, lang = 'cs') {
  const refs = [];
  
  const phq9 = getLatestScore(history, 'phq9');
  const gad7 = getLatestScore(history, 'gad7');
  const pcl5 = getLatestScore(history, 'pcl5');
  const isi  = getLatestScore(history, 'isi');
  // ASRS: old data stored partA (0–6), new data stores total (0–18)
  // Normalize: if stored score <= 6, treat as partA and convert to a comparable value
  const asrsRaw = getLatestScore(history, 'asrs');
  const asrsH = getLatest(history, 'asrs');
  const asrs = asrsRaw === null ? null
    : asrsRaw <= 6 ? (asrsRaw >= 4 ? 14 : 0)   // old data: positive screen → 14, negative → 0
    : asrsRaw;                                    // new data: use total directly
  const cuditr = getLatestScore(history, 'cuditr');
  const audit = getLatestScore(history, 'audit');
  const dast10 = getLatestScore(history, 'dast10');
  const itqH = getLatest(history, 'itq');
  const itq = itqH?.score ?? (itqH?.fullData?.score ?? null);
  const itqDx = itqH?.diagnosis ?? itqH?.fullData?.diagnosis ?? null;
  const eat26H = getLatest(history, 'eat26');
  const eat26 = eat26H?.score ?? (eat26H?.fullData?.score ?? null);
  const mdqH = getLatest(history, 'mdq');
  const mdqPositive = mdqH?.positive ?? mdqH?.fullData?.positive ?? null;
  const catiH = getLatest(history, 'cati');
  const cati = catiH?.score ?? (catiH?.fullData?.score ?? null);
  
  // DASS-42 subscales
  const dass42H = getLatest(history, 'dass42');
  let dassD = null, dassA = null, dassS = null;
  if (dass42H?.fullData?.odpovedi) {
    const ans = dass42H.fullData.odpovedi;
    dassD = DASS42_SUBSCALES.depression.reduce((s, i) => s + (ans[i] ?? 0), 0);
    dassA = DASS42_SUBSCALES.anxiety.reduce((s, i) => s + (ans[i] ?? 0), 0);
    dassS = DASS42_SUBSCALES.stress.reduce((s, i) => s + (ans[i] ?? 0), 0);
  }

  // PID-5 elevated diagnostics
  const pid5H = getLatest(history, 'pid5');
  const pid5Diags = pid5H?.topDiags || [];
  const pid5HasBPD = pid5Diags.some(d => d.id === 'bpd');
  const pid5HasNPD = pid5Diags.some(d => d.id === 'npd');
  const pid5HasASPD = pid5Diags.some(d => d.id === 'aspd');
  const pid5HasAvPD = pid5Diags.some(d => d.id === 'avpd');
  const pid5HasOCPD = pid5Diags.some(d => d.id === 'ocpd');
  const pid5HasDep = pid5Diags.some(d => d.id === 'depressive');
  const pid5HasADHD = pid5Diags.some(d => d.id === 'adhd');
  const pid5HasStPD = pid5Diags.some(d => d.id === 'stpd');

  // LPFS
  const lpfsH = getLatest(history, 'lpfs');
  const lpfsScore = lpfsH?.score ?? null;

  // ─── 1. Depression + Anxiety comorbidity ───
  if (phq9 !== null && phq9 >= 10 && gad7 !== null && gad7 >= 10) {
    refs.push({
      id: 'dep_anx_comorbid',
      tests: ['phq9', 'gad7'],
      strength: 'strong',
      icon: '🔗',
      color: '#F59E0B',
      title: {
        cs: 'Komorbidní deprese a úzkost',
        en: 'Comorbid Depression & Anxiety',
      },
      description: {
        cs: `PHQ-9 (${phq9}) a GAD-7 (${gad7}) oba ukazují alespoň středně těžkou úroveň. Koexistence deprese a úzkosti je velmi častá (až 60 % pacientů s depresí má současně GAD) a typicky vede k horšímu průběhu, delší délce epizod a nižší odpovědi na léčbu. Doporučuje se integrovaný přístup cílený na oba symptomové okruhy.`,
        en: `PHQ-9 (${phq9}) and GAD-7 (${gad7}) both show at least moderate levels. Co-occurrence of depression and anxiety is very common (up to 60% of depressed patients also have GAD) and typically leads to worse prognosis, longer episodes, and reduced treatment response. An integrated approach targeting both symptom clusters is recommended.`,
      },
    });
  }

  // ─── 2. Depression + DASS-42 Depression concordance ───
  if (phq9 !== null && phq9 >= 10 && dassD !== null && dassD >= 14) {
    refs.push({
      id: 'dep_dass_concordance',
      tests: ['phq9', 'dass42'],
      strength: 'strong',
      icon: '✓',
      color: '#10B981',
      title: {
        cs: 'Depresivní symptomy potvrzeny dvěma nástroji',
        en: 'Depressive Symptoms Confirmed by Two Instruments',
      },
      description: {
        cs: `PHQ-9 (${phq9}/27) i DASS-42 depresní subškála (${dassD}) shodně ukazují na klinicky významnou depresi. Shoda dvou nezávislých nástrojů zvyšuje spolehlivost nálezu.`,
        en: `PHQ-9 (${phq9}/27) and DASS-42 depression subscale (${dassD}) both indicate clinically significant depression. Agreement between two independent instruments increases finding reliability.`,
      },
    });
  }

  // ─── 3. Anxiety + DASS-42 Anxiety concordance ───
  if (gad7 !== null && gad7 >= 10 && dassA !== null && dassA >= 10) {
    refs.push({
      id: 'anx_dass_concordance',
      tests: ['gad7', 'dass42'],
      strength: 'strong',
      icon: '✓',
      color: '#10B981',
      title: {
        cs: 'Úzkostné symptomy potvrzeny dvěma nástroji',
        en: 'Anxiety Symptoms Confirmed by Two Instruments',
      },
      description: {
        cs: `GAD-7 (${gad7}/21) i DASS-42 úzkostná subškála (${dassA}) shodně indikují klinicky významnou úzkost. Konvergentní validita dvou nástrojů posiluje diagnostický nález.`,
        en: `GAD-7 (${gad7}/21) and DASS-42 anxiety subscale (${dassA}) both indicate clinically significant anxiety. Convergent validity of two instruments strengthens the diagnostic finding.`,
      },
    });
  }

  // ─── 4. PTSD + Depression ───
  if (pcl5 !== null && pcl5 >= PCL5_CUTOFF && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'ptsd_depression',
      tests: ['pcl5', 'phq9'],
      strength: 'strong',
      icon: '⚡',
      color: '#EF4444',
      title: {
        cs: 'PTSD s komorbidní depresí',
        en: 'PTSD with Comorbid Depression',
      },
      description: {
        cs: `PCL-5 (${pcl5}) nad cut-off ${PCL5_CUTOFF} spolu s PHQ-9 (${phq9}) ukazují na možnou PTSD komplikovanou depresí. Až 50 % osob s PTSD trpí současně MDD. Depresivní symptomy u PTSD mohou odrážet sdílený okruh „negativních alterací kognice a nálady“ (cluster D). Doporučen traumatologický přístup.`,
        en: `PCL-5 (${pcl5}) above cut-off ${PCL5_CUTOFF} alongside PHQ-9 (${phq9}) suggest possible PTSD complicated by depression. Up to 50% of PTSD patients also have MDD. Depressive symptoms in PTSD may reflect the shared "negative alterations in cognition and mood" (cluster D). Trauma-focused treatment approach recommended.`,
      },
    });
  }

  // ─── 5. PTSD + Anxiety ───
  if (pcl5 !== null && pcl5 >= PCL5_CUTOFF && gad7 !== null && gad7 >= 10) {
    refs.push({
      id: 'ptsd_anxiety',
      tests: ['pcl5', 'gad7'],
      strength: 'moderate',
      icon: '⚡',
      color: '#F97316',
      title: {
        cs: 'PTSD s komorbidní úzkostí',
        en: 'PTSD with Comorbid Anxiety',
      },
      description: {
        cs: `PCL-5 (${pcl5}) nad cut-off spolu s GAD-7 (${gad7}) naznačují, že hyperarousal symptomy PTSD mohou být doprovázeny generalizovanou úzkostí. Hypervigilance a vyhýbavé chování u PTSD se často překrývají s GAD.`,
        en: `PCL-5 (${pcl5}) above cut-off alongside GAD-7 (${gad7}) suggest PTSD hyperarousal symptoms may be accompanied by generalized anxiety. Hypervigilance and avoidance in PTSD frequently overlap with GAD.`,
      },
    });
  }

  // ─── 6. PTSD + Insomnia ───
  if (pcl5 !== null && pcl5 >= PCL5_CUTOFF && isi !== null && isi >= 15) {
    refs.push({
      id: 'ptsd_insomnia',
      tests: ['pcl5', 'isi'],
      strength: 'strong',
      icon: '🌙',
      color: '#8B5CF6',
      title: {
        cs: 'PTSD s výraznou insomnií',
        en: 'PTSD with Significant Insomnia',
      },
      description: {
        cs: `PCL-5 (${pcl5}) a ISI (${isi}) naznačují PTSD komplikovanou středně těžkou až těžkou nespavostí. Poruchy spánku (noční můry, hyperarousal) jsou centrálním symptomem PTSD a jejich cílená léčba (CBT-I, imagery rehearsal) může zlepšit celkový stav.`,
        en: `PCL-5 (${pcl5}) and ISI (${isi}) suggest PTSD complicated by moderate-to-severe insomnia. Sleep disturbances (nightmares, hyperarousal) are a core PTSD symptom, and targeted treatment (CBT-I, imagery rehearsal) can improve overall outcomes.`,
      },
    });
  }

  // ─── 7. Depression + Insomnia ───
  if (phq9 !== null && phq9 >= 10 && isi !== null && isi >= 15) {
    refs.push({
      id: 'dep_insomnia',
      tests: ['phq9', 'isi'],
      strength: 'moderate',
      icon: '🌙',
      color: '#8B5CF6',
      title: {
        cs: 'Deprese s komorbidní insomnií',
        en: 'Depression with Comorbid Insomnia',
      },
      description: {
        cs: `PHQ-9 (${phq9}) a ISI (${isi}) ukazují na depresi provázenou výraznou nespavostí. Insomnie je jak symptomem, tak rizikovým faktorem deprese. Léčba insomnie (CBT-I) může samo o sobě zlepšit depresivní symptomy.`,
        en: `PHQ-9 (${phq9}) and ISI (${isi}) indicate depression accompanied by significant insomnia. Insomnia is both a symptom and a risk factor for depression. Treating insomnia (CBT-I) alone can improve depressive symptoms.`,
      },
    });
  }

  // ─── 8. ADHD + Depression ───
  if (asrs !== null && asrs >= 14 && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'adhd_depression',
      tests: ['asrs', 'phq9'],
      strength: 'moderate',
      icon: '🔄',
      color: '#F59E0B',
      title: {
        cs: 'ADHD symptomy s komorbidní depresí',
        en: 'ADHD Symptoms with Comorbid Depression',
      },
      description: {
        cs: `ASRS (${asrs}) a PHQ-9 (${phq9}) naznačují souběh ADHD a deprese. Dospělí s ADHD mají 3× vyšší riziko deprese. Některé symptomy se překrývají (koncentrace, únava, problémy s motivací). Diferenciální diagnostika je důležitá — deprese u ADHD může být sekundární reakcí na chronické selhávání.`,
        en: `ASRS (${asrs}) and PHQ-9 (${phq9}) suggest co-occurring ADHD and depression. Adults with ADHD have 3x higher risk of depression. Some symptoms overlap (concentration, fatigue, motivation). Differential diagnosis is important — depression in ADHD may be a secondary reaction to chronic underachievement.`,
      },
    });
  }

  // ─── 9. ADHD + Anxiety ───
  if (asrs !== null && asrs >= 14 && gad7 !== null && gad7 >= 10) {
    refs.push({
      id: 'adhd_anxiety',
      tests: ['asrs', 'gad7'],
      strength: 'moderate',
      icon: '🔄',
      color: '#F59E0B',
      title: {
        cs: 'ADHD symptomy s komorbidní úzkostí',
        en: 'ADHD Symptoms with Comorbid Anxiety',
      },
      description: {
        cs: `ASRS (${asrs}) a GAD-7 (${gad7}) ukazují na souběh ADHD a úzkosti. Úzkostná porucha se vyskytuje u 25–50 % dospělých s ADHD. Vnitřní neklid ADHD může být zaměňován za úzkost a naopak.`,
        en: `ASRS (${asrs}) and GAD-7 (${gad7}) indicate co-occurring ADHD and anxiety. Anxiety disorders occur in 25-50% of adults with ADHD. Internal restlessness in ADHD can be mistaken for anxiety and vice versa.`,
      },
    });
  }

  // ─── 10. Cannabis use + Depression ───
  if (cuditr !== null && cuditr >= CUDITR_CUTOFF && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'cannabis_depression',
      tests: ['cuditr', 'phq9'],
      strength: 'moderate',
      icon: '🍃',
      color: '#84CC16',
      title: {
        cs: 'Rizikové užívání konopí s depresí',
        en: 'Hazardous Cannabis Use with Depression',
      },
      description: {
        cs: `CUDIT-R (${cuditr}) a PHQ-9 (${phq9}) ukazují na rizikové užívání konopí provázené depresivními symptomy. Chronické užívání konopí je spojeno s vyšším rizikem deprese a může snižovat účinnost antidepresivní léčby.`,
        en: `CUDIT-R (${cuditr}) and PHQ-9 (${phq9}) indicate hazardous cannabis use accompanied by depressive symptoms. Chronic cannabis use is associated with higher depression risk and may reduce antidepressant treatment efficacy.`,
      },
    });
  }

  // ─── 11. Cannabis use + Anxiety ───
  if (cuditr !== null && cuditr >= CUDITR_CUTOFF && gad7 !== null && gad7 >= 10) {
    refs.push({
      id: 'cannabis_anxiety',
      tests: ['cuditr', 'gad7'],
      strength: 'moderate',
      icon: '🍃',
      color: '#84CC16',
      title: {
        cs: 'Rizikové užívání konopí s úzkostí',
        en: 'Hazardous Cannabis Use with Anxiety',
      },
      description: {
        cs: `CUDIT-R (${cuditr}) a GAD-7 (${gad7}) naznačují souběh rizikového užívání konopí a úzkosti. Konopí může krátkodobě mírnit úzkost, ale dlouhodobě ji zhoršuje — vzniká cyklus sebemedikace.`,
        en: `CUDIT-R (${cuditr}) and GAD-7 (${gad7}) suggest co-occurring hazardous cannabis use and anxiety. Cannabis may temporarily relieve anxiety but worsens it long-term — creating a self-medication cycle.`,
      },
    });
  }

  // ─── 12. Eating disorders + Depression ───
  if (eat26 !== null && eat26 >= EAT26_CUTOFF && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'eating_depression',
      tests: ['eat26', 'phq9'],
      strength: 'moderate',
      icon: '🍽',
      color: '#EC4899',
      title: {
        cs: 'Porucha příjmu potravy s depresí',
        en: 'Eating Disorder Risk with Depression',
      },
      description: {
        cs: `EAT-26 (${eat26}) a PHQ-9 (${phq9}) ukazují na riziko poruchy příjmu potravy provázené depresí. Deprese se vyskytuje u 50–75 % pacientů s poruchami příjmu potravy a výrazně komplikuje léčbu.`,
        en: `EAT-26 (${eat26}) and PHQ-9 (${phq9}) indicate eating disorder risk accompanied by depression. Depression occurs in 50-75% of eating disorder patients and significantly complicates treatment.`,
      },
    });
  }

  // ─── 13. Bipolar + Depression screening discordance ───
  if (mdqPositive === true && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'bipolar_depression',
      tests: ['mdq', 'phq9'],
      strength: 'strong',
      icon: '⚠️',
      color: '#EF4444',
      title: {
        cs: 'Pozitivní screening bipolarity + deprese — pozor na diagnózu',
        en: 'Positive Bipolar Screen + Depression — Diagnostic Caution',
      },
      description: {
        cs: `MDQ pozitivní screening společně s PHQ-9 (${phq9}) naznačují, že aktuální depresivní epizoda může být součástí bipolární poruchy, nikoli unipolární deprese. To je zásadní rozlišení — antidepresiva bez stabilizátoru nálady mohou u bipolární deprese vyvolat mánii/hypománii. Nezbytné psychiatrické vyšetření.`,
        en: `Positive MDQ screen alongside PHQ-9 (${phq9}) suggests the current depressive episode may be part of bipolar disorder rather than unipolar depression. This distinction is critical — antidepressants without a mood stabilizer can trigger mania/hypomania in bipolar depression. Psychiatric evaluation essential.`,
      },
    });
  }

  // ─── 14. PID-5 BPD + Emotional instability markers ───
  if (pid5HasBPD && phq9 !== null && phq9 >= 10 && gad7 !== null && gad7 >= 8) {
    refs.push({
      id: 'bpd_emotional_instability',
      tests: ['pid5', 'phq9', 'gad7'],
      strength: 'strong',
      icon: '🌊',
      color: '#A855F7',
      title: {
        cs: 'Hraniční osobnostní rysy s emoční nestabilitou',
        en: 'Borderline Personality Traits with Emotional Instability',
      },
      description: {
        cs: `PID-5 ukazuje zvýšený hraniční profil spolu s depresí (PHQ-9: ${phq9}) a úzkostí (GAD-7: ${gad7}). U BPD jsou deprese a úzkost často reaktivní a fluktuující — na rozdíl od stabilní MDD nebo GAD. Důležitá je diferenciální diagnostika: jsou symptomy chronické (BPD) nebo epizodické (MDD/GAD)?`,
        en: `PID-5 shows elevated borderline profile alongside depression (PHQ-9: ${phq9}) and anxiety (GAD-7: ${gad7}). In BPD, depression and anxiety are often reactive and fluctuating — unlike stable MDD or GAD. Key question: are symptoms chronic (BPD) or episodic (MDD/GAD)?`,
      },
    });
  }

  // ─── 15. PID-5 AvPD + Social anxiety ───
  if (pid5HasAvPD && gad7 !== null && gad7 >= 10) {
    refs.push({
      id: 'avpd_social_anxiety',
      tests: ['pid5', 'gad7'],
      strength: 'moderate',
      icon: '🔒',
      color: '#6366F1',
      title: {
        cs: 'Vyhýbavé osobnostní rysy + úzkost',
        en: 'Avoidant Personality Traits + Anxiety',
      },
      description: {
        cs: `PID-5 ukazuje zvýšený vyhýbavý profil spolu s GAD-7 (${gad7}). Vyhýbavá porucha osobnosti a sociální úzkost mají značný překryv. Klíčový rozdíl: AvPD zahrnuje hluboký pocit vlastní nedostatečnosti, zatímco u sociální úzkosti je strach specifičtější.`,
        en: `PID-5 shows elevated avoidant profile alongside GAD-7 (${gad7}). Avoidant PD and social anxiety have significant overlap. Key difference: AvPD involves deep feelings of inadequacy, while social anxiety fear is more specific.`,
      },
    });
  }

  // ─── 16. PID-5 ASPD + Cannabis ───
  if (pid5HasASPD && cuditr !== null && cuditr >= CUDITR_CUTOFF) {
    refs.push({
      id: 'aspd_cannabis',
      tests: ['pid5', 'cuditr'],
      strength: 'moderate',
      icon: '⚡',
      color: '#F97316',
      title: {
        cs: 'Antisociální rysy s užíváním konopí',
        en: 'Antisocial Traits with Cannabis Use',
      },
      description: {
        cs: `PID-5 antisociální profil spolu s CUDIT-R (${cuditr}) ukazují na souběh osobnostní patologie a rizikového užívání konopí. Impulsivita a vyhledávání vzrušení typické pro ASPD zvyšují riziko rozvoje závislosti.`,
        en: `PID-5 antisocial profile alongside CUDIT-R (${cuditr}) indicate co-occurring personality pathology and hazardous cannabis use. Impulsivity and sensation-seeking typical of ASPD increase substance dependence risk.`,
      },
    });
  }

  // ─── 17. PID-5 depressive + PHQ-9 ───
  if (pid5HasDep && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'pid5dep_phq9',
      tests: ['pid5', 'phq9'],
      strength: 'strong',
      icon: '🔗',
      color: '#6366F1',
      title: {
        cs: 'Depresivní osobnostní rysy potvrzeny PHQ-9',
        en: 'Depressive Personality Traits Confirmed by PHQ-9',
      },
      description: {
        cs: `PID-5 ukazuje zvýšené depresivní osobnostní rysy a PHQ-9 (${phq9}) potvrzuje aktuální depresivní symptomy. Otázka pro diferenciální diagnostiku: jedná se o chronický depresivní osobnostní vzorec (dystymie/depresivní PD) nebo akutní depresivní epizodu (MDD)?`,
        en: `PID-5 shows elevated depressive personality traits and PHQ-9 (${phq9}) confirms current depressive symptoms. Question for differential diagnosis: is this a chronic depressive personality pattern (dysthymia/depressive PD) or an acute depressive episode (MDD)?`,
      },
    });
  }

  // ─── 18. PID-5 ADHD markers + ASRS ───
  if (pid5HasADHD && asrs !== null && asrs >= 14) {
    refs.push({
      id: 'pid5adhd_asrs',
      tests: ['pid5', 'asrs'],
      strength: 'strong',
      icon: '✓',
      color: '#0EA5E9',
      title: {
        cs: 'ADHD indikátory potvrzeny PID-5 i ASRS',
        en: 'ADHD Indicators Confirmed by PID-5 and ASRS',
      },
      description: {
        cs: `PID-5 vykazuje zvýšenou disinhibici/impulzivitu typickou pro ADHD a ASRS (${asrs}) potvrzuje screening. Konvergence obou nástrojů silně podporuje další diagnostiku ADHD.`,
        en: `PID-5 shows elevated disinhibition/impulsivity typical for ADHD and ASRS (${asrs}) confirms the screening. Convergence of both instruments strongly supports further ADHD diagnostic assessment.`,
      },
    });
  }

  // ─── 19. LPFS impairment + multiple elevated screenings ───
  const elevatedCount = [
    phq9 !== null && phq9 >= 10,
    gad7 !== null && gad7 >= 10,
    pcl5 !== null && pcl5 >= PCL5_CUTOFF,
    isi !== null && isi >= 15,
    cuditr !== null && cuditr >= CUDITR_CUTOFF,
  ].filter(Boolean).length;
  
  if (lpfsScore !== null && lpfsScore >= 1.5 && elevatedCount >= 2) {
    refs.push({
      id: 'lpfs_multi_comorbid',
      tests: ['lpfs', 'phq9', 'gad7', 'pcl5', 'isi', 'cuditr'].filter(t => getLatest(history, t)),
      strength: 'strong',
      icon: '🏥',
      color: '#DC2626',
      title: {
        cs: 'Narušené fungování osobnosti s mnohočetnou komorbiditou',
        en: 'Impaired Personality Functioning with Multiple Comorbidities',
      },
      description: {
        cs: `LPFS-SR (${lpfsScore?.toFixed(2)}) nad klinickým prahem (≥1.5) spolu s ${elevatedCount} zvýšenými screeningy naznačují hlubší osobnostní patologii, kde klinické symptomy mohou být projevem narušeného fungování osobnosti. Doporučeno komplexní psychiatrické/psychologické vyšetření.`,
        en: `LPFS-SR (${lpfsScore?.toFixed(2)}) above clinical threshold (≥1.5) alongside ${elevatedCount} elevated screenings suggest deeper personality pathology, where clinical symptoms may be manifestations of impaired personality functioning. Comprehensive psychiatric/psychological evaluation recommended.`,
      },
    });
  }

  // ─── 20. Stress trifecta: DASS stress + ISI + GAD-7 ───
  if (dassS !== null && dassS >= 19 && isi !== null && isi >= 15 && gad7 !== null && gad7 >= 8) {
    refs.push({
      id: 'stress_trifecta',
      tests: ['dass42', 'isi', 'gad7'],
      strength: 'moderate',
      icon: '🔥',
      color: '#F97316',
      title: {
        cs: 'Stresová triáda: úzkost – stres – nespavost',
        en: 'Stress Triad: Anxiety – Stress – Insomnia',
      },
      description: {
        cs: `DASS stresová subškála (${dassS}), ISI (${isi}) a GAD-7 (${gad7}) tvoří typickou triádu psychosomatického zatížení. Chronický stres udržuje hyperarousal, který vede k nespavosti, která dále zhoršuje úzkost. Cílem léčby je přerušit tento circulus vitiosus.`,
        en: `DASS stress subscale (${dassS}), ISI (${isi}), and GAD-7 (${gad7}) form a typical psychosomatic burden triad. Chronic stress maintains hyperarousal leading to insomnia, which further worsens anxiety. Treatment goal is to break this vicious cycle.`,
      },
    });
  }

  // ─── 21. CATI autism + ADHD ───
  if (cati !== null && cati >= 130 && asrs !== null && asrs >= 14) {
    refs.push({
      id: 'autism_adhd',
      tests: ['cati', 'asrs'],
      strength: 'strong',
      icon: '🧩',
      color: '#7C3AED',
      title: {
        cs: 'Autistické rysy + ADHD — neurodivergentní profil',
        en: 'Autistic Traits + ADHD — Neurodivergent Profile',
      },
      description: {
        cs: `CATI (${cati}) a ASRS (${asrs}) naznačují souběh autistických rysů a ADHD. Komorbidita ADHD a autismu je častá (30–50 %). Sdílené rysy: exekutivní obtíže, senzorická citlivost, sociální neobratnost. Specializované neuropsychologické vyšetření je doporučeno.`,
        en: `CATI (${cati}) and ASRS (${asrs}) suggest co-occurring autistic traits and ADHD. ADHD-autism comorbidity is common (30-50%). Shared features: executive difficulties, sensory sensitivity, social awkwardness. Specialized neuropsychological assessment recommended.`,
      },
    });
  }

  // ─── 22. Eating disorder + BPD ───
  if (eat26 !== null && eat26 >= EAT26_CUTOFF && pid5HasBPD) {
    refs.push({
      id: 'eating_bpd',
      tests: ['eat26', 'pid5'],
      strength: 'moderate',
      icon: '🌊',
      color: '#EC4899',
      title: {
        cs: 'Poruchy příjmu potravy s hraničními rysy',
        en: 'Eating Disorder Risk with Borderline Traits',
      },
      description: {
        cs: `EAT-26 (${eat26}) a PID-5 hraniční profil naznačují poruchu příjmu potravy v kontextu BPD. Impulzivita a emoční dysregulace BPD se často projevují právě přes jídlo (záchvatovité přejídání, purgativní chování).`,
        en: `EAT-26 (${eat26}) and PID-5 borderline profile suggest eating disorder in the context of BPD. BPD impulsivity and emotional dysregulation often manifest through food (binge eating, purging behaviors).`,
      },
    });
  }

  // ─── 23. Alcohol + Depression ───
  if (audit !== null && audit >= AUDIT_CUTOFF && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'alcohol_depression',
      tests: ['audit', 'phq9'],
      strength: 'strong',
      icon: '🍷',
      color: '#EAB308',
      title: {
        cs: 'Rizikové pití alkoholu s depresí',
        en: 'Hazardous Alcohol Use with Depression',
      },
      description: {
        cs: `AUDIT (${audit}) a PHQ-9 (${phq9}) ukazují na rizikové pití alkoholu provázené depresivními symptomy. Alkohol a deprese se vzájemně posilují — alkohol je depresogenní substance a deprese zvyšuje riziko pití jako „sebemedikace“. Integrovaná léčba obou stavů je doporučena.`,
        en: `AUDIT (${audit}) and PHQ-9 (${phq9}) indicate hazardous alcohol use accompanied by depressive symptoms. Alcohol and depression reinforce each other — alcohol is a depressogenic substance and depression increases risk of self-medicating with alcohol. Integrated treatment of both conditions is recommended.`,
      },
    });
  }

  // ─── 24. Alcohol + Anxiety ───
  if (audit !== null && audit >= AUDIT_CUTOFF && gad7 !== null && gad7 >= 10) {
    refs.push({
      id: 'alcohol_anxiety',
      tests: ['audit', 'gad7'],
      strength: 'moderate',
      icon: '🍷',
      color: '#EAB308',
      title: {
        cs: 'Rizikové pití a úzkostná porucha',
        en: 'Hazardous Alcohol Use with Anxiety',
      },
      description: {
        cs: `AUDIT (${audit}) a GAD-7 (${gad7}) naznačují komorbiditu rizikového pití a úzkosti. Alkohol je často užíván ke zmírnění úzkosti, ale paradoxně úzkost dlouhodobě zhoršuje (rebound efekt, abstinenční stavy).`,
        en: `AUDIT (${audit}) and GAD-7 (${gad7}) suggest co-occurring hazardous drinking and anxiety. Alcohol is often used to self-medicate anxiety, but paradoxically worsens it long-term (rebound effect, withdrawal states).`,
      },
    });
  }

  // ─── 25. Alcohol + Cannabis dual use ───
  if (audit !== null && audit >= AUDIT_CUTOFF && cuditr !== null && cuditr >= CUDITR_CUTOFF) {
    refs.push({
      id: 'alcohol_cannabis',
      tests: ['audit', 'cuditr'],
      strength: 'strong',
      icon: '⚠️',
      color: '#EF4444',
      title: {
        cs: 'Duální užívání: alkohol + konopí',
        en: 'Dual Use: Alcohol + Cannabis',
      },
      description: {
        cs: `AUDIT (${audit}) a CUDIT-R (${cuditr}) ukazují na souběžné rizikové užívání alkoholu i konopí. Polysubstanční užívání výrazně zvyšuje riziko závislosti, kognitivního poškození a komplikací léčby. Nutno zohlednit oba vzorce užívání v terapeutickém plánu.`,
        en: `AUDIT (${audit}) and CUDIT-R (${cuditr}) indicate concurrent hazardous use of both alcohol and cannabis. Polysubstance use significantly increases risk of dependence, cognitive impairment, and treatment complications. Both use patterns must be addressed in the treatment plan.`,
      },
    });
  }

  // ─── 26. Alcohol + PTSD ───
  if (audit !== null && audit >= AUDIT_CUTOFF && pcl5 !== null && pcl5 >= PCL5_CUTOFF) {
    refs.push({
      id: 'alcohol_ptsd',
      tests: ['audit', 'pcl5'],
      strength: 'strong',
      icon: '⚡',
      color: '#EF4444',
      title: {
        cs: 'Rizikové pití v kontextu PTSD',
        en: 'Hazardous Drinking in Context of PTSD',
      },
      description: {
        cs: `AUDIT (${audit}) a PCL-5 (${pcl5}) ukazují na problematické užívání alkoholu v kontextu PTSD. Alkohol je nejčastěji užívaná substance k regulaci traumatických symptomů. Trauma-specifická léčba by měla být primární, doplněná o intervenci adiktologickou.`,
        en: `AUDIT (${audit}) and PCL-5 (${pcl5}) indicate problematic alcohol use in the context of PTSD. Alcohol is the most commonly used substance to manage traumatic symptoms. Trauma-specific treatment should be primary, complemented by addiction intervention.`,
      },
    });
  }

  // ─── 27. Alcohol + Bipolar ───
  if (audit !== null && audit >= AUDIT_CUTOFF && mdqPositive) {
    refs.push({
      id: 'alcohol_bipolar',
      tests: ['audit', 'mdq'],
      strength: 'moderate',
      icon: '🌊',
      color: '#F59E0B',
      title: {
        cs: 'Rizikové pití s pozitivním screeningem bipolární poruchy',
        en: 'Hazardous Drinking with Positive Bipolar Screen',
      },
      description: {
        cs: `AUDIT (${audit}) a pozitivní MDQ naznačují komorbiditu alkoholového problému a možné bipolární poruchy. Alkohol je nejčastěji zneužívanou substancí u bipolární poruchy (až 40 % pacientů). Manické epizody zvyšují impulzivní pití, depresivní epizody sebemedikaci.`,
        en: `AUDIT (${audit}) and positive MDQ suggest co-occurring alcohol problem and possible bipolar disorder. Alcohol is the most commonly abused substance in bipolar disorder (up to 40% of patients). Manic episodes increase impulsive drinking, depressive episodes increase self-medication.`,
      },
    });
  }

  // ─── 28. Alcohol + Insomnia ───
  if (audit !== null && audit >= AUDIT_CUTOFF && isi !== null && isi >= 15) {
    refs.push({
      id: 'alcohol_insomnia',
      tests: ['audit', 'isi'],
      strength: 'suggestive',
      icon: '🌙',
      color: '#6366F1',
      title: {
        cs: 'Alkohol a nespavost',
        en: 'Alcohol and Insomnia',
      },
      description: {
        cs: `AUDIT (${audit}) a ISI (${isi}) naznačují souvislost mezi pitím a nespavostí. Alkohol narušuje architekturu spánku (snižuje REM fázi), paradoxně zhoršuje kvalitu spánku navzdory počátečnímu sedativnímu efektu.`,
        en: `AUDIT (${audit}) and ISI (${isi}) suggest a link between drinking and insomnia. Alcohol disrupts sleep architecture (reduces REM phase), paradoxically worsening sleep quality despite initial sedative effect.`,
      },
    });
  }

  // ─── DAST-10: Drug use + Depression ───
  if (dast10 !== null && dast10 >= DAST10_CUTOFF && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'drug_depression',
      tests: ['dast10', 'phq9'],
      strength: 'strong',
      icon: '💊',
      color: '#EF4444',
      title: {
        cs: 'Užívání drog a deprese',
        en: 'Drug Use and Depression',
      },
      description: {
        cs: `DAST-10 (${dast10}) a PHQ-9 (${phq9}) naznačují současné problémové užívání drog a depresi. Duální diagnóza je velmi častá — až 50 % osob se závislostí trpí komorbidní depresí. Integrovaná léčba obou stavů je klíčová.`,
        en: `DAST-10 (${dast10}) and PHQ-9 (${phq9}) suggest concurrent problematic drug use and depression. Dual diagnosis is very common — up to 50% of individuals with substance use disorders have comorbid depression. Integrated treatment of both conditions is essential.`,
      },
    });
  }

  // ─── DAST-10: Drug use + Alcohol (polysubstance) ───
  if (dast10 !== null && dast10 >= DAST10_CUTOFF && audit !== null && audit >= AUDIT_CUTOFF) {
    refs.push({
      id: 'drug_alcohol_polysubstance',
      tests: ['dast10', 'audit'],
      strength: 'strong',
      icon: '⚠️',
      color: '#DC2626',
      title: {
        cs: 'Polysubstanční užívání (drogy + alkohol)',
        en: 'Polysubstance Use (Drugs + Alcohol)',
      },
      description: {
        cs: `DAST-10 (${dast10}) a AUDIT (${audit}) oba překračují cut-off. Současné užívání více látek výrazně zvyšuje zdravotní rizika, komplikuje léčbu a je spojeno s horší prognózou.`,
        en: `DAST-10 (${dast10}) and AUDIT (${audit}) both exceed cut-offs. Concurrent use of multiple substances significantly increases health risks, complicates treatment, and is associated with worse prognosis.`,
      },
    });
  }

  // ─── DAST-10: Drug use + Cannabis ───
  if (dast10 !== null && dast10 >= DAST10_CUTOFF && cuditr !== null && cuditr >= CUDITR_CUTOFF) {
    refs.push({
      id: 'drug_cannabis',
      tests: ['dast10', 'cuditr'],
      strength: 'moderate',
      icon: '🍃',
      color: '#84CC16',
      title: {
        cs: 'Drogy a konopí',
        en: 'Drug Use and Cannabis',
      },
      description: {
        cs: `DAST-10 (${dast10}) a CUDIT-R (${cuditr}) naznačují problémové užívání jak drog obecně, tak konopí specificky. Konopí může být součástí širšího vzorce polysubstančního užívání.`,
        en: `DAST-10 (${dast10}) and CUDIT-R (${cuditr}) suggest problematic use of both drugs in general and cannabis specifically. Cannabis may be part of a broader polysubstance use pattern.`,
      },
    });
  }

  // ─── DAST-10: Drug use + Insomnia ───
  if (dast10 !== null && dast10 >= DAST10_CUTOFF && isi !== null && isi >= 15) {
    refs.push({
      id: 'drug_insomnia',
      tests: ['dast10', 'isi'],
      strength: 'moderate',
      icon: '🌙',
      color: '#6366F1',
      title: {
        cs: 'Drogy a nespavost',
        en: 'Drug Use and Insomnia',
      },
      description: {
        cs: `DAST-10 (${dast10}) a ISI (${isi}) ukazují na souvislost mezi užíváním drog a poruchami spánku. Mnohé substance (stimulanty, opiáty, abstinenční stavy) přímo narušují spánkovou architekturu.`,
        en: `DAST-10 (${dast10}) and ISI (${isi}) indicate a link between drug use and sleep disturbance. Many substances (stimulants, opioids, withdrawal) directly disrupt sleep architecture.`,
      },
    });
  }

  // ─── ITQ: CPTSD + Depression ───
  if (itqDx === 'cptsd' && phq9 !== null && phq9 >= 10) {
    refs.push({
      id: 'cptsd_depression',
      tests: ['itq', 'phq9'],
      strength: 'strong',
      icon: '⚡',
      color: '#D946EF',
      title: {
        cs: 'Komplexní PTSD a deprese',
        en: 'Complex PTSD and Depression',
      },
      description: {
        cs: `ITQ indikuje CPTSD a PHQ-9 (${phq9}) ukazuje depresi. Deprese je jednou z nejčastějších komorbidních diagnóz u CPTSD. DSO komponenta (negativní sebepojetí, dysregulace afektu) se s depresí značně překrývá.`,
        en: `ITQ indicates CPTSD and PHQ-9 (${phq9}) shows depression. Depression is one of the most common comorbid diagnoses with CPTSD. The DSO component (negative self-concept, affect dysregulation) significantly overlaps with depression.`,
      },
    });
  }

  // ─── ITQ: PTSD concordance with PCL-5 ───
  if ((itqDx === 'ptsd' || itqDx === 'cptsd') && pcl5 !== null && pcl5 >= PCL5_CUTOFF) {
    refs.push({
      id: 'itq_pcl5_concordance',
      tests: ['itq', 'pcl5'],
      strength: 'strong',
      icon: '✓',
      color: '#F43F5E',
      title: {
        cs: 'PTSD potvrzeno dvěma nástroji (ICD-11 + DSM-5)',
        en: 'PTSD Confirmed by Two Instruments (ICD-11 + DSM-5)',
      },
      description: {
        cs: `ITQ (ICD-11: ${itqDx?.toUpperCase()}) a PCL-5 (${pcl5}, DSM-5 cut-off ≥${PCL5_CUTOFF}) oba potvrzují traumatickou symptomatiku. Shoda ICD-11 a DSM-5 nástrojů výrazně zvyšuje diagnostickou jistotu.`,
        en: `ITQ (ICD-11: ${itqDx?.toUpperCase()}) and PCL-5 (${pcl5}, DSM-5 cut-off ≥${PCL5_CUTOFF}) both confirm trauma symptomatology. Agreement between ICD-11 and DSM-5 instruments significantly increases diagnostic confidence.`,
      },
    });
  }

  // ─── ITQ: CPTSD + Substance use ───
  if ((itqDx === 'cptsd') && ((dast10 !== null && dast10 >= DAST10_CUTOFF) || (audit !== null && audit >= AUDIT_CUTOFF))) {
    const subLabel = dast10 >= DAST10_CUTOFF && audit >= AUDIT_CUTOFF ? 'DAST-10 + AUDIT' : dast10 >= DAST10_CUTOFF ? 'DAST-10' : 'AUDIT';
    refs.push({
      id: 'cptsd_substance',
      tests: ['itq', ...(dast10 >= DAST10_CUTOFF ? ['dast10'] : []), ...(audit >= AUDIT_CUTOFF ? ['audit'] : [])],
      strength: 'strong',
      icon: '💊',
      color: '#DC2626',
      title: {
        cs: 'CPTSD a užívání substancí',
        en: 'CPTSD and Substance Use',
      },
      description: {
        cs: `ITQ indikuje CPTSD a ${subLabel} ukazuje rizikové užívání substancí. Substance jsou u osob s komplexním traumatem často používány jako maladaptivní copingová strategie (self-mediating). Léčba by měla adresovat obojí.`,
        en: `ITQ indicates CPTSD and ${subLabel} shows risky substance use. Substances in individuals with complex trauma are often used as a maladaptive coping strategy (self-medicating). Treatment should address both.`,
      },
    });
  }

  // ─── ITQ: CPTSD + BPD personality ───
  if (itqDx === 'cptsd' && pid5HasBPD) {
    refs.push({
      id: 'cptsd_bpd',
      tests: ['itq', 'pid5'],
      strength: 'strong',
      icon: '🧠',
      color: '#A855F7',
      title: {
        cs: 'CPTSD a hraniční osobnostní rysy',
        en: 'CPTSD and Borderline Personality Traits',
      },
      description: {
        cs: 'ITQ indikuje CPTSD a PID-5 ukazuje zvýšené hraniční rysy. Diferenciální diagnostika CPTSD vs. BPD je klíčová — sdílejí emoční dysregulaci a interpersonální potíže, ale liší se v etiologii (trauma vs. vývojová porucha) a léčebném přístupu.',
        en: 'ITQ indicates CPTSD and PID-5 shows elevated borderline traits. Differential diagnosis between CPTSD and BPD is crucial — they share emotional dysregulation and interpersonal difficulties, but differ in etiology (trauma vs. developmental disorder) and treatment approach.',
      },
    });
  }

  // ─── ITQ: CPTSD + Insomnia ───
  if ((itqDx === 'ptsd' || itqDx === 'cptsd') && isi !== null && isi >= 15) {
    refs.push({
      id: 'cptsd_insomnia',
      tests: ['itq', 'isi'],
      strength: 'moderate',
      icon: '🌙',
      color: '#6366F1',
      title: {
        cs: 'Trauma a nespavost',
        en: 'Trauma and Insomnia',
      },
      description: {
        cs: `ITQ (${itqDx?.toUpperCase()}) a ISI (${isi}) ukazují na komorbidní poruchy spánku u traumatické symptomatiky. Nespavost a noční můry jsou jedním z hlavních symptomů PTSD/CPTSD a často přetrvávají i po léčbě traumatu.`,
        en: `ITQ (${itqDx?.toUpperCase()}) and ISI (${isi}) indicate comorbid sleep disturbance with trauma symptomatology. Insomnia and nightmares are core PTSD/CPTSD symptoms and often persist even after trauma treatment.`,
      },
    });
  }

  // Sort by strength
  const order = { strong: 0, moderate: 1, suggestive: 2 };
  refs.sort((a, b) => (order[a.strength] ?? 9) - (order[b.strength] ?? 9));

  return refs;
}

// ════════════════════════════════════════════════
// Clinical domains overview — group results by domain
// ════════════════════════════════════════════════

export const CLINICAL_DOMAINS = [
  {
    id: 'mood',
    icon: '💭',
    color: '#10B981',
    title: { cs: 'Nálada a emoce', en: 'Mood & Emotions' },
    tests: ['phq9', 'gad7', 'dass42'],
    description: { cs: 'Deprese, úzkost, stres', en: 'Depression, anxiety, stress' },
  },
  {
    id: 'trauma',
    icon: '⚡',
    color: '#EF4444',
    title: { cs: 'Trauma a stres', en: 'Trauma & Stress' },
    tests: ['pcl5', 'dass42', 'itq'],
    description: { cs: 'PTSD, CPTSD, stresová zátěž', en: 'PTSD, CPTSD, stress burden' },
  },
  {
    id: 'neurodevelopmental',
    icon: '🧩',
    color: '#7C3AED',
    title: { cs: 'Neurovývojové', en: 'Neurodevelopmental' },
    tests: ['asrs', 'cati'],
    description: { cs: 'ADHD, autistické rysy', en: 'ADHD, autistic traits' },
  },
  {
    id: 'personality',
    icon: '🧠',
    color: '#A855F7',
    title: { cs: 'Osobnost', en: 'Personality' },
    tests: ['pid5', 'lpfs'],
    description: { cs: 'Osobnostní rysy a fungování', en: 'Personality traits & functioning' },
  },
  {
    id: 'behavioral',
    icon: '🔄',
    color: '#F59E0B',
    title: { cs: 'Behaviorální', en: 'Behavioral' },
    tests: ['eat26', 'cuditr', 'audit', 'dast10', 'mdq'],
    description: { cs: 'Příjem potravy, substance, nálady', en: 'Eating, substances, moods' },
  },
  {
    id: 'somatic',
    icon: '🌙',
    color: '#6366F1',
    title: { cs: 'Spánek a somatizace', en: 'Sleep & Somatic' },
    tests: ['isi'],
    description: { cs: 'Nespavost', en: 'Insomnia' },
  },
];

// Test metadata for display
export const TEST_META = {
  pid5:   { name: 'PID-5',    items: 220, color: '#A855F7', category: { cs: 'Osobnostní rysy', en: 'Personality Traits' } },
  lpfs:   { name: 'LPFS-SR',  items: 80,  color: '#3B82F6', category: { cs: 'Fungování osobnosti', en: 'Personality Functioning' } },
  phq9:   { name: 'PHQ-9',    items: 9,   color: '#10B981', category: { cs: 'Deprese', en: 'Depression' } },
  gad7:   { name: 'GAD-7',    items: 7,   color: '#14B8A6', category: { cs: 'Úzkost', en: 'Anxiety' } },
  dass42: { name: 'DASS-42',  items: 42,  color: '#F97316', category: { cs: 'Deprese, úzkost, stres', en: 'Depression, Anxiety, Stress' } },
  pcl5:   { name: 'PCL-5',    items: 20,  color: '#F43F5E', category: { cs: 'PTSD', en: 'PTSD' } },
  cati:   { name: 'CATI',     items: 42,  color: '#8B5CF6', category: { cs: 'Autistické rysy', en: 'Autistic Traits' } },
  isi:    { name: 'ISI',      items: 7,   color: '#6366F1', category: { cs: 'Nespavost', en: 'Insomnia' } },
  asrs:   { name: 'ASRS',     items: 18,  color: '#0EA5E9', category: { cs: 'ADHD', en: 'ADHD' } },
  eat26:  { name: 'EAT-26',   items: 26,  color: '#EC4899', category: { cs: 'Poruchy příjmu potravy', en: 'Eating Disorders' } },
  mdq:    { name: 'MDQ',      items: 15,  color: '#F59E0B', category: { cs: 'Bipolární porucha', en: 'Bipolar Disorder' } },
  cuditr: { name: 'CUDIT-R',  items: 8,   color: '#84CC16', category: { cs: 'Užívání konopí', en: 'Cannabis Use' } },
  audit:  { name: 'AUDIT',    items: 10,  color: '#EAB308', category: { cs: 'Užívání alkoholu', en: 'Alcohol Use' } },
  dast10: { name: 'DAST-10',  items: 10,  color: '#EF4444', category: { cs: 'Užívání drog', en: 'Drug Use' } },
  itq:    { name: 'ITQ',      items: 18,  color: '#D946EF', category: { cs: 'CPTSD (ICD-11)', en: 'CPTSD (ICD-11)' } },
  aq:     { name: 'AQ-50',    items: 50,  color: '#7C3AED', category: { cs: 'Autistické rysy', en: 'Autistic Traits' } },
  aq10:   { name: 'AQ-10',    items: 10,  color: '#9333EA', category: { cs: 'Autistické rysy', en: 'Autistic Traits' } },
};

/**
 * Generate a quick summary status for each completed test
 */
export function getTestStatus(history, lang = 'cs') {
  const statuses = {};
  
  for (const h of history) {
    if (statuses[h.type]) continue; // already got latest
    const meta = TEST_META[h.type];
    if (!meta) continue;
    
    let status = 'ok';     // ok, warning, elevated, critical
    let label = '';

    if (h.type === 'phq9') {
      const s = h.score ?? h.fullData?.score ?? 0;
      if (s >= 20) { status = 'critical'; label = lang === 'cs' ? 'Těžká deprese' : 'Severe'; }
      else if (s >= 15) { status = 'elevated'; label = lang === 'cs' ? 'Středně těžká' : 'Moderately Severe'; }
      else if (s >= 10) { status = 'warning'; label = lang === 'cs' ? 'Středně těžká' : 'Moderate'; }
      else if (s >= 5) { status = 'ok'; label = lang === 'cs' ? 'Mírná' : 'Mild'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Minimální' : 'Minimal'; }
    } else if (h.type === 'gad7') {
      const s = h.score ?? 0;
      if (s >= 15) { status = 'critical'; label = lang === 'cs' ? 'Těžká úzkost' : 'Severe'; }
      else if (s >= 10) { status = 'elevated'; label = lang === 'cs' ? 'Středně těžká' : 'Moderate'; }
      else if (s >= 5) { status = 'warning'; label = lang === 'cs' ? 'Mírná' : 'Mild'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Minimální' : 'Minimal'; }
    } else if (h.type === 'pcl5') {
      const s = h.score ?? 0;
      if (s >= PCL5_CUTOFF) { status = 'critical'; label = lang === 'cs' ? `≥${PCL5_CUTOFF} cut-off` : `≥${PCL5_CUTOFF} cut-off`; }
      else if (s >= 20) { status = 'warning'; label = lang === 'cs' ? 'Subklinické' : 'Subclinical'; }
      else { status = 'ok'; label = lang === 'cs' ? 'V normě' : 'Normal'; }
    } else if (h.type === 'isi') {
      const s = h.score ?? 0;
      if (s >= 22) { status = 'critical'; label = lang === 'cs' ? 'Těžká insomnie' : 'Severe'; }
      else if (s >= 15) { status = 'elevated'; label = lang === 'cs' ? 'Středně těžká' : 'Moderate'; }
      else if (s >= 8) { status = 'warning'; label = lang === 'cs' ? 'Subklinická' : 'Subthreshold'; }
      else { status = 'ok'; label = lang === 'cs' ? 'V normě' : 'Normal'; }
    } else if (h.type === 'asrs') {
      const s = h.score ?? 0;
      // s <= 6 = old data stored as partA (0–6 threshold count); s > 6 = new data stored as total (0–18)
      const isPartA = s <= 6;
      const isPositive = isPartA ? (h.partA ?? s) >= 4 : s >= 14;
      const isStrong   = isPartA ? (h.partA ?? s) >= 6 : s >= 17;
      if (isStrong)    { status = 'critical'; label = lang === 'cs' ? 'Vysoce pravděpodobné ADHD' : 'Highly Likely ADHD'; }
      else if (isPositive) { status = 'elevated'; label = lang === 'cs' ? 'Pravděpodobné ADHD' : 'Likely ADHD'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Nepravděpodobné' : 'Unlikely'; }
    } else if (h.type === 'eat26') {
      const s = h.score ?? 0;
      if (s >= EAT26_CUTOFF) { status = 'critical'; label = lang === 'cs' ? `≥${EAT26_CUTOFF} — riziko` : `≥${EAT26_CUTOFF} — at risk`; }
      else { status = 'ok'; label = lang === 'cs' ? 'V normě' : 'Normal'; }
    } else if (h.type === 'mdq') {
      if (h.positive || h.fullData?.positive) { status = 'critical'; label = lang === 'cs' ? 'Pozitivní screening' : 'Positive Screen'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Negativní' : 'Negative'; }
    } else if (h.type === 'cuditr') {
      const s = h.score ?? 0;
      if (s >= 12) { status = 'critical'; label = lang === 'cs' ? 'Možná porucha' : 'Possible CUD'; }
      else if (s >= CUDITR_CUTOFF) { status = 'elevated'; label = lang === 'cs' ? 'Rizikové užívání' : 'Hazardous'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Nízké riziko' : 'Low Risk'; }
    } else if (h.type === 'audit') {
      const s = h.score ?? 0;
      if (s >= 20) { status = 'critical'; label = lang === 'cs' ? 'Možná závislost' : 'Possible Dependence'; }
      else if (s >= 16) { status = 'elevated'; label = lang === 'cs' ? 'Škodlivé pití' : 'Harmful'; }
      else if (s >= AUDIT_CUTOFF) { status = 'warning'; label = lang === 'cs' ? 'Rizikové pití' : 'Hazardous'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Nízké riziko' : 'Low Risk'; }
    } else if (h.type === 'dast10') {
      const s = h.score ?? 0;
      if (s >= 9) { status = 'critical'; label = lang === 'cs' ? 'Závažné problémy' : 'Severe'; }
      else if (s >= 6) { status = 'elevated'; label = lang === 'cs' ? 'Podstatné problémy' : 'Substantial'; }
      else if (s >= DAST10_CUTOFF) { status = 'warning'; label = lang === 'cs' ? 'Střední problémy' : 'Moderate'; }
      else if (s >= 1) { status = 'ok'; label = lang === 'cs' ? 'Nízké riziko' : 'Low Risk'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Bez problémů' : 'No Problems'; }
    } else if (h.type === 'itq') {
      const dx = h.diagnosis ?? h.fullData?.diagnosis ?? 'none';
      if (dx === 'cptsd') { status = 'critical'; label = lang === 'cs' ? 'Komplexní PTSD' : 'Complex PTSD'; }
      else if (dx === 'ptsd') { status = 'elevated'; label = 'PTSD'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Pod prahem' : 'Below Threshold'; }
    } else if (h.type === 'cati') {
      const s = h.score ?? 0;
      if (s >= 151) { status = 'critical'; label = lang === 'cs' ? 'Vysoké autistické rysy' : 'High Autistic Traits'; }
      else if (s >= 126) { status = 'elevated'; label = lang === 'cs' ? 'Nadprůměrné' : 'Above Average'; }
      else if (s >= 105) { status = 'warning'; label = lang === 'cs' ? 'Průměrné' : 'Average'; }
      else { status = 'ok'; label = lang === 'cs' ? 'V normě' : 'Normal'; }
    } else if (h.type === 'pid5') {
      const diags = h.topDiags || [];
      if (diags.length >= 3) { status = 'critical'; label = `${diags.length} ${lang === 'cs' ? 'zvýš. profilů' : 'elevated profiles'}`; }
      else if (diags.length >= 1) { status = 'elevated'; label = `${diags.length} ${lang === 'cs' ? 'zvýš. profil(y)' : 'elevated profile(s)'}`; }
      else { status = 'ok'; label = lang === 'cs' ? 'V normě' : 'Normal'; }
    } else if (h.type === 'lpfs') {
      const s = h.score ?? 0;
      if (s >= 2.0) { status = 'critical'; label = lang === 'cs' ? 'Výrazné narušení' : 'Significant Impairment'; }
      else if (s >= 1.5) { status = 'elevated'; label = lang === 'cs' ? 'Nad klinickým prahem' : 'Above Clinical Threshold'; }
      else { status = 'ok'; label = lang === 'cs' ? 'V normě' : 'Normal'; }
    } else if (h.type === 'dass42') {
      const s = h.score ?? 0;
      if (s >= 60) { status = 'critical'; label = lang === 'cs' ? 'Těžké zatížení' : 'Severe Burden'; }
      else if (s >= 30) { status = 'elevated'; label = lang === 'cs' ? 'Střední zatížení' : 'Moderate Burden'; }
      else { status = 'ok'; label = lang === 'cs' ? 'Nízké' : 'Low'; }
    } else if (h.type === 'aq') {
      const s = h.score ?? 0;
      if (s >= 32) { status = 'elevated'; label = lang === 'cs' ? 'Zvýšené autistické rysy' : 'Elevated Autistic Traits'; }
      else { status = 'ok'; label = lang === 'cs' ? 'V normě' : 'Normal'; }
    } else if (h.type === 'aq10') {
      const s = h.score ?? 0;
      if (s >= 6) { status = 'elevated'; label = lang === 'cs' ? 'Zvýšené autistické rysy' : 'Elevated Autistic Traits'; }
      else { status = 'ok'; label = lang === 'cs' ? 'V normě' : 'Normal'; }
    }

    statuses[h.type] = { ...meta, score: h.score, date: h.date, status, label };
  }

  return statuses;
}
