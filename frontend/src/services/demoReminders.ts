import type { ApiReminder, ReminderInput, SnoozeMinutes } from "@/services/reminderApi";

const STORAGE_KEY = "lifeflow_demo_reminders";
const HISTORY_KEY = "lifeflow_demo_reminder_history";
const FIRED_KEY = "lifeflow_demo_fired_ids";

function load(): ApiReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ApiReminder[]) : [];
  } catch {
    return [];
  }
}

function save(items: ApiReminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveFired(ids: Set<string>) {
  localStorage.setItem(FIRED_KEY, JSON.stringify([...ids]));
}

export function getDemoReminders(): ApiReminder[] {
  return load();
}

export function createDemoReminder(input: ReminderInput): ApiReminder {
  const items = load();
  const reminder: ApiReminder = {
    id: `demo-${Date.now()}`,
    taskId: input.taskId,
    reminderTime: input.reminderTime,
    soundType: input.soundType ?? "chime",
    notificationType: input.notificationType ?? "in_app",
    status: "pending",
    read: false,
    snoozedCount: 0,
  };
  items.push(reminder);
  save(items);
  return reminder;
}

export function updateDemoReminder(
  id: string,
  patch: Partial<ReminderInput & { read?: boolean; status?: ApiReminder["status"] }>,
): ApiReminder | null {
  const items = load();
  const idx = items.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const next = { ...items[idx], ...patch };
  if (patch.reminderTime) next.reminderTime = patch.reminderTime;
  items[idx] = next;
  save(items);
  return next;
}

export function deleteDemoReminder(id: string) {
  save(load().filter((r) => r.id !== id));
}

export function snoozeDemoReminder(id: string, minutes: SnoozeMinutes): ApiReminder | null {
  const until = new Date(Date.now() + minutes * 60_000).toISOString();
  const items = load();
  const idx = items.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  items[idx] = {
    ...items[idx],
    reminderTime: until,
    snoozeUntil: until,
    status: "snoozed",
    snoozedCount: (items[idx].snoozedCount ?? 0) + 1,
    read: false,
  };
  save(items);
  const fired = loadFired();
  fired.delete(id);
  saveFired(fired);
  return items[idx];
}

export function dismissDemoReminder(id: string): ApiReminder | null {
  return updateDemoReminder(id, { status: "dismissed", read: true });
}

export function markDemoRead(id: string): ApiReminder | null {
  return updateDemoReminder(id, { read: true });
}

export function getDemoDueReminders(): ApiReminder[] {
  const fired = loadFired();
  const now = Date.now();
  return load().filter((r) => {
    if (r.status === "dismissed") return false;
    const due = new Date(r.reminderTime).getTime() <= now;
    return due && !fired.has(r.id);
  });
}

export function markDemoTriggered(id: string) {
  const fired = loadFired();
  fired.add(id);
  saveFired(fired);
  updateDemoReminder(id, { status: "triggered", read: false });
  appendDemoHistory(id);
}

function appendDemoHistory(reminderId: string) {
  const r = load().find((x) => x.id === reminderId);
  if (!r) return;
  const hist = loadDemoHistory();
  hist.unshift({
    id: `hist-${Date.now()}`,
    reminderId,
    taskId: typeof r.taskId === "string" ? r.taskId : r.taskId,
    triggeredAt: new Date().toISOString(),
    dismissedAt: null,
    snoozedCount: r.snoozedCount ?? 0,
    soundType: r.soundType,
    notificationType: r.notificationType,
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 50)));
}

export function loadDemoHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function seedDemoRemindersIfEmpty(taskTitles: { id: string; title: string }[]) {
  if (load().length > 0) return;
  const in2Min = new Date(Date.now() + 2 * 60_000).toISOString();
  const task = taskTitles[0];
  if (!task) return;
  createDemoReminder({
    taskId: task.id,
    reminderTime: in2Min,
    soundType: "chime",
    notificationType: "in_app",
  });
}
