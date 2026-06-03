import type { SuggestedPrompt } from "@/types/ai";

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "plan-day",
    label: "Plan my day",
    prompt: "Plan my day based on my current tasks. Prioritize what I should do first.",
    mode: "plan",
  },
  {
    id: "review-tasks",
    label: "Review my tasks",
    prompt: "Review my tasks — what's overdue, what's due today, and what should I tackle next?",
    mode: "review",
  },
  {
    id: "motivate",
    label: "Motivate me",
    prompt: "I'm feeling stuck. Give me a short motivational boost tied to my progress.",
    mode: "motivate",
  },
  {
    id: "weekly-schedule",
    label: "Weekly schedule",
    prompt: "Suggest a balanced weekly schedule with focus blocks and buffer time. Use a timetable table.",
    mode: "schedule",
  },
  {
    id: "focus-tips",
    label: "Focus tips",
    prompt: "Give me 3 actionable productivity tips for my current workload.",
    mode: "general",
  },
  {
    id: "overdue",
    label: "Clear overdue",
    prompt: "Help me triage my overdue tasks and suggest a realistic catch-up plan.",
    mode: "review",
  },
];
