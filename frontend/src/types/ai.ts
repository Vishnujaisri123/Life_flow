export type AiMessageRole = "user" | "assistant";

export type AiChatMode = "general" | "motivate" | "schedule" | "review" | "plan";

export type AiMessage = {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: number;
  mode?: AiChatMode;
  actionCards?: AiActionCard[];
  pendingConfirmations?: PendingConfirmation[];
};

export type AiScheduleBlock = {
  time: string;
  activity: string;
  notes?: string;
};

export type AiScheduleData = {
  blocks: AiScheduleBlock[];
};

export type AiParsedExtras = {
  tips: string[];
  schedule: AiScheduleData | null;
  body: string;
};

export type AiTaskContext = {
  todayCount: number;
  todayTitles: string[];
  overdueCount: number;
  overdueTitles: string[];
  upcomingTitles: string[];
  openCount: number;
  highPriority: string[];
};

export type AiChatRequest = {
  messages: Array<{ role: AiMessageRole; content: string }>;
  mode?: AiChatMode;
};

export type AiActionCard = {
  type: string;
  message: string;
  data: any;
};

export type PendingConfirmation = {
  action: string;
  taskId?: string;
  goalId?: string;
  payload?: any;
};

export type AiChatResponse = {
  reply: string;
  model: string;
  provider: string;
  responseTime: number;
  taskContext?: AiTaskContext;
  actionCards?: AiActionCard[];
  pendingConfirmations?: PendingConfirmation[];
};

export type SuggestedPrompt = {
  id: string;
  label: string;
  prompt: string;
  mode?: AiChatMode;
};
