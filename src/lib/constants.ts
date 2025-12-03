// Enums
export const JOB_TYPES = {
  REMOTE: 'remote',
  HYBRID: 'hybrid',
  ONSITE: 'onsite',
} as const;

export const SENIORITY_LEVELS = {
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
} as const;

export const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  VIEWED: 'viewed',
  REJECTED: 'rejected',
  INTERVIEW: 'interview',
} as const;

export const USER_ROLES = {
  CANDIDATE: 'candidate',
  EMPLOYER: 'employer',
} as const;

// Labels
export const JOB_TYPE_LABELS: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hibrid',
  onsite: 'La birou',
};

export const SENIORITY_LABELS: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  lead: 'Lead/Manager',
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  submitted: 'Trimis',
  viewed: 'Văzut',
  rejected: 'Respins',
  interview: 'Interviu',
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  active: 'Activ',
  paused: 'Pauză',
  closed: 'Închis',
};

// Status Colors
export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  viewed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  interview: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

// Lists
export const LOCATIONS = [
  'Remote',
  'București',
  'Cluj-Napoca',
  'Timișoara',
  'Iași',
  'Brașov',
  'Constanța',
  'Craiova',
  'Ploiești',
  'Sibiu',
  'Oradea',
  'Bacău',
  'Buzău',
];

// Eliminat lista de tehnologii, nu mai este relevantă pentru un job board general
export const TECH_STACK_OPTIONS: string[] = [];

// File Upload Limits
export const MAX_CV_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const COVER_LETTER_MAX_LENGTH = 300;
