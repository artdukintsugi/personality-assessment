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
