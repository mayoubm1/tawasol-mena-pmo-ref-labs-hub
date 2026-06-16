export type Country = 'Egypt' | 'UAE' | 'Saudi Arabia' | 'Global';

export type Sector = 'Procurement' | 'HR' | 'Logistics' | 'Trainings' | 'Compliance';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';

export type ProjectPhase = 
  | 'Phase 1: Site Prep & Legal' 
  | 'Phase 2: Procurement & Logistics' 
  | 'Phase 3: HR & Specialized Trainings' 
  | 'Phase 4: Validation & Live Launch';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskHistoryItem {
  id: string;
  timestamp: string; // ISO date string
  fromStatus: TaskStatus | 'Created';
  toStatus: TaskStatus;
  user: string;
  comment?: string;
}

export interface RACI {
  responsible: string[];
  accountable: string[];
  consulted: string[];
  informed: string[];
}

export interface PMOTask {
  id: string;
  country: Country;
  sector: Sector;
  phase: ProjectPhase;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string[]; // Changed to array for multiple members
  dueDate: string;
  progress: number; // 0 to 100
  checklist: ChecklistItem[];
  kpiMetrics?: string[]; // KPIs tracked by this task
  history?: TaskHistoryItem[];
  raci?: RACI; // Added RACI table
}

export interface Milestone {
  id: string;
  country: Country;
  phase: ProjectPhase;
  title: string;
  description: string;
  targetDate: string;
  status: 'Pending' | 'Achieved' | 'Delayed';
}

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  sector: Sector;
  country: Country;
  trend: 'up' | 'down' | 'stable';
}

export interface SOPArticle {
  id: string;
  code: string;
  title: string;
  sector: Sector;
  countryScope: Country;
  scope: string;
  guidelines: string[];
  bestPractices: string[];
  fullText: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface MeetingTranscriptParagraph {
  speaker: string;
  text: string;
  time: string;
}

export interface PMOMeeting {
  id: string;
  title: string;
  date: string;
  platform: 'Zoom' | 'WeChat' | 'WhatsApp' | 'Discord' | 'Other';
  duration: string;
  recordingUrl?: string;
  reports?: string[]; // simulated attached file outputs
  summary: string;
  keyOutcomes: string[];
  linkedTaskId?: string;
  transcript?: MeetingTranscriptParagraph[];
}

export interface SyncConnectionState {
  connected: boolean;
  syncAccount: string;
  syncStatus: 'Active' | 'Idle' | 'Disconnected' | 'Syncing';
  webhookUrl?: string;
  lastSynced?: string;
  inviteUrl?: string;
  clientId?: string;
}

export type ArchiveCategory = 'Project Setup' | 'Active Member Sessions' | 'Regulatory Certs' | 'Financial Worksheets' | 'AI Briefing Output' | 'Regional Intelligence';

export interface PMOArchiveDocument {
  id: string;
  title: string;
  category: ArchiveCategory;
  author: string;
  timestamp: string; // ISO or human readable timestamp
  size: string;
  checksum: string; // computed or simulated cryptographic verification hash
  description: string;
  source: 'Pre-vetted Setup Baseline' | 'Active Board Upload' | 'System Generated PDF' | 'LIMS Telemetry Stream';
  linkedTo?: string; // e.g. "task-id", "room-id", "sop-id" etc.
  fileContent?: string; // Textual content or attachment preview (e.g. transcript, brief, or JSON stats)
}

export interface PMOActivity {
  id: string;
  userId: string; // email or identifier
  userName: string;
  type: 'LOGIN' | 'TASK_UPDATE' | 'DOCUMENT_UPLOAD' | 'MEETING_INITIATED';
  timestamp: string; // ISO format
  details?: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: string;
  role: string;
  avatar: string;
  text: string;
  timestamp: string;
  attachment?: string;
}

export interface PMOMember {
  name: string;
  email?: string;
  role: string;
  country: Country;
  password?: string;
  avatarUrl?: string;
  phone?: string;
  status?: "online" | "offline";
  lastSeen?: string;
  requiresPasswordChange?: boolean;
}

export interface DiagnosticPriceItem {
  id: string;
  name: string;
  description: string;
  tat: string;
  price: number;
  currency: string;
}

export interface PMOSimulation {
  id: string;
  memberId: string;
  memberName: string;
  documentTitle: string;
  rawContent: string;
  scenarioType: "optimistic" | "conservative" | "pessimistic";
  timestamp: string;
  isShared: boolean;
  metrics: {
    capex: number;
    opex: number;
    paybackMonths: number;
    npv: number;
    bsl3RiskPercent: number;
    timelineMonths: number;
  };
  timeline?: {
    phase: string;
    duration: string;
    status: string;
    description: string;
  }[];
  aiAnalysis: string;
}



