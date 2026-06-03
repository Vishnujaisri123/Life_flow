import type { AiParsedExtras, AiScheduleBlock, AiScheduleData } from "@/types/ai";

function parseScheduleJson(raw: string): AiScheduleData | null {
  try {
    const data = JSON.parse(raw) as { blocks?: AiScheduleBlock[] };
    if (!Array.isArray(data.blocks) || !data.blocks.length) return null;
    const blocks = data.blocks
      .filter((b) => b && typeof b.time === "string" && typeof b.activity === "string")
      .map((b) => ({
        time: b.time,
        activity: b.activity,
        notes: b.notes,
      }));
    return blocks.length ? { blocks } : null;
  } catch {
    return null;
  }
}

function parseMarkdownScheduleTable(text: string): AiScheduleData | null {
  const lines = text.split("\n").filter((l) => l.includes("|"));
  const rows = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && !/^\|[\s\-:|]+\|$/.test(l.replace(/\s/g, "")));

  if (rows.length < 2) return null;

  const blocks: AiScheduleBlock[] = [];
  for (const row of rows) {
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;
    const [time, activity, notes] = cells;
    if (/^time$/i.test(time)) continue;
    blocks.push({ time, activity, notes });
  }
  return blocks.length ? { blocks } : null;
}

export function parseAssistantContent(content: string): AiParsedExtras {
  let body = content;
  const tips: string[] = [];

  const tipMatches = content.matchAll(/^TIP:\s*(.+)$/gim);
  for (const m of tipMatches) {
    tips.push(m[1].trim());
  }
  if (tips.length) {
    body = body.replace(/^TIP:\s*.+$/gim, "").trim();
  }

  let schedule: AiScheduleData | null = null;
  const scheduleFence = content.match(/```schedule\s*([\s\S]*?)```/i);
  if (scheduleFence) {
    schedule = parseScheduleJson(scheduleFence[1].trim());
    body = body.replace(/```schedule\s*[\s\S]*?```/gi, "").trim();
  }

  if (!schedule) {
    schedule = parseMarkdownScheduleTable(content);
  }

  return { tips, schedule, body: body || content };
}
