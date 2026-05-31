export interface ParsedCalendarEvent {
  date: string;
  phase: string | null;
  location: string | null;
  activities: string | null;
  notes: string | null;
  conflictType: "travel" | "hiking" | "rest" | "none";
}

export interface ParsedCalendarPlan {
  title: string;
  events: ParsedCalendarEvent[];
}

const HIKING_KEYWORDS = ["hike", "trail", "climb", "trek", "summit", "avalanche lake", "hidden falls", "angels landing", "emerald pools"];
const TRAVEL_KEYWORDS = ["drive", "flight", "depart", "arrive", "fly", "drop off", "pick up", "in-flight"];
const REST_KEYWORDS = ["recover", "off", "rest", "retreat", "pool", "spa", "hot springs", "forest bathing"];

function detectConflictType(activities: string): "travel" | "hiking" | "rest" | "none" {
  const lower = activities.toLowerCase();
  if (HIKING_KEYWORDS.some(k => lower.includes(k))) return "hiking";
  if (TRAVEL_KEYWORDS.some(k => lower.includes(k))) return "travel";
  if (REST_KEYWORDS.some(k => lower.includes(k))) return "rest";
  return "none";
}

export function parseCalendarCSV(csvText: string, title: string): ParsedCalendarPlan {
  const lines = csvText.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { title, events: [] };

  // Parse header
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
  const dateIdx = headers.findIndex(h => h === "date");
  const phaseIdx = headers.findIndex(h => h === "phase");
  const locationIdx = headers.findIndex(h => h.includes("location"));
  const activitiesIdx = headers.findIndex(h => h.includes("activities") || h.includes("notes"));
  const bookingIdx = headers.findIndex(h => h.includes("booking") || h.includes("confirmation"));

  if (dateIdx === -1) return { title, events: [] };

  const events: ParsedCalendarEvent[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle CSV fields with commas inside quotes
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { fields.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    fields.push(current.trim());

    const dateStr = fields[dateIdx];
    if (!dateStr) continue;

    // Parse the date
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) continue;
    const isoDate = parsed.toISOString().split("T")[0];

    const activities = activitiesIdx >= 0 ? fields[activitiesIdx] || null : null;
    const location = locationIdx >= 0 ? fields[locationIdx] || null : null;
    const phase = phaseIdx >= 0 ? fields[phaseIdx] || null : null;

    events.push({
      date: isoDate,
      phase,
      location,
      activities,
      notes: bookingIdx >= 0 ? fields[bookingIdx] || null : null,
      conflictType: detectConflictType(activities || location || ""),
    });
  }

  return { title, events };
}
