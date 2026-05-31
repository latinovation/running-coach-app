"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDayDetail } from "@/components/calendar-day-detail";

interface CalendarWorkout {
  id: string;
  date: string;
  day_of_week: string;
  prescribed_workout: string;
  status: "upcoming" | "completed" | "missed" | "modified";
  miles: number | null;
  perceived_effort: number | null;
  log?: string | null;
  avg_hr?: number | null;
  strength_misc?: string | null;
}

interface TrainingCalendarProps {
  workouts: CalendarWorkout[];
  planId: string;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-500",
  upcoming: "bg-sky-500",
  modified: "bg-amber-500",
  missed: "bg-red-500",
};

const STATUS_BG: Record<string, string> = {
  completed: "bg-emerald-500/10 hover:bg-emerald-500/20",
  upcoming: "bg-sky-500/10 hover:bg-sky-500/20",
  modified: "bg-amber-500/10 hover:bg-amber-500/20",
  missed: "bg-red-500/10 hover:bg-red-500/20",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function TrainingCalendar({ workouts, planId }: TrainingCalendarProps) {
  const todayKey = toDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Index workouts by date
  const workoutMap = useMemo(() => {
    const map = new Map<string, CalendarWorkout>();
    for (const w of workouts) {
      map.set(w.date, w);
    }
    return map;
  }, [workouts]);

  // Build the calendar grid for the current month
  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Find the Monday of the week containing the 1st
    const gridStart = getMonday(firstDay);

    const days: Array<{ date: Date; key: string; inMonth: boolean }> = [];
    const current = new Date(gridStart);

    // Fill until we've covered the last day and completed the week
    while (current <= lastDay || current.getDay() !== 1) {
      days.push({
        date: new Date(current),
        key: toDateKey(current),
        inMonth: current.getMonth() === month,
      });
      current.setDate(current.getDate() + 1);
      if (days.length > 42) break; // safety: max 6 weeks
    }

    return days;
  }, [currentMonth]);

  // Compute month stats
  const monthStats = useMemo(() => {
    let totalMiles = 0;
    let completedCount = 0;
    let totalCount = 0;

    for (const day of calendarDays) {
      if (!day.inMonth) continue;
      const w = workoutMap.get(day.key);
      if (w) {
        totalCount++;
        if (w.status === "completed") {
          completedCount++;
          if (w.miles) totalMiles += w.miles;
        }
      }
    }

    return { totalMiles, completedCount, totalCount };
  }, [calendarDays, workoutMap]);

  function prevMonth() {
    setCurrentMonth((prev) => {
      const m = prev.month - 1;
      return m < 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: m };
    });
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      const m = prev.month + 1;
      return m > 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: m };
    });
    setSelectedDate(null);
  }

  const selectedWorkout = selectedDate ? workoutMap.get(selectedDate) ?? null : null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left: Month Grid */}
        <div className="flex-1 p-4 md:p-5">
          {/* Month header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={prevMonth} className="h-7 w-7 p-0">
              <span className="sr-only">Previous month</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </Button>
            <h3 className="text-sm font-semibold tracking-wide">
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </h3>
            <Button variant="ghost" size="sm" onClick={nextMonth} className="h-7 w-7 p-0">
              <span className="sr-only">Next month</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-[2px]">
            {calendarDays.map(({ key, date, inMonth }) => {
              const workout = workoutMap.get(key);
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              const dayNum = date.getDate();

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={[
                    "relative flex flex-col items-center justify-center rounded-md h-10 transition-all text-xs",
                    !inMonth && "opacity-25",
                    inMonth && !workout && "text-muted-foreground hover:bg-zinc-800/50",
                    inMonth && workout && STATUS_BG[workout.status],
                    isSelected && "ring-1 ring-zinc-400",
                    isToday && "ring-2 ring-sky-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="font-mono tabular-nums font-medium">{dayNum}</span>
                  {workout && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${STATUS_COLORS[workout.status]}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Month stats bar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
            <div className="flex gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>
                <span className="font-mono text-xs text-foreground tabular-nums">{monthStats.completedCount}</span>
                /{monthStats.totalCount} done
              </span>
              <span>
                <span className="font-mono text-xs text-foreground tabular-nums">{monthStats.totalMiles.toFixed(1)}</span>
                {" "}mi
              </span>
            </div>
            <div className="flex gap-2">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[9px] text-muted-foreground capitalize">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-zinc-800 p-4 md:p-5">
          <CalendarDayDetail workout={selectedWorkout} planId={planId} />
        </div>
      </div>
    </Card>
  );
}
