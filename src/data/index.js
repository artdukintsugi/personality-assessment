/**
 * Data barrel — single import point for all questionnaire data
 */
export { Q } from './pid5-questions';
export { Q as Q_EN } from './pid5-questions-en';
export { LPFS_Q } from './lpfs-questions';
export { FM, DF, DF_ALL, DC, REVERSE_SCORED } from './pid5-scoring';
export { DIAG_PROFILES } from './diagnostic-profiles';
export { DIAG_DETAILS } from './diagnostic-details';

// ═══ New questionnaires ═══
export { PHQ9_QUESTIONS, PHQ9_SCALE, PHQ9_SEVERITY, PHQ9_FUNCTIONAL, PHQ9_CRITICAL_ITEM } from './phq9';
export { GAD7_QUESTIONS, GAD7_SCALE, GAD7_SEVERITY, GAD7_FUNCTIONAL } from './gad7';
export { DASS42_QUESTIONS, DASS42_SCALE, DASS42_SUBSCALES, DASS42_SEVERITY, DASS21_SUBSET, DASS21_SEVERITY } from './dass42';
export { PCL5_QUESTIONS, PCL5_SCALE, PCL5_CLUSTERS, PCL5_CUTOFF, PCL5_SEVERITY, PCL5_DSM5_CRITERIA } from './pcl5';
export { CATI_QUESTIONS, CATI_SCALE, CATI_SUBSCALES, CATI_SUBSCALE_ITEMS, CATI_REVERSE_ITEMS, CATI_SEVERITY, scoreCATI } from './cati';
export { ISI_QUESTIONS, ISI_SCALE_SIMPLE, ISI_SEVERITY } from './isi';
export { ASRS_QUESTIONS, ASRS_SCALE, ASRS_SEVERITY, ASRS_SUBSCALES } from './asrs';
export { EAT26_QUESTIONS, EAT26_SCALE, EAT26_SEVERITY, EAT26_SUBSCALES, EAT26_CUTOFF, scoreEAT26 } from './eat26';
export { MDQ_PART1, MDQ_PART2, MDQ_PART3, MDQ_PART3_SCALE, MDQ_YESNO, scoreMDQ, MDQ_TOTAL_ITEMS } from './mdq';
export { CUDITR_QUESTIONS, CUDITR_SCALES, CUDITR_SEVERITY, CUDITR_CUTOFF, CUDITR_SCALE_SIMPLE, scoreCUDITR, Q8_SCORE_MAP } from './cuditr';
export { AUDIT_QUESTIONS, AUDIT_SCALES, AUDIT_SEVERITY, AUDIT_CUTOFF, AUDIT_SUBSCALES, scoreAUDIT, scoreAUDITSubscale, Q910_SCORE_MAP } from './audit';
export { DAST10_QUESTIONS, DAST10_SCALE, DAST10_SEVERITY, DAST10_REVERSE_ITEM, DAST10_CUTOFF, scoreDAST10 } from './dast10';
export { ITQ_QUESTIONS, ITQ_SCALE, ITQ_CLUSTERS, ITQ_SEVERITY, ITQ_PTSD_ITEMS, ITQ_DSO_ITEMS, scoreITQ, scoreITQCluster, diagnoseITQ } from './itq';
