import * as XLSX from "xlsx";

export interface ParsedWeek {
  weekNumber: number;
  dateStart: string;
  dateEnd: string;
  focus: string;
  workouts: ParsedWorkout[];
}

export interface ParsedWorkout {
  date: string;
  dayOfWeek: string;
  prescribedWorkout: string;
  log: string | null;
  avgHr: number | null;
  perceivedEffort: number | null;
  miles: number | null;
  strengthMisc: string | null;
}

export interface ParsedPlan {
  title: string;
  goalRace: string | null;
  goalDate: string | null;
  goalTime: string | null;
  weeks: ParsedWeek[];
}

export function parseTrainingPlanExcel(buffer: ArrayBuffer): ParsedPlan {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  let goalRace: string | null = null;
  let goalDate: string | null = null;
  let goalTime: string | null = null;

  const raceSheet = workbook.Sheets["Race Schedule 2026"];
  if (raceSheet) {
    const raceData = XLSX.utils.sheet_to_json<Record<string, unknown>>(raceSheet, {
      header: 1,
      defval: null,
    }) as unknown[][];

    for (const row of raceData) {
      if (row[3] && typeof row[3] === "string" && row[3] !== "Race") {
        if (row[5]) {
          goalRace = String(row[3]);
          goalTime = String(row[5]);
          if (row[1] instanceof Date) {
            goalDate = row[1].toISOString().split("T")[0];
          }
        }
      }
    }
  }

  let title = "Training Plan";
  const gamePlanSheet = workbook.Sheets["Game Plan"];
  if (gamePlanSheet) {
    const cell = gamePlanSheet["B2"];
    if (cell && cell.v) {
      title = String(cell.v);
    }
  }

  const weeks: ParsedWeek[] = [];
  const weekSheetNames = workbook.SheetNames.filter((name) =>
    /week\s*\d+/i.test(name.trim()),
  );

  for (const sheetName of weekSheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      header: 1,
      defval: null,
      raw: false,
    }) as unknown[][];

    const weekMatch = sheetName.match(/\d+/);
    if (!weekMatch) continue;
    const weekNumber = parseInt(weekMatch[0], 10);

    const focus = data[1]?.[3] ? String(data[1][3]).replace(/^Focus:\s*/i, "") : "";

    const workouts: ParsedWorkout[] = [];
    let firstDate: string | null = null;
    let lastDate: string | null = null;

    for (let i = 3; i <= 9; i++) {
      const row = data[i];
      if (!row || !row[0]) continue;

      const dayOfWeek = String(row[0]);
      let dateStr: string | null = null;

      if (row[1] instanceof Date) {
        dateStr = row[1].toISOString().split("T")[0];
      } else if (typeof row[1] === "string" && row[1]) {
        const parsed = new Date(row[1]);
        if (!isNaN(parsed.getTime())) {
          dateStr = parsed.toISOString().split("T")[0];
        }
      }

      if (!dateStr) continue;

      if (!firstDate) firstDate = dateStr;
      lastDate = dateStr;

      const prescribedWorkout = row[2] ? String(row[2]) : "OFF";
      const log = row[3] ? String(row[3]) : null;
      const avgHr = row[4] ? parseInt(String(row[4]), 10) || null : null;
      const perceivedEffort = row[5] ? parseInt(String(row[5]), 10) || null : null;
      const miles = row[6] ? parseFloat(String(row[6])) || null : null;
      const strengthMisc = row[7] ? String(row[7]) : null;

      workouts.push({
        date: dateStr,
        dayOfWeek,
        prescribedWorkout,
        log,
        avgHr,
        perceivedEffort,
        miles,
        strengthMisc,
      });
    }

    if (firstDate && lastDate && workouts.length > 0) {
      weeks.push({
        weekNumber,
        dateStart: firstDate,
        dateEnd: lastDate,
        focus,
        workouts,
      });
    }
  }

  weeks.sort((a, b) => a.weekNumber - b.weekNumber);

  return {
    title: goalRace ? `Road to ${goalRace}` : title,
    goalRace,
    goalDate,
    goalTime,
    weeks,
  };
}
